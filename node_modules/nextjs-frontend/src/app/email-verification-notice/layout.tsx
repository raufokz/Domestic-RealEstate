import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Verification Required",
  description: "Your Domestic Real Estate account needs email verification before you can sign in.",
  path: "/email-verification-notice",
  noindex: true,
});

export default function EmailVerificationNoticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
