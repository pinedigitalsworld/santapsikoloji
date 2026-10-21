"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Btn, BodyField, Card, ConfirmBtn, Field, ImageField, api, fieldCls, useToast } from "@/components/panel/kit";

type Item = { slug: string; title: string; text: string; image: string; role?: string; position?: string; group?: string };

const empty = (group?: string): Item => ({ slug: "", title: "", text: "", image: "", role: "", position: "50% 25%", group });

/** Hizmet ve psikolog kayıtlarını ekler, düzenler, siler. `team` için unvan ve fotoğraf odak noktası da gösterilir. */
export function ItemEditor({ collection, item, groups, backHref, backLabel, titleLabel, noun }: {
  collection: "services" | "team"; item?: Item; groups?: { id: string; title: string }[];
  backHref: string; backLabel: string; titleLabel: string; noun: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const team = collection === "team";
  const isNew = !item;
  const start = item ?? empty(groups?.[0]?.id);
  const [f, setF] = useState(start);
  const [saved, setSaved] = useState(JSON.stringify(start));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Item>(k: K, v: Item[K]) => setF((p) => ({ ...p, [k]: v }));
  const dirty = JSON.stringify(f) !== saved;
  const [px, py] = (f.position ?? "50% 25%").split(" ").map((v) => parseInt(v, 10) || 0);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    if (!f.title.trim()) { toast(team ? "Lütfen ad soyad yazın." : "Lütfen hizmet adını yazın.", "err"); return; }
    if (!f.text.trim()) { toast("İçerik boş olamaz.", "err"); return; }
    if (team && !f.image) { toast("Lütfen bir fotoğraf seçin.", "err"); return; }
    setBusy(true);
    try {
      const body = team
        ? { title: f.title, role: f.role, photo: f.image, position: f.position, text: f.text }
        : { title: f.title, image: f.image, text: f.text, group: f.group };
      if (isNew) {
        const r = await api<{ slug: string }>("POST", `/panel/api/c/${collection}`, body);
        setSaved(JSON.stringify(f));
        toast(`${noun} eklendi ve sitede yayında`);
        router.replace(`${backHref}/${r.slug}`);
      } else {
        await api("PUT", `/panel/api/c/${collection}/${f.slug}`, body);
        setSaved(JSON.stringify(f));
        toast("Değişiklikler sitede yayında");
        router.refresh();
      }
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  }

  return (
    <div className="pn-fade">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href={backHref} className="inline-flex items-center gap-2 text-ink-soft hover:text-clay"><span aria-hidden>←</span> {backLabel}</Link>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-sm text-clay">Kaydedilmemiş değişiklikler var</span>}
          <Btn icon="save" busy={busy} disabled={!dirty} onClick={save}>{isNew ? `${noun} ekle` : "Kaydet"}</Btn>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
        <div className="min-w-0 space-y-6">
          <Card className="space-y-6">
            <Field label={titleLabel} htmlFor="t"><input id="t" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={200} className={fieldCls} /></Field>
            {team && <Field label="Unvan" hint="Örn. Klinik Psikolog · Aile Danışmanı" htmlFor="r"><input id="r" value={f.role ?? ""} onChange={(e) => set("role", e.target.value)} maxLength={100} className={fieldCls} /></Field>}
            {!team && groups && (
              <Field label="Hizmet grubu" hint="Hizmetin sitede hangi başlık altında görüneceğini belirler." htmlFor="g">
                <select id="g" value={f.group} onChange={(e) => set("group", e.target.value)} className={fieldCls}>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </Field>
            )}
          </Card>
          <div>
            <p className="mb-2 px-1 text-[0.9375rem] font-medium">{team ? "Özgeçmiş ve çalışma alanları" : "Sayfa içeriği"}</p>
            <BodyField value={f.text} onChange={(v) => set("text", v)} minHeight="min-h-[28rem]" placeholder={"Paragrafları boş satırla ayırın.\nBaşlık için satırı seçip “Başlık” düğmesine basın."} />
          </div>
        </div>
        <aside className="space-y-6">
          <Card className="p-6!">
            <ImageField label={team ? "Fotoğraf" : "Kapak görseli"} value={f.image} onChange={(v) => set("image", v)} aspect={team ? "aspect-[4/5]" : "aspect-[4/3]"} position={f.position} />
          </Card>
          {team && f.image && (
            <Card className="space-y-4 p-6!">
              <div>
                <h2 className="serif text-xl">Fotoğraf odak noktası</h2>
                <p className="text-sm text-ink-soft">Kart ve sayfada fotoğrafın hangi bölümünün görüneceğini ayarlayın. Önizleme yukarıda güncellenir.</p>
              </div>
              <Field label={`Yatay: %${px}`}><input type="range" min={0} max={100} value={px} onChange={(e) => set("position", `${e.target.value}% ${py}%`)} className="w-full accent-clay" /></Field>
              <Field label={`Dikey: %${py}`}><input type="range" min={0} max={100} value={py} onChange={(e) => set("position", `${px}% ${e.target.value}%`)} className="w-full accent-clay" /></Field>
            </Card>
          )}
          {!isNew && (
            <Card className="p-6!">
              <p className="text-sm text-ink-soft">Adres: <span className="break-all">/{team ? "psikologlarimiz" : "hizmetlerimiz"}/{f.slug}</span></p>
              <div className="mt-4">
                <ConfirmBtn size="md" label={`Evet, ${noun.toLowerCase()} sil`} onConfirm={async () => {
                  try { await api("DELETE", `/panel/api/c/${collection}/${f.slug}`); setSaved(JSON.stringify(f)); toast(`${noun} silindi`); router.replace(backHref); }
                  catch (e) { toast((e as Error).message, "err"); }
                }}>{noun} sil</ConfirmBtn>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
