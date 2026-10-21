import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { EditorLoader } from "@/components/EditorLoader";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { MobileCta } from "@/components/MobileCta";
import { SiteChrome } from "@/components/SiteChrome";
import { getServiceGroups } from "@/lib/content";
import { site } from "@/lib/site";
import { getSite } from "@/lib/site-server";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin", "latin-ext"], display: "swap", axes: ["opsz"] });
const instrument = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Ankara Psikolojik Danışmanlık`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "tr_TR", siteName: site.name, url: "/",
    title: `${site.name} | Ankara Psikolojik Danışmanlık`, description: site.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Santa Psikoloji danışma odası: pencereden Ankara manzarası, kanepe ve bitkiler" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f2f1ee", width: "device-width", initialScale: 1 };

const businessLd = (s: Awaited<ReturnType<typeof getSite>>) => {
  return {
  "@context": "https://schema.org",
  "@type": ["Psychologist", "LocalBusiness"],
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  image: `${site.url}/og.jpg`,
  logo: `${site.url}/images/SANTA_LOGO.png`,
  description: site.description,
  telephone: s.phoneHref.replace("tel:", ""),
  email: s.email,
  sameAs: [s.instagram],
  address: { "@type": "PostalAddress", streetAddress: "ATM Plaza, Ankara Ticaret Merkezi", addressLocality: "Çankaya", addressRegion: "Ankara", addressCountry: "TR" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "10:00", closes: "19:00" }],
  };
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [s, groups] = await Promise.all([getSite(), getServiceGroups()]);
  return (
    <html lang="tr" data-scroll-behavior="smooth" className={`${fraunces.variable} ${instrument.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteChrome
          header={<Header site={{ whatsapp: s.whatsapp, phoneHref: s.phoneHref }} groups={groups.map((g) => ({ id: g.id, title: g.title, lead: g.lead, items: g.items.map((i) => ({ slug: i.slug, title: i.title })) }))} />}
          footer={<Footer />}
          mobileCta={<MobileCta site={{ whatsapp: s.whatsapp, phoneHref: s.phoneHref }} />}
        >
          <JsonLd data={businessLd(s)} />
          {children}
        </SiteChrome>
        <EditorLoader />
      </body>
    </html>
  );
}
