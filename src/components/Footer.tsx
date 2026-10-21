import Image from "next/image";
import Link from "next/link";
import { Ed } from "@/components/Ed";
import { nav } from "@/lib/site";
import { getSite } from "@/lib/site-server";

export function Footer() {
  const site = getSite();
  return (
    <footer className="on-dark mt-28 bg-moss-deep text-paper">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Image src="/images/SANTA_LOGO.png" alt="Santa Psikoloji" width={404} height={188} className="h-14 w-auto brightness-0 invert" />
          <p className="mt-6 max-w-xs text-paper/75"><Ed k="footer.tagline">Zor zamanlarda güvenle yanınızdayız. Psikoloji, Eğitim & Danışmanlık.</Ed></p>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block underline underline-offset-4 hover:text-linen">Instagram: @santapsikoloji</a>
        </div>
        <nav aria-label="Alt menü">
          <h2 className="serif text-xl">Sayfalar</h2>
          <ul className="mt-4 space-y-2 text-paper/80">
            {nav.map((n) => <li key={n.href}><Link href={n.href} className="hover:text-paper hover:underline underline-offset-4">{n.label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <h2 className="serif text-xl">Çalışma saatleri</h2>
          <dl className="mt-4 space-y-2 text-paper/80">
            {site.hours.map((h) => (
              <div key={h.days}><dt>{h.days}</dt><dd className="text-paper">{h.time}</dd></div>
            ))}
          </dl>
        </div>
        <address className="not-italic">
          <h2 className="serif text-xl">İletişim</h2>
          <ul className="mt-4 space-y-2 text-paper/80">
            <li>{site.address}</li>
            <li><a href={site.phoneHref} className="text-paper hover:underline underline-offset-4">{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className="text-paper hover:underline underline-offset-4">{site.email}</a></li>
          </ul>
        </address>
      </div>
      <div>
        <p className="container-page pb-24 text-sm text-paper/60 sm:pb-8">© {new Date().getFullYear()} {site.legalName} Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}
