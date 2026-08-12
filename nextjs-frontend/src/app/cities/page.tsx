import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Cities | Domestic Real Estate',
  description: 'Browse real estate markets across the US and Canada. Find properties, average prices, and market insights for 60+ major cities.',
};

const CITY_DATA: Record<string, { state: string; country: string; cities: { name: string; slug: string; properties: number; avgPrice: string }[] }> = {
  'New York': {
    state: 'New York', country: 'US',
    cities: [{ name: 'New York City', slug: 'new-york-city', properties: 12450, avgPrice: '$1,850,000' }],
  },
  'California': {
    state: 'California', country: 'US',
    cities: [
      { name: 'Los Angeles', slug: 'los-angeles', properties: 8920, avgPrice: '$1,250,000' },
      { name: 'San Francisco', slug: 'san-francisco', properties: 5430, avgPrice: '$1,680,000' },
      { name: 'San Diego', slug: 'san-diego', properties: 3870, avgPrice: '$890,000' },
      { name: 'San Jose', slug: 'san-jose', properties: 2940, avgPrice: '$1,120,000' },
      { name: 'Long Beach', slug: 'long-beach', properties: 2200, avgPrice: '$780,000' },
      { name: 'Fresno', slug: 'fresno', properties: 1450, avgPrice: '$340,000' },
      { name: 'Sacramento', slug: 'sacramento', properties: 2100, avgPrice: '$450,000' },
    ],
  },
  'Texas': {
    state: 'Texas', country: 'US',
    cities: [
      { name: 'Houston', slug: 'houston', properties: 7650, avgPrice: '$385,000' },
      { name: 'Dallas', slug: 'dallas', properties: 6210, avgPrice: '$420,000' },
      { name: 'Austin', slug: 'austin', properties: 4580, avgPrice: '$550,000' },
      { name: 'San Antonio', slug: 'san-antonio', properties: 3240, avgPrice: '$310,000' },
      { name: 'Fort Worth', slug: 'fort-worth', properties: 3100, avgPrice: '$330,000' },
      { name: 'El Paso', slug: 'el-paso', properties: 1800, avgPrice: '$215,000' },
      { name: 'Arlington', slug: 'arlington', properties: 2050, avgPrice: '$320,000' },
      { name: 'Wichita', slug: 'wichita', properties: 1200, avgPrice: '$185,000' },
    ],
  },
  'Florida': {
    state: 'Florida', country: 'US',
    cities: [
      { name: 'Miami', slug: 'miami', properties: 9100, avgPrice: '$620,000' },
      { name: 'Jacksonville', slug: 'jacksonville', properties: 4800, avgPrice: '$310,000' },
      { name: 'Tampa', slug: 'tampa', properties: 5340, avgPrice: '$410,000' },
    ],
  },
  'Illinois': {
    state: 'Illinois', country: 'US',
    cities: [
      { name: 'Chicago', slug: 'chicago', properties: 7820, avgPrice: '$350,000' },
    ],
  },
  'Pennsylvania': {
    state: 'Pennsylvania', country: 'US',
    cities: [
      { name: 'Philadelphia', slug: 'philadelphia', properties: 5200, avgPrice: '$290,000' },
    ],
  },
  'Arizona': {
    state: 'Arizona', country: 'US',
    cities: [
      { name: 'Phoenix', slug: 'phoenix', properties: 6100, avgPrice: '$420,000' },
      { name: 'Tucson', slug: 'tucson', properties: 2400, avgPrice: '$285,000' },
      { name: 'Mesa', slug: 'mesa', properties: 2100, avgPrice: '$370,000' },
    ],
  },
  'Ohio': {
    state: 'Ohio', country: 'US',
    cities: [
      { name: 'Columbus', slug: 'columbus', properties: 3900, avgPrice: '$280,000' },
    ],
  },
  'North Carolina': {
    state: 'North Carolina', country: 'US',
    cities: [
      { name: 'Charlotte', slug: 'charlotte', properties: 4200, avgPrice: '$350,000' },
      { name: 'Raleigh', slug: 'raleigh', properties: 3600, avgPrice: '$400,000' },
      { name: 'Castle Hayne', slug: 'castle-hayne', properties: 210, avgPrice: '$385,000' },
    ],
  },
  'Indiana': {
    state: 'Indiana', country: 'US',
    cities: [
      { name: 'Indianapolis', slug: 'indianapolis', properties: 3400, avgPrice: '$245,000' },
    ],
  },
  'Washington': {
    state: 'Washington', country: 'US',
    cities: [
      { name: 'Seattle', slug: 'seattle', properties: 4800, avgPrice: '$820,000' },
    ],
  },
  'Colorado': {
    state: 'Colorado', country: 'US',
    cities: [
      { name: 'Denver', slug: 'denver', properties: 4100, avgPrice: '$560,000' },
      { name: 'Colorado Springs', slug: 'colorado-springs', properties: 2300, avgPrice: '$420,000' },
    ],
  },
  'District of Columbia': {
    state: 'District of Columbia', country: 'US',
    cities: [
      { name: 'Washington', slug: 'washington', properties: 3800, avgPrice: '$650,000' },
    ],
  },
  'Tennessee': {
    state: 'Tennessee', country: 'US',
    cities: [
      { name: 'Nashville', slug: 'nashville', properties: 4500, avgPrice: '$430,000' },
      { name: 'Memphis', slug: 'memphis', properties: 2200, avgPrice: '$185,000' },
    ],
  },
  'Oklahoma': {
    state: 'Oklahoma', country: 'US',
    cities: [
      { name: 'Oklahoma City', slug: 'oklahoma-city', properties: 3100, avgPrice: '$215,000' },
      { name: 'Tulsa', slug: 'tulsa', properties: 2000, avgPrice: '$195,000' },
    ],
  },
  'Massachusetts': {
    state: 'Massachusetts', country: 'US',
    cities: [
      { name: 'Boston', slug: 'boston', properties: 4600, avgPrice: '$720,000' },
    ],
  },
  'Oregon': {
    state: 'Oregon', country: 'US',
    cities: [
      { name: 'Portland', slug: 'portland', properties: 3200, avgPrice: '$520,000' },
    ],
  },
  'Nevada': {
    state: 'Nevada', country: 'US',
    cities: [
      { name: 'Las Vegas', slug: 'las-vegas', properties: 5100, avgPrice: '$400,000' },
    ],
  },
  'Kentucky': {
    state: 'Kentucky', country: 'US',
    cities: [
      { name: 'Louisville', slug: 'louisville', properties: 2600, avgPrice: '$230,000' },
    ],
  },
  'Maryland': {
    state: 'Maryland', country: 'US',
    cities: [
      { name: 'Baltimore', slug: 'baltimore', properties: 3000, avgPrice: '$240,000' },
    ],
  },
  'Wisconsin': {
    state: 'Wisconsin', country: 'US',
    cities: [
      { name: 'Milwaukee', slug: 'milwaukee', properties: 2400, avgPrice: '$210,000' },
    ],
  },
  'New Mexico': {
    state: 'New Mexico', country: 'US',
    cities: [
      { name: 'Albuquerque', slug: 'albuquerque', properties: 2000, avgPrice: '$285,000' },
    ],
  },
  'Kansas': {
    state: 'Kansas', country: 'US',
    cities: [
      { name: 'Kansas City', slug: 'kansas-city', properties: 2200, avgPrice: '$240,000' },
    ],
  },
  'Georgia': {
    state: 'Georgia', country: 'US',
    cities: [
      { name: 'Atlanta', slug: 'atlanta', properties: 5500, avgPrice: '$390,000' },
    ],
  },
  'Nebraska': {
    state: 'Nebraska', country: 'US',
    cities: [
      { name: 'Omaha', slug: 'omaha', properties: 2100, avgPrice: '$260,000' },
    ],
  },
  'Virginia': {
    state: 'Virginia', country: 'US',
    cities: [
      { name: 'Virginia Beach', slug: 'virginia-beach', properties: 2800, avgPrice: '$340,000' },
    ],
  },
  'California (South)': {
    state: 'California (South)', country: 'US',
    cities: [
      { name: 'Oakland', slug: 'oakland', properties: 2000, avgPrice: '$780,000' },
    ],
  },
  'Minnesota': {
    state: 'Minnesota', country: 'US',
    cities: [
      { name: 'Minneapolis', slug: 'minneapolis', properties: 3100, avgPrice: '$340,000' },
    ],
  },
  'Louisiana': {
    state: 'Louisiana', country: 'US',
    cities: [
      { name: 'New Orleans', slug: 'new-orleans', properties: 2500, avgPrice: '$290,000' },
    ],
  },
  'Ontario': {
    state: 'Ontario', country: 'CA',
    cities: [
      { name: 'Toronto', slug: 'toronto', properties: 8450, avgPrice: '$1,100,000 CAD' },
      { name: 'Ottawa', slug: 'ottawa', properties: 3200, avgPrice: '$650,000 CAD' },
      { name: 'Hamilton', slug: 'hamilton', properties: 2100, avgPrice: '$580,000 CAD' },
      { name: 'Kitchener', slug: 'kitchener', properties: 1800, avgPrice: '$520,000 CAD' },
    ],
  },
  'British Columbia': {
    state: 'British Columbia', country: 'CA',
    cities: [
      { name: 'Vancouver', slug: 'vancouver', properties: 6320, avgPrice: '$1,250,000 CAD' },
    ],
  },
  'Quebec': {
    state: 'Quebec', country: 'CA',
    cities: [
      { name: 'Montreal', slug: 'montreal', properties: 5100, avgPrice: '$520,000 CAD' },
      { name: 'Quebec City', slug: 'quebec-city', properties: 1900, avgPrice: '$380,000 CAD' },
    ],
  },
  'Alberta': {
    state: 'Alberta', country: 'CA',
    cities: [
      { name: 'Calgary', slug: 'calgary', properties: 4200, avgPrice: '$540,000 CAD' },
      { name: 'Edmonton', slug: 'edmonton', properties: 3100, avgPrice: '$420,000 CAD' },
    ],
  },
  'Manitoba': {
    state: 'Manitoba', country: 'CA',
    cities: [
      { name: 'Winnipeg', slug: 'winnipeg', properties: 2200, avgPrice: '$350,000 CAD' },
    ],
  },
};

