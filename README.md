# Domestic Real Estate — Enterprise AI-Powered Real Estate & Lead CRM Platform

> **Version:** 2.0.0 Enterprise  
> **Architecture:** Next.js 16 App Router (Frontend) + Laravel 11 REST API (Backend) + MySQL  
> **Core Purpose:** Self-owned Real Estate CRM, Pay-Per-Lead (PPL) Marketplace, AI Agent Orchestration, White-Label CMS, and Geo-Gated Portal.

---

## 📋 Table of Contents
1. [Platform Overview](#-platform-overview)
2. [How the Platform Works](#-how-the-platform-works)
3. [Role-Based Access Control (RBAC) & Roles Matrix](#-role-based-access-control-rbac--roles-matrix)
    - [Detailed Role Breakdown](#detailed-role-breakdown)
    - [Role Access Matrix Table](#role-access-matrix-table)
4. [Core Platform Features & Engines](#-core-platform-features--engines)
    - [1. Pay-Per-Lead (PPL) & Pay-Per-Close Marketplace](#1-pay-per-lead-ppl--pay-per-close-marketplace)
    - [2. AI Orchestration & Specialized AI Agents](#2-ai-orchestration--specialized-ai-agents)
    - [3. Lead Capture, Scoring & CRM Pipelines](#3-lead-capture-scoring--crm-pipelines)
    - [4. Geo Access Control Engine](#4-geo-access-control-engine)
    - [5. Email & Social CRM Automation](#5-email--social-crm-automation)
    - [6. Financials, Invoicing & Contracts](#6-financials-invoicing--contracts)
5. [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
6. [Installation & Setup Guide](#-installation--setup-guide)
    - [Prerequisites](#prerequisites)
    - [Backend Setup (`laravel-api`)](#backend-setup-laravel-api)
    - [Frontend Setup (`nextjs-frontend`)](#frontend-setup-nextjs-frontend)
    - [Configuring Geo Access Control Secret](#configuring-geo-access-control-secret)
7. [API Route & Portal Catalog](#-api-route--portal-catalog)
8. [Background Queues & Scheduled Tasks](#-background-queues--scheduled-tasks)
9. [Verification & Maintenance Commands](#-verification--maintenance-commands)

---

## 🚀 Platform Overview

**Domestic Real Estate** is an end-to-end real estate ecosystem engineered for property listings, lead generation, automated marketing, and AI-driven client nurturing across the United States and Canada.

The platform eliminates reliance on third-party SaaS tools by unifying:
- **A multi-role user portal** serving Buyers, Sellers, Investors, Agents, Brokers, Lenders, Title Companies, Vendors, Staff, and Admins.
- **An exclusive Pay-Per-Lead (PPL) & Pay-Per-Close (PPC) Marketplace** allowing agents and brokers to browse, reserve, and purchase verified seller/buyer leads.
- **A 13-agent AI orchestration hub** powered by Google Gemini and OpenAI for lead qualification, property matching, automated email drafting, SEO copywriting, and investment analytics.
- **A drag-and-drop Kanban CRM** with automated 6-dimension lead scoring, activity timelines, deal pipelines, and automated follow-ups.
- **A high-security Geo Access Control System** running at the Next.js Edge proxy and Laravel middleware layer to enforce regional access rules, block VPN/proxy/Tor exit nodes, and whitelist authorized connections.

---

## 🛠️ How the Platform Works

```
                        ┌─────────────────────────────────────────┐
                        │             VISITOR TRAFFIC             │
                        └────────────────────┬────────────────────┘
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │      Next.js 16 Edge Proxy Guard        │
                        │      (Geo Check & Tor/VPN Filtering)    │
                        └────────────────────┬────────────────────┘
                                             │
                        ┌────────────────────┴────────────────────┐
                        │                                         │
                        ▼                                         ▼
            ┌──────────────────────┐                  ┌──────────────────────┐
            │   Public Website &   │                  │   Universal Forms    │
            │   Property Portal    │                  │  & AI Chat Widget    │
            └───────────┬──────────┘                  └───────────┬──────────┘
                        │                                         │
                        └────────────────────┬────────────────────┘
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │      Laravel 11 REST API Engine         │
                        │    (Sanctum Auth & Role Authorization)  │
                        └────────────────────┬────────────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      ▼                  ▼                   ▼                   ▼                  ▼
┌───────────┐      ┌───────────┐       ┌───────────┐       ┌───────────┐      ┌───────────┐
│ PPL Lead  │      │ AI Agent  │       │ CRM Kanban│       │ Role      │      │ Billing & │
│ Marketplace      │ Engine    │       │ Pipelines │       │ Portals   │      │ Contracts │
└───────────┘      └───────────┘       └───────────┘       └───────────┘      └───────────┘
```

1. **Intake & Edge Security**: Every visitor passing through the Next.js frontend is evaluated by the Edge Proxy (`src/proxy.ts`), which queries Laravel's `GeoAccessDecisionService`. Blocked countries, Tor exit nodes, and commercial VPN ASNs are restricted, while whitelisted IPs bypass checks.
2. **Lead Capture & Ingestion**: Leads enter through AI chat sessions, homepage valuation calculators, property inquiry forms, contact requests, realtor applications, or CSV bulk imports.
3. **Scoring & Pipeline Assignment**: Inbound leads are scored across 6 dimensions (budget, urgency, contact completeness, timeline, location, interaction) and automatically placed into CRM pipeline stages.
4. **Marketplace Monetization**: High-intent leads are published to the PPL Marketplace as exclusive or shared listings where Agents and Brokers can reserve, inspect anonymized details, and purchase them via automated invoice links.
5. **Role-Specific Dashboards**: Depending on authentication role, users enter tailored portals (Buyer, Seller, Investor, Agent, Broker, Lender, Title Company, Vendor, Staff, Admin, Super Admin) with customized features, messaging channels, document repositories, and analytical views.

---

## 🔐 Role-Based Access Control (RBAC) & Roles Matrix

The system defines **11 distinct user roles** (`users.role`), each tailored with dedicated frontend portal routes, backend middleware guards (`auth:sanctum`, `EnsureRole`), and granular capabilities.

### Detailed Role Breakdown

#### 1. `super_admin` (Super Administrator)
* **Target User**: Platform Owner & System Administrators.
* **Access Scope**: Full unrestricted platform privileges across backend and frontend.
* **Key Capabilities**:
  * Access to `/super-admin/dashboard` and global admin features.
  * System health monitoring, queue status, cron job execution, and cache warming/clearing.
  * Backup management (creation, restoration, download, deletion).
  * System audit log inspection, security settings, and global API configuration.
  * Geo Access Control whitelist/blacklist rule management.

#### 2. `admin` (Administrator)
* **Target User**: Operations Managers & Platform Administrators.
* **Access Scope**: Platform management, content moderation, billing, and user oversight.
* **Key Capabilities**:
  * Admin Dashboard (`/admin/dashboard`), user management (`/admin/users`), property approval workflows.
  * Pay-Per-Lead Marketplace administration (create, publish, relist, refund, assign leads).
  * Billing & Invoice generation, price quotes, contract dispatches.
  * Blog post management, media library oversight, SEO page configuration.
  * Integration hub setup and automation workflow configuration.

#### 3. `staff` (Support & Operations Staff)
* **Target User**: Internal customer support representatives and lead triage staff.
* **Access Scope**: Lead triage, customer support, task handling, and service request processing.
* **Key Capabilities**:
  * Staff Dashboard (`/staff/dashboard`) and staff task management (`/staff/dashboard/tasks`).
  * Inspection and update of assigned leads and contact records.
  * Assisting buyers and sellers with inquiry tickets and service requests.

#### 4. `broker` (Managing Broker / Brokerage Owner)
* **Target User**: Real estate brokerage owners and team leaders.
* **Access Scope**: Team management, white-label website management, brokerage lead allocation.
* **Key Capabilities**:
  * Broker Dashboard (`/broker/dashboard`) and team management (`/broker/dashboard/team`).
  * Enterprise membership plan perks: white-label website builder, custom domain linking.
  * High-volume lead package purchasing and team-wide lead redistribution.
  * Brokerage transaction monitoring and agent performance reporting.

#### 5. `agent` (Real Estate Agent / Realtor)
* **Target User**: Licensed real estate agents and listing specialists.
* **Access Scope**: Listing management, PPL Marketplace lead purchasing, CRM deals, client communications.
* **Key Capabilities**:
  * Agent Portal (`/agent/dashboard`), profile setup, document vault, stats & enquiries.
  * Listing properties (`POST /api/properties`), uploading galleries, requesting property approval.
  * Pay-Per-Lead Marketplace access: browsing, reserving, purchasing exclusive buyer/seller leads.
  * Pipeline Kanban execution (`/agent/crm` or `/dashboard/crm`), deal tracking, task automation.
  * Social CRM module: sharing listings across connected social accounts, scheduling posts.
  * Document storage & download (`/agent/documents`), client e-contract initiation.

#### 6. `buyer` (Property Homebuyer)
* **Target User**: Individual home buyers searching for residential or commercial properties.
* **Access Scope**: Personal buyer portal, saved searches, offer submissions, message channels.
* **Key Capabilities**:
  * Buyer Portal (`/buyer/dashboard`), saved property favorites, automated alert setup.
  * Viewing buyer offers (`/buyer/offers`), mortgage estimation tools (`/buyer/mortgage`).
  * Direct messaging with assigned listing agents (`/buyer/messages`).
  * Document center for purchase agreements and closing documents (`/buyer/documents`).

#### 7. `seller` (Property Home Seller)
* **Target User**: Property owners seeking home valuations and listing support.
* **Access Scope**: Property listing tracking, valuation reports, offer reviews, showing schedules.
* **Key Capabilities**:
  * Seller Portal (`/seller/dashboard`), instant AI property valuation requests (`/seller/valuations`).
  * Reviewing incoming buyer offers (`/seller/offers`) and listing activity metrics.
  * Managing showing appointments (`/seller/appointments`) and seller document vault (`/seller/documents`).

#### 8. `investor` (Real Estate Investor / Fund Manager)
* **Target User**: Residential & commercial property investors, fix-and-flip funds.
* **Access Scope**: Investment deal feeds, cap rate/ROI analytics, buy-box alerts.
* **Key Capabilities**:
  * Investor Portal (`/investor/dashboard`), buy-box criterion configuration.
  * Exclusive investment opportunity feeds (`/investor/opportunities`), deal analysis metrics.
  * Portfolio analytics (`/investor/analytics`), property alert subscriptions (`/investor/alerts`).

#### 9. `lender` (Mortgage Lender / Financial Institution)
* **Target User**: Loan officers and mortgage brokerage partners.
* **Access Scope**: Loan pre-approval applications, borrower financial verification, mortgage portal.
* **Key Capabilities**:
  * Lender Portal (`/lender/dashboard`).
  * Reviewing buyer financing requests and pre-approval documentation.
  * Communication with buyers and agents regarding loan approval milestones.

#### 10. `title_company` (Title & Escrow Closing Company)
* **Target User**: Title officers and closing attorneys.
* **Access Scope**: Escrow milestone tracking, closing document uploads, title commitments.
* **Key Capabilities**:
  * Title Portal (`/title/dashboard`).
  * Uploading title commitments, settlement statements (HUD-1/CD), and deed documents.
  * Coordinating closing schedules with buyers, sellers, and agents.

#### 11. `vendor` (Service Vendor / Contractor)
* **Target User**: Home inspectors, photographers, staging experts, repair contractors.
* **Access Scope**: Service request job intake, quote submission, work order tracking.
* **Key Capabilities**:
  * Accessing assigned service requests (`/service-requests/my`).
  * Submitting service quotes, inspection reports, and repair status updates.

---

### Role Access Matrix Table

| Platform Module / Feature Area | `super_admin` | `admin` | `staff` | `broker` | `agent` | `buyer` | `seller` | `investor` | `lender` | `title` | `vendor` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Super Admin Control & Backups** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System Logs, Queues & Health** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Geo Access Whitelist/Blacklist**| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User & Staff Account CRUD** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Property Approval & Admin CRUD** | ✅ | ✅ | 👁️ Read | 👁️ Read | ✍️ Own | 👁️ Read | 👁️ Own | 👁️ Read | ❌ | ❌ | ❌ |
| **PPL Lead Marketplace (Admin)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **PPL Lead Marketplace (Purchase)**| ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **CRM Pipelines & Deal Kanban** | ✅ | ✅ | ✅ | ✅ Team | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Social CRM & Post Scheduler** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Email Campaigns & Templates** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AI Agents & Custom Prompts** | ✅ | ✅ Config | 👁️ Use | 👁️ Use | 👁️ Use | 👁️ Chat | 👁️ Chat | 👁️ Chat | ❌ | ❌ | ❌ |
| **Buyer Portal & Offers** | 👁️ View | 👁️ View | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | 👁️ View | ❌ | ❌ |
| **Seller Portal & Valuations** | 👁️ View | 👁️ View | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Investor Deals & Analytics** | 👁️ View | 👁️ View | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Mortgage Portal & Verification** | 👁️ View | 👁️ View | ❌ | ❌ | ❌ | 👁️ View | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Title & Escrow Milestones** | 👁️ View | 👁️ View | ❌ | ❌ | ❌ | 👁️ View | 👁️ View | ❌ | ❌ | ✅ | ❌ |
| **Service Request Processing** | ✅ | ✅ | ✅ | 👁️ View | 👁️ View | ✍️ Submit| ✍️ Submit| ✍️ Submit| ❌ | ❌ | ✅ |

*Legend: ✅ Full Access | ✍️ Own Content Creation | 👁️ Read / View Only | ❌ No Access*

---

## ⚡ Core Platform Features & Engines

### 1. Pay-Per-Lead (PPL) & Pay-Per-Close Marketplace
- **Exclusive & Shared Leads**: Admins convert qualified inbound leads into PPL marketplace listings.
- **Reservation Hold**: Agents can reserve leads for up to 15 minutes while completing payment.
- **Instant Contact Reveal**: Upon payment confirmation, lead full name, phone number, email address, property details, and activity log are instantly unlocked.
- **Automated Invoicing & Export**: Generates PDF invoice receipts (`/api/marketplace/purchases/{id}/invoice`) and CSV export options.

### 2. AI Orchestration & Specialized AI Agents
- **Provider Chain Engine**: Resolves AI prompts by attempting **Google Gemini (`gemini-1.5-flash`)** -> **OpenAI (`gpt-4o-mini`)** -> **Graceful Contextual Fallback**.
- **13 Pre-Configured Agents**:
  1. `lead_qualifier`: Analyzes lead budget, timeline, and location to assign qualification scores.
  2. `seller_agent`: Generates home value estimates and listing presentation outlines.
  3. `investor_agent`: Evaluates cap rates, cash-on-cash returns, and renovation budgets.
  4. `email_writer`: Drafts high-converting follow-up emails based on client behavior.
  5. `social_agent`: Converts property listings into engaging Instagram/Facebook/LinkedIn posts.
  6. `seo_agent`: Generates meta titles, meta descriptions, and localized landing page content.
  7. `crm_assistant`: Summarizes client interaction histories into actionable next steps.
  8. `analytics_agent`: Translates platform statistics into operational insights.
  9. `chat_buyer`: Guides prospective buyers through home search questionnaires.
  10. `chat_seller`: Captures home seller listing inquiries.
  11. `chat_investor`: Collects investor buy-box parameters.
  12. `chat_support`: Handles site FAQ inquiries.
  13. `voice_assistant`: Transcribes and processes voice-based property search queries.

### 3. Lead Capture, Scoring & CRM Pipelines
- **Universal Form Ingestion**: Captures leads from 8 distinct channels: Website forms, AI chat, Contact requests, Realtor applications, Seller valuation requests, Buyer requests, Investor inquiries, and Service requests.
- **Dynamic CSV Import Mapper**: `ImportColumnMapper` samples up to 200 cell values per column to accurately map headers (name, email, phone, budget) even when files have custom header names.
- **6-Dimension Scoring Model**: Computes real-time lead score (0-100) based on:
  - Contact Information Completeness (20 pts)
  - Budget & Financial Readiness (20 pts)
  - Timeline & Urgency (20 pts)
  - Engagement & Chat Depth (15 pts)
  - Property Type & Location Match (15 pts)
  - Preferred Contact Verification (10 pts)
- **Kanban Pipeline Management**: Drag-and-drop stages (`New`, `Contacted`, `Qualifying`, `Appointment Scheduled`, `Under Contract`, `Closed`, `Lost`).

### 4. Geo Access Control Engine
- **Edge-to-API Protection**: Next.js Edge proxy intercepts request IP headers and queries `POST /api/geo/check`.
- **Enforcement Criteria**:
  1. Admin Bypass: Logged-in super admins and admins bypass all restrictions.
  2. Whitelist Rule: Whitelisted IPs/CIDRs take precedence over all rules.
  3. Blacklist Rule: Explicitly blocked IPs/CIDRs are immediately rejected.
  4. Tor Exit Node Blocking: Filters known public Tor exit nodes.
  5. Datacenter & Proxy ASN Filtering: Restricts commercial VPN and datacenter proxy ASNs.
  6. Country Restriction: Blocks traffic originating from restricted country codes (default: `PK`).
- **Fail-Safe Design**: Performs fast caching via cookies and fails open if external geo-lookup services time out.

### 5. Email & Social CRM Automation
- **Email Campaigns**: Batch email dispatching with HTML template support, tokenized unsubscribes, tracking pixels for opens, and click tracking.
- **Social Media Publishing**: Multi-account scheduling for social channels with automatic listing media attachment.

### 6. Financials, Invoicing & Contracts
- **Custom Quote & Invoice Engine**: Admins can issue line-item invoices for lead packages, custom services, or subscriptions.
- **Payoneer Payment Link Integration**: Direct conversion of custom quotes into online payment link receipts.
- **Digital Contract E-Signatures**: Contract generation, email delivery, client signature collection, and audit-stamped contract downloads.

---

## 📁 Project Architecture & Directory Structure

The repository contains two main applications:

```
domestic_re/
├── laravel-api/                  # Backend REST API (Laravel 11, PHP 8.2+)
│   ├── app/
│   │   ├── Console/Commands/     # Custom CLI commands (geo updates, exports, cleanup)
│   │   ├── Http/
│   │   │   ├── Controllers/Api/ # 39 API Controllers (Admin, Auth, Property, Lead, etc.)
│   │   │   └── Middleware/      # EnsureRole, EnforceGeoAccess, Sanctum Auth
│   │   ├── Models/               # 87 Eloquent Models (User, Property, Lead, Invoice, etc.)
│   │   └── Services/             # Business Logic (AiService, GeoAccessDecisionService, etc.)
│   ├── config/                   # Configuration files (geo.php, permission.php, etc.)
│   ├── database/
│   │   ├── migrations/           # 98 Database migrations
│   │   └── seeders/              # Database seeders (DatabaseSeeder, MarketplaceSeeder, etc.)
│   └── routes/
│       └── api.php               # 462 API route declarations
│
├── nextjs-frontend/              # Frontend Web Application (Next.js 16, TypeScript, Tailwind)
│   ├── src/
│   │   ├── app/                  # App Router pages (62+ portal route directories)
│   │   │   ├── admin/            # Admin Panel UI
│   │   │   ├── agent/            # Agent Dashboard UI
│   │   │   ├── broker/           # Broker Dashboard UI
│   │   │   ├── buyer/            # Buyer Dashboard UI
│   │   │   ├── seller/           # Seller Dashboard UI
│   │   │   ├── investor/         # Investor Dashboard UI
│   │   │   ├── lender/           # Lender Dashboard UI
│   │   │   ├── title/            # Title Company Dashboard UI
│   │   │   ├── staff/            # Staff Operations UI
│   │   │   ├── super-admin/      # Super Admin System UI
│   │   │   └── marketplace/      # Lead Marketplace UI
│   │   ├── components/           # Reusable UI Components & Chat Widgets
│   │   ├── hooks/                # Custom React Hooks (useAuth, etc.)
│   │   └── proxy.ts              # Next.js Edge Proxy for Geo Access Control
│   ├── public/                   # Static assets & public media
│   └── package.json              # Frontend npm dependencies
│
├── GEO_ACCESS_CONTROL.md         # Detailed Geo Access Documentation
└── README.md                     # Main Project Readme (this file)
```

---

## 📥 Installation & Setup Guide

### Prerequisites
- **PHP**: `>= 8.2` (with `pdo_mysql`, `mbstring`, `openssl`, `curl`, `gd` extensions enabled)
- **Composer**: `>= 2.5`
- **Node.js**: `>= 18.0` (LTS recommended)
- **MySQL / MariaDB**: `>= 8.0` (XAMPP / Local MySQL server running)
- **Web Server**: Apache / Nginx or `php artisan serve`

---

### Backend Setup (`laravel-api`)

1. **Navigate to the API directory**:
   ```bash
   cd c:\xampp\htdocs\domestic_re\laravel-api
   ```

2. **Install PHP Dependencies**:
   ```bash
   composer install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` if not already created:
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file key parameters:
   ```env
   APP_NAME="Domestic Real Estate"
   APP_ENV=local
   APP_KEY=base64:...
   APP_DEBUG=true
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=domestic_re
   DB_USERNAME=root
   DB_PASSWORD=

   # Geo Internal Secret (Must match frontend proxy secret)
   GEO_INTERNAL_SECRET=your_secure_random_secret_string_here

   # AI Provider Credentials
   GEMINI_API_KEY=your_google_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key

   # SMTP Mail Credentials
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.privateemail.com
   MAIL_PORT=587
   MAIL_USERNAME=info@domesticrealestate.us
   MAIL_PASSWORD=your_smtp_password
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS="info@domesticrealestate.us"
   MAIL_FROM_NAME="Domestic Real Estate"
   ```

4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

5. **Run Database Migrations & Seeders**:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *(This executes migrations and seeds initial users, property types, marketplace leads, navigation menus, and FAQs).*

6. **Start the Laravel API Development Server**:
   ```bash
   php artisan serve --port=8000
   ```
   The backend API will be available at `http://localhost:8000/api`.

---

### Frontend Setup (`nextjs-frontend`)

1. **Navigate to the frontend directory**:
   ```bash
   cd c:\xampp\htdocs\domestic_re\nextjs-frontend
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in `nextjs-frontend/`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   GEO_INTERNAL_SECRET=your_secure_random_secret_string_here
   ```

4. **Run the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   The web application will be accessible at `http://localhost:3000`.

---

### Configuring Geo Access Control Secret

To enable communication between the Next.js Edge proxy (`proxy.ts`) and the Laravel API's `/api/geo/check` endpoint:
- Set **`GEO_INTERNAL_SECRET`** to an identical value in both `laravel-api/.env` and `nextjs-frontend/.env.local`.
- Ensure `GEO_INTERNAL_SECRET` is kept server-side and **never** exposed with a `NEXT_PUBLIC_` prefix.

---

## 🔗 API Route & Portal Catalog

### Key Authentication & Public Endpoints
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — User authentication & Sanctum token issue.
- `GET /api/properties` — Browse active public property listings.
- `GET /api/agents` — Search public agent profiles.
- `POST /api/leads/capture` — Universal lead capture endpoint.
- `POST /api/ai/chat` — AI Chat interaction widget.

### Authenticated User Endpoints (`auth:sanctum`)
- `GET /api/auth/me` — Retrieve authenticated user profile and role details.
- `GET /api/marketplace` — Browse available PPL leads in marketplace.
- `POST /api/marketplace/leads/{id}/purchase` — Reserve and purchase lead.
- `GET /api/leads` — Access CRM leads assigned to authenticated user.
- `GET /api/pipelines` — Retrieve user Kanban deal pipelines.

### Admin & Operations Endpoints (`prefix: admin`)
- `GET /api/admin/dashboard` — Platform operational metrics and KPIs.
- `GET /api/admin/users` — Manage system accounts across all 11 roles.
- `GET /api/admin/marketplace` — Manage, publish, and price lead listings.
- `POST /api/admin/invoices` — Create and issue billing invoices.
- `GET /api/admin/geo-access-logs` — Inspect security logs and blocked requests.

---

## 🔄 Background Queues & Scheduled Tasks

The platform uses Laravel Queues and Scheduled Cron jobs for background execution:

### Scheduled Tasks (`app/Console/Kernel.php` / `routes/console.php`)
- **Every Minute**: `ProcessEmailCampaign` (batch campaign delivery) & `PublishScheduledSocialPost` (social post publisher).
- **Every Minute**: Data export processing and cleanup.
- **Hourly**: Overdue invoice status update and notification dispatch.
- **Daily at 03:15 AM**: `php artisan geo:refresh-intelligence` (refreshes Tor exit nodes and GeoIP data).
- **Daily at 03:00 AM**: Data export file pruning.

To start the queue worker locally:
```bash
php artisan queue:work --tries=3 --timeout=90
```

To run the scheduler locally:
```bash
php artisan schedule:run
```

---

## 🧪 Verification & Maintenance Commands

| Action | Command |
|---|---|
| **Run API Automated Tests** | `php artisan test` |
| **Check Route List** | `php artisan route:list --path=api` |
| **Clear Backend Caches** | `php artisan config:clear && php artisan cache:clear` |
| **Refresh Geo Data** | `php artisan geo:refresh-intelligence` |
| **Seed Default Pipelines** | `php artisan db:seed --class=PipelineSeeder` |
| **Build Frontend Production**| `npm run build` inside `nextjs-frontend/` |

---

> © **Domestic Real Estate**. All rights reserved. Built with Next.js 16 & Laravel 11.
