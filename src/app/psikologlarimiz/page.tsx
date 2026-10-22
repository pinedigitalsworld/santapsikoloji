import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ContactBand, TeamGrid } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Uzman Psikologlarımız",
  description: "Merve Nur Akıl ve Hazal Gül Akkuş: Santa Psikoloji'nin uzman psikolog kadrosu, yüz yüze ve online görüşme. Eğitimleri, çalışma alanları ve randevu bilgileri.",
  alternates: { canonical: "/psikologlarimiz" },
};

export default function Team() {
  return (
    <>
      <PageHeader title="Psikologlarımız" lead="Deneyimli ve etik ilkelere bağlı uzmanlarla, güncel psikoloji yaklaşımlarını danışmanlık sürecine entegre ediyoruz." edKey="page.team" />
      <div className="container-page"><TeamGrid eager /></div>
      <div className="mt-28"><ContactBand /></div>
    </>
  );
}
