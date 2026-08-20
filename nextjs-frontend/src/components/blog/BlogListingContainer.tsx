"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BlogPost, formatBlogDate, formatReadingTime, postExcerpt } from "@/lib/blog";
import BlogCategoryFilter from "./BlogCategoryFilter";

export interface InformationalGuide {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  desc: string;
  publishedDate?: string;
  author?: string;
  image?: string;
}

interface BlogListingContainerProps {
  initialPosts: BlogPost[];
  error: string | null;
  informationalGuides: InformationalGuide[];
}

export default function BlogListingContainer({
  initialPosts,
  error,
  informationalGuides,
}: BlogListingContainerProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract all unique categories from guides and posts
  const categories = useMemo(() => {
    const set = new Set<string>();
    informationalGuides.forEach((g) => set.add(g.category));
    initialPosts.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set).sort();
  }, [informationalGuides, initialPosts]);

  // Filter educational guides based on search query and category
  const filteredGuides = useMemo(() => {
    return informationalGuides.filter((guide) => {
      const matchesCategory =
        selectedCategory === "All" || guide.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        guide.title.toLowerCase().includes(q) ||
        guide.desc.toLowerCase().includes(q) ||
        guide.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [informationalGuides, selectedCategory, searchQuery]);

  // Filter API posts based on search query and category
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category?.name === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
        (post.category?.name && post.category.name.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  const totalArticlesCount = informationalGuides.length + initialPosts.length;
  const filteredCount = filteredGuides.length + filteredPosts.length;

  const featuredGuide = informationalGuides[0];

  return (
    <div className="bg-[#FDFBF7] text-stone-900 font-body min-h-screen">
      {/* Hero Header Section (Matches standard page hero design) */}
      <section className="relative bg-[#0A2647] text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2647] via-[#081F3A] to-slate-900 z-0" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

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

          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-body">
            Market forecasts, investment process comparisons, GDP research, and domestic real estate valuations written by industry experts.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-10 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-white/10 pt-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Publication</p>
              <p className="text-lg font-bold text-white font-heading mt-0.5">Weekly</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Research Guides</p>
              <p className="text-lg font-bold text-white font-heading mt-0.5">12+ Series</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Market Scope</p>
              <p className="text-lg font-bold text-white font-heading mt-0.5">US Domestic</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Accuracy Rating</p>
              <p className="text-lg font-bold text-[#C9A227] font-heading mt-0.5">99.4% Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Interactive Filter & Search Bar */}
        <BlogCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={totalArticlesCount}
          filteredCount={filteredCount}
        />

        {/* Featured Editorial Spotlight (shown when no search filter active) */}
        {!searchQuery && selectedCategory === "All" && featuredGuide && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#806326]">
                Featured Lead Story
              </h2>
            </div>

            <Link
              href={`/blog/${featuredGuide.slug}`}
              className="group block bg-white border border-[#EBE6DD] rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-md hover:border-[#C9A227]/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-extrabold bg-[#F5F0E6] text-[#806326] border border-[#E3DAC9] px-3 py-1 rounded-full uppercase tracking-wider">
                      {featuredGuide.category}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{featuredGuide.readTime}</span>
                  </div>

                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#0A2647] group-hover:text-[#806326] transition-colors leading-tight mb-4">
                    {featuredGuide.title}
                  </h3>

                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-body">
                    {featuredGuide.desc}
                  </p>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-4 border-t border-[#F5F0E6]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0A2647] text-white flex items-center justify-center font-bold text-[10px]">
                        DR
                      </div>
                      <span className="font-semibold text-stone-900">Domestic RE Research Team</span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 font-bold text-[#806326] group-hover:translate-x-1 transition-transform">
                      Read Full Article <span>→</span>
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 h-64 lg:h-full min-h-[220px] rounded-2xl bg-gradient-to-br from-[#0A2647] to-[#1C3B66] p-6 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                  <div className="relative z-10">
                    <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/10 px-2.5 py-1 rounded-md text-amber-300">
                      Editorial Focus
                    </span>
                    <p className="mt-4 font-serif text-lg text-stone-100 italic leading-snug">
                      &ldquo;Understanding the core structural differences between domestic property acquisitions and international portfolio allocation.&rdquo;
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center justify-between text-xs text-stone-300 border-t border-white/10 pt-3">
                    <span>Research Paper</span>
                    <span className="font-semibold text-amber-300">Verified Data</span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Educational Research Guides Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#806326] block mb-1">
                Curated Series
              </span>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647]">
                Domestic Investment &amp; Market Research Guides
              </h2>
            </div>
            <span className="text-xs text-stone-400 font-medium hidden sm:block">
              {filteredGuides.length} Guides Available
            </span>
          </div>

          {filteredGuides.length === 0 && filteredPosts.length === 0 ? (
            <div className="bg-white border border-[#EBE6DD] rounded-2xl p-12 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-heading text-base font-bold text-[#0A2647] mb-1">
                No matching articles found
              </h3>
              <p className="text-stone-500 text-xs max-w-sm mx-auto mb-4">
                We couldn&apos;t find any articles matching &ldquo;{searchQuery}&rdquo;. Try clearing filters or searching for another keyword.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-[#0A2647] text-white rounded-lg text-xs font-semibold hover:bg-[#081F3A] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide, idx) => (
                <article key={idx} className="h-full">
                  <Link
                    href={`/blog/${guide.slug}`}
                    className="group block h-full bg-white border border-[#EBE6DD] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#C9A227]/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-[10px] font-extrabold bg-[#F5F0E6] text-[#806326] border border-[#E3DAC9] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {guide.category}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">
                          {guide.readTime}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-lg text-[#0A2647] group-hover:text-[#806326] transition-colors leading-snug mb-2.5">
                        {guide.title}
                      </h3>

                      <p className="text-stone-600 text-xs leading-relaxed font-body mb-6">
                        {guide.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#F5F0E6] flex items-center justify-between text-xs">
                      <span className="text-stone-400 font-medium">Research Article</span>
                      <span className="font-bold text-[#806326] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Read Guide <span className="text-xs">→</span>
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Dynamic Published Articles Section */}
        <section className="bg-white border border-[#EBE6DD] rounded-3xl p-8 lg:p-12 mb-20 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#806326] block mb-1">
              Live Feed
            </span>
            <h2 className="font-heading text-2xl font-bold text-[#0A2647]">
              Latest Published Industry News
            </h2>
            <p className="text-stone-500 text-xs mt-1">
              Real-time updates published directly by our editorial board.
            </p>
          </div>

          {error && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 text-center">
              <p className="text-amber-900 font-semibold text-sm">{error}</p>
              <p className="text-stone-600 text-xs mt-2">
                You can still explore our educational research guides above, or{" "}
              .
              </p>
            </div>
          )}

          {!error && filteredPosts.length === 0 && (
            <div className="bg-[#FDFBF7] border border-[#EBE6DD] rounded-2xl p-10 text-center">
              <div className="text-3xl mb-3">📰</div>
              <h3 className="font-heading text-base font-bold text-[#0A2647] mb-1">
                Editorial News Updates Coming Soon
              </h3>
              <p className="text-stone-500 text-xs max-w-md mx-auto">
                Our editorial team publishes weekly market updates. Explore our research guides above for detailed real estate insights.
              </p>
            </div>
          )}

          {filteredPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => {
                const date = formatBlogDate(post.published_at ?? post.created_at);
                const readTime = formatReadingTime(post.reading_time);

                return (
                  <article key={post.id} className="h-full">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group block h-full bg-[#FDFBF7] border border-[#EBE6DD] rounded-2xl p-6 hover:shadow-md hover:border-[#C9A227]/40 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3 gap-3">
                          {post.category?.name && (
                            <span className="text-[10px] font-extrabold bg-[#F5F0E6] text-[#806326] border border-[#E3DAC9] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {post.category.name}
                            </span>
                          )}
                          {readTime && (
                            <span className="text-[11px] text-stone-400 font-medium shrink-0">
                              {readTime}
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-bold text-lg text-[#0A2647] mb-2 group-hover:text-[#806326] transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-stone-600 text-xs leading-relaxed mb-5 font-body">
                          {postExcerpt(post)}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#EBE6DD] flex items-center justify-between text-xs text-stone-500 gap-3">
                        <span className="truncate">
                          By <strong className="text-[#0A2647]">{post.author?.name ?? "Domestic RE"}</strong>
                        </span>
                        <span className="shrink-0">{date}</span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Swiss Minimalist Newsletter CTA Bar */}
        <section className="bg-gradient-to-r from-[#0A2647] to-[#1C3B66] rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#C9A227]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300 block mb-2">
                Stay Ahead of Market Shifts
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
                Subscribe to Domestic RE Market Intelligence
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                Get weekly macroeconomic reports, cap rate analysis, bubble index indicators, and US domestic property trends delivered directly to your inbox.
              </p>
            </div>

            <div className="lg:col-span-5">
              <Link
                href="/newsletter"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-[#C9A227] text-[#0A2647] font-heading font-bold rounded-xl hover:bg-amber-300 transition-colors shadow-md text-sm text-center"
              >
                Join Investor Newsletter →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

