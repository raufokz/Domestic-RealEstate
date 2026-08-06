import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Content Writing & Copywriting Services",
  description:
    "SEO content, blog posts, email copy, and captivating property descriptions written to engage your audience and drive conversions.",
  path: "/services/content-writing",
  keywords: [
    "content writing services",
    "real estate copywriting",
    "property description writing",
    "SEO content writing",
    "blog writing services",
  ],
});

export default function ContentWritingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
