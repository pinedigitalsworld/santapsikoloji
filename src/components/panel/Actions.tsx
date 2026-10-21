"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ConfirmBtn, useToast } from "@/components/panel/kit";

/** Listelerdeki "Sil" düğmesi: iki aşamalı onay + yenileme. */
export function DeleteItem({ collection, slug, label = "Sil", done = "Silindi" }: { collection: string; slug: string; label?: string; done?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <ConfirmBtn
      busy={busy}
      onConfirm={async () => {
        setBusy(true);
        try { await api("DELETE", `/panel/api/c/${collection}/${slug}`); toast(done); router.refresh(); }
        catch (e) { toast((e as Error).message, "err"); }
        setBusy(false);
      }}
    >{label}</ConfirmBtn>
  );
}
