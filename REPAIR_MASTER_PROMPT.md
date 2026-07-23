# DomesticRE — Master Repair Prompt (Frontend + Backend + Database)

You are repairing the Domestic Real Estate platform at `C:\xampp\htdocs\domestic_re`
(Laravel 12 API in `laravel-api/`, Next.js 16 frontend in `nextjs-frontend/`, MySQL
via XAMPP). This prompt is **specific to this codebase's verified defects** — every
item below was confirmed against the live database and running servers on 2026-07-23.
Do not re-audit what is already documented; `FINAL_AUDIT.md` at repo root is the
canonical status. Fix in the phase order given.

## Ground rules (violating these caused every past regression)

1. **Audit, don't rebuild.** Fix and complete existing code. Never rewrite working modules.
2. **Row counts before belief.** A module whose tables hold 0 rows has never run,
   whatever the code says. `php artisan tinker --execute="echo DB::table('t')->count();"`
3. **Confirm a component is rendered before fixing it.** `HomeClient.tsx` contains
   ~1700 lines of never-rendered components (`HeroSection`, `HomeValuation`,
   `FeaturedListings`, `TrustBar`, `MarketStats`, `ExpertAgents`, `SolutionsSection`,
   `AIAssistantPreview`) plus unreferenced `HomeVariant1/2/4`. The live homepage is
   `RealEstateBeesHome` only. Trace from `page.tsx` down.
4. **Confirm columns exist before trusting a write.** Eloquent silently drops
   non-fillable/nonexistent attributes (the `assignToPipeline` lesson). Pipelines run
   on **`deals`** (`pipeline_id`/`stage_id`/`lead_id`) — leads have NO pipeline columns.
   Stage ordering column is `sort_order`, never `order`.
5. **No fake success, no mock data, no silent failure — ever.** Every mutation:
   toast success only after server confirms; every fetch: loading + error(+retry) +
   honest empty state. Use `useToast()` (`success`/`notifyError(err,msg,retryFn)`).
6. **Envelope trap:** some endpoints return raw Laravel paginators, others
   `{success,data,message}` via `App\Support\ApiResponse`. Read the controller before
   typing a frontend response.
7. **Frontend rules:** consult `node_modules/next/dist/docs/` first (breaking
   changes; `params` is a Promise). API client `@/lib/api` — paths WITHOUT `/api`
   prefix. Light mode only. No phone numbers on public pages. Brand: Navy `#0A2647`,
   Gold `#C9A227` (hover `#b8911f`), Poppins/Inter.
8. **Verify everything live** before claiming done: `npx tsc --noEmit` exit 0;
   `php -l` clean; curl the API at `:8001` (mint a Sanctum token via tinker, delete it
   after); curl the page at `:3001`; check the DB row actually changed.
9. Delete any synthetic test data you create. Never leave fabricated rows.

---

## PHASE 0 — Configuration (blocks everything; do first)

These are placeholders in `laravel-api/.env` (17 `your_*` values remain):

| Key | Effect when fixed |
|---|---|
| `GEMINI_API_KEY` | All 14 AI agents + chat stop returning the canned fallback (`AiService.php:32`). Also update `AiService.php:230` — it pins retired `gemini-1.5-flash`; use a current model id. |
| `OPENAI_API_KEY` | AI fallback tier works |
| `MAIL_PASSWORD` | Email exists at all (`sent_emails` is 0, ever). Host is `smtp.privateemail.com`, user `noreply@domesticrealestate.us` |

Then start the workers and PROVE them:
```
cd laravel-api
php artisan queue:work --tries=3        # keep running (campaigns, exports, social)
php artisan schedule:work               # or cron: * * * * * php artisan schedule:run
```
Acceptance: send one test email (Testing Center) → `sent_emails` count becomes 1.
Send one chat message → response is NOT the fallback sentence and `provider` ≠ `fallback`.

Also purge dead credentials: remove all `STRIPE_*` and `GHL_*` lines from `.env`
(platforms were removed by mandate; keys still present).

