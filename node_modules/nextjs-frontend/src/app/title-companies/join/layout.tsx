import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Become a Title Company Partner",
  description:
    "Apply to become a title partner with Domestic Real Estate. Submit your company details and primary state to start the partnership process.",
  path: "/title-companies/join",
  keywords: [
    "title company partnership",
    "title partner program",
    "join as a title company",
    "real estate title partner application",
  ],
});

export default function TitleCompanyJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
