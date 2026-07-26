import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Agent Benefits',
};

export default function AgentBenefitsPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Benefits"
        title="Agent Benefits"
        subtitle="Experience the advantages of working with Domestic Real Estate as a licensed agent."
      />

      <FeaturesSection
        title="Why Agents Choose Us"
        subtitle="We provide the tools, support, and environment to help you build a thriving real estate career."
        features={[
          { icon: '🚀', title: 'Advanced Technology', description: 'Access our proprietary AI-powered platform with predictive analytics, smart matching, and automated workflows.' },
          { icon: '📋', title: 'Streamlined Operations', description: 'Simplified transaction management, digital document signing, and automated compliance tracking save you hours every week.' },
          { icon: '🎓', title: 'Ongoing Education', description: 'Continuing education credits, advanced certifications, and professional development programs to keep you at the top.' },
          { icon: '🏢', title: 'Brokerage Support', description: 'Experienced managing brokers available for deal review, contract questions, and professional guidance whenever you need it.' },
          { icon: '📣', title: 'Brand Marketing', description: 'National brand recognition, co-branded marketing materials, and social media amplification to boost your visibility.' },
          { icon: '🌐', title: 'Referral Network', description: 'Participate in our cross-market referral system and earn referral fees when you connect clients with agents in other areas.' },
        ]}
      />

      <CTASection
        title="Ready to Experience the Difference?"
        subtitle="Apply to join Domestic Real Estate today and discover what our agents already know."
        primaryAction={{ label: 'Apply Now', href: '/agents/apply' }}
        secondaryAction={{ label: 'View Training', href: '/agents/training' }}
      />
    </main>
  );
}
