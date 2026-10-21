"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, fieldCls } from "@/components/panel/kit";

export function Login({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api("POST", "/panel/api/login", { username: user, password: pass });
      router.refresh();
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  }

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[1.05fr_1fr]">
      <aside className="on-dark relative hidden overflow-hidden bg-moss-deep p-14 text-paper lg:flex lg:flex-col lg:justify-between">
        <Image src="/images/SANTA_LOGO.png" alt="Santa Psikoloji" width={404} height={188} className="h-14 w-auto self-start brightness-0 invert" priority />
        <div className="relative z-10">
          <h1 className="display text-[clamp(3rem,5vw,4.75rem)]">Hoş geldiniz.</h1>
          <p className="mt-6 max-w-md text-xl text-paper/75">Blog yazılarını, sayfa metinlerini, görselleri ve danışanlardan gelen mesajları buradan yönetin.</p>
        </div>
        <svg aria-hidden viewBox="0 0 300 60" className="absolute -bottom-6 -right-10 w-[34rem] opacity-[0.12]"><path d="M10 14 Q150 64 290 14" fill="none" stroke="#f2f1ee" strokeWidth="3" strokeLinecap="round" /></svg>
        <p className="relative z-10 text-sm text-paper/50">© {new Date().getFullYear()} Santa Eğitim ve Danışmanlık</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-14">
        <div className="pn-fade w-full max-w-md">
          <Image src="/images/SANTA_LOGO.png" alt="Santa Psikoloji" width={404} height={188} className="mb-10 h-12 w-auto lg:hidden" priority />
          <h2 className="display text-4xl">Yönetici girişi</h2>
          <p className="mt-3 text-ink-soft">Devam etmek için kullanıcı adınızı ve şifrenizi girin.</p>

          {!configured && (
            <p role="alert" className="mt-6 rounded-2xl bg-[#7a2e22]/10 p-4 text-[#7a2e22]">Panel henüz yapılandırılmadı. Sunucuda <code>PANEL_USER</code>, <code>PANEL_PASS</code> ve <code>PANEL_SECRET</code> ayarlanmalı.</p>
          )}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="u" className="font-medium">Kullanıcı adı</label>
              <input id="u" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={user} onChange={(e) => setUser(e.target.value)} className={`${fieldCls} mt-2`} />
            </div>
            <div>
              <label htmlFor="p" className="font-medium">Şifre</label>
              <div className="relative mt-2">
                <input id="p" name="password" type={show ? "text" : "password"} autoComplete="current-password" required value={pass} onChange={(e) => setPass(e.target.value)} className={`${fieldCls} pr-24`} aria-describedby={err ? "login-err" : undefined} />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm text-ink-soft hover:bg-ink/5 hover:text-ink">{show ? "Gizle" : "Göster"}</button>
              </div>
            </div>
            {err && <p id="login-err" role="alert" className="text-[#7a2e22]">{err}</p>}
            <button type="submit" disabled={busy || !configured} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clay font-medium text-paper transition-colors hover:bg-clay-deep disabled:opacity-60">
              {busy && <span className="pn-spin size-4 rounded-full border-2 border-paper border-t-transparent" aria-hidden />}
              {busy ? "Giriş yapılıyor…" : "Giriş yap"}
            </button>
          </form>
          <Link href="/" className="mt-8 inline-block text-ink-soft underline-offset-4 hover:text-clay hover:underline">← Siteye dön</Link>
        </div>
      </main>
    </div>
  );
}
