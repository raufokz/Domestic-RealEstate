import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Create an Account",
  description: "Create your Domestic Real Estate account as a buyer, seller, agent, broker, or investor to get started.",
  path: "/register",
  noindex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
