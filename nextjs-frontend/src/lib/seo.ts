import type { Metadata } from "next";

/**
 * Centralised SEO helpers for Domestic Real Estate.
 *
 * The root layout (`src/app/layout.tsx`) already sets `metadataBase`,
 * a title template (`%s | Domestic Real Estate`), default robots, icons
 * and the site-wide Organization JSON-LD. These helpers layer correct
 * per-page metadata on top of that baseline with the least possible
 * boilerplate: canonical URL, Open Graph, Twitter card and keywords.
 */

export const SITE_URL = "https://www.domesticrealestate.us";
export const SITE_NAME = "Domestic Real Estate";
export const DEFAULT_OG_IMAGE = "/og-image.png";

export interface PageSeo {
  /** Page-specific title. The root template appends " | Domestic Real Estate". */
  title: string;
  /** Use when you need a title WITHOUT the brand template applied. */
  fullTitle?: string;
  description: string;
  /** Absolute site path, e.g. "/about". Used for canonical + OG url. */
  path: string;
  keywords?: string[];
  /** OG/Twitter image path (relative resolves against metadataBase). */
  image?: string;
  ogType?: "website" | "article" | "profile";
  /** Set true for pages that must not be indexed (auth, portals, etc.). */
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  /**
   * Editor-supplied overrides (e.g. a blog post's canonical_url, OG, and
   * Twitter card fields). Each falls back to the generic title/description
   * /image above when omitted, so filling these in is optional, never required.
   */
  canonicalOverride?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

/** Build a complete, consistent `Metadata` object for a page. */
export function buildMetadata(seo: PageSeo): Metadata {
  const {
    title,
    fullTitle,
    description,
    path,
    keywords,
    image = DEFAULT_OG_IMAGE,
    ogType = "website",
    noindex = false,
    publishedTime,
    modifiedTime,
    canonicalOverride,
    ogTitle: ogTitleOverride,
    ogDescription,
    twitterTitle,
    twitterDescription,
    twitterImage,
  } = seo;

  const canonical = canonicalOverride || (path.startsWith("/") ? path : `/${path}`);
  // OG/Twitter don't use the title template, so give them the branded title.
  const ogTitle = ogTitleOverride || fullTitle || `${title} | ${SITE_NAME}`;
  const ogDesc = ogDescription || description;

  return {
    title: fullTitle ? { absolute: fullTitle } : title,
    description,
    ...(keywords && keywords.length ? { keywords } : {}),
    alternates: { canonical },
    openGraph: {
      type: ogType,
      url: canonical,
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDesc,
      images: [{ url: image, width: 1200, height: 630, alt: ogTitle }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle || ogTitle,
      description: twitterDescription || ogDesc,
      images: [twitterImage || image],
    },
    ...(noindex
      ? { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
      : {}),
  };
}

/* -------------------------------------------------------------------------- */
/*  JSON-LD structured-data builders                                          */
/* -------------------------------------------------------------------------- */

function absUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** BreadcrumbList schema. Always lead with Home for context. */
export function breadcrumbLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** FAQPage schema — eligible for FAQ rich results. */
export function faqLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export interface RealEstateAgentLd {
  name: string;
  path: string;
  description?: string | null;
  image?: string | null;
  telephone?: string | null;
  email?: string | null;
  jobTitle?: string | null;
  brokerage?: string | null;
  city?: string | null;
  state?: string | null;
  /** Average review score. Omitted from output unless reviewCount > 0. */
  rating?: number | null;
  reviewCount?: number | null;
  sameAs?: string[];
}

/**
 * RealEstateAgent schema for individual agent profiles.
 *
 * Every field is emitted only when the underlying value actually exists, so the
 * markup never claims data the page does not show. aggregateRating in
 * particular is dropped unless there is a real rating AND a real review count —
 * Google treats an invented rating as a structured-data violation.
 */
export function realEstateAgentLd(agent: RealEstateAgentLd) {
  const address =
    agent.city || agent.state
      ? {
          "@type": "PostalAddress",
          ...(agent.city ? { addressLocality: agent.city } : {}),
          ...(agent.state ? { addressRegion: agent.state } : {}),
        }
      : undefined;

  const hasRating =
    typeof agent.rating === "number" &&
    agent.rating > 0 &&
    typeof agent.reviewCount === "number" &&
    agent.reviewCount > 0;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.name,
    url: absUrl(agent.path),
    ...(agent.description ? { description: agent.description } : {}),
    ...(agent.image ? { image: agent.image } : {}),
    ...(agent.telephone ? { telephone: agent.telephone } : {}),
    ...(agent.email ? { email: agent.email } : {}),
    ...(agent.jobTitle ? { jobTitle: agent.jobTitle } : {}),
    ...(address ? { address } : {}),
    ...(agent.city ? { areaServed: { "@type": "Place", name: agent.city } } : {}),
    ...(agent.brokerage
      ? { worksFor: { "@type": "Organization", name: agent.brokerage } }
      : {}),
    ...(agent.sameAs && agent.sameAs.length ? { sameAs: agent.sameAs } : {}),
    ...(hasRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: agent.rating,
            reviewCount: agent.reviewCount,
          },
        }
      : {}),
    parentOrganization: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

/**
 * Standalone Organization schema — matches the site-wide entity emitted in
 * the root layout (name/url/logo/sameAs), for pages that need to reference
 * the organization on its own (e.g. as `publisher`) rather than nested
 * inside another schema.
 */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/Domestic-logo.png`,
    sameAs: [
      "https://facebook.com/domesticrealestate",
      "https://twitter.com/domesticrealestate",
      "https://linkedin.com/company/domesticrealestate",
      "https://instagram.com/domesticrealestate",
    ],
  };
}

/**
 * LocalBusiness schema for a specific served area/page (e.g. a city landing
 * page). Emits `@type: ["RealEstateAgent", "LocalBusiness"]` on the same
 * entity — see the identical pattern in the root layout's site-wide schema —
 * rather than a second, duplicate entity. Only includes fields the page
 * actually has; never fabricates a street address the business doesn't
 * publish (this is a multi-location platform, not a single storefront).
 */
export function localBusinessLd(opts: { path: string; areaServed?: string | null; telephone?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    name: SITE_NAME,
    url: absUrl(opts.path),
    image: `${SITE_URL}/Domestic-logo.png`,
    priceRange: "$$$",
    address: { "@type": "PostalAddress", addressCountry: "US" },
    ...(opts.areaServed ? { areaServed: { "@type": "Place", name: opts.areaServed } } : {}),
    ...(opts.telephone ? { telephone: opts.telephone } : {}),
  };
}

export interface ArticleLd {
  headline: string;
  description: string;
  path: string;
  image?: string | null;
  authorName?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  section?: string | null;
  keywords?: string[];
}

/** BlogPosting (Article subtype) schema for blog posts. */
export function articleLd(opts: ArticleLd) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.headline,
    description: opts.description,
    url: absUrl(opts.path),
    ...(opts.image ? { image: absUrl(opts.image) } : {}),
    ...(opts.publishedTime ? { datePublished: opts.publishedTime } : {}),
    dateModified: opts.modifiedTime || opts.publishedTime,
    author: opts.authorName
      ? { "@type": "Person", name: opts.authorName }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/Domestic-logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absUrl(opts.path) },
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(opts.keywords && opts.keywords.length ? { keywords: opts.keywords.join(", ") } : {}),
  };
}

export interface ListingLd {
  name: string;
  description?: string | null;
  path: string;
  /** Single image path, or an array for a full gallery. */
  image?: string | string[] | null;
  price?: number | null;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "Sold";
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  streetAddress?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  numberOfRooms?: number | null;
  /** Floor size in square feet. */
  floorSizeSqft?: number | null;
}

/** Product + Offer schema for a property listing detail page. */
export function listingLd(opts: ListingLd) {
  const availabilityMap: Record<string, string> = {
    InStock: "https://schema.org/InStock",
    OutOfStock: "https://schema.org/OutOfStock",
    Sold: "https://schema.org/SoldOut",
  };

  const hasGeo =
    typeof opts.latitude === "number" && typeof opts.longitude === "number" &&
    isFinite(opts.latitude) && isFinite(opts.longitude);

  const images = Array.isArray(opts.image) ? opts.image : opts.image ? [opts.image] : [];

  return {
    "@context": "https://schema.org",
    "@type": ["Product", "Residence"],
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url: absUrl(opts.path),
    ...(images.length ? { image: images.map(absUrl) } : {}),
    ...(opts.streetAddress || opts.city || opts.state || opts.zip
      ? {
          address: {
            "@type": "PostalAddress",
            ...(opts.streetAddress ? { streetAddress: opts.streetAddress } : {}),
            ...(opts.city ? { addressLocality: opts.city } : {}),
            ...(opts.state ? { addressRegion: opts.state } : {}),
            ...(opts.zip ? { postalCode: opts.zip } : {}),
            addressCountry: opts.country || "US",
          },
        }
      : {}),
    ...(hasGeo ? { geo: { "@type": "GeoCoordinates", latitude: opts.latitude, longitude: opts.longitude } } : {}),
    ...(opts.numberOfRooms ? { numberOfRooms: opts.numberOfRooms } : {}),
    ...(opts.floorSizeSqft
      ? { floorSize: { "@type": "QuantitativeValue", value: opts.floorSizeSqft, unitCode: "FTK" } }
      : {}),
    ...(opts.price
      ? {
          offers: {
            "@type": "Offer",
            price: opts.price,
            priceCurrency: opts.priceCurrency || "USD",
            availability: availabilityMap[opts.availability || "InStock"],
            url: absUrl(opts.path),
          },
        }
      : {}),
  };
}

/** Generic WebPage schema for informational/legal pages. */
export function webPageLd(opts: { name: string; description: string; path: string; dateModified?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: absUrl(opts.path),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

/** ContactPage schema. */
export function contactPageLd(opts: { path: string; email: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: absUrl(opts.path),
    name: `Contact ${SITE_NAME}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      email: opts.email,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: opts.email,
        availableLanguage: ["English"],
      },
    },
  };
}
