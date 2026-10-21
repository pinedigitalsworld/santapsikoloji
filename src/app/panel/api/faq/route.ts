import { body, fail, refreshSite, str } from "@/lib/api";
import { guard } from "@/lib/auth";
import { mutateContent } from "@/lib/store";

export async function PUT(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const b = await body<{ items?: { q?: unknown; a?: unknown }[] }>(req);
  if (!Array.isArray(b?.items) || b.items.length > 80) return fail("Geçersiz veri.");
  const items = b.items.map((f) => ({ q: str(f.q, 300), a: str(f.a, 6000) })).filter((f) => f.q && f.a);
  await mutateContent((c) => { c.faq = items; });
  refreshSite();
  return Response.json({ ok: true, count: items.length });
}
