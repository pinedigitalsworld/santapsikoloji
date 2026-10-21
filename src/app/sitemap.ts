import type { MetadataRoute } from "next";
import { getPosts, getServices, getTeam } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, team, posts] = await Promise.all([getServices(), getTeam(), getPosts()]);
  const now = new Date();
  const fixed = ["", "/hakkimizda", "/hizmetlerimiz", "/psikologlarimiz", "/blog", "/sss", "/danisan-yorumlari", "/iletisim"].map((p) => ({
    url: `${site.url}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...fixed,
    ...services.map((s) => ({ url: `${site.url}/hizmetlerimiz/${s.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 })),
    ...team.map((m) => ({ url: `${site.url}/psikologlarimiz/${m.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
