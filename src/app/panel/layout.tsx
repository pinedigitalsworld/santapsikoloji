import type { Metadata } from "next";
import { Shell } from "@/components/panel/Shell";
import { ToastProvider } from "@/components/panel/kit";
import { isAdmin } from "@/lib/auth";
import { readMessages } from "@/lib/store";

export const metadata: Metadata = { title: { absolute: "Yönetim Paneli | Santa Psikoloji" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  const unread = admin ? readMessages().filter((m) => !m.read).length : 0;
  return <ToastProvider>{admin ? <Shell unread={unread}>{children}</Shell> : children}</ToastProvider>;
}
