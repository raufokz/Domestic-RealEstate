import type { Metadata } from 'next';
import { PageHero, FeaturesSection, FAQSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Buyer Guide | Domestic Real Estate',
  description: 'The complete home buying guide. Learn every step from budgeting and pre-approval to closing and moving in.',
};

const guideSteps = [
  {
    icon: '💰',
    title: 'Determine Your Budget',
    description:
      'Review your income, savings, and monthly expenses. Use our affordability calculator to find a price range that works for you.',
  },
  {
    icon: '📋',
    title: 'Get Pre-Approved',
    description:
      'A pre-approval letter shows sellers you are serious. It defines your price range and gives your offers a competitive edge.',
    href: '/buyers/pre-approval',
  },
  {
    icon: '🤝',
    title: 'Hire a Buyer Agent',
    description:
      'A dedicated agent provides market insight, negotiates on your behalf, and guides you through every document and deadline.',
    href: '/buyers/request-agent',
  },
  {
    icon: '🔍',
    title: 'Search & Tour Homes',
    description:
      'Browse MLS listings, save favorites, and schedule tours. Take notes and photos to compare your top picks side by side.',
  },
  {
    icon: '📝',
    title: 'Make an Offer & Negotiate',
    description:
      'Your agent crafts a competitive offer backed by market data. Expect some back-and-forth before reaching an agreement.',
  },
  {
    icon: '🔑',
    title: 'Inspect, Close & Move In',
    description:
      'Complete inspections, finalize your mortgage, sign closing documents, and receive your keys. Welcome home!',
  },
];

const faqs = [
  {
    question: 'How much do I need for a down payment?',
    answer:
      'Down payments range from 3% to 20% of the purchase price. FHA loans allow as low as 3.5%. Putting down 20% helps you avoid private mortgage insurance (PMI) and lowers your monthly payment.',
  },
  {
    question: 'What credit score do I need to buy a home?',
    answer:
      'Conventional loans typically require a 620+ score. FHA loans may accept scores as low as 580. Higher credit scores unlock better interest rates and more favorable loan terms.',
  },
  {
    question: 'Should I get a home inspection?',
    answer:
      'Absolutely. A professional inspection reveals hidden issues that could cost thousands in repairs. It also gives you leverage to negotiate repairs or price reductions with the seller.',
  },
  {
    question: 'How long does the buying process take?',
    answer:
      'From pre-approval to closing, expect 30 to 60 days. The search phase varies — some buyers find their home in weeks, others take months. Be patient and stay focused on your priorities.',
  },
  {
    question: 'What are closing costs and who pays them?',
    answer:
      'Closing costs typically range from 2% to 5% of the loan amount. They include lender fees, title insurance, appraisal, and prepaid taxes and insurance. Both buyers and sellers may share these costs depending on negotiations.',
  },
];

export default function BuyerGuidePage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Guide"
        title="Complete Buyer Guide"
        subtitle="Everything you need to know about buying a home, from start to finish."
      />

      <FeaturesSection
        title="Your Roadmap to Homeownership"
        subtitle="Follow these six steps to go from buyer to homeowner"
        features={guideSteps}
        columns={3}
      />

      <FAQSection title="Common Buyer Questions" faqs={faqs} />

      <CTASection
        title="Have Questions? Let's Talk"
        subtitle="Our buyer agents are ready to help you navigate every step of the process."
        primaryAction={{ label: 'Request an Agent', href: '/buyers/request-agent' }}
        secondaryAction={{ label: 'Get Pre-Approved', href: '/buyers/pre-approval' }}
      />
    </main>
  );
}
