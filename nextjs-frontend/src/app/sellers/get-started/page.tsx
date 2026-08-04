import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Get Started as a Seller | Domestic Real Estate',
  description: 'Start your home selling journey with Domestic Real Estate. Follow our simple 3-step process to list and sell your property for top dollar.',
};

const steps = [
  {
    icon: '📊',
    title: 'Step 1: Get Your Valuation',
    description: 'Receive a free, data-driven estimate of your home\'s current market value using our advanced AI valuation tool and comparable sales data.',
    href: '/sellers/request-valuation',
  },
  {
    icon: '📋',
    title: 'Step 2: List Your Property',
    description: 'Work with our expert agents to prepare, price, and list your home on the MLS with professional photography, staging, and maximum market exposure.',
    href: '/sellers/list-your-property',
  },
  {
    icon: '🤝',
    title: 'Step 3: Close the Deal',
    description: 'Negotiate the best offer, navigate inspections and appraisals, and close with confidence. We handle the paperwork so you don\'t have to.',
    href: '/contact',
  },
];

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Seller Onboarding"
        title="Get Started as a Seller"
        subtitle="Selling your home is a big decision. We make it simple with a proven 3-step process designed to maximize your return and minimize your stress."
      />

      <FeaturesSection
        title="Our 3-Step Selling Process"
        subtitle="From valuation to closing, we guide you every step of the way."
        features={steps}
        columns={3}
      />

      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-heading text-4xl font-bold text-[#0A2647]">98%</p>
              <p className="font-body text-gray-500 text-sm mt-1">Client Satisfaction Rate</p>
            </div>
            <div>
              <p className="font-heading text-4xl font-bold text-[#0A2647]">14 Days</p>
              <p className="font-body text-gray-500 text-sm mt-1">Average Days on Market</p>
            </div>
            <div>
              <p className="font-heading text-4xl font-bold text-[#0A2647]">$52K+</p>
              <p className="font-body text-gray-500 text-sm mt-1">Above Asking Price</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Why Sellers Choose Us</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Domestic Real Estate combines cutting-edge technology with deep local expertise.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'AI-Powered Valuations', desc: 'Get accurate, real-time pricing backed by comparable market data.' },
              { label: 'Professional Marketing', desc: 'Drone footage, 3D tours, premium photography, and social media campaigns.' },
              { label: 'Top 1% Agents', desc: 'Work with experienced, licensed agents who specialize in your neighborhood.' },
              { label: 'Transparent Process', desc: 'Track every milestone from listing to closing in your seller dashboard.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#C9A227]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#C9A227] font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[#0A2647] mb-1">{item.label}</h3>
                  <p className="font-body text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Sell Your Home?"
        subtitle="Get your free home valuation today and take the first step toward maximizing your property's value."
        primaryAction={{ label: 'Get Free Valuation', href: '/sellers/request-valuation' }}
        secondaryAction={{ label: 'Talk to an Agent', href: '/sellers/list-your-property' }}
      />
    </main>
  );
}
