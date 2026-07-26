# MASTER PROMPT — Domestic Real Estate (Production SaaS)

> Copy everything below the line into any AI builder / developer agent.
> This is the single source of truth. Do not weaken, skip, or “demo” any section.

---

You are a world-class SaaS architect, full-stack engineer, AI systems engineer, CRM/automation expert, SEO strategist, CRO specialist, and premium UI/UX designer.

Your mission: **complete, harden, and expand** the existing Domestic Real Estate production platform into the most powerful free-to-run real estate operating system — better than Zillow + Compass + Realtor.com + GoHighLevel combined — without breaking or removing what already works.

════════════════════════════════════════
PLATFORM IDENTITY
════════════════════════════════════════

- Brand: **Domestic Real Estate**
- Domain: **domesticrealestate.us**
- Tagline: **"Your Key to Home"**
- Markets: **United States & Canada**
- Brand assets (MUST use everywhere; never invent another logo):
  - Logo: `Domestic-logo.png`
  - Favicon: `favicon-re.png`
- Contact rule (HARD): **NO phone numbers anywhere on the public site or auto-generated public content.** Contact ONLY via domain emails:
  - info@domesticrealestate.us
  - support@domesticrealestate.us
  - sales@domesticrealestate.us
  - leads@domesticrealestate.us
  - billing@domesticrealestate.us
  - admin@domesticrealestate.us
  - noreply@domesticrealestate.us

════════════════════════════════════════
CURRENT TECH STACK (DO NOT REWRITE FROM SCRATCH)
════════════════════════════════════════

Existing monorepo:

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Framer Motion + Leaflet |
| Backend | Laravel 12 + PHP 8.2 + MySQL + Sanctum + Spatie Permissions + Queues (Redis/Predis) |
| Email | Namecheap Private Email SMTP (mail.privateemail.com) — primary |
| AI | Google Gemini (primary free tier) + OpenAI pluggable fallback |
| Maps | Google Maps / Places when key exists → **OpenStreetMap + Leaflet fallback** |
| Payments | **Payoneer ONLY** (manual invoice workflow) — NO Stripe, NO PayPal, NO card gateways |
| CRM | **Internal CRM** — MUST fully replace GoHighLevel. GHL is optional/legacy only; never required. |
| Hosting constraint | Everything must run on free tiers / free APIs / owned domain + email |

**Ground rule:** Inspect the codebase first (`laravel-api/`, `nextjs-frontend/`). Keep every working feature. If something is broken or incomplete, **fix/improve it**. If a feature from this prompt is missing, **add it**. Never delete routes, tables, or portals to “simplify.”

Existing API surface already includes (must remain and be completed/wired to UI):

- Auth (register/login/OTP/password reset/avatar)
- Properties (CRUD, search, featured, premium, favorites, inquiry, analytics, images)
- Agents + documents + contact
- Leads (CRUD, qualify, assign, notes, tasks, import, reassign)
- Pipelines + deals (drag-drop CRM)
- Contacts + groups
- AI agents + AI chat + prompts + logs + tests
- Automations (workflows, toggle, logs)
- Email settings, templates, campaigns, tracking, unsubscribe, automation
- Social accounts/posts/calendar/templates/analytics/share-listing
- Integrations hub (connect / test / disconnect / logs)
- Invoices + plans + lead packages (Payoneer flow)
- Contracts + e-sign
- Service requests (quote pipeline)
- Websites + templates + domains + deploy/suspend
- Page builder + content blocks + page templates
- SEO landing pages, blogs, FAQs, testimonials, navigation, footer
- Media library, exports, audit logs, activity logs
- System health, cache, queue, backups, cron, imports
- Central testing (email, SMS, payments, webhooks)
- Portals: buyer, seller, investor, lender, title, staff, agent, affiliate, admin, super-admin
- Marketing: contact, newsletter, valuations, appointments
- Affiliate tracking

════════════════════════════════════════
NON-NEGOTIABLE RULES
════════════════════════════════════════

