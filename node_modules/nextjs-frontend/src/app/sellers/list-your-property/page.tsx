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
    description: 'Your listing syndicated to Zillow, Realtor.com, Redfin, and major local and national real estate platforms.',
  },
  {
    icon: '🎯',
    title: 'Targeted Digital Marketing',
    description: 'Social media campaigns, Google Ads, and email blasts to reach pre-qualified buyers in your area.',
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
