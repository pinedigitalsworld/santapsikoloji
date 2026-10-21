"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/panel/icons";
import { Btn, ConfirmBtn, api, useToast } from "@/components/panel/kit";
import type { Message } from "@/lib/store";

const when = (iso: string) => new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
const short = (iso: string) => {
  const d = new Date(iso), n = new Date();
  return d.toDateString() === n.toDateString() ? d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }) : d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
};
const digits = (p: string) => { const d = p.replace(/\D/g, ""); return d.startsWith("90") ? d : d.startsWith("0") ? `90${d.slice(1)}` : `90${d}`; };

export function Inbox({ messages, initialId }: { messages: Message[]; initialId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [sel, setSel] = useState<string | null>(initialId && messages.some((m) => m.id === initialId) ? initialId : null);
  const [busy, setBusy] = useState(false);

  const list = filter === "unread" ? messages.filter((m) => !m.read) : messages;
  const current = messages.find((m) => m.id === sel) ?? null;
  const unread = messages.filter((m) => !m.read).length;

  async function mark(id: string, read: boolean) {
    try { await api("PATCH", `/panel/api/messages/${id}`, { read }); router.refresh(); } catch (e) { toast((e as Error).message, "err"); }
  }
  async function open(m: Message) {
    setSel(m.id);
    if (!m.read) await mark(m.id, true);
  }
  async function remove(id: string) {
    setBusy(true);
    try { await api("DELETE", `/panel/api/messages/${id}`); setSel(null); toast("Mesaj silindi"); router.refresh(); }
    catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  }
  async function readAll() {
    try { await api("PATCH", "/panel/api/messages"); toast("Hepsi okundu olarak işaretlendi"); router.refresh(); } catch (e) { toast((e as Error).message, "err"); }
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-ink/20 p-16 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-linen text-clay"><Icon n="inbox" size={26} /></span>
        <p className="serif mt-5 text-2xl">Henüz mesaj yok</p>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">Sitedeki iletişim formunu dolduran ziyaretçilerin mesajları burada, bildirimiyle birlikte görünecek.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
      <div className={`${current ? "hidden lg:block" : ""}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex rounded-full bg-ink/5 p-1 text-sm">
            {([["all", `Tümü (${messages.length})`], ["unread", `Okunmamış (${unread})`]] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-full px-4 py-1.5 font-medium transition-colors ${filter === k ? "bg-paper shadow-sm" : "text-ink-soft"}`}>{l}</button>
            ))}
          </div>
          {unread > 0 && <button type="button" onClick={readAll} className="text-sm text-clay hover:underline">Hepsini okundu yap</button>}
        </div>
        <ul className="space-y-2">
          {list.length === 0 && <li className="rounded-2xl p-6 text-center text-ink-soft">Okunmamış mesaj yok.</li>}
          {list.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => open(m)} aria-current={m.id === sel} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${m.id === sel ? "border-clay bg-white" : "border-ink/10 bg-[#fbfaf8] hover:border-ink/25"}`}>
                <span className={`mt-2 size-2.5 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-clay"}`} aria-label={m.read ? undefined : "Okunmamış"} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3"><b className={m.read ? "font-medium" : "font-semibold"}>{m.name}</b><span className="shrink-0 text-xs text-ink-soft">{short(m.createdAt)}</span></span>
                  <span className="mt-0.5 line-clamp-2 text-[0.95rem] text-ink-soft">{m.message}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${current ? "" : "hidden lg:block"}`}>
        {!current ? (
          <div className="flex h-full min-h-[24rem] items-center justify-center rounded-[1.75rem] border border-dashed border-ink/15 text-ink-soft">Okumak için soldan bir mesaj seçin</div>
        ) : (
          <article key={current.id} className="pn-fade rounded-[1.75rem] border border-ink/10 bg-[#fbfaf8] p-6 md:p-9">
            <button type="button" onClick={() => setSel(null)} className="mb-5 inline-flex items-center gap-2 text-ink-soft hover:text-clay lg:hidden"><span aria-hidden>←</span> Mesajlara dön</button>
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="display text-3xl md:text-4xl">{current.name}</h2>
                <p className="mt-1 text-ink-soft">{when(current.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Btn variant="line" size="sm" onClick={() => mark(current.id, !current.read)}>{current.read ? "Okunmadı yap" : "Okundu yap"}</Btn>
                <ConfirmBtn busy={busy} onConfirm={() => remove(current.id)}>Sil</ConfirmBtn>
              </div>
            </header>

            <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
              {current.phone && <div><dt className="text-sm text-ink-soft">Telefon</dt><dd><a href={`tel:${current.phone.replace(/[^\d+]/g, "")}`} className="underline underline-offset-4 hover:text-clay">{current.phone}</a></dd></div>}
              {current.email && <div><dt className="text-sm text-ink-soft">E-posta</dt><dd><a href={`mailto:${current.email}`} className="underline underline-offset-4 hover:text-clay">{current.email}</a></dd></div>}
            </dl>

            <p className="mt-7 whitespace-pre-wrap rounded-2xl bg-white/70 p-5 text-[1.0625rem] leading-relaxed md:p-6">{current.message}</p>

            <div className="mt-7 flex flex-wrap gap-2">
              {current.phone && (
                <>
                  <a href={`tel:${current.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-clay px-6 font-medium text-paper hover:bg-clay-deep"><Icon n="phone" size={17} />Ara</a>
                  <a href={`https://wa.me/${digits(current.phone)}?text=${encodeURIComponent(`Merhaba ${current.name}, Santa Psikoloji'den yazıyorum. `)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-moss px-6 font-medium text-paper hover:bg-moss-deep"><Icon n="whatsapp" size={17} />WhatsApp</a>
                </>
              )}
              {current.email && <a href={`mailto:${current.email}?subject=${encodeURIComponent("Santa Psikoloji")}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/20 px-6 font-medium hover:bg-ink hover:text-paper"><Icon n="mail" size={17} />E-posta yaz</a>}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
