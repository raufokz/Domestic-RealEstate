import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Request a Service",
  description:
    "Tell us what you need — buying, selling, investing, valuation, or a general consultation — and get a custom quote within 24 hours.",
  path: "/services/request",
  keywords: [
    "request real estate service",
    "get a real estate quote",
    "home buying consultation",
    "home selling consultation",
    "real estate service request form",
  ],
});

export default function ServiceRequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
