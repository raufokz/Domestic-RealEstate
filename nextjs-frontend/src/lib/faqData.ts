export interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

/**
 * Single source of truth for the public FAQ.
 *
 * The FAQ page renders both the visible accordion (via FaqAccordionWidget) and
 * the FAQPage JSON-LD from this same array, so structured data always matches
 * what users actually see (a Google requirement for FAQ rich results).
 */
export const faqs: FAQItem[] = [
  {
    category: "General",
    question: "What is Domestic Real Estate and how does it work?",
    answer:
      "Domestic Real Estate is a premium AI-powered property platform connecting home buyers, property sellers, top real estate agents, investors, and lenders across the US & Canada. We deliver real-time listings, off-market motivated seller deal feeds, and intelligent property matching.",
  },
  {
    category: "Sellers",
    question: "How does the instant AI Home Valuation estimate work?",
    answer:
      "Our valuation tool combines public property records, recent neighborhood closed-sale comparables, active market inventory, and analytics to estimate your property's fair market value range in seconds. Estimates are informational only and are not a formal appraisal.",
  },
  {
    category: "Sellers",
    question: "Can I receive direct cash offers for my home?",
    answer:
      "Yes. Sellers can choose between connecting with top-producing local listing agents or requesting cash offers from our network of verified buyers, then compare options with no obligation.",
  },
  {
    category: "Buyers",
    question: "How do I get pre-approved for a mortgage on Domestic Real Estate?",
    answer:
      "You can connect with our network of vetted lenders through the platform to request pre-approval, compare rate structures, and estimate monthly principal, interest, taxes, and insurance using our calculators.",
  },
  {
    category: "Agents & Brokers",
    question: "How does Zip Code Lead Exclusivity work for agents?",
    answer:
      "Our exclusive zip code program lets select agents claim exclusive rights to seller leads generated within their target markets during an active subscription, reducing lead duplication and competition.",
  },
  {
    category: "Investors",
    question: "What deal metrics do you provide for investors?",
    answer:
      "Investors receive deal sheets with estimated After-Repair Value (ARV), estimated rehab budgets, cap rates, gross rent multipliers, and cash-flow projections. All figures are estimates for informational purposes only.",
  },
  {
    category: "Technology",
    question: "What CRM and tools integrate with Domestic Real Estate?",
    answer:
      "The platform includes its own built-in CRM, automation, and marketing tools, and supports webhook and API integrations so you can connect the external systems your team already uses.",
  },
  {
    category: "Pricing",
    question: "Are there fees for home buyers or sellers using the platform?",
    answer:
      "Searching properties, requesting AI home valuations, using financial calculators, and contacting agents or lenders is free for buyers and sellers. Paid plans apply to professional and business accounts.",
  },
];

export const faqCategories = [
  "All",
  "General",
  "Buyers",
  "Sellers",
  "Agents & Brokers",
  "Investors",
  "Technology",
  "Pricing",
];
