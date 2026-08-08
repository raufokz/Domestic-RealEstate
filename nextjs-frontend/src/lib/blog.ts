import { API_BASE } from "@/lib/api";

/**
 * Shape of a public blog post returned by GET /blogs and GET /blogs/{slug}.
 * Mirrors the `blogs` table + the `category` / `author` relations eager-loaded
 * by BlogController::index() and ::show().
 */
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  /** Admin-authored HTML (the admin editor is a rich-text/WYSIWYG editor). */
  content?: string | null;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  featured_image_caption?: string | null;
  featured_image_credit?: string | null;
  status: "draft" | "review" | "published" | "scheduled" | "archived";
  published_at?: string | null;
  created_at?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  reading_time?: number | null;
  word_count?: number | null;
  tags?: string[] | null;
  secondary_keywords?: string[] | null;
  category?: { id: number; name?: string; slug?: string } | null;
  categories?: { id: number; name?: string; slug?: string }[] | null;
  author?: { id: number; name?: string; email?: string } | null;
  coAuthor?: { id: number; name?: string; email?: string } | null;
  is_featured?: boolean;
  is_trending?: boolean;
  is_popular?: boolean;
  is_editors_choice?: boolean;
  view_count?: number;
  like_count?: number;
  share_count?: number;
  focus_keyword?: string | null;
  canonical_url?: string | null;
  robots_index?: boolean;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  json_ld_override?: string | null;
  faq_schema?: { question: string; answer: string }[] | null;
  breadcrumb_title?: string | null;
  images?: { id: number; url: string; webp_url?: string | null; alt_text?: string | null; caption?: string | null; credit?: string | null }[] | null;
}

/**
 * Result wrapper so callers can tell "no posts published yet" apart from
 * "the API is unreachable" — the two need different UI, and collapsing them
 * into an empty array is exactly the silent-failure pattern we avoid.
 */
export interface BlogListResult {
  posts: BlogPost[];
  error: string | null;
}

