import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";

const LAST_UPDATED = "July 22, 2026";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How Domestic Real Estate collects, uses, shares, and protects your personal information — including TCPA, CCPA/CPRA, and Fair Housing compliance for buyers, sellers, investors, and agents across the US & Canada.",
  path: "/privacy",
  keywords: [
    "privacy policy",
    "real estate data protection",
    "TCPA compliance",
    "CCPA CPRA real estate",
    "personal information",
    "do not sell my information",
  ],
});

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    heading: "Information We Collect",
    body: (
      <>
        <p>We collect the following categories of information to operate the platform and provide our services:</p>
        <ul>
          <li><strong>Information you provide:</strong> name, email address, phone number, mailing and property addresses, budget and financing details, buy-box criteria, documents you upload, and messages you send.</li>
          <li><strong>Account &amp; profile data:</strong> role (buyer, seller, investor, wholesaler, agent, broker, lender, title, staff), license numbers where applicable, and communication preferences.</li>
          <li><strong>Usage data:</strong> pages viewed, searches and filters, saved properties, device and browser type, IP address, and approximate location.</li>
          <li><strong>Cookies &amp; similar technologies:</strong> as described in our <a href="/cookie-policy">Cookie Policy</a>.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-your-data",
    heading: "How We Use Your Information",
    body: (
      <>
        <p>We use personal information to:</p>
        <ul>
          <li>Create and manage your account and role-based portal access.</li>
          <li>Match buyers, sellers, and investors with relevant listings, agents, and opportunities.</li>
          <li>Respond to inquiries, valuation requests, showing requests, and support tickets.</li>
          <li>Send transactional messages and, with your consent, marketing communications.</li>
          <li>Improve our search, recommendations, and AI-assisted features.</li>
          <li>Detect fraud, enforce our <a href="/terms">Terms of Service</a>, and meet legal obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "legal-bases-and-consent",
    heading: "Consent & Legal Bases",
    body: (
      <p>
        We process your information based on your consent, to perform a contract with you, to comply with legal
        obligations, and for our legitimate interests in operating and securing the platform. Where marketing or
        automated calls/texts require consent under the <strong>Telephone Consumer Protection Act (TCPA)</strong>,
        we obtain it before contacting you and honor opt-out requests promptly.
      </p>
    ),
  },
  {
    id: "how-we-share",
    heading: "How We Share Information",
    body: (
      <>
        <p>
          We do <strong>not</strong> sell your personal information to unauthorized third parties. We share information only:
        </p>
        <ul>
          <li>With the verified real estate professionals you ask to connect with (e.g., an agent or lender handling your inquiry).</li>
          <li>With service providers who process data on our behalf under contract (hosting, email delivery, analytics, payment processing).</li>
          <li>When required by law, legal process, or to protect the rights and safety of users and the public.</li>
          <li>In connection with a merger, acquisition, or sale of assets, subject to this Policy.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-privacy-rights",
    heading: "Your Privacy Rights (CCPA/CPRA & More)",
    body: (
      <>
        <p>
          Depending on where you live, you may have the right to access, correct, delete, or port your personal
          information, and to opt out of certain sharing. California residents have rights under the{" "}
          <strong>CCPA/CPRA</strong>, including the right to know, delete, correct, and limit use of sensitive
          personal information, and the right to non-discrimination for exercising these rights.
        </p>
        <p>
          To exercise any right, email{" "}
          <a href="mailto:privacy@domesticrealestate.us">privacy@domesticrealestate.us</a>. We will verify your
          request and respond within the timeframes required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "fair-housing",
    heading: "Fair Housing Commitment",
    body: (
      <p>
        Domestic Real Estate supports equal opportunity in housing. We do not use personal information to
        discriminate on the basis of race, color, religion, sex, disability, familial status, national origin, or
        any class protected under the <strong>Fair Housing Act</strong> and applicable state and provincial laws.
      </p>
    ),
  },
  {
    id: "data-retention",
    heading: "Data Retention",
    body: (
      <p>
        We keep personal information only as long as needed for the purposes described here, to comply with legal
        and tax obligations, resolve disputes, and enforce agreements. When no longer needed, we securely delete or
        anonymize it.
      </p>
    ),
  },
  {
    id: "security",
    heading: "How We Protect Your Information",
    body: (
      <p>
        We use technical and organizational safeguards including encryption in transit, access controls, audit
        logging, and least-privilege permissions. No system is perfectly secure, but we work continuously to
        protect your data and will notify affected users and regulators of a breach where required by law.
      </p>
    ),
  },
  {
    id: "childrens-privacy",
    heading: "Children's Privacy",
    body: (
      <p>
        Our services are intended for users 18 and older. We do not knowingly collect personal information from
        children. If you believe a child has provided us information, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "international",
    heading: "US & Canada Data Transfers",
    body: (
      <p>
        We operate across the United States and Canada. Your information may be processed in either country under
        safeguards consistent with this Policy and applicable law, including PIPEDA for Canadian residents.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to This Policy",
    body: (
      <p>
        We may update this Policy from time to time. Material changes will be posted here with an updated “Last
        updated” date, and where required, we will notify you directly.
      </p>
    ),
  },
  {
    id: "contact-us",
    heading: "Contact Us",
    body: (
      <p>
        Questions or requests about your privacy? Email{" "}
        <a href="mailto:privacy@domesticrealestate.us">privacy@domesticrealestate.us</a> or visit our{" "}
        <a href="/contact">contact page</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            name: "Privacy Policy",
            description: "How Domestic Real Estate collects, uses, and protects your personal information.",
            path: "/privacy",
            dateModified: "2026-07-22",
          }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Privacy Policy", path: "/privacy" },
          ]),
        ]}
      />
      <LegalDocument
        eyebrow="Legal & Compliance"
        title="Privacy Policy"
        lastUpdated={LAST_UPDATED}
        templateNotice
        intro={
          <p>
            This Privacy Policy explains what information Domestic Real Estate (“we,” “us”) collects, how we use and
            share it, and the choices and rights you have. It applies to our website, portals, and services for
            buyers, sellers, investors, wholesalers, agents, brokers, lenders, and title partners across the US &amp; Canada.
          </p>
        }
        sections={sections}
      />
    </>
  );
}
