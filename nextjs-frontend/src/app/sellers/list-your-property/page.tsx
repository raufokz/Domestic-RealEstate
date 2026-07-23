import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'List Your Property | Domestic Real Estate',
  description: 'List your property with Domestic Real Estate and reach qualified buyers through our premium marketing channels and expert agent network.',
};

const features = [
  {
    icon: '📸',
    title: 'Professional Photography & Staging',
    description: 'High-resolution photography, virtual staging, and 3D tours that make your property stand out from the competition.',
  },
  {
    icon: '📢',
    title: 'Maximum Market Exposure',
    description: 'Your listing syndicated to Zillow, Realtor.com, Redfin, and 500+ local and national real estate platforms.',
  },
  {
    icon: '🎯',
    title: 'Targeted Digital Marketing',
    description: 'Social media campaigns, Google Ads, and email blasts to reach thousands of pre-qualified buyers in your area.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Pricing Strategy',
    description: 'Data-driven pricing that balances speed and profit, adjusting in real-time based on market activity and buyer demand.',
  },
  {
    icon: '📝',
    title: 'Expert Negotiation',
    description: 'Our agents negotiate every offer to maximize your net proceeds, handling counteroffers, contingencies, and concessions.',
  },
  {
    icon: '⚡',
    title: 'Fast Close Guarantee',
    description: 'Streamlined transaction management with dedicated closing coordinators. Most deals close in 30 days or less.',
  },
];

export default function ListYourPropertyPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="List With Us"
        title="List Your Property"
        subtitle="Get premium marketing, expert agents, and proven results when you list with Domestic Real Estate."
        bg="burgundy"
      />

      <FeaturesSection
        title="Why Sellers Choose Domestic Real Estate"
        subtitle="We combine technology, marketing, and local expertise to sell your home faster and for more."
        features={features}
        columns={3}
      />

      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-heading text-4xl font-bold text-[#0A2647]">500+</p>
              <p className="font-body text-gray-500 text-sm mt-1">Platforms We Syndicate To</p>
            </div>
            <div>
              <p className="font-heading text-4xl font-bold text-[#0A2647]">14 Days</p>
              <p className="font-body text-gray-500 text-sm mt-1">Average Days on Market</p>
            </div>
            <div>
              <p className="font-heading text-4xl font-bold text-[#0A2647]">98%</p>
              <p className="font-body text-gray-500 text-sm mt-1">List-to-Sale Price Ratio</p>
            </div>
            <div>
              <p className="font-heading text-4xl font-bold text-[#8B1E3F]">$52K</p>
              <p className="font-body text-gray-500 text-sm mt-1">Above Asking on Average</p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to List Your Property?"
        subtitle="Contact us today for a free consultation and custom marketing plan for your home."
        primaryAction={{ label: 'Get Started Today', href: '/sellers/request-valuation' }}
        secondaryAction={{ label: 'View Selling Guide', href: '/sellers/selling-guide' }}
        bg="burgundy"
      />
    </main>
  );
}
