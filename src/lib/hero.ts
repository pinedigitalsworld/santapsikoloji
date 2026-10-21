import { ed, getSite } from "@/lib/site-server";
import { readOverrides } from "@/lib/store";

export type Slide = {
  id: string; title: string; text: string;
  cta: { label: string; href: string; external?: boolean };
  secondary?: { label: string; href: string };
  image: string; caption: string; position: string;
};

/** Ana sayfa karşılama slaytları. Metin ve görseller düzenleme modunda değiştirilebilir. */
export function getHeroSlides(): Slide[] {
  const site = getSite();
  const o = readOverrides();
  const base: Slide[] = [
    {
      id: "oda",
      title: "Zor zamanlarda yanınızdayız.",
      text: "Çocuk, ergen, çift ve yetişkinlere yönelik psikolojik danışmanlık. Güvenli bir ortamda, bilimsel temelli bir süreç.",
      cta: { label: "Randevu Al", href: site.whatsapp, external: true },
      secondary: { label: site.phone, href: site.phoneHref },
      image: "/images/hero-oda.jpg", caption: "Danışma odası", position: "50% 58%",
    },
    {
      id: "oyun",
      title: "Çocuklar için güvenli oyun alanı.",
      text: "Oyun terapisi, deneyimsel oyun terapisi ve çocuk merkezli terapi: çocuğun dünyasına uyarlanmış, yargısız bir ortamda.",
      cta: { label: "Çocuk & ergen hizmetleri", href: "/hizmetlerimiz#cocuk-ergen" },
      image: "/images/hero-oyun.jpg", caption: "Oyun terapisi odası", position: "50% 24%",
    },
    {
      id: "gorusme",
      title: "Yargısız, güvenli bir terapi alanı.",
      text: "Her danışanın hikâyesi kendine özgüdür. Bilimsel temelli ve etik ilkelere bağlı bir süreçle yanınızdayız.",
      cta: { label: "Hizmetlerimiz", href: "/hizmetlerimiz" },
      image: "/images/hero-gorusme.jpg", caption: "Görüşme odası", position: "50% 45%",
    },
  ];
  return base.map((s) => ({
    ...s,
    title: ed(`hero.${s.id}.title`, s.title),
    text: ed(`hero.${s.id}.text`, s.text),
    cta: { ...s.cta, label: ed(`hero.${s.id}.cta`, s.cta.label) },
    image: o[`img:hero.${s.id}.image`] ?? s.image,
  }));
}
