import { body, fail, refreshSite } from "@/lib/api";
import { guard } from "@/lib/auth";
import { collections, removeItem, updateItem } from "@/lib/collections";

type Ctx = { params: Promise<{ collection: string; slug: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { collection, slug } = await ctx.params;
  if (!collections[collection]) return fail("Bölüm bulunamadı.", 404);
  const b = await body(req);
  if (!b) return fail("Geçersiz veri.");
  const result = await updateItem(collection, slug, b);
  if ("error" in result) return fail(result.error, result.status ?? 400);
  refreshSite();
  return Response.json(result);
}

export async function DELETE(req: Request, ctx: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { collection, slug } = await ctx.params;
  if (!collections[collection]?.remove) return fail("Bu kayıt silinemez.", 405);
  const result = await removeItem(collection, slug);
  if ("error" in result) return fail(result.error, 404);
  refreshSite();
  return Response.json({ ok: true });
}
