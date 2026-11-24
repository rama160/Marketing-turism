## v3.19.0 — Published-first NPE Website Studio (24 November 2026)
Existing website_activities, website_media, website_photo_slots and site_content stores are reused; no schema migration.
- Published: live dynamic cards plus five existing public-page entries, each linking to editable CMS content.
- Draft: unpublished, archived and pending revisions.
- Edit Activity: bilingual title/summary/description, category, fixed slug, cover media, optional numeric selling price and unit, supplier verification and optional SEO, live preview.
- Halaman Website: grouped editing of existing site_content fields and optional static price fields, retaining advanced single-field revision editing.
- Media: rights-confirmed photo upload and published photo slot assignment on existing PHOTO_KV.
Price is positive integer price_amount or null, with price_unit PERSON/CAR/GROUP/TICKET and boolean price_from. Numeric price produces consistent bilingual labels; missing price is allowed and hidden from public. Drafts can contain an unverified amount; publishing requires owner verification for any displayed price and verified service scope plus cover. No supplier net-rate or quote mutation.
Published_json remains untouched by draft updates. Existing drafts without price_amount continue to work; legacy custom labels are kept unless cleared explicitly. site_content price.* fields now accept empty strings, while normal text still requires content. All admin endpoints remain owner-authenticated.

---

## v3.18.0 — Dynamic Website CMS & SEO-preserving experiences (24 November 2026)
The existing `src/site-content.mjs` remains canonical for editable static hero and tour text. New isolated `src/website-cms.mjs` handles **dynamic activity draft, revision, publishing, media, photo slots and public experience page rendering**. No duplicate text editor or pricing engine.

### Data & boundaries
- `website_activities(id,slug,draft_json,published_json,status,version,published_at,...)` versions draft and public independently. Editing a published activity does not alter public content until owner approves Publish. Slug cannot change after creation, preventing broken SEO URLs.
- `website_activity_revisions` captures immutable published snapshots. `website_media` stores only JPEG metadata/digest while binary goes to the existing PHOTO_KV under `website-media/v1/{uuid}`. `website_photo_slots` assigns verified photos to hero/snorkeling/island/west/east without editing JSX or static page markup again.
- D1 migration `0023_website_cms.sql` is additive and isolated from supplier rates, approved quotes, booking and guest contact details.
- Admin APIs behind the existing revocable HttpOnly owner session: `GET/POST /api/admin/website/activities`, `PATCH /api/admin/website/activities/:id`, `POST /api/admin/website/activities/:id/publish|archive`, `GET/POST /api/admin/website/media`, `GET/POST /api/admin/website/slots`.
- Public read-only APIs: `GET /api/public/website/activities`, `GET /api/public/website/slots`; media `GET /photos/website/:uuid`; indexable pre-rendered pages `GET /en/experiences/:slug`, `/id/experiences/:slug`.
- Dynamic sitemap and robots derive the live hostname; `wrangler.jsonc` worker-first paths cover only SEO routes and preserve existing static asset service for the other paths.
- Publishing requires an owner confirmation, a rights-confirmed website photo, and checked supplier scope. Public prices additionally require checked price verification. These flags are human attestations, **not** proof of verified inventory, operational booking, or supplier API integrations. Payment/quote processing stays unchanged.
- Public activity cards are appended by `public/website-content.js` and link to server-rendered HTML indexable pages. Failed CMS API calls leave the old static site usable.
- Static homepage title/description editor remains `src/site-content.mjs`, so owners can edit copy, photos, create activities, change SEO fields and publish without updating source files for each routine operation.

### SEO & operational tradeoffs
Dynamic activity pages render HTML with unique localized title/meta, canonical, hreflang en/id, OG and basic WebPage JSON-LD, all escaped. Existing .html route titles/canonical remain unchanged until a future domain migration. Google indexing/first-page placement is not guaranteed. Google Search Console must be configured after custom domain purchase.
Plan a future migration of older .html static pages to localized server-rendered routes if search data supports it; do not introduce automatic redirects or domain assumptions before the domain exists.

---

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

### Remote deployment guard and verified release — 19 October 2026
The Tourism D1 schema predates Wrangler migration bookkeeping, so replaying historic ALTER TABLE migrations would be unsafe; the 0009 CMS migration was applied additively through the dedicated Cloudflare API. v3.1.0 production code and static assets were published directly via Cloudflare multipart module upload, preserving seven bindings with strict inheritance. The resulting version `5fff37c2-bdf0-41f1-922b-b159a61a1dcb` is deployed at 100%. External smoke [#39210622766](https://github.com/rama160/Marketing-turism/actions/runs/39210622766) proves HTTP 200 assets and safe public APIs plus admin 401 enforcement. GitHub-origin deployment is separately gated by `ENABLE_CLOUDFLARE_DEPLOY` and Cloudflare repository Actions secrets; those are not yet configured. Public leads remain OFF. Future changes to GitHub do not imply live deployment until verified.
