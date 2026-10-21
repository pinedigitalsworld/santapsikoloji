import fs from "node:fs";
import path from "node:path";
import seed from "@/data/content.json";

/**
 * Dosya tabanlı basit depo: veritabanı gerektirmez.
 * Veriler `data/` klasöründe JSON olarak tutulur (DATA_DIR ile değiştirilebilir).
 * Not: kalıcı bir diski olan bir sunucuda çalışmalıdır (VPS, Docker volume vb.).
 */
export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const cache = new Map<string, { mtime: number; value: unknown }>();
let queue: Promise<unknown> = Promise.resolve();

function file(name: string) {
  return path.join(DATA_DIR, name);
}

function readJson<T>(name: string, fallback: () => T): T {
  const p = file(name);
  let mtime = 0;
  try { mtime = fs.statSync(p).mtimeMs; } catch { /* dosya yok */ }
  const hit = cache.get(name);
  if (hit && hit.mtime === mtime) return hit.value as T;
  let value: T;
  if (mtime === 0) {
    value = fallback();
  } else {
    try { value = JSON.parse(fs.readFileSync(p, "utf8")) as T; } catch { value = fallback(); }
  }
  cache.set(name, { mtime, value });
  return value;
}

function writeJson(name: string, value: unknown) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const p = file(name);
  const tmp = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, p); // yarım yazılmış dosya oluşmasın
  cache.delete(name);
}

/** Aynı anda gelen yazma isteklerini sıraya dizer (oku → değiştir → yaz). */
export function mutate<T, R>(name: string, fallback: () => T, fn: (draft: T) => R): Promise<R> {
  const run = queue.then(() => {
    const draft = structuredClone(readJson(name, fallback));
    const result = fn(draft);
    writeJson(name, draft);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

/* ---------- İçerik (hizmetler, ekip, yazılar, yorumlar, SSS) ---------- */

export type RawItem = {
  slug: string; title: string; text: string; date: string; images: string[];
  published?: boolean; summary?: string; group?: string; role?: string; photo?: string; position?: string;
};
export type RawContent = {
  services: RawItem[]; team: RawItem[]; posts: RawItem[]; testimonials: RawItem[];
  pages: Record<string, RawItem>; home: unknown; faq?: { q: string; a: string }[];
};

const seedContent = () => structuredClone(seed) as unknown as RawContent;
export const readContent = () => readJson<RawContent>("content.json", seedContent);
export const mutateContent = <R,>(fn: (draft: RawContent) => R) => mutate("content.json", seedContent, fn);

/* ---------- Metin / görsel düzenlemeleri (düzenleme modu) ---------- */

export const readOverrides = () => readJson<Record<string, string>>("overrides.json", () => ({}));
export const mutateOverrides = <R,>(fn: (draft: Record<string, string>) => R) => mutate("overrides.json", () => ({}), fn);

/* ---------- Site ayarları ---------- */

export type Settings = {
  phone?: string; email?: string; address?: string; instagram?: string;
  hours?: { days: string; time: string }[];
  about?: { support?: string; mission?: string; vision?: string; points?: string[] };
};
export const readSettings = () => readJson<Settings>("settings.json", () => ({}));
export const mutateSettings = <R,>(fn: (draft: Settings) => R) => mutate("settings.json", () => ({}), fn);

/* ---------- İletişim formu mesajları ---------- */

export type Message = { id: string; name: string; phone: string; email: string; message: string; createdAt: string; read: boolean };
export const readMessages = () => readJson<Message[]>("messages.json", () => []);
export const mutateMessages = <R,>(fn: (draft: Message[]) => R) => mutate("messages.json", () => [], fn);
