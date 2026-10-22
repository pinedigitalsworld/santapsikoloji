import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader, Photo } from "@/components/ui";
import { getSite } from "@/lib/site-server";

export const metadata: Metadata = {
  title: "Randevu Al ve İletişim: Ankara Çankaya",
  description: "Santa Psikoloji, ATM Plaza Ankara Ticaret Merkezi Çankaya. Randevu için 0544 726 83 06. Pazartesi–Cumartesi 10:00–19:00. WhatsApp ve form ile ulaşın.",
  alternates: { canonical: "/iletisim" },
};

export default async function Contact() {
  const site = await getSite();
  const link = "underline underline-offset-4 hover:text-clay";
  return (
    <>
      <PageHeader title="Aklınıza takılan bir durum mu var?" lead="Güvenle bizimle iletişime geçebilirsiniz. Sorularınız ve randevu talepleriniz için bize dilediğiniz zaman ulaşın." edKey="page.contact" />
      <div className="container-page grid gap-14 md:grid-cols-[1fr_1.1fr] md:gap-20">
        <dl className="space-y-8">
          <div><dt className="serif text-xl text-clay">Telefon</dt><dd className="mt-1 text-xl"><a className={link} href={site.phoneHref}>{site.phone}</a></dd></div>
          <div><dt className="serif text-xl text-clay">Adres</dt><dd className="mt-1 text-xl">{site.address}<br /><a className={`${link} text-base`} href={site.mapsHref} target="_blank" rel="noopener noreferrer">Haritada aç</a></dd></div>
          <div><dt className="serif text-xl text-clay">E-posta</dt><dd className="mt-1 text-xl"><a className={link} href={`mailto:${site.email}`}>{site.email}</a></dd></div>
          <div><dt className="serif text-xl text-clay">Çalışma saatleri</dt>
            <dd className="mt-1">{site.hours.map((h) => <span key={h.days} className="block text-xl">{h.days}: {h.time}</span>)}</dd></div>
          <div><dt className="serif text-xl text-clay">Instagram</dt><dd className="mt-1 text-xl"><a className={link} href={site.instagram} target="_blank" rel="noopener noreferrer">@santapsikoloji</a></dd></div>
        </dl>
        <div>
        <div className="rounded-[2rem] bg-linen p-7 md:p-10">
          <h2 className="serif text-3xl">Bize yazın</h2>
          <div className="mt-6"><ContactForm whatsapp={site.whatsapp} /></div>
        </div>
        <Photo src="/images/pp-1.jpeg" alt="Santa Psikoloji danışma odası" sizes="(min-width:768px) 50vw, 100vw" position="50% 55%" className="mt-6 aspect-[16/9] rounded-[2rem]" edit="contact.photo" />
        </div>
      </div>
    </>
  );
}
