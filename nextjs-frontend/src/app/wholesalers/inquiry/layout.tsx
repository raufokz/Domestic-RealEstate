import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Wholesaler Inquiry",
  description:
    "Have a question about our wholesaler services? Send a message and our wholesaling team will respond within one business day.",
  path: "/wholesalers/inquiry",
  keywords: [
    "wholesaler contact",
    "real estate wholesaling questions",
    "wholesale services inquiry",
  ],
});

export default function WholesalerInquiryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
