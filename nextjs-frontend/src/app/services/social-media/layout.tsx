import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Social Media Management Services",
  description:
    "Content creation, community management, and analytics across Instagram, Facebook, TikTok, and LinkedIn to grow your brand and engagement.",
  path: "/services/social-media",
  keywords: [
    "social media management services",
    "social media marketing",
    "Instagram management",
    "content creation services",
    "community management",
  ],
});

export default function SocialMediaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
