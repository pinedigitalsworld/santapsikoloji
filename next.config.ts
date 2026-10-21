import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Statik bir içerik sitesi olduğundan nonce yerine 'unsafe-inline' kullanılıyor
// (nonce, sayfaları dinamik render etmeyi gerektirir).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self'",
  "connect-src 'self' https://api.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");


// Eski WordPress sitesindeki adresler yeni yapıya kalıcı (301) yönlendirilir.
const oldBlogPosts = ["cinsel-mitler", "ebeveynlerinden-ayrisamayan-ciftlerin-iliskileri-ve-evlilikte-yasadigi-sorunlar", "madonna-fahise-sendromu", "cinsellik-ile-ilgili-ilk-calismalar", "cinsellikte-fanteziler-ve-parafili", "hangi-durumlarda-aile-ve-cift-terapisi-destegi-alinmalidir"];
const oldTemplatePages = ["counseling", "therapy-center", "helpline", "addiction-rehab", "youth-center", "service-plus", "online-booking", "pricing", "newsletter-popups", "typography", "blog-list", "blog-grid", "blog-portfolio", "shop", "cart", "checkout", "my-account", "wishlist-page", "privacy-policy"];

const redirects = [
  { source: "/team/mustafa-egren", destination: "/psikologlarimiz" },
  { source: "/psikologlarimiz/mustafa-egren", destination: "/psikologlarimiz" },
  { source: "/team", destination: "/psikologlarimiz" },
  { source: "/team/:slug", destination: "/psikologlarimiz/:slug" },
  { source: "/merak-edilen-sorular", destination: "/sss" },
  { source: "/blog-yazilarimiz", destination: "/blog" },
  { source: "/category/:path*", destination: "/blog" },
  { source: "/testimonials/:path*", destination: "/danisan-yorumlari" },
  { source: "/randevu-al", destination: "/iletisim" },
  { source: "/contacts", destination: "/iletisim" },
  { source: "/consultation", destination: "/iletisim" },
  ...oldBlogPosts.map((slug) => ({ source: `/${slug}`, destination: `/blog/${slug}` })),
  ...oldTemplatePages.map((slug) => ({ source: `/${slug}`, destination: "/" })),
].map((r) => ({ ...r, permanent: true }));

const nextConfig: NextConfig = {
  redirects: async () => redirects,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }], // panelden yüklenen görseller
  },
  // Panel, sitenin ilk kurulumundan gelen görselleri sunucu tarafında listeler; Vercel'de dosyaların pakete girmesi için.
  outputFileTracingIncludes: { "/panel/**": ["./public/images/**/*"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
