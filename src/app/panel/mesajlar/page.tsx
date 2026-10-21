import { Inbox } from "@/components/panel/Inbox";
import { PageTitle } from "@/components/panel/kit";
import { requireAdmin } from "@/lib/auth";
import { readMessages } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Messages({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireAdmin();
  const { id } = await searchParams;
  return (
    <>
      <PageTitle title="Mesajlar" lead="İletişim formundan gelen mesajlar. Telefon, WhatsApp ya da e-posta ile tek dokunuşla yanıtlayın." />
      <Inbox messages={await readMessages()} initialId={id} />
    </>
  );
}
