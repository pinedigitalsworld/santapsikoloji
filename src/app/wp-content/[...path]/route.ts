import names from "@/data/image-names.json";

/**
 * Eski WordPress görsel adresleri (Google Görseller'de indekslenmiş olabilir):
 * /wp-content/uploads/2025/12/foto-300x200.jpg → /images/foto.jpg (dosya yeni sitede varsa, 301).
 * Karşılığı olmayan her şey (tema dosyaları, eklentiler, eski boyutlar) 410 Gone döner: arama motoru adresi hızla bırakır.
 */
const have = new Map((names as string[]).map((n) => [n.toLowerCase(), n]));

const normalize = (file: string) => {
  let f = file.toLowerCase();
  for (let i = 0; i < 3; i++) f = f.replace(/-(scaled|e\d{10,}|\d+x\d+)(?=\.[a-z0-9]+$)/, "");
  return f;
};

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const file = decodeURIComponent(path[path.length - 1] ?? "");
  const target = path[0] === "uploads" ? have.get(normalize(file)) : undefined;
  if (target) return Response.redirect(new URL(`/images/${encodeURIComponent(target)}`, req.url), 301);
  return new Response("Gone", { status: 410, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
export const HEAD = GET;
