import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Investor Market Reports | Domestic Real Estate',
  description: 'Access in-depth market reports with cap rates, cash flow projections, and investment insights for key markets.',
};

const reports = [
  {
    area: 'Atlanta Metro',
    period: 'Q2 2026',
    highlights: 'Cap rates 6.2%, median home $320K, 14% YoY appreciation',
    tag: 'Hot Market',
  },
  {
    area: 'Birmingham',
    period: 'Q2 2026',
    highlights: 'Cap rates 8.1%, median home $185K, strong rental demand',
    tag: 'High Yield',
  },
  {
    area: 'Charlotte',
    period: 'Q2 2026',
    highlights: 'Cap rates 5.8%, median home $380K, rapid population growth',
    tag: 'Growth',
  },
  {
    area: 'Nashville',
    period: 'Q2 2026',
    highlights: 'Cap rates 5.4%, median home $420K, tight inventory',
    tag: 'Premium',
  },
  {
    area: 'Memphis',
    period: 'Q2 2026',
    highlights: 'Cap rates 9.2%, median home $145K, cash flow focused',
    tag: 'Cash Flow',
  },
  {
    area: 'Jacksonville',
    period: 'Q2 2026',
    highlights: 'Cap rates 6.8%, median home $290K, new job growth',
    tag: 'Emerging',
  },
];

export default function MarketReportsPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Market Intel"
        title="Investor Market Reports"
        subtitle="Data-driven insights on cap rates, appreciation trends, and rental demand across key investment markets."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map((report, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading text-xs font-bold text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full">
                    {report.tag}
                  </span>
                  <span className="font-body text-xs text-gray-400">{report.period}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-[#0A2647] mb-3">{report.area}</h3>
                <p className="font-body text-gray-600 text-sm leading-relaxed mb-6">{report.highlights}</p>
                <Link
                  href="/investors/inquiry"
                  className="inline-flex items-center gap-1 text-[#C9A227] font-heading font-semibold text-sm hover:gap-2 transition-all"
                >
                  Request Full Report <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Need a Custom Market Analysis?"
        subtitle="Our investor team can prepare a detailed market report for any area you're considering."
        primaryAction={{ label: 'Request a Report', href: '/investors/inquiry' }}
        secondaryAction={{ label: 'View Deals', href: '/investors/deals' }}
      />
    </main>
  );
}
