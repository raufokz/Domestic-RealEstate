import type { Metadata } from 'next';
import Link from 'next/link';

const AGENTS_DB: Record<string, {
  name: string; headline: string; rating: number; reviews: number; phone: string; email: string; license: string; brokerage: string;
  bio: string; specialties: string[]; serviceAreas: string[]; sold: number; experience: string;
  listings: { address: string; price: string; beds: number; baths: number; sqft: string }[];
  reviewsList: { name: string; rating: number; text: string; date: string }[];
}> = {
  'jessica-hartwell': {
    name: 'Jessica Hartwell', headline: 'Luxury Homes Specialist', rating: 4.9, reviews: 127,
    phone: '(310) 555-0199', email: 'jessica@domesticre.com', license: 'DRE #01234567',
    brokerage: 'Domestic Real Estate', sold: 89, experience: '12 years',
    bio: 'Jessica Hartwell is a top-producing luxury real estate agent with over 12 years of experience in the Beverly Hills and Greater Los Angeles markets. She has built her reputation on unparalleled market knowledge, exceptional negotiation skills, and a commitment to providing white-glove service to every client. Jessica specializes in high-end residential properties and has successfully closed over $150M in career sales.',
    specialties: ['Luxury Homes', 'Waterfront Properties', 'Investment Properties', 'New Construction', 'Relocation Services', 'First-Time Buyers'],
    serviceAreas: ['Beverly Hills', 'Bel Air', 'Malibu', 'Pacific Palisades', 'Santa Monica', 'Holmby Hills'],
    listings: [
      { address: '123 Oak Lane, Beverly Hills', price: '$4,250,000', beds: 5, baths: 4, sqft: '4,200' },
      { address: '456 Sunset Blvd, Bel Air', price: '$3,800,000', beds: 6, baths: 5, sqft: '5,100' },
      { address: '789 Pacific Coast Hwy, Malibu', price: '$7,500,000', beds: 5, baths: 6, sqft: '4,800' },
      { address: '321 Wilshire Blvd, Santa Monica', price: '$2,100,000', beds: 3, baths: 3, sqft: '2,600' },
      { address: '654 Chautauqua Blvd, Pacific Palisades', price: '$3,200,000', beds: 4, baths: 4, sqft: '3,500' },
      { address: '987 Beverly Park Ln, Beverly Hills', price: '$12,800,000', beds: 7, baths: 9, sqft: '9,200' },
    ],
    reviewsList: [
      { name: 'Michael & Sarah T.', rating: 5, text: 'Jessica was absolutely incredible. Her knowledge of the Beverly Hills market is unmatched. She found us our dream home and negotiated a price well below asking. We could not recommend her more highly.', date: 'Jun 2026' },
      { name: 'David L.', rating: 5, text: 'Working with Jessica was a pleasure. She is professional, responsive, and truly cares about her clients. She sold our home in under two weeks at full asking price.', date: 'May 2026' },
      { name: 'Emily & Robert K.', rating: 4, text: 'Jessica made our first-time home buying experience smooth and stress-free. She guided us through every step and always had our best interests at heart.', date: 'Apr 2026' },
    ],
  },
};

function generateFallback(slug: string) {
  return {
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    headline: 'Real Estate Professional', rating: 4.8, reviews: 50,
    phone: '(310) 555-0199', email: 'agent@domesticre.com', license: 'DRE #00000000',
    brokerage: 'Domestic Real Estate', sold: 45, experience: '8 years',
    bio: 'A dedicated real estate professional committed to helping clients achieve their property goals. With extensive market knowledge and a client-first approach, they deliver exceptional results in every transaction.',
    specialties: ['Residential Sales', 'Investment Properties', 'First-Time Buyers', 'Relocation'],
    serviceAreas: ['Los Angeles', 'Beverly Hills', 'Santa Monica', 'West Hollywood'],
    listings: [
      { address: '123 Main St, Beverly Hills', price: '$950,000', beds: 3, baths: 2, sqft: '1,800' },
      { address: '456 Oak Ave, Santa Monica', price: '$1,250,000', beds: 4, baths: 3, sqft: '2,400' },
      { address: '789 Elm Dr, West Hollywood', price: '$780,000', beds: 2, baths: 2, sqft: '1,300' },
    ],
    reviewsList: [
      { name: 'Happy Client', rating: 5, text: 'Great experience working with this agent. Very professional and knowledgeable.', date: 'Jun 2026' },
    ],
  };
}

