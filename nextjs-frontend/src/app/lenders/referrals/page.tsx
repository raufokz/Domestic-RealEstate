import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Lender Referral Program',
};

export default function LenderReferralsPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Referrals"
        title="Lender Referral Program"
        subtitle="Earn referral fees by connecting borrowers with our trusted network of lending partners."
      />

      <FeaturesSection
        title="How the Program Works"
        subtitle="A simple, transparent process to earn while helping clients find the right financing."
        features={[
          { icon: '📤', title: 'Submit a Referral', description: 'Refer a borrower through our platform with their basic information and financing needs.' },
          { icon: '🤝', title: 'Matcher Assignment', description: 'Our algorithm matches the borrower with the best-suited lender partner based on their profile.' },
          { icon: '📋', title: 'Application & Processing', description: 'The lender works directly with the borrower through application, underwriting, and approval.' },
          { icon: '✅', title: 'Closing & Funding', description: 'Once the loan closes and funds, the referral fee is automatically calculated and disbursed.' },
          { icon: '💰', title: 'Fee Disbursement', description: 'Receive your referral fee via direct deposit within 10 business days of closing.' },
          { icon: '📊', title: 'Track Performance', description: 'Monitor your referrals, conversion rates, and earnings through your real-time dashboard.' },
        ]}
      />

      <CTASection
        title="Start Earning Referral Fees"
        subtitle="Join our lender referral program and turn your network into a revenue stream."
        primaryAction={{ label: 'Apply as Lender', href: '/lenders/join' }}
        secondaryAction={{ label: 'View Lender Benefits', href: '/lenders' }}
      />
    </main>
  );
}
