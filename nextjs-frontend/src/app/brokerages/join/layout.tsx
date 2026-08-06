import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Brokerage Partnership Application",
  description:
    "Partner your brokerage with Domestic Real Estate. Share your agent count, states of operation, and goals to explore a growth partnership.",
  path: "/brokerages/join",
  keywords: [
    "brokerage partnership",
    "join as a brokerage",
    "real estate brokerage application",
    "brokerage partner program",
    "real estate partnership opportunities",
  ],
});

export default function BrokerageJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
