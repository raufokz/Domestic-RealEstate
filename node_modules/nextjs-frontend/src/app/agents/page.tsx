import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { getAgents, agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Agent Directory",
  description: "Connect with top-rated, vetted real estate agents across the US and Canada. Find your perfect agent match.",
  path: "/agents",
  keywords: ["real estate agents", "find agent", "top realtors", "agent directory"],
});

export default async function AgentsPage() {
  const agents = await getAgents({}, 24);

  const agentsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Verified Real Estate Agent Directory",
    url: `${SITE_URL}/agents`,
    itemListElement: agents.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: agentName(a),
      url: `${SITE_URL}/agents/${a.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      {agents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agentsSchema) }}
        />
      )}

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

      {/* Agent Cards Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        {agents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 font-body">No agents are published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => {
              const rating = agent.rating != null ? Number(agent.rating) : 0;
              const avatar = storageUrl(agent.user?.avatar);
              return (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.slug}`}
                  className="bg-white rounded-3xl border border-slate-200 p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                      <div className="w-16 h-16 bg-[#0A2647] rounded-2xl flex items-center justify-center text-[#C9A227] font-heading font-extrabold text-xl shadow-md border border-[#C9A227]/30 overflow-hidden">
                        {avatar ? (
                          <Image src={avatar} alt={agentName(agent)} width={64} height={64} className="w-full h-full object-cover" />
                        ) : (
                          agentInitials(agent)
                        )}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-[#0A2647]">{agentName(agent)}</h3>
                        {agent.headline && <p className="text-slate-500 text-xs mt-0.5">{agent.headline}</p>}
                        {agent.is_featured && (
                          <span className="inline-block mt-2 text-[10px] font-extrabold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Featured Agent
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-600 mb-8">
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span>Client Rating</span>
                        <span className="font-bold text-[#0A2647] flex items-center gap-1">
                          {rating > 0 ? `⭐ ${rating.toFixed(1)} (${agent.review_count ?? 0} reviews)` : "New agent"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span>Closed Deals</span>
                        <span className="font-bold text-[#0A2647] font-mono">{agent.sales_count ?? 0} Homes Sold</span>
                      </div>
                    </div>
                  </div>

                  <span className="block w-full bg-[#0A2647] group-hover:bg-[#C9A227] text-white font-heading font-bold text-xs py-3.5 rounded-xl transition-all text-center">
                    View Agent Profile →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
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
            <Link
              href="/register?role=agent"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
            >
              Join Preferred Network Now →
            </Link>
          </div>
        </div>
      </section>
      <ChatWidgetWrapper context="agent" leadType="agent" />
    </main>
  );
}
