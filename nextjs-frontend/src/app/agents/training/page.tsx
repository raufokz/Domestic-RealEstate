import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Agent Training',
};

export default function AgentTrainingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Training"
        title="Agent Training"
        subtitle="Invest in your professional growth with comprehensive training programs designed for modern real estate agents."
      />

      <FeaturesSection
        title="Training Programs"
        subtitle="Structured learning paths to sharpen your skills and expand your market knowledge."
        features={[
          { icon: '📚', title: 'New Agent Onboarding', description: 'A structured 30-day program covering platform tools, compliance basics, and foundational sales techniques.' },
          { icon: '🔍', title: 'Market Analysis', description: 'Learn to read market data, prepare CMAs, and present compelling comparative analyses to your clients.' },
          { icon: '🎯', title: 'Client Acquisition', description: 'Master prospecting, networking, and lead conversion strategies that fill your pipeline consistently.' },
          { icon: '📝', title: 'Transaction Mastery', description: 'Navigate complex transactions from offer to closing with confidence using our step-by-step guides.' },
          { icon: '💻', title: 'Tech proficiency', description: 'Become proficient with our platform, MLS tools, virtual tour technology, and digital marketing suite.' },
          { icon: '🏅', title: 'Certification Programs', description: 'Earn specialized certifications in luxury, relocation, investment, and commercial real estate.' },
        ]}
      />

      <CTASection
        title="Begin Your Training Journey"
        subtitle="Start with our onboarding program and unlock new training modules as you grow."
        primaryAction={{ label: 'Apply as Agent', href: '/agents/apply' }}
        secondaryAction={{ label: 'View Benefits', href: '/agents/benefits' }}
      />
    </main>
  );
}
