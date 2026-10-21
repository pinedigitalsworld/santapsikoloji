"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/panel/icons";
import { Btn, BodyField, Card, ConfirmBtn, Field, ImageField, Toggle, api, fieldCls, useToast } from "@/components/panel/kit";
import { readingMinutes, summarize } from "@/lib/text";

type Post = { slug: string; title: string; text: string; date: string; image: string; published: boolean; summary: string };

const today = () => new Date().toISOString().slice(0, 10);

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !post;
  const initial: Post = post ?? { slug: "", title: "", text: "", date: today(), image: "", published: true, summary: "" };
  const [f, setF] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Post>(k: K, v: Post[K]) => setF((p) => ({ ...p, [k]: v }));
  const dirty = JSON.stringify(f) !== saved;

  const minutes = readingMinutes(f.text);
  const autoSummary = useMemo(() => summarize(f.text, 190), [f.text]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    if (!f.title.trim()) { toast("Lütfen bir başlık yazın.", "err"); return; }
    if (!f.text.trim()) { toast("Yazı içeriği boş olamaz.", "err"); return; }
    setBusy(true);
    try {
      const body = { title: f.title, text: f.text, date: f.date, published: f.published, summary: f.summary, image: f.image };
      if (isNew) {
        const r = await api<{ slug: string }>("POST", "/panel/api/c/posts", body);
        setSaved(JSON.stringify(f));
        toast(f.published ? "Yazı yayınlandı" : "Taslak kaydedildi");
        router.replace(`/panel/blog/${r.slug}`);
      } else {
        await api("PUT", `/panel/api/c/posts/${f.slug}`, body);
        setSaved(JSON.stringify(f));
        toast(f.published ? "Değişiklikler yayında" : "Taslak güncellendi");
        router.refresh();
      }
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (!busy) void save(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const label = f.published ? (isNew ? "Yayınla" : "Güncelle") : "Taslağı kaydet";

  return (
    <div className="pn-fade">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/panel/blog" className="inline-flex items-center gap-2 text-ink-soft hover:text-clay"><span aria-hidden>←</span> Tüm yazılar</Link>
        <div className="flex flex-wrap items-center gap-3">
          {dirty && <span className="text-sm text-clay">Kaydedilmemiş değişiklikler var</span>}
          {!isNew && f.published && <a href={`/blog/${f.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-ink-soft hover:bg-ink/5"><Icon n="eye" size={17} />Sitede gör</a>}
          <Btn icon="save" busy={busy} onClick={save}>{label}</Btn>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <label htmlFor="t" className="sr-only">Yazı başlığı</label>
            <textarea id="t" rows={2} value={f.title} onChange={(e) => set("title", e.target.value.replace(/\n/g, " "))} placeholder="Yazı başlığı" maxLength={200} className="display w-full resize-none bg-transparent text-[clamp(1.75rem,3.2vw,2.75rem)] placeholder:text-ink-soft/40 focus:outline-none" />
          </Card>

          <BodyField value={f.text} onChange={(v) => set("text", v)} minHeight="min-h-[32rem]" placeholder={"Yazınızı buraya yazın.\n\nParagrafları boş satırla ayırın. Başlık için satırı seçip “Başlık” düğmesine basın."} />
          <p className="px-2 text-sm text-ink-soft">{f.text.trim() ? f.text.trim().split(/\s+/).length : 0} kelime · yaklaşık {minutes} dk okuma</p>
        </div>

        <aside className="space-y-6">
          <Card className="p-6!">
            <h2 className="serif text-xl">Yayın</h2>
            <div className="mt-5 space-y-5">
              <Toggle checked={f.published} onChange={(v) => set("published", v)} label={f.published ? "Yayında" : "Taslak (sitede görünmez)"} />
              <Field label="Yayın tarihi" htmlFor="d"><input id="d" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className={fieldCls} /></Field>
            </div>
          </Card>
          <Card className="p-6!"><ImageField label="Kapak görseli" value={f.image} onChange={(v) => set("image", v)} aspect="aspect-[4/3]" /></Card>
          <Card className="p-6!">
            <Field label="Kısa özet" hint="Boş bırakırsanız yazının ilk paragrafından otomatik oluşturulur." htmlFor="s">
              <textarea id="s" rows={4} maxLength={400} value={f.summary} onChange={(e) => set("summary", e.target.value)} placeholder={autoSummary || "Liste kartlarında görünen kısa metin"} className={fieldCls} />
            </Field>
          </Card>
          {!isNew && (
            <Card className="p-6!">
              <p className="text-sm text-ink-soft">Adres: <span className="break-all">/blog/{f.slug}</span></p>
              <div className="mt-4">
                <ConfirmBtn label="Evet, yazıyı sil" size="md" onConfirm={async () => {
                  try { await api("DELETE", `/panel/api/c/posts/${f.slug}`); setSaved(JSON.stringify(f)); toast("Yazı silindi"); router.replace("/panel/blog"); }
                  catch (e) { toast((e as Error).message, "err"); }
                }}>Yazıyı sil</ConfirmBtn>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
