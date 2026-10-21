import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="container-page py-32">
      <h1 className="display text-[clamp(2.5rem,7vw,5rem)]">Aradığınız sayfa bulunamadı.</h1>
      <p className="mt-6 max-w-xl text-xl text-ink-soft">Bağlantı değişmiş ya da sayfa kaldırılmış olabilir. Ana sayfadan devam edebilirsiniz.</p>
      <div className="mt-8"><ButtonLink href="/">Ana sayfaya dön</ButtonLink></div>
    </section>
  );
}
