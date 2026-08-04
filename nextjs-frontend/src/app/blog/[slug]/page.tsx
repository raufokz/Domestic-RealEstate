import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
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
import NewsletterForm from "@/components/NewsletterForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  // Resolve the 404 here, before the response starts streaming. Returning
  // noindex metadata instead would let the page render with HTTP 200 — a
  // soft-404 that search engines will happily index.
  if (!post) notFound();

  return buildMetadata({
    title: post.seo_title || post.title,
    description: post.meta_description || postExcerpt(post),
    path: `/blog/${post.slug}`,
    ogType: "article",
    image: post.featured_image || undefined,
    keywords: post.tags ?? undefined,
    publishedTime: post.published_at ?? undefined,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  // Unknown or unpublished slug renders the real 404 instead of fabricating a post.
  if (!post) notFound();

  const related = await getRelatedPosts(post);
  const { prev, next } = await getAdjacentPosts(post);
  const { html: contentHtml, toc } = extractToc(post.content);
  const date = formatBlogDate(post.published_at ?? post.created_at);
  const readTime = formatReadingTime(post.reading_time);
  const authorName = post.author?.name ?? SITE_NAME;
  const tags = post.tags ?? [];
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

  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={[
          articleLd,
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-body text-gray-500 mb-8 flex-wrap">
            <Link href="/" className="hover:text-[#0A2647] transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="hover:text-[#0A2647] transition-colors">
              Blog
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#0A2647] font-medium line-clamp-1">{post.title}</span>
          </nav>

          <article>
            <div className="h-64 md:h-96 rounded-2xl relative overflow-hidden mb-8 bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/10">
              {post.featured_image && (
                // Remote CMS images are not in next.config remotePatterns, so use <img>.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A2647]/40 to-transparent" />
              {post.category?.name && (
                <span className="absolute bottom-4 left-4 bg-white/90 text-[#0A2647] text-xs font-heading font-semibold px-3 py-1 rounded-full">
                  {post.category.name}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0A2647] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{authorInitials(authorName)}</span>
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-[#0A2647]">{authorName}</p>
                  <p className="font-body text-xs text-gray-400">
                    {[date, readTime].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <BlogShareButtons url={shareUrl} title={post.title} />
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-6 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="font-body text-gray-500 text-lg mb-8">{post.excerpt}</p>
            )}

            {toc.length > 1 && (
              <nav
                aria-label="Table of contents"
                className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10"
              >
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-[#0A2647] mb-3">
                  In This Article
                </p>
                <ol className="space-y-2">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="font-body text-sm text-gray-600 hover:text-[#C9A227] transition-colors"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/*
              Post bodies are HTML authored through the admin editor, which is behind
              auth:sanctum + the admin route group — the same trust boundary as JsonLd.
              Styling is applied via arbitrary variants since @tailwindcss/typography
              is not a dependency of this project.
            */}
            {contentHtml ? (
              <div
                className="font-body text-gray-700 text-base mb-10
                  [&_p]:leading-relaxed [&_p]:mb-5
                  [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#0A2647] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:scroll-mt-24
                  [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#0A2647] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-24
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5
                  [&_li]:mb-2
                  [&_a]:text-[#C9A227] [&_a]:underline hover:[&_a]:text-[#0A2647]
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#C9A227] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-6
                  [&_img]:rounded-xl [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto
                  [&_strong]:text-[#0A2647]"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <p className="font-body text-gray-500 italic mb-10">
                This article has no content yet.
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 font-body text-xs px-3 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A2647] hover:text-[#C9A227] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                Back to all articles
              </Link>

              <div className="flex items-center gap-4">
                <BlogShareButtons url={shareUrl} title={post.title} />
                <Link
                  href="/contact"
                  className="px-5 py-2.5 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition-colors whitespace-nowrap"
                >
                  Talk to an Advisor
                </Link>
              </div>
            </div>

            {(prev || next) && (
              <nav
                aria-label="Article navigation"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-200"
              >
                {prev ? (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="group flex flex-col p-5 rounded-xl border border-gray-200 hover:border-[#C9A227] transition-colors"
                  >
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      ← Previous
                    </span>
                    <span className="font-heading font-semibold text-[#0A2647] group-hover:text-[#C9A227] transition-colors line-clamp-2">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group flex flex-col p-5 rounded-xl border border-gray-200 hover:border-[#C9A227] transition-colors sm:text-right sm:items-end"
                  >
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Next →
                    </span>
                    <span className="font-heading font-semibold text-[#0A2647] group-hover:text-[#C9A227] transition-colors line-clamp-2">
                      {next.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </article>
        </div>
      </section>

      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <NewsletterForm source="blog" />
          <BlogLeadForm source={`blog:${post.slug}`} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
                >
                  <div className="h-40 relative bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/10">
                    {r.featured_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.featured_image}
                        alt={r.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    {r.category?.name && (
                      <span className="absolute bottom-4 left-4 bg-white/90 text-[#0A2647] text-xs font-heading font-semibold px-3 py-1 rounded-full">
                        {r.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading font-semibold text-[#0A2647] mb-2 group-hover:text-[#C9A227] transition-colors leading-snug">
                      {r.title}
                    </h3>
                    <p className="font-body text-xs text-gray-400">
                      {formatBlogDate(r.published_at ?? r.created_at)}
                    </p>
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