/** Fetch published posts on the server. Newest first, per BlogController::index(). */
export async function getBlogPosts(perPage = 12): Promise<BlogListResult> {
  try {
    const res = await fetch(`${API_BASE}/blogs?per_page=${perPage}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return { posts: [], error: `Could not load articles (server responded ${res.status}).` };
    }
    const data = await res.json();
    const rawPosts = (Array.isArray(data) ? data : data?.data ?? []) as unknown[];
    const posts = rawPosts.map((p) => normalizeBlogPost(p)).filter((p): p is BlogPost => p !== null);
    return { posts, error: null };
  } catch (err) {
    console.error("[blog] Failed to load posts list:", err);
    return { posts: [], error: "Could not reach the content service. Please try again shortly." };
  }
}

const FALLBACK_RESEARCH_GUIDES: Record<string, BlogPost> = {
  "where-to-buy-real-estate-in-nyc-guide": {
    id: 2001,
    slug: "where-to-buy-real-estate-in-nyc-guide",
    title: "Where to Buy Real Estate in NYC: Complete Guide to New York City Real Estate Listings & Homes",
    excerpt: "Comprehensive buyer and investor guide detailing where to buy real estate in NYC, analyzing top New York City real estate listings, property in NYC, and houses in NYC across all five boroughs.",
    content: `<h2>Mastering the New York City Real Estate Market</h2>
<p>Navigating <strong>new york city real estate</strong> requires a strategic approach whether you are a first-time homebuyer, relocating professional, or institutional investor. From iconic Manhattan condos to historic brownstones and spacious <strong>houses in nyc</strong>, the market offers unmatched diversity and long-term equity growth.</p>

<h2>Where to Buy Real Estate in NYC: Borough Breakdown</h2>
<p>Deciding <strong>where to buy real estate in nyc</strong> depends heavily on your lifestyle preferences, commute requirements, and target investment yields:</p>
<ul>
  <li><strong>Manhattan:</strong> Ideal for luxury high-rise condos, co-ops, and premier commercial <strong>new york city properties</strong>. Prime locations include Upper West Side, SoHo, and Tribeca.</li>
  <li><strong>Brooklyn:</strong> Known for historic brownstones, modern waterfront developments in Williamsburg, and family-friendly <strong>new york city homes</strong> in Park Slope.</li>
  <li><strong>Queens:</strong> Long Island City and Astoria offer exceptional modern <strong>property in nyc</strong> with rapid transit access to Midtown Manhattan.</li>
  <li><strong>The Bronx & Staten Island:</strong> Emerging neighborhoods providing high rental yields and affordable single-family <strong>real estate in new york city</strong>.</li>
</ul>

<h2>Navigating New York City Real Estate Listings</h2>
<p>Finding verified <strong>new york city real estate listings</strong> is essential in a competitive market. When reviewing <strong>nyc real estate</strong> properties, pay close attention to property tax abatements (such as 421-a or 17-J), monthly HOA/common charges, and co-op board approval requirements.</p>

<h2>Why Invest in Real Estate New York City?</h2>
<p>The market for <strong>real estate new york city</strong> has consistently outperformed broader macroeconomic benchmarks. Strong rental demand, limited inventory supply, and global financial liquidity make premium <strong>new york city properties</strong> an cornerstone asset class for portfolio preservation.</p>`,
    status: "published",
    published_at: "2026-08-04T12:00:00Z",
    created_at: "2026-08-04T12:00:00Z",
    seo_title: "Where to Buy Real Estate in NYC | New York City Listings Guide",
    meta_description: "Expert guide on where to buy real estate in NYC. Explore verified New York City real estate listings, houses in NYC, property in NYC, and market trends.",
    reading_time: 7,
    tags: ["New York City Real Estate", "NYC Real Estate", "Real Estate in New York City", "New York City Listings"],
    category: { id: 1, name: "Buyer Guide", slug: "buyer-guide" },
    author: { id: 1, name: "Domestic RE Editorial Board", email: "editor@domesticrealestate.us" },
    faq_schema: [
      { question: "Where is the best place to buy real estate in NYC?", answer: "Top locations for buying real estate in NYC include Long Island City for modern condos, Williamsburg for high rental demand, and Park Slope for historic family homes." },
      { question: "How do I search active New York City real estate listings?", answer: "Browse active listings on Domestic Real Estate to filter by borough, price, square footage, and amenities across Manhattan, Brooklyn, and Queens." }
    ],
  },
  "domestic-vs-international-real-estate-investment": {
    id: 1001,
    slug: "domestic-vs-international-real-estate-investment",
    title: "Domestic vs International Real Estate Investment",
    excerpt: "Comprehensive breakdown comparing domestic property acquisition vs cross-border foreign real estate investments.",
    content: `<h2>Understanding Domestic vs Cross-Border Real Estate Investing</h2>
<p>Navigating property investments requires a clear understanding of geographic, regulatory, and tax distinctions between domestic transactions and international acquisitions.</p>
<h3>Key Differences in Acquisition & Risk Profile</h3>
<p>Domestic real estate investments benefit from familiar legal frameworks, standardized title insurance, accessible local financing, and zero foreign currency risk. Conversely, international investments present additional layers of complexity including foreign exchange volatility, sovereign political risk, and complex cross-border tax treaties.</p>
<blockquote>Domestic real estate offers predictable cash flows, local market transparency, and streamlined leverage options through domestic mortgage lenders.</blockquote>
<h3>Financing & Capital Deployment</h3>
<p>Domestic investors can leverage conventional mortgages, FHA/VA programs, portfolio loans, and 1031 tax-deferred exchanges. Foreign properties rarely qualify for domestic tax-deferred exchanges and usually demand higher equity down payments from local international lenders.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Domestic vs International Real Estate Investment Guide",
    meta_description: "Detailed comparison between domestic property investments and international cross-border real estate acquisitions.",
    reading_time: 8,
    tags: ["Real Estate", "Investment", "Domestic", "International"],
    category: { id: 1, name: "Investment Analysis", slug: "investment-analysis" },
    author: { id: 1, name: "Domestic RE Editorial Board", email: "info@domesticrealestate.us" },
  },
  "real-estate-investment-process-domestic-vs-foreign": {
    id: 1002,
    slug: "real-estate-investment-process-domestic-vs-foreign",
    title: "Real Estate Investment Process Domestic vs Foreign",
    excerpt: "Step-by-step walkthrough of legal compliance, title escrow, financing, and tax structures for domestic vs foreign buyers.",
    content: `<h2>The Step-by-Step Acquisition Process</h2>
<p>The transaction lifecycle for purchasing domestic property differs significantly from overseas real estate acquisitions. Understanding every milestone ensures a smooth closing.</p>
<h3>1. Pre-Approval & Financial Verification</h3>
<p>Domestic transactions begin with standard pre-approval letters from accredited domestic mortgage institutions. Foreign buyers must undergo FIRPTA verification, international wire checks, and strict anti-money laundering (AML) compliance documentation.</p>
<h3>2. Title Search & Escrow Closing</h3>
<p>Domestic purchases use established title insurance companies and bonded escrow officers to guarantee clear title ownership before closing.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Domestic vs Foreign Real Estate Investment Process",
    meta_description: "Step-by-step analysis of domestic vs foreign real estate buying processes, legal compliance, and escrow.",
    reading_time: 7,
    tags: ["Process", "Escrow", "Title", "Investor Guide"],
    category: { id: 2, name: "Investor Guide", slug: "investor-guide" },
    author: { id: 1, name: "Domestic RE Legal Team", email: "info@domesticrealestate.us" },
  },
  "differences-in-real-estate-investment-process-domestic-vs-international": {
    id: 1003,
    slug: "differences-in-real-estate-investment-process-domestic-vs-international",
    title: "Differences in Real Estate Investment Process Domestic vs International",
    excerpt: "Key regulatory, currency risk, and tax withholding differences between domestic transactions and overseas properties.",
    content: `<h2>Core Distinctions in Process & Execution</h2>
<p>Executing an international real estate trade requires navigating differing legal jurisdictions, currency conversion fees, and specialized tax withholdings like FIRPTA.</p>
<h3>Regulatory & Compliance Friction</h3>
<p>Domestic deals operate under standard state and federal real estate regulations. International deals frequently require specialized cross-border legal counsel, apostilled documents, and foreign entity structuring.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Differences in Real Estate Investment Process Domestic vs International",
    meta_description: "Exploring tax withholdings, currency risk, and regulatory friction in domestic vs international real estate.",
    reading_time: 9,
    tags: ["Legal", "Tax", "Regulation", "Domestic RE"],
    category: { id: 3, name: "Legal & Tax", slug: "legal-tax" },
    author: { id: 1, name: "Domestic RE Advisory", email: "info@domesticrealestate.us" },
  },
  "similarities-between-domestic-and-international-real-estate-investment-processes": {
    id: 1004,
    slug: "similarities-between-domestic-and-international-real-estate-investment-processes",
    title: "Similarities Between Domestic and International Real Estate Investment Processes",
    excerpt: "Common valuation frameworks, due diligence procedures, and cap rate calculations shared across global markets.",
    content: `<h2>Universal Fundamentals of Real Estate Investing</h2>
<p>Despite regulatory and geographic variances, fundamental financial modeling principles remain consistent across all real estate acquisitions globally.</p>
<h3>Valuation & Cash Flow Metrics</h3>
<p>Whether analyzing a commercial asset in Boston or a residential complex abroad, investors evaluate Net Operating Income (NOI), Capitalization Rates (Cap Rate), Debt Service Coverage Ratios (DSCR), and Internal Rate of Return (IRR).</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Similarities Between Domestic and International Real Estate Processes",
    meta_description: "Universal valuation metrics, due diligence, and NOI calculations shared across real estate markets.",
    reading_time: 6,
    tags: ["Valuation", "Cap Rates", "NOI", "Fundamentals"],
    category: { id: 4, name: "Market Fundamentals", slug: "market-fundamentals" },
    author: { id: 1, name: "Domestic RE Analytics Board", email: "info@domesticrealestate.us" },
  },
  "biggest-domestic-real-estate-investment-companies-in-the-us": {
    id: 1005,
    slug: "biggest-domestic-real-estate-investment-companies-in-the-us",
    title: "Biggest Domestic Real Estate Investment Companies in the US",
    excerpt: "Profile of top US domestic real estate funds, institutional REITs, and equity firms managing mega portfolios.",
    content: `<h2>Top US Domestic Real Estate Asset Managers</h2>
<p>Institutional investment firms manage hundreds of billions in domestic commercial, residential, and industrial assets across the United States.</p>
<h3>Leading Institutional Asset Managers</h3>
<p>Major entities such as Blackstone, Starwood Capital, Brookfield Asset Management, and Prologis control extensive portfolios driving national real estate trends.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Biggest Domestic Real Estate Investment Companies in the US",
    meta_description: "Analysis of top US real estate investment companies, institutional REITs, and private equity funds.",
    reading_time: 10,
    tags: ["REITs", "Institutional", "Asset Managers", "US Market"],
    category: { id: 5, name: "Industry Leaders", slug: "industry-leaders" },
    author: { id: 1, name: "Domestic RE Research Team", email: "info@domesticrealestate.us" },
  },
  "biggest-us-domestic-real-estate-investor": {
    id: 1006,
    slug: "biggest-us-domestic-real-estate-investor",
    title: "Biggest US Domestic Real Estate Investor",
    excerpt: "In-depth analysis of the largest single domestic real estate investor entities and asset allocation strategies.",
    content: `<h2>Analyzing the Largest US Real Estate Investors</h2>
<p>Institutional equity funds and sovereign-backed domestic trusts hold unparalleled influence over housing supply, single-family rental (SFR) clusters, and commercial developments.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Biggest US Domestic Real Estate Investor Analysis",
    meta_description: "Examining asset allocations and market presence of the largest US domestic real estate investors.",
    reading_time: 7,
    tags: ["Investors", "Capital Allocation", "Institutional Funds"],
    category: { id: 6, name: "Institutional Capital", slug: "institutional-capital" },
    author: { id: 1, name: "Domestic RE Research Team", email: "info@domesticrealestate.us" },
  },
  "largest-domestic-real-estate-companies-in-boston-area": {
    id: 1007,
    slug: "largest-domestic-real-estate-companies-in-boston-area",
    title: "Largest Domestic Real Estate Companies in Boston Area",
    excerpt: "Spotlight on leading real estate brokerages, development firms, and private equity groups operating in Greater Boston.",
    content: `<h2>Greater Boston Real Estate Market Dynamics</h2>
<p>The Greater Boston real estate ecosystem is driven by life sciences development, academic institution expansion, and premium residential acquisitions.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Largest Domestic Real Estate Companies in Boston Area",
    meta_description: "Overview of leading Boston brokerages, developers, and real estate private equity firms.",
    reading_time: 8,
    tags: ["Boston", "Regional Market", "Development", "Brokerages"],
    category: { id: 7, name: "Regional Markets", slug: "regional-markets" },
    author: { id: 1, name: "Domestic RE Regional Board", email: "info@domesticrealestate.us" },
  },
  "domestic-real-estate-bubble-explained": {
    id: 1008,
    slug: "domestic-real-estate-bubble-explained",
    title: "Domestic Real Estate Bubble Explained",
    excerpt: "Understanding housing market cycles, price-to-income ratios, interest rate impact, and bubble indicator models.",
    content: `<h2>Evaluating Housing Market Bubble Risk Indicators</h2>
<p>Real estate bubbles occur when property prices rise rapidly beyond macroeconomic fundamentals like income growth, GDP, and rental yield support.</p>
<h3>Key Bubble Metrics</h3>
<p>Analysts monitor price-to-rent ratios, mortgage rate affordability indices, supply elasticity, and speculative buying spikes.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Domestic Real Estate Bubble Explained — Risk & Indicators",
    meta_description: "In-depth guide to housing market cycles, bubble indicators, price-to-income ratios, and interest rate impacts.",
    reading_time: 11,
    tags: ["Housing Market", "Bubble Index", "Economic Analysis"],
    category: { id: 8, name: "Economic Trends", slug: "economic-trends" },
    author: { id: 1, name: "Domestic RE Macroeconomic Desk", email: "info@domesticrealestate.us" },
  },
  "domestic-real-estate-index-explained": {
    id: 1009,
    slug: "domestic-real-estate-index-explained",
    title: "Domestic Real Estate Index Explained",
    excerpt: "How S&P CoreLogic Case-Shiller and national domestic real estate indices measure price movement and inflation.",
    content: `<h2>Demystifying National Real Estate Price Indices</h2>
<p>Real estate indices track home price appreciation across national, regional, and metropolitan statistical areas (MSAs).</p>
<h3>Case-Shiller & FHFA Index Methodology</h3>
<p>The S&P CoreLogic Case-Shiller Index uses a repeat-sales pricing technique to capture true home value appreciation over time.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Domestic Real Estate Index Explained — Case-Shiller & FHFA",
    meta_description: "How real estate indices track housing inflation, repeat sales, and regional market trends.",
    reading_time: 6,
    tags: ["Indices", "Case-Shiller", "Data", "Price Appreciation"],
    category: { id: 9, name: "Analytics & Data", slug: "analytics-data" },
    author: { id: 1, name: "Domestic RE Data Science Team", email: "info@domesticrealestate.us" },
  },
  "domestic-real-estate-stocks-guide": {
    id: 1010,
    slug: "domestic-real-estate-stocks-guide",
    title: "Domestic Real Estate Stocks Guide",
    excerpt: "Complete guide to publicly traded residential, commercial, and industrial real estate investment trusts (REITs).",
    content: `<h2>Investing in Public Real Estate Equities</h2>
<p>Publicly traded REITs and homebuilder stocks offer liquidity, dividend yield, and real estate exposure without direct property management responsibilities.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Domestic Real Estate Stocks & REITs Investor Guide",
    meta_description: "Guide to publicly traded REITs, residential developers, and industrial real estate stocks.",
    reading_time: 8,
    tags: ["Stocks", "REITs", "Equities", "Dividends"],
    category: { id: 10, name: "Public Equities", slug: "public-equities" },
    author: { id: 1, name: "Domestic RE Financial Markets Team", email: "info@domesticrealestate.us" },
  },
  "how-domestic-real-estate-values-are-determined": {
    id: 1011,
    slug: "how-domestic-real-estate-values-are-determined",
    title: "How Domestic Real Estate Values Are Determined",
    excerpt: "The math behind comparative market analysis (CMA), appraisal methodology, net operating income (NOI), and Cap Rates.",
    content: `<h2>Property Valuation Methodologies</h2>
<p>Determining real estate value relies on three primary valuation approaches: the Sales Comparison Approach, the Income Capitalization Approach, and the Cost Approach.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "How Domestic Real Estate Values Are Determined",
    meta_description: "The mathematical valuation formulas for property appraisals, comparative market analysis (CMA), and Cap Rates.",
    reading_time: 7,
    tags: ["Valuation", "Appraisal", "CMA", "Cap Rates"],
    category: { id: 11, name: "Valuation & Comps", slug: "valuation-comps" },
    author: { id: 1, name: "Domestic RE Valuation Services", email: "info@domesticrealestate.us" },
  },
  "real-estate-generates-over-percent-of-us-gross-domestic-product": {
    id: 1012,
    slug: "real-estate-generates-over-percent-of-us-gross-domestic-product",
    title: "Real Estate Generates Over Percent of U.S. Gross Domestic Product",
    excerpt: "Exploring how domestic real estate construction, leasing, and property services drive over 15-18% of total US GDP.",
    content: `<h2>The Macroeconomic Engine of US Real Estate</h2>
<p>Domestic real estate construction, rental leasing, property management, and related financial services account for over 15% to 18% of the total Gross Domestic Product (GDP) of the United States.</p>`,
    status: "published",
    published_at: "2026-08-01T12:00:00Z",
    created_at: "2026-08-01T12:00:00Z",
    seo_title: "Real Estate Generates Over Percent of U.S. Gross Domestic Product",
    meta_description: "Analysis of real estate's 15-18% contribution to US Gross Domestic Product (GDP) and employment.",
    reading_time: 9,
    tags: ["GDP", "Macroeconomics", "US Economy", "Housing Market"],
    category: { id: 12, name: "Macroeconomics", slug: "macroeconomics" },
    author: { id: 1, name: "Domestic RE Economic Research", email: "info@domesticrealestate.us" },
  },
};

/** Fetch one published post by slug. Returns null when missing (→ 404). */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      return normalizeBlogPost(data, slug);
    }
  } catch (err) {
    console.error(`[blog] Failed to load post "${slug}":`, err);
  }

  // Fallback to static research guide if slug matches one of our 12 educational guides
  const fallback = FALLBACK_RESEARCH_GUIDES[slug];
  return fallback ? (normalizeBlogPost(fallback, slug) ?? fallback) : null;
}

