"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Slide } from "@/lib/hero";

const INTERVAL = 7500;
const HEADLINE = ["Değişim", "içeriden", "başlar."];

/* Logodaki gülümseme yayı: P0(10,14) P1(150,64) P2(290,14) */
const ARC = "M10 14 Q150 64 290 14";
const arcPoint = (t: number) => ({ x: (1 - t) ** 2 * 10 + 2 * (1 - t) * t * 150 + t ** 2 * 290, y: (1 - t) ** 2 * 14 + 2 * (1 - t) * t * 64 + t ** 2 * 14 });
const DOTS = [0.12, 0.5, 0.88].map(arcPoint);

/* Ankara saatine göre canlı çalışma durumu (Pzt–Cmt 10:00–19:00) */
function statusNow(): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = get("weekday");
  const mins = Number(get("hour")) % 24 * 60 + Number(get("minute"));
  const open = day !== "Sun" && mins >= 600 && mins < 1140;
  if (open) return "open|Şu an açığız · 19:00'a kadar";
  if (day !== "Sun" && mins < 600) return "closed|Şu an kapalıyız · bugün 10:00'da açılıyoruz";
  if (day === "Sat" || day === "Sun") return "closed|Şu an kapalıyız · Pazartesi 10:00'da açılıyoruz";
  return "closed|Şu an kapalıyız · yarın 10:00'da açılıyoruz";
}
const subscribeEdit = (cb: () => void) => { window.addEventListener("santa-edit", cb); return () => window.removeEventListener("santa-edit", cb); };
const subscribeClock = (cb: () => void) => { const t = setInterval(cb, 60_000); return () => clearInterval(t); };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [changed, setChanged] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [armed, setArmed] = useState(false); // 2. ve 3. slayt görselleri sayfa yüklendikten sonra istenir (ilk görselle yarışmasın)
  // Düzenleme modunda (yönetici) otomatik geçiş durur; mod EditorOverlay tarafından <html data-edit> ile bildirilir.
  const editing = useSyncExternalStore(subscribeEdit, () => document.documentElement.dataset.edit === "on", () => false);
  const [epoch, setEpoch] = useState(0); // yayı, zamanlayıcıyla aynı anda yeniden başlatır
  const touch = useRef<number | null>(null);
  const root = useRef<HTMLElement>(null);
  const raf = useRef(0);
  const status = useSyncExternalStore(subscribeClock, statusNow, () => null);

  const go = useCallback((n: number) => {
    const next = (n + slides.length) % slides.length;
    setI((cur) => { if (cur !== next) { setPrev(cur); setChanged(true); } return next; });
    setEpoch((e) => e + 1);
  }, [slides.length]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const arm = () => { t = setTimeout(() => setArmed(true), 1200); };
    if (document.readyState === "complete") arm(); else window.addEventListener("load", arm, { once: true });
    return () => { clearTimeout(t); window.removeEventListener("load", arm); };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => { setReduced(mq.matches); if (mq.matches) setPlaying(false); };
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const running = playing && !reduced && !editing;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => go(i + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [running, i, epoch, go]);

  /* İmleç: odayı aydınlatan ışık + hafif derinlik. Yeniden render yok, yalnızca CSS değişkenleri. */
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || reduced || !root.current) return;
    const el = root.current, r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.style.setProperty("--px", `${(0.5 - x / r.width) * 28}px`);
      el.style.setProperty("--py", `${(0.5 - y / r.height) * 18}px`);
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { go(i + 1); e.preventDefault(); }
    if (e.key === "ArrowLeft") { go(i - 1); e.preventDefault(); }
  };

  const [state, label] = status ? status.split("|") : ["", ""];

  return (
    <section
      data-hero
      ref={root}
      aria-roledescription="carousel"
      aria-label="Santa Psikoloji tanıtım"
      className="on-dark relative -mt-[5rem] flex min-h-[100svh] items-end overflow-hidden bg-ink text-paper"
      style={{ "--mx": "62%", "--my": "58%" } as React.CSSProperties}
      onPointerMove={onPointerMove}
      onKeyDown={onKey}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 48) go(i + (dx < 0 ? 1 : -1));
      }}
    >
      {/* Odalar: perde gibi açılan geçiş, yavaş yaklaşma, imleçle derinlik */}
      <div className="absolute inset-0" aria-hidden>
        {slides.map((s, n) => (
          <div key={s.id} className={`hero-layer absolute inset-0 ${n === i ? `is-active ${changed ? "wipe" : ""}` : n === prev ? "is-prev" : ""}`}>
            <div className="absolute -inset-8 transition-transform duration-700 ease-out will-change-transform" style={{ transform: "translate3d(var(--px, 0px), var(--py, 0px), 0)" }}>
              <div className="hero-img absolute inset-0">
                {(n === 0 || armed || n === i || n === prev) && (
                  <Image src={s.image} alt="" fill preload={n === 0} fetchPriority={n === 0 ? "high" : "low"} sizes="110vw" quality={75} className="object-cover" style={{ objectPosition: s.position }} />
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="absolute inset-0 z-[25]" data-ed-img={`hero.${slides[i].id}.image`} style={{ background: "linear-gradient(to top, rgba(24,19,16,0.72) 0%, rgba(24,19,16,0.38) 48%, rgba(24,19,16,0.12) 100%), radial-gradient(520px circle at var(--mx) var(--my), rgba(24,19,16,0), rgba(24,19,16,0.34))" }} />
      </div>

      <div className="container-page relative z-30 w-full pb-12 pt-40 lg:pb-14">
        <h1 className="display max-w-5xl text-[clamp(3.25rem,8.6vw,8.25rem)]" aria-label="Değişim içeriden başlar.">
          {HEADLINE.map((w, n) => (
            <span key={w} aria-hidden className="word-mask mr-[0.22em]"><span className="word" style={{ "--i": n } as React.CSSProperties}>{w}</span></span>
          ))}
        </h1>

        <div className="mt-10 grid max-w-2xl" aria-live={running ? "off" : "polite"}>
          {slides.map((s, n) => {
            const active = n === i;
            return (
              <div
                key={s.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${n + 1} / ${slides.length}: ${s.caption}`}
                aria-hidden={!active}
                inert={!active}
                className={`slide-copy col-start-1 row-start-1 ${active ? "is-active" : ""}`}
              >
                <h2 className="line serif text-balance text-[clamp(1.5rem,2.4vw,2.125rem)] leading-snug" style={{ "--l": 0 } as React.CSSProperties} data-ed={`hero.${s.id}.title`}>{s.title}</h2>
                <p className="line mt-3 max-w-xl text-xl text-paper/90" style={{ "--l": 1 } as React.CSSProperties} data-ed={`hero.${s.id}.text`}>{s.text}</p>
                <div className="line mt-8 flex flex-wrap gap-3" style={{ "--l": 2 } as React.CSSProperties}>
                  {s.cta.external ? (
                    <a href={s.cta.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full bg-paper px-6 font-medium text-ink transition-colors hover:bg-linen" data-ed={`hero.${s.id}.cta`}>{s.cta.label}</a>
                  ) : (
                    <Link href={s.cta.href} className="inline-flex min-h-12 items-center rounded-full bg-paper px-6 font-medium text-ink transition-colors hover:bg-linen" data-ed={`hero.${s.id}.cta`}>{s.cta.label}</Link>
                  )}
                  {s.secondary && (
                    <a href={s.secondary.href} className="inline-flex min-h-12 items-center rounded-full border border-paper/60 px-6 font-medium transition-colors hover:bg-paper hover:text-ink">{s.secondary.label}</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Alt şerit: canlı durum + logodaki gülümseme yayı */}
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6">
          <p className="inline-flex min-h-11 items-center gap-3 rounded-full bg-[rgba(24,19,16,0.45)] px-5 text-base" aria-live="polite">
            {status ? (
              <>
                <span aria-hidden className={`size-2.5 rounded-full ${state === "open" ? "bg-[#8fd69a]" : "bg-paper/50"}`} />
                {label}
              </>
            ) : (
              <span>Pzt – Cmt, 10:00 – 19:00</span>
            )}
          </p>

          <div className="flex items-center gap-3 rounded-full bg-[rgba(24,19,16,0.4)] py-1 pl-6 pr-1">
            <p className="hidden text-sm text-paper/90 sm:block" aria-hidden>{slides[i].caption}</p>
            <div className="relative h-14 w-[17rem]">
              <svg viewBox="0 0 300 60" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                <path d={ARC} pathLength={1} fill="none" stroke="rgba(242,241,238,0.3)" strokeWidth={3} strokeLinecap="round" />
                <path
                  key={`arc${i}-${epoch}`}
                  d={ARC}
                  pathLength={1}
                  fill="none"
                  stroke="#f2f1ee"
                  strokeWidth={3}
                  strokeLinecap="round"
                  className={playing && !reduced ? "smile-fill" : ""}
                  style={playing && !reduced ? { animationDuration: `${INTERVAL}ms` } : { strokeDasharray: 1, strokeDashoffset: 0 }}
                />
              </svg>
              {DOTS.map((d, n) => (
                <button
                  key={slides[n].id}
                  type="button"
                  onClick={() => go(n)}
                  aria-label={`${n + 1}. slayt: ${slides[n].caption}`}
                  aria-current={n === i}
                  className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                  style={{ left: `${(d.x / 300) * 100}%`, top: `${(d.y / 60) * 100}%` }}
                >
                  <span className={`block rounded-full bg-paper transition-all duration-500 ${n === i ? "size-4 ring-4 ring-paper/30" : "size-2.5 opacity-70 hover:opacity-100"}`} />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { setPlaying((p) => !p); setEpoch((e) => e + 1); }}
              aria-label={playing ? "Otomatik geçişi durdur" : "Otomatik geçişi başlat"}
              className="flex size-11 items-center justify-center rounded-full bg-[rgba(24,19,16,0.45)] transition-colors hover:bg-paper hover:text-ink"
            >
              {playing ? (
                <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1.5" width="3.2" height="11" rx="1" /><rect x="8.8" y="1.5" width="3.2" height="11" rx="1" /></svg>
              ) : (
                <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.8v10.4a.8.8 0 0 0 1.2.7l8.2-5.2a.8.8 0 0 0 0-1.4L4.2 1.1A.8.8 0 0 0 3 1.8Z" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Kaydır ipucu */}
      <div aria-hidden className="absolute bottom-6 right-6 z-30 hidden h-14 w-px overflow-hidden bg-paper/20 lg:block xl:right-10">
        <span className="cue-line block h-full w-full bg-paper" />
      </div>
    </section>
  );
}
