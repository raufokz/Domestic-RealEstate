import type { Metadata } from 'next';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Affiliate Program',
};

const tiers = [
  {
    name: 'Standard',
    commission: '25%',
    description: 'For individuals and small websites referring clients to our platform.',
    features: ['25% referral commission', 'Basic tracking dashboard', 'Standard banners & links', 'Monthly payouts', 'Email support'],
  },
  {
    name: 'Premium',
    commission: '35%',
    description: 'For established content creators, influencers, and media partners.',
    features: ['35% referral commission', 'Advanced analytics dashboard', 'Custom landing pages', 'Bi-weekly payouts', 'Priority support', 'Dedicated account manager'],
  },
  {
    name: 'Enterprise',
    commission: '50%',
    description: 'For large publishers, networks, and organizations with significant traffic.',
    features: ['50% referral commission', 'Full API access', 'White-label options', 'Weekly payouts', 'Dedicated partnership team', 'Custom commission structures', 'Co-marketing opportunities'],
  },
];

export default function AffiliatePage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Affiliate"
        title="Affiliate Program"
        subtitle="Earn commissions by referring clients to Domestic Real Estate. Simple, transparent, and rewarding."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Commission Tiers</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Earn more as you grow. Our tiered structure rewards consistent performance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <div key={i} className={`rounded-2xl p-8 border-2 transition-shadow ${i === 1 ? 'border-[#C9A227] bg-[#C9A227]/5 shadow-lg scale-[1.02]' : 'border-gray-200 bg-white hover:shadow-lg'}`}>
                {i === 1 && (
                  <span className="inline-block bg-[#C9A227] text-[#0A2647] text-xs font-heading font-bold px-3 py-1 rounded-full mb-4">Best Value</span>
                )}
                <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-heading text-4xl font-bold text-[#0A2647]">{tier.commission}</span>
                  <span className="font-body text-gray-500 text-sm">commission</span>
                </div>
                <p className="font-body text-gray-600 text-sm mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm font-body text-gray-700">
                      <svg className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/contact" className={`block text-center font-heading font-semibold py-3 rounded-lg transition-colors ${i === 1 ? 'bg-[#C9A227] text-[#0A2647] hover:bg-[#C9A227]/90' : 'bg-[#0A2647] text-white hover:bg-[#0A2647]/90'}`}>
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Start Earning Today"
        subtitle="Sign up for our affiliate program and start earning commissions within days."
        primaryAction={{ label: 'Join Affiliate Program', href: '/contact' }}
        secondaryAction={{ label: 'Learn More', href: '/partners' }}
      />
    </main>
  );
}
