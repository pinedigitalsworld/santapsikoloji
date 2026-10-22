"use client";

import Link from "next/link";
import { useState } from "react";

/** Mesaj sunucuya kaydedilir ve yönetim panelindeki "Mesajlar" bölümüne düşer. */
export function ContactForm({ whatsapp }: { whatsapp: string }) {
  const [v, setV] = useState({ name: "", phone: "", email: "", message: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.name.trim() || !v.message.trim()) { setErr("Lütfen adınızı ve mesajınızı yazın."); return; }
    if (!v.phone.trim() && !v.email.trim()) { setErr("Size dönebilmemiz için telefon ya da e-posta bırakın."); return; }
    if (!consent) { setErr("Devam etmek için aydınlatma metnini onaylamanız gerekir."); return; }
    setErr(""); setBusy(true);
    try {
      const res = await fetch("/api/iletisim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...v, consent }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      setSent(true);
    } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  }

  if (sent) {
    return (
      <div role="status" className="py-4">
        <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-moss text-paper">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <h3 className="serif mt-5 text-3xl">Mesajınız bize ulaştı.</h3>
        <p className="mt-3 text-ink-soft">En kısa sürede sizinle iletişime geçeceğiz. Acil bir durumda WhatsApp’tan da yazabilirsiniz.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full bg-clay px-6 font-medium text-paper transition-colors hover:bg-clay-deep">WhatsApp’tan yazın</a>
          <button type="button" onClick={() => { setSent(false); setV({ name: "", phone: "", email: "", message: "", website: "" }); setConsent(false); }} className="inline-flex min-h-12 items-center rounded-full border border-ink/25 px-6 font-medium transition-colors hover:bg-ink hover:text-paper">Yeni mesaj yaz</button>
        </div>
      </div>
    );
  }

  const field = "mt-2 w-full rounded-xl border border-ink/25 bg-paper px-4 py-3 text-ink placeholder:text-ink-soft/70 focus:border-clay";
  const d = err ? "form-hata" : undefined;
  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div>
        <label htmlFor="ad" className="font-medium">Adınız</label>
        <input id="ad" name="ad" autoComplete="name" required maxLength={80} value={v.name} onChange={set("name")} className={field} aria-describedby={d} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="tel" className="font-medium">Telefon</label>
          <input id="tel" name="tel" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} value={v.phone} onChange={set("phone")} className={field} aria-describedby={d} />
        </div>
        <div>
          <label htmlFor="eposta" className="font-medium">E-posta</label>
          <input id="eposta" name="eposta" type="email" autoComplete="email" maxLength={120} value={v.email} onChange={set("email")} className={field} aria-describedby={d} />
        </div>
      </div>
      <p className="-mt-3 text-sm text-ink-soft">Size dönebilmemiz için telefon ya da e-postadan birini yazmanız yeterli.</p>
      <div>
        <label htmlFor="mesaj" className="font-medium">Mesajınız</label>
        <textarea id="mesaj" name="mesaj" rows={5} required maxLength={2000} value={v.message} onChange={set("message")} className={field} placeholder="Nasıl yardımcı olabiliriz?" aria-describedby={d} />
      </div>
      <label className="flex items-start gap-3 text-base">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1.5 size-5 shrink-0 accent-clay" aria-describedby={d} />
        <span><Link href="/gizlilik" className="underline underline-offset-4 hover:text-clay" target="_blank">Gizlilik ve KVKK aydınlatma metnini</Link> okudum; verilerimin talebime yanıt verilmesi amacıyla işlenmesini kabul ediyorum.</span>
      </label>
      {/* Bal küpü: insanlar görmez, botlar doldurur. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Web sitesi<input tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} /></label>
      </div>
      {err && <p id="form-hata" role="alert" className="text-clay-deep">{err}</p>}
      <button type="submit" disabled={busy} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-clay px-7 font-medium text-paper transition-colors hover:bg-clay-deep disabled:opacity-60">
        {busy && <span className="pn-spin size-4 rounded-full border-2 border-paper border-t-transparent" aria-hidden />}
        {busy ? "Gönderiliyor…" : "Mesajı gönder"}
      </button>
      <p className="text-base text-ink-soft">Mesajınız yalnızca Santa Psikoloji ekibi tarafından görülür. Lütfen mesaja ayrıntılı sağlık bilgisi yazmayın, bunları görüşmede konuşabiliriz.</p>
    </form>
  );
}
