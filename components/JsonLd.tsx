import { personJsonLd, websiteJsonLd } from '@/lib/metadata';

export function JsonLd() {
  const schemas = [personJsonLd(), websiteJsonLd()];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
