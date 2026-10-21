import Link from "next/link";

/** Yalnızca düzenleme modunda görünen "Düzenle" rozeti (CSS ile gizli); panelde ilgili kaydı açar. */
export function EditChip({ href, label = "Düzenle" }: { href: string; label?: string }) {
  return (
    <Link href={href} data-edit-chip className="edit-chip" prefetch={false}>
      <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
      {label}
    </Link>
  );
}
