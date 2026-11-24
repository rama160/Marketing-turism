## v3.26.0 — Reliable published destination rendering
Static activity galleries carry explicit parent identifiers independent of Cloudflare HTML URL normalization. The public renderer also accepts clean, .html and trailing-slash paths, keeps static cards visible, loads published activities independently of photo overrides and refreshes on bfcache restore. Versioned script URLs prevent stale client code on tour pages. Existing published records and media remain untouched. Regression tests execute the renderer on all URL forms with failed photo override requests.

---

## v3.25.0 — Multiline content and bilingual SEO
Website CMS accepts paragraph breaks, CRLF and tabs in summaries/descriptions, retains length limits and HTML/control-byte validation, and preserves normalized paragraphs. Owner editor maps errors to visible field labels. SEO defaults to AUTO: derives localized titles and descriptions from the activity title, category/static parent and actual summary/description, with bounded readable snippets. The authenticated read-only suggestion endpoint supports preview/regeneration. MANUAL mode permits overrides, legacy custom metadata remains manual, and AUTO recomputes on save/publish. No external keyword-volume data or ranking guarantees; no extra provider, database migration, booking or rate changes.

---

## v3.24.0 — Automatic activity URLs
New CMS entries allocate a server-generated URL from the English title (Indonesian fallback) and the selected activity context; detail entries prefix the parent identifier. Unique slug insertion retries with numeric suffixes without overwriting another record. Edits preserve the existing database slug regardless of request input. The owner form no longer contains a URL field; Add Activity fixes the parent to the homepage, Add Detail fixes it to the clicked parent and its category. Existing canonical, hreflang and public URLs stay unchanged. No schema migration.

---

## v3.23.0 — Activity details
Existing website_activities JSON snapshots store optional parent_activity (static:snorkeling/island/west/east or activity:<published root slug>). No schema migration. Details use existing authenticated draft/publish/archive, bilingual content, media rights and pricing checks. Parent assignment immutable to avoid orphan trees; dynamic parent must be a published top-level activity of matching category. Archived parents hide their details. Public homepage excludes child cards; existing activity galleries and dynamic experience pages display their own details. Existing static spots, bookings, rates and photos remain unchanged.

---

## v3.22.0 — NPE Gallery: reuse, locate and delete unused photos
The Website Editor exposes a prominent Galeri NPE shortcut as well as its Gallery tab. Media metadata stays in existing `website_media`; binary images remain in `PHOTO_KV` under `website-media/v1/{id}`. A searchable grid displays stored images and a usage count computed from `website_photo_slots`, `website_gallery_photo_slots`, `website_activities.draft_json` and `published_json`. Existing static/third-party photos are not imported as owned assets.
The Ganti Foto dialog presents owner-uploaded images for reuse and a native phone upload option. Selecting existing media IDs bypasses image upload and creates only the existing authenticated photo-slot association. Phone uploads reuse the JPEG compression and photo usage-rights approval. A SHA-256 match returns an existing file ID (`reused:true`) instead of a failed 409 upload.
Deleting a media item requires an explicit owner confirmation and the owner-authenticated DELETE API. The backend performs a guarded atomic D1 DELETE only when the file is unreferenced in homepage slots, gallery slots, or any draft/published activity. Deleting used photos responds 409 and does not touch KV. On successful metadata deletion, storage cleanup deletes only that specific PHOTO_KV key; the client refreshes the list. Existing platform photo library, original tour images, price/booking data and historical campaign content are excluded. This change is additive without schema migration or secret changes.

---

## v3.21.0 — Direct photo-picker UX (24 November 2026)
The owner can tap any published page cover "Ganti Foto", individual spot photo "Ganti foto", or the current page's main photo action and immediately open the device's native image picker. A single dialog previews the chosen file with editing of filename/title and bilingual alt text and a required commercial photo rights attestation. Photo selection retains an exact allowlisted slot ID in front-end state. The shared upload helper uses existing JPEG compression and /api/admin/website/media; the save action then publishes that exact media ID through /api/admin/website/slots with owner_confirmed=true. Original images persist until both operations succeed. On publish failure, the uploaded media ID is cached only in the transient dialog state for retry.
The image preview does not navigate to the Media editor or refresh the entire site_content editor. The JS refreshes image slot metadata and card previews only, preserving unsaved in-progress text. Cancel, no selection, missing rights attestation and upload failure do not change live website data. All existing Media Library and Add Activity workflows remain supported; no D1 migration, Worker API change, auth or guest booking changes are needed.

---

## v3.20.0 — Hydrate Published editor from real website copy (24 November 2026)
Existing guest HTML and language.js are the canonical source of initial content. D1 site_content contains only overrides. Previous editor relied on unavailable window.NusaLanguage in the dashboard, showing blank fields.
The existing build step now derives public/site-editor-defaults.json from those files with real ID/EN text and approved original photo URLs. This snapshot contains only public marketing text, never credentials, bookings or private operator prices, and is deployed with Cloudflare static assets. Editor resolves displayed value as D1 override if present, otherwise the built source default; intentionally empty price overrides stay empty.
Published cards show live effective heading, excerpt, price label and cover photo. Editor provides search and editable fields for both languages; saving only modified text uses existing per-field optimistic version checks. Current five original pages remain original pages, not duplicate dynamic activities.
13 destination-card titles/descriptions use data-copy and the existing versioned site_content API. The new optional website_gallery_photo_slots table holds per-spot photo placement, independently from existing website_photo_slots. Public API returns approved overrides; original file photos remain fallback. Gallery licensing credits remain unchanged.
Build and live smoke assert an actual nonempty snapshot. Migrations are additive and only the dedicated NPE Worker is deployed, keeping quotation, booking and marketing functions isolated.

---

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
