import Link from "next/link";
import { Icon } from "@/components/panel/icons";
import { PageTitle } from "@/components/panel/kit";
import { requireAdmin } from "@/lib/auth";
import { getTeam } from "@/lib/content";

export default async function TeamAdmin() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Psikologlar" lead="Ekip üyesi ekleyin, fotoğrafını, unvanını ve özgeçmişini düzenleyin ya da kaldırın.">
        <Link href="/panel/ekip/yeni" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-clay px-6 font-medium text-paper transition-colors hover:bg-clay-deep"><Icon n="plus" size={17} />Yeni psikolog</Link>
      </PageTitle>
      <ul className="grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(await getTeam()).map((m) => (
          <li key={m.slug}>
            <Link href={`/panel/ekip/${m.slug}`} className="group block overflow-hidden rounded-[1.75rem] border border-ink/10 bg-[#fbfaf8] p-3 transition-colors hover:border-clay">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.image} alt="" className="aspect-square w-full rounded-3xl object-cover" style={{ objectPosition: m.position }} />
              <div className="flex items-end justify-between gap-3 px-3 pb-3 pt-5">
                <div><h2 className="serif text-2xl leading-tight group-hover:text-clay">{m.name}</h2><p className="text-clay">{m.role}</p></div>
                <Icon n="pen" className="mb-1 text-ink-soft group-hover:text-clay" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
