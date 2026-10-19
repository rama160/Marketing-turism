# Marketing Turism — AI Tourism Marketing & Booking Agent

Repository: rama160/Marketing-turism. Release 3.1.0 (MVP pilot; brand, bilingual homepage and owner CMS).

Responsive customer PWA + Cloudflare Workers/D1 backend for independent Nusa Penida tourism sales agent. Tourism only. Guest pays agency; local operators deliver activities.

## Implemented
- Customer catalogue with public privacy/terms pilot notices, lead form fail-closed until owner business-profile and Turnstile readiness plus explicit Cloudflare production flag.
- Owner business configuration in dashboard, including official contact and approval flags (do not check boxes before policies are final).
- Owner dashboard with secret bearer token.
- Multiple operators, immutable rate revisions and operator verification.
- Price guard: minimum markup Rp100,000 per booking, plus agency/payment costs and positive contribution.
- Lead CRM, quote preview and snapshot, operator confirmation, booking, manual payment verification, verified guest manifest and operator handover.
- Finance dashboard: operator net liabilities by rate snapshot, manual settlement references, audited cancellation/reschedule and full-refund workflow.
- Optional Workers AI marketing drafts and consent-aware Sales Assistant lead scoring/reply drafts, both requiring owner review.
- Manual campaign drafts/approval/publication URL and competitor price-reference capture (no automated posting/scraping).
- GitHub Actions tests + PWA build artifact.

## Basic commands
Run: npm run ci
Migrate (pilot v3.1.0): npx wrangler d1 execute marketing-turism-db --remote --file=database/migrations/0009_site_content.sql
Local server: npx wrangler dev
Deploy: npx wrangler deploy (only after checking settings and secrets).

## Cloudflare
Dedicated D1: marketing-turism-db, binding DB. Worker: marketing-turism-agent.
Set ADMIN_TOKEN secret (24+ chars), RATE_SALT secret, then carefully enable PUBLIC_LEADS_ENABLED=true when privacy/anti-abuse controls are approved. Site served at workers.dev or assigned domain after deployment.

## Restrictions
No automatic bank settlement; any eligible refund is calculated server-side under the draft cancellation rules, reviewed by owner and recorded only after actual external transfer verification. No live payment gateway, external booking supplier API, mass WhatsApp messaging, auto-posting, or fully autonomous marketing campaigns. No verified real-world operator tariff/contract yet. All starting net rates are DRAFT. Return boat tariff and 7th car seat require operator confirmation. No simultaneous snorkeling+island tour on the same day. Booking payment requires human verification, and handover requires operator acknowledgment.

See docs/OPERATIONS.md. Never commit credentials, personal guest details or bank credentials.

Workers AI draft model: `@cf/meta/llama-3.1-8b-instruct-fast` (active fast variant). If quota/model fails, draft falls back to explicit template; never auto-publish/send.

Reschedule yang telah disetujui operator diselesaikan dalam satu transaksi; pembayaran guest ditahan selama ada permintaan perubahan aktif.

New: weekly draft generation via Cloudflare Cron Trigger (Monday 01:00 UTC / 09:00 Nusa Penida) produces 2 owner-review drafts. No autoposting or sending, and no advertising spend.

Pre-deploy isolation guard: `scripts/preflight.mjs` blocks changes to Worker, D1 ID, shared domain routes or cron. This repository is not authorized to deploy over FinChat or Spenva.

PWA: SVG install icon, public static offline cache; no offline editing/booking or cached guest personal data. Turnstile CSP is consistent between Worker pilot and `public/_headers` for future deployment.

## Penivara Experiences — provisional trade brand
Public facing trade brand draft is **Penivara Experiences**, tagline **Discover Nusa Penida, Your Way**. This is not the business legal name, trademark clearance, registration or verified social handle. Original GitHub repository, Worker, secrets and D1 target remain unchanged.

## Payment, providers and lead conversion
Transfer bank is manual only; confirm real funds directly before marking PAID. QRIS is NOT CONFIGURED and no QR code/account may be invented. New guest enquiries may be collected when separately authorised, while operators can be assigned and contacted later. No binding price/payment before validated provider, availability and safe capacity of 6 or 7 as applicable.

Boat return owner-confirmed draft net Rp150,000/person/way; draft operator rates must be confirmed with each supplier before quoting.

## DRAFT cancellation policy
Voluntary guest cancellations (after explicit consent): H-7+ 25%, H-6..H-3 50%, H-2..H-1 75%, on date/no-show 100% proposed forfeiture. View /cancellation.html. Supplier cancellation/unsafe operations receive separate, fair review; customer rights prevail. Algorithm suggests an amount only; owner checks unrecoverable supplier fees, laws and bank transactions. Do not apply penalty unilaterally or to historic quotations without agreement. Partial refund bookkeeping requires documented payment confirmation. Live customer sales remain disabled until the legal/business information and real operators are ready.

