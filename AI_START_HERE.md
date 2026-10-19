# AI START HERE — Marketing Turism Agent
Version: 3.5.0 | 2026-10-19 | Repository: rama160/Marketing-turism

## Immutable user-approved business rules
- Tourism experiences only: snorkeling, island tours and added activities by verified local operators. Agent owns guest acquisition, price presentation and payment collection; operator delivers activity.
- Snorkeling 3 spots: CURRENT owner-provided draft net SHARING Rp200,000 per guest, max 20; PRIVATE Manta Bay Rp1,500,000 per booking (3 spots), Manta Point Rp2,800,000 per booking (3 spots). Historic Rp350,000 LEGACY rate is only for previous quotes.
- Island car: initial net Rp600,000 per car, seating 6 or 7 must be verified by each partner.
- Lunch: initial net Rp150,000 per person; extra to island car.
- Fast boat: initial net Rp150,000 per person per ONE WAY in either direction, owner-confirmed base cost. Each actual boat operator and quote still requires verification.
- Entrance on current itinerary Rp0, parking paid by vehicle owner, not guest.
- NO same-day bundled snorkeling + island tour.
- Minimum markup Rp100,000 for the COMPLETE booking, not per guest or add-on. Pricing floor also accounts for agency costs, transaction fees and positive contribution.
- Prices per operator must be editable; each rate revision immutable and issued quote preserves historical price snapshot.
- AI may RECOMMEND; only authorized owner approves commercial prices and verifies customer payments and operator availability. AI cannot move funds, bypass safety rules or publish unapproved content.
- All initial supplier prices are owner-provided DRAFT values, not verified rates.

## Coding rules
1. Read README.md, docs/PRD.md and docs/ARCHITECTURE.md before edits.
2. Never create duplicate implementations of pricing. src/pricing.mjs is canonical.
3. Extend existing files where the responsibility already exists. Create new files only for distinct responsibilities.
4. Update CHANGELOG.md and tests for every behavior change.
5. Never commit secrets, guest personal data, bank credentials, or OAuth tokens.
5a. Only change the dedicated Marketing Turism Worker and D1. Never deploy over finchat-ai-gateway or spenva-play-billing.
5b. When increasing schema, create additive migration; never modify already applied migration.
6. Always use owner authorization for sensitive CRUD and limit public forms.
7. Never claim payment success from a screenshot; require actual externally verified funds.
8. Validate build locally and in GitHub Actions; live smoke checks are separate.
9. Never touch existing FinChat/Spenva Cloudflare resources. Marketing Turism resources are isolated.

## Marketing policy
Market references must preserve observed date, source, included services and pricing unit. NEVER compare a group price to per-person price without normalizing quantity and inclusions. AI Sales replies are drafts only. Campaign status PUBLISHED requires a real external URL entered manually; do not claim auto-posting.

## Production checklist
Real operator agreements and tariffs, capacity, cancellation rules, marine safety, contact and legal identity, privacy notice, payment destination, tests, publication rights and guest support process must be confirmed before public lead intake is enabled.

## Scheduling policy
Cloudflare Cron `0 1 * * 1` on marketing-turism-agent generates only reviewable Website campaign drafts. No outbound messaging, posting, paid ads or AI payments. Do not create triggers in FinChat or Spenva workers.

## Lead intake gate 2.5.0
Never accept real guest data unless: dedicated Tourism D1 business_profile contains verified legal name, public contact, approved FINAL privacy and refund terms; TURNSTILE_SECRET is configured on marketing-turism-agent; Cloudflare PUBLIC_LEADS_ENABLED is intentionally true. Privacy/terms files in pilot are NOT final business policies; update them before approving. The Turnstile widget key is public; its secret must never appear in GitHub or chat.

## Owner-approved October 2026 updates
- Temporary trade brand Penivara Experiences: do not present as registered business/trademark. Keep Cloudflare marketing-turism-agent isolated.
- Operators may be registered manually after leads arrive; public enquiries alone are not confirmed availability or transactions.
- Island vehicle must have seat capacity verified at booking (6 or 7, not automatically assumed 7).
- Outbound AND return fast boat net are each Rp150,000/person/one way, initially DRAFT per operator. Lunch Rp150,000/person net extra. No tourist entrance fee for current route; vehicle owner bears parking.
- Payments: manual bank transfer only, QRIS not available. Never invent bank account or QR image.
- Owner requested cancellation penalties of 25/50/75/100% at H-7+/H-6..3/H-2..1/H0. Policy is DRAFT pending legal review, before-payment consent and supplier cancellation cost agreements. Supplier cancellation/unsafe event must not be treated as voluntary guest forfeiture. AI cannot refund or debit.
- Market distribution: only draft content, manual owner posting and real links for Instagram/Facebook/TikTok/YouTube/Google Business Profile/WhatsApp Business/Telegram/marketplaces. No spam or invented platform connection.

