import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Join Our Realtor Network",
  description:
    "Apply to join our realtor network. Submit your license, experience, and verification documents to get AI-powered tools, qualified leads, and premium support.",
  path: "/realtors/join",
  keywords: [
    "realtor application",
    "join realtor network",
    "become a realtor partner",
    "realtor membership application",
    "real estate license verification",
  ],
});

export default function RealtorJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
