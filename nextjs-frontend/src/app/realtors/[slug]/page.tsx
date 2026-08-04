import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const name = params.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    title: `${name} - Licensed Realtor & Real Estate Agent | Domestic Real Estate`,
    description: `Contact ${name}, top-rated real estate agent at Domestic Real Estate. View active listings, specialties, certifications, and client reviews.`,
    alternates: { canonical: `https://domesticrealestate.us/realtors/${params.slug}` },
  };
}

export default function PublicRealtorProfilePage({ params }: { params: { slug: string } }) {
  const agent = {
    name: "Sarah Johnson",
    headline: "Luxury Real Estate Specialist | Top 1% Producer",
    bio: "With over 12 years of experience in luxury real estate, I specialize in helping clients navigate high-end residential sales, waterfront estates, and investment properties with utmost care and negotiation excellence.",
    license_number: "RE-2847561",
    brokerage_name: "Domestic Real Estate Group",
    office_address: "1200 Brickell Ave, Suite 800, Miami, FL 33131",
    office_phone: "(555) 987-6543",
    office_email: "info@domesticrealestate.us",
    rating: 4.9,
    review_count: 34,
    sales_count: 42,
    specialties: ["Buyers", "Sellers", "Luxury Homes", "Waterfront Properties"],
    certifications: ["CRS", "ABR", "GRI", "e-PRO®"],
    languages: ["English", "Spanish", "Portuguese"],
    service_areas: ["Miami Beach", "Coral Gables", "Key Biscayne", "Brickell"],
    listings: [
      { id: 1, title: "Modern Waterfront Villa in Coral Gables", price: "$4,850,000", beds: 5, baths: 6, sqft: "5,400", city: "Coral Gables, FL" },
      { id: 2, title: "Luxury Penthouse with Bay Views", price: "$2,950,000", beds: 3, baths: 3.5, sqft: "3,100", city: "Miami, FL" },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.name,
    description: agent.bio,
    telephone: agent.office_phone,
    email: agent.office_email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1200 Brickell Ave, Suite 800",
      addressLocality: "Miami",
      addressRegion: "FL",
      postalCode: "33131",
      addressCountry: "US",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: agent.rating,
      reviewCount: agent.review_count,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Banner */}
      <div className="bg-[#0A2647] text-white py-14 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-[#C9A227] flex items-center justify-center font-bold text-4xl text-[#0A2647] border-4 border-white shadow-xl">
            SJ
          </div>
          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-extrabold">{agent.name}</h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
                Verified REALTOR®
              </span>
            </div>
            <p className="text-slate-300 font-medium text-base">{agent.headline}</p>
            <p className="text-xs text-slate-400">
              {agent.brokerage_name} • License #{agent.license_number}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[#0A2647]">About {agent.name}</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{agent.bio}</p>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Rating & Reviews</p>
                <p className="text-base font-bold text-[#0A2647]">⭐ {agent.rating} ({agent.review_count} reviews)</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Closed Transactions</p>
                <p className="text-base font-bold text-[#0A2647]">{agent.sales_count} Deals</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Languages Spoken</p>
                <p className="text-base font-bold text-[#0A2647]">{agent.languages.join(", ")}</p>
              </div>
            </div>
          </div>

          {/* Active Listings Gallery */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0A2647]">Active Featured Listings ({agent.listings.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agent.listings.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="h-40 bg-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">
                    Property Image
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-lg font-extrabold text-[#0A2647]">{item.price}</p>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-500">{item.city} • {item.beds} Beds • {item.baths} Baths • {item.sqft} SqFt</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Contact Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sticky top-6">
            <h3 className="font-bold text-[#0A2647] text-base border-b pb-2">Get in Touch</h3>
            <div className="space-y-3 text-xs text-slate-700">
              <p><strong>Phone:</strong> {agent.office_phone}</p>
              <p><strong>Email:</strong> {agent.office_email}</p>
              <p><strong>Office:</strong> {agent.office_address}</p>
            </div>
            <button className="w-full py-3 bg-[#0A2647] text-white font-bold rounded-xl text-xs hover:bg-[#0d3366] transition shadow">
              Send Direct Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
