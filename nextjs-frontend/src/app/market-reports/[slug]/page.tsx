import type { Metadata } from 'next';
import { PageHero, ContentSection, CTASection } from '@/components/ui/PageTemplate';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const city = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { title: `${city} Market Report | Domestic Real Estate`, description: `Detailed real estate market analysis for ${city} from Domestic Real Estate.` };
}

export default async function MarketReportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Market Report" title={`${city} Market Report`} subtitle={`Comprehensive analysis of the ${city} real estate market.`} />
      <ContentSection title={`${city} Market Overview`}>
        <p>
          The {city} housing market continues to show strong fundamentals with steady appreciation
          and healthy transaction volume. This report provides a detailed look at current conditions,
          pricing trends, and forecasts for the coming quarters.
        </p>
        <h3 className="font-heading text-xl font-bold text-[#0A2647] mt-8 mb-4">Price Trends</h3>
        <p>
          Median home prices in {city} have experienced moderate growth, driven by continued demand
          and limited inventory in desirable neighborhoods. Price-per-square-foot metrics indicate
          strong value retention across all property types.
        </p>
        <h3 className="font-heading text-xl font-bold text-[#0A2647] mt-8 mb-4">Market Outlook</h3>
        <p>
          Analysts project continued stability in {city} through the remainder of 2026. Interest rate
          movements and new construction starts will be key factors to watch. Buyers can expect
          competitive conditions, while sellers should see strong offers with proper pricing strategies.
        </p>
        <p className="mt-4">
          For a customized analysis of your specific property or target area, contact our market
          research team directly.
        </p>
      </ContentSection>
      <CTASection
        title="Need a Custom Analysis?"
        subtitle="Our market experts can provide a detailed report tailored to your needs."
        primaryAction={{ label: 'Contact Our Team', href: '/contact' }}
        secondaryAction={{ label: 'View All Reports', href: '/market-reports' }}
      />
    </main>
  );
}
