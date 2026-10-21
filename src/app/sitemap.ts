import type { MetadataRoute } from "next";
import { getPosts, getServices, getTeam } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = ["", "/hakkimizda", "/hizmetlerimiz", "/psikologlarimiz", "/blog", "/sss", "/danisan-yorumlari", "/iletisim"].map((p) => ({
    url: `${site.url}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...fixed,
    ...getServices().map((s) => ({ url: `${site.url}/hizmetlerimiz/${s.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 })),
    ...getTeam().map((m) => ({ url: `${site.url}/psikologlarimiz/${m.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 })),
    ...getPosts().map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
