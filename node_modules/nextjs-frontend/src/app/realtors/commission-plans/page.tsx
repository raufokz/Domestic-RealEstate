import type { Metadata } from 'next';
import { PageHero, FAQSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Commission Plans',
};

const plans = [
  {
    name: 'Starter',
    commission: '70/30',
    description: 'For agents building their business and looking for a supportive environment.',
    features: ['70% commission split', 'Basic lead access', 'CRM platform', 'Standard support', 'Monthly training webinars', 'Marketing templates'],
    highlighted: false,
  },
  {
    name: 'Professional',
    commission: '80/20',
    description: 'For experienced agents who want more earning potential and premium tools.',
    features: ['80% commission split', 'Priority lead access', 'Advanced CRM & analytics', 'Dedicated support line', 'Weekly coaching calls', 'Custom marketing assets', 'E&O insurance access'],
    highlighted: true,
  },
  {
    name: 'Elite',
    commission: '90/10',
    description: 'For top producers who want the best split and exclusive perks.',
    features: ['90% commission split', 'Exclusive lead priority', 'Full platform access', 'Personal business consultant', '1-on-1 mentorship', 'Premium branding tools', 'E&O insurance included', 'Annual retreat invitation'],
    highlighted: false,
  },
];

const faqs = [
  { question: 'How is my commission tier determined?', answer: 'Your tier is based on your annual transaction volume and production. As you close more deals, you automatically qualify for higher splits.' },
  { question: 'Are there any monthly fees?', answer: 'There are no mandatory monthly desk fees. Our plans are commission-based so you only pay when you earn.' },
  { question: 'When do I get paid?', answer: 'Commissions are disbursed within 48 hours of closing and funding. You can choose direct deposit or wire transfer.' },
  { question: 'Can I switch plans?', answer: 'Yes, you can request a plan change at any time. Changes take effect at the beginning of the next calendar month.' },
  { question: 'Is E&O insurance included?', answer: 'E&O insurance is included in the Elite plan and available at preferential group rates for Professional plan members.' },
  { question: 'What training is included?', answer: 'All plans include access to our on-demand training library. Professional and Elite plans include live coaching and mentorship.' },
];

export default function CommissionPlansPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Commission Plans"
        title="Commission Plans"
        subtitle="Transparent, competitive commission structures that reward your production and grow with your career."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Choose Your Plan</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Select the plan that fits your business. Upgrade anytime as your production grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 border-2 transition-shadow ${plan.highlighted ? 'border-[#C9A227] bg-[#C9A227]/5 shadow-lg scale-[1.02]' : 'border-gray-200 bg-white hover:shadow-lg'}`}>
                {plan.highlighted && (
                  <span className="inline-block bg-[#C9A227] text-[#0A2647] text-xs font-heading font-bold px-3 py-1 rounded-full mb-4">Most Popular</span>
                )}
                <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-heading text-4xl font-bold text-[#0A2647]">{plan.commission}</span>
                  <span className="font-body text-gray-500 text-sm">split</span>
                </div>
                <p className="font-body text-gray-600 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm font-body text-gray-700">
                      <svg className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/realtors/join" className={`block text-center font-heading font-semibold py-3 rounded-lg transition-colors ${plan.highlighted ? 'bg-[#C9A227] text-[#0A2647] hover:bg-[#C9A227]/90' : 'bg-[#0A2647] text-white hover:bg-[#0A2647]/90'}`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection
        title="Commission Plan FAQs"
        faqs={faqs}
      />

      <CTASection
        title="Have Questions About Our Plans?"
        subtitle="Our team is here to help you find the right plan for your business. Reach out anytime."
        primaryAction={{ label: 'Contact Us', href: '/contact' }}
        secondaryAction={{ label: 'Apply Now', href: '/realtors/join' }}
      />
    </main>
  );
}
