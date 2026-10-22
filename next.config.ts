import type { NextConfig } from "next";
import { redirects } from "./redirects";

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
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");


const nextConfig: NextConfig = {
  redirects: async () => redirects,
  poweredByHeader: false,
  skipTrailingSlashRedirect: true, // eğik çizgi yönlendirmesini redirects.ts yapar (301, tek adım)
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
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
        ],
      },
      {
        // Yönetim paneli ve API'ler arama motorlarına kapalı ve önbelleğe alınmaz.
        source: "/panel/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }, { key: "Cache-Control", value: "private, no-store" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
