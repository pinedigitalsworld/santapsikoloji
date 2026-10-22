import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditChip } from "@/components/EditChip";
import { JsonLd } from "@/components/JsonLd";
import { absUrl, breadcrumbLd } from "@/lib/seo";
import { ContactBand } from "@/components/Sections";
import { ButtonLink, Photo, Prose } from "@/components/ui";
import { getMember, getTeam, summarize, type Block } from "@/lib/content";
import { site } from "@/lib/site";
import { getSite } from "@/lib/site-server";

type Props = { params: Promise<{ slug: string }> };

// Panelden eklenen yeni sayfalar derlemeden sonra da istek anında oluşturulur.
export const dynamicParams = true;
export const generateStaticParams = async () => (await getTeam()).map((m) => ({ slug: m.slug }));

const firstText = (blocks: Block[]) => {
  const p = blocks.find((b) => b.type === "p");
  return p && p.type === "p" ? summarize(p.text, 155) : "";
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await getMember((await params).slug);
  if (!m) return {};
  return {
    title: `${m.name}, ${m.role.split(" · ")[0]}`,
    description: firstText(m.blocks) || `${m.name}, Santa Psikoloji ${m.role}.`,
    alternates: { canonical: `/psikologlarimiz/${m.slug}` },
    openGraph: { images: [m.image] },
  };
}

export default async function MemberPage({ params }: Props) {
  const m = await getMember((await params).slug);
  if (!m) notFound();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Person", name: m.name, jobTitle: m.role, image: absUrl(m.image), worksFor: { "@type": "Organization", name: site.name, url: site.url } }} />
      <JsonLd data={breadcrumbLd([{ name: "Ana sayfa", path: "/" }, { name: "Psikologlarımız", path: "/psikologlarimiz" }, { name: m.name, path: `/psikologlarimiz/${m.slug}` }])} />
      <article className="container-page grid gap-12 pt-12 md:grid-cols-[1fr_1.7fr] md:gap-20 md:pt-20">
        <div className="md:sticky md:top-28 md:self-start">
          <Photo src={m.image} alt={`${m.name}, ${m.role}`} position={m.position} priority sizes="(min-width:768px) 35vw, 90vw" className="mx-auto aspect-[4/5] max-w-sm rounded-3xl md:max-w-none" />
        </div>
        <div className="relative">
          <EditChip href={`/panel/ekip/${m.slug}`} label="Profili düzenle" />
          <Link href="/psikologlarimiz" className="text-sm text-ink-soft hover:text-clay hover:underline">← Psikologlarımız</Link>
          <h1 className="display rise mt-4 text-[clamp(2.5rem,6vw,4.5rem)]">{m.name}</h1>
          <p className="serif mt-2 text-xl text-clay">{m.role}</p>
          <Prose blocks={m.blocks} className="mt-8 max-w-2xl" />
          <div className="mt-10"><ButtonLink href={(await getSite()).whatsapp}>{m.name.split(" ")[0]} ile randevu alın</ButtonLink></div>
        </div>
      </article>
      <div className="mt-28"><ContactBand /></div>
    </>
  );
}
