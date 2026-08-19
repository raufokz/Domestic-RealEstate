import type { Metadata } from 'next';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import AgentBenefitsClient from '@/components/agents/AgentBenefitsClient';

export const metadata: Metadata = buildMetadata({
  title: 'Agent Benefits & 90/10 Commission Splits',
  description: 'Join Domestic Real Estate and unlock 90/10 commission splits, zero desk fees, proprietary AI lead streams, automated marketing, and 1-on-1 mentorship.',
  path: '/agents/benefits',
  keywords: [
    'real estate agent benefits',
    'high commission split brokerage',
    '90 10 commission real estate',
    'free real estate leads',
    'realtor tech stack',
    'join real estate team'
  ],
});

export default function AgentBenefitsPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the commission split structure at Domestic Real Estate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer an industry-leading 90/10 commission split with a low annual cap. Once capped, agents keep 100% of their commission for the remainder of their anniversary year.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there desk fees or hidden monthly technology charges?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Domestic Real Estate charges zero monthly desk fees and zero technology maintenance fees. All CRM tools, AI marketing suites, and landing pages are fully included.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Domestic Real Estate generate leads for agents?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI engine captures, scores, and qualifies buyers and sellers in your target zip codes from our national portal, automatically routing pre-vetted leads straight to your CRM.',
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <AgentBenefitsClient />
    </>
  );
}

