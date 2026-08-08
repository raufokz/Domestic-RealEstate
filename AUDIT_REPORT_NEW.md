# Domestic Real Estate Platform — Security & Code Quality Audit
**Date**: 2026-08-07  
**Auditor**: Kilo  
**Scope**: Full-stack (Laravel API + Next.js Frontend + Database + Deployment/CI-CD)  
**Files Reviewed**: ~100+ source files across 4 layers

---

## Executive Summary

This is a **security-critical** audit of the Domestic Real Estate platform. The platform has a robust feature set (87 models, 462 API routes, 62+ frontend route groups, 11 user roles), but the security posture contains **multiple critical vulnerabilities** that must be addressed before any production exposure.

### Overall Security Score: **4/10** (CRITICAL — not production-ready without fixes)

| Layer | Status | Key Risk |
|-------|--------|----------|
| Laravel API | 🔴 CRITICAL | APP_DEBUG=true, placeholder secrets, empty DB root password, weak geo secret, SSRF in testing endpoints, missing role validation, hardcoded default passwords |
| Next.js Frontend | 🔴 HIGH | No role-based access control on admin panel, auth tokens in localStorage (XSS risk), geo fails open, prompt injection in AI, dangerouslySetInnerHTML in chat widgets |
| Database | 🟡 HIGH | Hardcoded seeder passwords, MySQL-only ENUM migrations, reserved-word columns in original migrations, factory model bindings missing |
| Deployment/Config | 🔴 HIGH | APP_KEY identical across environments, production .env tracked in git, no security headers, SSH MITM risk, no dependency vulnerability scanning |

---

## CRITICAL Findings (Must Fix Before Production)

### 1. APP_DEBUG=true Exposes Stack Traces and Credentials
- **File**: `laravel-api/.env:4`
- **Description**: Debug mode is enabled globally. Error pages include full stack traces, source code snippets, file paths, and environment variables. The exception handler conditionally includes raw error messages in JSON responses when debug is true.
- **Impact**: Attackers can fingerprint server versions, enumerate internal paths, and harvest credentials from error responses.
- **Fix**: Set `APP_DEBUG=false` in all non-local environments.