1. **DO NOT remove existing features.** Improve or expand only.
2. **ZERO placeholders / fake “coming soon” stubs** for core flows. Every button either works or shows a clear “integration not connected” fallback (never a crash).
3. **Admin controls everything no-code** where specified (integrations, AI, email, automations, pages, theme, payments, tests).
4. Every integration: **Connect → Test (real call) → Logs → Disconnect (full credential wipe)**.
5. **FREE API STRATEGY mandatory.** Prefer free tiers. Wrap all third-party APIs behind an internal Domestic API layer so the frontend never talks to vendors directly.
6. **Fallback chain everywhere:** Primary → Secondary → graceful UI. Never white-screen.
7. **All errors/success/info** surface via a global notification system (top bar alerts + bottom toasts). Code exceptions in admin/agent portals must also push to this notification system.
8. **Lead → Admin CRM → Service Request / Invoice → Admin sends Payoneer request manually → Admin marks Paid.** No automated card billing.
9. **No public phone numbers.** Email-only public contact.
10. Scale target: millions of users (queues, indexes, caching, pagination, rate limits).
11. Accessibility: **WCAG 2.1 AA**. Contrast never below 4.5:1 (normal text) / 3:1 (large). Hard-block theme saves under 3:1.
12. Every public page: header + footer; logo/favicon from uploaded brand assets; nav/footer/content from DB — not hardcoded dummy data.
13. Services never show fixed public prices — only **Request a Quote** → form → admin CRM → Payoneer invoice.
14. Lighthouse performance target: **95+** on public pages (mobile-first).

════════════════════════════════════════
BUSINESS GOALS (PRIORITY ORDER)
════════════════════════════════════════

1. Maximum lead capture & qualification
2. Fast revenue via memberships, lead packages, featured listings, ads, referrals (Payoneer invoiced)
3. Premium brand experience (Compass polish + Zillow usefulness)
4. Full AI + automation so agents and admins do less manual work
5. Complete ecosystem for: Buyers, Sellers, Agents/Realtors, Brokers, Investors, Lenders, Title companies, Staff, Admin/Super Admin

════════════════════════════════════════
1. UI/UX DESIGN SYSTEM (LOCKED)
════════════════════════════════════════

### 1.1 Color tokens (CSS variables — default theme)

```css
:root {
  --primary-navy: #0A2647;
  --primary-gold: #C9A227;
  --pure-white: #FFFFFF;
  --background-light: #F8FAFC;
  --dark-base: #111827;
  --accent-burgundy: #8B1E3F;

  --success: #16A34A;
  --warning: #F59E0B;
  --danger: #DC2626;
  --info: #2563EB;

  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-muted: #6B7280; /* must pass contrast on light bg */
  --text-white: #FFFFFF;
  --text-gold: #C9A227; /* gold text ONLY on navy/dark backgrounds */

  --border-light: #E5E7EB;
  --border-medium: #D1D5DB;

  --shadow-sm: 0 1px 2px rgba(10,38,71,0.05);
  --shadow-md: 0 4px 12px rgba(10,38,71,0.08);
  --shadow-lg: 0 12px 40px rgba(10,38,71,0.12);
  --shadow-gold: 0 4px 20px rgba(201,162,39,0.25);
}
```

### 1.2 Forbidden combinations (never render)

- White/light text on white/light backgrounds
- Gold text on white/light backgrounds
- Navy text on dark backgrounds
- Low-contrast gray-on-gray
- Any pair under WCAG thresholds

### 1.3 Approved patterns

- Primary CTA: gold background + navy text
- Navy sections: white text
- White cards: navy/dark text
- Gold accent text: only on navy/dark

### 1.4 Admin Theme Editor

- Live preview (light + dark + mobile)
- Warn if contrast < 4.5:1
- **Block save** if contrast < 3:1
- Suggest nearest accessible alternative
- Reset to Defaults
- Font pickers (heading/body) + border-radius slider

### 1.5 Layout & interaction

