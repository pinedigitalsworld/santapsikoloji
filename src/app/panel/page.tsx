import Link from "next/link";
import { Icon, type IconName } from "@/components/panel/icons";
import { Login } from "@/components/panel/Login";
import { Card, PageTitle } from "@/components/panel/kit";
import { authConfigured, isAdmin } from "@/lib/auth";
import { getAllPosts, getTestimonials } from "@/lib/content";
import { integrations } from "@/lib/integrations";
import { readMessages, readOverrides } from "@/lib/store";

export const dynamic = "force-dynamic";

const fmt = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
const when = (iso: string) => new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

function greeting() {
  const h = Number(new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", hour12: false, timeZone: "Europe/Istanbul" }).format(new Date()));
  return h < 6 ? "İyi geceler" : h < 12 ? "Günaydın" : h < 18 ? "İyi günler" : "İyi akşamlar";
}

export default async function PanelHome() {
  if (!(await isAdmin())) return <Login configured={authConfigured()} />;

  const [messages, posts, testimonials, overrides] = await Promise.all([readMessages(), getAllPosts(), getTestimonials(), readOverrides()]);
  const unread = messages.filter((m) => !m.read).length;
  const drafts = posts.filter((p) => !p.published).length;
  const edits = Object.keys(overrides).length;

  const stats: { label: string; value: number; sub: string; href: string; icon: IconName; hot?: boolean }[] = [
    { label: "Okunmamış mesaj", value: unread, sub: `${messages.length} mesajın ${unread} tanesi yeni`, href: "/panel/mesajlar", icon: "inbox", hot: unread > 0 },
    { label: "Blog yazısı", value: posts.length, sub: drafts ? `${drafts} taslak` : "Hepsi yayında", href: "/panel/blog", icon: "blog" },
    { label: "Danışan yorumu", value: testimonials.length, sub: "Sitede yayında", href: "/panel/yorumlar", icon: "quote" },
    { label: "Site düzenlemesi", value: edits, sub: "Metin ve görsel değişikliği", href: "/panel/duzenleme", icon: "wand" },
  ];

  return (
    <>
      <PageTitle title={greeting()} lead="Sitenizin bugünkü özeti ve hızlı işlemler." />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <li key={s.label} className="pn-fade" style={{ animationDelay: `${i * 60}ms` }}>
            <Link href={s.href} className={`group flex h-full flex-col justify-between rounded-[1.75rem] p-6 transition-all duration-300 hover:-translate-y-0.5 ${s.hot ? "bg-clay text-paper" : "border border-ink/10 bg-[#fbfaf8] hover:border-ink/25"}`}>
              <div className="flex items-center justify-between"><span className={s.hot ? "text-paper/85" : "text-ink-soft"}>{s.label}</span><Icon n={s.icon} className={s.hot ? "" : "text-clay"} /></div>
              <p className="display mt-6 text-6xl">{s.value}</p>
              <p className={`mt-1 text-sm ${s.hot ? "text-paper/80" : "text-ink-soft"}`}>{s.sub}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between"><h2 className="serif text-2xl">Son mesajlar</h2><Link href="/panel/mesajlar" className="text-clay hover:underline">Tümü</Link></div>
          {messages.length === 0 ? (
            <p className="mt-6 text-ink-soft">Henüz mesaj yok. İletişim formunu dolduran ziyaretçilerin mesajları burada görünecek.</p>
          ) : (
            <ul className="mt-5 divide-y divide-ink/10">
              {messages.slice(0, 5).map((m) => (
                <li key={m.id}>
                  <Link href={`/panel/mesajlar?id=${m.id}`} className="flex items-start gap-3 py-3.5 hover:text-clay">
                    <span className={`mt-2 size-2.5 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-clay"}`} />
                    <span className="min-w-0 flex-1"><span className="flex justify-between gap-3"><b className="font-medium">{m.name}</b><span className="shrink-0 text-sm text-ink-soft">{when(m.createdAt)}</span></span><span className="line-clamp-1 text-ink-soft">{m.message}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between"><h2 className="serif text-2xl">Son yazılar</h2><Link href="/panel/blog/yeni" className="inline-flex items-center gap-1.5 text-clay hover:underline"><Icon n="plus" size={15} />Yeni yazı</Link></div>
          <ul className="mt-5 divide-y divide-ink/10">
            {posts.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <Link href={`/panel/blog/${p.slug}`} className="flex items-center justify-between gap-3 py-3.5 hover:text-clay">
                  <span className="line-clamp-1">{p.title}</span>
                  <span className="flex shrink-0 items-center gap-2 text-sm text-ink-soft">{!p.published && <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">Taslak</span>}{fmt(p.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="serif text-2xl">Bağlantılar</h2>
        <ul className="mt-4 grid gap-x-10 gap-y-3 md:grid-cols-2">
          {integrations().map((i) => (
            <li key={i.name} className="flex items-start gap-3">
              <span aria-hidden className={`mt-2 size-2.5 shrink-0 rounded-full ${i.ok ? "bg-[#4f9a5d]" : i.optional ? "bg-ink/25" : "bg-[#b4452f]"}`} />
              <span><b className="font-medium">{i.name}</b><span className={`block text-sm ${!i.ok && !i.optional ? "text-[#b4452f]" : "text-ink-soft"}`}>{i.detail}</span></span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6 bg-moss-deep! text-paper! on-dark">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="serif text-2xl">Siteyi doğrudan sayfa üzerinde düzenleyin</h2>
            <p className="mt-2 text-paper/75">Düzenleme modunda sitedeki başlıklara ve metinlere tıklayıp yazabilir, görsellerin üzerine gelip değiştirebilirsiniz. Her değişiklik anında kaydedilir.</p>
          </div>
          <Link href="/?edit=1" prefetch={false} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-paper px-6 font-medium text-moss-deep hover:bg-linen"><Icon n="pen" size={17} />Düzenleme modunda aç</Link>
        </div>
      </Card>
    </>
  );
}
