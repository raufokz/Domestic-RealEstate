import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Reset Password",
  description: "Set a new password for your Domestic Real Estate account.",
  path: "/reset-password",
  noindex: true,
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
