import { notFound } from "next/navigation";
import { ItemEditor } from "@/components/panel/ItemEditor";
import { requireAdmin } from "@/lib/auth";
import { getMember } from "@/lib/content";
import { readContent } from "@/lib/store";

export default async function EditMember({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const slug = (await params).slug;
  const raw = readContent().team.find((x) => x.slug === slug);
  const m = getMember(slug);
  if (!raw || !m) notFound();
  return <ItemEditor collection="team" noun="Psikolog" backHref="/panel/ekip" backLabel="Psikologlar" titleLabel="Ad soyad (unvanla birlikte)" item={{ slug, title: raw.title.trim(), text: raw.text, image: m.image, role: m.role, position: m.position }} />;
}