## Sharing and Private — owner-approved
- BOTH snorkelling 3 spots and island tour offer Sharing (may mix unrelated guests) or Private (exclusive for at least 1 guest).
- Sharing must have operator-VERIFIED per-person net, boat/car capacity, and an explicit guarantee that a booked guest costs the agent only their own seat, regardless of other passenger occupancy. If operator charges entire underfilled boat/car, NO binding Sharing quote until exposure is covered with a properly verified different rate.
- Private island tour pays the full exclusive vehicle net per booking even for one guest; actual safe capacity is verified for each supplier.
- Private snorkeling uses operator-verified net per guest PLUS the fixed exclusive boat/service fee per booking. No fixed fee confirmation -> NO Private quote.
- New mode minimum selling price = total actual operator net + agent/transaction costs + at least IDR 100,000 contribution per booking; no AI override. Price per guest in preview is only average, not a separate discount.
- Rate versions are separately scoped by operator/activity/mode. Existing LEGACY rows and quotes are preserved, not converted to guaranteed Shared/Private rates automatically.
- Operator manually confirms availability and guest count before quote approval; there is no real-time seat inventory integration or automatic pooling of bookings.

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

## Photo source CSP consistency
For every deployment path (GitHub Wrangler assets AND manually uploaded `entry.mjs` modules), the live HTML response CSP must include `img-src 'self' data: https://commons.wikimedia.org https://upload.wikimedia.org`. Otherwise every attraction photo is blocked, despite a green HTTP page smoke check. Keep the allowlist restricted to these sources, maintain photographer credits, and verify live response CSP in `scripts/smoke.mjs`. Avoid touching FinChat or Spenva Workers.

## Gallery resilience v3.0.2
Photo images MUST use same-origin `/photos/{slug}` served from canonical Wikimedia thumbnail URLs by `src/photos.mjs`, not `Special:FilePath?width=900`. Only known slugs are allowed; CDN retrieval is cached, falls back to original if thumbnail fails, and frontend displays a local honest placeholder if origin is unavailable. All galleries preserve Commons author/source attribution. Both manual Cloudflare multipart deployment entry router and Wrangler `run_worker_first` must route `/photos/*` through `src/worker.mjs`. Verify 200 image responses for at least Kelingking, Diamond Beach, Manta Point. Do not update Spenva/FinChat.

## Gallery photo delivery 3.0.3 (DO NOT REGRESS)
- Source of truth: public/photos/{slug}.jpg (10 genuine photos), with authors/licenses/hashes in `public/photos/manifest.json`. Scripts: `scripts/sync-photos.mjs`, `scripts/optimize-photos.py`, workflow `sync-photos.yml`. DO NOT replace with broken `Special:FilePath` redirects.
- Production Worker deployment must import `photos.mjs` and route `/photos/*` to API Worker, return real JPEG bytes and cache them; browser `photo-loader.js` falls back to GitHub Raw direct JPG and finally labelled local SVG.
- CSP for image source includes `raw.githubusercontent.com`; public pages have clickable Commons credits. Test `tests/photos.test.mjs` verifies SHA256/JPEG bytes/author attribution; `scripts/smoke.mjs` verifies all ten live photo endpoints. Preserve separation from Spenva/FinChat and maintain lead gate OFF until legal readiness.

## Photo reliability (3.0.4)
Ten photo JPG files at `public/photos/*.jpg` are already verified. The Worker `/photos/{slug}` serves in order: Cloudflare native Assets when binding is configured, dedicated `PHOTO_KV` persistent namespace `marketing-turism-photo-cache` (KV id `75b81d83ac954e57a2976c651470dc85`), then verified Github JPG on cold miss. On successful cold fetch Worker stores source bytes to KV. Backend is not allowed to advertise success based only on external mirror fallback; live smoke checks real JPEGs. `public/photo-loader.js` offers local static, GitHub and labeled SVG fallback. Preserve exact CC credits from `public/photos/manifest.json`. This KV contains only public licensed images. Do not modify Spenva/FinChat and do not cache guest private data.

