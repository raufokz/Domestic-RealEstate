import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Signing Out",
  description: "You are being securely signed out of your Domestic Real Estate account.",
  path: "/logout",
  noindex: true,
});

export default function LogoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
