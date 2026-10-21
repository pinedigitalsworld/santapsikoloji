import { ItemEditor } from "@/components/panel/ItemEditor";
import { requireAdmin } from "@/lib/auth";
import { serviceGroups } from "@/lib/content";

export default async function NewService() {
  await requireAdmin();
  return <ItemEditor collection="services" noun="Hizmet" backHref="/panel/hizmetler" backLabel="Tüm hizmetler" titleLabel="Hizmet adı" groups={serviceGroups.map((g) => ({ id: g.id, title: g.title }))} />;
}
