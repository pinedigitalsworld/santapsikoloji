"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/panel/icons";
import { Btn, Field, api, fieldCls, useToast } from "@/components/panel/kit";

export type SettingsValues = {
  phone: string; email: string; address: string; instagram: string;
  hours: { days: string; time: string }[];
  about: { support: string; mission: string; vision: string; points: string[] };
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(f) !== saved;
  const set = <K extends keyof SettingsValues>(k: K, v: SettingsValues[K]) => setF((p) => ({ ...p, [k]: v }));
  const setAbout = (p: Partial<SettingsValues["about"]>) => setF((s) => ({ ...s, about: { ...s.about, ...p } }));

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setBusy(true);
    try { await api("PUT", "/panel/api/settings", f); setSaved(JSON.stringify(f)); toast("Ayarlar kaydedildi"); router.refresh(); }
    catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  }

  return (
    <div className="pn-fade">
      <div className="sticky top-0 z-20 -mx-5 mb-6 flex items-center justify-between gap-3 border-b border-ink/10 bg-paper/90 px-5 py-3 backdrop-blur md:-mx-10 md:px-10">
        <p className="text-sm text-ink-soft">{dirty ? <span className="text-clay">Kaydedilmemiş değişiklikler var</span> : "Tüm değişiklikler kaydedildi"}</p>
        <Btn icon="save" busy={busy} disabled={!dirty} onClick={save}>Kaydet</Btn>
      </div>

      <div className="space-y-5">
        <Section title="İletişim bilgileri" lead="Menü, alt bilgi, iletişim sayfası ve tüm “Ara” / “WhatsApp” düğmeleri bu bilgileri kullanır.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Telefon / WhatsApp" hint="Arama ve WhatsApp bu numarayı kullanır." htmlFor="ph"><input id="ph" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={fieldCls} inputMode="tel" /></Field>
            <Field label="E-posta" hint="Sayfada ve alt bilgide görünür." htmlFor="em"><input id="em" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={fieldCls} /></Field>
          </div>
          <Field label="Adres" htmlFor="ad"><input id="ad" value={f.address} onChange={(e) => set("address", e.target.value)} className={fieldCls} /></Field>
          <Field label="Instagram bağlantısı" htmlFor="ig"><input id="ig" type="url" value={f.instagram} onChange={(e) => set("instagram", e.target.value)} className={fieldCls} placeholder="https://www.instagram.com/…" /></Field>
        </Section>

        <Section title="Çalışma saatleri" lead="İletişim sayfasında, alt bilgide ve iletişim bandında listelenir.">
          <div>
            <div className="hidden grid-cols-[1fr_10rem_2.5rem] gap-3 px-1 pb-2 text-sm text-ink-soft sm:grid"><span>Günler</span><span>Saat</span><span /></div>
            <ul className="space-y-3">
              {f.hours.map((h, i) => (
                <li key={i} className="grid grid-cols-[1fr_2.5rem] items-center gap-3 sm:grid-cols-[1fr_10rem_2.5rem]">
                  <input aria-label="Günler" value={h.days} onChange={(e) => set("hours", f.hours.map((x, n) => (n === i ? { ...x, days: e.target.value } : x)))} className={fieldCls} placeholder="Pazartesi – Cumartesi" />
                  <input aria-label="Saat" value={h.time} onChange={(e) => set("hours", f.hours.map((x, n) => (n === i ? { ...x, time: e.target.value } : x)))} className={`${fieldCls} max-sm:order-3 max-sm:col-span-2`} placeholder="10:00 – 19:00" />
                  <button type="button" aria-label="Satırı sil" onClick={() => set("hours", f.hours.filter((_, n) => n !== i))} className="flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-[#7a2e22]/10 hover:text-[#7a2e22]"><Icon n="trash" /></button>
                </li>
              ))}
            </ul>
            {f.hours.length < 6 && <div className="mt-4"><Btn variant="line" size="sm" icon="plus" onClick={() => set("hours", [...f.hours, { days: "", time: "" }])}>Satır ekle</Btn></div>}
          </div>
        </Section>

        <Section title="Hakkımızda sayfası" lead="Hakkımızda sayfasındaki giriş, misyon, vizyon ve öne çıkan maddeler.">
          <Field label="Giriş metni" htmlFor="su"><textarea id="su" rows={3} value={f.about.support} onChange={(e) => setAbout({ support: e.target.value })} className={fieldCls} /></Field>
          <Field label="Misyonumuz" hint="Paragrafları boş satırla ayırın." htmlFor="mi"><textarea id="mi" rows={9} value={f.about.mission} onChange={(e) => setAbout({ mission: e.target.value })} className={fieldCls} /></Field>
          <Field label="Vizyonumuz" htmlFor="vi"><textarea id="vi" rows={5} value={f.about.vision} onChange={(e) => setAbout({ vision: e.target.value })} className={fieldCls} /></Field>
          <div>
            <p className="text-[0.9375rem] font-medium">Öne çıkan maddeler</p>
            <ul className="mt-2 space-y-3">
              {f.about.points.map((p, i) => (
                <li key={i} className="flex items-center gap-3">
                  <input aria-label={`Madde ${i + 1}`} value={p} onChange={(e) => setAbout({ points: f.about.points.map((x, n) => (n === i ? e.target.value : x)) })} className={fieldCls} />
                  <button type="button" aria-label="Maddeyi sil" onClick={() => setAbout({ points: f.about.points.filter((_, n) => n !== i) })} className="flex size-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-[#7a2e22]/10 hover:text-[#7a2e22]"><Icon n="trash" /></button>
                </li>
              ))}
            </ul>
            {f.about.points.length < 8 && <div className="mt-3"><Btn variant="line" size="sm" icon="plus" onClick={() => setAbout({ points: [...f.about.points, ""] })}>Madde ekle</Btn></div>}
          </div>
        </Section>
      </div>
    </div>
  );
}

/** Sol başlık + sağ alanlar: ayarlar dizili ve taranabilir durur. */
function Section({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 rounded-[1.75rem] border border-ink/10 bg-[#fbfaf8] p-6 md:p-8 lg:grid-cols-[15rem_1fr] lg:gap-14">
      <div>
        <h2 className="serif text-2xl">{title}</h2>
        <p className="mt-2 text-[0.9375rem] text-ink-soft">{lead}</p>
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}
