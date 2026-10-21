"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const EditorOverlay = dynamic(() => import("@/components/EditorOverlay").then((m) => m.EditorOverlay), { ssr: false });

/**
 * Ziyaretçiye hiçbir şey yüklemez. Yalnızca "yönetici girişi yapıldı" ipucu çerezi varsa
 * oturumu doğrular ve düzenleme katmanını (ayrı bir dosya olarak) yükler.
 */
export function EditorLoader() {
  const path = usePathname();
  const [admin, setAdmin] = useState(false);
  const inPanel = path.startsWith("/panel");

  useEffect(() => {
    if (inPanel || !document.cookie.split("; ").includes("santa_admin=1")) return;
    let alive = true;
    fetch("/panel/api/me").then((r) => { if (alive && r.ok) setAdmin(true); }).catch(() => {});
    return () => { alive = false; };
  }, [inPanel]);

  return admin && !inPanel ? <EditorOverlay /> : null;
}
