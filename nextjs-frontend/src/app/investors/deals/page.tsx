import type { Metadata } from 'next';
import { PageHero, FeaturesSection, StatsSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Investment Opportunities | Domestic Real Estate',
  description: 'Browse verified off-market deals, pre-foreclosures, distressed properties, and high-yield rental opportunities for real estate investors.',
};

const dealTypes = [
  {
    icon: '🏚️',
    title: 'Distressed Properties',
    description: 'Below-market properties needing renovation — ideal for buy-and-hold or flip strategies with built-in equity.',
  },
  {
    icon: '⚖️',
    title: 'Pre-Foreclosures',
    description: 'Negotiate directly with motivated sellers before the property hits the auction block. Higher margins, less competition.',
  },
  {
    icon: '🔑',
    title: 'Turnkey Rentals',
    description: 'Fully renovated, tenanted properties generating passive income from day one. Perfect for hands-off investors.',
  },
  {
    icon: '🏗️',
    title: 'Fix & Flip',
    description: 'Value-add opportunities with clear renovation scope, projected ARV, and fast exit timelines.',
  },
  {
    icon: '🏘️',
    title: 'Multi-Family',
    description: 'Duplexes, triplexes, and small apartment buildings with multiple income streams and scalable cash flow.',
  },
  {
    icon: '📐',
    title: 'Land & Development',
    description: 'Vacant lots and development-ready parcels in high-growth areas for ground-up construction or subdivision.',
  },
];

const stats = [
  { value: '500+', label: 'Deals Closed' },
  { value: '18.4%', label: 'Avg. ROI' },
  { value: '$120M+', label: 'Transaction Volume' },
  { value: '92%', label: 'Investor Retention' },
];

export default function DealsPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Deal Board"
        title="Investment Opportunities"
        subtitle="Access verified off-market deals and high-yield properties curated specifically for real estate investors."
      />

      <FeaturesSection
        title="Deal Types We Source"
        subtitle="From distressed flips to turnkey rentals, we cover every investment strategy"
        features={dealTypes}
        columns={3}
      />

      <StatsSection stats={stats} />

      <CTASection
        title="Get Matched to Deals"
        subtitle="Tell us your investment criteria and we'll send you deals that match your buy box before they hit the market."
        primaryAction={{ label: 'Define Your Buy Box', href: '/investors/buy-box' }}
        secondaryAction={{ label: 'Contact Us', href: '/investors/inquiry' }}
      />
    </main>
  );
}
