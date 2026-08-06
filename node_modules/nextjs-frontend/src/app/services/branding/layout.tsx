import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Branding & Graphic Design Services",
  description:
    "Logo design, brand guidelines, and marketing materials that create a distinctive, memorable identity for your real estate business.",
  path: "/services/branding",
  keywords: [
    "branding services",
    "logo design",
    "brand identity design",
    "graphic design for real estate",
    "brand guidelines development",
  ],
});

export default function BrandingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
