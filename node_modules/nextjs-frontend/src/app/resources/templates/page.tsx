import type { Metadata } from "next";
import { buildMetadata, breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { PageHero, FeaturesSection, CTASection } from "@/components/ui/PageTemplate";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Templates & Checklists",
  description: "Downloadable real estate templates, checklists, and document frameworks for buyers, sellers, investors, and agents.",
  path: "/resources/templates",
  keywords: ["real estate templates", "home buying checklist", "closing checklist", "property inspection template", "real estate documents"],
});

const templates = [
  { icon: "shield", title: "Home Buying Checklist", description: "A comprehensive step-by-step checklist covering pre-approval through closing day for home buyers." },
  { icon: "leads", title: "Home Selling Checklist", description: "Everything you need to prepare, list, market, and close the sale of your property." },
  { icon: "search", title: "Property Inspection Checklist", description: "A detailed walkthrough checklist for evaluating property condition during showings and open houses." },
  { icon: "brand", title: "Investment Deal Analyzer", description: "Spreadsheet template for analyzing cap rate, cash-on-cash return, and ROI for rental properties." },
  { icon: "growth", title: "Comparative Market Analysis", description: "CMA template to compare recent sales and determine competitive listing prices." },
  { icon: "email", title: "Closing Day Document Checklist", description: "Ensure you have all required documents ready for a smooth closing experience." },
  { icon: "construction", title: "Moving Day Planner", description: "Organized moving schedule with packing lists, utility transfer reminders, and address change tracker." },
  { icon: "brand", title: "Budget Planning Worksheet", description: "Track your home-buying budget including down payment, closing costs, and moving expenses." },
];

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }, { name: "Templates", path: "/resources/templates" }])} />
      <PageHero badge="Templates" title="Real Estate Templates & Checklists" subtitle="Stay organized throughout your real estate journey with our free downloadable tools." />
      <FeaturesSection
        title="Downloadable Templates"
        subtitle="Print-ready checklists and planning worksheets for every stage of your transaction."
        features={templates}
        columns={3}
      />
      <CTASection
        title="Need Help With Your Transaction?"
        subtitle="Our advisors can walk you through every step and provide personalized guidance."
        primaryAction={{ label: "Contact an Advisor", href: "/contact" }}
        secondaryAction={{ label: "Explore Guides", href: "/guides" }}
      />
    </main>
  );
}
