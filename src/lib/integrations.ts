import { authConfigured } from "@/lib/auth";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { mailConfigured } from "@/lib/mail";
import { usingDatabase } from "@/lib/store";

export type Integration = { name: string; ok: boolean; optional?: boolean; detail: string };

/** Panelin "Bağlantılar" kartı: hangi servis bağlı, hangisinin ortam değişkeni eksik. */
export function integrations(): Integration[] {
  const prod = process.env.NODE_ENV === "production";
  return [
    { name: "Panel girişi", ok: authConfigured(), detail: authConfigured() ? "Kullanıcı adı, şifre ve gizli anahtar tanımlı" : "PANEL_USER, PANEL_PASS ve PANEL_SECRET tanımlanmalı" },
    { name: "Veritabanı", ok: usingDatabase(), detail: usingDatabase() ? "Postgres bağlı" : prod ? "DATABASE_URL yok: değişiklikler kalıcı olmaz!" : "Yerel dosya kullanılıyor (geliştirme)" },
    { name: "Görsel yükleme", ok: cloudinaryConfigured(), detail: cloudinaryConfigured() ? "Cloudinary bağlı" : prod ? "CLOUDINARY_* yok: yüklenen görseller kalıcı olmaz!" : "Yerel klasör kullanılıyor (geliştirme)" },
    { name: "E-posta bildirimi", ok: mailConfigured(), optional: true, detail: mailConfigured() ? "Yeni mesajlar e-postayla bildirilir" : "Kapalı (isteğe bağlı): RESEND_API_KEY ve NOTIFY_EMAIL ile açılır" },
  ];
}