function normalizeBlogPost(raw: unknown, fallbackSlug: string = ""): BlogPost | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  const title = typeof data.title === "string" ? data.title : "";
  if (!title) return null;

  const rawTags = data.tags;
  const tags: string[] = Array.isArray(rawTags)
    ? rawTags.filter((t): t is string => typeof t === "string")
    : typeof rawTags === "string"
      ? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  const rawContent = data.content;
  const content = typeof rawContent === "string" ? rawContent : "";

  const rawStatus = data.status;
  const status: BlogPost["status"] =
    typeof rawStatus === "string" &&
    ["draft", "review", "published", "scheduled", "archived"].includes(rawStatus)
      ? (rawStatus as BlogPost["status"])
      : "draft";

  const rawPublishedAt = data.published_at;
  const published_at: string | null =
    typeof rawPublishedAt === "string"
      ? rawPublishedAt
      : rawPublishedAt && typeof rawPublishedAt === "object" && "date" in rawPublishedAt
        ? typeof (rawPublishedAt as Record<string, unknown>).date === "string"
          ? ((rawPublishedAt as Record<string, unknown>).date as string)
          : null
        : null;

  const rawSecondaryKeywords = data.secondary_keywords;
  const secondary_keywords: string[] | null = Array.isArray(rawSecondaryKeywords)
    ? rawSecondaryKeywords.filter((k): k is string => typeof k === "string")
    : typeof rawSecondaryKeywords === "string"
      ? rawSecondaryKeywords.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

  const rawFaqSchema = data.faq_schema;
  const faq_schema: { question: string; answer: string }[] | null = Array.isArray(rawFaqSchema)
    ? rawFaqSchema.filter((item): item is { question: string; answer: string } =>
        item && typeof item === "object" && "question" in item && "answer" in item
      )
    : null;

  return {
    id: typeof data.id === "number" ? data.id : 0,
    slug: typeof data.slug === "string" ? data.slug : fallbackSlug,
    title,
    excerpt: typeof data.excerpt === "string" ? data.excerpt : null,
    content,
    featured_image: typeof data.featured_image === "string" ? data.featured_image : null,
    featured_image_alt: typeof data.featured_image_alt === "string" ? data.featured_image_alt : null,
    featured_image_caption: typeof data.featured_image_caption === "string" ? data.featured_image_caption : null,
    featured_image_credit: typeof data.featured_image_credit === "string" ? data.featured_image_credit : null,
    status,
    published_at,
    created_at: typeof data.created_at === "string" ? data.created_at : null,
    seo_title: typeof data.seo_title === "string" ? data.seo_title : null,
    meta_description: typeof data.meta_description === "string" ? data.meta_description : null,
    reading_time: typeof data.reading_time === "number" ? data.reading_time : null,
    word_count: typeof data.word_count === "number" ? data.word_count : null,
    tags,
    is_featured: typeof data.is_featured === "boolean" ? data.is_featured : false,
    is_trending: typeof data.is_trending === "boolean" ? data.is_trending : false,
    is_popular: typeof data.is_popular === "boolean" ? data.is_popular : false,
    is_editors_choice: typeof data.is_editors_choice === "boolean" ? data.is_editors_choice : false,
    view_count: typeof data.view_count === "number" ? data.view_count : 0,
    like_count: typeof data.like_count === "number" ? data.like_count : 0,
    share_count: typeof data.share_count === "number" ? data.share_count : 0,
    focus_keyword: typeof data.focus_keyword === "string" ? data.focus_keyword : null,
    secondary_keywords,
    canonical_url: typeof data.canonical_url === "string" ? data.canonical_url : null,
    robots_index: typeof data.robots_index === "boolean" ? data.robots_index : true,
    og_title: typeof data.og_title === "string" ? data.og_title : null,
    og_description: typeof data.og_description === "string" ? data.og_description : null,
    og_image: typeof data.og_image === "string" ? data.og_image : null,
    twitter_title: typeof data.twitter_title === "string" ? data.twitter_title : null,
    twitter_description: typeof data.twitter_description === "string" ? data.twitter_description : null,
    twitter_image: typeof data.twitter_image === "string" ? data.twitter_image : null,
    json_ld_override: typeof data.json_ld_override === "string" ? data.json_ld_override : null,
    faq_schema,
    breadcrumb_title: typeof data.breadcrumb_title === "string" ? data.breadcrumb_title : null,
    category: data.category && typeof data.category === "object" ? (data.category as BlogPost["category"]) : null,
    categories: Array.isArray(data.categories) ? (data.categories as BlogPost["categories"]) : [],
    author: data.author && typeof data.author === "object" ? (data.author as BlogPost["author"]) : null,
    coAuthor: data.coAuthor && typeof data.coAuthor === "object" ? (data.coAuthor as BlogPost["coAuthor"]) : null,
    images: Array.isArray(data.images) ? (data.images as BlogPost["images"]) : [],
  };
}

