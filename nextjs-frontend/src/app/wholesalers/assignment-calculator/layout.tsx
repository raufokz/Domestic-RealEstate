import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Assignment Fee Calculator",
  description:
    "Quickly calculate the total cost to your end buyer and your profit margin from a wholesale real estate assignment fee.",
  path: "/wholesalers/assignment-calculator",
  keywords: [
    "assignment fee calculator",
    "wholesale real estate calculator",
    "contract assignment fee",
    "wholesaling profit calculator",
    "real estate wholesaling tools",
  ],
});

export default function AssignmentCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
