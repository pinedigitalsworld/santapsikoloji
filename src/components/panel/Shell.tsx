"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/panel/icons";
import { api, useToast } from "@/components/panel/kit";

const groups: { title: string; items: { href: string; label: string; icon: IconName; badge?: "unread" }[] }[] = [
  { title: "", items: [{ href: "/panel", label: "Genel bakış", icon: "home" }] },
  {
    title: "İçerik",
    items: [
      { href: "/panel/blog", label: "Blog yazıları", icon: "blog" },
      { href: "/panel/hizmetler", label: "Hizmetler", icon: "heart" },
      { href: "/panel/ekip", label: "Psikologlar", icon: "users" },
      { href: "/panel/yorumlar", label: "Danışan yorumları", icon: "quote" },
      { href: "/panel/sss", label: "Sık sorulanlar", icon: "help" },
    ],
  },
  { title: "Ziyaretçiler", items: [{ href: "/panel/mesajlar", label: "Mesajlar", icon: "inbox", badge: "unread" }] },
  {
    title: "Site",
    items: [
      { href: "/panel/duzenleme", label: "Siteyi düzenle", icon: "wand" },
      { href: "/panel/medya", label: "Medya kütüphanesi", icon: "image" },
      { href: "/panel/ayarlar", label: "Ayarlar", icon: "sliders" },
    ],
  },
];

const KEY = "pn-collapsed";
const subscribe = (cb: () => void) => { window.addEventListener("pn-collapse", cb); return () => window.removeEventListener("pn-collapse", cb); };
const readCollapsed = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };

