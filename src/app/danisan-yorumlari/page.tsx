import type { Metadata } from "next";
import { ContactBand, Testimonials } from "@/components/Sections";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Danışan Yorumları",
  description: "Danışanlarımızın Santa Psikoloji'deki terapi ve danışmanlık süreçlerine dair deneyimleri.",
  alternates: { canonical: "/danisan-yorumlari" },
};

export default function Reviews() {
  return (
    <>
      <PageHeader title="Danışanlarımızın deneyimleri" edKey="page.reviews" />
      <div className="container-page"><Testimonials /></div>
      <div className="mt-28"><ContactBand /></div>
    </>
  );
}