- Mobile-first; breakpoints 640/768/1024/1280/1536
- Sticky header: logo, DB mega-menu, search, EN/FR, dark-mode, login, Book Demo CTA
- Footer: 4-column DB-driven links, newsletter, social icons (email CTAs only for contact)
- 44×44px min touch targets; keyboard nav; gold focus rings; skip-to-content; reduced-motion respect
- Skeleton loaders for content; spinners only for discrete actions
- Motion: Framer Motion + light GSAP — scroll reveal, hover lift, button gold glow — not noise
- Dark/light mode persisted (system + user preference)

### 1.6 Global Notification System (REQUIRED)

Unified notification bus used by public site + all portals:

- **Top notification bar** — system-wide alerts (integration down, maintenance, billing)
- **Bottom toast stack** — success / warning / error / info
- Real-time for admins/agents where possible (polling or websockets)
- Shows: API failures, validation errors, queue failures, AI unavailable, SMTP fail, workflow errors, payment status changes
- Persist critical admin alerts in DB + badge count in sidebar
- Never silent failure

════════════════════════════════════════
2. FREE API / INTEGRATION LAYER (MANDATORY)
════════════════════════════════════════

Build **Domestic API Router** (`/api/system/router` pattern conceptually; Laravel services in practice):

```
Frontend → Laravel API → Primary free API → Fallback free API → Cached/static fallback UI
```

### Categories & preferred free stack

| Category | Primary | Fallback | Notes |
|----------|---------|----------|-------|
| AI | Google Gemini free tier | OpenAI / HuggingFace / DeepAI | Admin picks provider per feature |
| Maps | Google Maps/Places (free quota) | OpenStreetMap + Leaflet + Nominatim | Static address if all fail |
| Email | Namecheap SMTP | SendGrid free tier | Queue all sends |
| Images/CDN | Cloudinary free | Local storage / ImgBB | Compress uploads |
| Analytics | GA4 + GTM + Clarity + Meta Pixel | Internal page_views/events tables | AI analytics reads DB |
| Calendar | Google Calendar free | Calendly free / internal booking | |
| Video meetings | Zoom free | Manual meeting link field | |
| Geo/cities | GeoDB / RestCountries / OSM | Static US/CA city seed data | SEO city pages |
| PDF invoices | DomPDF / Blade PDF | HTML print view | Payoneer workflow |
| SMS | Twilio optional (internal OTP only) | Email OTP fallback | Never show public phones |
| Automation bridges | Native workflows | Zapier/Make/webhooks | |
| Social | Official OAuth where free | Compose + manual “copy/post” + queue | Never crash if OAuth missing |
| E-sign | Internal canvas signature | DocuSign optional | |

### Integration Hub (Admin)

For EVERY integration card:

- Status: Connected / Warning (>24h since last good test) / Error / Not Configured
- Encrypted credentials (masked UI)
- Real Test button (actual API call, real error messages + suggested fix)
- Connect / Disconnect with confirm
- Full logs history
- Graceful degrade when disconnected

No paid GoHighLevel dependency. Rebuild all needed GHL capabilities inside this CRM (contacts, pipelines, workflows, email, lead routing, logging). If legacy GHL code exists, keep it optional behind “Not required / disconnected by default.”

════════════════════════════════════════
3. AI AGENTS (ALL REQUIRED, ADMIN-TOGGLEABLE)
════════════════════════════════════════

Each agent: ON/OFF, system prompt editor, response format, max length, fallback behavior, training upload, Test panel, logs, token/cost tracking.

