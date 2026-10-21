import fs from "node:fs";
import path from "node:path";
import { fail } from "@/lib/api";
import { guard } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/store";

export async function DELETE(req: Request, ctx: { params: Promise<{ name: string }> }) {
  const denied = await guard(req);
  if (denied) return denied;
  const { name } = await ctx.params;
  if (!/^[\w.\-]+$/.test(name)) return fail("Geçersiz dosya adı.");
  try { fs.unlinkSync(path.join(UPLOAD_DIR, name)); } catch { return fail("Dosya bulunamadı.", 404); }
  return Response.json({ ok: true });
}
