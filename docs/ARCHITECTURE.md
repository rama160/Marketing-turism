# Technical Architecture v3.0.0

## Components
Public HTML/CSS/JS PWA (public/) -> Cloudflare Worker (src/worker.mjs) -> D1 SQL (database/migrations/0001_init.sql).
Deterministic pricing module: src/pricing.mjs.
Optional cloud inference: Workers AI binding AI for promo drafts only.
CI: .github/workflows/ci.yml (syntax, pricing tests, build artifact).
Live remote verification: .github/workflows/live-smoke.yml (public homepage/catalogue/auth boundary).
Future deploy workflow: .github/workflows/deploy-cloudflare.yml (requires GitHub Cloudflare secrets and ENABLE_CLOUDFLARE_DEPLOY=true).

## Data domains
operators -> rates with immutable version history -> quotes with JSON snapshot -> bookings and manually verified payment/handover status.
leads with consent are separate from quotes, public acceptance disabled until configured.
audit_log captures operator/rate/quote/booking actions.
Additional migration 0003_marketing.sql: campaign_drafts, market_price_refs, lead_attribution, no scraping and no auto-posting. Canonical sales module src/sales.mjs handles leadScore, safe reply drafts and comparable competitor unit normalization.
Additional migration 0002_operations.sql: booking_manifest, booking_payables, booking_changes, booking_schedule. Operator net payables allocate historical rate ID to providers at booking creation; multiple items from same operator aggregate. Quotes remain immutable and reschedule overrides live service date in booking_schedule.
Rates are per operator per activity; independent providers allowed for base experience and three add-on types.

## State machine
Lead: NEW -> QUALIFIED / CONTACTED -> CLOSED / LOST.
Quote: DRAFT -> OPERATOR_CONFIRMED -> APPROVED; cancellation transitions supported.
Booking: AWAITING_PAYMENT -> PAID -> HANDED_OVER.
Never hand over unpaid guest; never mark payment paid from image receipt.

## API
GET /api/health
GET /api/public/catalog
POST /api/public/leads
GET /api/admin/summary
GET/POST /api/admin/operators
PATCH /api/admin/operators/:id/status
GET/POST /api/admin/rates
GET /api/admin/leads; PATCH /api/admin/leads/:id
POST /api/admin/quotes/preview
GET/POST /api/admin/quotes; PATCH /api/admin/quotes/:id/status
GET/POST /api/admin/bookings
GET /api/admin/market; POST /api/admin/market
GET /api/admin/campaigns; POST /api/admin/campaigns; PATCH /api/admin/campaigns/:id/status
POST /api/admin/leads/:id/assistant
GET /api/admin/analytics
GET /api/admin/finance
POST /api/admin/bookings/:id/manifest
POST /api/admin/bookings/:id/payables/:operatorId/pay
POST /api/admin/bookings/:id/changes
PATCH /api/admin/bookings/:id/changes/:changeId
POST /api/admin/bookings/:id/payment
POST /api/admin/bookings/:id/handover
POST /api/admin/marketing/draft

## Security and tradeoffs
Worker validates owner bearer token against ADMIN_TOKEN secret, not checked in.
Client token in sessionStorage during current tab session only; susceptible to malicious injected script, mitigated with escaping and CSP; stronger OAuth/Cloudflare Access advisable before expansion.
Public leads require salted hashed IP rate limits, honeypot, server-verified Cloudflare Turnstile token, approved business_profile in dedicated D1 and separate Cloudflare PUBLIC_LEADS_ENABLED=true. A pilot notice is not sufficient to approve final legal policy.
Migration 0005_public_readiness.sql adds the singleton business_profile table; GET /api/public/readiness and GET/PATCH /api/admin/business provide controls.
D1 CRUD does not substitute payment gateway settlement; owner separately confirms bank/payment provider.
No guest email/phone is exposed by public APIs.

## Infrastructure
Dedicated D1 database marketing-turism-db, Cloudflare Worker marketing-turism-agent, workers.dev pilot URL.
Assets currently served by Worker modules for live pilot and via Wrangler assets on future deployments; keep origin consistent.
No VPS. Quotas of Cloudflare Free tier apply. Costs from payment processors and messaging must be evaluated.

## Cancellation and trading brand 2.7.0
Canonical calculation in `src/cancellation.mjs`; policy ID stays with change records. D1 migration 0006 adds trade_brand to business_profile, audit columns to booking_changes, and DRAFT boat return net rate.
Temporary public brand name is separate from legally accountable business name; readiness gate still needs legal name and public contact. Manual bank transfer only, QRIS not provisioned; owner review of supplier exposure and transaction required.
Marketing channels merely label owner-created drafts. There is no account connector granting automated posting. Do not claim account reach or impressions from external media.

## Mode-aware supplier rate model: migration 0007
`rates.booking_mode` distinguishes LEGACY/SHARING/PRIVATE and rate activation/versioning uses `(operator_id, item_id, booking_mode)`. SHARING rates must be `unit=person` and `sharing_guaranteed=1` with operator-confirmed max capacity. PRIVATE snorkeling uses `unit=person` plus `private_fixed_net` charged once per quote, included as a second immutable price line under the same rate ID for supplier payable allocation; PRIVATE island tour uses `unit=car` (one full vehicle). `leads.booking_mode` and `quotes.booking_mode` preserve selection; older records default LEGACY. Existing addon supplier rates remain mode LEGACY. No automated shared-departure inventory exists: verified operator confirmation remains mandatory.

### v3 supplier rate variants
`rates.variant_id` includes STANDARD_3_SPOTS, MANTA_BAY, MANTA_POINT, WEST, EAST. `rates.pricing_scheme`: STANDARD per pax, FIXED_PACKAGE per whole snorkeling booking, FIXED_VEHICLE per whole car. Per-mode/variant supplier rate versioning avoids cross-deactivation. `leads.variant_id` and `quotes.variant_id` persist selected variant. `DEFAULT` remains for historical pre-v3 supplier contracts. Base quote snapshots remain immutable. Tour Sharing variant WEST/EAST accounts for full car Rp600k until a genuine pooled cohort is supported; there is currently no automatic seat mixing service.

## v3.1.0 multilingual public content / authenticated CMS
The canonical allowed homepage copy keys and publish validator are in `src/site-content.mjs`. `public/language.js` selects ID/EN using browser locale or explicit manual preference, provides curated static English/Indonesian fallbacks and applies versioned D1 overrides when available. The visitor uses only `GET /api/public/site-content?lang=id|en`, not the authenticated API. The editor is an additional tab in the existing owner dashboard: `GET/POST /api/admin/site-content` (same owner bearer verifier used by finance and pricing). DB tables `site_content` and `site_content_revisions` are introduced additively by migration 0009; audit_log stores publication action, and optimistic version checks reject stale writes. Published copy is plain text (textContent) with bounded lengths; never interpret as HTML. Public cache never caches /api; Worker replies no-store. No user identity determination beyond browser locale and local manual selection. Existing public lead intake gates, booking approvals and rate snapshots remain unchanged.

### Remote deployment guard — October 19, 2026
The Tourism D1 schema predates Wrangler-managed migration bookkeeping, so replaying all migration files would repeat non-idempotent ALTER TABLE statements. Deployment workflow runs only additive idempotent 0009 before publishing. Live updates are gated by repository variable ENABLE_CLOUDFLARE_DEPLOY=true and Cloudflare Actions secrets (not present as of this release). The Cloudflare API migration succeeded; code still needs Wrangler deployment. Do not report public website version 3.1.0 as deployed until the dedicated Worker smoke test confirms it.