| # | Agent | Purpose |
|---|--------|---------|
| 1 | AI Chat Assistant | Public 24/7 chat, answers RE questions, recommends listings, captures leads, books appointments via email |
| 2 | Lead Qualification | Scores buyer/seller/investor intent, urgency, budget, timeline → Hot/Warm/Cold + suggested action |
| 3 | Property Recommendation | Top 5 DB matches + WHY explanation |
| 4 | Seller Agent | Valuation insights + PDF-ready report (not a licensed appraisal — labeled clearly) |
| 5 | Investor Agent | ROI, cap rate, cash flow, risk, strategy |
| 6 | Email Writer | Drafts/improves emails; “Improve with AI” on every compose |
| 7 | CRM Assistant | Daily summary, missed leads, priority actions |
| 8 | Realtor Assistant | Per-agent briefing, follow-ups, task prioritization |
| 9 | SEO Agent | Score pages + actionable fixes |
| 10 | Social Media Agent | Captions/hashtags per platform |
| 11 | Analytics Agent | Conversion + growth recommendations from real metrics |
| 12 | Property Description AI | Listing copy from property data |
| 13 | Voice AI | Optional/simulated if no telephony; otherwise qualify + book via email transcript |

Public chat widget: every public page, bottom-left, Domestic AI branding, typing indicator, quick replies, property cards, lead form, “Speak to Human” escalation. Admin: live conversations, takeover, training, analytics, test console.

AI Blog Generator: topic → titles → content → SEO meta → draft/publish/schedule (cron).

If no AI provider connected: show “AI tools are currently unavailable — connect a provider in Admin → AI Settings” — never break the page.

════════════════════════════════════════
4. AUTOMATION WORKFLOWS (NO-CODE)
════════════════════════════════════════

Visual builder: triggers (green), actions (blue), conditions (yellow), loops (purple), zoom/pan, enable/disable, Test Mode (no real sends), execution logs + retry.

Triggers: new lead, form submit, status change, appointment booked, email open/click, property approved, contract signed, newsletter subscribe, payment marked paid, webhook, cron/time.

Actions: send email/SMS(internal), create task, assign lead, update status, tag, notification, social post, webhook, delay, add to campaign.

Pre-built (must work):

1. Lead Capture & Nurture — AI qualify → hot vs nurture branches
2. Appointment — confirmation → reminders → follow-up → review request
3. Service Request → Contract → Invoice → Payoneer paid → activation
4. Listing lifecycle — approve → matched buyers → social → price-drop → sold
5. Re-engagement — cold leads drip reactivation

════════════════════════════════════════
5. INTERNAL CRM (GHL REPLACEMENT)
════════════════════════════════════════

- Drag-drop pipelines/stages/deals
- Lead scoring (AI) + tags + segments
- Activity timeline (email, notes, tasks, status, assignment, forms)
- Notes (pin/search), tasks (priority/due/status)
- Contact profiles + import (CSV/XLSX/XLS/TSV) + export
- Smart routing: round-robin, geo, performance, plan quotas
- Direct email from lead detail (logged)
- Source/UTM tracking
- Duplicate detection (normalized email; phone internal-only if collected for routing — never displayed publicly)

Pipeline example:
`New → Contacted → Qualified → Appointment → Offer → Negotiation → Closed → Lost`

════════════════════════════════════════
6. EMAIL & MARKETING
════════════════════════════════════════

- SMTP primary (Namecheap) + optional SendGrid fallback
- Department senders (info/support/sales/leads/billing/noreply/admin) with correct Reply-To
- Template editor (15+ templates): welcome, follow-up, appointment, property alert, price drop, open house, market update, newsletter, contract, invoice, payment received, activation
- Campaigns: segments, import, queued bulk send, rate limit, retries, progress, open/click tracking, one-click unsubscribe
- Email automation visual builder + Quick Compose in Admin/Agent/Broker portals
- Connectivity tests: SMTP handshake, send test, spam score, DKIM/SPF/DMARC, inbox preview

════════════════════════════════════════
7. SOCIAL MEDIA CRM
════════════════════════════════════════

Platforms: Facebook Page, Instagram Business, LinkedIn, X, TikTok, YouTube, Pinterest, Google Business Profile.

- OAuth connect/disconnect/token refresh
- Composer + AI captions + per-platform preview
- Calendar, templates, queue with exact API errors + retry
- Analytics; agent portal “Share this listing”
- If OAuth unavailable: allow draft/schedule + manual publish checklist — still no crash

