import { revalidatePath } from "next/cache";

export const fail = (error: string, status = 400) => Response.json({ error }, { status });

/** İçerik değişince tüm sayfaların bir sonraki ziyarette yeniden oluşturulmasını sağlar. */
export const refreshSite = () => revalidatePath("/", "layout");

export async function body<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try { return (await req.json()) as T; } catch { return null; }
}

const tr: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
export function slugify(s: string) {
  return s.toLocaleLowerCase("tr").replace(/[çğıöşüâîû]/g, (c) => tr[c]).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "yazi";
}

export const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

/** Kütüphanedeki bir görselin yolu: /uploads/x.jpg, /images/x.jpg ya da düz dosya adı. */
export const IMAGE_RE = /^(\/(uploads|images)\/)?[\w.\-]+\.(jpe?g|png|webp|avif|gif)$/i;
const CLOUD_RE = /^https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\/[\w\-./%,]+$/;
/** Geçerli görsel yolu: yerel dosya ya da Cloudinary adresi. */
export const isImage = (v: string) => v.length <= 500 && (IMAGE_RE.test(v) || CLOUD_RE.test(v));
