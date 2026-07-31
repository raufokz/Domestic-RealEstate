import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, CTASection } from '@/components/ui/PageTemplate';
import { getAgents, agentName, agentInitials } from '@/lib/agents';
import { storageUrl } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Agent Directory',
};

export default async function AgentDirectoryPage() {
  const agents = await getAgents({}, 24);

  return (
    <main className="min-h-screen bg-white">
      <PageHero
        badge="Directory"
        title="Agent Directory"
        subtitle="Browse our network of verified, experienced real estate agents ready to help you achieve your goals."
      />

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {agents.length === 0 ? (
            <p className="text-center text-gray-500 font-body py-8">No agents are published yet. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent) => {
                const rating = agent.rating != null ? Number(agent.rating) : 0;
                const avatar = storageUrl(agent.user?.avatar);
                const location = [agent.office_city, agent.office_state].filter(Boolean).join(', ');
                return (
                  <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6 flex items-center gap-4 border-b border-gray-50">
                      <div className="w-16 h-16 bg-[#C9A227]/20 rounded-full flex items-center justify-center overflow-hidden">
                        {avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatar} alt={agentName(agent)} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-heading text-xl font-bold text-[#0A2647]">{agentInitials(agent)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-[#0A2647]">{agentName(agent)}</h3>
                        {agent.headline && <p className="font-body text-gray-500 text-sm">{agent.headline}</p>}
                      </div>
                    </div>
                    <div className="p-6">
                      {location && <p className="font-body text-gray-500 text-sm mb-3">{location}</p>}
                      <div className="flex items-center gap-2 mb-3">
                        {rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-heading font-semibold text-sm text-[#0A2647]">{rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="font-body text-gray-400 text-sm">New agent</span>
                        )}
                        {agent.sales_count != null && agent.sales_count > 0 && (
                          <span className="font-body text-gray-400 text-sm">({agent.sales_count} sold)</span>
                        )}
                      </div>
                      <Link
                        href={`/agents/${agent.slug}`}
                        className="block w-full text-center bg-[#0A2647] text-white font-heading font-medium py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Want to Be Listed Here?"
        subtitle="Join our agent network and get your profile featured in our directory."
        primaryAction={{ label: 'Apply as an Agent', href: '/realtors/join' }}
        secondaryAction={{ label: 'Learn More', href: '/agents' }}
      />
    </main>
  );
}