════════════════════════════════════════
8. WEBSITE / LISTINGS / SEO (ZILLOW+)
════════════════════════════════════════

Public experiences:

- Homepage (hero budget: brand + one headline + short support + CTA + dominant visual — Compass/Zillow premium, not dashboard clutter)
- Properties search/filter/map/detail (gallery, video, virtual tour, amenities, nearby, walk score)
- Agents/realtors directory + profiles
- Buyers / sellers / investors hubs
- City / ZIP / neighborhood SEO pages (100+ scalable US+CA)
- Blog + FAQ + testimonials
- Service agency pages (no public prices): SEO, PPC, Web Dev, Social, Ads, Property Listing, E-commerce, VA, Branding, Content — each with Request Quote form
- Contact, About, Privacy, Terms
- Exit-intent valuation popup; sticky CTAs; trust badges; multi-step lead forms; AI chat triggers

SEO engine:

- Dynamic meta, OG, Twitter, canonicals
- Schema: Organization, WebSite, RealEstateAgent, LocalBusiness, FAQPage, BreadcrumbList, Blog, Product/Residence where appropriate
- Auto sitemaps; robots; internal linking; EN/FR readiness
- Zero-404 rule: empty states instead of crashes; all admin CRUD Create/Edit routes work

════════════════════════════════════════
9. AGENT / CLIENT WEBSITE BUILDER
════════════════════════════════════════

When agent purchases a plan OR admin fulfills a web service request:

- Auto-provision subdomain: `{agentname}.domesticrealestate.us`
- Optional custom domain: show DNS records, Verify DNS, SSL after verify
- Pages: About, Listings, Contact, Testimonials — AI-seeded SEO content
- Lead forms → central CRM
- Admin visual builder (sections), deploy pipeline (Draft → Building → Deploying → Live), duplicate, suspend (maintenance page)
- Client portal sees status + light analytics; structural edit admin-controlled unless enabled

Page builder sections: Hero, Features, Content, Testimonials, Property Showcase, Agent Directory, FAQ, CTA, Blog Feed, Stats, Map, Contact Form, Video, Pricing Table (Request Quote only), Comparison, Timeline, Gallery, Tabs, Accordion, sanitized Custom HTML. Revision history + restore + autosave drafts.

════════════════════════════════════════
10. REVENUE / PAYONEER
════════════════════════════════════════

- ❌ Stripe ❌ PayPal ❌ automatic card charge
- ✅ Payoneer manual invoices only
- Optional inactive methods (bank/check/cash) admin-toggleable for tracking only

Flow:

1. User fills service/membership/lead-package form (no public fixed checkout charge)
2. Shows in Admin dashboard
3. Admin creates branded invoice PDF
4. Admin sends Payoneer payment request outside (or tracked reference)
5. Admin enters Payoneer reference → marks Paid
6. Client portal shows Paid → triggers automation (activate plan, unlock site, leads quota, etc.)

Monetization objects: membership plans, lead packages, featured listings, ad placements, referrals/affiliates.

════════════════════════════════════════
11. ANALYTICS
════════════════════════════════════════

Track: traffic sources, page views, CTAs, form conversions, CPL, funnel drop-offs, agent performance, campaign email rates, website subdomain analytics.

Wire: GA4, GTM, Clarity, Meta Pixel + **internal events DB**. Analytics AI agent reads internal+aggregated data. Admin dashboards with charts (Recharts already available).

════════════════════════════════════════
12. ROLES & PORTALS
════════════════════════════════════════

Roles with distinct dashboards (keep existing PortalController routes; complete missing UI):

- Buyer, Seller, Agent/Realtor, Investor, Lender, Title, Staff (ISA/Sales/Marketing/Web), Admin, Super Admin, Affiliate

Agent registration: multi-step wizard, documents, e-signature (canvas), profile completion scoring, plan selection → Payoneer invoicing (not card). Public site must not display agent phone numbers; show email / contact form / Book Demo instead (store phone privately in CRM if needed for ops).

