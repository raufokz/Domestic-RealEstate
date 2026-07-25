import type { Metadata } from 'next';
import { PageHero, FeaturesSection, StatsSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Realtor Benefits',
};

export default function RealtorBenefitsPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Benefits"
        title="Realtor Benefits"
        subtitle="Discover the exclusive advantages of partnering with Domestic Real Estate as a licensed realtor."
      />

      <FeaturesSection
        title="Why Partner With Us"
        subtitle="We invest in your growth so you can focus on what matters most: your clients."
        features={[
          { icon: '🤝', title: 'Exclusive Lead Access', description: 'Receive pre-qualified, AI-matched leads based on your specialty and service area before they hit the open market.' },
          { icon: '📱', title: 'Technology Platform', description: 'Full access to our cutting-edge platform with property analytics, market insights, and client management tools.' },
          { icon: '💼', title: 'Brand Association', description: 'Leverage the trusted Domestic Real Estate brand to enhance your credibility and attract more clients.' },
          { icon: '📈', title: 'Growth Support', description: 'Dedicated business consultants help you set goals, optimize your pipeline, and scale your operations.' },
          { icon: '🛡️', title: 'E&O Coverage', description: 'Access to group errors and omissions insurance at preferential rates through our partnership programs.' },
          { icon: '🌐', title: 'Nationwide Network', description: 'Connect with agents across the country for referrals, co-listings, and knowledge sharing opportunities.' },
        ]}
      />

      <StatsSection
        stats={[
          { value: '2,500+', label: 'Active Realtors' },
          { value: '$3.2B', label: 'Annual Transactions' },
          { value: '94%', label: 'Satisfaction Rate' },
          { value: '45%', label: 'Average Income Increase' },
        ]}
      />

      <CTASection
        title="Start Enjoying These Benefits Today"
        subtitle="Apply now and discover how Domestic Real Estate can take your real estate career to the next level."
        primaryAction={{ label: 'Apply Now', href: '/realtors/join' }}
        secondaryAction={{ label: 'View Commission Plans', href: '/realtors/commission-plans' }}
      />
    </main>
  );
}
