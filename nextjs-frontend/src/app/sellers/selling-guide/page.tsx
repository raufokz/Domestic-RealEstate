import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, FAQSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Selling Guide | Domestic Real Estate',
  description: 'A complete step-by-step guide to selling your home. Learn how to prepare, price, market, and close your property sale for maximum profit.',
};

const guideSteps = [
  {
    num: '01',
    title: 'Get a Home Valuation',
    desc: 'Start with a free AI-powered valuation to understand your home\'s market value. Review comparable sales and price trends in your neighborhood.',
    href: '/sellers/request-valuation',
  },
  {
    num: '02',
    title: 'Prepare Your Home',
    desc: 'Declutter, deep clean, and make minor repairs. Consider staging and curb appeal improvements that can increase your sale price by 5-10%.',
    href: '/sellers/prepare-to-sell',
  },
  {
    num: '03',
    title: 'Choose a Listing Agent',
    desc: 'Partner with a top-performing Domestic Real Estate agent who specializes in your area. Review their track record, marketing plan, and commission structure.',
    href: '/sellers/list-your-property',
  },
  {
    num: '04',
    title: 'Price & Market Strategically',
    desc: 'Set a competitive price based on data. Launch professional photography, MLS listing, and digital marketing campaigns to attract qualified buyers.',
    href: '/sellers/marketing-plan',
  },
  {
    num: '05',
    title: 'Review Offers & Negotiate',
    desc: 'Evaluate each offer on price, contingencies, and timeline. Your agent negotiates aggressively to secure the best terms and highest net proceeds.',
    href: '/sellers/net-proceeds-calculator',
  },
  {
    num: '06',
    title: 'Close & Get Paid',
    desc: 'Navigate inspections, appraisal, and title work. Sign closing documents, hand over the keys, and receive your proceeds within days.',
    href: '/sellers/get-started',
  },
];

const faqs = [
  {
    question: 'How long does it typically take to sell a home?',
    answer: 'The average days on market varies by location and price point. In most markets, well-priced homes sell within 14-30 days. Our listings average just 14 days on market thanks to our aggressive marketing strategy.',
  },
  {
    question: 'What are the costs of selling a home?',
    answer: 'Typical costs include agent commissions (5-6%), closing costs (1-2%), and any repairs or staging expenses. Use our Net Proceeds Calculator to estimate your take-home amount after all expenses.',
  },
  {
    question: 'Should I make repairs before listing?',
    answer: 'Minor repairs and cosmetic updates often provide a strong ROI. Focus on high-impact, low-cost improvements like fresh paint, updated fixtures, and improved curb appeal. Your agent can advise on what makes sense for your property.',
  },
  {
    question: 'Do I need to be present for showings?',
    answer: 'No. We recommend vacating during showings to make buyers feel more comfortable. Your agent will handle all showings, open houses, and buyer interactions on your behalf.',
  },
  {
    question: 'What happens if my home doesn\'t appraise?',
    answer: 'If the appraisal comes in below the sale price, several options exist: the buyer can make up the difference, you can lower the price, or you can challenge the appraisal. Your agent will guide you through the best strategy.',
  },
  {
    question: 'Can I sell my home as-is?',
    answer: 'Yes. You can sell your home in its current condition, though it may affect the sale price. We can help you determine whether minor improvements would result in a higher net return.',
  },
];

export default function SellingGuidePage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Selling Guide"
        title="Your Complete Selling Guide"
        subtitle="Everything you need to know about selling your home, from preparation to closing. Follow our proven 6-step process."
      />

      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">6 Steps to a Successful Sale</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Each step is designed to maximize your home&apos;s value and minimize your time on market.</p>
          </div>

          <div className="space-y-6">
            {guideSteps.map((step) => (
              <div key={step.num} className="flex gap-6 items-start p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 bg-[#0A2647] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="font-heading text-lg font-bold text-[#C9A227]">{step.num}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-bold text-[#0A2647] mb-2 group-hover:text-[#C9A227] transition-colors">{step.title}</h3>
                  <p className="font-body text-gray-600 text-sm leading-relaxed mb-3">{step.desc}</p>
                  <Link href={step.href} className="inline-flex items-center gap-1 text-[#C9A227] font-heading font-semibold text-sm hover:gap-2 transition-all">
                    Learn More <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection
        title="Frequently Asked Questions About Selling"
        faqs={faqs}
      />

      <CTASection
        title="Start Your Selling Journey"
        subtitle="Get your free valuation and connect with an expert agent who will guide you from start to finish."
        primaryAction={{ label: 'Get Your Free Valuation', href: '/sellers/request-valuation' }}
        secondaryAction={{ label: 'Talk to an Agent', href: '/sellers/list-your-property' }}
      />
    </main>
  );
}
