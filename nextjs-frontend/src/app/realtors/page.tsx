import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { PageHero, FeaturesSection, TestimonialsSection, CTASection } from '@/components/ui/PageTemplate';
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

export const metadata: Metadata = buildMetadata({
  title: 'Realtor Services & Agent Partnership Program',
  description: 'Grow your real estate business with AI-powered tools, qualified leads, and premium support from Domestic Real Estate.',
  path: '/realtors',
  keywords: [
    'real estate agent partnership',
    'realtor lead generation',
    'real estate CRM tools',
    'real estate coaching',
    'real estate agent commission',
    'top producing realtor',
  ],
});

export default function RealtorsPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Realtors"
        title="Realtor Services"
        subtitle="Grow your real estate business with AI-powered tools, qualified leads, and premium support from Domestic Real Estate."
      />

      <FeaturesSection
        title="Everything You Need to Succeed"
        subtitle="Our comprehensive suite of tools and services designed for top-producing realtors."
        features={[
          { icon: '🎯', title: 'Lead Generation', description: 'Access high-intent buyer and seller leads delivered directly to your dashboard, powered by AI matching algorithms.' },
          { icon: '📊', title: 'CRM Integration', description: 'Seamlessly manage your contacts, track interactions, and automate follow-ups with our built-in CRM tools.' },
          { icon: '🔄', title: 'Pipeline Management', description: 'Visualize your sales pipeline, track deal progress, and never miss a deadline with automated reminders.' },
          { icon: '📢', title: 'Marketing Suite', description: 'Create stunning property listings, social media content, and email campaigns with our AI-powered marketing tools.' },
          { icon: '🎓', title: 'Training & Coaching', description: 'Access on-demand video courses, live coaching sessions, and mentorship from industry veterans.' },
          { icon: '💰', title: 'Competitive Commissions', description: 'Earn more per transaction with our transparent, tiered commission structure that rewards your production.' },
        ]}
      />

      <TestimonialsSection
        title="What Our Realtors Say"
        testimonials={[
          { quote: 'Domestic Real Estate transformed my business. The AI lead generation alone doubled my closings in six months.', name: 'Angela Martinez', role: 'Realtor, 8 Years Experience' },
          { quote: 'The training resources and coaching have been invaluable. I feel more confident and prepared than ever before.', name: 'James Patterson', role: 'Senior Realtor' },
          { quote: 'Best commission structure I have seen in 15 years. The support team is responsive and truly cares about my success.', name: 'Linda Chen', role: 'Top Producer' },
        ]}
      />

      <CTASection
        title="Ready to Elevate Your Career?"
        subtitle="Join our network of top-producing realtors and gain access to the tools, leads, and support you need to thrive."
        primaryAction={{ label: 'Join Our Network', href: '/realtors/join' }}
        secondaryAction={{ label: 'Learn More', href: '/realtors/benefits' }}
      />
      <ChatWidgetWrapper context="realtor" leadType="realtor" />
    </main>
  );
}
