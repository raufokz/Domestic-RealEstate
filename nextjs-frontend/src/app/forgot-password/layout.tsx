import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Request a password reset link for your Domestic Real Estate account.",
  path: "/forgot-password",
  noindex: true,
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
