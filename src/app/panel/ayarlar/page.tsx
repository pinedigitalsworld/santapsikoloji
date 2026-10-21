import { PageTitle } from "@/components/panel/kit";
import { SettingsForm } from "@/components/panel/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getAbout } from "@/lib/content";
import { getSite } from "@/lib/site-server";

export default async function SettingsAdmin() {
  await requireAdmin();
  const [s, a] = await Promise.all([getSite(), getAbout()]);
  return (
    <>
      <PageTitle title="Ayarlar" lead="İletişim bilgileri, çalışma saatleri ve Hakkımızda metinleri." />
      <SettingsForm initial={{ phone: s.phone, email: s.email, address: s.address, instagram: s.instagram, hours: s.hours.map((h) => ({ ...h })), about: { support: a.support, mission: a.mission, vision: a.vision, points: [...a.points] } }} />
    </>
  );
}
