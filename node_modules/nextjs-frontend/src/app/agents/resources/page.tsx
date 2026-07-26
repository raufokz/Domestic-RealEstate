import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Agent Resources',
};

export default function AgentResourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Resources"
        title="Agent Resources"
        subtitle="Access a comprehensive library of tools, templates, and reference materials built for agents."
      />

      <FeaturesSection
        title="Resource Library"
        subtitle="Everything you need to run your business efficiently and serve your clients exceptionally well."
        features={[
          { icon: '📑', title: 'Forms & Templates', description: 'Pre-approved contracts, disclosure forms, marketing templates, and checklists ready for immediate use.' },
          { icon: '📊', title: 'Market Intelligence', description: 'Real-time market data, neighborhood reports, and pricing trend analyses to share with your clients.' },
          { icon: '🎥', title: 'Video Tutorials', description: 'Step-by-step video guides for using the platform, transaction processes, and advanced sales strategies.' },
          { icon: '📰', title: 'Industry News', description: 'Curated industry news, regulatory updates, and market commentary to keep you informed and current.' },
          { icon: '🧮', title: 'Calculators & Tools', description: 'Mortgage calculators, affordability estimators, investment analyzers, and other useful client-facing tools.' },
          { icon: '👥', title: 'Peer Network', description: 'Join agent-only forums, discussion groups, and virtual meetups to learn from and collaborate with peers.' },
        ]}
      />

      <CTASection
        title="Access the Full Library"
        subtitle="Join our team and unlock all agent resources, tools, and training materials."
        primaryAction={{ label: 'Apply Now', href: '/agents/apply' }}
        secondaryAction={{ label: 'View Training', href: '/agents/training' }}
      />
    </main>
  );
}
