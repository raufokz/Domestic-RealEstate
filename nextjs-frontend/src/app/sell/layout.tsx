import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "What's My Home Worth?",
  description: "Tell us about your property and get connected with a local professional who can tell you what it's worth — free, no obligation.",
  path: "/sell",
  keywords: ["sell my home", "home valuation", "what's my house worth", "list my property"],
});

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return children;
}