export async function generateStaticParams() {
  return [{ slug: 'jessica-hartwell' }, { slug: 'michael-torres' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = AGENTS_DB[slug] || generateFallback(slug);
  return {
    title: `${agent.name} | ${agent.headline}`,
    description: `Connect with ${agent.name}, a ${agent.headline} at Domestic Real Estate. ${agent.sold} homes sold. ${agent.rating}/5 rating from ${agent.reviews} reviews.`,
  };
}

export default async function AgentProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = AGENTS_DB[slug] || generateFallback(slug);

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#0A2647] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-[#C9A227]/20 rounded-3xl flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-4xl md:text-5xl font-bold text-white">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[#C9A227] font-heading text-sm tracking-widest uppercase mb-2">Verified Agent</p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-1">{agent.name}</h1>
              <p className="font-body text-white/70 text-lg mb-3">{agent.headline}</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="font-heading font-bold">{agent.rating}</span>
                  <span className="font-body text-white/60">({agent.reviews} reviews)</span>
                </div>
                <span className="text-white/30">|</span>
                <span className="font-body text-white/70">{agent.sold} homes sold</span>
                <span className="text-white/30">|</span>
                <span className="font-body text-white/70">{agent.experience}</span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm font-body text-white/60">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  {agent.phone}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  {agent.email}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm font-body text-white/50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                {agent.license} · {agent.brokerage}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">About {agent.name.split(' ')[0]}</h2>
              <p className="font-body text-gray-600 leading-relaxed">{agent.bio}</p>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {agent.specialties.map((s, i) => (
                  <span key={i} className="bg-[#C9A227]/10 text-[#0A2647] font-heading font-medium text-sm px-4 py-2 rounded-full">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-4">Service Areas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {agent.serviceAreas.map((area, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                    <p className="font-heading font-semibold text-[#0A2647] text-sm">{area}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-6">Active Listings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {agent.listings.map((listing, i) => (
                  <Link key={i} href="/properties/123-oak-lane" className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className={`h-40 bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/${10 + i * 5} relative`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2647]/30 to-transparent" />
                    </div>
                    <div className="p-5">
                      <p className="font-heading text-xl font-bold text-[#0A2647] mb-1">{listing.price}</p>
                      <p className="font-body text-gray-500 text-sm mb-3">{listing.address}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600 font-body border-t border-gray-100 pt-3">
                        <span>{listing.beds} beds</span>
                        <span>{listing.baths} baths</span>
                        <span>{listing.sqft} sqft</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-[#0A2647] mb-6">Reviews</h2>
              <div className="space-y-5">
                {agent.reviewsList.map((review, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0A2647] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{review.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                          <p className="font-heading font-semibold text-[#0A2647] text-sm">{review.name}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <svg key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'text-[#C9A227]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="font-body text-xs text-gray-400">{review.date}</span>
                    </div>
                    <p className="font-body text-gray-600 text-sm leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="font-heading text-lg font-bold text-[#0A2647] mb-5">Contact {agent.name.split(' ')[0]}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input type="text" placeholder="John Doe" className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" placeholder="john@example.com" className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="tel" placeholder="(310) 555-0199" className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm focus:ring-2 focus:ring-[#C9A227] outline-none" />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea rows={4} placeholder="Hi, I'm interested in buying a home in Beverly Hills..." className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm focus:ring-2 focus:ring-[#C9A227] outline-none resize-none" />
                </div>
                <button className="w-full bg-[#0A2647] text-white font-heading font-semibold py-3 rounded-lg hover:bg-[#0A2647]/90 transition-colors">Send Message</button>
                <a href={`tel:${agent.phone}`} className="block w-full bg-[#C9A227] text-[#0A2647] font-heading font-semibold py-3 rounded-lg hover:bg-[#C9A227]/90 transition-colors text-center">Call {agent.name.split(' ')[0]}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
