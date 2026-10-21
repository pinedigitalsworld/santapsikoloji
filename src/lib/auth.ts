import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { rateClear, rateHit } from "@/lib/store";

export const SESSION_COOKIE = "santa_panel";
/** Yalnızca arayüze "giriş yapılmış olabilir" ipucu verir; yetki vermez. */
export const HINT_COOKIE = "santa_admin";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

const secret = () => process.env.PANEL_SECRET ?? "";
const sha = (s: string) => createHash("sha256").update(s).digest();
const safeEq = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export const authConfigured = () => Boolean(process.env.PANEL_USER && process.env.PANEL_PASS && secret().length >= 16);

export function checkCredentials(user: string, pass: string) {
  if (!authConfigured()) return false;
  // İki karşılaştırma da her zaman yapılır; hangisinin yanlış olduğu belli olmaz.
  const u = safeEq(user, process.env.PANEL_USER!);
  const p = safeEq(pass, process.env.PANEL_PASS!);
  return u && p;
}

export function createToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined) {
  if (!token || !authConfigured()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now(); } catch { return false; }
}

export async function isAdmin() {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Panel sayfalarının başında: oturum yoksa giriş ekranına (/panel) yönlendirir. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/panel");
}

/* ---------- API yardımcıları ---------- */

/** Kaba kuvvet denemelerine karşı sınır. Veritabanı varsa tüm sunucusuz örnekler arasında ortaktır. */
export const rateLimit = rateHit;
export const clearRate = rateClear;

export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

/** Başka bir siteden gelen (CSRF) yazma isteklerini reddeder. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.get("host"); } catch { return false; }
}

/** Panel API'leri için ortak koruma. Geçerli değilse hazır bir Response döner. */
export async function guard(req: Request): Promise<Response | null> {
  if (!sameOrigin(req)) return Response.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  if (!(await isAdmin())) return Response.json({ error: "Oturum gerekli." }, { status: 401 });
  return null;
}
