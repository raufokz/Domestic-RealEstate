import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAgentBySlug, agentName, agentInitials } from "@/lib/agents";
import { formatPrice, propertyPhotoPaths } from "@/lib/properties";
import { storageUrl } from "@/lib/media";
import { buildMetadata, realEstateAgentLd, breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import AgentContactForm from "./AgentContactForm";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) {
    return { title: "Agent Not Found", robots: { index: false, follow: true } };
  }
  const name = agentName(agent);
  const ogImage = agent.cover_photo
    ? storageUrl(agent.cover_photo)
    : agent.user?.avatar
    ? storageUrl(agent.user.avatar)
    : undefined;
  return buildMetadata({
    title: `${name}${agent.headline ? ` | ${agent.headline}` : ""}`,
    description: `Connect with ${name}${agent.headline ? `, ${agent.headline}` : ""} at Domestic Real Estate.${agent.sales_count ? ` ${agent.sales_count} homes sold.` : ""}`,
    path: `/agents/${slug}`,
    ...(ogImage ? { image: ogImage } : {}),
  });
}

export default async function AgentProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  const name = agentName(agent);
  const firstName = name.split(" ")[0];
  const rating = agent.rating != null ? Number(agent.rating) : 0;
  const location = [agent.office_city, agent.office_state].filter(Boolean).join(", ");
  const listings = agent.listings ?? [];
  const coverPhotoUrl = agent.cover_photo ? storageUrl(agent.cover_photo) : null;
  const companyLogoUrl = agent.company_logo ? storageUrl(agent.company_logo) : null;
  const credentials = [
    ...(agent.certifications ?? []),
    ...(agent.designations ?? []),
    ...(agent.awards ?? []),
  ].filter(Boolean);
  const socialLinks = Object.entries(agent.social_links ?? {}).filter(([, url]) => !!url) as [string, string][];

  const avatarUrl = agent.user?.avatar ? storageUrl(agent.user.avatar) : null;

  return (
    <main className="min-h-screen bg-white">
      {/* RealEstateAgent + breadcrumb markup. Fields are passed through only
          where the profile actually holds a value, so the structured data
          always matches what a visitor can see on the page. */}
      <JsonLd
        data={[
          realEstateAgentLd({
            name,
            path: `/agents/${slug}`,
            description: agent.bio ?? agent.headline ?? null,
            image: coverPhotoUrl ?? avatarUrl,
            telephone: agent.office_phone ?? agent.mobile_number ?? null,
            email: agent.office_email ?? null,
            jobTitle: agent.headline ?? null,
            brokerage: agent.brokerage_name ?? null,
            city: agent.office_city ?? null,
            state: agent.office_state ?? null,
            rating: rating > 0 ? rating : null,
            reviewCount: agent.review_count ?? null,
            sameAs: socialLinks.map(([, url]) => url),
          }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Agents", path: "/agents" },
            { name, path: `/agents/${slug}` },
          ]),
        ]}
      />
      <section className="relative bg-[#0A2647] text-white py-12 md:py-16 overflow-hidden">
        {coverPhotoUrl && (
          <>
            <Image src={coverPhotoUrl} alt="" fill sizes="100vw" className="object-cover opacity-30" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A2647]/80 via-[#0A2647]/85 to-[#0A2647]" />
          </>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-[#C9A227]/20 rounded-3xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {agent.user?.avatar ? (
                <Image src={storageUrl(agent.user.avatar) ?? ""} alt={name} width={160} height={160} className="w-full h-full object-cover" priority />
              ) : (
                <span className="font-heading text-4xl md:text-5xl font-bold text-white">{agentInitials(agent)}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <p className="text-[#C9A227] font-heading text-sm tracking-widest uppercase">Verified Agent</p>
                {agent.realtor_membership && (
                  <span className="bg-white/10 border border-white/20 text-white text-xs font-heading font-semibold px-2.5 py-0.5 rounded-full">REALTOR®</span>
                )}
                {agent.nar_membership && (
                  <span className="bg-white/10 border border-white/20 text-white text-xs font-heading font-semibold px-2.5 py-0.5 rounded-full">NAR Member</span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-heading text-3xl md:text-4xl font-bold">{name}</h1>
                {companyLogoUrl && (
                  <Image src={companyLogoUrl} alt={agent.brokerage_name || "Brokerage logo"} width={40} height={40} className="h-10 w-10 object-contain bg-white rounded-lg p-1" />
                )}
              </div>
              {agent.headline && <p className="font-body text-white/70 text-lg mb-3">{agent.headline}</p>}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {rating > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="font-heading font-bold">{rating.toFixed(1)}</span>
                    {(agent.review_count ?? 0) > 0 && <span className="font-body text-white/60">({agent.review_count} reviews)</span>}
                  </div>
                )}
                {agent.sales_count != null && agent.sales_count > 0 && (
                  <>
                    {rating > 0 && <span className="text-white/30">|</span>}
                    <span className="font-body text-white/70">{agent.sales_count} homes sold</span>
                  </>
                )}
                {agent.years_experience != null && agent.years_experience > 0 && (
                  <>
                    <span className="text-white/30">|</span>
                    <span className="font-body text-white/70">{agent.years_experience} years experience</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-6 text-sm font-body text-white/60">
                {(agent.office_phone || agent.user?.phone) && (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                    {agent.office_phone || agent.user?.phone}
                  </span>
                )}
                {(agent.office_email || agent.user?.email) && (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    {agent.office_email || agent.user?.email}
                  </span>
                )}
                {agent.whatsapp_number && (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                    WhatsApp: {agent.whatsapp_number}
                  </span>
                )}
                {agent.website && (
                  <a href={agent.website} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-2 hover:text-[#C9A227] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A8.959 8.959 0 0121 12a8.959 8.959 0 01-1.157 4.418m-15.686-8.836A8.959 8.959 0 003 12c0 1.605.42 3.113 1.157 4.418m0 0A8.997 8.997 0 0012 21" /></svg>
                    Website
                  </a>
                )}
                {socialLinks.length > 0 && socialLinks.map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer nofollow" className="capitalize hover:text-[#C9A227] transition-colors">
                    {platform}
                  </a>
                ))}
              </div>
              {(agent.license_number || agent.brokerage_name || location) && (
                <div className="mt-3 flex items-center gap-2 text-sm font-body text-white/50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  {[agent.license_number, agent.brokerage_name, location].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {agent.bio && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">About {firstName}</h2>
                <p className="font-body text-gray-600 leading-relaxed whitespace-pre-line">{agent.bio}</p>
              </div>
            )}

            {agent.specialties && agent.specialties.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">Services Needed</h2>
                <div className="flex flex-wrap gap-2">
                  {agent.specialties.map((s: string, i: number) => (
                    <span key={i} className="bg-[#C9A227]/10 text-[#0A2647] font-heading font-medium text-sm px-4 py-2 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {agent.lead_type_preferences && (agent.lead_type_preferences.pricing_plan || agent.lead_type_preferences.budget || (agent.lead_type_preferences.leads && agent.lead_type_preferences.leads.length > 0)) && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">Ad Placement & Leads</h2>
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {agent.lead_type_preferences.pricing_plan && (
                    <p className="text-sm font-body text-slate-700">
                      <strong>Membership Plan Tier:</strong> <span className="bg-[#C9A227]/20 border border-[#C9A227]/40 px-2.5 py-0.5 rounded text-xs font-black text-[#0A2647]">{agent.lead_type_preferences.pricing_plan}</span>
                    </p>
                  )}
                  {agent.lead_type_preferences.budget && (
                    <p className="text-sm font-body text-slate-700">
                      <strong>Monthly Marketing Budget:</strong> {agent.lead_type_preferences.budget}
                    </p>
                  )}
                  {agent.lead_type_preferences.leads && agent.lead_type_preferences.leads.length > 0 && (
                    <div>
                      <strong className="text-sm font-body text-slate-700 block mb-1">Target Lead Specialties:</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.lead_type_preferences.leads.map((l: string, i: number) => (
                          <span key={i} className="bg-[#0A2647]/5 text-[#0A2647] text-xs font-semibold px-2.5 py-1 rounded-md">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {agent.service_areas && agent.service_areas.length > 0 && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">Service Areas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {agent.service_areas.map((area, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className="font-heading font-semibold text-[#0A2647] text-sm">{area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(credentials.length > 0 || (agent.languages && agent.languages.length > 0)) && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">Credentials &amp; Languages</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {credentials.length > 0 && (
                    <div>
                      <p className="font-heading text-sm font-semibold text-[#0A2647] mb-2 uppercase tracking-wide">Certifications &amp; Awards</p>
                      <ul className="space-y-1.5">
                        {credentials.map((c, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm font-body text-gray-600">
                            <span className="text-[#C9A227]">★</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {agent.languages && agent.languages.length > 0 && (
                    <div>
                      <p className="font-heading text-sm font-semibold text-[#0A2647] mb-2 uppercase tracking-wide">Languages Spoken</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.languages.map((lang, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">{lang}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-6">Active Listings</h2>
              {listings.length === 0 ? (
                <p className="font-body text-gray-400 text-sm">No active listings right now.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => {
                    const photo = storageUrl(propertyPhotoPaths(listing)[0]);
                    return (
                      <Link key={listing.id} href={`/properties/${listing.slug}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="h-40 bg-gray-100 relative">
                          {photo ? (
                            <Image src={photo} alt={listing.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/10" />
                          )}
                        </div>
                        <div className="p-5">
                          <p className="font-heading text-xl font-bold text-[#0A2647] mb-1">{formatPrice(listing.price)}</p>
                          <p className="font-body text-gray-500 text-sm mb-3">{[listing.address, listing.city].filter(Boolean).join(", ")}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600 font-body border-t border-gray-100 pt-3">
                            {listing.bedrooms != null && <span>{listing.bedrooms} beds</span>}
                            {listing.bathrooms != null && <span>{listing.bathrooms} baths</span>}
                            {listing.sqft != null && <span>{listing.sqft.toLocaleString()} sqft</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="font-heading text-lg font-bold text-[#0A2647] mb-5">Contact {firstName}</h3>
              <AgentContactForm agentId={agent.id} agentFirstName={firstName} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
