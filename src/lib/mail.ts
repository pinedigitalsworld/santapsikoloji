/** İsteğe bağlı e-posta bildirimi (Resend). RESEND_API_KEY ve NOTIFY_EMAIL yoksa sessizce atlanır. */
export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL);

export async function notifyNewMessage(m: { name: string; phone: string; email: string; message: string }) {
  if (!mailConfigured()) return;
  const lines = ["Yeni iletişim formu mesajı", "", `Ad: ${m.name}`];
  if (m.phone) lines.push(`Telefon: ${m.phone}`);
  if (m.email) lines.push(`E-posta: ${m.email}`);
  lines.push("", m.message);
  const text = lines.join("\n");
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || "Santa Psikoloji <onboarding@resend.dev>",
        to: process.env.NOTIFY_EMAIL!.split(",").map((s) => s.trim()).filter(Boolean),
        ...(m.email ? { reply_to: m.email } : {}),
        subject: `Yeni mesaj: ${m.name}`,
        text,
      }),
    });
  } catch { /* bildirim başarısız olsa da mesaj zaten kaydedildi */ }
}
