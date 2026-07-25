import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Compare Properties",
  description:
    "Compare homes side by side — price, beds, baths, square footage, and features — to decide which property is right for you.",
  path: "/properties/compare",
  keywords: ["compare properties", "compare homes", "property comparison tool"],
});

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
