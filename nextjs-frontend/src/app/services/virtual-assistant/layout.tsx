import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Realtor Virtual Assistant Services | Real Estate VA Support",
  description:
    "Realtor virtual assistant services for lead management, listing follow-up, CRM updates, scheduling, and market research — trained, vetted, and matched to your brokerage.",
  path: "/services/virtual-assistant",
  keywords: [
    "realtor virtual assistant services",
    "virtual assistant for realtors",
    "real estate virtual assistant",
    "real estate VA services",
    "lead management VA",
    "administrative support services",
    "remote executive assistant",
  ],
});

export default function VirtualAssistantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
