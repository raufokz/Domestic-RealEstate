import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { getAgents, agentName, agentInitials } from "@/lib/agents";
import { storageUrl } from "@/lib/media";
import ChatWidgetWrapper from "@/components/ai/ChatWidgetWrapper";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Agent Directory",
  description: "Connect with top-rated, vetted real estate agents across the US and Canada. Find your perfect agent match.",
  path: "/agents",
  keywords: ["real estate agents", "find agent", "top realtors", "agent directory"],
});

import AgentPageClient from "@/components/agents/AgentPageClient";

export default async function AgentsPage() {
  const agents = await getAgents({}, 24);

  const agentsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Verified Real Estate Agent Directory",
    url: `${SITE_URL}/agents`,
    itemListElement: agents.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: agentName(a),
      url: `${SITE_URL}/agents/${a.slug}`,
    })),
  };

  return (
    <>
      {agents.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agentsSchema) }}
        />
      )}
      <AgentPageClient initialAgents={agents} />
    </>
  );
}
