export function JsonLd({ data }: { data: object }) {
  // "<" karakteri kaçırılarak script bloğundan çıkış (XSS) engellenir.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
