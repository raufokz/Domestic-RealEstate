import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  getBlogPosts,
  formatBlogDate,
  formatReadingTime,
  postExcerpt,
} from "@/lib/blog";

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

const informationalGuides = [
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
    <main className="min-h-screen bg-slate-50 text-[#0A2647]">
      <JsonLd
        data={[
          blogSchema,
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2.5 h-2.5 bg-[#C9A227] rounded-full animate-pulse" />
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Domestic RE Publication
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Domestic Real Estate <span className="text-[#C9A227]">Insights &amp; Guides</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Market forecasts, investment process comparisons, GDP research, and domestic real estate valuations written by industry experts.
          </p>
        </div>
      </section>

      {/* Featured Informational Guides Index */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#C9A227] text-xs font-extrabold uppercase tracking-widest block mb-2">
            Educational Series
          </span>
          <h2 className="font-heading text-3xl font-bold text-[#0A2647]">
            Domestic Real Estate Knowledge &amp; Research Guides
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            In-depth informational research covering domestic investment processes, indices, market bubbles, and economic impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {informationalGuides.map((guide, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {guide.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{guide.readTime}</span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#0A2647] mb-2 leading-snug">
                  {guide.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-body">
                  {guide.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Research Guide</span>
                <span className="text-[#C9A227] font-bold">Read Guide →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Blog Cards Grid */}
      <section className="py-12 bg-white border-t border-slate-200 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body rounded-3xl mb-20">
        <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-8 text-center">
          Latest Published Industry News
        </h2>
        {/* Error — the content service could not be reached. Never shown as "no posts". */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <p className="text-red-600/80 text-sm mt-2">
              Our articles are temporarily unavailable. In the meantime you can{" "}
              <Link href="/properties" className="underline font-semibold hover:text-red-800">
                browse properties
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="underline font-semibold hover:text-red-800">
                contact our team
              </Link>
              .
            </p>
          </div>
        )}

        {/* Empty — the service responded, there is simply nothing published yet. */}
        {!error && posts.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">
              📝
            </div>
            <h3 className="font-heading text-lg font-bold text-[#0A2647] mb-2">
              Editorial News Updates Coming Soon
            </h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Our editorial team publishes weekly market updates. Explore our research guides above for detailed real estate insights.
            </p>
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => {
              const date = formatBlogDate(post.published_at ?? post.created_at);
              const readTime = formatReadingTime(post.reading_time);

              return (
                <article key={post.id} className="h-full">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block h-full bg-white border border-slate-200 rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4 gap-3">
                        {post.category?.name && (
                          <span className="text-xs font-extrabold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-3 py-1 rounded-full uppercase tracking-wider">
                            {post.category.name}
                          </span>
                        )}
                        {readTime && (
                          <span className="text-xs text-slate-400 shrink-0">{readTime}</span>
                        )}
                      </div>

                      <h2 className="font-heading font-bold text-xl text-[#0A2647] mb-3 group-hover:text-[#C9A227] transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {postExcerpt(post)}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-3">
                      <span className="truncate">
                        By{" "}
                        <strong className="text-[#0A2647]">
                          {post.author?.name ?? SITE_NAME}
                        </strong>
                      </span>
                      <span className="shrink-0">{date}</span>
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C9A227]">
                      Read article
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
