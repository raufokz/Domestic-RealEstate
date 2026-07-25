import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'White-Label Brokerage',
};

export default function WhiteLabelPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        bg="burgundy"
        badge="White-Label"
        title="White-Label Brokerage"
        subtitle="Launch your own branded brokerage powered by Domestic Real Estate's technology, compliance, and operational infrastructure."
      />

      <FeaturesSection
        title="White-Label Features"
        subtitle="Everything you need to run your own brokerage, without building the technology from scratch."
        features={[
          { icon: '🎨', title: 'Custom Branding', description: 'Your logo, your colors, your domain. The entire platform experience is customized to match your brokerage identity.' },
          { icon: '💻', title: 'Full Technology Stack', description: 'CRM, transaction management, marketing automation, lead routing, and analytics — all white-labeled and ready to use.' },
          { icon: '🛡️', title: 'Compliance Management', description: 'Built-in compliance workflows, license tracking, E&O management, and regulatory reporting to keep your brokerage protected.' },
          { icon: '💰', title: 'Revenue Sharing', description: 'Flexible revenue sharing models that align with your business goals and growth trajectory.' },
          { icon: '🎓', title: 'Training Platform', description: 'White-labeled training and onboarding programs for your agents, fully customizable with your own content.' },
          { icon: '🤝', title: 'Dedicated Support', description: 'A dedicated account manager and support team to ensure smooth operations and help you scale effectively.' },
        ]}
      />

      <CTASection
        title="Ready to Launch Your Brokerage?"
        subtitle="Let's discuss how our white-label solution can bring your brokerage vision to life."
        primaryAction={{ label: 'Start the Conversation', href: '/contact' }}
        secondaryAction={{ label: 'View Brokerage Solutions', href: '/brokerages' }}
        bg="burgundy"
      />
    </main>
  );
}
