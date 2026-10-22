import type { Metadata } from "next";
import { ContactBand } from "@/components/Sections";
import { PageHeader } from "@/components/ui";
import { getSite } from "@/lib/site-server";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni",
  description: "Santa Psikoloji iletişim formu ve web sitesi kapsamında işlenen kişisel veriler, saklama süreleri ve KVKK kapsamındaki haklarınız.",
  alternates: { canonical: "/gizlilik" },
};

const h2 = "serif mt-12 text-2xl";

export default async function Privacy() {
  const site = await getSite();
  return (
    <>
      <PageHeader title="Gizlilik ve KVKK Aydınlatma Metni" lead="6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, verilerinizin nasıl işlendiğini açıkça anlatıyoruz." />
      <div className="prose-santa container-read pb-8">
        <p>Son güncelleme: 22 Ekim 2026</p>

        <h2 className={h2}>Veri sorumlusu</h2>
        <p>{site.legalName} ({site.name}), {site.address}. İletişim: <a className="underline underline-offset-4 hover:text-clay" href={`mailto:${site.email}`}>{site.email}</a>, {site.phone}.</p>

        <h2 className={h2}>İşlenen kişisel veriler</h2>
        <p>İletişim formunu doldurduğunuzda ad, telefon numarası, e-posta adresi ve mesajınızın içeriğini işleriz. Telefon ya da e-postadan en az birini yazmanız yeterlidir. Mesaj alanında sağlık durumunuza ilişkin ayrıntılı bilgi paylaşmamanızı, bu konuları görüşmede konuşmayı öneririz.</p>

        <h2 className={h2}>İşleme amacı ve hukuki sebep</h2>
        <ul>
          <li>Randevu ve bilgi taleplerinize yanıt vermek, sizinle iletişime geçmek.</li>
          <li>Hukuki sebep: talebiniz doğrultusunda bir hizmet ilişkisi kurulması için gerekli olması ve açık rızanız (iletişim formundaki onay kutusu).</li>
        </ul>

        <h2 className={h2}>Verilerin aktarıldığı taraflar</h2>
        <p>Verileriniz satılmaz ve pazarlama amacıyla paylaşılmaz. Sitenin çalışması için şu hizmet sağlayıcılar kullanılır; bunlardan bazıları yurt dışında (Avrupa Birliği dahil) yer alan sunuculardır ve verileriniz açık rızanıza dayanarak bu sağlayıcılara aktarılabilir:</p>
        <ul>
          <li>Barındırma: Vercel Inc.</li>
          <li>Veritabanı: Neon (Frankfurt, Almanya)</li>
          <li>Görsel depolama: Cloudinary (kişisel veri içermez)</li>
          <li>E-posta bildirimi: Resend (yeni mesajın ekibimize iletilmesi için, kullanıldığında)</li>
        </ul>

        <h2 className={h2}>Saklama süresi</h2>
        <p>Form mesajları, talebiniz yanıtlandıktan sonra en geç 12 ay içinde silinir. İsterseniz bu süreden önce silinmesini talep edebilirsiniz.</p>

        <h2 className={h2}>Çerezler</h2>
        <p>Sitede analiz, reklam ya da üçüncü taraf takip çerezi kullanılmaz. Yalnızca yönetici girişi için gerekli oturum çerezi vardır; ziyaretçilere çerez bırakılmaz.</p>

        <h2 className={h2}>Haklarınız</h2>
        <p>KVKK&apos;nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, düzeltilmesini veya silinmesini isteme, aktarıldığı tarafları öğrenme ve itiraz etme haklarına sahipsiniz. Başvurularınızı yukarıdaki e-posta adresine iletebilirsiniz; en geç 30 gün içinde yanıtlarız.</p>
      </div>
      <div className="mt-24"><ContactBand /></div>
    </>
  );
}
