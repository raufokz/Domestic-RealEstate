import type { Metadata } from 'next';
import { PageHero, FeaturesSection, FAQSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Wholesaling Guide | Domestic Real Estate',
  description: 'Learn how to wholesale real estate from start to finish. Step-by-step guide to finding deals, building a buyer list, and closing assignments.',
};

export default function WholesalingGuidePage() {
  const steps = [
    { icon: '🔍', title: 'Find a Motivated Seller', description: 'Search for distressed properties, pre-foreclosures, and off-market deals. Use direct mail, cold calling, or networking to connect with motivated sellers.' },
    { icon: '📋', title: 'Get the Property Under Contract', description: 'Negotiate a purchase price that leaves room for your assignment fee. Make sure your contract includes an inspection contingency and the right to assign.' },
    { icon: '💰', title: 'Determine the ARV', description: 'Calculate the After Repair Value using comparable sales and market data. This number is critical for pricing your deal attractively for buyers.' },
    { icon: '📱', title: 'Build Your Buyer List', description: 'Assemble a list of active cash buyers who invest in your target markets. Network at REI meetups, join online groups, and attend auctions.' },
    { icon: '📢', title: 'Market the Deal', description: 'Send deal alerts to your buyer network with all key numbers — purchase price, ARV, repair estimate, and your assignment fee.' },
    { icon: '✅', title: 'Assign & Close', description: 'Once a buyer commits, assign the contract for your fee. Coordinate with the title company to ensure a smooth double close or assignment closing.' },
  ];

  const faqs = [
    { question: 'How much can I make on a single wholesale deal?', answer: 'Wholesale assignment fees typically range from $5,000 to $30,000+ per deal, depending on the market and property. Higher-priced properties in hot markets can command even larger fees.' },
    { question: 'Do I need a real estate license to wholesale?', answer: 'In most states, you do not need a license to wholesale properties as you are contracting to sell your interest in a contract, not brokering a sale. However, laws vary by state — check your local regulations.' },
    { question: 'How do I find motivated sellers?', answer: 'Common methods include direct mail campaigns, driving for dollars, cold calling expired listings, networking with probate attorneys, and using online platforms like Craigslist or Facebook Marketplace.' },
    { question: 'What makes a good wholesale deal?', answer: 'A strong wholesale deal typically has a purchase price of 60-70% of ARV minus repairs, leaving room for your assignment fee and the buyer\'s profit margin.' },
    { question: 'How long does it take to close a wholesale deal?', answer: 'From finding a deal to closing, most wholesale transactions take 2-4 weeks. With Domestic Real Estate, we can close in as few as 7 days once a buyer is matched.' },
  ];

  return (
    <main>
      <PageHero
        badge="Guide"
        title="Wholesaling Guide"
        subtitle="Everything you need to know about wholesaling real estate — from finding deals to closing assignments."
      />
      <FeaturesSection
        title="The Wholesaling Process"
        subtitle="Follow these six steps to successfully wholesale your first property."
        features={steps}
        columns={3}
      />
      <FAQSection title="Wholesaling FAQs" faqs={faqs} />
      <CTASection
        title="Ready to Put It Into Practice?"
        subtitle="Submit your first deal or join our buyer network to start wholesaling today."
        primaryAction={{ label: 'Submit a Deal', href: '/wholesalers/submit-deal' }}
        secondaryAction={{ label: 'Get Started', href: '/wholesalers/get-started' }}
      />
    </main>
  );
}
