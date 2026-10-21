import { clean, toBlocks, summarize, metaDescription, readingMinutes, type Block } from "@/lib/text";
import { readContent, readOverrides, readSettings, type RawItem } from "@/lib/store";

export { toBlocks, summarize, metaDescription, readingMinutes };
export type { Block };

type Item = RawItem;


export const img = (name: string | undefined) => (name ? (name.startsWith("/") ? name : `/images/${name}`) : undefined);

/** Düzenleme modunda değiştirilen görsel varsa onu, yoksa verilen görseli döndürür. */
export const imgOr = (key: string, fallback: string) => readOverrides()[`img:${key}`] ?? fallback;

/* ---------- Hizmetler ---------- */

export const serviceGroups = [
  {
    id: "cocuk-ergen",
    title: "Çocuk & Ergen",
    lead: "Oyunla, bilimsel yöntemlerle ve ebeveynle iş birliği içinde.",
    slugs: ["cocuk-ergen-danismanligi", "oyun-terapisi", "deneyimsel-oyun-terapisi", "cocuk-merkezli-terapi", "cocuk-bilissel-davranisci-terapi", "cocuklarla-emdr-terapisi", "dikkat-terapisi", "moxo-dikkat-testi"],
  },
  {
    id: "yetiskin",
    title: "Yetişkin",
    lead: "Kendinizi tanımanız ve güçlenmeniz için bireysel ve grup çalışmaları.",
    slugs: ["yetiskin-danismanligi", "bireysel-danismanlik", "bilissel-davranisci-terapi", "emdr-terapisi", "sema-terapi", "psikodrama", "grup-terapisi"],
  },
  {
    id: "cift-aile",
    title: "Çift & Aile",
    lead: "İletişimi, yakınlığı ve ortak çözümleri güçlendiren seanslar.",
    slugs: ["cift-danismanligi", "aile-ve-evlilik-danismanligi", "cinsel-danismanlik"],
  },
  {
    id: "degerlendirme",
    title: "Değerlendirme & Kurumsal",
    lead: "Testler, değerlendirme süreçleri ve kurumlara yönelik danışmanlık.",
    slugs: ["kisilik-testleri", "mesleki-degerlendirme-testleri", "kurumsal-danismanlik"],
  },
] as const;

/** Ham veri değişmedikçe türetilmiş değeri yeniden hesaplamaz. */
const memo = new WeakMap<object, Map<string, unknown>>();
function derived<T>(key: string, build: (raw: ReturnType<typeof readContent>) => T): T {
  const raw = readContent();
  let m = memo.get(raw);
  if (!m) memo.set(raw, (m = new Map()));
  if (!m.has(key)) m.set(key, build(raw));
  return m.get(key) as T;
}

const buildServices = (raw: ReturnType<typeof readContent>) => (raw.services as Item[]).map((s) => ({
  ...s,
  title: clean(s.title),
  image: img(s.images[0]),
  summary: summarize(s.text),
  blocks: toBlocks(s.text),
}));
const services = () => derived("services", buildServices);
export type Service = ReturnType<typeof buildServices>[number];

export const getServices = () => services();
export const getService = (slug: string) => services().find((s) => s.slug === slug);
/** Hizmetin grubu: panelden seçilmişse o, yoksa koddaki varsayılan listeden. */
const groupIdOf = (s: Service) => s.group ?? serviceGroups.find((g) => (g.slugs as readonly string[]).includes(s.slug))?.id;
export const getServiceGroups = () =>
  serviceGroups.map((g) => {
    const fixed = g.slugs as readonly string[];
    return {
      ...g,
      // Önce bilinen sıra, ardından panelden eklenen ya da gruba taşınan hizmetler.
      items: [
        ...fixed.map((slug) => getService(slug)).filter((s): s is Service => Boolean(s) && groupIdOf(s as Service) === g.id),
        ...getServices().filter((s) => !fixed.includes(s.slug) && groupIdOf(s) === g.id),
      ],
    };
  });
