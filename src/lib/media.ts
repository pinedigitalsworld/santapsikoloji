import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/store";

export type MediaFile = { name: string; src: string; source: "upload" | "site"; size: number; mtime: number };

export function listMedia(): MediaFile[] {
  const read = (dir: string, prefix: string, source: MediaFile["source"]) => {
    try {
      return fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f)).map((f) => {
        const st = fs.statSync(path.join(dir, f));
        return { name: f, src: `${prefix}/${f}`, source, size: st.size, mtime: st.mtimeMs };
      });
    } catch { return []; }
  };
  return [...read(UPLOAD_DIR, "/uploads", "upload"), ...read(path.join(process.cwd(), "public", "images"), "/images", "site")]
    .sort((a, b) => (a.source === b.source ? b.mtime - a.mtime : a.source === "upload" ? -1 : 1));
}

