'use client';

import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export default function MapPropertySearchPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero badge="Map" title="Map Property Search" subtitle="Explore properties on an interactive map. Find homes near the locations that matter to you." />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl h-[500px] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0A2647]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#0A2647]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
            </div>
            <p className="font-heading text-lg font-semibold text-[#0A2647] mb-2">Interactive Map</p>
            <p className="font-body text-gray-500">Map integration will display property listings by location.</p>
          </div>
        </div>
      </div>

      <CTASection
        title="Need Help Finding a Location?"
        subtitle="Our agents know every neighborhood. Let us help you find the perfect area for your new home."
        primaryAction={{ label: 'Get Location Advice', href: '/contact' }}
        secondaryAction={{ label: 'View All Properties', href: '/properties' }}
      />
    </main>
  );
}
