import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  getBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
  extractToc,
  formatBlogDate,
  formatReadingTime,
  authorInitials,
  postExcerpt,
} from "@/lib/blog";
import BlogShareButtons from "@/components/blog/BlogShareButtons";
import BlogLeadForm from "@/components/blog/BlogLeadForm";
import HtmlBlogViewer from "@/components/blog/HtmlBlogViewer";
import NewsletterForm from "@/components/NewsletterForm";
import ViewTracker from "@/components/blog/ViewTracker";

function normalizeTags(rawTags: string[] | string | null | undefined): string[] {
  if (Array.isArray(rawTags)) return rawTags;
  if (typeof rawTags === "string") return rawTags.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
}

function plainTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n\s*\n/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export async function generateStaticParams() {
  const defaultSlugs = [
    { slug: "where-to-buy-real-estate-in-nyc-guide" },
    { slug: "domestic-vs-international-real-estate-investment" },
    { slug: "real-estate-investment-process-domestic-vs-foreign" },
    { slug: "differences-in-real-estate-investment-process-domestic-vs-international" },
    { slug: "similarities-between-domestic-and-international-real-estate-investment-processes" },
    { slug: "biggest-domestic-real-estate-investment-companies-in-the-us" },
    { slug: "biggest-us-domestic-real-estate-investor" },
    { slug: "largest-domestic-real-estate-companies-in-boston-area" },
    { slug: "domestic-real-estate-bubble-explained" },
    { slug: "domestic-real-estate-index-explained" },
    { slug: "domestic-real-estate-stocks-guide" },
    { slug: "how-domestic-real-estate-values-are-determined" },
    { slug: "real-estate-generates-over-percent-of-us-gross-domestic-product" },
    { slug: "ai-revolutionizing-real-estate" },
    { slug: "new-york-city-real-estate-guide-2026" },
    { slug: "first-time-buyer-checklist" },
    { slug: "2026-market-forecast" },
    { slug: "best-cities-to-buy-rental-property-in-2026" },
  ];

  try {
    const { posts } = await getBlogPosts(100);
    if (!posts || !Array.isArray(posts)) return defaultSlugs;
    const apiSlugs = posts.map((p) => ({ slug: p.slug }));
    const merged = [...defaultSlugs, ...apiSlugs.filter((s) => !defaultSlugs.some((g) => g.slug === s.slug))];
    return merged;
  } catch {
    return defaultSlugs;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: "Article Not Found",
      description: "The requested research publication could not be found.",
      path: `/blog/${slug}`,
      noindex: true,
    });
  }

  return buildMetadata({
    title: post.seo_title || post.title,
    description: post.meta_description || postExcerpt(post),
    path: `/blog/${post.slug}`,
    ogType: "article",
    image: post.og_image || post.featured_image || undefined,
    keywords: Array.isArray(post.tags) ? post.tags : undefined,
    publishedTime: post.published_at ?? undefined,
    noindex: post.robots_index === false,
    canonicalOverride: post.canonical_url || undefined,
    ogTitle: post.og_title || undefined,
    ogDescription: post.og_description || undefined,
    twitterTitle: post.twitter_title || undefined,
    twitterDescription: post.twitter_description || undefined,
    twitterImage: post.twitter_image || undefined,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  // Unknown or unpublished slug renders the real 404 page
  if (!post) notFound();

  let related: typeof post[] = [];
  let prev: typeof post | null = null;
  let next: typeof post | null = null;

  try {
    related = await getRelatedPosts(post);
    const adjacent = await getAdjacentPosts(post);
    prev = adjacent.prev;
    next = adjacent.next;
  } catch {
    // Graceful fallback if related/adjacent queries fail
  }

  const safeContent = typeof post.content === "string" ? post.content : "";
  const hasHtml = /<[a-z][\s\S]*>/i.test(safeContent);
  const rawHtml = hasHtml ? safeContent : plainTextToHtml(safeContent);
  const { html: contentHtml, toc } = extractToc(rawHtml);
  const date = formatBlogDate(post.published_at ?? post.created_at);
  const readTime = formatReadingTime(post.reading_time);
  const authorName = post.author?.name ?? "Domestic RE Editorial Board";
  const tags: string[] = normalizeTags(post.tags);
  const shareUrl = `${SITE_URL}/blog/${post.slug}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || postExcerpt(post),
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    ...(post.featured_image ? { image: post.featured_image } : {}),
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    author: post.author?.name
      ? { "@type": "Person", name: post.author.name }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    ...(post.category?.name ? { articleSection: post.category.name } : {}),
    ...(tags.length ? { keywords: tags.join(", ") } : {}),
  };

  const validFaqItems = Array.isArray(post.faq_schema)
    ? post.faq_schema.filter(
        (item): item is { question: string; answer: string } =>
          !!item && typeof item === "object" && typeof item.question === "string" && typeof item.answer === "string" && item.question.trim().length > 0
      )
    : [];

  const faqLd =
    validFaqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: validFaqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  // Admin-authored raw JSON-LD, additive alongside the auto-generated schema above
  // (not a replacement — a malformed override should never take down the good schema).
  let overrideLd: Record<string, unknown> | null = null;
  if (post.json_ld_override) {
    try {
      const parsed = JSON.parse(post.json_ld_override);
      if (parsed && typeof parsed === "object") {
        overrideLd = parsed as Record<string, unknown>;
      }
    } catch {
      overrideLd = null;
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-900 font-body">
      <ViewTracker slug={post.slug} />
      <JsonLd
        data={[
          articleLd,
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.breadcrumb_title || post.title, path: `/blog/${post.slug}` },
          ]),
          ...(faqLd ? [faqLd] : []),
          ...(overrideLd ? [overrideLd] : []),
        ]}
      />

      {/* Header / Hero Section */}
      <header className="border-b border-[#EBE6DD] bg-[#FDFBF7] py-10 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-8 flex-wrap">
            <Link href="/" className="hover:text-[#0A2647] transition-colors">
              Home
            </Link>
            <span aria-hidden="true" className="text-stone-300">/</span>
            <Link href="/blog" className="hover:text-[#0A2647] transition-colors">
              Blog
            </Link>
            <span aria-hidden="true" className="text-stone-300">/</span>
            <span className="text-[#8C6D27] line-clamp-1">{post.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            {post.category?.name && (
              <span className="text-[11px] font-extrabold bg-[#F5F0E6] text-[#8C6D27] border border-[#E3DAC9] px-3.5 py-1 rounded-full uppercase tracking-wider">
                {post.category.name}
              </span>
            )}
            {readTime && (
              <span className="text-xs text-stone-400 font-medium">
                {readTime}
              </span>
            )}
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A2647] leading-tight mb-6 tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="font-serif italic text-stone-600 text-lg sm:text-xl leading-relaxed mb-8 border-l-2 border-[#C9A227] pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Author Metadata & Share Bar */}
          <div className="pt-6 border-t border-[#EBE6DD] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#0A2647] text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-[#C9A227]/30">
                {authorInitials(authorName)}
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[#0A2647]">{authorName}</p>
                <p className="text-xs text-stone-500">
                  {[date, "Verified Research"].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            <BlogShareButtons url={shareUrl} title={post.title} />
          </div>
        </div>
      </header>

      {/* Main Content & Sidebar Grid */}
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cover Image Feature (if available) */}
        {post.featured_image && (
          <div className="h-64 sm:h-96 md:h-[450px] rounded-3xl relative overflow-hidden mb-12 border border-[#EBE6DD] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featured_image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Article Content Column */}
          <article className="lg:col-span-8 bg-white border border-[#EBE6DD] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
            {/* Mobile / Inline Table of Contents */}
            {toc.length > 1 && (
              <nav
                aria-label="Table of contents"
                className="lg:hidden bg-[#FDFBF7] border border-[#EBE6DD] rounded-2xl p-6 mb-10 font-body"
              >
                <p className="font-heading text-xs font-extrabold uppercase tracking-wider text-[#8C6D27] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
                  In This Article
                </p>
                <ol className="space-y-2">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-xs text-stone-700 hover:text-[#8C6D27] transition-colors font-medium"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Post HTML Body */}
            {contentHtml ? (
              <HtmlBlogViewer content={contentHtml} enableLightbox className="mb-12" />
            ) : (
              <p className="font-body text-stone-500 italic mb-10">
                This research publication has no main body text.
              </p>
            )}

            {/* Tags Pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-[#EBE6DD] mb-10">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#F5F0E6] border border-[#E3DAC9] text-[#8C6D27] text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Bio Box */}
            <div className="bg-[#FDFBF7] border border-[#EBE6DD] rounded-2xl p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 bg-[#0A2647] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 border-[#C9A227]">
                {authorInitials(authorName)}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C6D27]">
                  Author Spotlight
                </span>
                <h3 className="font-heading text-lg font-bold text-[#0A2647]">
                  {authorName}
                </h3>
                <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                  Senior Real Estate Market Analyst specializing in US domestic housing indices, commercial capitalization rates, and investment framework compliance.
                </p>
              </div>
            </div>

            {/* Bottom Action & Back Link */}
            <div className="border-t border-[#EBE6DD] pt-8 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0A2647] hover:text-[#8C6D27] transition-colors"
              >
                <span>←</span> Back to all articles
              </Link>

              <div className="flex items-center gap-4">
                <BlogShareButtons url={shareUrl} title={post.title} />
                <Link
                  href="/contact"
                  className="px-5 py-2.5 bg-[#0A2647] text-white rounded-xl text-xs font-semibold hover:bg-[#081F3A] transition-colors shadow-sm"
                >
                  Talk to an Advisor
                </Link>
              </div>
            </div>

            {/* Previous / Next Post Navigation */}
            {(prev || next) && (
              <nav
                aria-label="Article navigation"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-[#EBE6DD]"
              >
                {prev ? (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="group flex flex-col p-5 rounded-2xl border border-[#EBE6DD] bg-[#FDFBF7] hover:border-[#C9A227] transition-all"
                  >
                    <span className="text-[10px] font-extrabold text-[#8C6D27] uppercase tracking-wider mb-1">
                      ← Previous Article
                    </span>
                    <span className="font-heading font-bold text-sm text-[#0A2647] group-hover:text-[#8C6D27] transition-colors line-clamp-2">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group flex flex-col p-5 rounded-2xl border border-[#EBE6DD] bg-[#FDFBF7] hover:border-[#C9A227] transition-all sm:text-right sm:items-end"
                  >
                    <span className="text-[10px] font-extrabold text-[#8C6D27] uppercase tracking-wider mb-1">
                      Next Article →
                    </span>
                    <span className="font-heading font-bold text-sm text-[#0A2647] group-hover:text-[#8C6D27] transition-colors line-clamp-2">
                      {next.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </article>

          {/* Sticky Desktop Sidebar Column */}
          <aside className="lg:col-span-4 space-y-8 sticky top-24">
            {/* Desktop Table of Contents Sidebar */}
            {toc.length > 1 && (
              <nav
                aria-label="Table of contents"
                className="hidden lg:block bg-white border border-[#EBE6DD] rounded-3xl p-6 shadow-sm font-body"
              >
                <p className="font-heading text-xs font-extrabold uppercase tracking-wider text-[#8C6D27] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
                  In This Article
                </p>
                <ol className="space-y-2.5 border-l border-[#EBE6DD] pl-4">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "ml-3" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-xs text-stone-600 hover:text-[#0A2647] hover:font-bold transition-colors line-clamp-1 block"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Embedded Lead Capture Form */}
            <BlogLeadForm source={`blog:${post.slug}`} />

            {/* Newsletter Side Box */}
            <div className="bg-white border border-[#EBE6DD] rounded-3xl p-6 shadow-sm">
              <NewsletterForm source={`blog-side:${post.slug}`} />
            </div>
          </aside>
        </div>
      </section>

      {/* Related Articles Section */}
      {related.length > 0 && (
        <section className="py-16 bg-[#F5F0E6]/60 border-t border-[#EBE6DD]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8C6D27]">
                Further Reading
              </span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-8">
              Related Research Articles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group bg-white rounded-2xl p-6 border border-[#EBE6DD] shadow-sm hover:shadow-md hover:border-[#C9A227]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {r.category?.name && (
                      <span className="text-[10px] font-extrabold bg-[#F5F0E6] text-[#8C6D27] border border-[#E3DAC9] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-3">
                        {r.category.name}
                      </span>
                    )}
                    <h3 className="font-heading font-bold text-base text-[#0A2647] group-hover:text-[#8C6D27] transition-colors leading-snug mb-2">
                      {r.title}
                    </h3>
                  </div>
                  <div className="pt-4 border-t border-[#F5F0E6] flex items-center justify-between text-xs text-stone-400">
                    <span>{formatBlogDate(r.published_at ?? r.created_at)}</span>
                    <span className="text-[#8C6D27] font-semibold group-hover:translate-x-1 transition-transform">
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
