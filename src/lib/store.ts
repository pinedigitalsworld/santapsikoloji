import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { Pool } from "pg";
import seed from "@/data/content.json";

/**
 * Depo: DATABASE_URL tanımlıysa Postgres (Vercel / canlı), değilse `data/` klasöründeki JSON dosyaları (yerel geliştirme).
 * Her belge (içerik, düzenlemeler, ayarlar, mesajlar) tek bir JSON değeridir; yazma işlemleri sürüm kontrolüyle
 * (iyimser eşzamanlılık) yapılır, böylece sunucusuz ortamda aynı anda gelen istekler birbirinin üstüne yazmaz.
 */
export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const usingDatabase = () => Boolean(process.env.DATABASE_URL);

/* ---------- Postgres ---------- */

const g = globalThis as unknown as { __santaPool?: Pool; __santaReady?: Promise<void> };
const pool = () => (g.__santaPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 10_000 }));

/** Tabloları oluşturur. Derleme sırasında birden çok işlem aynı anda gelebilir; advisory lock ile sıraya girer. */
function ready() {
  g.__santaReady ??= (async () => {
    const c = await pool().connect();
    try {
      await c.query("BEGIN");
      await c.query("SELECT pg_advisory_xact_lock(727001)");
      await c.query("CREATE TABLE IF NOT EXISTS documents (key text PRIMARY KEY, value jsonb NOT NULL, version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now())");
      await c.query("CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, n integer NOT NULL, reset_at bigint NOT NULL)");
      await c.query("COMMIT");
    } catch (e) {
      await c.query("ROLLBACK").catch(() => {});
      g.__santaReady = undefined;
      throw e;
    } finally {
      c.release();
    }
  })();
  return g.__santaReady;
}

async function dbRead<T>(name: string, fallback: () => T): Promise<T> {
  await ready();
  const r = await pool().query("SELECT value FROM documents WHERE key = $1", [name]);
  return r.rows[0] ? (r.rows[0].value as T) : fallback();
}

async function dbMutate<T, R>(name: string, fallback: () => T, fn: (draft: T) => R): Promise<R> {
  await ready();
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = await pool().query("SELECT value, version FROM documents WHERE key = $1", [name]);
    const draft = structuredClone(r.rows[0] ? (r.rows[0].value as T) : fallback());
    const result = fn(draft);
    const done = r.rows[0]
      ? await pool().query("UPDATE documents SET value = $2, version = version + 1, updated_at = now() WHERE key = $1 AND version = $3", [name, JSON.stringify(draft), r.rows[0].version])
      : await pool().query("INSERT INTO documents (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [name, JSON.stringify(draft)]);
    if (done.rowCount) return result;
    // Başka bir istek aynı anda yazdı: güncel değerle yeniden dene.
  }
  throw new Error("Kayıt başka bir işlemle çakıştı, lütfen tekrar deneyin.");
}

/* ---------- Dosya (yerel geliştirme) ---------- */

const cacheFiles = new Map<string, { mtime: number; value: unknown }>();
let queue: Promise<unknown> = Promise.resolve();
const file = (name: string) => path.join(DATA_DIR, `${name}.json`);

function fileRead<T>(name: string, fallback: () => T): T {
  const p = file(name);
  let mtime = 0;
  try { mtime = fs.statSync(p).mtimeMs; } catch { /* dosya yok */ }
  const hit = cacheFiles.get(name);
  if (hit && hit.mtime === mtime) return hit.value as T;
  let value: T;
  if (mtime === 0) value = fallback();
  else { try { value = JSON.parse(fs.readFileSync(p, "utf8")) as T; } catch { value = fallback(); } }
  cacheFiles.set(name, { mtime, value });
  return value;
}

function fileMutate<T, R>(name: string, fallback: () => T, fn: (draft: T) => R): Promise<R> {
  const run = queue.then(() => {
    const draft = structuredClone(fileRead(name, fallback));
    const result = fn(draft);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const p = file(name);
    const tmp = `${p}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(draft, null, 2));
    fs.renameSync(tmp, p); // yarım yazılmış dosya oluşmasın
    cacheFiles.delete(name);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

/* ---------- Ortak arayüz ---------- */

const readDoc = <T,>(name: string, fallback: () => T): Promise<T> => (usingDatabase() ? dbRead(name, fallback) : Promise.resolve(fileRead(name, fallback)));
const mutate = <T, R>(name: string, fallback: () => T, fn: (draft: T) => R): Promise<R> => (usingDatabase() ? dbMutate(name, fallback, fn) : fileMutate(name, fallback, fn));

/* ---------- Hız sınırı (giriş denemeleri, mesaj gönderimi) ---------- */

const memHits = new Map<string, { n: number; reset: number }>();

/** `true`: istek serbest, `false`: sınır aşıldı. Veritabanı varsa sunucusuz örnekler arasında ortaktır. */
export async function rateHit(key: string, max: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  if (usingDatabase()) {
    await ready();
    const r = await pool().query(
      `INSERT INTO rate_limits (key, n, reset_at) VALUES ($1, 1, $2)
       ON CONFLICT (key) DO UPDATE SET
         n = CASE WHEN rate_limits.reset_at < $3 THEN 1 ELSE rate_limits.n + 1 END,
         reset_at = CASE WHEN rate_limits.reset_at < $3 THEN $2 ELSE rate_limits.reset_at END
       RETURNING n`,
      [key, now + windowMs, now],
    );
    return r.rows[0].n <= max;
  }
  const h = memHits.get(key);
  if (!h || h.reset < now) { memHits.set(key, { n: 1, reset: now + windowMs }); return true; }
  h.n += 1;
  return h.n <= max;
}

export async function rateClear(key: string) {
  memHits.delete(key);
  if (usingDatabase()) { await ready(); await pool().query("DELETE FROM rate_limits WHERE key = $1", [key]); }
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
// cache(): aynı istek içinde tek okuma yapılır.
export const readContent = cache(() => readDoc<RawContent>("content", seedContent));
export const mutateContent = <R,>(fn: (draft: RawContent) => R) => mutate("content", seedContent, fn);

/* ---------- Metin / görsel düzenlemeleri (düzenleme modu) ---------- */

export const readOverrides = cache(() => readDoc<Record<string, string>>("overrides", () => ({})));
export const mutateOverrides = <R,>(fn: (draft: Record<string, string>) => R) => mutate("overrides", () => ({}), fn);

/* ---------- Site ayarları ---------- */

export type Settings = {
  phone?: string; email?: string; address?: string; instagram?: string;
  hours?: { days: string; time: string }[];
  about?: { support?: string; mission?: string; vision?: string; points?: string[] };
};
export const readSettings = cache(() => readDoc<Settings>("settings", () => ({})));
export const mutateSettings = <R,>(fn: (draft: Settings) => R) => mutate("settings", () => ({}), fn);

/* ---------- İletişim formu mesajları ---------- */

export type Message = { id: string; name: string; phone: string; email: string; message: string; createdAt: string; read: boolean };
export const readMessages = cache(() => readDoc<Message[]>("messages", () => []));
export const mutateMessages = <R,>(fn: (draft: Message[]) => R) => mutate("messages", () => [], fn);
