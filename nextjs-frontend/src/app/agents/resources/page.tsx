import type { Metadata } from 'next';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import AgentResourcesClient from '@/components/agents/AgentResourcesClient';

export const metadata: Metadata = buildMetadata({
  title: 'Agent Resource Hub & Document Library',
  description: 'Access pre-approved real estate contract templates, disclosures, marketing flyers, CMA tools, and luxury social media kits.',
  path: '/agents/resources',
  keywords: [
    'real estate agent resources',
    'realtor document templates',
    'real estate listing presentation template',
    'CMA report templates',
    'agent marketing flyers'
  ],
});

export default function AgentResourcesPage() {
  const resourceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Real Estate Agent Resource Library',
    description: 'Collection of contracts, marketing templates, and market analysis tools.',
    url: `${SITE_URL}/agents/resources`,
  };

  return (
    <>
      <JsonLd data={resourceSchema} />
      <AgentResourcesClient />
    </>
  );
}

