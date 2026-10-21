import { readOverrides, readSettings } from "@/lib/store";
import { site as defaults } from "@/lib/site";

/** Telefon numarasından tel: ve WhatsApp bağlantıları üretir (Türkiye numaraları). */
function intl(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("90")) return d;
  if (d.startsWith("0")) return `90${d.slice(1)}`;
  return `90${d}`;
}

/** Panelden değiştirilebilen iletişim bilgileriyle birleştirilmiş site bilgisi. */
export function getSite() {
  const s = readSettings();
  const phone = s.phone?.trim() || defaults.phone;
  const address = s.address?.trim() || defaults.address;
  const digits = intl(phone);
  return {
    ...defaults,
    phone,
    phoneHref: `tel:+${digits}`,
    whatsapp: `https://wa.me/${digits}`,
    email: s.email?.trim() || defaults.email,
    instagram: s.instagram?.trim() || defaults.instagram,
    address,
    mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    hours: s.hours?.length ? s.hours : [...defaults.hours],
  };
}
export type SiteInfo = ReturnType<typeof getSite>;

/** Düzenleme modunda değiştirilen metin; yoksa varsayılan. */
export const ed = (key: string, fallback: string) => readOverrides()[key] ?? fallback;
