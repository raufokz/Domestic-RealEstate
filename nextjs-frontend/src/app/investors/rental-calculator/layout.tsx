import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Rental Income Calculator",
  description:
    "Evaluate a rental property's performance — see net income, gross yield, net yield, and rent-to-price ratio at a glance.",
  path: "/investors/rental-calculator",
  keywords: [
    "rental income calculator",
    "rental yield calculator",
    "rent to price ratio calculator",
    "1 percent rule real estate",
    "gross yield vs net yield",
  ],
});

export default function RentalCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
