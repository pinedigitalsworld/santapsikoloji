import { body, fail, refreshSite } from "@/lib/api";
import { guard } from "@/lib/auth";
import { collections, createItem } from "@/lib/collections";

export async function POST(req: Request, ctx: { params: Promise<{ collection: string }> }) {
  const denied = await guard(req);
  if (denied) return denied;
  const { collection } = await ctx.params;
  const cfg = collections[collection];
  if (!cfg?.create) return fail("Bu bölüme yeni kayıt eklenemez.", 405);
  const b = await body(req);
  if (!b) return fail("Geçersiz veri.");
  const result = await createItem(collection, b);
  if ("error" in result) return fail(result.error);
  refreshSite();
  return Response.json(result);
}
