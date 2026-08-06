import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "How the Lead Marketplace Works",
  description:
    "See how our pay-per-lead marketplace works: reserve a lead, pay to unlock it, and get full contact details in minutes. No subscription required.",
  path: "/marketplace/how-it-works",
  keywords: [
    "how pay per lead works",
    "real estate lead marketplace guide",
    "buy leads process",
    "lead reservation",
  ],
});

export default function MarketplaceHowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
