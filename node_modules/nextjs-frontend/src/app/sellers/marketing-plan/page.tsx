import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, FeaturesSection, StatsSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Property Marketing Plan | Domestic Real Estate',
  description: 'Discover the comprehensive marketing plan Domestic Real Estate uses to sell your property faster and for top dollar through premium channels.',
};

const channels = [
  {
    icon: '🏠',
    title: 'MLS & Syndication',
    description: 'Your property listed on the MLS and automatically syndicated to Zillow, Realtor.com, Redfin, Trulia, and 500+ real estate platforms nationwide.',
  },
  {
    icon: '📱',
    title: 'Social Media Campaigns',
    description: 'Targeted ads on Facebook, Instagram, and TikTok reaching thousands of potential buyers in your area based on demographics, interests, and search behavior.',
  },
  {
    icon: '🎥',
    title: 'Video & Drone Tours',
    description: 'Cinematic property videos, aerial drone footage, and interactive 3D Matterport tours that let buyers walk through your home from anywhere.',
  },
  {
    icon: '✉️',
    title: 'Email & Direct Mail',
    description: 'Blast campaigns to our database of 10,000+ active buyers and agents, plus premium postcard mailings to the surrounding neighborhood.',
  },
  {
    icon: '🔍',
    title: 'Search Engine Marketing',
    description: 'Google Ads and SEO-optimized listing pages that capture high-intent buyers actively searching for homes like yours.',
  },
  {
    icon: '🎤',
    title: 'Open Houses & Events',
    description: 'Professional open house events with catering, signage, and digital check-in. Private showings coordinated around buyer schedules.',
  },
];

const stats = [
  { value: '500+', label: 'Syndication Platforms' },
  { value: '10K+', label: 'Buyer Database' },
  { value: '92%', label: 'Online Reach Rate' },
  { value: '14 Days', label: 'Avg. Time to Offer' },
];

export default function MarketingPlanPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Marketing Strategy"
        title="Property Marketing Plan"
        subtitle="Every listing gets a custom, multi-channel marketing strategy designed to generate maximum exposure and competitive offers."
        bg="gold"
      />

      <FeaturesSection
        title="Our Marketing Channels"
        subtitle="We don't just list your home — we launch it. Here's how we get it in front of the right buyers."
        features={channels}
        columns={3}
      />

      <StatsSection stats={stats} />

      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">What&apos;s Included in Every Listing</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Every seller receives our full marketing package — no upgrades or hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Professional HDR photography (20+ images)',
              'Aerial drone photography & video',
              'Matterport 3D virtual tour',
              'Custom property website',
              'MLS listing with premium placement',
              'Zillow, Redfin, Realtor.com syndication',
              'Facebook & Instagram ad campaign',
              'Email blast to buyer database',
              'Neighborhood direct mail campaign',
              'Print marketing materials',
              'Open house coordination',
              'Weekly seller marketing reports',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                <div className="w-6 h-6 bg-[#C9A227]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A227] text-xs font-bold">✓</span>
                </div>
                <span className="font-body text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Get Your Custom Marketing Plan"
        subtitle="Contact us for a free, no-obligation marketing consultation and see how we'll position your property for success."
        primaryAction={{ label: 'Request Valuation', href: '/sellers/request-valuation' }}
        secondaryAction={{ label: 'View Our Listings', href: '/sellers/list-your-property' }}
      />
    </main>
  );
}
