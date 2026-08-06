import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Become a Lender Partner",
  description:
    "Apply to join our lender network. Share your NMLS license, company, and loan specialties to start receiving qualified mortgage referrals.",
  path: "/lenders/join",
  keywords: [
    "lender partnership",
    "mortgage lender application",
    "NMLS partner program",
    "join as a lender",
    "real estate lender network",
  ],
});

export default function LenderJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
