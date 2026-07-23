import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Get Started as a Buyer | Domestic Real Estate',
  description: 'Start your home buying journey with Domestic Real Estate. A simple 3-step process from pre-approval to closing.',
};

const steps = [
  {
    icon: '🏦',
    title: 'Step 1: Get Pre-Approved',
    description:
      'Connect with our lending partners to determine your budget and get a pre-approval letter. This strengthens your offer and speeds up the buying process.',
    href: '/buyers/pre-approval',
  },
  {
    icon: '🏠',
    title: 'Step 2: Find Your Home',
    description:
      'Browse MLS listings, schedule tours, and let your dedicated buyer agent negotiate the best deal on your behalf.',
    href: '/properties',
  },
  {
    icon: '🔑',
    title: 'Step 3: Close the Deal',
    description:
      'Complete inspections, finalize your mortgage, and sign the closing documents. From offer to keys in as little as 30 days.',
    href: '/buyers/guide',
  },
];

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Get Started"
        title="Start Your Home Buying Journey"
        subtitle="From pre-approval to closing day, we guide you through every step. Your dream home is closer than you think."
      />

      <FeaturesSection
        title="How It Works"
        subtitle="Three simple steps to homeownership"
        features={steps}
        columns={3}
      />

      <CTASection
        title="Ready to Get Pre-Approved?"
        subtitle="Take the first step today. Our lending partners will help you find the right mortgage product for your budget."
        primaryAction={{ label: 'Get Pre-Approved', href: '/buyers/pre-approval' }}
        secondaryAction={{ label: 'Talk to an Agent', href: '/buyers/request-agent' }}
      />
    </main>
  );
}
