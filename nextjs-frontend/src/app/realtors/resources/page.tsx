import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Realtor Resources',
};

export default function RealtorResourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Resources"
        title="Realtor Resources"
        subtitle="Access templates, guides, market data, and tools to streamline your real estate business."
      />

      <FeaturesSection
        title="Resource Categories"
        subtitle="Everything you need at your fingertips, organized for quick and easy access."
        features={[
          { icon: '📄', title: 'Document Templates', description: 'Download professionally drafted listing agreements, buyer agency contracts, disclosure forms, and more.' },
          { icon: '📊', title: 'Market Reports', description: 'Access local and national market data, trend analyses, and quarterly reports to share with your clients.' },
          { icon: '📖', title: 'Guides & Playbooks', description: 'Step-by-step guides for common transactions, from first-time buyer coaching to luxury property marketing.' },
          { icon: '🎬', title: 'Video Library', description: 'Watch recorded webinars, training sessions, and how-to tutorials on demand from any device.' },
          { icon: '🔧', title: 'Tools & Calculators', description: 'Use mortgage calculators, ROI estimators, comparables tools, and more to provide instant value to clients.' },
          { icon: '💬', title: 'Community Forum', description: 'Connect with fellow realtors to share best practices, ask questions, and collaborate on deals.' },
        ]}
      />

      <CTASection
        title="Unlock All Resources"
        subtitle="Join our network and get instant access to our full library of realtor resources and tools."
        primaryAction={{ label: 'Join Now', href: '/realtors/join' }}
        secondaryAction={{ label: 'View Training', href: '/realtors/training' }}
      />
    </main>
  );
}
