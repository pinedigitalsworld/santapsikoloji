"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "@/components/panel/icons";
import { Btn, ConfirmBtn, api, useToast } from "@/components/panel/kit";
import type { MediaFile } from "@/lib/media";

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export function MediaLibrary({ files }: { files: MediaFile[] }) {
  const router = useRouter();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const mine = files.filter((f) => f.source === "upload");
  const site = files.filter((f) => f.source === "site");

  async function upload(list: FileList | File[]) {
    const fd = new FormData();
    Array.from(list).forEach((f) => fd.append("file", f));
    setBusy(true);
    try {
      const res = await fetch("/panel/api/media", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast(`${json.saved.length} görsel yüklendi`);
      router.refresh();
    } catch (e) { toast((e as Error).message, "err"); }
    setBusy(false);
  }
  async function remove(name: string) {
    try { await api("DELETE", `/panel/api/media/${name}`); toast("Görsel silindi"); router.refresh(); } catch (e) { toast((e as Error).message, "err"); }
  }
  async function copy(src: string) {
    try { await navigator.clipboard.writeText(src); toast("Yol kopyalandı"); } catch { toast(src); }
  }

  const grid = (list: MediaFile[], deletable: boolean) => (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {list.map((f) => (
        <li key={f.src} className="group overflow-hidden rounded-[1.5rem] border border-ink/10 bg-[#fbfaf8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.src} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          <div className="flex items-center justify-between gap-2 p-3">
            <span className="min-w-0"><span className="block truncate text-sm">{f.name}</span><span className="text-xs text-ink-soft">{kb(f.size)}</span></span>
            <span className="flex shrink-0">
              <button type="button" onClick={() => copy(f.src)} className="rounded-full px-2.5 py-1.5 text-xs text-ink-soft hover:bg-ink/5 hover:text-ink">Kopyala</button>
              {deletable && <ConfirmBtn onConfirm={() => remove(f.name)} label="Sil?">{""}</ConfirmBtn>}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-12">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) void upload(e.dataTransfer.files); }}
        className={`flex flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed p-10 text-center transition-colors ${drag ? "border-clay bg-clay/5" : "border-ink/20"}`}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-linen text-clay"><Icon n="upload" size={24} /></span>
        <p className="serif text-2xl">Görsel yükleyin</p>
        <p className="text-ink-soft">Görselleri buraya sürükleyin ya da bilgisayarınızdan seçin. JPG, PNG, WebP, AVIF veya GIF · en fazla 8 MB.</p>
        <Btn icon="upload" busy={busy} onClick={() => input.current?.click()}>Bilgisayardan seç</Btn>
        <input ref={input} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={(e) => { if (e.target.files?.length) void upload(e.target.files); e.target.value = ""; }} />
      </div>

      <section>
        <h2 className="serif mb-4 text-2xl">Yüklediklerim <span className="text-ink-soft">({mine.length})</span></h2>
        {mine.length ? grid(mine, true) : <p className="text-ink-soft">Henüz görsel yüklemediniz.</p>}
      </section>
      <section>
        <h2 className="serif mb-1 text-2xl">Sitedeki görseller <span className="text-ink-soft">({site.length})</span></h2>
        <p className="mb-4 text-ink-soft">Sitenin ilk kurulumundan gelen görseller. Bunlar silinemez ama yazılarda ve sayfalarda kullanılabilir.</p>
        {grid(site, false)}
      </section>
    </div>
  );
}
