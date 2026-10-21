import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Ed } from "@/components/Ed";
import type { Block } from "@/lib/content";
import { readOverrides } from "@/lib/store";

export function ButtonLink({
  href, children, variant = "solid", external, className = "",
}: { href: string; children: ReactNode; variant?: "solid" | "line" | "light"; external?: boolean; className?: string }) {
  const base = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-medium transition-colors duration-200";
  const styles = {
    solid: "bg-clay text-paper hover:bg-clay-deep",
    line: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper",
    light: "bg-paper text-moss-deep hover:bg-linen",
  }[variant];
  const cls = `${base} ${styles} ${className}`;
  return external || /^(https?:|tel:|mailto:)/.test(href)
    ? <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>
    : <Link href={href} className={cls}>{children}</Link>;
}

export async function Photo({
  src, alt, sizes, className = "", priority, position, edit,
}: { src: string; alt: string; sizes: string; className?: string; priority?: boolean; position?: string; edit?: string }) {
  // `edit` verilirse görsel düzenleme modunda yönetici tarafından değiştirilebilir.
  const shown = edit ? (await readOverrides())[`img:${edit}`] ?? src : src;
  return (
    <div className={`relative overflow-hidden bg-linen ${className}`} {...(edit ? { "data-ed-img": edit } : {})}>
      <Image src={shown} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={position ? { objectPosition: position } : undefined} />
    </div>
  );
}

export function PageHeader({ title, lead, edKey, children }: { title: string; lead?: string; edKey?: string; children?: ReactNode }) {
  return (
    <header className="container-page pb-12 pt-14 md:pb-20 md:pt-24">
      <h1 className="display rise max-w-4xl text-[clamp(2.5rem,6.5vw,5rem)]">{edKey ? <Ed k={`${edKey}.title`}>{title}</Ed> : title}</h1>
      {lead && <p className="rise rise-2 mt-6 max-w-2xl text-xl text-ink-soft">{edKey ? <Ed k={`${edKey}.lead`}>{lead}</Ed> : lead}</p>}
      {children}
    </header>
  );
}

export function Prose({ blocks, className = "" }: { blocks: Block[]; className?: string }) {
  return (
    <div className={`prose-santa ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === "p") return <p key={i}>{b.text}</p>;
        if (b.type === "ul") return <ul key={i}>{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>;
        const Tag = `h${Math.min(Math.max(b.level, 2), 6)}` as "h2";
        return <Tag key={i}>{b.text}</Tag>;
      })}
    </div>
  );
}

export { Faq } from "@/components/Faq";

export function Arrow() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
