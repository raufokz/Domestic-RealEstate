import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Relocation Services | Domestic Real Estate',
  description:
    'Moving to a new area? Domestic Real Estate offers full-service relocation support including neighborhood guides, agent matching, and moving logistics.',
};

const features = [
  {
    icon: '🗺️',
    title: 'Neighborhood Matching',
    description:
      'Tell us about your lifestyle, commute, and priorities. We will match you with neighborhoods that fit your needs — schools, amenities, and culture.',
  },
  {
    icon: '🤝',
    title: 'Agent-to-Agent Network',
    description:
      'We partner with top agents nationwide. Wherever you are going, we connect you with a trusted local expert who knows the market inside and out.',
  },
  {
    icon: '🏠',
    title: 'Virtual Tours & Remote Buying',
    description:
      'Can\'t visit in person? We offer live video tours, 3D walkthroughs, and remote document signing so you can buy with confidence from anywhere.',
  },
  {
    icon: '📦',
    title: 'Moving Coordination',
    description:
      'From choosing a moving company to coordinating timelines, we help you plan a smooth transition so nothing falls through the cracks.',
  },
  {
    icon: '📋',
    title: 'Area Orientation',
    description:
      'Get a curated guide to your new area — schools, healthcare, utilities setup, local government, and hidden gems recommended by locals.',
  },
  {
    icon: '💼',
    title: 'Corporate Relocation Support',
    description:
      'Relocating for work? We coordinate with your employer\'s relocation program to streamline the process and maximize your benefits.',
  },
];

export default function RelocationPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Relocate"
        title="Relocation Services"
        subtitle="Moving to a new city or state? We make the transition seamless with expert guidance every step of the way."
      />

      <FeaturesSection
        title="Full-Service Relocation Support"
        subtitle="Everything you need to relocate with confidence"
        features={features}
        columns={3}
      />

      <CTASection
        title="Planning a Move?"
        subtitle="Tell us where you are headed. We will connect you with the right team to make your relocation smooth."
        primaryAction={{ label: 'Request an Agent', href: '/buyers/request-agent' }}
        secondaryAction={{ label: 'Contact Us', href: '/contact' }}
        bg="burgundy"
      />
    </main>
  );
}
