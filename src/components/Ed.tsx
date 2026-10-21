import type { ElementType } from "react";
import { ed } from "@/lib/site-server";

/**
 * Düzenleme modunda yönetici tarafından yerinde düzenlenebilen metin.
 * Ziyaretçiler için sıradan bir öğedir; yalnızca `data-ed` anahtarı eklenir.
 */
export function Ed({ k, as: Tag = "span", children, className, id }: { k: string; as?: ElementType; children: string; className?: string; id?: string }) {
  return <Tag data-ed={k} className={className} id={id}>{ed(k, children)}</Tag>;
}
