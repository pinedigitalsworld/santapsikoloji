import Link from "next/link";
import { Icon } from "@/components/panel/icons";
import { PageTitle } from "@/components/panel/kit";
import { requireAdmin } from "@/lib/auth";
import { getServiceGroups } from "@/lib/content";

export default async function ServicesAdmin() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Hizmetler" lead="Hizmet ekleyin, düzenleyin ya da kaldırın. Değişiklikler menüde ve hizmetler sayfasında hemen görünür.">
        <Link href="/panel/hizmetler/yeni" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-clay px-6 font-medium text-paper transition-colors hover:bg-clay-deep"><Icon n="plus" size={17} />Yeni hizmet</Link>
      </PageTitle>
      <div className="space-y-12">
        {(await getServiceGroups()).map((g) => (
          <section key={g.id}>
            <h2 className="serif mb-4 text-2xl">{g.title} <span className="text-ink-soft">({g.items.length})</span></h2>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {g.items.map((s) => (
                <li key={s.slug}>
                  <Link href={`/panel/hizmetler/${s.slug}`} className="group flex h-full items-center gap-4 rounded-[1.5rem] border border-ink/10 bg-[#fbfaf8] p-3 pr-5 transition-colors hover:border-clay">
                    <span className="block size-20 shrink-0 overflow-hidden rounded-2xl bg-linen">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {s.image ? <img src={s.image} alt="" className="size-full object-cover" /> : <span className="flex size-full items-center justify-center text-ink-soft"><Icon n="image" /></span>}
                    </span>
                    <span className="min-w-0 flex-1"><b className="serif block text-lg font-normal leading-snug group-hover:text-clay">{s.title}</b></span>
                    <Icon n="pen" size={16} className="text-ink-soft group-hover:text-clay" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
