"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/panel/icons";
import { MediaPicker, ToastProvider, api, useToast } from "@/components/panel/kit";

const STORE = "santa-edit";

function Toolbar() {
  const router = useRouter();
  const path = usePathname();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [on, setOn] = useState(() => {
    try { return new URL(location.href).searchParams.get("edit") === "1" || sessionStorage.getItem(STORE) === "on"; } catch { return false; }
  });
  const [pick, setPick] = useState<string | null>(null);
  const originals = useRef(new WeakMap<Element, string>());

  const refresh = useCallback(() => startTransition(() => router.refresh()), [router]);

  // ?edit=1 ile gelindiyse modu aç ve adresi temizle.
  useEffect(() => {
    const url = new URL(location.href);
    if (url.searchParams.get("edit") === "1") {
      url.searchParams.delete("edit");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }, []);

  // Mod değişince <html> bayrağı, hero duraklatma olayı ve metinlerin düzenlenebilirliği.
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => document.querySelectorAll<HTMLElement>("[data-ed]").forEach((el) => {
      if (on) { el.setAttribute("contenteditable", "plaintext-only"); el.setAttribute("spellcheck", "true"); }
      else { el.removeAttribute("contenteditable"); el.removeAttribute("spellcheck"); }
    });
    if (on) root.dataset.edit = "on"; else delete root.dataset.edit;
    window.dispatchEvent(new CustomEvent("santa-edit", { detail: on }));
    try { sessionStorage.setItem(STORE, on ? "on" : "off"); } catch { /* yoksay */ }
    apply();
    if (!on) return;
    const mo = new MutationObserver(apply); // sayfa geçişlerinde gelen yeni metinler
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [on, path]);

  useEffect(() => () => { delete document.documentElement.dataset.edit; }, []);

  async function saveText(key: string, value: string) {
    try { await api("PUT", "/panel/api/ed", { key, value }); toast("Kaydedildi"); refresh(); }
    catch (e) { toast((e as Error).message, "err"); }
  }

  useEffect(() => {
    if (!on) return;
    const textOf = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();

    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || t.closest("[data-editor-ui], [data-edit-chip]")) return;
      if (t.closest("[data-ed]")) { if (t.closest("a")) e.preventDefault(); return; }
      const img = t.closest<HTMLElement>("[data-ed-img]");
      if (img) { e.preventDefault(); e.stopPropagation(); setPick(img.dataset.edImg ?? null); }
    };
    const onFocusIn = (e: FocusEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-ed]");
      if (el && !originals.current.has(el)) originals.current.set(el, textOf(el));
    };
    const onFocusOut = (e: FocusEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-ed]") as HTMLElement | null;
      if (!el) return;
      const before = originals.current.get(el);
      originals.current.delete(el);
      const after = textOf(el);
      if (before === undefined || after === before) return;
      if (!after) { el.textContent = before; toast("Metin boş bırakılamaz; eski hâli geri yüklendi.", "err"); return; }
      el.textContent = after;
      void saveText(el.dataset.ed!, after);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-ed]") as HTMLElement | null;
      if (!el) return;
      if (e.key === "Enter") { e.preventDefault(); el.blur(); }
      if (e.key === "Escape") { const before = originals.current.get(el); if (before !== undefined) { el.textContent = before; originals.current.delete(el); } el.blur(); }
      e.stopPropagation(); // hero ok tuşları vb. yazarken tetiklenmesin
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKey, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  async function chooseImage(src: string) {
    const key = pick;
    setPick(null);
    if (!key) return;
    try { await api("PUT", "/panel/api/ed", { key, kind: "img", value: src }); toast("Görsel değiştirildi"); refresh(); }
    catch (e) { toast((e as Error).message, "err"); }
  }

  return (
    <>
      <div data-editor-ui className="on-dark fixed bottom-4 left-4 z-[70] flex items-center gap-1 rounded-full bg-ink p-1.5 pl-4 text-paper shadow-[0_18px_44px_-12px_rgba(34,29,27,0.7)]">
        <button type="button" role="switch" aria-checked={on} onClick={() => setOn((v) => !v)} className="flex min-h-10 items-center gap-3 rounded-full pr-2 text-[0.9375rem] font-medium">
          <Icon n="pen" size={16} />
          <span className="hidden sm:inline">Düzenleme modu</span>
          <span className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${on ? "bg-[#8fd69a]" : "bg-paper/25"}`}>
            <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-paper transition-transform duration-300 ${on ? "translate-x-5" : ""}`} />
          </span>
        </button>
        <Link href="/panel" className="ml-1 flex min-h-10 items-center rounded-full bg-paper/12 px-4 text-[0.9375rem] hover:bg-paper hover:text-ink">Panel</Link>
      </div>
      {on && (
        <p data-editor-ui className="on-dark pn-fade pointer-events-none fixed bottom-[4.75rem] left-4 z-[70] max-w-[18rem] rounded-2xl bg-ink/90 px-4 py-2.5 text-sm text-paper/90 backdrop-blur">
          Metne tıklayıp yazın, Enter ile kaydedin. Görsellere tıklayarak değiştirin.
        </p>
      )}
      <MediaPicker open={pick !== null} onClose={() => setPick(null)} onPick={chooseImage} title="Yeni görseli seçin" />
    </>
  );
}

export function EditorOverlay() {
  return <ToastProvider><Toolbar /></ToastProvider>;
}
