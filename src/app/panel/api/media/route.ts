import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { body, fail, slugify } from "@/lib/api";
import { guard } from "@/lib/auth";
import { cloudinaryConfigured, deleteCloudinary, publicIdOf } from "@/lib/cloudinary";
import { listMedia } from "@/lib/media";
import { UPLOAD_DIR } from "@/lib/store";

const MAX = 8 * 1024 * 1024;

/** Dosya içeriğine bakarak gerçek bir görsel mi kontrol eder (uzantıya güvenmez). */
function detect(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  if (buf.subarray(0, 4).toString() === "GIF8") return "gif";
  if (buf.subarray(4, 12).toString() === "ftypavif") return "avif";
  return null;
}

export async function GET(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  return Response.json({ files: await listMedia() });
}

/** Yerel yükleme (Cloudinary tanımlı değilken). Cloudinary varsa tarayıcı doğrudan oraya yükler. */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  if (cloudinaryConfigured()) return fail("Görseller Cloudinary'ye yüklenir.", 400);
  let form: FormData;
  try { form = await req.formData(); } catch { return fail("Dosya okunamadı."); }
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return fail("Dosya seçilmedi.");
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const saved: string[] = [];
  for (const f of files.slice(0, 12)) {
    if (f.size > MAX) return fail(`“${f.name}” 8 MB sınırını aşıyor.`);
    const buf = Buffer.from(await f.arrayBuffer());
    const ext = detect(buf);
    if (!ext) return fail(`“${f.name}” desteklenen bir görsel değil (JPG, PNG, WebP, AVIF, GIF).`);
    const base = slugify(f.name.replace(/\.[^.]+$/, "")).slice(0, 40);
    const name = `${base}-${randomBytes(3).toString("hex")}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    saved.push(`/uploads/${name}`);
  }
  return Response.json({ ok: true, saved });
}

/** Yüklenen bir görseli siler (sitenin kendi görselleri silinemez). */
export async function DELETE(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const b = await body<{ src?: string }>(req);
  const src = typeof b?.src === "string" ? b.src : "";
  const local = /^\/uploads\/([\w.\-]+)$/.exec(src);
  if (local) {
    try { fs.unlinkSync(path.join(UPLOAD_DIR, local[1])); } catch { return fail("Dosya bulunamadı.", 404); }
    return Response.json({ ok: true });
  }
  const id = publicIdOf(src);
  if (!id) return fail("Bu görsel silinemez.");
  try { await deleteCloudinary(id); } catch (e) { return fail((e as Error).message, 502); }
  return Response.json({ ok: true });
}
