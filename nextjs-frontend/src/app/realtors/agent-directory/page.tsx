import type { Metadata } from 'next';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';

export const metadata: Metadata = {
  title: 'Agent Directory',
};

const agents = [
  { name: 'Jessica Hartwell', specialty: 'Luxury Homes', location: 'Beverly Hills, CA', rating: 4.9, sold: 89, img: 'bg-[#C9A227]/20' },
  { name: 'Michael Torres', specialty: 'First-Time Buyers', location: 'Austin, TX', rating: 4.8, sold: 67, img: 'bg-[#0A2647]/20' },
  { name: 'Sarah Kim', specialty: 'Investment Properties', location: 'Miami, FL', rating: 5.0, sold: 52, img: 'bg-[#8B1E3F]/20' },
  { name: 'David Chen', specialty: 'Commercial', location: 'New York, NY', rating: 4.7, sold: 41, img: 'bg-[#C9A227]/20' },
  { name: 'Emily Johnson', specialty: 'Relocations', location: 'Denver, CO', rating: 4.9, sold: 73, img: 'bg-[#0A2647]/20' },
  { name: 'Robert Williams', specialty: 'Condos & Townhomes', location: 'Chicago, IL', rating: 4.8, sold: 58, img: 'bg-[#8B1E3F]/20' },
];

export default function AgentDirectoryPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Directory"
        title="Agent Directory"
        subtitle="Browse our network of verified, experienced real estate agents ready to help you achieve your goals."
      />

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6 flex items-center gap-4 border-b border-gray-50">
                  <div className={`w-16 h-16 ${agent.img} rounded-full flex items-center justify-center`}>
                    <span className="font-heading text-xl font-bold text-[#0A2647]">{agent.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-[#0A2647]">{agent.name}</h3>
                    <p className="font-body text-gray-500 text-sm">{agent.specialty}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="font-body text-gray-500 text-sm mb-3">{agent.location}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-heading font-semibold text-sm text-[#0A2647]">{agent.rating}</span>
                    </div>
                    <span className="font-body text-gray-400 text-sm">({agent.sold} sold)</span>
                  </div>
                  <button className="w-full bg-[#0A2647] text-white font-heading font-medium py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors">
                    Contact Agent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Want to Be Listed Here?"
        subtitle="Join our agent network and get your profile featured in our directory."
        primaryAction={{ label: 'Apply as an Agent', href: '/agents/apply' }}
        secondaryAction={{ label: 'Learn More', href: '/agents' }}
      />
    </main>
  );
}
