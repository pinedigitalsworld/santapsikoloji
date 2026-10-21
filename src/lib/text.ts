/** Saf metin işlemleri: hem sunucuda hem tarayıcıda (panel önizlemesi) kullanılır. */
export type Block =
  | { type: "p"; text: string }
  | { type: "h"; level: number; text: string }
  | { type: "ul"; items: string[] };

export const clean = (s: string) => s.replace(/ /g, " ").trim();

/** Düz metni (satır sonlarıyla gelen) paragraf / başlık / liste bloklarına çevirir. */
export function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push({ type: "ul", items: list });
    list = [];
  };
  for (const line of text.split("\n")) {
    const t = clean(line);
    if (!t) { flush(); continue; }
    const h = /^(#{1,6})\s+(.*)$/.exec(t);
    if (h) { flush(); blocks.push({ type: "h", level: h[1].length, text: h[2] }); continue; }
    if (/^[-•]\s*/.test(t)) { list.push(t.replace(/^[-•]\s*/, "")); continue; }
    flush();
    blocks.push({ type: "p", text: t });
  }
  flush();
  return blocks;
}

export const summarize = (text: string, max = 170) => {
  const first = toBlocks(text).find((b) => b.type === "p");
  const t = first && first.type === "p" ? first.text : "";
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 60)).replace(/[,.;:\s]+$/, "") + "…";
};

/** Arama sonuçları için 110–155 karakterlik açıklama: kısa paragrafları birleştirir, cümle/kelime sınırında keser. */
export const metaDescription = (text: string, max = 155) => {
  const ps = toBlocks(text).filter((b): b is Extract<Block, { type: "p" }> => b.type === "p").map((b) => b.text);
  let t = "";
  for (const p of ps) { t = t ? `${t} ${p}` : p; if (t.length >= 110) break; }
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 80)).replace(/[,.;:\s]+$/, "") + "…";
};

export const readingMinutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 200));
