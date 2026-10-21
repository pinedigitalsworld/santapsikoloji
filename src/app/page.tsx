import Link from "next/link";
import { HeroSlider } from "@/components/HeroSlider";
import { Arrow, Faq, Photo } from "@/components/ui";
import { AudiencePaths, ContactBand, FeaturedServices, LatestPosts, TeamGrid, Testimonials } from "@/components/Sections";
import { Ed } from "@/components/Ed";
import { getHeroSlides } from "@/lib/hero";
import { getFaq } from "@/lib/content";

const section = "container-page mt-24 sm:mt-32 lg:mt-44";

export default function Home() {
  return (
    <>
      <HeroSlider slides={getHeroSlides()} />

      <section className={section} aria-labelledby="destek">
        <h2 id="destek" className="display max-w-3xl text-[clamp(2.25rem,4.8vw,4rem)]"><Ed k="home.support.title">Nasıl bir destek arıyorsunuz?</Ed></h2>
        <p className="mt-5 max-w-xl text-xl text-ink-soft"><Ed k="home.support.lead">Size en yakın başlığı seçin, ilgili hizmetleri birlikte görün.</Ed></p>
        <div className="mt-14"><AudiencePaths /></div>
      </section>

      <section className={section} aria-labelledby="hakkimizda">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <Photo src="/images/oyun-odasi.jpg" alt="Santa Psikoloji çocuk oyun terapisi odası" sizes="(min-width:1024px) 40vw, 100vw" position="50% 55%" className="aspect-[4/5] rounded-[2rem]" edit="home.about.photo" />
          <div>
            <h2 id="hakkimizda" className="display text-[clamp(2.25rem,4.8vw,4rem)]"><Ed k="home.about.title">Hakkımızda</Ed></h2>
            <p className="serif mt-8 text-[clamp(1.5rem,2.4vw,2rem)] leading-snug">
              <Ed k="home.about.lead">Santa Eğitim ve Danışmanlık Ltd., 2023 yılında kurulmuştur.</Ed>
            </p>
            <p className="mt-6 max-w-xl text-ink-soft">
              <Ed k="home.about.text">Psikolojik iyi oluşu merkeze alan, bilimsel temelli ve etik ilkelere bağlı bir anlayışla çalışıyoruz. Kuruluşumuzdan bu yana; çocuk, ergen, çift ve yetişkinlere yönelik psikolojik danışmanlık, değerlendirme ve eğitim hizmetlerini bütüncül bir bakış açısıyla sunmayı hedeflemekteyiz.</Ed>
            </p>
            <Link href="/hakkimizda" className="mt-8 inline-flex min-h-11 items-center gap-2 text-clay underline-offset-4 hover:underline">Devamını görün <Arrow /></Link>
          </div>
        </div>
      </section>

      <section className="mt-24 sm:mt-32 lg:mt-44" aria-labelledby="hizmetler">
        <div className="container-page mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 id="hizmetler" className="display max-w-2xl text-[clamp(2.25rem,4.8vw,4rem)]"><Ed k="home.services.title">Öne çıkan hizmetler</Ed></h2>
          <Link href="/hizmetlerimiz" className="inline-flex min-h-11 items-center gap-2 text-clay underline-offset-4 hover:underline">Tüm hizmetler <Arrow /></Link>
        </div>
        <div className="container-page"><FeaturedServices /></div>
      </section>

      <section className={section} aria-labelledby="ekip">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 id="ekip" className="display text-[clamp(2.25rem,4.8vw,4rem)]"><Ed k="home.team.title">Psikologlarımız</Ed></h2>
          <Link href="/psikologlarimiz" className="inline-flex min-h-11 items-center gap-2 text-clay underline-offset-4 hover:underline">Ekibi tanıyın <Arrow /></Link>
        </div>
        <TeamGrid />
      </section>

      <section className={section} aria-labelledby="yorumlar">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 id="yorumlar" className="display max-w-2xl text-[clamp(2.25rem,4.8vw,4rem)]"><Ed k="home.reviews.title">Danışanlarımızın deneyimleri</Ed></h2>
          <Link href="/danisan-yorumlari" className="inline-flex min-h-11 items-center gap-2 text-clay underline-offset-4 hover:underline">Tüm yorumlar <Arrow /></Link>
        </div>
        <Testimonials limit={3} short />
      </section>

      <section className={`${section} grid gap-12 md:grid-cols-[1fr_1.6fr]`} aria-labelledby="sss">
        <div>
          <h2 id="sss" className="display text-[clamp(2.25rem,4.8vw,4rem)]"><Ed k="home.faq.title">Merak edilen sorular</Ed></h2>
          <Link href="/sss" className="mt-6 inline-flex min-h-11 items-center gap-2 text-clay underline-offset-4 hover:underline">Tüm sorular <Arrow /></Link>
        </div>
        <Faq items={getFaq()} />
      </section>

      <LatestPosts />
      <div className="mt-24 sm:mt-32 lg:mt-44"><ContactBand /></div>
    </>
  );
}
