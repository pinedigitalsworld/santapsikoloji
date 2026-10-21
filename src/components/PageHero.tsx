import Image from "next/image";
import type { ReactNode } from "react";
import { Ed } from "@/components/Ed";
import { readOverrides } from "@/lib/store";

/** Fotoğraflı iç sayfa karşılaması: menü fotoğrafın üzerinde cam olarak yüzer. */
export async function PageHero({ title, lead, image, alt = "", position = "50% 50%", edKey, children }: {
  title: string; lead?: string; image: string; alt?: string; position?: string; edKey?: string; children?: ReactNode;
}) {
  const shown = edKey ? (await readOverrides())[`img:${edKey}.image`] ?? image : image;
  return (
    <section data-hero {...(edKey ? { "data-ed-img": `${edKey}.image` } : {})} className="on-dark relative -mt-[5rem] flex min-h-[68svh] items-end overflow-hidden bg-ink text-paper">
      <Image src={shown} alt={alt} fill priority sizes="100vw" quality={85} className="object-cover" style={{ objectPosition: position }} />
      <div aria-hidden className="absolute inset-0 bg-[rgba(24,19,16,0.5)]" />
      <div className="container-page relative w-full pb-14 pt-40 lg:pb-20">
        <h1 className="display rise max-w-4xl text-balance text-[clamp(3rem,7.5vw,6.75rem)]">{edKey ? <Ed k={`${edKey}.title`}>{title}</Ed> : title}</h1>
        {lead && <p className="rise rise-2 mt-7 max-w-2xl text-xl text-paper/90">{edKey ? <Ed k={`${edKey}.lead`}>{lead}</Ed> : lead}</p>}
        {children && <div className="rise rise-3 mt-9 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
