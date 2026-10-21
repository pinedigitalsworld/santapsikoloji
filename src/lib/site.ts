export const site = {
  name: "Santa Psikoloji",
  legalName: "Santa Eğitim ve Danışmanlık Ltd.",
  url: "https://www.santapsikoloji.com",
  tagline: "Psikoloji, Eğitim & Danışmanlık",
  description:
    "Ankara Çankaya'da bireysel, çift, çocuk-ergen ve aile danışmanlığı. Bilimsel temelli, etik ilkelere bağlı, güvenli bir terapi alanı.",
  phone: "0544 726 83 06",
  phoneHref: "tel:+905447268306",
  whatsapp: "https://wa.me/905447268306",
  email: "santapsikoloji@gmail.com",
  instagram: "https://www.instagram.com/santapsikoloji/",
  address: "ATM Plaza, Ankara Ticaret Merkezi, Çankaya / Ankara",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=ATM+Plaza+Ankara+Ticaret+Merkezi+%C3%87ankaya",
  hours: [
    { days: "Pazartesi – Cumartesi", time: "10:00 – 19:00" },
    { days: "Pazar", time: "Kapalı" },
  ],
} as const;

export const nav = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/hizmetlerimiz", label: "Hizmetlerimiz" },
  { href: "/psikologlarimiz", label: "Psikologlarımız" },
  { href: "/blog", label: "Blog" },
  { href: "/sss", label: "Sıkça Sorulanlar" },
  { href: "/iletisim", label: "İletişim" },
] as const;
