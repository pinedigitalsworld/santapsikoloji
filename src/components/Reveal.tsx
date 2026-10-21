"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Görünür alana girince yukarı doğru belirir. Script yoksa ya da hareket azaltılmışsa içerik zaten görünürdür. */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "li" | "section" }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // ilk ekrandakiler gizlenmez
    el.dataset.state = "hidden";
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.dataset.state = "shown"; io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const T = Tag as "div";
  return <T ref={ref as React.RefObject<HTMLDivElement>} className={className} style={{ "--d": `${delay}ms` } as React.CSSProperties}>{children}</T>;
}