## PHASE 1 — Backend truth fixes

1. **`SettingsController` — the last fake-success module.** All four settings
   groups (`getSeoSettings`/`getAppearanceSettings`/`getSecuritySettings`/
   `getNotificationSettings`, lines ~11-39) return hardcoded arrays and their
   `update*` twins echo `$request->all()` with a success message while persisting
   NOTHING. Fix: persist to the existing `site_settings` table (12 rows already
   there — follow its key/value pattern), validate input, return what was saved.
   Frontend pages `admin/settings/{seo,appearance,security,notifications}` must
   round-trip: save → reload → values survive.
2. **`TestingController` fabrications:** `generateTestInvoice()` (fake invoice
   object), `simulatePayment()` ("Payment simulated successfully"),
   `sendTestWebhook()` (claims `status_code: 200`, sends nothing). Make each do
   the real thing or return an honest "not configured / not supported" failure
   with fix guidance. The rest of that controller is honest — match its style.
3. **Remaining stub CRUD (return `[]` / fake `id: 1`, no tables):**
   - `PageBuilderController`: `pageTemplates`/`storePageTemplate`/
     `destroyPageTemplate`/`usePageTemplate`, `contentBlocks`/`updateContentBlocks`
     → build `page_templates` and `content_blocks` tables + models + real CRUD.
     (`page_sections` already exists and works — copy template sections into it
     on "use template".)
   - `PropertyManagementController`: `amenities` group → `amenities` table + CRUD.
   - `BlogController::storeTag/destroyTag` — tags live on `blogs.tags` (array
     cast); implement real add/remove across posts or remove the endpoints and
     their UI affordances.
   - `SystemController::imports()/retryImport()` stubs → wire to the existing
     `import_batches`/`import_batch_errors` tables (built, 0 rows) and make
     `LeadController::import` record batches + row errors there.
   - `SystemController::warmCache/retryQueueJob/deleteQueueJob` → implement
     really or return honest "not supported".
4. **Error-guidance rollout.** `ApiResponse::fail(message, code, status, feature:,
   reason:, fix:, actionUrl:)` exists and the frontend `parseApiError` +
   toast already render `fix`/`action_url` — but only `IntegrationController`
   uses the guidance params (11 `fail` calls total across 39 controllers).
   Roll it across every controller's error paths so each failure tells the admin
   how to fix it. Do NOT change success envelopes piecemeal (consumers expect
   current shapes) — errors only, or coordinated vertical slices.
5. **RBAC consolidation.** spatie/laravel-permission is installed but
   `roles`/`permissions`/`model_has_roles` are all EMPTY; authorization actually
   runs on the `users.role` string. Pick ONE: either seed spatie and migrate
   checks to it, or remove the package. Then add Policies for Lead, Property,
   Deal, Invoice, Document and FormRequests for the largest controllers
   (there are currently 0 of each).
6. **Blog polish (known defects):** publish toggle route is PATCH but
   `admin/blog/page.tsx:113` POSTs (405 every click) — accept both or add
   `apiPatch`; `status` validation says `archived` but the DB enum is
   `draft/published/scheduled` — align; `update()` regenerates slug without a
   collision guard against the unique index — guard it.

## PHASE 2 — Database & content

1. **`property_images`: 0 rows against 6 properties** — public listings render
   without galleries; unlaunchable. Add real images (admin upload or seed from
   `/public` assets) and verify `/properties` + detail pages show them.
2. **`automation_workflows`: 0** — `AutomationEngine::trigger()` fires at 5 call
   sites into nothing. Seed the baseline set (confirm names with the owner):
   new lead → create follow-up task + notify assigned agent; stage-change →
   follow-up; seller valuation → seller sequence. Verify one really executes and
   writes `automation_workflow_logs`.
3. **Kanban hygiene:** 538 of the 558 board deals are `csv_import` rows flooding
   "New Lead". Give the board (or leads list) a bulk-move/bulk-archive so the
   admin can clear them. Do not delete data unilaterally.
