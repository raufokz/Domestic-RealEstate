import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Investor Inquiry",
  description:
    "Connect with our investor specialists to discuss your budget, property type, and timeline — get matched to deals and investment strategy support.",
  path: "/investors/inquiry",
  keywords: [
    "real estate investor inquiry",
    "investment property consultation",
    "talk to investor specialist",
    "real estate investment strategy",
  ],
});

export default function InvestorInquiryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