/**
 * Posts related to `post`, preferring the same category and falling back to
 * most-recent. The public index endpoint takes no category filter, so we
 * filter the recent list here rather than inventing a query param.
 */
export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const { posts } = await getBlogPosts(24);
  const others = posts.filter((p) => p.id !== post.id);
  const sameCategory = post.category?.id
    ? others.filter((p) => p.category?.id === post.category?.id)
    : [];
  const merged = [...sameCategory, ...others.filter((p) => !sameCategory.includes(p))];
  return merged.slice(0, limit);
}

/** "July 20, 2026" — falls back to the empty string when no date is set. */
export function formatBlogDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** "6 min read", or the empty string when the backend didn't compute one. */
export function formatReadingTime(minutes?: number | null): string {
  return minutes && minutes > 0 ? `${minutes} min read` : "";
}

/** Initials for the author avatar, e.g. "Sarah Kim" -> "SK". */
export function authorInitials(name?: string | null): string {
  if (!name) return "DR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Fire-and-forget view counter increment — called client-side so it only fires for real readers, not SSR/crawler fetches. */
export function incrementBlogView(slug: string): void {
  fetch(`${API_BASE}/blogs/${encodeURIComponent(slug)}/view`, { method: "POST", keepalive: true }).catch(() => {});
}

/** Short teaser: the stored excerpt, or the first 180 chars of the body text. */
export function postExcerpt(post: BlogPost): string {
  if (post.excerpt) return post.excerpt;
  const text = typeof post.content === "string" ? post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
  return text.length > 180 ? `${text.slice(0, 180)}…` : text;
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugifyHeading(text: string, seen: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

/**
 * Walks the admin-authored HTML body, stamps every h2/h3 with a stable id
 * (skipping ones that already have one), and returns both the patched HTML
 * and the resulting outline so the table of contents links actually land
 * on the right heading instead of just the top of the article.
 */
export function extractToc(html: string | null | undefined): { html: string; toc: TocItem[] } {
  if (!html) return { html: "", toc: [] };
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  const patched = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level, attrs, inner) => {
      const text = inner.replace(/<[^>]*>/g, "").trim();
      if (!text) return match.replace(/\$/g, "$$$$");
      const existingId = /\bid=["']([^"']+)["']/.exec(attrs)?.[1];
      const id = existingId || slugifyHeading(text, seen);
      toc.push({ id, text, level: Number(level) as 2 | 3 });
      const newAttrs = existingId ? attrs : ` id="${id}"${attrs}`;
      return `<h${level}${newAttrs}>${inner}</h${level}>`.replace(/\$/g, "$$$$");
    }
  );
  return { html: patched, toc };
}

/**
 * The post immediately before/after `post` in the published feed (newest
 * first), for "Previous / Next" article navigation.
 */
export async function getAdjacentPosts(
  post: BlogPost
): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  const { posts } = await getBlogPosts(100);
  const index = posts.findIndex((p) => p.id === post.id);
  if (index === -1) return { prev: null, next: null };
  return {
    // Feed is newest-first: the "next" (older) post is at index+1,
    // the "previous" (newer) post is at index-1.
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}
