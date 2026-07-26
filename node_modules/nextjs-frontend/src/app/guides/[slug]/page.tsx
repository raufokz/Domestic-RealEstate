import type { Metadata } from 'next';
import { PageHero, ContentSection, CTASection } from '@/components/ui/PageTemplate';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { title: `${title} | Guides | Domestic Real Estate`, description: `A comprehensive guide about ${title.toLowerCase()} from Domestic Real Estate.` };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Guide" title={name} subtitle="A comprehensive guide to help you succeed." />
      <ContentSection title={name}>
        <p>
          This guide covers everything you need to know about {name.toLowerCase()}. Whether you&apos;re a first-time
          buyer, seasoned investor, or homeowner looking to sell, our expert insights will help you make informed
          decisions at every stage.
        </p>
        <h3 className="font-heading text-xl font-bold text-[#0A2647] mt-8 mb-4">Key Takeaways</h3>
        <ul className="list-disc pl-6 space-y-2 font-body text-gray-700">
          <li>Understand the current market conditions and how they impact your strategy</li>
          <li>Learn proven techniques from industry experts with decades of experience</li>
          <li>Access actionable checklists and resources you can use immediately</li>
          <li>Avoid common pitfalls that cost time and money</li>
        </ul>
        <h3 className="font-heading text-xl font-bold text-[#0A2647] mt-8 mb-4">Getting Started</h3>
        <p>
          Begin by reviewing the fundamentals outlined in this guide. Each section is designed to build
          on the previous one, giving you a solid foundation of knowledge. Feel to reach out to our team
          if you have questions along the way.
        </p>
        <p className="mt-4">
          Our agents are available to provide personalized advice tailored to your specific situation
          and goals. Schedule a consultation to get started.
        </p>
      </ContentSection>
      <CTASection
        title="Ready to Take the Next Step?"
        subtitle="Let our experienced agents help you put this guide into action."
        primaryAction={{ label: 'Schedule a Consultation', href: '/contact' }}
        secondaryAction={{ label: 'Explore More Guides', href: '/guides' }}
      />
    </main>
  );
}
