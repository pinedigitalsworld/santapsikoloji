import { body, fail, refreshSite, str } from "@/lib/api";
import { guard } from "@/lib/auth";
import { mutateSettings } from "@/lib/store";

type In = {
  phone?: unknown; email?: unknown; address?: unknown; instagram?: unknown;
  hours?: { days?: unknown; time?: unknown }[];
  about?: { support?: unknown; mission?: unknown; vision?: unknown; points?: unknown[] };
};

export async function PUT(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const b = await body<In>(req);
  if (!b) return fail("Geçersiz veri.");
  const email = str(b.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("E-posta adresi geçersiz.");
  const instagram = str(b.instagram, 200);
  if (instagram && !/^https:\/\//.test(instagram)) return fail("Instagram adresi https:// ile başlamalı.");
  const phone = str(b.phone, 30);
  if (phone && phone.replace(/\D/g, "").length < 10) return fail("Telefon numarası eksik görünüyor.");
  const hours = (b.hours ?? []).slice(0, 6).map((h) => ({ days: str(h.days, 60), time: str(h.time, 40) })).filter((h) => h.days && h.time);
  const about = b.about ?? {};
  await mutateSettings((s) => {
    s.phone = phone || undefined;
    s.email = email || undefined;
    s.address = str(b.address, 240) || undefined;
    s.instagram = instagram || undefined;
    s.hours = hours.length ? hours : undefined;
    s.about = {
      support: str(about.support, 1200) || undefined,
      mission: str(about.mission, 6000) || undefined,
      vision: str(about.vision, 4000) || undefined,
      points: (about.points ?? []).map((p) => str(p, 300)).filter(Boolean).slice(0, 8),
    };
    if (!s.about.points?.length) delete s.about.points;
  });
  refreshSite();
  return Response.json({ ok: true });
}