export function Shell({ unread, children }: { unread: number; children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [openAt, setOpenAt] = useState<string | null>(null); // mobil menü sayfa değişince kendiliğinden kapanır
  const open = openAt === path;
  // Masaüstünde sol menü daraltılabilir; tercih tarayıcıda hatırlanır.
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const toggleCollapsed = () => {
    try { localStorage.setItem(KEY, collapsed ? "0" : "1"); } catch { /* özel pencere */ }
    window.dispatchEvent(new Event("pn-collapse"));
  };

  const active = (href: string) => (href === "/panel" ? path === "/panel" : path.startsWith(href));
  async function logout() {
    try { await api("POST", "/panel/api/logout"); router.refresh(); } catch { toast("Çıkış yapılamadı.", "err"); }
  }

  /** `mini`: yalnızca simgeler (daraltılmış masaüstü menü). */
  const nav = (mini: boolean) => (
    <nav aria-label="Panel menüsü" className={`flex flex-1 flex-col overflow-y-auto py-2 ${mini ? "items-center gap-4 px-3" : "gap-6 px-4"}`}>
      {groups.map((g) => (
        <div key={g.title || "top"} className={mini ? "w-full" : ""}>
          {g.title && (mini ? <div className="mx-auto mb-2 h-px w-6 bg-paper/15" /> : <p className="mb-2 px-3 text-xs uppercase tracking-[0.14em] text-paper/45">{g.title}</p>)}
          <ul className="space-y-1">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} title={mini ? it.label : undefined} aria-label={mini ? it.label : undefined} aria-current={active(it.href) ? "page" : undefined} className={`relative flex min-h-11 items-center rounded-xl transition-colors ${mini ? "justify-center" : "gap-3 px-3"} ${active(it.href) ? "bg-paper text-moss-deep" : "text-paper/80 hover:bg-paper/10 hover:text-paper"}`}>
                  <Icon n={it.icon} />
                  {!mini && <span className="flex-1">{it.label}</span>}
                  {it.badge === "unread" && unread > 0 && (mini ? <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-clay" /> : <span className="rounded-full bg-clay px-2 py-0.5 text-xs font-medium text-paper">{unread}</span>)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const foot = (mini: boolean) => {
    const row = `flex min-h-11 items-center rounded-xl transition-colors ${mini ? "justify-center" : "gap-3 px-3"}`;
    return (
      <div className={`space-y-1 border-t border-paper/10 ${mini ? "p-3" : "p-4"}`}>
        <Link href="/?edit=1" prefetch={false} title={mini ? "Düzenleme modunda aç" : undefined} aria-label={mini ? "Düzenleme modunda aç" : undefined} className={`${row} bg-clay font-medium text-paper hover:bg-clay-deep`}><Icon n="pen" />{!mini && "Düzenleme modunda aç"}</Link>
        <Link href="/" target="_blank" rel="noopener noreferrer" title={mini ? "Siteyi görüntüle" : undefined} aria-label={mini ? "Siteyi görüntüle" : undefined} className={`${row} text-paper/80 hover:bg-paper/10 hover:text-paper`}><Icon n="external" />{!mini && "Siteyi görüntüle"}</Link>
        <button type="button" onClick={logout} title={mini ? "Çıkış yap" : undefined} aria-label={mini ? "Çıkış yap" : undefined} className={`${row} w-full text-left text-paper/80 hover:bg-paper/10 hover:text-paper`}><Icon n="logout" />{!mini && "Çıkış yap"}</button>
      </div>
    );
  };

  const brand = (mini: boolean) => (
    <div className={`flex items-center ${mini ? "flex-col gap-4 px-3 py-5" : "justify-between gap-2 px-7 py-6"}`}>
      {mini ? (
        <Link href="/panel" aria-label="Genel bakış" className="display flex size-11 items-center justify-center rounded-xl bg-paper/10 text-2xl text-paper">S</Link>
      ) : (
        <Link href="/panel" className="flex items-center gap-3">
          <Image src="/images/SANTA_LOGO.png" alt="Santa Psikoloji" width={404} height={188} className="h-10 w-auto brightness-0 invert" />
          <span className="rounded-full bg-paper/12 px-2.5 py-1 text-xs tracking-wide text-paper/80">Panel</span>
        </Link>
      )}
      <button type="button" onClick={toggleCollapsed} aria-label={mini ? "Menüyü genişlet" : "Menüyü daralt"} title={mini ? "Menüyü genişlet" : "Menüyü daralt"} className="flex size-10 items-center justify-center rounded-xl text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper">
        <Icon n={mini ? "expand" : "collapse"} />
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen bg-paper lg:grid lg:transition-[grid-template-columns] lg:duration-300 lg:ease-[cubic-bezier(0.2,0.7,0.2,1)] ${collapsed ? "lg:grid-cols-[5rem_1fr]" : "lg:grid-cols-[17.5rem_1fr]"}`}>
      <aside className="on-dark sticky top-0 hidden h-screen flex-col overflow-hidden bg-moss-deep text-paper lg:flex">{brand(collapsed)}{nav(collapsed)}{foot(collapsed)}</aside>

      <header className="on-dark sticky top-0 z-40 flex items-center justify-between bg-moss-deep px-4 py-2 text-paper lg:hidden">
        <Link href="/panel" className="flex items-center gap-3"><Image src="/images/SANTA_LOGO.png" alt="Santa Psikoloji" width={404} height={188} className="h-8 w-auto brightness-0 invert" /><span className="rounded-full bg-paper/12 px-2 py-0.5 text-xs">Panel</span></Link>
        <button type="button" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open} onClick={() => setOpenAt(open ? null : path)} className="relative flex size-11 items-center justify-center rounded-full hover:bg-paper/10">
          <Icon n={open ? "x" : "menu"} size={22} />
          {unread > 0 && !open && <span className="absolute right-2 top-2 size-2.5 rounded-full bg-clay" />}
        </button>
      </header>
      {open && (
        <div className="on-dark fixed inset-x-0 bottom-0 top-[3.75rem] z-30 flex flex-col bg-moss-deep text-paper pn-fade lg:hidden">{nav(false)}{foot(false)}</div>
      )}

      <main className="min-w-0 px-5 pb-24 pt-8 md:px-10 md:pt-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
