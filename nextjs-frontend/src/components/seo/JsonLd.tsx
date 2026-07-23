/**
 * Injects a JSON-LD structured-data <script> into the page.
 *
 * Server-rendered (no "use client") so the markup is present in the initial
 * HTML for crawlers. Pass one object or an array of schema objects built with
 * the helpers in `@/lib/seo` (breadcrumbLd, faqLd, webPageLd, …).
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Structured data is developer-authored, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
