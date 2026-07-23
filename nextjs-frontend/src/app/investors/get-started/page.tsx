import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Get Started as an Investor | Domestic Real Estate',
  description: 'Start your real estate investing journey with Domestic Real Estate. Access off-market deals, financial tools, and expert guidance.',
};

const steps = [
  {
    icon: '📋',
    title: 'Step 1: Define Your Buy Box',
    description:
      'Tell us your investment criteria — property type, budget, target ROI, and preferred areas. We match deals that fit your strategy.',
    href: '/investors/buy-box',
  },
  {
    icon: '📊',
    title: 'Step 2: Analyze Deals',
    description:
      'Use our deal analyzer, ROI calculator, and cash flow tools to evaluate every opportunity before you commit a single dollar.',
    href: '/investors/deal-analyzer',
  },
  {
    icon: '🤝',
    title: 'Step 3: Close & Grow',
    description:
      'Submit your inquiry, connect with our investor agents, close on your deal, and scale your portfolio with confidence.',
    href: '/investors/inquiry',
  },
];

export default function InvestorGetStartedPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Get Started"
        title="Start Investing in Real Estate"
        subtitle="From defining your strategy to closing your first deal, we give you the tools and guidance to invest with confidence."
      />

      <FeaturesSection
        title="How It Works"
        subtitle="Three steps to building your real estate portfolio"
        features={steps}
        columns={3}
      />

      <CTASection
        title="Ready to Find Your First Deal?"
        subtitle="Browse our current investment opportunities or submit your criteria and let us match deals to your buy box."
        primaryAction={{ label: 'View Deals', href: '/investors/deals' }}
        secondaryAction={{ label: 'Submit Inquiry', href: '/investors/inquiry' }}
      />
    </main>
  );
}
