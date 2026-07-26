import type { Metadata } from 'next';
import { buildMetadata } from "@/lib/seo";
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = buildMetadata({
  title: "Real Estate Resources & Tools",
  description: "Free real estate resources, market data, calculators, and educational tools for buyers, sellers, and investors.",
  path: "/resources",
  keywords: ["real estate resources", "property tools", "market data", "real estate calculators"],
});

const categories = [
  { icon: '📖', title: 'Guides', description: 'Step-by-step guides covering every aspect of buying, selling, and investing in real estate.', href: '/guides' },
  { icon: '🧮', title: 'Calculators', description: 'Mortgage calculators, affordability tools, and ROI analyzers to help you plan your finances.', href: '/resources/calculators' },
  { icon: '📊', title: 'Market Data', description: 'Up-to-date market reports, price trends, and neighborhood analytics across major cities.', href: '/market-reports' },
  { icon: '🎥', title: 'Webinars', description: 'Live and on-demand educational sessions hosted by industry experts and top agents.', href: '/resources/webinars' },
  { icon: '📋', title: 'Templates', description: 'Downloadable checklists, spreadsheets, and document templates for your real estate transactions.', href: '/resources/templates' },
  { icon: '❓', title: 'FAQ', description: 'Answers to the most common questions about buying, selling, mortgages, and the home process.', href: '/faq' },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Resources" title="Resource Center" subtitle="Everything you need to navigate the real estate market with confidence." />
      <FeaturesSection
        title="Explore Our Resources"
        subtitle="Tools, guides, and data designed to empower your real estate decisions."
        features={categories}
        columns={3}
      />
      <CTASection
        title="Can't Find What You're Looking For?"
        subtitle="Our team is here to help. Reach out and we'll point you in the right direction."
        primaryAction={{ label: 'Contact Us', href: '/contact' }}
        secondaryAction={{ label: 'Subscribe for Updates', href: '/newsletter' }}
      />
    </main>
  );
}
