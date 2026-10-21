import { createHash } from "node:crypto";

/**
 * Cloudinary (görsel yükleme). Ortam değişkenleri yoksa panel yerel `data/uploads` klasörüne yazar.
 * Yükleme tarayıcıdan doğrudan Cloudinary'ye yapılır (imzalı istek): Vercel'in 4,5 MB istek sınırına takılmaz.
 */
const cloud = () => process.env.CLOUDINARY_CLOUD_NAME ?? "";
const key = () => process.env.CLOUDINARY_API_KEY ?? "";
const secret = () => process.env.CLOUDINARY_API_SECRET ?? "";
export const folder = () => (process.env.CLOUDINARY_FOLDER ?? "santa-psikoloji").replace(/^\/+|\/+$/g, "");
export const cloudinaryConfigured = () => Boolean(cloud() && key() && secret());

export const ALLOWED_FORMATS = "jpg,jpeg,png,webp,avif,gif";

/** İmzalı yükleme parametreleri: imza, istemcinin gönderebileceği alanları sabitler. */
export function signUpload() {
  const params: Record<string, string | number> = { allowed_formats: ALLOWED_FORMATS, folder: folder(), timestamp: Math.round(Date.now() / 1000) };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const signature = createHash("sha1").update(toSign + secret()).digest("hex");
  return { cloudName: cloud(), apiKey: key(), signature, ...params };
}

const auth = () => `Basic ${Buffer.from(`${key()}:${secret()}`).toString("base64")}`;
const api = (p: string) => `https://api.cloudinary.com/v1_1/${cloud()}${p}`;

export type CloudFile = { name: string; src: string; size: number; mtime: number };

export async function listCloudinary(): Promise<CloudFile[]> {
  const out: CloudFile[] = [];
  let cursor = "";
  for (let i = 0; i < 5; i++) {
    const url = api(`/resources/image/upload?prefix=${encodeURIComponent(folder() + "/")}&max_results=100${cursor ? `&next_cursor=${cursor}` : ""}`);
    const res = await fetch(url, { headers: { Authorization: auth() }, cache: "no-store" });
    if (!res.ok) throw new Error("Cloudinary görselleri listelenemedi.");
    const json = await res.json();
    for (const r of json.resources ?? []) {
      out.push({ name: String(r.public_id).split("/").pop() + "." + r.format, src: r.secure_url, size: r.bytes ?? 0, mtime: Date.parse(r.created_at) || 0 });
    }
    if (!json.next_cursor) break;
    cursor = json.next_cursor;
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}

/** `https://res.cloudinary.com/<bulut>/image/upload/v123/<klasör>/ad.jpg` → `<klasör>/ad` */
export function publicIdOf(src: string): string | null {
  const m = /^https:\/\/res\.cloudinary\.com\/([\w-]+)\/image\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?([\w\-./%]+?)(?:\.\w+)?$/.exec(src);
  if (!m || m[1] !== cloud()) return null;
  const id = decodeURIComponent(m[2]);
  return id.startsWith(`${folder()}/`) ? id : null; // yalnızca bu projenin klasörü silinebilir
}

export async function deleteCloudinary(publicId: string) {
  const res = await fetch(api(`/resources/image/upload?public_ids[]=${encodeURIComponent(publicId)}`), { method: "DELETE", headers: { Authorization: auth() } });
  if (!res.ok) throw new Error("Görsel Cloudinary'den silinemedi.");
}