### 2. Placeholder API Keys and Secrets in .env
- **File**: `laravel-api/.env:48-75`
- **Description**: The following are placeholder values, not real secrets: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_MAPS_API_KEY`, `MAIL_PASSWORD`, `EMAIL_BOUNCE_WEBHOOK_SECRET`, `PAYONEER_CLIENT_ID`, `PAYONEER_SECRET`. `IntegrationGate::isPlaceholder()` only checks some of these at runtime.
- **Impact**: Services fail silently or insecurely. If deployed, credentials are unpredictable or missing.
- **Fix**: Remove the `.env` file from the repository. Use a secrets manager or `php artisan config:set` for production values.

### 3. Empty MySQL Root Password
- **File**: `laravel-api/.env:24-25`
- **Description**: `DB_USERNAME=root` with `DB_PASSWORD=` (empty). MySQL root is accessible without authentication.
- **Impact**: Full database access to any network-visible attacker.
- **Fix**: Create a dedicated database user with a strong password and least-privilege permissions.

### 4. Weak, Predictable GEO_INTERNAL_SECRET
- **File**: `laravel-api/.env:63`
- **Description**: `GEO_INTERNAL_SECRET=dev-local-geo-secret-change-me`. This gates the geo-check endpoint used by edge middleware to enforce geo-blocking. It's a well-known development default.
- **Impact**: Any attacker who knows this value can query the geo-check endpoint and bypass geo restrictions for any IP address.
- **Fix**: Generate a cryptographically random 256-bit secret: `php -r "echo bin2hex(random_bytes(32));"`.

### 5. TestingController::simulatePayment — Arbitrary Invoice Payout
- **File**: `app/Http/Controllers/Api/TestingController.php:192-212`, `routes/api.php:883`
- **Description**: Authenticated staff/admin users can mark any invoice as paid by ID with no audit trail, no confirmation, and no distinction between real and simulated payments.
- **Impact**: Financial fraud in compromised-admin scenarios.
- **Fix**: Add an `is_test_payment` flag, require a confirmation token, and log all simulations with the acting user ID and reason.

### 6. TestingController::sendTestWebhook — Server-Side Request Forgery (SSRF)
- **File**: `app/Http/Controllers/Api/TestingController.php:242-279`, `routes/api.php:889`
- **Description**: Accepts an arbitrary `target_url` from user input and POSTs to it. No URL validation, no SSRF protection, no IP allow/deny list.
- **Impact**: Internal network scanning, access to cloud metadata endpoints (169.254.169.254), internal service probing.
- **Fix**: Validate URL protocol, resolve hostname, block requests to private/internal IP ranges (RFC 1918, loopback, link-local).

### 7. TestingController::sendTestEmail — Open Email Relay
- **File**: `app/Http/Controllers/Api/TestingController.php:134-152`, `routes/api.php:879`
- **Description**: The `to` parameter accepts an arbitrary email address with no validation, allowlist, or rate limiting.
- **Impact**: Turns the application into an open email relay for spam, phishing, or BEC attacks if SMTP is configured.
- **Fix**: Restrict `to` to the authenticated admin's email or validate against a configured allowlist.

### 8. No Sanctum Token Expiration
- **File**: `config/sanctum.php`
- **Description**: The `expiration` configuration is set to `null`, meaning personal access tokens never expire.
- **Impact**: Leaked tokens remain valid indefinitely.
- **Fix**: Set `'expiration' => 43200` (30 days).

### 9. AdminController::updateUser — Missing Role Enum Constraint
- **File**: `app/Http/Controllers/Api/AdminController.php:710-724`
- **Description**: The validation rule for `role` is `'sometimes|string'` with **no `in:` constraint** (unlike `storeUser` which properly uses `in:super_admin,admin,staff,agent,broker,buyer,seller,lender,title_company,investor,vendor`).
- **Impact**: An admin can set `role` to any arbitrary string, corrupting the RBAC system.
- **Fix**: Add `|in:super_admin,admin,staff,agent,broker,buyer,seller,lender,title_company,investor,vendor` to the `role` validation rule.

### 10. Hardcoded Default Password in User Creation
- **File**: `app/Http/Controllers/Api/AdminController.php:700`
- **Description**: When no password is provided during user creation, `$validated['password'] = 'ChangeMe123!'`. This is a weak, predictable default.
- **Impact**: Users created without explicit passwords start with this common-knowledge default.
- **Fix**: Make `password` a required field or force a password reset flow with a single-use token.

### 11. Unauthenticated Info Disclosure on Web Root `/` Route
- **File**: `routes/web.php:6-28`
- **Description**: The status page at `/` is publicly accessible and exposes database connectivity, system load average, peak memory usage, PHP version, Laravel version, and environment name.
- **Impact**: Server fingerprinting for targeted attacks.
- **Fix**: Restrict the status page to authenticated admin users in production, or remove it.

---

## HIGH Findings

### 12. Admin Routes Excluded from Geo-Blocking
- **File**: `config/geo.php`
- **Description**: `api/admin/*` is in the geo exclusion patterns, meaning all admin endpoints are accessible from any geography.
- **Impact**: Geo restrictions are completely bypassed for admin functionality.
- **Fix**: Remove `'api/admin/*'` from the excluded patterns.

### 13. No Trusted Proxy Configuration — IP Spoofing Bypasses Geo-Blocking
- **File**: `app/Http/Middleware/EnforceGeoAccess.php:32`
- **Description**: Uses `$request->ip()` which reads `X-Forwarded-For` by default. No `TrustedProxy` middleware configuration exists anywhere.
- **Impact**: Attackers can spoof their IP address to bypass geo restrictions entirely.
- **Fix**: Install `fruitcake/laravel-trusted-proxy` and configure with actual trusted proxy IPs.

### 14. GeoIP Lookup Fails Open on Database Errors
- **File**: `app/Services/Geo/GeoIpLookupService.php`
- **Description**: Uses `@inet_pton($ip)` with error suppression. When the GeoLite2 database is missing, returns empty/default data rather than failing closed.
- **Impact**: False blocks or, more dangerously, false allows when GeoIP data is unavailable.
- **Fix**: Default to blocking when GeoIP lookup fails (fail-closed).

### 15. No Dedicated Rate Limiting on Public AI Endpoints
- **File**: `routes/api.php:154-159`, `RouteServiceProvider.php:24-26`
- **Description**: AI routes use the global 60 requests/minute limiter only. Each request triggers external API calls to Gemini/OpenAI/Claude, consuming budget. The `history` parameter allows large payloads.
- **Impact**: API budget exhaustion, cost abuse.
- **Fix**: Add a dedicated `ai` rate limiter (e.g., 10 requests/minute) and apply `throttle:ai` to all AI routes.

### 16. Prompt Injection Risk in AI Endpoints
- **File**: `app/Http/Controllers/Api/AiController.php`, `app/Services/AiService.php`
- **Description**: Free-form user input including `history` array is passed directly to `AiService::generate()` as OpenAI-style messages, prepended before the system prompt.
- **Impact**: Adversarial conversations override system instructions, data exfiltration from LLM context.
- **Fix**: Implement input sanitization, use prompt templates with clear delimiters, add LLM-based content moderation.

### 17. SystemController::cacheGet/cacheForget — Arbitrary Cache Key Access
- **File**: `app/Http/Controllers/Api/SystemController.php`, `routes/api.php:855-856`
- **Description**: Staff+ users can read or delete any cache key by arbitrary name. Cache may contain session data, tokens, query results with PII.
- **Impact**: Sensitive data exposure, denial-of-service for active users.
- **Fix**: Validate cache keys against a whitelist, log all cache access, restrict to admin+ role.

### 18. AiChatController::storeMessage — Stored XSS / Content Injection
- **File**: `app/Http/Controllers/Api/AiChatController.php:132-176`
- **Description**: The `content` field has no length limit, sanitization, or content filtering. Messages are stored directly and returned to users.
- **Impact**: Stored XSS if the frontend renders content without HTML escaping.
- **Fix**: Add `max:10000` length limit, sanitize HTML content, implement proper content escaping on the frontend.

### 19. CORS Allows Localhost Origins in Production
- **File**: `config/cors.php`
- **Description**: `allowed_origins` includes `http://localhost:3000`, `http://localhost:8001`, `http://127.0.0.1:3000`, etc. Not environment-conditional.
- **Impact**: Any local web application can make authenticated cross-origin requests to the API.
- **Fix**: Use environment-based CORS configuration.

### 20. No Security Headers Configured
- **File**: `bootstrap/app.php`, `app/Providers/AppServiceProvider.php`
- **Description**: No middleware or configuration for CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, or Permissions-Policy.
- **Impact**: Clickjacking, MIME-type sniffing, MITM attacks on downgraded HTTPS.
- **Fix**: Install `spatie/laravel-helmet` and configure security headers.

### 21. Authorization Bypass: No Role-Based Access Control on Admin Panel
- **File**: `src/components/admin/AdminLayout.tsx:147`, `src/hooks/useAuth.ts:89-101`
- **Description**: `AdminLayout` calls `useRequireAuth()`, which only checks authentication (any role). Any logged-in buyer, seller, agent, or investor can access the full admin dashboard.
- **Impact**: Complete administrative control by any authenticated user.
- **Fix**: Add a role guard in `AdminLayout` that checks `auth.user?.role` against an allowed list.

### 22. Authentication Tokens Stored in localStorage (XSS Risk)
- **File**: `src/lib/api.ts:19-22, 267-273`
- **Description**: Tokens are stored in `localStorage` and retrieved client-side. `localStorage` is accessible to any JavaScript executing in the page context, including injected XSS payloads.
- **Impact**: Token theft via XSS leads to full account takeover.
- **Fix**: Move token storage to `HttpOnly` / `Secure` / `SameSite=Strict` cookies handled by the Laravel backend.

### 23. Geo Access Control Fails Open
- **File**: `src/proxy.ts:59-101`
- **Description**: The geo middleware returns `allowed: true` for all traffic when `GEO_INTERNAL_SECRET` is not set, when the API returns non-ok status, or when the fetch throws any error.
- **Impact**: Users from blocked countries can access the site whenever the geo-check backend is unreachable.
- **Fix**: Implement a short-term cached deny-by-default for unknown IPs when the backend is unreachable.

### 24. AI Prompt Injection Vulnerability
- **File**: `src/app/api/ai/chat/route.ts:64-168`
- **Description**: User input (`message`, `history`, `name`, `email`) is forwarded unsanitized to the Laravel `/ai/chat` endpoint, Gemini API, and OpenAI API.
- **Impact**: Data exfiltration, AI manipulation, platform abuse.
- **Fix**: Implement input sanitization, prompt injection detection heuristics, and strict length limits.

### 25. XSS via dangerouslySetInnerHTML in Chat Widgets
- **File**: `src/components/ai/UniversalChatWidget.tsx:1014`, `src/components/ai/ChatWidget.tsx:404`
- **Description**: Both chat widgets render AI responses using `dangerouslySetInnerHTML` after `parseMarkdown()`. Regex replacements could be bypassed with crafted inputs.
- **Impact**: Stored XSS if an AI provider returns malicious HTML.
- **Fix**: Use DOMPurify on all AI-generated content before rendering.

### 26. Hardcoded Demo Credentials in Production Code
- **File**: `src/app/login/page.tsx:22-33`
- **Description**: Dev-only quick-fill credentials are hardcoded. If they correspond to real accounts, they are exposed to anyone with repository access.
- **Impact**: Credential leakage; account takeover if these accounts are active.
- **Fix**: Remove hardcoded credentials entirely.

### 27. Identical APP_KEY Across Local and Production Environments
- **File**: `laravel-api/.env:3` and `laravel-api/.env.production:3`
- **Description**: Both files contain the exact same APP_KEY. The `.env.production` file is tracked in git.
- **Impact**: Session hijacking, credential forgery, and data decryption across all environments if repository is leaked.
- **Fix**: Generate a unique APP_KEY for production. Remove `.env.production` from git history.

### 28. Production .env File Tracked in Git
- **File**: `deploy/.env.production`
- **Description**: `deploy/.env.production` is committed to the repository. `laravel-api/.env.production` contains the production APP_KEY and is not in `.gitignore`.
- **Impact**: Production secrets become part of git history permanently.
- **Fix**: Add `laravel-api/.env.production` and `deploy/.env.production` to `.gitignore`. Rotate any exposed secrets.

### 29. SSH StrictHostKeyChecking Disabled in CI/CD
- **File**: `.github/workflows/deploy-api.yml:39,45`
- **Description**: Both rsync and SSH commands use `-o StrictHostKeyChecking=no`.
- **Impact**: Man-in-the-middle attacks during deployment.
- **Fix**: Pre-populate `known_hosts` with the server's public key. Remove `-o StrictHostKeyChecking=no`.

### 30. Overly Permissive Image Remote Patterns (SSRF Risk)
- **File**: `nextjs-frontend/next.config.ts:23-25`
- **Description**: Pattern allows image optimization for **any** S3 bucket on AWS: `hostname: "**.amazonaws.com"`.
- **Impact**: SSRF, data exfiltration via image processing side-channels.
- **Fix**: Restrict to specific buckets.

---

## MEDIUM Findings

### 31. Hardcoded Plaintext Credentials in DatabaseSeeder
- **File**: `database/seeders/DatabaseSeeder.php:30,39,48,57,66,75,84`
- **Description**: Production-like credentials (`Admin@123456`, `Agent@123456`, `password`, `Buyer@123456`, `Seller@123456`) are hardcoded in plaintext.
- **Impact**: Account takeover if seeder is run in production or file is leaked.
- **Fix**: Use environment variables for all passwords. Ensure seeder is never run in production.

### 32. MySQL-Only Raw ENUM Modifications in Migrations
- **Files**: 8 migration files using `DB::statement("ALTER TABLE ... MODIFY ... ENUM(...)")`
- **Description**: MySQL-specific syntax that fails silently on PostgreSQL or SQLite.
- **Impact**: Stale column definitions on non-MySQL databases.
- **Fix**: Replace ENUM columns with string/VARCHAR + check constraints or Laravel-backed enums.

### 33. Reserved-Word Columns Created in Original Migrations
- **Files**: `create_integrations_table.php` (column `key`), `create_ai_prompts_table.php` (column `key`)
- **Description**: Original migrations created columns named `key` and `group` (SQL reserved words). A later rename migration patches already-installed databases but fresh installs fail.
- **Impact**: Fresh database creation fails on some drivers.
- **Fix**: Update original migrations to use final column names directly.

### 34. Factories Missing `$model` Property (Laravel 11 Compatibility)
- **Files**: `ContractFactory.php`, `PropertyFactory.php`, `PropertyCategoryFactory.php`, `UserFactory.php`
- **Description**: These factories extend `Factory` but do not declare `protected $model = ...`.
- **Impact**: `Model::factory()` fails to resolve correctly.
- **Fix**: Add `protected $model = Contract::class;` etc.

### 35. Client-Side Role Manipulation in Registration
- **File**: `src/app/register/page.tsx:131-133`
- **Description**: The `role` parameter is accepted from URL query string and forwarded to backend.
- **Impact**: Privilege escalation during registration if backend doesn't strictly validate.
- **Fix**: Remove `role` from client payload. Let backend assign default roles.

### 36. robots.txt Incomplete — Exposes Dashboard Paths
- **File**: `src/app/robots.ts:11`
- **Description**: Only 4 dashboard paths are disallowed. Other sensitive dashboards are not listed.
- **Impact**: Sensitive dashboard pages indexed by search engines.
- **Fix**: Disallow all `/*dashboard/` paths.

### 37. URL Query Parameter Tokens (Information Leakage)
- **File**: `src/app/verify-email/page.tsx:18-21`, `src/app/reset-password/page.tsx:33-34`
- **Description**: Tokens are passed via URL query parameters. Tokens in URLs are logged in server access logs, stored in browser history, and leaked via `Referer` headers.
- **Impact**: Token interception, account takeover.
- **Fix**: Use POST requests with tokens in the request body, or hash fragments.

### 38. Third-Party Tracking Without Consent
- **File**: `src/app/layout.tsx:164-185`
- **Description**: Microsoft Clarity and Google Analytics are loaded unconditionally with no cookie consent banner.
- **Impact**: Privacy law violations (GDPR, CCPA).
- **Fix**: Implement a cookie consent banner that defers tracking script injection until consent is given.

### 39. PropertyMap XSS via Unsanitized Title
- **File**: `src/components/PropertyMap.tsx:17`
- **Description**: The `title` prop is inserted directly into HTML in Leaflet popup.
- **Impact**: XSS via map popup content if title comes from unsanitized user input.
- **Fix**: Sanitize `title` with DOMPurify before passing to Leaflet.

### 40. Missing Security Headers in Next.js
- **File**: `nextjs-frontend/next.config.ts`
- **Description**: No security headers configured. Lacks X-Frame-Options, CSP, HSTS, X-Content-Type-Options, Referrer-Policy.
- **Impact**: Clickjacking, XSS, MIME-type sniffing attacks.
- **Fix**: Add security headers in `next.config.ts`.

### 41. CORS Allows Localhost Origins in Production
- **File**: `config/cors.php` (backend)
- **Description**: Same as finding #19 but from the deployment audit perspective.
- **Impact**: Local web applications can make authenticated cross-origin requests.
- **Fix**: Environment-conditional CORS origins.

### 42. No HTTPS Enforcement in Next.js
- **File**: `nextjs-frontend/next.config.ts`
- **Description**: No middleware to enforce HTTPS on the Next.js standalone server.
- **Impact**: Users could reach the application over HTTP if proxy is misconfigured.
- **Fix**: Ensure Apache is the only entry point and port 3000 is firewalled.

### 43. Missing Unique Constraint on `user_roles.role_name` Per User
- **File**: `database/migrations/2026_01_01_000002_create_user_roles_table.php:11-18`
- **Description**: No unique constraint on `(user_id, role_name)`. Users can be assigned the same role multiple times.
- **Impact**: Inconsistent permission checks, database bloat.
- **Fix**: Add `$table->unique(['user_id', 'role_name']);`.

### 44. `leads.normalized_email` / `normalized_phone` Unindexed
- **File**: `database/migrations/2026_01_01_000030_create_leads_table.php:23-24`
- **Description**: Columns exist for deduplication but have no unique or index constraint.
- **Impact**: Duplicate lead creation, slow lookups at scale.
- **Fix**: Add unique indexes on normalized columns.

---

## LOW Findings

### 45. No Request ID / Correlation ID
- **File**: `bootstrap/app.php`, exception handler
- **Description**: Returns generic `server_error` code for all server errors without a unique request ID. Difficult to correlate errors across distributed logs.
- **Fix**: Generate a request ID at the start of each request, include it in responses and log entries.

### 46. Inconsistent Error Response Shapes
- **File**: `app/Support/ApiResponse.php`
- **Description**: Different error responses use different codes and structures. The `fix` and `actionUrl` fields are inconsistently present.
- **Fix**: Standardize on a single error response schema.

### 47. Inline Scripts in Root Layout
- **File**: `src/app/layout.tsx:151-155`
- **Description**: Inline script injected via `dangerouslySetInnerHTML` to remove browser extension attributes.
- **Fix**: Move to an external JS file loaded with `strategy="afterInteractive"`.

### 48. No PM2 Ecosystem File in Repository
- **File**: Repository-wide
- **Description**: PM2 process management is configured inline in the deployment workflow but not version-controlled.
- **Fix**: Add `ecosystem.config.cjs` to the repository.

### 49. Backup Strategy Relies on Manual Panel Actions
- **File**: `DEPLOYMENT.md:212-224`, `app/Http/Controllers/Api/SystemController.php`
- **Description**: Backups stored in `storage/app/backups`. No automated off-site backup, no encryption, no retention policy.
- **Fix**: Implement automated encrypted backups to off-site storage.

### 50. No Dependency Vulnerability Scanning in CI
- **File**: `.github/workflows/deploy-api.yml`, `nextjs-frontend/package.json`
- **Description**: No `npm audit`, `composer audit`, or Dependabot configuration present.
- **Fix**: Add `npm audit --audity-level=high` and `composer audit` to CI workflows. Enable Dependabot.

---

## Positive Findings

| Area | Status | Notes |
|------|--------|-------|
| Authentication | ⚠️ | Sanctum-based auth is properly configured with stateful domains, but token storage is insecure (localStorage) |
| Authorization | ⚠️ | Policies exist for Property, Contract, Invoice, and AgentProfile, but AdminController::updateUser has a missing role validation |
| Password Hashing | ✅ | User model uses `'password' => 'hashed'` cast |
| Input Validation | ⚠️ | Controllers use FormRequest validation, but some endpoints lack rate limiting and sanitization |
| CSRF Protection | ✅ | Laravel's built-in CSRF middleware is active for web routes |
| Geo Access Control | ⚠️ | Comprehensive system exists but has critical implementation flaws (fails open, IP spoofing, admin exclusion) |
| Database Relationships | ✅ | Foreign keys properly defined and reference correct columns |
| Migrations | ⚠️ | All have up/down methods, but some use MySQL-specific ENUM syntax |
| Seeders | ⚠️ | Follow conventions but contain hardcoded passwords |
| Factories | ⚠️ | Exist for key models but some miss `$model` property for Laravel 11 |
| Error Handling | ✅ | `FeatureUnavailableException` provides actionable messages with fix URLs |
| Code Organization | ✅ | `GeoListEntryCrud` trait eliminates duplication; `ApiResponse` utility provides consistent structure |
| Frontend Routing | ✅ | App Router properly configured with 62+ route groups |
| SEO/Metadata | ✅ | Root layout has full SEO setup with JSON-LD, OpenGraph, Twitter cards |
| Image Optimization | ✅ | Next.js configured with AVIF/WebP formats and remote patterns |

---

## Remediation Priority

| Priority | Timeline | Actions |
|----------|----------|---------|
| **P0** | **Immediately** | Set `APP_DEBUG=false`, rotate all `.env` secrets, set real `GEO_INTERNAL_SECRET`, configure non-empty `DB_PASSWORD`, set Sanctum `expiration`, add role guard to AdminLayout |
| **P1** | **Within 24h** | Install trusted proxy middleware, remove `api/admin/*` from geo exclusions, add dedicated AI rate limiter, add security headers middleware, implement SSRF protection on webhook testing |
| **P2** | **Within 1 week** | Fix `AdminController::updateUser` role validation, add audit trail for manual payments, implement PII redaction in lead notes, validate webhook secrets with `hash_equals()`, add role validation to registration |
| **P3** | **Within 2 weeks** | Standardize RBAC, add export logging, fix N+1 queries, implement prompt injection detection, add HSTS, encrypt backups, implement monitoring |
| **Ongoing** | **Continuous** | Add automated security scanning (Laravel Security Checker, `composer audit`, `npm audit`), enable Dependabot, add OWASP ZAP to CI/CD |

---

## Architecture Notes

- **Good patterns**: `GeoListEntryCrud` trait eliminates duplication; `ApiResponse` utility provides consistent JSON structure; `FeatureUnavailableException` provides actionable error messages with fix URLs; `IntegrationGate::isPlaceholder()` detects placeholder credentials at runtime for AI/email/maps integrations
- **Architecture concern**: The geo-blocking system is registered globally on the API middleware group but is systematically undermined by admin route exclusion, IP spoofing via missing trusted proxy config, fail-open GeoIP lookups, and the weak `GEO_INTERNAL_SECRET`
- **TestingController risk**: These endpoints are behind `auth:sanctum` + `role:staff,admin,super_admin` but give staff users dangerous capabilities (payment simulation, SSRF, email relay) that require admin+ role at minimum with audit logging
- **Dual RBAC system**: The codebase uses both custom `EnsureRole` middleware and Spatie permissions, creating confusion and potential security gaps
- **Total files reviewed**: ~100+ source files across routes, config, middleware, controllers, services, models, migrations, seeders, factories, frontend components, hooks, and deployment configurations
