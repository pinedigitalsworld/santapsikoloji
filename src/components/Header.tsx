"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/lib/site";

export type MenuGroup = { id: string; title: string; lead: string; items: { slug: string; title: string }[] };

const Arrow = () => (
  <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export type HeaderContact = { whatsapp: string; phoneHref: string };

export function Header({ groups, site }: { groups: MenuGroup[]; site: HeaderContact }) {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const pathname = usePathname();
  const btn = useRef<HTMLButtonElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [overHeroRaw, setOverHero] = useState(false);
  const overHero = overHeroRaw && !open; // menü açıkken çubuk açık zeminde okunur

  // Fotoğraflı bir hero ([data-hero]) üzerindeyken koyu cam, aşağıda açık cam.
  useEffect(() => {
    const update = () => { const hero = document.querySelector("[data-hero]"); setOverHero(Boolean(hero) && hero!.getBoundingClientRect().bottom > 96); };
    const first = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(first); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMega(false);
      if (open) { setOpen(false); btn.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const openMega = () => { clearTimeout(closeTimer.current); setMega(true); };
  const closeMega = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setMega(false), 140); };

  return (
    <>
      <a href="#icerik" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper">
        İçeriğe geç
      </a>
      <header className="sticky top-3 z-50 mt-3">
        <div ref={shell} className="container-page relative" onMouseLeave={closeMega}
          onBlur={(e) => { if (!shell.current?.contains(e.relatedTarget as Node)) setMega(false); }}>
          <div className={`flex h-16 items-center justify-between gap-6 rounded-full border pl-6 pr-2.5 backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-500 ${overHero ? "border-white/25 bg-[rgba(24,19,16,0.3)] text-paper" : "border-white/60 bg-paper/65 shadow-[0_10px_40px_-18px_rgba(34,29,27,0.3)]"}`}>
            <Link href="/" aria-label="Santa Psikoloji, ana sayfa" className="shrink-0" onClick={() => setMega(false)}>
              <Image src="/images/SANTA_LOGO.png" alt="Santa Psikoloji" width={404} height={188} priority className={`h-10 w-auto transition-[filter] duration-500 ${overHero ? "brightness-0 invert" : ""}`} />
            </Link>
            <nav aria-label="Ana menü" className="hidden items-center gap-0.5 lg:flex">
              {nav.map((n) => {
                const isServices = n.href === "/hizmetlerimiz";
                return (
                  <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
                    {...(isServices ? { "aria-haspopup": "true" as const, "aria-expanded": mega, onMouseEnter: openMega, onFocus: openMega } : { onMouseEnter: closeMega })}
                    onClick={() => setMega(false)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-base transition-colors ${overHero ? "hover:bg-white/15" : "hover:bg-ink/5"} ${active(n.href) || (isServices && mega) ? (overHero ? "bg-white/20" : "bg-ink/5 text-clay-deep") : ""}`}>
                    {n.label}
                    {isServices && (
                      <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${mega ? "rotate-180" : ""}`}>
                        <path d="m1.5 3.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2">
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer"
                className={`hidden min-h-11 items-center rounded-full px-5 text-base font-medium transition-colors sm:inline-flex ${overHero ? "bg-paper text-ink hover:bg-linen" : "bg-clay text-paper hover:bg-clay-deep"}`}>
                Randevu Al
              </a>
              <button ref={btn} type="button" aria-expanded={open} aria-controls="mobil-menu" aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
                onClick={() => setOpen((o) => !o)}
                className={`flex size-11 items-center justify-center rounded-full lg:hidden ${overHero ? "bg-white/20" : "bg-ink/5"}`}>
                <span aria-hidden className="relative block h-3 w-5">
                  <span className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-transform ${open ? "top-[5px] rotate-45" : "top-0"}`} />
                  <span className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-transform ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
                </span>
              </button>
            </div>
          </div>

          {/* Mega menü: tüm hizmetler yalnızca burada ve /hizmetlerimiz sayfasında listelenir */}
          {mega && (
            <div className="absolute inset-x-0 top-full hidden pt-3 lg:block" onMouseEnter={openMega}>
              <div className="mega-in rounded-[2rem] bg-paper/95 p-8 backdrop-blur-2xl shadow-[0_30px_80px_-30px_rgba(34,29,27,0.45)]">
                <div className="grid gap-x-10 gap-y-8 lg:grid-cols-4">
                  {groups.map((g) => (
                    <section key={g.id} aria-labelledby={`mm-${g.id}`}>
                      <h2 id={`mm-${g.id}`} className="serif text-2xl">
                        <Link href={`/hizmetlerimiz#${g.id}`} onClick={() => setMega(false)} className="hover:text-clay">{g.title}</Link>
                      </h2>
                      <ul className="mt-4 space-y-0.5">
                        {g.items.map((s) => (
                          <li key={s.slug}>
                            <Link href={`/hizmetlerimiz/${s.slug}`} onClick={() => setMega(false)}
                              className="-mx-3 block rounded-xl px-3 py-1.5 text-[0.97rem] text-ink-soft transition-colors hover:bg-linen hover:text-ink">{s.title}</Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-between gap-6 rounded-2xl bg-linen px-6 py-4">
                  <p className="text-ink-soft">Hangi hizmetin size uygun olduğundan emin değil misiniz? Birlikte karar verelim.</p>
                  <div className="flex shrink-0 items-center gap-5">
                    <Link href="/hizmetlerimiz" onClick={() => setMega(false)} className="inline-flex items-center gap-2 text-clay underline-offset-4 hover:underline">Tüm hizmetler <Arrow /></Link>
                    <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full bg-clay px-5 font-medium text-paper hover:bg-clay-deep">Bize yazın</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {open && (
        <div id="mobil-menu" className="fixed inset-0 z-[45] overflow-y-auto bg-paper pt-24 lg:hidden">
          <nav aria-label="Mobil menü" className="container-page flex min-h-full flex-col pb-10">
            <ul className="space-y-1">
              {nav.map((n) =>
                n.href === "/hizmetlerimiz" ? (
                  <li key={n.href}>
                    <details className="group rounded-2xl open:bg-linen/70">
                      <summary className="serif flex min-h-14 cursor-pointer items-center justify-between rounded-2xl px-4 text-2xl">
                        {n.label}<span aria-hidden className="chev text-2xl text-clay">+</span>
                      </summary>
                      <div className="space-y-5 px-4 pb-5 pt-1">
                        {groups.map((g) => (
                          <section key={g.id}>
                            <h2 className="text-sm text-ink-soft">{g.title}</h2>
                            <ul className="mt-1">
                              {g.items.map((s) => (
                                <li key={s.slug}><Link href={`/hizmetlerimiz/${s.slug}`} onClick={() => setOpen(false)} className="block py-2 text-[1.05rem]">{s.title}</Link></li>
                              ))}
                            </ul>
                          </section>
                        ))}
                        <Link href="/hizmetlerimiz" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center gap-2 text-clay">Tüm hizmetler <Arrow /></Link>
                      </div>
                    </details>
                  </li>
                ) : (
                  <li key={n.href}>
                    <Link href={n.href} aria-current={active(n.href) ? "page" : undefined} onClick={() => setOpen(false)}
                      className={`serif flex min-h-14 items-center rounded-2xl px-4 text-2xl ${active(n.href) ? "bg-linen text-clay-deep" : ""}`}>{n.label}</Link>
                  </li>
                ),
              )}
            </ul>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
              <a href={site.phoneHref} className="flex min-h-12 items-center justify-center rounded-full bg-linen font-medium">Ara</a>
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-full bg-clay font-medium text-paper">Randevu Al</a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