4. **CMS emptiness:** `pages: 0`, `blogs: 3` — the sitemap has almost nothing
   real to emit. After Phase 1.3, seed the core CMS pages through the real CRUD.
5. **Invoices: 0 ever** — run one invoice through create → PDF → send (needs
   Phase 0 SMTP) → mark paid → revenue analytics; fix whatever breaks.
6. Production flips when deploying: `APP_ENV=production`, `APP_DEBUG=false`,
   real `APP_URL` (currently localhost — breaks tracking pixels + invoice links).

## PHASE 3 — Frontend completion

1. **~150 dead buttons** (no onClick/submit/Link): seller 27, investor 23,
   buyer 23, admin 17, wholesaler 9, realtor 9, agent 5, staff 4, broker 3.
   Decision rule: if a real backend exists → wire it with toast + refetch;
   if none exists → either build the backend (owner priority: **seller/buyer
   offers + documents first**) or render disabled with a "Soon" title, exactly
   like the portal nav treatment. Zero buttons that look clickable but do nothing.
2. **Hardcoded portal dashboards** (sample data, no API): broker, lender, title,
   staff, super-admin dashboards; also `/agents/[slug]`, `/properties/compare`,
   `/realtors/agent-directory`, blog `category/[slug]` + `tag/[slug]`. Wire to
   real endpoints where they exist; build minimal honest endpoints where they
   don't; never leave "123 Oak Lane"/"Jessica Hartwell" content.
3. **SEO metadata: 57 of 136 public pages missing it** — worst first: all 9
   buyer/investor calculators and every dynamic `[slug]` route (blog, cities,
   guides, market-reports, agents, properties catch-alls). Use `buildMetadata()`
   from `@/lib/seo` (+ `JsonLd` where real data supports it). Client pages get a
   `layout.tsx` for metadata.
4. **Autofill: 8 public lead forms missing `autoComplete`** —
   `sellers/request-valuation`, `wholesalers/{submit-deal,inquiry,buyer-list}`,
   `investors/buy-box`, `services/request`, `agents/[slug]`, `unsubscribe` —
   plus all portal profile/settings forms. Standard attrs: given-name,
   family-name, email, tel, street-address, address-level1/2, postal-code,
   organization. Labels + `aria-describedby` error wiring while you're in there.
5. **Dead code deletion** (after confirming still unreferenced):
   `HomeClient.tsx`'s unrendered components, `HomeVariant1/2/4`,
   `public/companies-logos/ssss.png` (design sheet duplicate). Smaller surface =
   fewer false audit positives.
6. **HowTo coverage:** instruction panels exist on Import/Campaigns/Exports —
   add to Kanban, property create, invoice create, social calendar
   (`@/components/ui/HowTo`).
7. Toasts sit top-right (chat widget owns bottom-right) — keep it that way for
   any new overlay.

## PHASE 4 — Verification protocol (gate for "done")

For every module touched, produce the §30 line set with evidence
(see `FINAL_AUDIT.md` format): exists / works / persistence verified (table + N
rows) / API verified (method, path, status, shape) / states (loading/error/empty)
/ toasts / admin alerts / tested end-to-end (exact commands).

Full-pass gates:
```
npx tsc --noEmit                          → exit 0
grep -rE "const (mock|dummy|fake|sample)[A-Z]|MOCK_" nextjs-frontend/src/   → 0 hits
link diff (every href vs real routes)     → 0 clickable 404s
sitemap.ts entries vs routes              → 0 404s
dead-button scan                          → 0 unexplained
backend: no method returns success without a DB write
php artisan migrate:status                → all Ran
```
Run the project's subagents where useful: `feature-auditor` (verification),
`honesty-checker` (anti-pattern sweeps). Update `FINAL_AUDIT.md` when a module's
status changes. Report honestly — a blocked item stated plainly beats a fake pass.
