import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Request a Buyer's Agent",
  description:
    "Get matched with a top local buyer's agent. Tell us your budget, preferred area, and timeline and we'll connect you within 24 hours.",
  path: "/buyers/request-agent",
  keywords: [
    "request a buyer agent",
    "find a buyer's agent",
    "home buying agent",
    "connect with real estate agent",
  ],
});

export default function RequestAgentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
