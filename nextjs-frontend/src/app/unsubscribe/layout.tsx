import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Unsubscribe",
  description: "Unsubscribe your email address from the Domestic Real Estate newsletter.",
  path: "/unsubscribe",
  noindex: true,
});

export default function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
