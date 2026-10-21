import type { Metadata } from "next";
import { PageHeader, Photo } from "@/components/ui";
import { ContactBand, TeamGrid } from "@/components/Sections";
import { getAbout } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Santa Eğitim ve Danışmanlık: 2023'te kuruldu. Misyonumuz, vizyonumuz ve çalışma anlayışımız.",
  alternates: { canonical: "/hakkimizda" },
};

export default function About() {
  const about = getAbout();
  return (
    <>
      <PageHeader title="Yanınızda olan profesyonel destek" lead={about.support} edKey="page.about" />
      <div className="container-page">
        <Photo src="/images/pp-1.jpeg" alt="Santa Psikoloji danışma odası" sizes="100vw" position="50% 60%" className="aspect-[16/8] rounded-[2rem]" edit="about.photo" />
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {about.points.map((p) => (
            <li key={p} className="serif rounded-2xl bg-linen p-7 text-xl md:text-2xl">{p}</li>
          ))}
        </ul>
      </div>

      <section className="container-page mt-24 grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="display text-4xl md:text-5xl">Misyonumuz</h2>
          <div className="mt-6 space-y-4 text-ink-soft">{about.mission.split("\n\n").map((p) => <p key={p}>{p}</p>)}</div>
        </div>
        <div>
          <h2 className="display text-4xl md:text-5xl">Vizyonumuz</h2>
          <p className="mt-6 text-ink-soft">{about.vision}</p>
        </div>
      </section>

      <section className="container-page mt-32" aria-labelledby="ekip">
        <h2 id="ekip" className="display mb-14 text-4xl md:text-5xl">Psikologlarımız</h2>
        <TeamGrid />
      </section>
      <div className="mt-28"><ContactBand /></div>
    </>
  );
}
