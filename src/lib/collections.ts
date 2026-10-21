import { IMAGE_RE, slugify, str } from "@/lib/api";
import { serviceGroups } from "@/lib/content";
import { mutateContent, type RawContent, type RawItem } from "@/lib/store";

type Key = "posts" | "services" | "team" | "testimonials";
type Cfg = { key: Key; create: boolean; remove: boolean };

/** Panelden yönetilebilen koleksiyonlar. */
export const collections: Record<string, Cfg> = {
  posts: { key: "posts", create: true, remove: true },
  services: { key: "services", create: true, remove: true },
  team: { key: "team", create: true, remove: true },
  testimonials: { key: "testimonials", create: true, remove: true },
};

type Result = { ok: true; slug: string } | { error: string; status?: number };

const imageOk = (v: unknown) => typeof v === "string" && IMAGE_RE.test(v);
const posOk = (v: unknown) => typeof v === "string" && /^\d{1,3}% \d{1,3}%$/.test(v);

/** Gelen alanları koleksiyona göre doğrular; yalnızca izin verilen alanları döndürür. */
function pick(collection: string, b: Record<string, unknown>): Partial<RawItem> | { error: string } {
  const out: Partial<RawItem> = {};
  if ("title" in b) {
    out.title = str(b.title, 200);
    if (!out.title) return { error: collection === "testimonials" ? "Danışan adı boş olamaz." : "Başlık boş olamaz." };
  }
  if ("text" in b) {
    out.text = str(b.text, 60_000);
    if (!out.text) return { error: "İçerik boş olamaz." };
  }
  if ("image" in b) {
    if (b.image === "" || b.image == null) out.images = [];
    else if (imageOk(b.image)) out.images = [String(b.image)];
    else return { error: "Görsel yolu geçersiz." };
  }
  if (collection === "posts") {
    if ("date" in b) {
      if (typeof b.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) return { error: "Tarih geçersiz." };
      out.date = b.date;
    }
    if ("published" in b) out.published = b.published !== false;
    if ("summary" in b) out.summary = str(b.summary, 400);
  }
  if (collection === "services" && "group" in b) {
    if (!serviceGroups.some((g) => g.id === b.group)) return { error: "Hizmet grubu geçersiz." };
    out.group = String(b.group);
  }
  if (collection === "team") {
    if ("role" in b) out.role = str(b.role, 100);
    if ("position" in b) {
      if (!posOk(b.position)) return { error: "Fotoğraf odak noktası geçersiz." };
      out.position = String(b.position);
    }
    if ("photo" in b) {
      if (!imageOk(b.photo)) return { error: "Fotoğraf yolu geçersiz." };
      out.photo = String(b.photo);
    }
  }
  return out;
}

export async function createItem(collection: string, b: Record<string, unknown>): Promise<Result> {
  const cfg = collections[collection];
  const fields = pick(collection, b);
  if ("error" in fields) return { error: fields.error };
  if (!fields.title) return { error: collection === "testimonials" ? "Danışan adı gerekli." : "Başlık gerekli." };
  if (!fields.text) return { error: "İçerik gerekli." };
  return mutateContent((c: RawContent) => {
    const list = c[cfg.key];
    const base = collection === "testimonials" ? `yorum-${Date.now().toString(36)}` : slugify(fields.title!);
    let slug = base, n = 2;
    while (list.some((x) => x.slug === slug)) slug = `${base}-${n++}`;
    const today = new Date().toISOString().slice(0, 10);
    const item: RawItem = {
      slug, title: fields.title!, text: fields.text!, date: fields.date ?? today, images: fields.images ?? [],
      ...(fields.published === false ? { published: false } : {}),
      ...(fields.summary ? { summary: fields.summary } : {}),
      ...(fields.group ? { group: fields.group } : {}),
      ...(fields.role ? { role: fields.role } : {}),
      ...(fields.photo ? { photo: fields.photo } : {}),
      ...(fields.position ? { position: fields.position } : {}),
    };
    // Yeni kayıt başa eklenir: yorumlar ve yazılar en yeniden eskiye gösterilir.
    list.unshift(item);
    return { ok: true as const, slug };
  });
}

export async function updateItem(collection: string, slug: string, b: Record<string, unknown>): Promise<Result> {
  const cfg = collections[collection];
  const fields = pick(collection, b);
  if ("error" in fields) return { error: fields.error };
  return mutateContent((c) => {
    const item = c[cfg.key].find((x) => x.slug === slug);
    if (!item) return { error: "Kayıt bulunamadı.", status: 404 };
    Object.assign(item, fields);
    if (fields.summary === "") delete item.summary;
    return { ok: true as const, slug };
  });
}

export async function removeItem(collection: string, slug: string): Promise<Result> {
  const cfg = collections[collection];
  return mutateContent((c) => {
    const i = c[cfg.key].findIndex((x) => x.slug === slug);
    if (i < 0) return { error: "Kayıt bulunamadı." };
    c[cfg.key].splice(i, 1);
    return { ok: true as const, slug };
  });
}
