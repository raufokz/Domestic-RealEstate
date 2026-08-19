import type { Metadata } from 'next';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import AgentTrainingClient from '@/components/agents/AgentTrainingClient';

export const metadata: Metadata = buildMetadata({
  title: 'Agent Training Academy & Masterclasses',
  description: 'Master luxury listing acquisition, AI lead generation, contract negotiation, and CE credits through Domestic Real Estate Training Academy.',
  path: '/agents/training',
  keywords: [
    'real estate agent training',
    'realtor masterclass',
    'real estate lead generation training',
    'luxury real estate course',
    'continuing education real estate'
  ],
});

export default function AgentTrainingPage() {
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Real Estate Agent Success Academy',
    description: 'Comprehensive 30-day onboarding and advanced sales masterclasses for licensed real estate professionals.',
    provider: {
      '@type': 'Organization',
      name: 'Domestic Real Estate Training Academy',
      sameAs: SITE_URL,
    },
  };

  return (
    <>
      <JsonLd data={courseSchema} />
      <AgentTrainingClient />
    </>
  );
}

