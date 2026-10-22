import type { Metadata } from "next";
import { EditChip } from "@/components/EditChip";
import { JsonLd } from "@/components/JsonLd";
import { ContactBand } from "@/components/Sections";
import { Faq, PageHeader } from "@/components/ui";
import { getFaq } from "@/lib/content";

export const metadata: Metadata = {
  title: "Psikolojik Danışmanlık Sık Sorulan Sorular",
  description: "Psikolojik danışmanlık kimler için uygundur, görüşmeler gizli midir, randevu nasıl alınır? Merak edilen soruların yanıtları.",
  alternates: { canonical: "/sss" },
};

export default async function FaqPage() {
  const items = await getFaq();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <PageHeader title="Merak edilen sorular" edKey="page.faq" />
      <div className="container-page relative max-w-4xl"><EditChip href="/panel/sss" label="Soruları düzenle" /><Faq items={items} /></div>
      <div className="mt-28"><ContactBand /></div>
    </>
  );
}
