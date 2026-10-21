"use client";

import { useId, useState } from "react";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const base = useId();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className={`rounded-3xl px-5 transition-colors duration-300 md:px-6 ${isOpen ? "bg-linen" : "bg-linen/70"}`}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${base}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left"
              >
                <span className="serif text-lg leading-snug md:text-2xl">{f.q}</span>
                <span aria-hidden className={`chev flex size-9 shrink-0 items-center justify-center rounded-full bg-paper text-2xl leading-none text-clay ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
            </h3>
            <div id={`${base}-${i}`} role="region" className={`faq-panel ${isOpen ? "is-open" : ""}`}>
              <div className="faq-inner">
                <div className="max-w-2xl pb-6 text-ink-soft">
                  {f.a.split("\n\n").map((p, j) => <p key={j} className="mt-3 first:mt-0">{p}</p>)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
