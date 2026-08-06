import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Join as a Property Manager Partner",
  description:
    "Partner with Domestic Real Estate as a property management company. Tell us your portfolio size and states served to get started.",
  path: "/property-managers/join",
  keywords: [
    "property manager partnership",
    "property management partner program",
    "join as a property manager",
    "real estate property management application",
  ],
});

export default function PropertyManagerJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
