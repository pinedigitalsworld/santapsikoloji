"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Btn, Card, ConfirmBtn, Field, api, fieldCls, useToast } from "@/components/panel/kit";

type T = { slug: string; name: string; text: string };

function Row({ t }: { t: T }) {
  const router = useRouter();
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(t.name);
  const [text, setText] = useState(t.text);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try { await api("PUT", `/panel/api/c/testimonials/${t.slug}`, { title: name, text }); toast("Yorum güncellendi"); setEdit(false); router.refresh(); }
    catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  }
  async function remove() {
    setBusy(true);
    try { await api("DELETE", `/panel/api/c/testimonials/${t.slug}`); toast("Yorum silindi"); router.refresh(); }
    catch (e) { toast((e as Error).message, "err"); setBusy(false); }
  }

  return (
    <li className="rounded-[1.5rem] border border-ink/10 bg-[#fbfaf8] p-5 md:p-6">
      {edit ? (
        <div className="space-y-4">
          <Field label="Ad"><input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} className={fieldCls} /></Field>
          <Field label="Yorum"><textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} maxLength={4000} className={fieldCls} /></Field>
          <div className="flex gap-2"><Btn busy={busy} onClick={save} icon="check">Kaydet</Btn><Btn variant="ghost" onClick={() => { setEdit(false); setName(t.name); setText(t.text); }}>Vazgeç</Btn></div>
        </div>
      ) : (
        <>
          <p className="serif text-lg leading-relaxed">“{t.text}”</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-ink-soft">{t.name}</span>
            <div className="flex gap-1"><Btn variant="line" size="sm" icon="pen" onClick={() => setEdit(true)}>Düzenle</Btn><ConfirmBtn busy={busy} onConfirm={remove}>Sil</ConfirmBtn></div>
          </div>
        </>
      )}
    </li>
  );
}

export function TestimonialsManager({ items }: { items: T[] }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    try { await api("POST", "/panel/api/c/testimonials", { title: name, text }); setName(""); setText(""); toast("Yorum eklendi"); router.refresh(); }
    catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="serif text-2xl">Yeni yorum ekle</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-[16rem_1fr]">
          <Field label="Danışan adı" hint="Örn. E.K. ya da Ayşe H." htmlFor="n"><input id="n" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} className={fieldCls} /></Field>
          <Field label="Yorum" htmlFor="y"><textarea id="y" rows={4} value={text} onChange={(e) => setText(e.target.value)} maxLength={4000} className={fieldCls} /></Field>
        </div>
        <div className="mt-5"><Btn icon="plus" busy={busy} onClick={add}>Yorumu ekle</Btn></div>
      </Card>
      <div>
        <h2 className="serif mb-4 text-2xl">Yayındaki yorumlar <span className="text-ink-soft">({items.length})</span></h2>
        <ul className="grid gap-4 lg:grid-cols-2">{items.map((t) => <Row key={t.slug} t={t} />)}</ul>
      </div>
    </div>
  );
}
