import { notFound } from "next/navigation";
import { PostEditor } from "@/components/panel/PostEditor";
import { requireAdmin } from "@/lib/auth";
import { readContent } from "@/lib/store";

export default async function EditPost({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const p = (await readContent()).posts.find((x) => x.slug === slug);
  if (!p) notFound();
  return <PostEditor post={{ slug: p.slug, title: p.title.trim(), text: p.text, date: p.date, image: p.images[0] ?? "", published: p.published !== false, summary: p.summary ?? "" }} />;
}
