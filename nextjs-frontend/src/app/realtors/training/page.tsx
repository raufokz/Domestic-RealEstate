import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Realtor Training',
};

export default function RealtorTrainingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Training"
        title="Realtor Training"
        subtitle="Master the skills, strategies, and technologies that separate top producers from the rest."
      />

      <FeaturesSection
        title="Training Modules"
        subtitle="Comprehensive courses designed by industry leaders to accelerate your career growth."
        features={[
          { icon: '🎓', title: 'Fundamentals Bootcamp', description: 'Master the essentials: contracts, negotiations, compliance, and client management in our intensive onboarding program.' },
          { icon: '🤖', title: 'AI & Technology Mastery', description: 'Learn to leverage AI tools, CRM automation, and data analytics to work smarter and close more deals.' },
          { icon: '📱', title: 'Digital Marketing', description: 'Build your online presence with social media strategies, SEO, paid advertising, and content marketing tactics.' },
          { icon: '💼', title: 'Business Planning', description: 'Create a winning business plan with goal setting, financial projections, and systems for long-term growth.' },
          { icon: '🤝', title: 'Advanced Negotiations', description: 'Sharpen your negotiation skills with proven frameworks for handling multiple offers and tough situations.' },
          { icon: '🏆', title: 'Leadership Development', description: 'Prepare for team leadership and broker roles with management, mentoring, and organizational skills training.' },
        ]}
      />

      <CTASection
        title="Ready to Level Up?"
        subtitle="Access our full training library and start building the skills that drive results."
        primaryAction={{ label: 'Start Training', href: '/realtors/join' }}
        secondaryAction={{ label: 'View Benefits', href: '/realtors/benefits' }}
      />
    </main>
  );
}