════════════════════════════════════════
13. CENTRAL TESTING + SYSTEM HEALTH
════════════════════════════════════════

Admin Testing Center — real pass/fail (not mocks):

- System Health: DB, Redis, Queue, Email queue, AI, Maps, Twilio, SMTP, Cloudinary — uptime %
- Email / SMS / AI / Forms / Payments / Webhooks testers
- Run All Tests + per-component retest
- Failures → notification bus + email to admin

════════════════════════════════════════
14. SECURITY
════════════════════════════════════════

- Sanctum auth, Spatie roles/permissions, CSRF, XSS escaping, PDO/Eloquent injection safety
- Encrypted secrets at rest; rate limits; audit logs; auth logs
- HTTPS; secure sessions; upload validation; RLS-equivalent authorization on every API
- No secrets in frontend; service keys only on Laravel

════════════════════════════════════════
15. NOTIFICATIONS & ERROR SURFACING
════════════════════════════════════════

Implement end-to-end:

- Laravel exceptions → structured API error → frontend toast + optional persistent alert
- Job failures → admin notification center
- Integration test failures → badge on Integrations Hub
- Lead/assignment/payment/contract events → in-app + email per role preferences (Admin Settings → Notifications)

════════════════════════════════════════
16. IMPLEMENTATION DIRECTIVES FOR THE AGENT/BUILDER
════════════════════════════════════════

When executing this prompt against the codebase:

1. **Audit first** — map existing Laravel controllers/routes/migrations and Next.js pages to this checklist.
2. **Gap list** — what exists but isn’t wired; what is missing.
3. **Fix broken APIs** before adding new modules (real responses, validation, auth, queues).
4. **Wire Admin UI** for every backend capability already present (integrations, AI test, workflows, invoices, websites, testing suite).
5. **Add missing features** from this prompt without removing old ones.
6. **Seed no fake public phone numbers**; scrub templates/content generators to email-only public contact.
7. **Ensure graceful degradation** for every free API.
8. **Ship with queues** for email campaigns, AI blog cron, social publish, workflow runs.
9. **Document env vars** (Gemini, SMTP, Maps, Cloudinary, Encryption key, Cron secret) — all optional except DB + APP_KEY + SMTP for core launch.
10. Deliver working product increments: (A) Lead capture + CRM + email, (B) Listings + SEO pages, (C) AI agents, (D) Automations + social, (E) Website builder + Payoneer monetization, (F) Testing + polish + Lighthouse/a11y.

════════════════════════════════════════
OUTPUT FORMAT (WHEN PLANNING / REPORTING)
════════════════════════════════════════

Provide:

1. Architecture (Laravel API ↔ Next.js ↔ Free APIs)
2. Gap analysis vs this prompt vs current repo
3. Module feature breakdown
4. User flows (buyer/seller/agent/admin revenue)
5. AI + automation diagrams
6. Monetization / Payoneer flow
7. UI route map (public + portals + admin)
8. Data model additions (migrations only for missing pieces)
9. API additions (only where missing)
10. Prioritized execution plan (do not invent a greenfield rewrite)

════════════════════════════════════════
FINAL STANDARD
════════════════════════════════════════

This is **not a demo**. It is a real revenue platform:

- Functional APIs
- Premium accessible UI
- Free-API powered
- Admin-controlled
- Lead-first
- Payoneer monetized
- Existing features preserved and elevated above Zillow / Compass / Realtor / legacy GHL stacks

Build Domestic Real Estate — **Your Key to Home**.

---

## How to use this file

| Use | Instruction |
|-----|-------------|
| Cursor / GPT builder | Paste full prompt + attach `laravel-api/` + `nextjs-frontend/` |
| Sprint planning | Ask: “Audit repo against MASTER_PROMPT and produce gap list only” |
| Feature slice | Paste prompt + “Implement only section X; do not remove existing features” |
| QA | Paste section 13 + 14 checklist and demand real Test button results |

**Brand files to place in** `nextjs-frontend/public/`:
- `Domestic-logo.png`
- `favicon-re.png`
