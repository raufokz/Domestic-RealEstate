import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyMapWrapper from "./PropertyMapWrapper";
import PropertyInquiryForm from "./PropertyInquiryForm";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, SITE_URL } from "@/lib/seo";
import { getPropertyBySlug, formatPrice, priceNumber, type PublicProperty } from "@/lib/properties";
import { storageUrl } from "@/lib/media";

function locationLine(p: PublicProperty): string {
  return [p.address, p.city, p.state, p.zip].filter(Boolean).join(", ");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const prop = await getPropertyBySlug(slug);
  if (!prop) {
    return { title: "Property Not Found", robots: { index: false, follow: true } };
  }
  const loc = [prop.city, prop.state].filter(Boolean).join(", ");
  const bits = [
    prop.bedrooms ? `${prop.bedrooms} bed` : null,
    prop.bathrooms ? `${prop.bathrooms} bath` : null,
    prop.sqft ? `${prop.sqft.toLocaleString()} sqft` : null,
  ].filter(Boolean).join(" · ");
  const heroImg = storageUrl(prop.photos?.[0]) ?? undefined;
  return buildMetadata({
    title: prop.title,
    description: `${prop.title}${loc ? ` in ${loc}` : ""}. ${bits ? `${bits}. ` : ""}Listed at ${formatPrice(prop.price)}. View photos, details, and schedule a viewing with Domestic Real Estate.`,
    path: `/properties/${prop.slug}`,
    image: heroImg,
    ogType: "website",
  });
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prop = await getPropertyBySlug(slug);
  if (!prop) notFound();

  const photos = (prop.photos ?? []).map(storageUrl).filter((u): u is string => !!u);
  const heroImg = photos[0];
  const price = formatPrice(prop.price);
  const priceVal = priceNumber(prop.price);
  const lat = prop.latitude != null ? Number(prop.latitude) : null;
  const lng = prop.longitude != null ? Number(prop.longitude) : null;
  const hasGeo = lat != null && lng != null && isFinite(lat) && isFinite(lng);
  const agentName = prop.realtor?.name;
  const agentEmail = prop.realtor?.email;
  const agentSlug = prop.realtor?.agentProfile?.slug;

  const details: { label: string; value: string }[] = [
    prop.propertyType?.name ? { label: "Property Type", value: prop.propertyType.name } : null,
    prop.year_built ? { label: "Year Built", value: String(prop.year_built) } : null,
    prop.lot_size ? { label: "Lot Size", value: `${Number(prop.lot_size).toLocaleString()} sqft` } : null,
    prop.parking_spaces ? { label: "Parking", value: `${prop.parking_spaces} spaces` } : null,
    prop.hoa_fees && Number(prop.hoa_fees) > 0 ? { label: "HOA", value: `${formatPrice(prop.hoa_fees)}/mo` } : null,
    prop.neighborhood ? { label: "Neighborhood", value: prop.neighborhood } : null,
  ].filter((x): x is { label: string; value: string } => !!x);

  // Structured data built from REAL data only.
  const listingLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "Residence"],
    name: prop.title,
    description: prop.description ?? undefined,
    url: `${SITE_URL}/properties/${prop.slug}`,
    image: photos.length ? photos : undefined,
    ...(prop.address || prop.city
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: prop.address ?? undefined,
            addressLocality: prop.city ?? undefined,
            addressRegion: prop.state ?? undefined,
            postalCode: prop.zip ?? undefined,
            addressCountry: prop.country ?? "US",
          },
        }
      : {}),
    ...(hasGeo ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } } : {}),
    ...(prop.bedrooms ? { numberOfRooms: prop.bedrooms } : {}),
    ...(prop.sqft ? { floorSize: { "@type": "QuantitativeValue", value: prop.sqft, unitCode: "FTK" } } : {}),
    ...(priceVal
      ? {
          offers: {
            "@type": "Offer",
            price: priceVal,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/properties/${prop.slug}`,
          },
        }
      : {}),
  };

  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          listingLd,
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: prop.title, path: `/properties/${prop.slug}` },
          ]),
        ]}
      />
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm font-body text-gray-500">
              <li><Link href="/" className="hover:text-[#0A2647] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/properties" className="hover:text-[#0A2647] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded">Properties</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-[#0A2647] font-medium" aria-current="page">{prop.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              {heroImg ? (
                <>
                  <div className="rounded-2xl h-80 md:h-[480px] relative overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImg}
                      alt={`${prop.title} — ${locationLine(prop)}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {prop.propertyType?.name && (
                        <span className="bg-white/90 text-[#0A2647] text-xs font-heading font-semibold px-3 py-1 rounded-full">{prop.propertyType.name}</span>
                      )}
                      {prop.featured && (
                        <span className="bg-[#C9A227] text-[#0A2647] text-xs font-heading font-semibold px-3 py-1 rounded-full">Featured</span>
                      )}
                    </div>
                  </div>
                  {photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {photos.slice(1, 5).map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={src} alt={`${prop.title} photo ${i + 2}`} loading="lazy" className="h-20 w-full object-cover rounded-lg bg-gray-100" />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div aria-hidden="true" className="rounded-2xl h-80 md:h-[480px] bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/10 flex items-center justify-center">
                  <span className="text-gray-400 font-body text-sm">Photos coming soon</span>
                </div>
              )}

              <div className="border-b border-gray-200 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647]">{price}</p>
                    <p className="font-body text-gray-600 mt-1">{locationLine(prop)}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm font-body text-gray-600">
                    {prop.bedrooms != null && <span>{prop.bedrooms} beds</span>}
                    {prop.bathrooms != null && <span>{prop.bathrooms} baths</span>}
                    {prop.sqft != null && <span>{prop.sqft.toLocaleString()} sqft</span>}
                  </div>
                </div>
              </div>

              {prop.description && (
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#0A2647] mb-3">Description</h2>
                  <p className="font-body text-gray-600 leading-relaxed whitespace-pre-line">{prop.description}</p>
                </div>
              )}

              {prop.amenities && prop.amenities.length > 0 && (
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#0A2647] mb-4">Amenities</h2>
                  <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {prop.amenities.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
                        <svg aria-hidden="true" className="w-4 h-4 text-[#C9A227] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        <span className="font-body text-sm text-gray-700">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {details.length > 0 && (
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#0A2647] mb-4">Property Details</h2>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-200">
                        {details.map((f, i) => (
                          <tr key={f.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <th scope="row" className="px-5 py-3 font-body text-sm text-gray-500 w-1/2 text-left font-normal">{f.label}</th>
                            <td className="px-5 py-3 font-body text-sm font-medium text-[#0A2647]">{f.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {hasGeo && (
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#0A2647] mb-4">Location</h2>
                  <div className="h-80 rounded-2xl overflow-hidden border border-gray-200">
                    <PropertyMapWrapper lat={lat as number} lng={lng as number} title={prop.title} />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {(agentName || agentEmail) && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:sticky lg:top-24">
                  <div className="flex items-center gap-4 mb-5">
                    <div aria-hidden="true" className="w-14 h-14 bg-[#0A2647] rounded-full flex items-center justify-center">
                      <span className="text-white font-heading font-bold">
                        {(agentName ?? "DR").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      {agentName && <p className="font-heading font-semibold text-[#0A2647]">{agentName}</p>}
                      <p className="text-xs text-gray-500">Listing Agent</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-5">
                    {agentEmail && (
                      <a href={`mailto:${agentEmail}`} className="flex items-center gap-3 text-sm font-body text-gray-600 hover:text-[#0A2647] break-all">
                        <svg aria-hidden="true" className="w-4 h-4 text-[#C9A227] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                        {agentEmail}
                      </a>
                    )}
                  </div>
                  {agentSlug && (
                    <Link href={`/agents/${agentSlug}`} className="block w-full border border-[#0A2647] text-[#0A2647] font-heading font-semibold py-3 rounded-lg hover:bg-[#0A2647]/5 transition-colors text-center mb-3">
                      View Agent Profile
                    </Link>
                  )}
                  <a href="#schedule-viewing" className="block w-full bg-[#0A2647] text-white font-heading font-semibold py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors text-center">
                    Request a Viewing
                  </a>
                </div>
              )}

              {priceVal && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-heading font-bold text-[#0A2647] mb-1">Payment Estimate</h2>
                  <p className="text-xs text-gray-400 mb-4">Illustrative only — not a loan offer or financial advice.</p>
                  <dl className="space-y-2 text-sm font-body">
                    <div className="flex justify-between"><dt className="text-gray-500">Home Price</dt><dd className="font-medium text-[#0A2647]">{price}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Down Payment (20%)</dt><dd className="font-medium text-[#0A2647]">{formatPrice(priceVal * 0.2)}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Est. Rate</dt><dd className="font-medium text-[#0A2647]">6.5% / 30-yr</dd></div>
                  </dl>
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <p className="font-body text-sm text-gray-500">Est. Monthly Payment</p>
                    <p className="font-heading text-2xl font-bold text-[#0A2647]">
                      {formatPrice((priceVal * 0.8 * 0.0065) / (1 - Math.pow(1.0065, -360)))}/mo
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Schedule a Viewing */}
      <section id="schedule-viewing" className="py-16 md:py-20 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-8 text-center">Schedule a Viewing</h2>
          <PropertyInquiryForm propertyId={prop.id} propertyTitle={prop.title} />
        </div>
      </section>

      <ChatWidgetWrapper context="property-detail" leadType="buyer" />
    </main>
  );
}
