import { ItemEditor } from "@/components/panel/ItemEditor";
import { requireAdmin } from "@/lib/auth";

export default async function NewMember() {
  await requireAdmin();
  return <ItemEditor collection="team" noun="Psikolog" backHref="/panel/ekip" backLabel="Psikologlar" titleLabel="Ad soyad (unvanla birlikte)" />;
}
