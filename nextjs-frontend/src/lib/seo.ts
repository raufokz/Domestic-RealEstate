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
