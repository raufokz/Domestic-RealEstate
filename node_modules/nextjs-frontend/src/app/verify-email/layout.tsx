import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Verify Your Email",
  description: "Confirm your email address to activate your Domestic Real Estate account.",
  path: "/verify-email",
  noindex: true,
});

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
