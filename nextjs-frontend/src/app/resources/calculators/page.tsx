import type { Metadata } from "next";
import { buildMetadata, breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { PageHero, FeaturesSection, CTASection } from "@/components/ui/PageTemplate";

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Calculators & Financial Tools",
  description: "Free mortgage calculators, affordability estimators, ROI analyzers, and financial planning tools for home buyers, sellers, and real estate investors.",
  path: "/resources/calculators",
  keywords: ["mortgage calculator", "affordability calculator", "ROI calculator", "real estate financial tools", "home loan calculator"],
});

const calculators = [
  { icon: "🏠", title: "Mortgage Calculator", description: "Estimate your monthly mortgage payments based on loan amount, interest rate, and term length.", href: "/buyers/mortgage-calculator" },
  { icon: "💰", title: "Affordability Calculator", description: "Determine how much home you can afford based on your income, debts, and down payment.", href: "/buyers/affordability-calculator" },
  { icon: "📋", title: "Closing Cost Calculator", description: "Estimate your total closing costs including lender fees, title insurance, and prepaid expenses.", href: "/buyers/closing-cost-calculator" },
  { icon: "📈", title: "ROI Calculator", description: "Calculate your potential return on investment for rental properties and fix-and-flip deals.", href: "/investors/roi-calculator" },
  { icon: "💵", title: "Cap Rate Calculator", description: "Determine the capitalization rate of an investment property to compare deals side by side.", href: "/investors/cap-rate-calculator" },
  { icon: "📊", title: "Cash Flow Calculator", description: "Project monthly cash flow for rental properties after mortgage, taxes, insurance, and expenses.", href: "/investors/cash-flow-calculator" },
  { icon: "🔧", title: "Flip Calculator", description: "Estimate profit margins for fix-and-flip projects with repair cost and ARV projections.", href: "/investors/flip-calculator" },
  { icon: "🏡", title: "Net Proceeds Calculator", description: "See how much you'll walk away with after selling your home, commissions, and closing costs.", href: "/sellers/net-proceeds-calculator" },
  { icon: "🎯", title: "Home Valuation", description: "Get an instant AI-powered estimate of your home's current market value.", href: "/sellers/home-valuation" },
];

export default function CalculatorsPage() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }, { name: "Calculators", path: "/resources/calculators" }])} />
      <PageHero badge="Calculators" title="Real Estate Calculators" subtitle="Make informed financial decisions with our free interactive tools." />
      <FeaturesSection
        title="All Calculators"
        subtitle="Plug in your numbers and get instant estimates to guide your real estate decisions."
        features={calculators}
        columns={3}
      />
      <CTASection
        title="Need Personalized Advice?"
        subtitle="Our financial advisors can help you understand your options and find the best financing structure."
        primaryAction={{ label: "Talk to an Advisor", href: "/contact" }}
        secondaryAction={{ label: "Browse Properties", href: "/properties" }}
      />
    </main>
  );
}
