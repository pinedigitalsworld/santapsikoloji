import { body, fail } from "@/lib/api";
import { guard } from "@/lib/auth";
import { mutateMessages } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const b = await body<{ read?: unknown }>(req);
  const found = await mutateMessages((m) => {
    const x = m.find((i) => i.id === id);
    if (x) x.read = b?.read !== false;
    return Boolean(x);
  });
  return found ? Response.json({ ok: true }) : fail("Mesaj bulunamadı.", 404);
}

export async function DELETE(req: Request, ctx: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const found = await mutateMessages((m) => {
    const i = m.findIndex((x) => x.id === id);
    if (i >= 0) m.splice(i, 1);
    return i >= 0;
  });
  return found ? Response.json({ ok: true }) : fail("Mesaj bulunamadı.", 404);
}
