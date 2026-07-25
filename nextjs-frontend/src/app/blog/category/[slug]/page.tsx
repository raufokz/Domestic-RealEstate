import type { Metadata } from 'next';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { title: `${name} | Blog | Domestic Real Estate`, description: `Read the latest ${name} articles on the Domestic Real Estate blog.` };
}

const posts = [
  { title: '10 Questions to Ask Before Buying a Home', excerpt: 'Asking the right questions can save you from costly mistakes. Here are the essential questions every buyer should ask.', date: 'Jun 28, 2026', readTime: '5 min read' },
  { title: 'How to Stage Your Home Like a Pro', excerpt: 'Staging can increase your sale price by up to 10%. Learn the proven techniques used by top agents.', date: 'Jun 22, 2026', readTime: '4 min read' },
  { title: 'Q2 2026 Housing Market Report', excerpt: 'Inventory is rising, prices are stabilizing, and interest rates are holding steady. What it means for you.', date: 'Jun 15, 2026', readTime: '7 min read' },
  { title: 'Fix and Flip: A Beginner\'s Guide', excerpt: 'Everything you need to know to get started with property flipping, from finding deals to managing renovations.', date: 'Jun 10, 2026', readTime: '6 min read' },
  { title: '2026 Kitchen Renovation Trends', excerpt: 'From smart appliances to sustainable materials, these kitchen trends will boost your home\'s value.', date: 'Jun 5, 2026', readTime: '5 min read' },
  { title: 'First-Time Buyer Mistakes to Avoid', excerpt: 'Don\'t let these common pitfalls derail your home purchase. Learn from others\' experiences.', date: 'May 30, 2026', readTime: '4 min read' },
];

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Blog Category" title={name} subtitle={`Explore our latest articles in ${name}.`} />
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <article key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/10" />
                <div className="p-6">
                  <span className="text-[#C9A227] text-xs font-heading font-semibold uppercase">{name}</span>
                  <h3 className="font-heading text-lg font-bold text-[#0A2647] mt-2 mb-3">{post.title}</h3>
                  <p className="font-body text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 font-body border-t border-gray-100 pt-3">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
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
