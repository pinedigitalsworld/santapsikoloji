import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/store";

const types: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", gif: "image/gif" };

/** Panelden yüklenen görselleri sunar (dosya adları rastgele ekli olduğundan önbelleğe alınabilir). */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!/^[\w.\-]+$/.test(name) || !types[ext]) return new Response("Not found", { status: 404 });
  try {
    const buf = fs.readFileSync(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": types[ext], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
