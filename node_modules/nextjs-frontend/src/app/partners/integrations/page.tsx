import type { Metadata } from 'next';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Partner Integrations',
};

export default function PartnerIntegrationsPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Integrations"
        title="Partner Integrations"
        subtitle="Connect your tools and services with our platform through our robust integration ecosystem."
      />

      <FeaturesSection
        title="Integration Categories"
        subtitle="Our platform connects with the tools you already use, creating a seamless workflow."
        features={[
          { icon: '🔗', title: 'MLS & Data Feeds', description: 'Direct integrations with major MLS systems for real-time listing data, comparables, and market analytics.' },
          { icon: '💳', title: 'Payment Processing', description: 'Integrated payment solutions for earnest money, commissions, and transaction fee processing.' },
          { icon: '📬', title: 'Email & Marketing', description: 'Connect with Mailchimp, Constant Contact, and other platforms for automated drip campaigns and client communication.' },
          { icon: '📊', title: 'Analytics & Reporting', description: 'Integrate with Google Analytics, Tableau, and custom reporting tools for business intelligence.' },
          { icon: '🔐', title: 'Identity & Compliance', description: 'KYC, AML, and identity verification integrations to streamline compliance and protect transactions.' },
          { icon: '🤖', title: 'AI & Automation', description: 'Zapier, Make, and custom API integrations for workflow automation and AI-powered processes.' },
        ]}
      />

      <CTASection
        title="Build an Integration"
        subtitle="Interested in integrating with our platform? Contact our partnerships team to get started."
        primaryAction={{ label: 'Contact Partnerships', href: '/contact' }}
        secondaryAction={{ label: 'View All Partners', href: '/partners' }}
      />
    </main>
  );
}
