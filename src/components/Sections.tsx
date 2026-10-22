import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Arrow, ButtonLink, Faq, Photo } from "@/components/ui";
import { getFaq, getPosts, getService, getServiceGroups, getTeam, getTestimonials, img, type Post } from "@/lib/content";
import { Ed } from "@/components/Ed";
import { EditChip } from "@/components/EditChip";
import { getSite } from "@/lib/site-server";

export async function ContactBand() {
  const site = await getSite();
  return (
    <section className="container-page" aria-labelledby="iletisim-baslik">
      <div className="grid gap-12 md:grid-cols-[1.25fr_1fr] md:items-end md:gap-24">
        <div>
          <h2 id="iletisim-baslik" className="display text-[clamp(2.25rem,5vw,4rem)]"><Ed k="band.title">Aklınıza takılan bir durum mu var?</Ed></h2>
          <p className="mt-6 max-w-xl text-xl text-ink-soft">
            <Ed k="band.lead">Sorularınız, randevu talepleriniz ve merak ettikleriniz için bize dilediğiniz zaman ulaşabilirsiniz. Güvenle bizimle iletişime geçin.</Ed>
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={site.whatsapp}>WhatsApp ile yazın</ButtonLink>
            <ButtonLink href={site.phoneHref} variant="line">{site.phone}</ButtonLink>
          </div>
        </div>
        <dl className="space-y-6 rounded-3xl bg-linen/70 p-8">
          <div><dt className="text-sm text-ink-soft">Adres</dt><dd className="mt-1">{site.address}</dd></div>
          <div><dt className="text-sm text-ink-soft">Çalışma saatleri</dt><dd className="mt-1">{site.hours.map((h) => <span key={h.days} className="block">{h.days}: {h.time}</span>)}</dd></div>
          <div><dt className="text-sm text-ink-soft">E-posta</dt><dd className="mt-1"><a className="underline underline-offset-4 hover:text-clay" href={`mailto:${site.email}`}>{site.email}</a></dd></div>
        </dl>
      </div>
    </section>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="relative">
      <EditChip href={`/panel/blog/${post.slug}`} />
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="zoom"><Photo src={post.image ?? "/images/pp-1.jpeg"} alt="" sizes="(min-width:768px) 33vw, 100vw" className="aspect-[4/3] rounded-3xl" /></div>
        <p className="mt-5 text-sm text-ink-soft">{new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} · {post.minutes} dk okuma</p>
        <h3 className="serif mt-2 text-xl leading-snug md:text-2xl transition-colors group-hover:text-clay">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-ink-soft">{post.summary}</p>
      </Link>
    </article>
  );
}

export async function LatestPosts({ count = 3 }: { count?: number }) {
  const posts = await getPosts();
  return (
    <section className="container-page mt-28">
      <div className="flex items-end justify-between gap-6">
        <h2 className="display text-[clamp(2rem,4.5vw,3.5rem)]"><Ed k="home.blog.title">Bloglarımızdan en güncel yazılar</Ed></h2>
        <Link href="/blog" className="hidden shrink-0 items-center gap-2 text-clay hover:underline underline-offset-4 sm:inline-flex">Tümü <Arrow /></Link>
      </div>
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {posts.slice(0, count).map((p, i) => <Reveal key={p.slug} delay={i * 90}><PostCard post={p} /></Reveal>)}
      </div>
    </section>
  );
}