const states = Object.keys(CITY_DATA);

function formatNumber(n: number) {
  return n.toLocaleString();
}

export default function CitiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative bg-[#0A2647] text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A227] font-heading text-sm tracking-widest uppercase mb-4">Explore Locations</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">Explore Cities Across the US & Canada</h1>
          <p className="font-body text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Discover real estate markets in 60+ major cities. Find average prices, available listings, and neighborhood insights.
          </p>
          <div className="max-w-2xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by city or state..."
              className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/50 font-body focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {['US', 'CA'].map((country) => {
            const countryStates = states.filter((s) => CITY_DATA[s].country === country);
            return (
              <div key={country} className="mb-20 last:mb-0">
                <div className="flex items-center gap-4 mb-10 border-b border-gray-200 pb-4">
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0A2647]">
                    {country === 'US' ? 'United States' : 'Canada'}
                  </h2>
                  <span className="text-sm font-body text-white bg-[#C9A227] px-3 py-1 rounded-full font-semibold">
                    {countryStates.reduce((acc, s) => acc + CITY_DATA[s].cities.length, 0)} cities
                  </span>
                </div>
                {countryStates.map((state) => (
                  <div key={state} className="mb-12 last:mb-0">
                    <div className="flex items-center gap-3 mb-6">
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-[#0A2647]">{state}</h3>
                      <span className="text-sm font-body text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {CITY_DATA[state].cities.length} {CITY_DATA[state].cities.length === 1 ? 'city' : 'cities'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {CITY_DATA[state].cities.map((city) => (
                        <a
                          key={city.slug}
                          href={`/cities/${city.slug}`}
                          className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:border-[#C9A227]/30"
                        >
                          <div className="h-36 bg-gradient-to-br from-[#0A2647]/10 to-[#C9A227]/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2647]/50 to-transparent" />
                            <div className="absolute bottom-3 left-4">
                              <h4 className="font-heading text-lg font-bold text-white">{city.name}</h4>
                              <p className="font-body text-white/70 text-xs">{state}</p>
                            </div>
                            <div className="absolute top-3 right-3">
                              <svg className="w-4 h-4 text-white/50 group-hover:text-[#C9A227] transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                              </svg>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-body text-xs text-gray-500">{formatNumber(city.properties)} listings</span>
                            </div>
                            <p className="font-heading text-base font-bold text-[#0A2647]">{city.avgPrice}</p>
                            <p className="font-body text-[10px] text-gray-400 uppercase tracking-wide">avg. price</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