## Marketing channels
Draft and manually publish to Instagram, Facebook, TikTok, YouTube Shorts, WhatsApp Business/Status, Google Business Profile, Telegram and travel marketplaces if legitimately registered. Platform logins/permissions and media are NOT connected, no automated cross-posting or ad spend. Published campaigns can supply an attributable guest link when website form is enabled.

## Guest acquisition preparation
- Informational landing pages: `/snorkeling.html`, `/island-tour.html`, with independent dates and operator-verified inclusions.
- `robots.txt` and `sitemap.xml` exist, but site pages remain `noindex,follow` until trade brand, business identity and public contact/legal policies approved by owner.
- Read `docs/MARKETING_LAUNCH_KIT.md` for organic channel plan; external apps are not automatically connected.

## Sharing and Private — owner-approved
- BOTH snorkelling 3 spots and island tour offer Sharing (may mix unrelated guests) or Private (exclusive for at least 1 guest).
- Sharing must have operator-VERIFIED per-person net, boat/car capacity, and an explicit guarantee that a booked guest costs the agent only their own seat, regardless of other passenger occupancy. If operator charges entire underfilled boat/car, NO binding Sharing quote until exposure is covered with a properly verified different rate.
- Private island tour pays the full exclusive vehicle net per booking even for one guest; actual safe capacity is verified for each supplier.
- Private snorkeling uses operator-verified net per guest PLUS the fixed exclusive boat/service fee per booking. No fixed fee confirmation -> NO Private quote.
- New mode minimum selling price = total actual operator net + agent/transaction costs + at least IDR 100,000 contribution per booking; no AI override. Price per guest in preview is only average, not a separate discount.
- Rate versions are separately scoped by operator/activity/mode. Existing LEGACY rows and quotes are preserved, not converted to guaranteed Shared/Private rates automatically.
- Operator manually confirms availability and guest count before quote approval; there is no real-time seat inventory integration or automatic pooling of bookings.

To configure each operator: Dashboard > Tariff net > choose activity + Sharing/Private > actual max seats. For Sharing tick no-empty-seat operator guarantee. For Private snorkeling enter the confirmed exclusive fixed fee. Always record per-booking agency/payment costs. Frontend forms now select a booking mode; historical legacy quote APIs remain for backward compatibility.

## v3.0.0 — operator-supplied price and routes confirmed by owner
- Official operating/trade name supplied: **Nusa Penida Experiences** (business registration and public contact still require separate validation; do not assert legal registration has been independently checked).
- Snorkeling **Sharing 3 spot** initial **net Rp200,000 per guest**, at most 20 guests; operator must confirm actual boat capacity and per-person, no-vacant-seat fee guarantee. Prior Rp350k historical rate remains preserved as LEGACY, not the new selling price.
- Snorkeling **Private 3 spot Manta Bay** net **Rp1,500,000 for a whole private booking**, and **Private 3 spot Manta Point** net **Rp2,800,000 per private booking**. Never add per-guest Rp350k again: these are all-in initial supplier net for the private experience, subject to operator confirmation. Which other two spots are included in each 3-spot circuit must be confirmed by actual operator; manta sightings never guaranteed.
- Island Tour **West or East**, Private or Sharing: operator net **Rp600,000 per whole car**, max **7 confirmed safe seats**. Until actual sharing guest group pooling, price the FULL vehicle against the known guests in the CURRENT booking, not hypothetical 7 guests. Group minimum before other costs Rp700,000, with extra lunch/boat and actual agency/payment costs added. Do not promise a flat per-seat price using future, unconfirmed occupancy.
- Additional lunch and fast boat each use separately confirmed provider/net, do not assume included in car price.
- All initial preset rates are DRAFT against DRAFT_OPERATOR and cannot be used in binding quote until verified operator, capacity and dates are confirmed. Historical rates/quotes preserved.
- Web pages now group West attractions: Kelingking, Broken Beach, Angel's Billabong, Crystal Bay; East attractions: Diamond, Atuh, Rumah Pohon. Photo URLs sourced from Wikimedia Commons with credits/attribution and appropriate licensing; some underwater photos illustrative, not necessarily of the exact named spot. Safety disclaimers required.
- D1 migration 0008_variants_and_supplier_net.sql adds variant_id and pricing_scheme. Modes and variants are an indivisible supplier rate key. Fixed-package PRIVATE snorkeling and fixed-vehicle SHARING tour keep net per full booking (not per guest).
- Do NOT change Cloudflare FinChat/Spenva resources. Real public leads remain OFF pending verified contact, privacy/refund policies and operator confirmations. External publishing and bookings still require permission/approval.