export async function AudiencePaths() {
  const groups = await getServiceGroups();
  const labels: Record<string, string> = {
    "cocuk-ergen": "Çocuğum ve ergenim için",
    yetiskin: "Kendim için",
    "cift-aile": "Eşim ve ailem için",
    degerlendirme: "Test ve kurumsal destek",
  };
  return (
    <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {groups.map((g, i) => (
        <Reveal as="li" key={g.id} delay={i * 80}>
          <Link href={`/hizmetlerimiz#${g.id}`} className="group block">
            <div className="zoom"><Photo src={g.items[0].image ?? "/images/pp-1.jpeg"} alt="" sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 90vw" className="aspect-[4/3] rounded-3xl sm:aspect-[4/5]" /></div>
            <h3 className="serif mt-5 text-2xl transition-colors group-hover:text-clay">{labels[g.id] ?? g.title}</h3>
            <p className="mt-2 text-ink-soft">{g.lead}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-clay">Hizmetleri gör <Arrow /></span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

export async function FeaturedServices() {
  const big = await getService("emdr-terapisi");
  const rest = (await Promise.all(["bilissel-davranisci-terapi", "oyun-terapisi", "cift-danismanligi", "moxo-dikkat-testi"].map((s) => getService(s))))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  if (!big) return null;
  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <Link href={`/hizmetlerimiz/${big.slug}`} className="group block">
        <div className="zoom"><Photo src={big.image ?? "/images/pp-1.jpeg"} alt="" sizes="(min-width:1024px) 55vw, 100vw" className="aspect-[4/3] rounded-[2rem]" /></div>
        <h3 className="display mt-6 text-4xl transition-colors group-hover:text-clay md:text-5xl">{big.title}</h3>
        <p className="mt-3 line-clamp-3 max-w-xl text-ink-soft">{big.summary}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-clay">İncele <Arrow /></span>
      </Link>
      <ul className="flex flex-col justify-between gap-4">
        {rest.map((s) => (
          <li key={s.slug}>
            <Link href={`/hizmetlerimiz/${s.slug}`} className="group grid grid-cols-[6.5rem_1fr] items-center gap-5 rounded-3xl bg-linen/70 p-3 pr-6 transition-colors hover:bg-linen sm:grid-cols-[8rem_1fr]">
              <div className="zoom"><Photo src={s.image ?? "/images/pp-1.jpeg"} alt="" sizes="8rem" className="aspect-square rounded-2xl" /></div>
              <div>
                <h3 className="serif text-xl transition-colors group-hover:text-clay md:text-2xl">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-ink-soft">{s.summary}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function ServiceCatalog() {
  const groups = await getServiceGroups();
  return (
    <>
      <nav aria-label="Hizmet grupları" className="pt-8">
        <ul className="container-page flex flex-wrap gap-2">
          {groups.map((g) => (
            <li key={g.id}>
              <a href={`#${g.id}`} className="inline-flex min-h-11 items-center rounded-full bg-ink/5 px-5 transition-colors hover:bg-clay hover:text-paper">{g.title}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="container-page mt-16 space-y-24 sm:mt-20 sm:space-y-32 lg:mt-28 lg:space-y-40">
        {groups.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`h-${g.id}`} className="scroll-mt-header">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-20">
              <h2 id={`h-${g.id}`} className="display text-[clamp(2.5rem,5vw,4.5rem)]">{g.title}</h2>
              <p className="max-w-lg text-xl text-ink-soft lg:justify-self-end">{g.lead}</p>
            </div>
            <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((s, n) => (
                <Reveal as="li" key={s.slug} delay={(n % 3) * 90} className="relative">
                  <EditChip href={`/panel/hizmetler/${s.slug}`} />
                  <Link href={`/hizmetlerimiz/${s.slug}`} className="group block">
                    <div className="zoom"><Photo src={s.image ?? "/images/pp-1.jpeg"} alt="" sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw" className="aspect-[4/3] rounded-3xl" /></div>
                    <h3 className="serif mt-5 text-2xl transition-colors group-hover:text-clay">{s.title}</h3>
                    <p className="mt-2 line-clamp-3 text-ink-soft">{s.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-clay">İncele <Arrow /></span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

/** `eager`: sayfanın ilk ekranındaysa (psikologlar sayfası) ilk fotoğraf yüksek öncelikle yüklenir. */
export async function TeamGrid({ eager = false }: { eager?: boolean }) {
  const team = await getTeam();
  return (
    <ul className="grid max-w-4xl gap-6 sm:grid-cols-2">
      {team.map((m, i) => {
        const intro = m.blocks.find((b) => b.type === "p");
        return (
          <Reveal as="li" key={m.slug} delay={i * 110} className="relative">
            <EditChip href={`/panel/ekip/${m.slug}`} />
            <Link href={`/psikologlarimiz/${m.slug}`} className="group flex h-full flex-col rounded-[2rem] bg-linen/70 p-3 transition-colors hover:bg-linen">
              <div className="zoom"><Photo src={m.image} alt={`${m.name}, ${m.role}`} position={m.position} sizes="(min-width:1024px) 400px, (min-width:640px) 45vw, 100vw" className="aspect-square rounded-3xl" priority={eager && i === 0} /></div>
              <div className="flex flex-1 flex-col px-3 pb-4 pt-5">
                <h3 className="serif text-2xl leading-tight transition-colors group-hover:text-clay">{m.name}</h3>
                <p className="mt-1 text-clay">{m.role}</p>
                {intro?.type === "p" && <p className="mt-3 line-clamp-3 text-ink-soft">{intro.text}</p>}
                <span className="mt-auto inline-flex items-center gap-2 pt-4 text-clay">Profili incele <Arrow /></span>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}

export async function Testimonials({ limit, short }: { limit?: number; short?: boolean }) {
  let list = await getTestimonials();
  if (short) list = list.filter((t) => t.text.length < 420);
  if (limit) list = list.slice(0, limit);
  return (
    <ul className={limit ? "grid gap-6 md:grid-cols-3" : "columns-1 gap-6 md:columns-2 lg:columns-3"}>
      {list.map((t) => (
        <li key={t.slug} className="relative mb-6 break-inside-avoid rounded-3xl bg-linen/70 p-8">
          <EditChip href="/panel/yorumlar" />
          <blockquote>
            <p className="serif text-xl leading-relaxed">“{t.text}”</p>
            <footer className="mt-5 text-sm text-ink-soft">{t.name}</footer>
          </blockquote>
        </li>
      ))}
    </ul>
  );
}

export async function FaqPreview({ count }: { count?: number }) {
  const items = await getFaq();
  return <Faq items={count ? items.slice(0, count) : items} />;
}

export { img };
