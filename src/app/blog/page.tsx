import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Arrow, Photo } from "@/components/ui";
import { ContactBand, PostCard } from "@/components/Sections";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Psikoloji Blogu: Çift ve Aile İlişkileri",
  description: "Çift ilişkileri, aile, cinsellik ve psikolojik iyi oluş üzerine uzman psikologlarımızın yazıları. Santa Psikoloji blogu.",
  alternates: { canonical: "/blog" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

export default async function Blog() {
  const [featured, ...rest] = await getPosts();
  return (
    <>
      <PageHeader title="Blog" lead="Çift ilişkileri, aile ve cinsellik üzerine uzmanlarımızın yazıları." edKey="page.blog" />
      <section className="container-page" aria-label="Öne çıkan yazı">
        <Link href={`/blog/${featured.slug}`} className="group grid gap-8 rounded-[2rem] bg-linen/70 p-3 transition-colors hover:bg-linen md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12 md:pr-12">
          <div className="zoom"><Photo src={featured.image ?? "/images/pp-1.jpeg"} alt="" sizes="(min-width:768px) 55vw, 100vw" priority className="aspect-[4/3] rounded-[1.5rem]" /></div>
          <div className="px-3 pb-6 md:p-0">
            <p className="text-sm text-clay">Son yazı · {fmt(featured.date)} · {featured.minutes} dk okuma</p>
            <h2 className="display mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] transition-colors group-hover:text-clay">{featured.title}</h2>
            <p className="mt-4 line-clamp-4 text-ink-soft">{featured.summary}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-clay">Yazıyı oku <Arrow /></span>
          </div>
        </Link>
      </section>
      {rest.length > 0 && (
        <section className="container-page mt-20" aria-labelledby="tum-yazilar">
          <h2 id="tum-yazilar" className="display text-[clamp(1.75rem,3.5vw,2.75rem)]">Tüm yazılar</h2>
          <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}
      <div className="mt-28"><ContactBand /></div>
    </>
  );
}
