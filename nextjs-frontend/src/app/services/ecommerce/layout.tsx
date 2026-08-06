import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "E-Commerce Development Services",
  description:
    "Custom online stores with seamless payment integration, real-time inventory management, and built-in SEO to turn browsers into customers.",
  path: "/services/ecommerce",
  keywords: [
    "ecommerce development services",
    "custom online store development",
    "Shopify development",
    "payment integration services",
    "ecommerce website design",
  ],
});

export default function ECommerceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
