import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Preferred Agent Pricing & Membership Plans",
  description:
    "Compare Preferred Agent membership tiers — exclusive zip-code leads, dedicated virtual assistants, and MLS CRM tools. Calculate your ROI.",
  path: "/pricing",
  keywords: [
    "real estate agent pricing",
    "preferred agent membership",
    "agent subscription plans",
    "real estate lead pricing",
    "agent virtual assistant plans",
  ],
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
