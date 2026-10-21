import { PageTitle } from "@/components/panel/kit";
import { TestimonialsManager } from "@/components/panel/Testimonials";
import { requireAdmin } from "@/lib/auth";
import { getTestimonials } from "@/lib/content";

export default async function TestimonialsAdmin() {
  await requireAdmin();
  return (
    <>
      <PageTitle title="Danışan yorumları" lead="Sitede “Danışanlarımızın deneyimleri” bölümünde görünen yorumlar. Yalnızca danışanın izniyle yayınlayın." />
      <TestimonialsManager items={await getTestimonials()} />
    </>
  );
}
