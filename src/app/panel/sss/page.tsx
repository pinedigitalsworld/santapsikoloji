import { FaqManager } from "@/components/panel/FaqManager";
import { PageTitle } from "@/components/panel/kit";
import { requireAdmin } from "@/lib/auth";
import { getFaq } from "@/lib/content";

export default async function FaqAdmin() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Sık sorulan sorular" lead="Soruları ekleyin, sırasını değiştirin ya da silin. Ana sayfada ve SSS sayfasında görünür." />
      <FaqManager items={await getFaq()} />
    </>
  );
}
