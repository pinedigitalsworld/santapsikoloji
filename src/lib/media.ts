import fs from "node:fs";
import path from "node:path";
import { cloudinaryConfigured, listCloudinary } from "@/lib/cloudinary";
import { UPLOAD_DIR } from "@/lib/store";

export type MediaFile = { name: string; src: string; source: "upload" | "site"; size: number; mtime: number };

const readDir = (dir: string, prefix: string, source: MediaFile["source"]): MediaFile[] => {
  try {
    return fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f)).map((f) => {
      const st = fs.statSync(path.join(dir, f));
      return { name: f, src: `${prefix}/${f}`, source, size: st.size, mtime: st.mtimeMs };
    });
  } catch { return []; }
};

/** Yüklenenler (Cloudinary ya da yerel klasör) + sitenin ilk kurulumundan gelen görseller. */
export async function listMedia(): Promise<MediaFile[]> {
  let uploads: MediaFile[];
  if (cloudinaryConfigured()) {
    try { uploads = (await listCloudinary()).map((f) => ({ ...f, source: "upload" as const })); } catch { uploads = []; }
  } else {
    uploads = readDir(UPLOAD_DIR, "/uploads", "upload").sort((a, b) => b.mtime - a.mtime);
  }
  return [...uploads, ...readDir(path.join(process.cwd(), "public", "images"), "/images", "site")];
}
