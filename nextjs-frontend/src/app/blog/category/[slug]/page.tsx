import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';
import { buildMetadata } from '@/lib/seo';
import { getBlogPosts, formatBlogDate, formatReadingTime } from '@/lib/blog';

async function getCategoryPosts(slug: string) {
  // The public blog index has no server-side category filter, and the
  // categories() endpoint that could resolve name/slug lives behind
  // auth:sanctum + /admin (see BlogController::categories()). Filter the
  // published posts we can fetch publicly instead of inventing a public
  // category-lookup endpoint that doesn't exist.
  const { posts } = await getBlogPosts(100);
  const matches = posts.filter((p) => p.category?.slug === slug);
  const name = matches[0]?.category?.name
    ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { posts: matches, name };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { posts, name } = await getCategoryPosts(slug);

  // No published post carries this category slug — resolve the 404 here
  // rather than returning noindex metadata for a page that still renders
  // (that's the soft-404 pattern already fixed on /blog/[slug]).
  if (posts.length === 0) notFound();

  return buildMetadata({
    title: `${name} | Blog`,
    description: `Read the latest ${name} articles on the Domestic Real Estate blog.`,
    path: `/blog/category/${slug}`,
  });
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { posts, name } = await getCategoryPosts(slug);

  if (posts.length === 0) notFound();

  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Blog Category" title={name} subtitle={`Explore our latest articles in ${name}.`} />
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="h-48 relative bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/10">
                  {post.featured_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <span className="text-[#C9A227] text-xs font-heading font-semibold uppercase">{name}</span>
                  <h3 className="font-heading text-lg font-bold text-[#0A2647] mt-2 mb-3 group-hover:text-[#C9A227] transition-colors">{post.title}</h3>
                  {post.excerpt && <p className="font-body text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-500 font-body border-t border-gray-100 pt-3">
                    <span>{formatBlogDate(post.published_at ?? post.created_at)}</span>
                    <span>{formatReadingTime(post.reading_time)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CTASection
        title="Explore More Articles"
        subtitle="Dive deeper into real estate topics that matter to you."
        primaryAction={{ label: 'View All Posts', href: '/blog' }}
        secondaryAction={{ label: 'Subscribe to Blog', href: '/newsletter' }}
      />
    </main>
  );
}