export const groupOfService = (slug: string) => {
  const s = getService(slug);
  return s ? serviceGroups.find((g) => g.id === groupIdOf(s)) : undefined;
};

/* ---------- Ekip ---------- */

const teamMeta: Record<string, { role: string; photo: string; position?: string }> = {
  "hazal-gul-akkus": { role: "Psikolog · Aile Danışmanı", photo: "WhatsApp-Image-2026-01-07-at-13.12.55.jpeg", position: "50% 22%" },
  "merve-nur-akil": { role: "Klinik Psikolog", photo: "IMG_2453.jpg", position: "50% 20%" },
};

const buildTeam = (raw: ReturnType<typeof readContent>) => (raw.team as Item[]).map((m) => {
  const meta = teamMeta[m.slug];
  let blocks = toBlocks(m.text);
  const first = blocks[0];
  // İlk satır yalnızca "Unvan + isim." ise tekrar olmaması için atılır.
  if (first?.type === "p" && first.text.length < 80 && blocks.length > 1) blocks = blocks.slice(1);
  return {
    slug: m.slug, name: clean(m.title), role: m.role ?? meta?.role ?? "Psikolog",
    image: img(m.photo ?? meta?.photo ?? m.images[0]) ?? "/images/pp-1.jpeg", position: m.position ?? meta?.position ?? "50% 25%", blocks,
  };
});
const team = () => derived("team", buildTeam);
export type Member = ReturnType<typeof buildTeam>[number];
const teamOrder = ["merve-nur-akil", "hazal-gul-akkus"];
export const getTeam = () => [...team()].sort((a, b) => (teamOrder.indexOf(a.slug) + 99) % 99 - (teamOrder.indexOf(b.slug) + 99) % 99);
export const getMember = (slug: string) => team().find((m) => m.slug === slug);

/* ---------- Blog ---------- */

// Arama sonuçlarında kesilmemesi için uzun başlıklara kısa bir "meta başlığı" verilir (sayfadaki H1 değişmez).
const seoTitles: Record<string, string> = {
  "ebeveynlerinden-ayrisamayan-ciftlerin-iliskileri-ve-evlilikte-yasadigi-sorunlar": "Ebeveynden Ayrışamama ve Evlilik Sorunları",
  "hangi-durumlarda-aile-ve-cift-terapisi-destegi-alinmalidir": "Aile ve Çift Terapisi Ne Zaman Gerekir?",
  "cinsellikte-fanteziler-ve-parafili": "Cinsellikte Fanteziler ve Parafili",
};

const buildPosts = (raw: ReturnType<typeof readContent>) => (raw.posts as Item[])
  .map((p) => ({
    ...p,
    title: clean(p.title),
    seoTitle: seoTitles[p.slug] ?? clean(p.title),
    seoDescription: metaDescription(p.text),
    image: img(p.images[0]),
    summary: p.summary?.trim() || summarize(p.text, 190),
    blocks: toBlocks(p.text),
    minutes: readingMinutes(p.text),
    published: p.published !== false,
  }))
  .sort((a, b) => b.date.localeCompare(a.date));
export type Post = ReturnType<typeof buildPosts>[number];
const posts = () => derived("posts", buildPosts);
/** Sitede görünen (yayındaki) yazılar. */
export const getPosts = () => posts().filter((p) => p.published);
/** Panel için: taslaklar dahil tüm yazılar. */
export const getAllPosts = () => posts();
export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);

/* ---------- Yorumlar ---------- */

// Kaynak yorumlarda noktadan sonra boşluk eksik; "Optimum Psikoloji" adı geçen yorumlar başka bir kuruma ait olduğundan alınmadı.
const fixSpacing = (t: string) => clean(t).replace(/([a-zçğıöşü])([.!?])([A-ZÇĞİÖŞÜ])/g, "$1$2 $3");
const buildTestimonials = (raw: ReturnType<typeof readContent>) => (raw.testimonials as Item[])
  .filter((t) => !/optimum/i.test(t.text))
  .map((t) => ({ slug: t.slug, name: clean(t.title), text: fixSpacing(t.text) }));
