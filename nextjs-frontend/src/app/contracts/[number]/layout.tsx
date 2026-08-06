import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "View Contract",
  description: "Review and sign your real estate contract securely online.",
  path: "/contracts",
  noindex: true,
});

export function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
