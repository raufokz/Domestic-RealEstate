import type { Metadata } from "next";
import { buildMetadata, SITE_NAME, SITE_URL, breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import HomeClient from "@/components/home/HomeClient";

export const metadata: Metadata = buildMetadata({
  fullTitle: "Domestic Real Estate | #1 AI Property & Off-Market Marketplace (DomesticRealEstate)",
  title: "Domestic Real Estate | Buy, Sell & Invest Properties",
  description:
    "Domestic Real Estate (DomesticRealEstate / Domestic Realestate) — Your key to home. Search thousands of MLS listings, get instant AI property valuations, off-market deal flow, and connect with top 1% agents across the US and Canada.",
  path: "/",
  keywords: [
    "Domestic Real Estate",
    "domestic real estate",
    "DomesticRealEstate",
    "domesticrealestate",
    "Domestic Realestate",
    "domestic realestate",
    "real estate platform",
    "buy home online",
    "sell home fast",
    "off-market properties",
    "AI property valuation",
    "MLS listings search",
    "real estate investing",
    "top real estate agents",
    "mortgage calculator",
    "home buyer assistance",
    "cash offers real estate",
  ],
});

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: ["Domestic Realestate", "DomesticRealEstate", "domestic real estate"],
  url: SITE_URL,
  logo: `${SITE_URL}/Domestic-logo.png`,
  description:
    "Domestic Real Estate (DomesticRealEstate / Domestic Realestate) is an AI-powered real estate platform connecting buyers, sellers, and investors with top agents and off-market deals across the United States and Canada.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "info@domesticrealestate.us",
    availableLanguage: ["English"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: ["Domestic Realestate", "DomesticRealEstate"],
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/properties?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[orgSchema, websiteSchema, breadcrumbLd([{ name: "Home", path: "/" }])]} />
      <HomeClient />
    </>
  );
}
