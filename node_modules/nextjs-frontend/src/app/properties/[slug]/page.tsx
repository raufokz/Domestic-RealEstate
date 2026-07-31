import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyMapWrapper from "./PropertyMapWrapper";
import PropertyInquiryForm from "./PropertyInquiryForm";
import PropertyGallery from "./PropertyGallery";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, SITE_URL } from "@/lib/seo";
import { getPropertyBySlug, formatPrice, priceNumber, propertyPhotoPaths, type PublicProperty } from "@/lib/properties";
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
  const heroImg = storageUrl(propertyPhotoPaths(prop)[0]) ?? undefined;
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

  const photos = propertyPhotoPaths(prop).map(storageUrl).filter((u): u is string => !!u);
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
    <main className="min-h-screen bg-slate-50/50">
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
          
          {/* Breadcrumb section */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-body text-gray-500">
              <li><Link href="/" className="hover:text-[#0A2647] hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded">Home</Link></li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li><Link href="/properties" className="hover:text-[#0A2647] hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded">Properties</Link></li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li className="text-[#0A2647] font-medium truncate max-w-[200px] sm:max-w-none" aria-current="page">{prop.title}</li>
            </ol>
          </nav>

          {/* Premium Header Alignment with Gold Elements */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
            <div>
              <h1 className="font-heading text-2xl sm:text-3.5xl font-extrabold text-[#0A2647] tracking-tight leading-tight">
                {prop.title}
              </h1>
              <p className="font-body text-[#0A2647]/75 text-sm sm:text-base mt-2 flex items-center gap-2 font-medium">
                <svg className="w-4 h-4 text-[#C9A227] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {locationLine(prop)}
              </p>
            </div>
            <div className="text-left md:text-right shrink-0">
              <span className="text-[#C9A227] text-xs font-bold uppercase tracking-wider block mb-1">Guide Price</span>
              <p className="font-heading text-3xl sm:text-4.5xl font-black text-[#0A2647] font-mono leading-none">
                {price}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Main Contents Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Premium Gallery Component */}
              <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-premium-sm">
                <PropertyGallery
                  photos={photos}
                  title={prop.title}
                  location={locationLine(prop)}
                  propertyTypeName={prop.propertyType?.name}
                  featured={prop.featured}
                />
              </div>

              {/* Outstanding Visually Outlined Stats Grid */}
              <div className="grid grid-cols-3 gap-3 bg-gradient-to-br from-[#0A2647]/5 via-[#0A2647]/2 to-transparent p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-premium-sm">
                <div className="flex flex-col items-center justify-center p-3 bg-white/80 backdrop-blur rounded-2xl border border-slate-200/50 shadow-sm text-center">
                  <span className="text-xl sm:text-2xl mb-1.5 select-none">🛌</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bedrooms</span>
                  <strong className="text-base sm:text-lg text-[#0A2647] font-extrabold mt-0.5">{prop.bedrooms ?? "—"}</strong>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white/80 backdrop-blur rounded-2xl border border-slate-200/50 shadow-sm text-center">
                  <span className="text-xl sm:text-2xl mb-1.5 select-none">🛁</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bathrooms</span>
                  <strong className="text-base sm:text-lg text-[#0A2647] font-extrabold mt-0.5">{prop.bathrooms ?? "—"}</strong>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-white/80 backdrop-blur rounded-2xl border border-slate-200/50 shadow-sm text-center">
                  <span className="text-xl sm:text-2xl mb-1.5 select-none">📐</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Square Feet</span>
                  <strong className="text-base sm:text-lg text-[#0A2647] font-mono font-extrabold mt-0.5">{prop.sqft ? prop.sqft.toLocaleString() : "—"}</strong>
                </div>
              </div>

              {/* Description Card */}
              {prop.description && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-premium-sm">
                  <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#0A2647] flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-6 bg-[#C9A227] rounded-full" />
                    Property Description
                  </h2>
                  <p className="font-body text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line font-medium">
                    {prop.description}
                  </p>
                </div>
              )}

              {/* Amenities Card */}
              {prop.amenities && prop.amenities.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-premium-sm">
                  <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#0A2647] flex items-center gap-2 mb-5">
                    <span className="w-1.5 h-6 bg-[#C9A227] rounded-full" />
                    Key Amenities
                  </h2>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {prop.amenities.map((a, i) => (
                      <li key={i} className="flex items-center gap-2.5 bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 hover:border-slate-200/50 rounded-xl px-4 py-3.5 transition-all">
                        <svg className="w-4 h-4 text-emerald-500 bg-emerald-500/10 p-0.5 rounded-full shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-body text-xs sm:text-sm text-slate-800 font-semibold">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Property Details Card */}
              {details.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-premium-sm">
                  <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#0A2647] flex items-center gap-2 mb-5">
                    <span className="w-1.5 h-6 bg-[#C9A227] rounded-full" />
                    Home Specifications
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {details.map((f) => (
                      <div key={f.label} className="flex justify-between items-center py-3 border-b border-dashed border-slate-200/80 text-xs sm:text-sm">
                        <span className="font-body text-slate-500 font-medium">{f.label}</span>
                        <strong className="font-body text-[#0A2647] font-semibold">{f.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Card */}
              {hasGeo && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-premium-sm">
                  <h2 className="font-heading text-lg sm:text-xl font-extrabold text-[#0A2647] flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-6 bg-[#C9A227] rounded-full" />
                    Neighborhood Coordinates
                  </h2>
                  <p className="font-body text-xs text-slate-400 font-medium mb-5">Live interactive map of surrounding property locality.</p>
                  <div className="h-80 rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner relative z-0">
                    <PropertyMapWrapper lat={lat as number} lng={lng as number} title={prop.title} />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6 lg:sticky lg:top-24">
              
              {/* Premium Agent Profile Card */}
              {(agentName || agentEmail) && (
                <div className="bg-gradient-to-b from-[#0A2647] via-[#0A2647] to-[#08203d] text-white rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-premium-lg relative overflow-hidden">
                  {/* Decorative corner glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A227]/10 rounded-full blur-xl pointer-events-none" />

                  <div className="flex items-center gap-4 pb-5 border-b border-white/10 mb-6 relative z-10">
                    <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center font-heading text-[#C9A227] text-lg font-bold shadow-inner shrink-0">
                      {(agentName ?? "DR").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      {agentName && <p className="font-heading font-extrabold text-white text-base leading-tight">{agentName}</p>}
                      <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#C9A227]/90 mt-1">Premier Listing Agent</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 text-xs sm:text-sm text-slate-300 relative z-10">
                    {agentEmail && (
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A227] shrink-0">✉️</span>
                        <a href={`mailto:${agentEmail}`} className="hover:text-[#C9A227] hover:underline transition-colors truncate block font-medium">
                          {agentEmail}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 relative z-10">
                    <a
                      href="#schedule-viewing"
                      className="block w-full bg-[#C9A227] hover:bg-[#b8911f] text-[#0A2647] font-heading font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_12px_rgba(201,162,39,0.2)] hover:shadow-[0_4px_16px_rgba(201,162,39,0.3)] transition-all text-center border-b-2 border-amber-600 active:translate-y-[1px]"
                    >
                      Request a Viewing
                    </a>
                    {agentSlug && (
                      <Link 
                        href={`/agents/${agentSlug}`} 
                        className="block w-full border border-white/15 hover:border-white/30 text-white hover:bg-white/5 font-heading text-xs font-semibold py-3.5 rounded-xl transition-all text-center"
                      >
                        View Profile
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Monthly Investment Calculator Card */}
              {priceVal && (
                <div className="bg-white border border-slate-150 p-6 sm:p-7 rounded-3xl shadow-premium-sm">
                  <h3 className="font-heading font-extrabold text-[#0A2647] text-base sm:text-lg mb-1 flex items-center gap-2">
                    <span className="select-none">📊</span>
                    Monthly Investment
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mb-4 leading-normal">
                    Illustrative estimate based on a standard 20% down payment and 6.5% interest rate.
                  </p>

                  <div className="space-y-3 text-xs sm:text-sm font-body font-medium text-slate-700">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Property Value</span>
                      <strong className="text-[#0A2647] font-semibold">{price}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Down Payment (20%)</span>
                      <strong className="text-[#0A2647] font-semibold">{formatPrice(priceVal * 0.2)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Loan Principal</span>
                      <strong className="text-[#0A2647] font-semibold">{formatPrice(priceVal * 0.8)}</strong>
                    </div>
                  </div>

                  <div className="bg-[#0A2647] text-white rounded-2xl p-4 mt-5 border border-[#C9A227]/30 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 via-[#C9A227] to-amber-500" />
                    <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#C9A227] mb-1">Projected Payment</p>
                    <p className="font-heading text-2xl sm:text-3xl font-black text-[#C9A227] font-mono leading-none">
                      {formatPrice((priceVal * 0.8 * 0.0065) / (1 - Math.pow(1.0065, -360)))}<span className="text-xs text-white/70 font-normal">/mo</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Schedule a Viewing Full Form Section */}
      <section id="schedule-viewing" className="py-16 md:py-20 bg-slate-50 border-t border-slate-150 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs uppercase font-mono font-extrabold text-[#C9A227] tracking-widest bg-[#C9A227]/10 px-3 py-1 rounded-full">Schedule Appointment</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0A2647] mt-3">Book a Tour & Request Information</h2>
            <p className="font-body text-slate-500 text-sm sm:text-base mt-2">Submit your details below to schedule an in-person viewing or query this property.</p>
          </div>
          <div className="shadow-premium-md rounded-3xl overflow-hidden border border-slate-150">
            <PropertyInquiryForm propertyId={prop.id} propertyTitle={prop.title} />
          </div>
        </div>
      </section>

      <ChatWidgetWrapper context="property-detail" leadType="buyer" />
    </main>
  );
}
