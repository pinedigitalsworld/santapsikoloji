import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ContactBand, TeamGrid } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Psikologlarımız",
  description: "Merve Nur Akıl ve Hazal Gül Akkuş: Santa Psikoloji'nin uzman psikolog kadrosu.",
  alternates: { canonical: "/psikologlarimiz" },
};

export default function Team() {
  return (
    <>
      <PageHeader title="Psikologlarımız" lead="Deneyimli ve etik ilkelere bağlı uzmanlarla, güncel psikoloji yaklaşımlarını danışmanlık sürecine entegre ediyoruz." edKey="page.team" />
      <div className="container-page"><TeamGrid /></div>
      <div className="mt-28"><ContactBand /></div>
    </>
  );
}
