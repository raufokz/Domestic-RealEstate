import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Find Your Next Home",
  description: "Tell us what you're looking for and get matched with a local buyer's agent. Free, no account needed.",
  path: "/buy",
  keywords: ["find a home", "buy a house", "buyer agent match", "home search"],
});

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
