"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/panel/icons";
import { Btn, Card, api, fieldCls, useToast } from "@/components/panel/kit";

type Q = { q: string; a: string };

export function FaqManager({ items }: { items: Q[] }) {
  const router = useRouter();
  const toast = useToast();
  const [list, setList] = useState<Q[]>(items);
  const [saved, setSaved] = useState(JSON.stringify(items));
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(list) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const patch = (i: number, p: Partial<Q>) => setList((l) => l.map((x, n) => (n === i ? { ...x, ...p } : x)));
  const move = (i: number, d: number) => setList((l) => { const n = [...l], j = i + d; if (j < 0 || j >= n.length) return l; [n[i], n[j]] = [n[j], n[i]]; return n; });

  async function save() {
    setBusy(true);
    try {
      const r = await api<{ count: number }>("PUT", "/panel/api/faq", { items: list });
      toast("Sorular sitede yayında");
      setSaved(JSON.stringify(list.filter((f) => f.q.trim() && f.a.trim())));
      setList((l) => l.filter((f) => f.q.trim() && f.a.trim()));
      void r; router.refresh();
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  }

  const iconBtn = "flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/8 hover:text-ink disabled:opacity-30";

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-5 mb-6 flex flex-wrap items-center justify-between gap-3 bg-paper/90 px-5 py-3 backdrop-blur md:-mx-10 md:px-10 lg:top-0">
        <p className="text-ink-soft">{list.length} soru {dirty && <span className="ml-2 text-clay">· Kaydedilmemiş değişiklikler var</span>}</p>
        <div className="flex gap-2">
          <Btn variant="line" icon="plus" onClick={() => setList((l) => [{ q: "", a: "" }, ...l])}>Yeni soru</Btn>
          <Btn icon="save" busy={busy} disabled={!dirty} onClick={save}>Kaydet</Btn>
        </div>
      </div>
      <ul className="space-y-4">
        {list.map((f, i) => (
          <li key={i}>
            <Card className="p-5! md:p-6!">
              <div className="flex items-start gap-3">
                <span className="serif mt-2 w-7 shrink-0 text-xl text-clay">{i + 1}</span>
                <div className="min-w-0 flex-1 space-y-3">
                  <label className="sr-only" htmlFor={`q${i}`}>Soru</label>
                  <input id={`q${i}`} value={f.q} onChange={(e) => patch(i, { q: e.target.value })} placeholder="Soru" maxLength={300} className={`${fieldCls} serif text-lg`} />
                  <label className="sr-only" htmlFor={`a${i}`}>Yanıt</label>
                  <textarea id={`a${i}`} rows={4} value={f.a} onChange={(e) => patch(i, { a: e.target.value })} placeholder="Yanıt (paragrafları boş satırla ayırın)" maxLength={6000} className={fieldCls} />
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button type="button" aria-label="Yukarı taşı" disabled={i === 0} onClick={() => move(i, -1)} className={iconBtn}><Icon n="up" /></button>
                  <button type="button" aria-label="Aşağı taşı" disabled={i === list.length - 1} onClick={() => move(i, 1)} className={iconBtn}><Icon n="down" /></button>
                  <button type="button" aria-label="Soruyu sil" onClick={() => setList((l) => l.filter((_, n) => n !== i))} className={`${iconBtn} hover:bg-[#7a2e22]/10! hover:text-[#7a2e22]!`}><Icon n="trash" /></button>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
