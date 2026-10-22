import type { MetadataRoute } from "next";
import { getPosts, getServices, getTeam } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Yalnızca gerçek tarih bilinen sayfalara `lastModified` yazılır (blog yazıları);
 * her istekte "şimdi" yazmak Google'a güvenilmez sinyal verir. Google changefreq/priority'yi kullanmaz.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, team, posts] = await Promise.all([getServices(), getTeam(), getPosts()]);
  const latestPost = posts[0] ? new Date(posts[0].date) : undefined;
  const page = (path: string, lastModified?: Date) => ({ url: `${site.url}${path}`, ...(lastModified ? { lastModified } : {}) });
  return [
    page("", latestPost),
    page("/hizmetlerimiz"),
    page("/psikologlarimiz"),
    page("/hakkimizda"),
    page("/blog", latestPost),
    page("/sss"),
    page("/danisan-yorumlari"),
    page("/iletisim"),
    page("/gizlilik"),
    ...services.map((s) => page(`/hizmetlerimiz/${s.slug}`)),
    ...team.map((m) => page(`/psikologlarimiz/${m.slug}`)),
    ...posts.map((p) => page(`/blog/${p.slug}`, new Date(p.date))),
  ];
}
