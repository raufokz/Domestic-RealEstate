import { MetadataRoute } from 'next';

const BASE_URL = 'https://domesticrealestate.us';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8001';

async function fetchBlogs() {
  try {
    const res = await fetch(`${API_BASE}/api/blogs?per_page=200`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

async function fetchSeoPages() {
  try {
    const res = await fetch(`${API_BASE}/api/seo-pages?per_page=200`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const make = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly') => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  const staticPages = [
    make('', 1.0, 'daily'),
    // Company & content
    make('/about', 0.8, 'monthly'),
    make('/contact', 0.8, 'monthly'),
    make('/faq', 0.7, 'monthly'),
    make('/blog', 0.9, 'daily'),
    make('/guides', 0.7, 'weekly'),
    make('/market-reports', 0.7, 'weekly'),
    make('/testimonials', 0.6, 'monthly'),
    make('/resources', 0.6, 'monthly'),
    make('/resources/calculators', 0.7, 'monthly'),
    make('/resources/templates', 0.6, 'monthly'),
    make('/resources/webinars', 0.6, 'monthly'),
    make('/news', 0.6, 'weekly'),
    make('/press', 0.5, 'monthly'),
    make('/newsletter', 0.5, 'yearly'),
    // Property discovery
    make('/properties', 0.9, 'daily'),
    make('/properties/map', 0.8, 'daily'),
    make('/properties/featured', 0.8, 'daily'),
    make('/properties/new-listings', 0.8, 'daily'),
    make('/properties/for-sale', 0.8, 'daily'),
    make('/properties/for-rent', 0.8, 'daily'),
    make('/properties/luxury', 0.8, 'weekly'),
    make('/properties/commercial', 0.8, 'weekly'),
    make('/properties/open-houses', 0.8, 'daily'),
    make('/properties', 0.9, 'daily'),
    make('/cities', 0.8, 'weekly'),
    // Services & funnels
    make('/buyers', 0.9, 'weekly'),
    make('/buyers/guide', 0.7, 'monthly'),
    make('/buyers/mortgage-calculator', 0.7, 'monthly'),
    make('/buyers/affordability-calculator', 0.7, 'monthly'),
    make('/buyers/first-time', 0.7, 'monthly'),
    make('/buyers/get-started', 0.7, 'monthly'),
    make('/buyers/request-agent', 0.7, 'monthly'),
    make('/buyers/closing-cost-calculator', 0.7, 'monthly'),
    make('/buyers/pre-approval', 0.7, 'monthly'),
    make('/buyers/relocation', 0.6, 'monthly'),
    make('/sellers', 0.9, 'weekly'),
    make('/sellers/home-valuation', 0.8, 'monthly'),
    make('/sellers/selling-guide', 0.7, 'monthly'),
    make('/sellers/net-proceeds-calculator', 0.7, 'monthly'),
    make('/sellers/get-started', 0.7, 'monthly'),
    make('/sellers/request-valuation', 0.7, 'monthly'),
    make('/sellers/list-your-property', 0.7, 'monthly'),
    make('/sellers/marketing-plan', 0.6, 'monthly'),
    make('/sellers/prepare-to-sell', 0.6, 'monthly'),
    make('/investors', 0.9, 'weekly'),
    make('/investors/deals', 0.8, 'weekly'),
    make('/investors/deal-analyzer', 0.7, 'monthly'),
    make('/investors/roi-calculator', 0.7, 'monthly'),
    make('/investors/get-started', 0.7, 'monthly'),
    make('/investors/buy-box', 0.7, 'monthly'),
    make('/investors/cap-rate-calculator', 0.7, 'monthly'),
    make('/investors/cash-flow-calculator', 0.7, 'monthly'),
    make('/investors/flip-calculator', 0.7, 'monthly'),
    make('/investors/rental-calculator', 0.7, 'monthly'),
    make('/investors/market-reports', 0.6, 'monthly'),
    make('/investors/inquiry', 0.6, 'monthly'),
    make('/wholesalers', 0.8, 'weekly'),
    make('/wholesalers/submit-deal', 0.7, 'monthly'),
    make('/wholesalers/get-started', 0.7, 'monthly'),
    make('/wholesalers/deals', 0.7, 'monthly'),
    make('/wholesalers/buyer-list', 0.7, 'monthly'),
    make('/wholesalers/assignment-calculator', 0.7, 'monthly'),
    make('/wholesalers/guide', 0.6, 'monthly'),
    make('/wholesalers/inquiry', 0.6, 'monthly'),
    // Professionals & partners
    make('/realtors', 0.8, 'weekly'),
    make('/realtors/join', 0.8, 'monthly'),
    make('/realtors/benefits', 0.7, 'monthly'),
    make('/realtors/training', 0.6, 'monthly'),
    make('/realtors/resources', 0.6, 'monthly'),
    make('/realtors/commission-plans', 0.6, 'monthly'),
    make('/realtors/agent-directory', 0.7, 'monthly'),
    make('/agents', 0.8, 'weekly'),
    make('/agents/apply', 0.7, 'monthly'),
    make('/agents/benefits', 0.6, 'monthly'),
    make('/agents/training', 0.6, 'monthly'),
    make('/agents/resources', 0.6, 'monthly'),
    make('/brokerages', 0.7, 'monthly'),
    make('/brokerages/join', 0.6, 'monthly'),
    make('/brokerages/white-label', 0.6, 'monthly'),
    make('/lenders', 0.7, 'monthly'),
    make('/lenders/join', 0.6, 'monthly'),
    make('/lenders/referrals', 0.6, 'monthly'),
    make('/title-companies', 0.7, 'monthly'),
    make('/title-companies/join', 0.6, 'monthly'),
    make('/property-managers', 0.7, 'monthly'),
    make('/property-managers/join', 0.6, 'monthly'),
    make('/partners', 0.6, 'monthly'),
    make('/partners/affiliate', 0.5, 'monthly'),
    make('/partners/integrations', 0.5, 'monthly'),
    // Legal
    make('/privacy', 0.3, 'yearly'),
    make('/terms', 0.3, 'yearly'),
    make('/cookie-policy', 0.3, 'yearly'),
    make('/accessibility', 0.3, 'yearly'),
  ];

  const cities = [
    // US Top 50
    'new-york-city', 'los-angeles', 'chicago', 'houston', 'phoenix',
    'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose',
    'austin', 'jacksonville', 'fort-worth', 'columbus', 'charlotte',
    'indianapolis', 'san-francisco', 'seattle', 'denver', 'washington',
    'nashville', 'oklahoma-city', 'el-paso', 'boston', 'portland',
    'las-vegas', 'memphis', 'louisville', 'baltimore', 'milwaukee',
    'albuquerque', 'tucson', 'fresno', 'sacramento', 'mesa',
    'kansas-city', 'atlanta', 'omaha', 'colorado-springs', 'raleigh',
    'long-beach', 'virginia-beach', 'miami', 'oakland', 'minneapolis',
    'tulsa', 'tampa', 'arlington', 'new-orleans', 'wichita',
    // Canada Top 10
    'toronto', 'vancouver', 'montreal', 'calgary', 'edmonton',
    'ottawa', 'winnipeg', 'quebec-city', 'hamilton', 'kitchener',
  ];

  const cityPages = cities.map(city => ({
    url: `${BASE_URL}/cities/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const [blogs, seoPages] = await Promise.all([fetchBlogs(), fetchSeoPages()]);

  const blogPages = blogs.map((blog: any) => ({
    url: `${BASE_URL}/blog/${blog.slug}`,
    lastModified: new Date(blog.updated_at || blog.published_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const seoLandingPages = seoPages.map((page: any) => ({
    url: `${BASE_URL}/${page.slug || 'pages/' + page.id}`,
    lastModified: new Date(page.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...blogPages, ...seoLandingPages];
}
