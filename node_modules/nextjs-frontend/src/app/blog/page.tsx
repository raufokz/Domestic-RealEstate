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
  title: "Real Estate Insights, Market Trends & Guides",
  description:
    "Stay informed with the latest real estate market analysis, home buying playbooks, seller pricing tips, and property investment strategies from industry experts.",
  path: "/blog",
  keywords: [
    "real estate blog",
    "housing market trends",
    "home buying tips",
    "home selling staging guide",
    "real estate investment advice",
  ],
});

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
            Real Estate <span className="text-[#C9A227]">Insights &amp; Expertise</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto font-body leading-relaxed">
            Market forecasts, home buying playbooks, seller equity guides, and investor data
            strategies written by industry leaders.
          </p>
        </div>
      </section>

      {/* Blog Cards Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-body">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">
              📝
            </div>
            <h2 className="font-heading text-xl font-bold text-[#0A2647] mb-2">
              No articles published yet
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Our editorial team is preparing market analysis and buying guides. Check back soon.
            </p>
            <Link
              href="/properties"
              className="inline-block mt-6 px-6 py-3 bg-[#C9A227] text-[#0A2647] rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => {
              const date = formatBlogDate(post.published_at ?? post.created_at);
              const readTime = formatReadingTime(post.reading_time);

              return (
                <article key={post.id} className="h-full">
                  {/* Whole card is one link so the entire surface is clickable. */}
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
