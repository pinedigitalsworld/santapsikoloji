import { notFound } from "next/navigation";
import { ItemEditor } from "@/components/panel/ItemEditor";
import { requireAdmin } from "@/lib/auth";
import { groupOfService, serviceGroups } from "@/lib/content";
import { readContent } from "@/lib/store";

export default async function EditService({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const s = (await readContent()).services.find((x) => x.slug === slug);
  if (!s) notFound();
  return (
    <ItemEditor
      collection="services" noun="Hizmet" backHref="/panel/hizmetler" backLabel="Tüm hizmetler" titleLabel="Hizmet adı"
      groups={serviceGroups.map((g) => ({ id: g.id, title: g.title }))}
      item={{ slug: s.slug, title: s.title.trim(), text: s.text, image: s.images[0] ?? "", group: (await groupOfService(slug))?.id ?? serviceGroups[0].id }}
    />
  );
}
