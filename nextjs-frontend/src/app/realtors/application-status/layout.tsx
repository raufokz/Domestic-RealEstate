import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Check Your Realtor Application Status",
  description: "Look up the status of your realtor network application using your reference number.",
  path: "/realtors/application-status",
  noindex: true,
});

export default function ApplicationStatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
