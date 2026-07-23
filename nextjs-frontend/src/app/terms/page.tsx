import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";

const LAST_UPDATED = "July 22, 2026";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "The terms governing use of the Domestic Real Estate platform — accounts, subscriptions and billing, listings, acceptable use, Fair Housing compliance, disclaimers, and dispute resolution.",
  path: "/terms",
  keywords: [
    "terms of service",
    "user agreement",
    "real estate platform terms",
    "fair housing compliance",
    "subscription billing terms",
  ],
});

const sections: LegalSection[] = [
  {
    id: "acceptance",
    heading: "Acceptance of Terms",
    body: (
      <p>
        By creating an account or using Domestic Real Estate (the “Platform”), you agree to these Terms of Service
        and our <a href="/privacy">Privacy Policy</a>. If you use the Platform on behalf of a brokerage or company,
        you represent that you are authorized to bind that entity. If you do not agree, do not use the Platform.
      </p>
    ),
  },
  {
    id: "eligibility-accounts",
    heading: "Eligibility & Accounts",
    body: (
      <>
        <p>You must be at least 18 and able to form a binding contract. You agree to:</p>
        <ul>
          <li>Provide accurate account information and keep it up to date.</li>
          <li>Keep your credentials confidential and secure.</li>
          <li>Be responsible for all activity under your account.</li>
          <li>Notify us promptly of any unauthorized access.</li>
        </ul>
      </>
    ),
  },
  {
    id: "roles-and-services",
    heading: "Roles & Services",
    body: (
      <p>
        The Platform provides role-based portals for buyers, sellers, investors, wholesalers, agents, brokers,
        lenders, and title partners, along with tools for search, CRM, marketing, and AI assistance. Available
        features depend on your role, subscription, and applicable law. Licensed activities remain the
        responsibility of the appropriately licensed professional.
      </p>
    ),
  },
  {
    id: "subscriptions-billing",
    heading: "Subscriptions, Invoices & Payments",
    body: (
      <>
        <p>
          Paid plans and lead packages are billed as described at purchase. We use a manual, invoice-based payment
          workflow (Payoneer-compatible); we do not process card payments through the Platform unless expressly
          enabled by an administrator.
        </p>
        <ul>
          <li>Fees are stated in your invoice and are due by the stated date.</li>
          <li>Unless required by law, fees are non-refundable once services are rendered.</li>
          <li>We may change pricing prospectively with reasonable notice.</li>
        </ul>
      </>
    ),
  },
  {
    id: "listings-content",
    heading: "Listings & User Content",
    body: (
      <>
        <p>
          You are responsible for content you submit, including listings, media, and messages, and you must have the
          rights to share it. You grant us a non-exclusive license to host and display your content to operate the
          Platform. You must ensure listing information is accurate and lawful, and you must not post content that is
          misleading, infringing, or discriminatory.
        </p>
      </>
    ),
  },
  {
    id: "fair-housing",
    heading: "Fair Housing & Non-Discrimination",
    body: (
      <p>
        All users must comply with the <strong>Fair Housing Act</strong> and applicable state, provincial, and local
        laws. You may not use the Platform to discriminate against any person on the basis of a protected class or to
        publish discriminatory statements, preferences, or limitations.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable Use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Violate any law or third-party right, including TCPA rules on calls and texts.</li>
          <li>Scrape, reverse-engineer, or disrupt the Platform or its security.</li>
          <li>Upload malware or attempt unauthorized access to any account or data.</li>
          <li>Send spam or misuse messaging, email, or lead-distribution features.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-tools",
    heading: "AI-Assisted Features",
    body: (
      <p>
        AI features generate suggestions, drafts, and estimates that may be inaccurate or incomplete. They are
        provided “as is” to assist you and are not professional, legal, financial, or valuation advice. You are
        responsible for reviewing outputs before relying on or publishing them.
      </p>
    ),
  },
  {
    id: "no-advice",
    heading: "No Professional Advice; Estimates",
    body: (
      <p>
        Valuations, ROI, cap-rate, cash-flow, and affordability tools produce <strong>estimates for informational
        purposes only</strong> and are not appraisals or financial, legal, or tax advice. Real transactions require
        independent verification, title work, and licensed representation.
      </p>
    ),
  },
  {
    id: "third-parties",
    heading: "Third-Party Services",
    body: (
      <p>
        The Platform may integrate with third-party services (maps, email, analytics, payment). Your use of those
        services is subject to their terms, and we are not responsible for their content or availability.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "Suspension & Termination",
    body: (
      <p>
        We may suspend or terminate access for violations of these Terms, risk to the Platform or users, or as
        required by law. You may stop using the Platform at any time. Provisions that by their nature should survive
        termination will survive.
      </p>
    ),
  },
  {
    id: "disclaimers",
    heading: "Disclaimers & Limitation of Liability",
    body: (
      <p>
        The Platform is provided “as is” and “as available” without warranties of any kind, to the fullest extent
        permitted by law. To the maximum extent permitted, Domestic Real Estate is not liable for indirect,
        incidental, or consequential damages, and our total liability is limited to the amounts you paid us in the
        12 months before the claim.
      </p>
    ),
  },
  {
    id: "disputes",
    heading: "Governing Law & Disputes",
    body: (
      <p>
        These Terms are governed by the laws of the jurisdiction stated in your invoice or, if none, the United
        States and the State designated by Domestic Real Estate, without regard to conflict-of-laws rules. The
        parties will attempt to resolve disputes informally before pursuing formal proceedings.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to These Terms",
    body: (
      <p>
        We may update these Terms from time to time. Continued use after changes take effect constitutes acceptance.
        Material changes will be posted here with an updated “Last updated” date.
      </p>
    ),
  },
  {
    id: "contact-us",
    heading: "Contact Us",
    body: (
      <p>
        Questions about these Terms? Email <a href="mailto:legal@domesticrealestate.us">legal@domesticrealestate.us</a>{" "}
        or visit our <a href="/contact">contact page</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            name: "Terms of Service",
            description: "The terms governing use of the Domestic Real Estate platform.",
            path: "/terms",
            dateModified: "2026-07-22",
          }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Terms of Service", path: "/terms" },
          ]),
        ]}
      />
      <LegalDocument
        eyebrow="Legal Agreement"
        title="Terms of Service"
        lastUpdated={LAST_UPDATED}
        templateNotice
        intro={
          <p>
            These Terms of Service govern your access to and use of the Domestic Real Estate platform, portals, and
            services. Please read them carefully. They include important provisions about payments, disclaimers, and
            limitations of liability.
          </p>
        }
        sections={sections}
      />
    </>
  );
}
