"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Site menüsü, alt bilgi ve hızlı iletişim çubuğu yönetim panelinde gösterilmez. */
export function SiteChrome({ header, footer, mobileCta, children }: { header: ReactNode; footer: ReactNode; mobileCta: ReactNode; children: ReactNode }) {
  if (usePathname().startsWith("/panel")) return <>{children}</>;
  return (
    <>
      {header}
      <main id="icerik" className="flex-1">{children}</main>
      {footer}
      {mobileCta}
    </>
  );
}