export const getTestimonials = () => derived("testimonials", buildTestimonials);

/* ---------- SSS ---------- */

/** Panelden kaydedilmiş SSS varsa onu, yoksa ilk içe aktarılan sayfa metninden çıkarılanı verir. */
export const getFaq = () => derived("faq", (raw) => {
  if (raw.faq) return raw.faq;
  const blocks = toBlocks(raw.pages["merak-edilen-sorular"].text);
  const out: { q: string; a: string }[] = [];
  for (const b of blocks) {
    if (b.type === "h") { if (!b.text.trim().endsWith("?")) break; out.push({ q: b.text, a: "" }); }
    else if (b.type === "p" && /^\d{1,2}$/.test(b.text)) break;
    else if (b.type === "p" && out.length) out[out.length - 1].a += (out[out.length - 1].a ? "\n\n" : "") + b.text;
  }
  return out.filter((f) => f.a);
});

/* ---------- Hakkımızda ---------- */

const aboutDefaults = {
  mission:
    "Santa Eğitim ve Danışmanlık Ltd., 2023 yılında uzman bir ekip tarafından, psikolojik iyi oluşu merkeze alan, bilimsel temelli ve etik ilkelere bağlı bir anlayışla kurulmuştur. Kuruluşumuzdan bu yana; çocuk, ergen, çift ve yetişkinlere yönelik psikolojik danışmanlık, değerlendirme ve eğitim hizmetlerini bütüncül bir bakış açısıyla sunmayı hedeflemekteyiz.\n\nHer danışanın ihtiyacının ve hikâyesinin kendine özgü olduğuna inanır; güvenli, yargısız ve kapsayıcı bir terapötik alan oluşturmayı önceliğimiz kabul ederiz. Klinik uygulamalarımızda bilimsel değerlendirme yöntemleri ile bireyin güçlü yönlerini destekleyen bütüncül bir yaklaşım benimseriz.\n\nSanta Eğitim ve Danışmanlık’ta amacımız; yalnızca sorun odaklı değil, bireyin kendini tanıdığı, güçlendiği ve sürdürülebilir iyilik hâline ulaştığı bir yolculukta eşlik etmektir.",
  vision:
    "Psikoloji alanındaki güncel ve kanıta dayalı yaklaşımları yakından takip eden, uzmanlığı ve etik duruşuyla güven duyulan; eğitim, danışmanlık ve klinik uygulamalar alanında referans gösterilen bir merkez olmak. Toplum ruh sağlığını destekleyen çalışmalarla yalnızca bireylere değil, ailelere ve kurumlara da değer katan, sürekli gelişen ve dönüşen bir yapı oluşturmayı hedefliyoruz.",
  support:
    "Bireysel ihtiyaçları merkeze alan, etik ilkelere bağlı ve bilimsel temelli yaklaşımlarımızla danışanlarımıza güvenli bir danışmanlık süreci sunuyoruz. Her bireyin sürecinin kendine özgü olduğuna inanıyor, bu yolculukta yanınızda olmayı önemsiyoruz.",
  points: [
    "Deneyimli ve etik ilkelere bağlı uzmanlarla çalışıyoruz.",
    "Güncel psikoloji yaklaşımlarını danışmanlık sürecimize entegre ediyoruz.",
  ],
};

export const getAbout = () => {
  const o = readSettings().about ?? {};
  return {
    support: o.support?.trim() || aboutDefaults.support,
    mission: o.mission?.trim() || aboutDefaults.mission,
    vision: o.vision?.trim() || aboutDefaults.vision,
    points: o.points?.length ? o.points : [...aboutDefaults.points],
  };
};
export const aboutDefault = aboutDefaults;
