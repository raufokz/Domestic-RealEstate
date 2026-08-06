import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Web Development Services",
  description:
    "Responsive, fast-loading, SEO-friendly websites and custom web applications built on modern stacks like Next.js and React.",
  path: "/services/web-development",
  keywords: [
    "web development services",
    "custom website development",
    "Next.js development agency",
    "responsive web design",
    "business website builder",
  ],
});

export default function WebDevelopmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
