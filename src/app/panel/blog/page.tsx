import Link from "next/link";
import { DeleteItem } from "@/components/panel/Actions";
import { Icon } from "@/components/panel/icons";
import { PageTitle } from "@/components/panel/kit";
import { requireAdmin } from "@/lib/auth";
import { getAllPosts } from "@/lib/content";

const fmt = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const btn = "inline-flex min-h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors";

export default async function BlogList() {
  await requireAdmin();
  const posts = getAllPosts();
  return (
    <>
      <PageTitle title="Blog yazıları" lead="Yazı ekleyin, düzenleyin ya da kaldırın. Taslaklar sitede görünmez.">
        <Link href="/panel/blog/yeni" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-clay px-6 font-medium text-paper transition-colors hover:bg-clay-deep"><Icon n="plus" size={17} />Yeni yazı</Link>
      </PageTitle>

      {posts.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-ink/20 p-14 text-center">
          <p className="serif text-2xl">Henüz yazı yok</p>
          <p className="mt-2 text-ink-soft">İlk yazınızı ekleyerek başlayın.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((p, i) => (
            <li key={p.slug} className="pn-fade grid items-center gap-4 rounded-[1.75rem] border border-ink/10 bg-[#fbfaf8] p-3 pr-5 sm:grid-cols-[7.5rem_1fr_auto]" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <Link href={`/panel/blog/${p.slug}`} className="block aspect-[4/3] overflow-hidden rounded-2xl bg-linen sm:aspect-[5/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image ? <img src={p.image} alt="" className="size-full object-cover" /> : <span className="flex size-full items-center justify-center text-ink-soft"><Icon n="image" size={24} /></span>}
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.published ? "bg-moss/12 text-moss-deep" : "bg-ink/10 text-ink-soft"}`}>{p.published ? "Yayında" : "Taslak"}</span>
                  <span>{fmt(p.date)}</span><span>· {p.minutes} dk okuma</span>
                </div>
                <Link href={`/panel/blog/${p.slug}`} className="serif mt-1 block text-xl leading-snug hover:text-clay md:text-2xl">{p.title}</Link>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                <Link href={`/panel/blog/${p.slug}`} className={`${btn} bg-ink text-paper hover:bg-clay`}><Icon n="pen" size={15} />Düzenle</Link>
                {p.published && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className={`${btn} text-ink-soft hover:bg-ink/5 hover:text-ink`}><Icon n="eye" size={15} />Görüntüle</a>}
                <DeleteItem collection="posts" slug={p.slug} done="Yazı silindi" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
