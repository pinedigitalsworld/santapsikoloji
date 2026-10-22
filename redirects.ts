import legacyMediaSlugs from "./src/data/legacy-media-slugs.json";

/**
 * Eski WordPress sitesinden (santapsikoloji.com) kalan tüm adresler için 301 haritası.
 * Kaynaklar: eski sitenin kendi sitemap'leri (sitemaps.xml → yazı, sayfa, kategori), WordPress REST dökümü
 * (hizmetler, ekip, yorumlar, ek dosya sayfaları) ve bilinen WordPress kalıpları.
 * Her kural tek adımda (zincirsiz) yeni sitedeki en ilgili sayfaya gider.
 */
type Rule = { source: string; destination: string };

// Eski kök adreste (/yazi-adi/) yayınlanan blog yazıları, yeni adresleri /blog/yazi-adi
const posts = [
  "cinsel-mitler",
  "ebeveynlerinden-ayrisamayan-ciftlerin-iliskileri-ve-evlilikte-yasadigi-sorunlar",
  "madonna-fahise-sendromu",
  "cinsellik-ile-ilgili-ilk-calismalar",
  "cinsellikte-fanteziler-ve-parafili",
  "hangi-durumlarda-aile-ve-cift-terapisi-destegi-alinmalidir",
];

// Tema demo sayfaları: karşılığı olan en yakın sayfaya. Alt yolları (/counseling/gorsel-adi) da dahil.
const templatePages: Record<string, string> = {
  counseling: "/hizmetlerimiz", "therapy-center": "/hizmetlerimiz", helpline: "/hizmetlerimiz", "addiction-rehab": "/hizmetlerimiz",
  "youth-center": "/hizmetlerimiz", "service-plus": "/hizmetlerimiz", "online-booking": "/iletisim",
  "blog-list": "/blog", "blog-grid": "/blog", "blog-portfolio": "/blog",
  pricing: "/", shop: "/", cart: "/", checkout: "/", "my-account": "/", "wishlist-page": "/", "newsletter-popups": "/", typography: "/",
  psychology: "/", layouts: "/", santa_favicon: "/", santa_logo: "/", santa_logo_black: "/",
};

const rules: Rule[] = [
  // Sayfalar
  { source: "/merak-edilen-sorular", destination: "/sss" },
  { source: "/blog-yazilarimiz", destination: "/blog" },
  { source: "/randevu-al", destination: "/iletisim" },
  { source: "/contacts", destination: "/iletisim" },
  { source: "/consultation", destination: "/iletisim" },
  { source: "/privacy-policy", destination: "/gizlilik" },
  { source: "/index.php", destination: "/" },
  { source: "/home", destination: "/" },

  // Yazılar: /yazi, /yazi/ek-dosya-sayfasi, /yazi/attachment/123 → /blog/yazi
  ...posts.map((slug) => ({ source: `/${slug}/:path*`, destination: `/blog/${slug}` })),
  { source: "/top-5-social-help-centers-to-contact-today/:path*", destination: "/blog" },
  { source: "/category/:path*", destination: "/blog" },
  { source: "/tag/:path*", destination: "/blog" },
  { source: "/author/:path*", destination: "/blog" },
  { source: "/feed", destination: "/blog" },
  { source: "/comments/feed", destination: "/blog" },

  // Ekip
  { source: "/team", destination: "/psikologlarimiz" },
  { source: "/team/mustafa-egren/:path*", destination: "/psikologlarimiz" },
  { source: "/psikologlarimiz/mustafa-egren", destination: "/psikologlarimiz" },
  { source: "/team/:slug/:path+", destination: "/psikologlarimiz/:slug" },
  { source: "/team/:slug", destination: "/psikologlarimiz/:slug" },

  // Danışan yorumları
  { source: "/testimonials", destination: "/danisan-yorumlari" },
  { source: "/testimonials/:path*", destination: "/danisan-yorumlari" },

  // Hizmetler: /hizmetlerimiz/hizmet/attachment/123 gibi ek dosya sayfaları hizmetin kendisine
  { source: "/hizmetlerimiz/:slug/:path+", destination: "/hizmetlerimiz/:slug" },

  // Tema demo sayfaları ve alt yolları
  ...Object.entries(templatePages).flatMap(([slug, to]) => [
    { source: `/${slug}`, destination: to },
    { source: `/${slug}/:path*`, destination: to },
  ]),

  // Eski kökte yayınlanan görsel "ek dosya sayfaları" (/slider-4-slide-1-copyright1-jpg/ vb.)
  ...(legacyMediaSlugs as string[]).map((slug) => ({ source: `/${slug}`, destination: "/" })),

  // Eski sitemap adresleri (Search Console'a gönderilmiş olabilir) yeni sitemap'e
  ...["sitemaps.xml", "sitemaps.xsl", "sitemap_index.xml", "wp-sitemap.xml", "post-sitemap.xml", "page-sitemap.xml", "category-sitemap.xml", "post-sitemap1.xml", "page-sitemap1.xml", "category-sitemap1.xml"].map((f) => ({ source: `/${f}`, destination: "/sitemap.xml" })),
];

/**
 * `statusCode: 301` ile gerçek 301 gönderilir (permanent: true Next.js'te 308 verir; Google için aynı anlama gelir ama 301 istendi).
 * Eski WordPress adreslerinin hepsi "/" ile bittiği için Next.js'in kendi eğik çizgi yönlendirmesi kapatılmıştır
 * (next.config: skipTrailingSlashRedirect); özel kurallar eğik çizgili adresi doğrudan hedefe gönderir, zincir oluşmaz.
 */
export const redirects = [
  ...rules.map((r) => ({ ...r, statusCode: 301 as const })),
  // WordPress'in ?p=123, ?page_id=45, ?s=arama gibi sorgu adresleri blog'a (Next.js sorguyu korur; hedef "/" olsaydı döngü olurdu)
  ...["p", "page_id", "cat", "s", "attachment_id", "tag"].map((key) => ({
    source: "/", has: [{ type: "query" as const, key }], destination: "/blog", statusCode: 301 as const,
  })),
  // Geriye kalan eğik çizgili her adres, eğik çizgisiz haline (tek adım, 301)
  { source: "/:path+/", destination: "/:path+", statusCode: 301 as const },
];
