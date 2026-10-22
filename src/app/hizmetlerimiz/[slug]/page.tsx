import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditChip } from "@/components/EditChip";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { ContactBand } from "@/components/Sections";
import { Arrow, ButtonLink, Photo, Prose } from "@/components/ui";
import { getService, getServiceGroups, getServices, groupOfService, summarize } from "@/lib/content";
import { getSite } from "@/lib/site-server";

type Props = { params: Promise<{ slug: string }> };

// Panelden eklenen yeni sayfalar derlemeden sonra da istek anında oluşturulur.
export const dynamicParams = true;
export const generateStaticParams = async () => (await getServices()).map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getService((await params).slug);
  if (!s) return {};
  return {
    title: `${s.title} Ankara`,
    description: summarize(s.text, 155),
    alternates: { canonical: `/hizmetlerimiz/${s.slug}` },
    openGraph: { images: s.image ? [s.image] : undefined },
  };
}

export default async function ServicePage({ params }: Props) {
  const s = await getService((await params).slug);
  if (!s) notFound();
  const [group, groups, site] = await Promise.all([groupOfService(s.slug), getServiceGroups(), getSite()]);
  const related = (groups.find((g) => g.id === group?.id)?.items ?? []).filter((x) => x.slug !== s.slug).slice(0, 4);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: s.title, provider: { "@type": "Psychologist", name: site.name, url: site.url }, areaServed: "Ankara", description: summarize(s.text, 200) }} />
      <JsonLd data={breadcrumbLd([{ name: "Ana sayfa", path: "/" }, { name: "Hizmetlerimiz", path: "/hizmetlerimiz" }, { name: s.title, path: `/hizmetlerimiz/${s.slug}` }])} />
      <article className="container-page relative pt-12 md:pt-20">
        <EditChip href={`/panel/hizmetler/${s.slug}`} label="Hizmeti düzenle" />
        <nav aria-label="Sayfa yolu" className="text-sm text-ink-soft">
          <Link href="/hizmetlerimiz" className="hover:text-clay hover:underline">Hizmetlerimiz</Link>
          {group && <span> / {group.title}</span>}
        </nav>
        <h1 className="display rise mt-5 max-w-4xl text-[clamp(2.5rem,6vw,4.75rem)]">{s.title}</h1>
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          <div>
            {s.image && <Photo src={s.image} alt={`${s.title}: Santa Psikoloji, Ankara`} sizes="(min-width:1024px) 60vw, 100vw" priority className="aspect-[16/9] rounded-[2rem]" />}
            <Prose blocks={s.blocks} className="mt-10 max-w-2xl" />
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] bg-linen p-8">
              <h2 className="serif text-2xl">Randevu ve bilgi</h2>
              <p className="mt-3 text-ink-soft">Süreç hakkında bilgi almak ve uygun gün ile saati birlikte belirlemek için bize ulaşın.</p>
              <div className="mt-6 flex flex-col gap-3">
                <ButtonLink href={site.whatsapp}>WhatsApp ile yazın</ButtonLink>
                <ButtonLink href={site.phoneHref} variant="line">{site.phone}</ButtonLink>
              </div>
            </div>
            {related.length > 0 && (
              <div className="mt-10">
                <h2 className="serif text-xl">{group?.title} alanındaki diğer hizmetler</h2>
                <ul className="mt-4 space-y-2">
                  {related.map((r) => (
                    <li key={r.slug}><Link href={`/hizmetlerimiz/${r.slug}`} className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-linen/70 px-5 py-2.5 transition-colors hover:bg-clay hover:text-paper"><span>{r.title}</span><Arrow /></Link></li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>
      <div className="mt-28"><ContactBand /></div>
    </>
  );
}
