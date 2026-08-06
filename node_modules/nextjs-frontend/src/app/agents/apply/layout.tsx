import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Apply to Become an Agent",
  description:
    "Apply to join our elite network of real estate agents. Submit your license, brokerage, markets served, and bio to access premium tools and qualified leads.",
  path: "/agents/apply",
  keywords: [
    "real estate agent application",
    "join real estate team",
    "become a real estate agent",
    "agent application form",
    "real estate license application",
    "real estate agent network",
  ],
});

export default function AgentApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
