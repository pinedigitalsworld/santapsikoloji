import { site } from "@/lib/site";

/** Göreli (/images/x.jpg) ya da Cloudinary (https://…) görsel yolunu mutlak adrese çevirir. */
export const absUrl = (path: string | undefined) => (path ? (/^https?:/.test(path) ? path : `${site.url}${path}`) : undefined);

/** Arama sonuçlarında yol (breadcrumb) göstermek için BreadcrumbList. */
export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
});
