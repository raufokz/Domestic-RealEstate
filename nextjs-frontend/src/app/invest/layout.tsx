import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Find Investment Properties",
  description: "Tell us your investment strategy and budget and get matched with opportunities and specialists who know your market.",
  path: "/invest",
  keywords: ["real estate investing", "investment properties", "rental income", "fix and flip"],
});

export default function InvestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
