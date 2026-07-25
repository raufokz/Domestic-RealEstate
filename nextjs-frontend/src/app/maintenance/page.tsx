import type { Metadata } from 'next';
import { PageHero, CTASection, ContentSection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Under Maintenance',
  description: 'Domestic Real Estate is currently undergoing scheduled maintenance. We will be back shortly.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main>
      <PageHero
        bg="burgundy"
        badge="Scheduled Maintenance"
        title="Under Maintenance"
        subtitle="We are performing scheduled maintenance to improve your experience. We will be back shortly."
      />

      <ContentSection title="What is Happening?">
        <p>
          Domestic Real Estate is currently undergoing scheduled maintenance and system upgrades.
          During this time, certain features of the platform may be temporarily unavailable.
        </p>
        <p>
          Our team is working to complete these improvements as quickly as possible. We
          appreciate your patience and understanding while we work to enhance our services.
        </p>
        <ul>
          <li>
            <strong>Estimated Return:</strong> We anticipate the platform will be fully
            operational within the next few hours.
          </li>
          <li>
            <strong>Affected Features:</strong> Property searches, lead submissions, and
            dashboard access may be temporarily limited during the maintenance window.
          </li>
          <li>
            <strong>Your Data:</strong> All user accounts, saved searches, and data remain
            secure and unaffected by this maintenance.
          </li>
        </ul>
      </ContentSection>

      <CTASection
        bg="navy"
        title="Questions About the Maintenance?"
        subtitle="If you have urgent inquiries or need immediate assistance, please reach out to our team."
        primaryAction={{
          label: 'Contact Us',
          href: '/contact',
        }}
        secondaryAction={{
          label: 'Send an Email',
          href: 'mailto:info@domesticrealestate.us',
        }}
      />
    </main>
  );
}
