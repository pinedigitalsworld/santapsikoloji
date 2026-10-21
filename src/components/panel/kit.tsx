"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/panel/icons";
import { toBlocks } from "@/lib/text";

/** Panel API istemcisi: hata olursa Türkçe mesajla fırlatır. */
export async function api<T = { ok: true }>(method: "POST" | "PUT" | "PATCH" | "DELETE", url: string, data?: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: data === undefined ? undefined : { "Content-Type": "application/json" }, body: data === undefined ? undefined : JSON.stringify(data) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "İşlem tamamlanamadı. Lütfen tekrar deneyin.");
  return json as T;
}

/* ---------- Bildirimler ---------- */

type ToastKind = "ok" | "err";
const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string; kind: ToastKind }[]>([]);
  const next = useRef(0);
  const push = useCallback((msg: string, kind: ToastKind = "ok") => {
    const id = next.current++;
    setItems((l) => [...l, { id, msg, kind }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), kind === "err" ? 6000 : 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pn-toast pointer-events-auto flex items-center gap-3 rounded-full px-5 py-3 text-[0.95rem] shadow-[0_18px_40px_-14px_rgba(34,29,27,0.55)] ${t.kind === "err" ? "bg-[#7a2e22] text-paper" : "bg-ink text-paper"}`}>
            <Icon n={t.kind === "err" ? "x" : "check"} size={16} />{t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Temel öğeler ---------- */

export const fieldCls = "w-full rounded-2xl border border-ink/15 bg-white/80 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-[border-color,box-shadow] focus:border-clay focus:shadow-[0_0_0_4px_rgba(138,76,58,0.12)] focus:outline-none";

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-[0.9375rem] font-medium">{label}</label>
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

type BtnProps = { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; variant?: "solid" | "line" | "ghost" | "danger"; icon?: IconName; disabled?: boolean; busy?: boolean; className?: string; size?: "md" | "sm" };
export function Btn({ children, onClick, type = "button", variant = "solid", icon, disabled, busy, className = "", size = "md" }: BtnProps) {
  const v = {
    solid: "bg-clay text-paper hover:bg-clay-deep",
    line: "border border-ink/20 bg-white/60 hover:border-ink hover:bg-ink hover:text-paper",
    ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
    danger: "border border-[#7a2e22]/30 text-[#7a2e22] hover:bg-[#7a2e22] hover:text-paper",
  }[variant];
  const s = size === "sm" ? "min-h-9 px-4 text-sm" : "min-h-11 px-6";
  return (
    <button type={type} onClick={onClick} disabled={disabled || busy} className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55 ${s} ${v} ${className}`}>
      {busy ? <span className="pn-spin size-4 rounded-full border-2 border-current border-t-transparent" aria-hidden /> : icon && <Icon n={icon} size={size === "sm" ? 15 : 17} />}
      {children}
    </button>
  );
}

