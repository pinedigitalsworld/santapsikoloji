import Link from "next/link";
import { Icon } from "@/components/panel/icons";
import { PageTitle } from "@/components/panel/kit";
import { OverridesList } from "@/components/panel/Overrides";
import { requireAdmin } from "@/lib/auth";
import { readOverrides } from "@/lib/store";

export const dynamic = "force-dynamic";

const steps = [
  ["1", "Düzenleme modunu açın", "Aşağıdaki düğmeyle siteyi açın. Sol altta çıkan “Düzenleme modu” anahtarı açık olsun."],
  ["2", "Metne tıklayıp yazın", "Başlıklara ve metinlere tıklayın, doğrudan yazın. Başka bir yere tıkladığınızda otomatik kaydedilir."],
  ["3", "Görseli değiştirin", "Bir görselin üzerine gelip tıklayın; kütüphaneden seçin ya da yeni görsel yükleyin."],
  ["4", "Kartlardaki “Düzenle” rozetleri", "Yazı, hizmet, psikolog ve yorum kartlarında beliren rozet sizi ilgili kaydın düzenleme ekranına götürür."],
] as const;

export default async function EditMode() {
  await requireAdmin();
  const items = Object.entries(await readOverrides());
  return (
    <>
      <PageTitle title="Siteyi düzenle" lead="Siteyi ziyaretçilerin gördüğü hâliyle açın ve doğrudan sayfa üzerinde değişiklik yapın.">
        <Link href="/?edit=1" prefetch={false} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-clay px-7 font-medium text-paper hover:bg-clay-deep"><Icon n="pen" size={17} />Düzenleme modunda aç</Link>
      </PageTitle>
      <ol className="grid gap-4 md:grid-cols-2">
        {steps.map(([n, t, d]) => (
          <li key={n} className="flex gap-5 rounded-[1.75rem] border border-ink/10 bg-[#fbfaf8] p-6">
            <span className="display flex size-12 shrink-0 items-center justify-center rounded-full bg-linen text-2xl text-clay">{n}</span>
            <div><h2 className="serif text-xl">{t}</h2><p className="mt-1 text-ink-soft">{d}</p></div>
          </li>
        ))}
      </ol>
      <section className="mt-12">
        <h2 className="serif text-2xl">Yaptığınız düzenlemeler <span className="text-ink-soft">({items.length})</span></h2>
        <p className="mb-5 mt-1 text-ink-soft">Düzenleme modunda değiştirdiğiniz metin ve görseller. İstediğinizi tek tıkla ilk hâline döndürebilirsiniz.</p>
        <OverridesList items={items} />
      </section>
    </>
  );
}
