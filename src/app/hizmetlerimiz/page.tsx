import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContactBand, ServiceCatalog } from "@/components/Sections";
import { getSite } from "@/lib/site-server";

export const metadata: Metadata = {
  title: "Hizmetlerimiz",
  description: "Bireysel, çift, aile, çocuk-ergen danışmanlığı; EMDR, bilişsel davranışçı terapi, oyun terapisi, psikodrama, MOXO dikkat testi ve daha fazlası.",
  alternates: { canonical: "/hizmetlerimiz" },
};

export default async function Services() {
  const site = await getSite();
  return (
    <>
      <PageHero
        title="Hizmetlerimiz"
        lead="Bireysel, çift, çocuk-ergen ve aile danışmanlığı: her danışanın ihtiyacına uygun, kişiye özel bir süreç planlanır."
        image="/images/hero-oda.jpg"
        position="50% 30%"
        edKey="page.services"
      >
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full bg-paper px-6 font-medium text-ink transition-colors hover:bg-linen">Randevu Al</a>
        <a href="#cocuk-ergen" className="inline-flex min-h-12 items-center rounded-full border border-paper/60 px-6 font-medium transition-colors hover:bg-paper hover:text-ink">Hizmetlere göz atın</a>
      </PageHero>
      <ServiceCatalog />
      <div className="mt-24 sm:mt-32 lg:mt-44"><ContactBand /></div>
    </>
  );
}
