import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Client Testimonials & Success Stories",
  description: "Read what our clients say about their experience with Domestic Real Estate. Real stories from real buyers, sellers, and investors.",
  path: "/testimonials",
  keywords: ["client testimonials", "success stories", "real estate reviews", "customer experiences"],
});

const reviews = [
  {
    quote:
      "Domestic RE's Zip Code Exclusivity program completely transformed my brokerage. In 6 months, we closed over $18M in off-market seller leads with zero competing agents.",
    name: "Samantha Vance",
    role: "Managing Broker, Beverly Hills",
    stars: 5,
    tag: "Verified Agent Partner",
  },
  {
    quote:
      "I obtained an instant AI home valuation on Monday, received 3 competitive cash offers by Wednesday, and closed escrow 10 days later. Absolutely seamless experience!",
    name: "Marcus Sterling",
    role: "Home Seller, Dallas TX",
    stars: 5,
    tag: "Verified Home Seller",
  },
  {
    quote:
      "Finding our family's luxury home was effortless. The AI property matching tool surfaced an off-market coastal listing that wasn't even on Zillow yet.",
    name: "Elena & David Rostova",
    role: "Home Buyers, Malibu CA",
    stars: 5,
    tag: "Verified Home Buyer",
  },
  {
    quote:
      "As an institutional investor acquiring 20+ doors per quarter, the skip-tracing data and pre-calculated ARV metrics save our underwriting team hundreds of hours.",
    name: "Richard Vance",
    role: "Managing Principal, Vanguard Capital",
    stars: 5,
    tag: "Verified Investor",
  },
];

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Proven Trust & Excellence
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Client Success <span className="text-[#C9A227]">Stories</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            See how Domestic Real Estate empowers buyers, sellers, agents, and institutional investors to achieve extraordinary real estate results.
          </p>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    {rev.tag}
                  </span>
                  <div className="text-[#C9A227] text-sm font-bold">
                    {"⭐".repeat(rev.stars)}
                  </div>
                </div>

                <p className="text-slate-700 text-base leading-relaxed italic mb-6">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-[#0A2647] text-base">{rev.name}</h4>
                  <p className="text-slate-500 text-xs">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold">
            Ready to Write Your Success Story?
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg font-body max-w-2xl mx-auto">
            Join thousands of satisfied clients using Domestic Real Estate today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/register"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
            >
              Get Started Now →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
