import { MediaLibrary } from "@/components/panel/MediaLibrary";
import { PageTitle } from "@/components/panel/kit";
import { requireAdmin } from "@/lib/auth";
import { listMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function MediaAdmin() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Medya kütüphanesi" lead="Yazılarda ve sayfalarda kullanacağınız görselleri yükleyin ve yönetin." />
      <MediaLibrary files={listMedia()} />
    </>
  );
}
