const http = require('http');

const API_BASE = 'http://127.0.0.1:8001/api';
const FRONTEND_BASE = 'http://127.0.0.1:3001';

// Static routes mentioned in instructions or discovered in directories
const STATIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/properties',
  '/agents',
  '/blog',
  '/login',
  '/register',
  '/accessibility',
  '/privacy',
  '/terms',
  '/cookie-policy',
  '/faq',
  '/sitemap',
  '/buyers',
  '/sellers',
  '/investors'
];

// Listed slugs for /cities/[city] from app code
const CITY_SLUGS = [
  "new-york-city", "los-angeles", "chicago", "houston", "phoenix", "philadelphia", "san-antonio", "san-diego", "dallas", "san-jose",
  "austin", "jacksonville", "fort-worth", "columbus", "charlotte", "indianapolis", "san-francisco", "seattle", "denver", "washington",
  "nashville", "oklahoma-city", "el-paso", "boston", "portland", "las-vegas", "memphis", "louisville", "baltimore", "milwaukee",
  "albuquerque", "tucson", "fresno", "sacramento", "mesa", "kansas-city", "atlanta", "omaha", "colorado-springs", "raleigh",
  "long-beach", "virginia-beach", "miami", "oakland", "minneapolis", "tulsa", "tampa", "arlington", "new-orleans", "wichita",
  "toronto", "vancouver", "montreal", "calgary", "edmonton", "ottawa", "winnipeg", "quebec-city", "hamilton", "kitchener",
];

async function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkFrontendRoute(path) {
  return new Promise((resolve) => {
    const url = `${FRONTEND_BASE}${path}`;
    http.get(url, { headers: { 'Accept': 'text/html' } }, (res) => {
      let data = '';
      // Read data so the connection closes correctly
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          title: extractTitle(data),
          canonical: extractCanonical(data),
          bodyExcerpt: data.slice(0, 1000)
        });
      });
    }).on('error', (err) => {
      resolve({
        path,
        status: 0,
        error: err.message
      });
    });
  });
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1].trim() : '(No title tag found)';
}

function extractCanonical(html) {
  const match = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i) || html.match(/<link[^>]*href="([^"]*)"[^>]*rel="canonical"/i);
  return match ? match[1].trim() : '(No canonical link found)';
}

async function main() {
  console.log('--- STARTING PLATFORM ROUTE AUDIT ---');
  console.log(`Connecting to backend: ${API_BASE}`);
  console.log(`Connecting to frontend: ${FRONTEND_BASE}`);

  const auditReport = {
    working: [],
    potentialIssues: [],
    broken: []
  };

  // 1. Fetch backend objects
  console.log('\n--- FETCHING DATA FROM BACKEND API ---');
  let properties = [];
  let agents = [];
  let blogs = [];
  let categoriesSet = new Set();

  try {
    const propRes = await httpGet(`${API_BASE}/properties?per_page=100`);
    if (propRes.status === 200) {
      const data = JSON.parse(propRes.body);
      properties = Array.isArray(data) ? data : data.data || [];
      console.log(`Successfully fetched ${properties.length} properties.`);
    } else {
      console.error(`Failed to fetch properties, code: ${propRes.status}`);
    }
  } catch (e) {
    console.error(`Failed to connect to backend for properties: ${e.message}`);
  }

  try {
    const agentRes = await httpGet(`${API_BASE}/agents?per_page=100`);
    if (agentRes.status === 200) {
      const data = JSON.parse(agentRes.body);
      agents = Array.isArray(data) ? data : data.data || [];
      console.log(`Successfully fetched ${agents.length} agent profiles.`);
    } else {
      console.error(`Failed to fetch agents, code: ${agentRes.status}`);
    }
  } catch (e) {
    console.error(`Failed to connect to backend for agents: ${e.message}`);
  }

  try {
    const blogRes = await httpGet(`${API_BASE}/blogs?per_page=100`);
    if (blogRes.status === 200) {
      const data = JSON.parse(blogRes.body);
      blogs = Array.isArray(data) ? data : data.data || [];
      console.log(`Successfully fetched ${blogs.length} blog posts.`);
      blogs.forEach(b => {
        if (b.category && b.category.slug) {
          categoriesSet.add(b.category.slug);
        }
      });
    } else {
      console.error(`Failed to fetch blogs, code: ${blogRes.status}`);
    }
  } catch (e) {
    console.error(`Failed to connect to backend for blogs: ${e.message}`);
  }

  // 2. Build route lists to audit
  const routesToAudit = [...STATIC_ROUTES];

  // Dynamic city routes
  CITY_SLUGS.forEach(c => {
    routesToAudit.push(`/cities/${c}`);
  });

  // Dynamic property detail pages
  properties.forEach(p => {
    routesToAudit.push(`/properties/${p.slug}`);
  });

  // Dynamic agent detail pages
  agents.forEach(a => {
    routesToAudit.push(`/agents/${a.slug}`);
  });

  // Dynamic blog detail pages
  blogs.forEach(b => {
    routesToAudit.push(`/blog/${b.slug}`);
  });

  // Dynamic category list pages
  Array.from(categoriesSet).forEach(cat => {
    routesToAudit.push(`/blog/category/${cat}`);
  });

  console.log(`\nReady to audit ${routesToAudit.length} unique routes...`);

  // 3. Request each route on the NextJS frontend
  for (const path of routesToAudit) {
    process.stdout.write(`Auditing ${path}... `);
    const res = await checkFrontendRoute(path);
    if (res.status === 200) {
      console.log(`✅ HTTP 200 - "${res.title}"`);
      auditReport.working.push({
        path,
        status: res.status,
        title: res.title,
        canonical: res.canonical
      });
    } else if (res.status === 404) {
      console.log(`❌ HTTP 404!`);
      auditReport.broken.push({
        path,
        status: res.status,
        reason: 'Route returned 404 in frontend render',
        title: res.title
      });
    } else {
      console.log(`⚠️ HTTP ${res.status || 'ERROR'}!`);
      auditReport.potentialIssues.push({
        path,
        status: res.status,
        reason: res.error || `HTTP ${res.status} returned by frontend render`,
        title: res.title || 'Error Page'
      });
    }
  }

  // 4. Summarize and check for canonical and dynamic SEO issues
  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`✅ Working routes: ${auditReport.working.length}`);
  console.log(`⚠️ Potential issues: ${auditReport.potentialIssues.length}`);
  console.log(`❌ Broken routes (404/Failures): ${auditReport.broken.length}`);

  console.log('\nDetailed Report:');
  console.log(JSON.stringify(auditReport, null, 2));
}

main().catch(console.error);
