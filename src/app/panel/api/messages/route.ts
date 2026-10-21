import { guard } from "@/lib/auth";
import { mutateMessages } from "@/lib/store";

/** Tüm mesajları okundu işaretler. */
export async function PATCH(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  await mutateMessages((m) => { m.forEach((x) => { x.read = true; }); });
  return Response.json({ ok: true });
}
