import { isImage, body, fail, refreshSite, str } from "@/lib/api";
import { guard } from "@/lib/auth";
import { mutateOverrides } from "@/lib/store";

type In = { key?: unknown; kind?: unknown; value?: unknown };
const KEY_RE = /^[a-z0-9][a-z0-9._-]{0,80}$/i;

/** Düzenleme modundan gelen tek bir metin ya da görsel değişikliği. */
export async function PUT(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const b = await body<In>(req);
  if (!b || typeof b.key !== "string" || !KEY_RE.test(b.key)) return fail("Geçersiz anahtar.");
  const img = b.kind === "img";
  const storeKey = img ? `img:${b.key}` : b.key;
  const value = str(b.value, img ? 500 : 2000);
  if (img && !isImage(value)) return fail("Görsel yolu geçersiz.");
  await mutateOverrides((o) => { if (value) o[storeKey] = value; else delete o[storeKey]; });
  refreshSite();
  return Response.json({ ok: true });
}

/** Varsayılan metne / görsele geri döner. */
export async function DELETE(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const b = await body<In>(req);
  if (!b || typeof b.key !== "string") return fail("Geçersiz anahtar.");
  await mutateOverrides((o) => { delete o[b.key as string]; });
  refreshSite();
  return Response.json({ ok: true });
}