## Photo display (3.0.1)
The tourism pages use Wikimedia Commons photo sources with author links and CC attribution. The production Worker serving these pages MUST set `Content-Security-Policy: img-src 'self' data: https://commons.wikimedia.org https://upload.wikimedia.org` to allow Commons redirects. The same policy exists in `public/_headers` for Wrangler static assets. `scripts/smoke.mjs` checks the live response header to catch deployment drift. Photos require connectivity to Wikimedia; the public offline cache deliberately excludes third-party images and customer data.

## Reliable destination photos v3.0.2
Destination pages use `/photos/<slug>` on the tourism Worker instead of browser-side Wikimedia `Special:FilePath` hotlinks. `src/photos.mjs` restricts requests to vetted Commons paths, tries 640px thumbnails and originals, caches successes, returns HTTP 502 for upstream failures. `public/photo-loader.js` swaps unsuccessful photos for transparent honest SVG placeholder. Photographer/CC BY-SA links are displayed in captions. External origin availability is still a dependency on a cold cache: live verification checks the upstream at selected photo URLs. Image cache contains only freely licensed public photos, not user data.

## Ten destination photos — fixed 2026-10-19
All 10 Nusa Penida gallery photos are real Wikimedia Commons licensed JPEGs, downloaded through `scripts/sync-photos.mjs`, normalized by `scripts/optimize-photos.py`, and saved to `public/photos/*.jpg` with hashes/license/author records in `public/photos/manifest.json`. The production Worker `/photos/<slug>` serves those verified static images via GitHub Raw (same-origin proxy); browser `photo-loader.js` falls back to the corresponding public GitHub photo directly, then to the honest local unavailable SVG. Gallery links carry photographer credits and source pages. CI checks each JPEG byte signature, SHA256, and page credit. Live smoke checks ALL TEN photo endpoints actually return image bytes, plus CSP and safety.

## 3.0.4 Reliable gallery
The ten CC-licensed JPEGs are already committed at `public/photos/*.jpg`. Cloudflare Workers serves `/photos/{slug}` in this order: native static assets (once deployed by Wrangler); dedicated `PHOTO_KV` cached bytes; verified GitHub raw source on an initial cache miss. A first successful photo retrieval populates the persistent Tourism-only KV namespace `marketing-turism-photo-cache`; all future regions can reuse it even when the external image host is unavailable. The browser has another local JPG/static and GitHub fallback, then a labeled SVG (no silent blank photo). Album cache version and source query string refreshed to avoid old mobile caches. The Worker pilot still uses manual module deployment; the static asset path becomes available when Wrangler is authorized for the existing dedicated Tourism Worker. No guest data in the KV namespace.

## Website content & guest language
- Website uses the canonical Nusa Penida Experiences SVG brand in navigation and install icon.
- Locale picker in the header: Auto (browser language, Indonesian if `id`, English otherwise), Bahasa Indonesia, English. Manual selection stays in the browser. This does not identify the guest's nationality.
- Dashboard > Editor Website: choose a homepage or experience-page section and ID/EN language, edit plain-text copy, preview, then publish. CMS values persist to dedicated D1 with revision/version history and cannot be edited without `ADMIN_TOKEN`. Collision between open admin tabs returns HTTP 409.
- Execute `npx wrangler d1 execute marketing-turism-db --remote --file=database/migrations/0009_site_content.sql` before `npx wrangler deploy` (dedicated Worker only). The migration is additive and leaves existing operator rates, quotes and bookings untouched.
- Public copy is intended for marketing text, not legal notices or unconfirmed commercial claims. Operator quotes and margins remain controlled by canonical pricing rules; lead intake stays OFF until readiness approval.

## Deploy blocked until GitHub Cloudflare secrets are connected
Code and tests are merged into `main`; D1 tables for CMS are already created in the **dedicated** Tourism database via authorized Cloudflare API. Production site deployment requires repository Actions secrets `CLOUDFLARE_API_TOKEN` (Cloudflare token scoped to the dedicated account with Workers Scripts edit and D1 edit) and `CLOUDFLARE_ACCOUNT_ID`, plus repository Actions variable `ENABLE_CLOUDFLARE_DEPLOY=true`. Do NOT commit either secret or post it in chat.

Use [Actions secrets](https://github.com/rama160/Marketing-turism/settings/secrets/actions) and [Actions variables](https://github.com/rama160/Marketing-turism/settings/variables/actions); then run [Deploy Tourism Cloudflare (manual)](https://github.com/rama160/Marketing-turism/actions/workflows/deploy-cloudflare.yml) on `main`. Job refuses to run unless opted in. Wrangler executes the idempotent **0009** schema (already present), then deploys only `marketing-turism-agent` with `public/` static assets. No FinChat/Spenva resources are accessed. The historical D1 schema was populated without a Wrangler `d1_migrations` ledger, so DO NOT indiscriminately re-run all older ALTER TABLE migrations in production.

The credential-free deployment trial on 2026-10-19 was stopped by Wrangler *before* updating the Worker, because both Actions secrets were unset. Github CI and the production pilot smoke check remained green. New guest intake is still OFF.
