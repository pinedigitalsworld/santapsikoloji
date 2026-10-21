"use client";

import { useEffect, useRef, useState } from "react";

/** Telefonlarda iki hızlı iletişim eylemi. İçeriği örtmemesi için yukarı kaydırınca görünür, aşağı kaydırınca gizlenir. */
export function MobileCta({ site }: { site: { whatsapp: string; phoneHref: string } }) {
  const [show, setShow] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY, dy = y - last.current;
        if (Math.abs(dy) < 8) return;
        setShow(dy < 0 && y > 240);
        last.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-full bg-paper p-2 shadow-[0_12px_40px_-12px_rgba(34,29,27,0.5)] transition-[transform,opacity] duration-300 sm:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0"}`}
      aria-hidden={!show}
    >
      <a href={site.phoneHref} tabIndex={show ? 0 : -1} className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-linen font-medium">Ara</a>
      <a href={site.whatsapp} tabIndex={show ? 0 : -1} target="_blank" rel="noopener noreferrer" className="flex min-h-12 flex-[1.4] items-center justify-center rounded-full bg-clay font-medium text-paper">WhatsApp ile randevu</a>
    </div>
  );
}
