import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, FeaturesSection, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Prepare to Sell | Domestic Real Estate',
  description: 'Get your home ready to sell with our comprehensive checklist. Learn how to maximize your property value with simple preparation tips.',
};

const exteriorItems = [
  {
    icon: '🏡',
    title: 'Boost Curb Appeal',
    description: 'Mow the lawn, trim bushes, add fresh mulch, plant colorful flowers, and power wash the driveway and walkways. First impressions matter.',
  },
  {
    icon: '🚪',
    title: 'Upgrade the Front Entry',
    description: 'Paint or replace the front door, update hardware, add a new welcome mat and house numbers. A welcoming entrance sets the tone.',
  },
  {
    icon: '💡',
    title: 'Outdoor Lighting',
    description: 'Install pathway lights, porch fixtures, and landscape lighting. Well-lit homes photograph better and feel safer to buyers.',
  },
  {
    icon: '🏗️',
    title: 'Fix Visible Issues',
    description: 'Repair cracked siding, replace broken gutters, touch up exterior paint, and fix any visible damage. Small fixes prevent big objections.',
  },
];

const interiorItems = [
  {
    icon: '📦',
    title: 'Declutter & Depersonalize',
    description: 'Remove excess furniture, family photos, and personal items. Create a clean canvas so buyers can envision themselves living there.',
  },
  {
    icon: '🎨',
    title: 'Fresh Paint & Neutral Tones',
    description: 'Repaint walls in modern neutral colors like light gray, warm white, or soft greige. A fresh coat of paint is the highest-ROI improvement.',
  },
  {
    icon: '✨',
    title: 'Deep Clean Everything',
    description: 'Hire professional cleaners for carpets, windows, grout, and appliances. A spotless home signals that the property has been well-maintained.',
  },
  {
    icon: '🔧',
    title: 'Minor Repairs & Updates',
    description: 'Fix leaky faucets, replace burned-out bulbs, tighten loose handles, and update dated hardware. These small details add up.',
  },
  {
    icon: '🛋️',
    title: 'Stage Key Rooms',
    description: 'Stage the living room, master bedroom, and kitchen to highlight space and flow. Staged homes sell 73% faster and for 6-25% more.',
  },
  {
    icon: '📸',
    title: 'Prepare for Photos',
    description: 'Clear countertops, fluff pillows, set the dining table, and add fresh flowers. Your home needs to be photo-ready at all times.',
  },
];

export default function PrepareToSellPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Home Preparation"
        title="Prepare to Sell Your Home"
        subtitle="A well-prepared home sells faster and for more money. Follow our expert checklist to get your property in showing-ready condition."
      />

      <FeaturesSection
        title="Exterior Preparation"
        subtitle="Your home's exterior is the first thing buyers see — in person and online."
        features={exteriorItems}
        columns={4}
      />

      <section className="bg-gray-50 border-y border-gray-100">
        <FeaturesSection
          title="Interior Preparation"
          subtitle="Inside your home, focus on creating a bright, clean, and inviting atmosphere."
          features={interiorItems}
          columns={3}
        />
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647] mb-4">ROI of Home Preparation</h2>
            <p className="font-body text-gray-600 max-w-xl mx-auto">Studies show that sellers who prepare their homes recoup their investment many times over.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stat: '$5K–$10K', label: 'Average prep investment', desc: 'Professional cleaning, minor repairs, and staging' },
              { stat: '5-10%', label: 'Price increase', desc: 'Well-prepared homes sell for significantly more' },
              { stat: '73%', label: 'Faster sales', desc: 'Staged homes spend less time on the market' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 text-center hover:shadow-lg transition-shadow">
                <p className="font-heading text-3xl font-bold text-[#C9A227] mb-2">{item.stat}</p>
                <p className="font-heading font-bold text-[#0A2647] mb-1">{item.label}</p>
                <p className="font-body text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Get Your Home in Shape?"
        subtitle="Work with our agents to create a customized preparation plan that maximizes your return."
        primaryAction={{ label: 'Start Your Valuation', href: '/sellers/request-valuation' }}
        secondaryAction={{ label: 'View Marketing Plan', href: '/sellers/marketing-plan' }}
      />
    </main>
  );
}
