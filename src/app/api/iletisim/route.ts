import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { body, fail, str } from "@/lib/api";
import { clientIp, rateLimit, sameOrigin } from "@/lib/auth";
import { notifyNewMessage } from "@/lib/mail";
import { mutateMessages } from "@/lib/store";

/** İletişim formu: mesaj panelin "Mesajlar" bölümüne düşer. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Geçersiz istek kaynağı.", 403);
  if (!(await rateLimit(`msg:${clientIp(req)}`, 4, 10 * 60_000))) return fail("Kısa sürede çok fazla mesaj gönderdiniz. Lütfen biraz sonra tekrar deneyin.", 429);
  const b = await body<Record<string, unknown>>(req);
  if (!b) return fail("Geçersiz veri.");
  // Bal küpü alanı: botlar doldurur, insanlar görmez. Sessizce başarılı gibi yanıtlanır.
  if (str(b.website, 200)) return Response.json({ ok: true });
  const name = str(b.name, 80), phone = str(b.phone, 30), email = str(b.email, 120), message = str(b.message, 2000);
  if (b.consent !== true) return fail("Devam etmek için aydınlatma metnini onaylamanız gerekir.");
  if (!name || !message) return fail("Lütfen adınızı ve mesajınızı yazın.");
  if (!phone && !email) return fail("Size dönebilmemiz için telefon ya da e-posta bırakın.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("E-posta adresi geçersiz görünüyor.");
  await mutateMessages((m) => {
    m.unshift({ id: randomUUID(), name, phone, email, message, createdAt: new Date().toISOString(), read: false });
    m.splice(1000); // belge sonsuza dek büyümesin
    // Saklama süresi (KVKK): varsayılan 365 gün, MESSAGE_RETENTION_DAYS=0 ile kapatılır.
    const days = Number(process.env.MESSAGE_RETENTION_DAYS ?? 365);
    if (days > 0) {
      const cutoff = Date.now() - days * 86_400_000;
      for (let i = m.length - 1; i >= 0 && Date.parse(m[i].createdAt) < cutoff; i--) m.pop();
    }
  });
  after(() => notifyNewMessage({ name, phone, email, message })); // yanıt gittikten sonra e-posta bildirimi
  return Response.json({ ok: true });
}
