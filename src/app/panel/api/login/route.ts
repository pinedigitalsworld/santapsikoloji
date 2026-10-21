import { NextResponse } from "next/server";
import { HINT_COOKIE, SESSION_COOKIE, SESSION_SECONDS, authConfigured, checkCredentials, clearRate, clientIp, createToken, rateLimit, sameOrigin } from "@/lib/auth";
import { body, fail } from "@/lib/api";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Geçersiz istek kaynağı.", 403);
  if (!authConfigured()) return fail("Panel kurulumu eksik: PANEL_USER, PANEL_PASS ve PANEL_SECRET tanımlanmalı.", 503);
  const key = `login:${clientIp(req)}`;
  if (!rateLimit(key, 8, 15 * 60_000)) return fail("Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.", 429);
  const b = await body<{ username?: string; password?: string }>(req);
  const ok = checkCredentials(String(b?.username ?? "").slice(0, 200), String(b?.password ?? "").slice(0, 200));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 500)); // tahmin hızını düşürür
    return fail("Kullanıcı adı veya şifre hatalı.", 401);
  }
  clearRate(key);
  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, createToken(), { httpOnly: true, sameSite: "strict", secure, path: "/", maxAge: SESSION_SECONDS });
  res.cookies.set(HINT_COOKIE, "1", { httpOnly: false, sameSite: "lax", secure, path: "/", maxAge: SESSION_SECONDS });
  return res;
}
