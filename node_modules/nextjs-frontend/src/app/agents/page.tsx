import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Agent Directory",
  description: "Connect with top-rated, vetted real estate agents across the US and Canada. Find your perfect agent match.",
  path: "/agents",
  keywords: ["real estate agents", "find agent", "top realtors", "agent directory"],
});

const agentsSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Verified Real Estate Agent Directory",
  url: "https://domesticrealestate.us/agents",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Jessica Hartwell — Luxury Homes Specialist",
      url: "https://domesticrealestate.us/agents/jessica-hartwell",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Michael Torres — First-Time Buyer Expert",
      url: "https://domesticrealestate.us/agents/michael-torres",
    },
  ],
};

const agents = [
  { name: "Jessica Hartwell", specialty: "Luxury Homes & Estates", rating: 4.9, reviews: 127, sold: 89, initial: "JH", badge: "Top Producer 2025" },
  { name: "Michael Torres", specialty: "First-Time Home Buyers", rating: 4.8, reviews: 94, sold: 67, initial: "MT", badge: "Client Choice Award" },
  { name: "Sarah Kim", specialty: "Investment Properties & Rehabs", rating: 5.0, reviews: 68, sold: 52, initial: "SK", badge: "5.0 Rated Specialist" },
  { name: "David Chen", specialty: "Commercial & Multi-Family", rating: 4.7, reviews: 112, sold: 41, initial: "DC", badge: "Commercial Advisor" },
  { name: "Emily Johnson", specialty: "Corporate & Military Relocation", rating: 4.9, reviews: 83, sold: 73, initial: "EJ", badge: "Relocation Expert" },
  { name: "Robert Williams", specialty: "Condominiums & Townhomes", rating: 4.8, reviews: 76, sold: 58, initial: "RW", badge: "Urban Condo Pro" },
];

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(agentsSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Vetted Agent Directory
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Partner With Top 1% <span className="text-[#C9A227]">Realtors</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Work with licensed, top-performing agents with proven neighborhood sales records, verified client ratings, and expert negotiation skills.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm font-body">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search agent name, specialty, or location..."
              className="flex-1 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227]"
            />
            <select className="bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] sm:w-52">
              <option className="bg-white text-slate-900">All Specialties</option>
              <option className="bg-white text-slate-900">Luxury Homes</option>
              <option className="bg-white text-slate-900">First-Time Buyers</option>
              <option className="bg-white text-slate-900">Investment Properties</option>
              <option className="bg-white text-slate-900">Commercial Real Estate</option>
            </select>
          </div>
        </div>
      </section>

      {/* Agent Cards Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 bg-[#0A2647] rounded-2xl flex items-center justify-center text-[#C9A227] font-heading font-extrabold text-xl shadow-md border border-[#C9A227]/30">
                    {agent.initial}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#0A2647]">{agent.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{agent.specialty}</p>
                    <span className="inline-block mt-2 text-[10px] font-extrabold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {agent.badge}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600 mb-8">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span>Client Rating</span>
                    <span className="font-bold text-[#0A2647] flex items-center gap-1">
                      ⭐ {agent.rating} ({agent.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span>Closed Deals</span>
                    <span className="font-bold text-[#0A2647] font-mono">{agent.sold} Homes Sold</span>
                  </div>
                </div>
              </div>

              <a
                href="/contact"
                className="block w-full bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white font-heading font-bold text-xs py-3.5 rounded-xl transition-all text-center"
              >
                Book Agent Consultation →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold">
            Are You a Top Producing Agent?
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg font-body max-w-2xl mx-auto">
            Apply to join our exclusive realtor partner network and receive 100% verified off-market seller leads in your target zip codes.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/contact?topic=realtor"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
            >
              Apply as Partner Agent →
            </a>
          </div>
        </div>
      </section>
      <ChatWidgetWrapper context="agent" leadType="agent" />
    </main>
  );
}
