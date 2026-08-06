import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sign In",
  description: "Sign in to your Domestic Real Estate account to manage properties, leads, contracts, and your dashboard.",
  path: "/login",
  noindex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
