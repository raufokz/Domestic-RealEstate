import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';
import { buildMetadata } from '@/lib/seo';
import { getBlogPosts, formatBlogDate, formatReadingTime } from '@/lib/blog';

/** Mirrors BlogController::tags()' Str::slug($name) — posts store raw tag
 * strings (e.g. "First-Time Buyers"), not slugs, so the route param has to be
 * slugified the same way before comparing. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getTagPosts(slug: string) {
  const { posts } = await getBlogPosts(100);
  const matches = posts.filter((p) => (p.tags ?? []).some((t) => slugify(t) === slug));
  const name = matches
    .flatMap((p) => p.tags ?? [])
    .find((t) => slugify(t) === slug)
    ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { posts: matches, name };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { posts, name } = await getTagPosts(slug);

  if (posts.length === 0) notFound();

  return buildMetadata({
    title: `${name} | Blog`,
    description: `Articles tagged with ${name} on the Domestic Real Estate blog.`,
    path: `/blog/tag/${slug}`,
  });
}

export default async function BlogTagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { posts, name } = await getTagPosts(slug);

  if (posts.length === 0) notFound();

  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Blog Tag" title={name} subtitle={`Browse all articles tagged with ${name}.`} />
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
        title="Explore More Content"
        subtitle="Find articles, guides, and resources to help you make informed decisions."
        primaryAction={{ label: 'Browse All Posts', href: '/blog' }}
        secondaryAction={{ label: 'Subscribe to Newsletter', href: '/newsletter' }}
      />
    </main>
  );
}
