import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Virtual Assistant Services",
  description:
    "Dedicated virtual assistants for administrative support, lead management, scheduling, and research — trained, vetted, and matched to your business.",
  path: "/services/virtual-assistant",
  keywords: [
    "virtual assistant services",
    "real estate virtual assistant",
    "lead management VA",
    "administrative support services",
    "remote executive assistant",
  ],
});

export default function VirtualAssistantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