## v3.1.0 — final logo placement, language selector and owner-approved website copy
- Preserve existing official brand `Nusa Penida Experiences`; reuse the repository's canonical `public/icon.svg` asset as visible header logo across core public pages and PWA icon. Never overwrite with brand guesses or alter business identity.
- Guest frontend detects Indonesian/English from browser locale when `Auto` is selected, with manual ID/EN override persisted only as a language preference in browser localStorage. Static curated translations are stored in `public/language.js`; no third-party translation or tracking.
- Homepage and experience-page heading/intro text can be changed in the existing dashboard > **Editor Website** after admin token verification. Only `src/site-content.mjs` defines allowed public fields. Endpoint GET `/api/public/site-content?lang=en|id` is public read-only; admin GET/POST `/api/admin/site-content` requires existing owner secret. Content updates go to D1 with CAS `expected_version`, immutable revisions and audit_log entry, migration `0009_site_content.sql`.
- CMS publishes **plain text only** (not HTML/script), max 1,200 characters; no pricing, policy, payment promises, bank details, guest data, or safety commitments should be edited via these fields. Initial text is sourced from existing static content until owner publishes changes. Owner must edit Indonesian and English separately to keep the wording consistent.
- No new OAuth, provider API, secret or billing resource. No actions on `finchat-ai-gateway` or `spenva-play-billing`. D1 must be migrated before deploying updated website; deploy only through dedicated Tourism Worker workflow after CI passes. Public lead intake remains OFF.

