import { PostEditor } from "@/components/panel/PostEditor";
import { requireAdmin } from "@/lib/auth";

export default async function NewPost() {
  await requireAdmin();
  return <PostEditor />;
}
