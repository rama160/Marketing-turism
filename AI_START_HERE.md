# AI START HERE — Marketing Turism Agent
Version: 3.0.1 | 2026-10-17 | Repository: rama160/Marketing-turism

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
