import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Mortgage Lender Partnership Program",
  description: "Partner with Domestic Real Estate to connect with pre-qualified home buyers and expand your mortgage lending business.",
  path: "/lenders",
  keywords: ["mortgage lender", "home loan partner", "mortgage referral program", "lender partnership"],
});

const lendersSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Verified Mortgage Lender Directory",
  url: "https://domesticrealestate.us/lenders",
};

const lenders = [
  { name: "Apex National Mortgage", type: "Full-Service Direct Lender", NMLS: "NMLS #184920", rating: 4.9, products: "Conventional, FHA, VA, Jumbo", speed: "14-Day Fast Close" },
  { name: "Summit Capital Funding", type: "Investor & DSCR Specialist", NMLS: "NMLS #203491", rating: 5.0, products: "DSCR, Hard Money, Fix-Flip", speed: "7-Day Fast Close" },
  { name: "Horizon Home Loans", type: "First-Time Buyer Partner", NMLS: "NMLS #993210", rating: 4.8, products: "Down Payment Assistance, FHA", speed: "21-Day Standard Close" },
  { name: "Heritage Private Wealth Lending", type: "Jumbo Luxury Specialist", NMLS: "NMLS #448102", rating: 4.9, products: "Jumbo, Super Jumbo, Portfolio", speed: "18-Day Close" },
];

export default function LendersPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lendersSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Vetted Lending Marketplace
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Lock In Competitive <span className="text-[#C9A227]">Mortgage Rates</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Connect directly with verified lenders offering pre-approval letters, low down-payment loans, and investor DSCR products with accelerated closing windows.
          </p>
        </div>
      </section>

      {/* Lender Directory */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2647]">
            Featured Lending Partners
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Every lender in our marketplace is licensed, NMLS-verified, and benchmarked for closing efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lenders.map((lender, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-[#0A2647]">{lender.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{lender.type} • {lender.NMLS}</p>
                  </div>
                  <span className="bg-[#C9A227]/10 text-[#C9A227] font-extrabold border border-[#C9A227]/30 text-xs px-3 py-1 rounded-full">
                    ⭐ {lender.rating}
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-600 mb-8">
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="font-bold text-[#0A2647]">Loan Offerings:</span>
                    <span>{lender.products}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="font-bold text-[#0A2647]">Closing Velocity:</span>
                    <span className="text-emerald-600 font-extrabold">{lender.speed}</span>
                  </div>
                </div>
              </div>

              <a
                href="/contact"
                className="block w-full bg-[#0A2647] hover:bg-[#C9A227] hover:text-[#0A2647] text-white font-heading font-bold text-xs py-3.5 rounded-xl transition-all text-center"
              >
                Apply for Pre-Approval →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-[#0A2647] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold">
            Are You a Licensed Lender?
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg font-body max-w-2xl mx-auto">
            Join our lending platform to receive pre-screened borrower applications and buyer pre-approval requests.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/contact?topic=lender"
              className="bg-[#C9A227] hover:bg-amber-400 text-[#0A2647] font-heading font-extrabold text-sm px-8 py-4 rounded-xl shadow-gold hover:scale-105 transition-all"
            >
              Join Lender Network →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
