"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Btn, api, useToast } from "@/components/panel/kit";

const labels: Record<string, string> = {
  "home.support.title": "Ana sayfa · Destek başlığı", "home.support.lead": "Ana sayfa · Destek alt metni",
  "home.about.title": "Ana sayfa · Hakkımızda başlığı", "home.about.lead": "Ana sayfa · Hakkımızda özeti", "home.about.text": "Ana sayfa · Hakkımızda metni", "home.about.photo": "Ana sayfa · Hakkımızda görseli",
  "home.services.title": "Ana sayfa · Hizmetler başlığı", "home.team.title": "Ana sayfa · Psikologlar başlığı", "home.reviews.title": "Ana sayfa · Yorumlar başlığı", "home.faq.title": "Ana sayfa · SSS başlığı", "home.blog.title": "Ana sayfa · Blog başlığı",
  "band.title": "İletişim bandı · Başlık", "band.lead": "İletişim bandı · Metin", "footer.tagline": "Alt bilgi · Slogan",
  "about.photo": "Hakkımızda sayfası · Görsel", "contact.photo": "İletişim sayfası · Görsel",
};
const pageNames: Record<string, string> = { about: "Hakkımızda", blog: "Blog", reviews: "Yorumlar", faq: "SSS", team: "Psikologlar", contact: "İletişim", services: "Hizmetler" };
const slideNames: Record<string, string> = { oda: "1. slayt", oyun: "2. slayt", gorusme: "3. slayt" };
const parts: Record<string, string> = { title: "başlık", lead: "alt metin", text: "metin", cta: "düğme", image: "görsel" };

function nice(raw: string) {
  const key = raw.replace(/^img:/, "");
  if (labels[key]) return labels[key];
  const m = /^page\.(\w+)\.(\w+)$/.exec(key);
  if (m) return `${pageNames[m[1]] ?? m[1]} sayfası · ${parts[m[2]] ?? m[2]}`;
  const h = /^hero\.(\w+)\.(\w+)$/.exec(key);
  if (h) return `Ana sayfa karşılama (${slideNames[h[1]] ?? h[1]}) · ${parts[h[2]] ?? h[2]}`;
  return key;
}

export function OverridesList({ items }: { items: [string, string][] }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function revert(key: string) {
    setBusy(key);
    try { await api("DELETE", "/panel/api/ed", { key }); toast("Varsayılana döndürüldü"); router.refresh(); }
    catch (e) { toast((e as Error).message, "err"); }
    setBusy(null);
  }

  if (!items.length) return <p className="rounded-2xl bg-linen/70 p-6 text-ink-soft">Henüz düzenleme modunda bir değişiklik yapılmadı.</p>;
  return (
    <ul className="divide-y divide-ink/10 rounded-[1.5rem] border border-ink/10 bg-[#fbfaf8]">
      {items.map(([k, v]) => (
        <li key={k} className="flex flex-wrap items-center gap-4 p-4 md:px-6">
          {k.startsWith("img:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.startsWith("/") ? v : `/images/${v}`} alt="" className="h-14 w-20 shrink-0 rounded-xl object-cover" />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink-soft">{nice(k)}</p>
            {!k.startsWith("img:") && <p className="line-clamp-2">{v}</p>}
          </div>
          <Btn variant="ghost" size="sm" icon="undo" busy={busy === k} onClick={() => revert(k)}>Varsayılana dön</Btn>
        </li>
      ))}
    </ul>
  );
}
