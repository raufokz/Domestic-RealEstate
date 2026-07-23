import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";

const LAST_UPDATED = "July 22, 2026";

export const metadata = buildMetadata({
  title: "Accessibility Statement",
  description:
    "Domestic Real Estate is committed to digital accessibility and conformance with WCAG 2.1 Level AA and the ADA. Learn about our accessibility features and how to request assistance.",
  path: "/accessibility",
  keywords: [
    "accessibility statement",
    "ADA compliance",
    "WCAG 2.1 AA",
    "accessible real estate website",
    "web accessibility",
  ],
});

const sections: LegalSection[] = [
  {
    id: "our-commitment",
    heading: "Our Commitment",
    body: (
      <p>
        Domestic Real Estate is committed to ensuring digital accessibility for people with disabilities. We are
        continually improving the user experience for everyone and applying the relevant accessibility standards to
        our website, portals, forms, calculators, and property tools.
      </p>
    ),
  },
  {
    id: "standards",
    heading: "Conformance Standards",
    body: (
      <p>
        We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>, and to
        meet the expectations of the <strong>Americans with Disabilities Act (ADA)</strong>. These guidelines
        explain how to make web content more accessible to people with a wide range of disabilities.
      </p>
    ),
  },
  {
    id: "features",
    heading: "Accessibility Features",
    body: (
      <>
        <p>Our platform includes:</p>
        <ul>
          <li>Semantic HTML landmarks and a “skip to content” link for keyboard and screen-reader users.</li>
          <li>Visible keyboard focus states on interactive elements.</li>
          <li>Text alternatives for meaningful images and icons.</li>
          <li>Color contrast that targets WCAG AA, and layouts that reflow down to small screens.</li>
          <li>Form fields with associated labels and clear, descriptive error messages.</li>
          <li>Respect for reduced-motion preferences.</li>
        </ul>
      </>
    ),
  },
  {
    id: "known-limitations",
    heading: "Known Limitations",
    body: (
      <p>
        Despite our efforts, some content — particularly third-party maps, embedded media, or user-uploaded
        documents — may not yet be fully accessible. We are actively working to identify and resolve these issues,
        and we welcome your feedback so we can prioritize fixes.
      </p>
    ),
  },
  {
    id: "assistance",
    heading: "Requesting Assistance",
    body: (
      <p>
        If you need information from this site in an alternative format, or you have trouble completing a task such
        as scheduling a viewing or submitting an inquiry, contact us and we will help you directly and provide the
        information you need.
      </p>
    ),
  },
  {
    id: "feedback",
    heading: "Feedback & Contact",
    body: (
      <p>
        We welcome your feedback on the accessibility of Domestic Real Estate. If you encounter a barrier, please
        email <a href="mailto:accessibility@domesticrealestate.us">accessibility@domesticrealestate.us</a> with a
        description of the issue and the page URL. We aim to respond within five business days.
      </p>
    ),
  },
];

export default function AccessibilityPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            name: "Accessibility Statement",
            description: "Domestic Real Estate's commitment to WCAG 2.1 AA and ADA accessibility.",
            path: "/accessibility",
            dateModified: "2026-07-22",
          }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Accessibility Statement", path: "/accessibility" },
          ]),
        ]}
      />
      <LegalDocument
        eyebrow="Equal Access Commitment"
        title="Accessibility Statement"
        lastUpdated={LAST_UPDATED}
        intro={
          <p>
            We believe everyone deserves equal access to housing information and tools. This statement describes our
            approach to accessibility, the standards we follow, and how to reach us if you experience a barrier.
          </p>
        }
        sections={sections}
      />
    </>
  );
}
