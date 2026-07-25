import type { Metadata } from 'next';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Wholesale Deals | Domestic Real Estate',
  description: 'Browse current wholesale deals from Domestic Real Estate. Find discounted properties with strong ROI potential.',
};

const DEALS = [
  { address: '4821 Oakwood Dr', city: 'Houston', state: 'TX', price: '$145,000', arv: '$240,000', repair: '$35,000', type: 'Single Family', roi: '42%' },
  { address: '917 Maple Ave', city: 'Memphis', state: 'TN', price: '$82,000', arv: '$165,000', repair: '$28,000', type: 'Single Family', roi: '51%' },
  { address: '3305 Riverside Blvd', city: 'Jacksonville', state: 'FL', price: '$118,000', arv: '$210,000', repair: '$30,000', type: 'Multi Family', roi: '47%' },
  { address: '619 Pine St', city: 'Birmingham', state: 'AL', price: '$67,000', arv: '$135,000', repair: '$22,000', type: 'Single Family', roi: '55%' },
  { address: '2740 Cedar Ln', city: 'Atlanta', state: 'GA', price: '$165,000', arv: '$295,000', repair: '$40,000', type: 'Townhouse', roi: '48%' },
  { address: '883 Birch Ct', city: 'Charlotte', state: 'NC', price: '$99,000', arv: '$185,000', repair: '$26,000', type: 'Condo', roi: '43%' },
];

export default function DealsPage() {
  return (
    <main>
      <PageHero
        badge="Deals"
        title="Wholesale Deals"
        subtitle="Browse our current inventory of discounted properties. Each deal is pre-vetted and ready for your review."
      />
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEALS.map((deal, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="bg-[#0A2647] px-6 py-4 flex items-center justify-between">
                  <span className="font-heading text-xl font-bold text-[#C9A227]">{deal.price}</span>
                  <span className="bg-[#C9A227]/20 text-[#C9A227] font-heading text-xs font-semibold px-3 py-1 rounded-full">
                    ROI {deal.roi}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold text-[#0A2647] mb-1">{deal.address}</h3>
                  <p className="font-body text-gray-500 text-sm mb-5">{deal.city}, {deal.state}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="font-body text-xs text-gray-400 uppercase tracking-wide">ARV</p>
                      <p className="font-heading font-semibold text-[#0A2647]">{deal.arv}</p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-gray-400 uppercase tracking-wide">Repairs</p>
                      <p className="font-heading font-semibold text-[#0A2647]">{deal.repair}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-body text-xs text-gray-400 uppercase tracking-wide">Type</p>
                      <p className="font-heading font-semibold text-[#0A2647]">{deal.type}</p>
                    </div>
                  </div>
                  <button className="w-full bg-[#0A2647] text-white font-heading font-semibold py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors text-sm group-hover:bg-[#C9A227] group-hover:text-[#0A2647]">
                    Request Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTASection
        title="Have a Deal to Sell?"
        subtitle="Submit your wholesale property and get it in front of hundreds of qualified buyers."
        primaryAction={{ label: 'Submit a Deal', href: '/wholesalers/submit-deal' }}
        secondaryAction={{ label: 'Join Our Network', href: '/wholesalers/buyer-list' }}
      />
    </main>
  );
}