/** İlk tıklamada "Emin misiniz?" diye sorar, ikinci tıklamada onaylar. */
export function ConfirmBtn({ children, onConfirm, label = "Evet, sil", busy, size = "sm" }: { children: ReactNode; onConfirm: () => void; label?: string; busy?: boolean; size?: "md" | "sm" }) {
  const [ask, setAsk] = useState(false);
  useEffect(() => { if (!ask) return; const t = setTimeout(() => setAsk(false), 4000); return () => clearTimeout(t); }, [ask]);
  return ask ? (
    <Btn variant="danger" size={size} icon="trash" busy={busy} onClick={() => { setAsk(false); onConfirm(); }}>{label}</Btn>
  ) : (
    <Btn variant="ghost" size={size} icon="trash" onClick={() => setAsk(true)}>{children}</Btn>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[1.75rem] border border-ink/10 bg-[#fbfaf8] p-6 shadow-[0_1px_0_rgba(34,29,27,0.03)] md:p-8 ${className}`}>{children}</section>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="group inline-flex items-center gap-3">
      <span className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${checked ? "bg-moss" : "bg-ink/20"}`}>
        <span className={`absolute left-0.5 top-0.5 size-6 rounded-full bg-paper shadow transition-transform duration-300 ${checked ? "translate-x-5" : ""}`} />
      </span>
      <span className="text-[0.9375rem] font-medium">{label}</span>
    </button>
  );
}

/* ---------- Görsel seçici ---------- */

type MediaFile = { name: string; src: string; source: "upload" | "site"; size: number };

export function MediaPicker({ open, onClose, onPick, title = "Görsel seçin" }: { open: boolean; onClose: () => void; onPick: (src: string) => void; title?: string }) {
  const toast = useToast();
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const [version, setVersion] = useState(0); // yükleme sonrası listeyi yeniden çekmek için
  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetch("/panel/api/media").then((r) => (r.ok ? r.json() : null)).then((j) => { if (alive && j) setFiles(j.files); }).catch(() => {});
    return () => { alive = false; };
  }, [open, version]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function upload(list: FileList | File[]) {
    const fd = new FormData();
    Array.from(list).forEach((f) => fd.append("file", f));
    setBusy(true);
    try {
      const res = await fetch("/panel/api/media", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setVersion((v) => v + 1);
      toast(`${json.saved.length} görsel yüklendi`);
      if (json.saved.length === 1) onPick(json.saved[0]);
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={title} className="pn-pop flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-paper shadow-2xl sm:rounded-[2rem]">
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-6 py-4">
          <h2 className="serif text-2xl">{title}</h2>
          <div className="flex items-center gap-2">
            <Btn icon="upload" busy={busy} onClick={() => input.current?.click()}>Yeni görsel yükle</Btn>
            <button type="button" onClick={onClose} aria-label="Kapat" className="flex size-11 items-center justify-center rounded-full hover:bg-ink/5"><Icon n="x" /></button>
          </div>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple hidden onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ""; }} />
        </div>
        <div
          className={`flex-1 overflow-y-auto p-6 transition-colors ${drag ? "bg-clay/5" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) upload(e.dataTransfer.files); }}
        >
          {!files ? (
            <p className="py-16 text-center text-ink-soft">Görseller yükleniyor…</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-ink-soft">Bilgisayarınızdan görsel sürükleyip bırakabilir ya da aşağıdan seçebilirsiniz.</p>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {files.map((f) => (
                  <li key={f.src}>
                    <button type="button" onClick={() => onPick(f.src)} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-linen ring-clay transition hover:ring-4 focus-visible:ring-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {f.source === "upload" && <span className="absolute left-2 top-2 rounded-full bg-moss px-2.5 py-1 text-xs text-paper">Yüklediğim</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Önizlemeli görsel alanı: seç, değiştir, kaldır. */
export function ImageField({ value, onChange, label = "Görsel", aspect = "aspect-[16/10]", position }: { value: string; onChange: (v: string) => void; label?: string; aspect?: string; position?: string }) {
  const [open, setOpen] = useState(false);
  const src = value ? (value.startsWith("/") ? value : `/images/${value}`) : "";
  return (
    <div>
      <p className="text-[0.9375rem] font-medium">{label}</p>
      <div className="mt-2">
        <div className={`relative overflow-hidden rounded-2xl border border-ink/10 bg-linen ${aspect}`}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="size-full object-cover" style={position ? { objectPosition: position } : undefined} />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-ink-soft"><Icon n="image" size={28} /><span className="text-sm">Henüz görsel seçilmedi</span></div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn variant="line" size="sm" icon="image" onClick={() => setOpen(true)}>{src ? "Görseli değiştir" : "Görsel seç"}</Btn>
          {src && <Btn variant="ghost" size="sm" icon="x" onClick={() => onChange("")}>Kaldır</Btn>}
        </div>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(s) => { onChange(s); setOpen(false); }} />
    </div>
  );
}

/** Üst başlık + sağda eylemler. */
export function PageTitle({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-[clamp(2rem,4vw,3rem)]">{title}</h1>
        {lead && <p className="mt-2 max-w-2xl text-ink-soft">{lead}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/* ---------- Biçimlendirmeli metin alanı ---------- */

const tools: { icon?: IconName; label: string; prefix: string; title: string }[] = [
  { label: "Başlık", prefix: "## ", title: "Satırı büyük başlık yap" },
  { label: "Alt başlık", prefix: "### ", title: "Satırı alt başlık yap" },
  { icon: "plus", label: "Madde", prefix: "- ", title: "Satırları madde listesine çevir" },
  { label: "Düz yazı", prefix: "", title: "Başlık / liste işaretini kaldır" },
];

/** Yazma + canlı önizleme. İçerik düz metindir: boş satır paragraf, "## " başlık, "- " madde. */
export function BodyField({ value, onChange, minHeight = "min-h-[24rem]", placeholder }: { value: string; onChange: (v: string) => void; minHeight?: string; placeholder?: string }) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"yaz" | "onizle">("yaz");
  const blocks = toBlocks(value);

  function format(prefix: string) {
    const el = area.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value: v } = el;
    const start = v.lastIndexOf("\n", a - 1) + 1;
    let end = v.indexOf("\n", b);
    if (end < 0) end = v.length;
    const next = v.slice(start, end).split("\n").map((l) => (l.trim() ? `${prefix}${l.replace(/^(#{1,6}\s+|[-•]\s+)/, "")}` : l)).join("\n");
    onChange(v.slice(0, start) + next + v.slice(end));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start, start + next.length); });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/15 bg-white/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-3 py-2.5">
        <div role="toolbar" aria-label="Biçimlendirme" className={`flex flex-wrap gap-1 ${tab === "onizle" ? "pointer-events-none opacity-40" : ""}`}>
          {tools.map((t) => (
            <button key={t.label} type="button" title={t.title} onClick={() => format(t.prefix)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink hover:text-paper">
              {t.icon && <Icon n={t.icon} size={14} />}{t.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-full bg-ink/5 p-1 text-sm">
          {(["yaz", "onizle"] as const).map((k) => <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 font-medium transition-colors ${tab === k ? "bg-paper shadow-sm" : "text-ink-soft"}`}>{k === "yaz" ? "Yaz" : "Önizle"}</button>)}
        </div>
      </div>
      {tab === "yaz" ? (
        <textarea ref={area} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`block w-full resize-y bg-transparent p-5 text-[1.0625rem] leading-relaxed placeholder:text-ink-soft/50 focus:outline-none ${minHeight}`} />
      ) : (
        <div className={`bg-paper/60 p-6 ${minHeight}`}>
          {blocks.length === 0 ? <p className="text-ink-soft">Yazdıkça burada görünür.</p> : (
            <div className="prose-santa">
              {blocks.map((b, i) => {
                if (b.type === "p") return <p key={i}>{b.text}</p>;
                if (b.type === "ul") return <ul key={i}>{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>;
                const Tag = `h${Math.min(Math.max(b.level, 2), 6)}` as "h2";
                return <Tag key={i}>{b.text}</Tag>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
