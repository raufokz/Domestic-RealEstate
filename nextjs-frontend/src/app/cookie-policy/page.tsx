import { buildMetadata, breadcrumbLd, webPageLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";

const LAST_UPDATED = "July 22, 2026";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description:
    "What cookies and similar technologies Domestic Real Estate uses, why we use them, and how you can manage or opt out of them.",
  path: "/cookie-policy",
  keywords: ["cookie policy", "cookies", "analytics cookies", "cookie consent", "manage cookies"],
});

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    heading: "What Are Cookies?",
    body: (
      <p>
        Cookies are small text files placed on your device when you visit a website. We also use similar
        technologies such as local storage and pixels. Together we refer to these as “cookies.” They help the site
        work, remember your preferences, and understand how the site is used.
      </p>
    ),
  },
  {
    id: "essential-cookies",
    heading: "Strictly Necessary Cookies",
    body: (
      <p>
        These enable core functionality such as secure sign-in, session management, saving your search filters, and
        remembering calculator inputs. The site cannot function properly without them, so they cannot be switched
        off in our systems.
      </p>
    ),
  },
  {
    id: "preference-cookies",
    heading: "Preference Cookies",
    body: (
      <p>
        These remember choices you make — such as saved properties, notification settings, and display preferences —
        to give you a more personalized experience.
      </p>
    ),
  },
  {
    id: "analytics-cookies",
    heading: "Analytics & Performance Cookies",
    body: (
      <p>
        These help us understand which pages are visited and how the site performs, so we can improve navigation,
        search, and recommendations. The data is aggregated and used to make the Platform better.
      </p>
    ),
  },
  {
    id: "marketing-cookies",
    heading: "Marketing Cookies",
    body: (
      <p>
        Where enabled and with your consent, these help us measure campaign performance and show more relevant
        content. You can decline these without affecting core site functionality.
      </p>
    ),
  },
  {
    id: "managing-cookies",
    heading: "Managing Your Preferences",
    body: (
      <>
        <p>You control cookies in two ways:</p>
        <ul>
          <li>Through our cookie consent banner, where you can accept or decline non-essential categories.</li>
          <li>Through your browser settings, where you can block or delete cookies. Note that blocking essential cookies may break parts of the site.</li>
        </ul>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to This Policy",
    body: (
      <p>
        We may update this Cookie Policy as our practices or the law change. Updates are posted here with a new
        “Last updated” date.
      </p>
    ),
  },
  {
    id: "contact-us",
    heading: "Contact Us",
    body: (
      <p>
        Questions about our use of cookies? Email{" "}
        <a href="mailto:info@domesticrealestate.us">info@domesticrealestate.us</a>. See also our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd({
            name: "Cookie Policy",
            description: "What cookies Domestic Real Estate uses and how to manage them.",
            path: "/cookie-policy",
            dateModified: "2026-07-22",
          }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Cookie Policy", path: "/cookie-policy" },
          ]),
        ]}
      />
      <LegalDocument
        eyebrow="Privacy & Compliance"
        title="Cookie Policy"
        lastUpdated={LAST_UPDATED}
        templateNotice
        intro={
          <p>
            This Cookie Policy explains how Domestic Real Estate uses cookies and similar technologies on our website
            and portals, and the choices available to you.
          </p>
        }
        sections={sections}
      />
    </>
  );
}
