import type { Metadata } from 'next';
import ChatWidgetWrapper from '@/components/ai/ChatWidgetWrapper';

export const metadata: Metadata = {
  title: 'First-Time Buyer Guide | Domestic Real Estate',
  description: 'Everything you need to know about buying your first home. A complete step-by-step guide for first-time buyers.',
};

const steps = [
  { num: 1, title: 'Assess Your Finances', desc: 'Review your credit score, savings, and monthly budget. Understand what you can comfortably afford before falling in love with a home.', icon: 'finance' },
  { num: 2, title: 'Get Pre-Approved', desc: 'A mortgage pre-approval shows sellers you are serious. It also defines your price range and strengthens your offer.', icon: 'preapproved' },
  { num: 3, title: 'Find a Trusted Agent', desc: 'Partner with an experienced buyer agent who knows your target neighborhoods and can negotiate on your behalf.', icon: 'agent' },
  { num: 4, title: 'Search & Tour Homes', desc: 'Use our advanced search tools and schedule tours. Take notes and photos to compare your top picks.', icon: 'search' },
  { num: 5, title: 'Make an Offer', desc: 'Your agent will craft a competitive offer based on market data. Expect some back-and-forth with the seller.', icon: 'offer' },
  { num: 6, title: 'Close & Move In', desc: 'Complete inspections, finalize your mortgage, sign closing documents, and get your keys. Welcome home!', icon: 'keys' },
];

const checklist = [
  'Government-issued photo ID', 'Proof of income (pay stubs, W-2s)', 'Tax returns (last 2 years)',
  'Bank statements (last 2-3 months)', 'Employment verification letter', 'Credit report review',
  'Down payment funds verified', 'Pre-approval letter from lender', 'List of desired neighborhoods',
  'Understood your monthly budget limit',
];

const faqs = [
  { q: 'How much do I need for a down payment?', a: 'Down payments can range from 3% to 20% of the purchase price. FHA loans allow as low as 3.5%. Putting down 20% helps you avoid private mortgage insurance (PMI).' },
  { q: 'What credit score do I need?', a: 'Conventional loans typically require a 620+ score. FHA loans may accept scores as low as 580. Higher scores unlock better interest rates and loan terms.' },
  { q: 'Should I get a home inspection?', a: 'Absolutely. A professional inspection reveals hidden issues that could cost thousands. It also gives you leverage to negotiate repairs or price reductions.' },
  { q: 'How long does the buying process take?', a: 'From pre-approval to closing, expect 30 to 60 days. The search phase varies — some buyers find their home in weeks, others take months. Be patient and stay focused.' },
  { q: 'What are closing costs?', a: 'Closing costs typically range from 2% to 5% of the loan amount. They include lender fees, title insurance, appraisal, and prepaid items like taxes and insurance.' },
];

export default function FirstTimeBuyerPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#0A2647] text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A227] font-heading text-sm tracking-widest uppercase mb-4">First-Time Buyers</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">Your First Home Awaits</h1>
          <p className="font-body text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            A complete guide to navigating the home buying process with confidence.
          </p>
          <a href="#guide" className="inline-block bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors">
            Start the Journey
          </a>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section id="guide" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Your Roadmap to Homeownership</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Follow these six steps to go from first-time buyer to proud homeowner.</p>
          </div>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col md:flex-row items-start gap-6 p-6 md:p-8 bg-gray-50 rounded-2xl hover:bg-gray-100/80 transition-colors">
                <div className="flex-shrink-0 w-14 h-14 bg-[#0A2647] rounded-2xl flex items-center justify-center">
                  <span className="text-[#C9A227] font-heading text-lg font-bold">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-[#0A2647] mb-2">{step.title}</h3>
                  <p className="font-body text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-20 md:py-24 bg-[#0A2647]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Buyer&apos;s Checklist</h2>
            <p className="font-body text-white/70 max-w-xl mx-auto">Documents and items to prepare before you start shopping.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-lg px-5 py-4">
                <svg className="w-5 h-5 text-[#C9A227] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="font-body text-white/90 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">Frequently Asked Questions</h2>
            <p className="font-body text-gray-600">Answers to the most common first-time buyer questions.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-heading font-medium text-[#0A2647] hover:bg-gray-50 transition-colors">
                  <span className="pr-4">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-6 pb-5">
                  <p className="font-body text-gray-600 leading-relaxed text-sm">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-[#8B1E3F] to-[#8B1E3F]/90">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Get Pre-Approved Today</h2>
          <p className="font-body text-white/80 text-lg mb-10 max-w-2xl mx-auto">Take the first step toward homeownership. Our lending partners will help you find the right mortgage.</p>
          <a href="/contact" className="inline-block bg-[#C9A227] text-[#0A2647] font-heading font-semibold px-8 py-4 rounded-lg hover:bg-[#C9A227]/90 transition-colors">Get Pre-Approved</a>
        </div>
      </section>
      <ChatWidgetWrapper context="buyer-guide" leadType="buyer" />
    </main>
  );
}
