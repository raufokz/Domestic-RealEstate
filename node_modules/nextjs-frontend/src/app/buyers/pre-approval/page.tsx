import type { Metadata } from 'next';
import { PageHero, FeaturesSection, FAQSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Pre-Approval Information | Domestic Real Estate',
  description:
    'Learn about mortgage pre-approval, what documents you need, and how it strengthens your home buying offer.',
};

const benefits = [
  {
    icon: '💪',
    title: 'Strengthen Your Offer',
    description:
      'Sellers take pre-approved buyers more seriously. Your offer stands out in competitive markets with multiple bids.',
  },
  {
    icon: '🎯',
    title: 'Know Your Budget',
    description:
      'A pre-approval defines your exact price range so you can focus on homes you can truly afford — no surprises later.',
  },
  {
    icon: '⚡',
    title: 'Faster Closing',
    description:
      'Much of the paperwork is done upfront. Pre-approved buyers often close 1-2 weeks faster than those starting from scratch.',
  },
  {
    icon: '🔒',
    title: 'Lock In Your Rate',
    description:
      'Many lenders offer rate locks during the pre-approval period, protecting you from rate fluctuations while you shop.',
  },
  {
    icon: '🏆',
    title: 'Competitive Advantage',
    description:
      'In hot markets, listing agents favor pre-approved buyers. It signals financial readiness and reduces the risk of deals falling through.',
  },
  {
    icon: '💰',
    title: 'Negotiating Power',
    description:
      'Pre-approval gives you leverage to negotiate better terms, request repairs, or ask for seller concessions.',
  },
];

const faqs = [
  {
    question: 'What is the difference between pre-qualification and pre-approval?',
    answer:
      'Pre-qualification is an informal estimate of what you might be able to borrow based on self-reported information. Pre-Verification involves a full financial review by a lender — including credit check, income verification, and asset review — resulting in a conditional commitment to lend.',
  },
  {
    question: 'What documents do I need for pre-approval?',
    answer:
      'Typically you will need: last 2 years of tax returns, recent pay stubs (30 days), W-2s, bank statements (2-3 months), photo ID, and employment verification. Self-employed borrowers may also need profit/loss statements.',
  },
  {
    question: 'How long does a pre-approval last?',
    answer:
      'Most pre-approval letters are valid for 60 to 90 days. If you need more time, your lender can update your application with a quick re-verification.',
  },
  {
    question: 'Does pre-approval affect my credit score?',
    answer:
      'A pre-approval requires a hard credit inquiry, which may temporarily lower your score by a few points. However, multiple mortgage inquiries within a 14-45 day window are typically counted as a single inquiry.',
  },
  {
    question: 'Can I be denied after pre-approval?',
    answer:
      'While uncommon, denial is possible if your financial situation changes — such as a new large debt, job change, or significant drop in credit score. Avoid major financial changes between pre-approval and closing.',
  },
];

export default function PreApprovalPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Finance"
        title="Get Pre-Approved"
        subtitle="A mortgage pre-approval is your first step toward confident, competitive home buying."
      />

      <FeaturesSection
        title="Why Get Pre-Approved?"
        subtitle="Pre-approval gives you a serious edge in the home buying process"
        features={benefits}
        columns={3}
      />

      <FAQSection title="Pre-Approval Questions" faqs={faqs} />

      <CTASection
        title="Start Your Pre-Approval Today"
        subtitle="Our lending partners will walk you through the process and help you find the best mortgage product."
        primaryAction={{ label: 'Contact Us', href: '/contact' }}
        secondaryAction={{ label: 'Calculate Payments', href: '/buyers/mortgage-calculator' }}
      />
    </main>
  );
}