## v3.1.0 Cloudflare production status — verified live, 2026-10-19
- The current official trade name is **Nusa Penida Experiences**; the earlier Penivara draft name noted in historical entries is superseded.
- Direct Cloudflare upload of static modules, Worker code and new CMS module succeeded on the dedicated `marketing-turism-agent` on 2026-10-19. All previous Worker binding names were inherited strictly. Never update FinChat or Spenva resources.
- GitHub live smoke [#39210622766](https://github.com/rama160/Marketing-turism/actions/runs/39210622766) **passed** against the published HTTPS endpoint for v3.1.0, the new logo, ID/EN language resource, owner CMS endpoint access, seven branded pages and photo gateway, with guest lead intake still OFF.
- Additive Tourism D1 tables `site_content` and `site_content_revisions` are live. Do not re-run historic ALTER migrations blindly.
- GitHub-to-Cloudflare auto-deploy is intentionally still opt-in via `ENABLE_CLOUDFLARE_DEPLOY` and currently lacks GitHub Actions secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`; this does **not** mean the website is offline or the direct Cloudflare deployment failed. Future GitHub code changes are not automatically published until that separate CI integration is configured.

## Public design release v3.2.0 (2026-10-19)
- LIVE Cloudflare version `858ca131-30f2-48cb-b0f1-253adf131a7a` on `marketing-turism-agent` for all traffic. New logo is a manta ray and Nusa Penida cliff silhouette; homepage uses genuine archived destination images and their Commons attribution.
- Public visual theme: deep navy, turquoise, warm gold; photographic full-width hero; West, East and snorkeling image cards; responsive navigation.
- Curated Indonesian and English copy must be inspiring but not promise actual sightings, guaranteed availability, booking confirmation, fixed guest prices or payment while launch gate remains OFF. D1 CMS entries override locale fallbacks.
- Owner dashboard shows only real records and contains a Quick Edit panel for hero title and description for both ID/EN. It submits to existing owner-authenticated `/api/admin/site-content` with optimistic versions; all navigation controls open existing modules. Never insert sample bookings or customers from the visual mockup into production.
- Service worker cache revision v9 caches only public static assets; maintain original lead security, API guards and all seven existing tourism Worker bindings. This direct Cloudflare deployment does not configure GitHub Actions secrets; future CI-to-Cloudflare deployment still requires explicit owner setup.

## Mobile photo reliability release v3.2.1 — 2026-10-19
- Live dedicated Worker deployment `c1b9d5cd-e712-41d1-baf5-475c2d6ff7c9`, serving all traffic. The user reported blank West/East full-size previews despite good small photo thumbnails in Android. All six large hero/package/tour images are now native `<img>` with safe `object-fit`, gradient readability, a real dark fallback, and existing `photo-loader.js` recovery. Never reintroduce CSS-variable-only background photos for essential assets. Keep Wikimedia attribution visible.
- Public-only PWA cache v10 ensures revised HTML/CSS is served to returning users. Keep `/api/admin`, leads, tokens, D1/financial data out of offline cache. No change to owner security, operator rates or blocked public lead intake.
- Canonical smoke `scripts/smoke.mjs` and `tests/pwa.test.mjs` assert all six image elements and fallback CSS. Future deployments must verify real live source asset responses, and ideally test the mobile UI directly on a phone.

## Owner dashboard crash fix v3.2.2 — 2026-10-19
- `public/app.js` had a fatal boot-time `TypeError: $(...).forEach is not a function` for sidebar tab links and dashboard shortcut cards. Use the shared `$$`/querySelectorAll helper for collections; use `$`/querySelector for single DOM elements. Do not silently bypass dashboard initialization.
- Regression test in `tests/pwa.test.mjs` executes app code in a mock DOM, tests admin opener, sidebar/card routing, mock authorized sign-in and logout. Keep this test when modifying web dashboard.
- LIVE dedicated Cloudflare Worker version `0ff952b8-0100-47c8-9520-b99146e4e5cb`, 100% traffic. Refresh static-only PWA cache v11. Seven Worker bindings preserved including the owner secret; guest lead flag remains OFF. Do not change booking workflow or partner rates to fix a UI crash.

## Retail photo prices and guest disclosure boundary — v3.3.0 (2026-10-19)
- **Public retail-only**: Snorkeling 3 Spots Sharing advertises **Rp350,000 per person**, Island Tour West and East **from Rp800,000 per full car**. Keep both unit and 'from/starting' qualification obvious. These are owner-requested *guest display prices*, not verified supplier net or guaranteed final bookings.
- **Supplier-only**: Initial net snorkeling Sharing Rp200k/person, initial island vehicle net Rp600k/car, min agency margin Rp100k/whole booking and internal math must **never appear on customer-facing tour pages, photos or language.js**. Retain the historical operator rate rows and price guard for admin quote calculations.
- Guest photo badges and CMS allowlisted text keys: `price.snorkeling`, `price.island`, `price.west`, `price.east`; admin owner must review changes under both `id` and `en`. Display-only marketing text must not override the mathematically safe final quotation.
- Remove public internal fare arithmetic; don't remove admin quote preview, historical rate snapshots, audit/finance workflows or server price minimum guards. Snorkeling Private retail rate not public until verified. Extras and activity availability must be confirmed.
- LIVE Tourism-only Worker v3.3.0 `06852dc8-6d4c-4a8a-8a3f-a2ea589d056b` at 100%; seven existing bindings preserved, public guest lead gate still OFF. PWA static cache v12; automatic GitHub Worker deployments remain separately opt-in.

## WhatsApp guest acquisition & owner-only Cloud API workflow (v3.5.0)
- Owner-approved business chat: `https://wa.me/628561752525`; owner-approved business catalog: `https://wa.me/c/628561752525`. They MUST remain distinct public links in homepage contact, detail pages, and mobile floating CTA. Locale switch modifies only optional prefilled chat text.
- Dashboard WhatsApp tab has copied reply snippets plus a **disabled-until-connected** verified message inbox, Cloudflare Workers AI human-review drafts, and a send control requiring owner confirmation for each message. The lack of Meta access is not a software defect. Do not claim WhatsApp messages are already connected, read or sent.
- Integration is **fail closed** unless `WA_WEBHOOK_ENABLED=true`, Meta App Secret, verify token and Phone Number ID are present. Incoming webhooks require HMAC-SHA256 `X-Hub-Signature-256`, must match the expected Meta Phone Number ID and insert deduplicated text messages only into dedicated tourism D1. Admin endpoints remain protected by existing `ADMIN_TOKEN`.
- Outbound sending additionally requires `WA_SEND_ENABLED=true` and `WA_ACCESS_TOKEN` granted by the owner after lawful Meta onboarding. Only manually approved replies to recent inbound conversations in the ~24-hour customer-service window; no campaign blast, automated reply, or unsupervised guest quote. Server rate limits and outbox request dedupe are required.
- Additive migration 0010_whatsapp_inbox.sql; do not replay historic ALTER migrations. Complete final privacy and data retention review before enabling message capture. See `docs/WHATSAPP_SETUP.md` for Meta coexistence steps and secret storage in the Tourism Worker (not ChatGPT or GitHub).
- Official WhatsApp Cloud API can have fees. Preserve `PUBLIC_LEADS_ENABLED=false`, all operator/quote/payment gates and the separate FinChat/Spenva infrastructure.

## v3.5.0 live Cloudflare release verification — 2026-10-19
- Direct deployment ID `396ed52a-9d76-401e-bb4c-2705dfe08a00` serves 100% of traffic. Public WhatsApp chat + catalog, owner inbox UI, official signed webhook and safe manual send adapter are uploaded.
- Applied and verified only additive D1 migration 0010 on the dedicated tourism DB. All seven pre-existing Workers bindings preserved; no WhatsApp API credentials are currently configured. Do NOT claim the new inbox is reading guest conversations yet. Public lead intake remains false.
- Official Meta Cloud API onboarding must be done by the owner. Do not collect OTPs or passwords, auto-send, or migrate the existing mobile app number blindly.
