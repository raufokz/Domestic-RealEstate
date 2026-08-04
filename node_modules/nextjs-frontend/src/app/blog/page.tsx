import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getBlogPosts } from "@/lib/blog";
import BlogListingContainer, { InformationalGuide } from "@/components/blog/BlogListingContainer";

export const metadata = buildMetadata({
  title: "Domestic Real Estate Insights, Market Trends & Investor Guides",
  description:
    "Expert analysis on domestic real estate investments, market bubble indicators, GDP impact, property valuation models, and US investment companies.",
  path: "/blog",
  keywords: [
    "Domestic vs International Real Estate Investment",
    "Real Estate Investment Process Domestic vs Foreign",
    "Differences in Real Estate Investment Process Domestic vs International",
    "Similarities Between Domestic and International Real Estate Investment Processes",
    "Biggest Domestic Real Estate Investment Companies in the US",
    "Biggest US Domestic Real Estate Investor",
    "Largest Domestic Real Estate Companies in Boston Area",
    "Domestic Real Estate Bubble Explained",
    "Domestic Real Estate Index Explained",
    "Domestic Real Estate Stocks Guide",
    "How Domestic Real Estate Values Are Determined",
    "Real Estate Generates Over Percent of U.S. Gross Domestic Product",
    "real estate blog",
    "housing market trends",
    "real estate investment advice",
  ],
});

const informationalGuides: InformationalGuide[] = [
  {
    title: "Domestic vs International Real Estate Investment",
    slug: "domestic-vs-international-real-estate-investment",
    category: "Investment Analysis",
    readTime: "8 min read",
    desc: "Comprehensive breakdown comparing domestic property acquisition vs cross-border foreign real estate investments.",
  },
  {
    title: "Real Estate Investment Process Domestic vs Foreign",
    slug: "real-estate-investment-process-domestic-vs-foreign",
    category: "Investor Guide",
    readTime: "7 min read",
    desc: "Step-by-step walkthrough of legal compliance, title escrow, financing, and tax structures for domestic vs foreign buyers.",
  },
  {
    title: "Differences in Real Estate Investment Process Domestic vs International",
    slug: "differences-in-real-estate-investment-process-domestic-vs-international",
    category: "Legal & Tax",
    readTime: "9 min read",
    desc: "Key regulatory, currency risk, and tax withholding differences between domestic transactions and overseas properties.",
  },
  {
    title: "Similarities Between Domestic and International Real Estate Investment Processes",
    slug: "similarities-between-domestic-and-international-real-estate-investment-processes",
    category: "Market Fundamentals",
    readTime: "6 min read",
    desc: "Common valuation frameworks, due diligence procedures, and cap rate calculations shared across global markets.",
  },
  {
    title: "Biggest Domestic Real Estate Investment Companies in the US",
    slug: "biggest-domestic-real-estate-investment-companies-in-the-us",
    category: "Industry Leaders",
    readTime: "10 min read",
    desc: "Profile of top US domestic real estate funds, institutional REITs, and equity firms managing mega portfolios.",
  },
  {
    title: "Biggest US Domestic Real Estate Investor",
    slug: "biggest-us-domestic-real-estate-investor",
    category: "Institutional Capital",
    readTime: "7 min read",
    desc: "In-depth analysis of the largest single domestic real estate investor entities and asset allocation strategies.",
  },
  {
    title: "Largest Domestic Real Estate Companies in Boston Area",
    slug: "largest-domestic-real-estate-companies-in-boston-area",
    category: "Regional Markets",
    readTime: "8 min read",
    desc: "Spotlight on leading real estate brokerages, development firms, and private equity groups operating in Greater Boston.",
  },
  {
    title: "Domestic Real Estate Bubble Explained",
    slug: "domestic-real-estate-bubble-explained",
    category: "Economic Trends",
    readTime: "11 min read",
    desc: "Understanding housing market cycles, price-to-income ratios, interest rate impact, and bubble indicator models.",
  },
  {
    title: "Domestic Real Estate Index Explained",
    slug: "domestic-real-estate-index-explained",
    category: "Analytics & Data",
    readTime: "6 min read",
    desc: "How S&P CoreLogic Case-Shiller and national domestic real estate indices measure price movement and inflation.",
  },
  {
    title: "Domestic Real Estate Stocks Guide",
    slug: "domestic-real-estate-stocks-guide",
    category: "Public Equities",
    readTime: "8 min read",
    desc: "Complete guide to publicly traded residential, commercial, and industrial real estate investment trusts (REITs).",
  },
  {
    title: "How Domestic Real Estate Values Are Determined",
    slug: "how-domestic-real-estate-values-are-determined",
    category: "Valuation & Comps",
    readTime: "7 min read",
    desc: "The math behind comparative market analysis (CMA), appraisal methodology, net operating income (NOI), and Cap Rates.",
  },
  {
    title: "Real Estate Generates Over Percent of U.S. Gross Domestic Product",
    slug: "real-estate-generates-over-percent-of-us-gross-domestic-product",
    category: "Macroeconomics",
    readTime: "9 min read",
    desc: "Exploring how domestic real estate construction, leasing, and property services drive over 15-18% of total US GDP.",
  },
];

export default async function BlogPage() {
  const { posts, error } = await getBlogPosts();

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Domestic Real Estate Insights & Market Analysis",
    url: `${SITE_URL}/blog`,
    publisher: { "@type": "Organization", name: SITE_NAME },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.published_at ?? undefined,
      author: post.author?.name
        ? { "@type": "Person", name: post.author.name }
        : { "@type": "Organization", name: SITE_NAME },
    })),
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <JsonLd
        data={[
          blogSchema,
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />

      <BlogListingContainer
        initialPosts={posts}
        error={error}
        informationalGuides={informationalGuides}
      />
    </main>
  );
}
