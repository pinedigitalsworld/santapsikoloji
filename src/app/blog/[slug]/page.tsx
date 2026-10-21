import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditChip } from "@/components/EditChip";
import { JsonLd } from "@/components/JsonLd";
import { ContactBand, PostCard } from "@/components/Sections";
import { Photo, Prose } from "@/components/ui";
import { getPost, getPosts } from "@/lib/content";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// Panelden eklenen yeni sayfalar derlemeden sonra da istek anında oluşturulur.
export const dynamicParams = true;
export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.seoTitle,
    description: p.seoDescription,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", publishedTime: p.date, images: p.image ? [p.image] : undefined },
  };
}

export default async function PostPage({ params }: Props) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const more = getPosts().filter((x) => x.slug !== p.slug).slice(0, 3);
  const date = new Date(p.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, datePublished: p.date, image: p.image ? `${site.url}${p.image}` : undefined, author: { "@type": "Organization", name: site.name }, publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/images/SANTA_LOGO.png` } }, mainEntityOfPage: `${site.url}/blog/${p.slug}` }} />
      <article className="pt-12 md:pt-20">
        <header className="container-page relative">
          <EditChip href={`/panel/blog/${p.slug}`} label="Bu yazıyı düzenle" />
          <h1 className="display rise max-w-4xl text-[clamp(2.25rem,5.5vw,4.25rem)]">{p.title}</h1>
          <p className="mt-5 text-ink-soft"><time dateTime={p.date}>{date}</time> · {p.minutes} dk okuma</p>
          {p.image && <Photo src={p.image} alt="" sizes="100vw" priority className="mt-10 aspect-[16/8] rounded-[2rem]" />}
        </header>
        <Prose blocks={p.blocks} className="container-read mt-12" />
        <p className="container-read mt-12"><Link href="/blog" className="text-clay underline-offset-4 hover:underline">← Tüm yazılar</Link></p>
      </article>
      <section className="container-page mt-28">
        <h2 className="display text-3xl md:text-4xl">Diğer yazılar</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">{more.map((x) => <PostCard key={x.slug} post={x} />)}</div>
      </section>
      <div className="mt-28"><ContactBand /></div>
    </>
  );
}
