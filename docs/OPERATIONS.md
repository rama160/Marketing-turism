# Marketing Turism Agent v2.0.0 — Operations
## Completed code
Static PWA + owner-protected Cloudflare Worker API + D1 schema, operator/rate CRUD, immutable rate history, lead capture (disabled by default), admin quote pricing with Rp100k gross markup per booking, bookings, manual payment verification, operator handover, copywriting drafts and CI test/build.
## Required before live business
1. Set Worker secret ADMIN_TOKEN (random 24+ characters). Never place secret in GitHub.
2. Verify operator identity, agreement, actual 6 vs 7 car-seat capacity, snorkeling facilities, guest policies, safety and availability.
3. Set operator to VERIFIED and enter new VERIFIED rates. Existing rates are intentionally DRAFT.
4. Check NIB, refund rules, privacy disclosure, payment ownership, local rules. Enable PUBLIC_LEADS_ENABLED=true only after readiness and protection from spam.
5. Verify guest money in actual bank or trusted payment provider before clicking PAID. A screenshot is insufficient.
6. Owner approves final quote, operator confirms availability, then issue booking. Handover only when paid and operator acknowledges guest list.
## Limits
No payment gateway, WhatsApp automated outbound, live marketplace scraping, automated AI posting, confirmed operating permits, or proven external sales. Workers AI optional and drafts only. All pricing is deterministic and never AI-driven below safe floor. A combined snorkeling+island tour same-day package is not offered. Boat return net must be independently verified.
## Dev and deployment
Run npm run ci. D1 migrations: npx wrangler d1 migrations apply marketing-turism-db --remote.
In Cloudflare configure D1 binding DB, Workers AI binding AI, ADMIN_TOKEN secret and PUBLIC_LEADS_ENABLED public variable. Worker assets at public/. Build artifact dist/ on GitHub Actions.

## 2.1.0 Operations
- Before handover, populate and confirm booking guest manifest, confirm payment in banking/provider independently and verify operator acknowledgement.
- Operator payable allocation is based on the initial quote price snapshot; never recompute from today's net rates. Mark an operator as PAID only after the actual transfer has been confirmed with reference.
- Reschedule requires operator's confirmation of the replacement date. The quote snapshot stays immutable; booking_schedule records the service date override.
- Unpaid booking can be cancelled. Paid booking requires full-refund workflow; request, owner approves, bank/provider funds refunded, then EXECUTED with external reference. No partial refunds in this pilot.
- When a refund is approved, unpaid operator liabilities are put ON_HOLD. Previously paid operators require separate human reconciliation and could result in financial exposure.
- Cloudflare Resources: only marketing-turism-agent and marketing-turism-db. Avoid any CLI command that changes the account worker subdomain, zone, or existing FinChat/Spenva deployments.

## v2.2.0 AI Sales and marketing
- AI and template sales replies are OWNER REVIEW drafts only, and must not include personal contact values in AI prompts.
- Marketplace prices entered through dashboard are manually verified snapshots, not scraped. They must not override the minimum price policy or be compared across unlike group sizes/inclusions.
- Campaigns are not posted by this system. Publishing status requires real URL of an owner-published post. Lead attribution can tag already published campaigns when guest consents and form is enabled.

## v2.4.0 autonomous-but-safe workflow
A weekly Cloudflare cron on marketing-turism-agent generates two Website campaign DRAFT records using fixed, price-free templates. Owner reviews/publishes manually and adds real publication URL. Scheduled runs use unique run ID to prevent duplicates. Cron timezone is UTC: `0 1 * * 1` = Monday 09:00 Bali time.

## Deployment isolation (permanent)
Run `npm run ci` before any deploy. This performs `scripts/preflight.mjs` target checks for the dedicated Marketing Turism Worker and D1. Never set Wrangler `name` to `finchat-ai-gateway` or `spenva-play-billing`, and never change account-wide Workers subdomain or shared DNS routes.

## 2.5.0 Guest reception readiness
1. Worker and D1 remain dedicated to Marketing Turism. Create Turnstile Managed widget on `marketing-turism-agent.finchat-ai-gateway.workers.dev`, public sitekey `0x4AAAAAAFYd9j0rAcoO31Rh` embedded on guest page.
2. Place the matching SECRET through Cloudflare dashboard **Workers & Pages > marketing-turism-agent > Settings > Variables and Secrets > Add secret** as `TURNSTILE_SECRET`. Secret has not been embedded in this repository. Verify secret exists in Cloudflare before continuing. Never send the secret in chat or commit it.
3. Replace pilot privacy/terms pages with genuine legal business details, retention policy, refund/cancellation timelines, customer rights and contact.
4. On owner dashboard, enter official business name and contact. Approve checkboxes ONLY after real policy review.
5. Verify operator contracts, correct tariff and capacity before creating any sale. After all protections are in place, set Worker variable `PUBLIC_LEADS_ENABLED=true` on the dedicated tourism Worker. Default stays FALSE. Test consent, Turnstile, booking, payment and refunds with permitted test data before receiving real funds.
6. Turnstile siteverify checks hostname and lead_enquiry action; fail closed if verifier is unavailable or invalid.
7. Do not change other workers or account-wide DNS. Do not claim this pilot privacy text meets legal requirements for a full commercial launch.

## 2.7.0 Penivara Experiences setup
- The trade name Penivara Experiences is a provisional branding suggestion; search DJKI and platform handles before launch and obtain owner confirmation.
- Do not modify the dedicated worker/database names or shared Cloudflare Workers subdomain.
- Operator details may wait until a guest enquiry; do not quote or collect guest money until verified price, capacity, time and availability are confirmed.
- Owner says 6–7 passengers car: actual max seats is verified per operator and vehicle, cannot assume 7 without evidence.
- Boat net Rp150,000/guest/leg both ways, still unverified supplier DRAFT. Lunch net Rp150,000/guest; island car net Rp600,000/car; snorkeling net Rp350,000/guest; markup ≥Rp100,000 per booking after costs checks.
- Manual bank transfer only. QRIS has not been created. Do not request or record banking password/OTP or make up payee details.
- Draft guest cancellation schedule 25% H-7+, 50% H-6..H-3, 75% H-2..H-1, 100% same day/no-show; read /cancellation.html. Review UU No.8 Tahun 1999 Art.18, supplier contracts and clearly obtain consent prior to accepting payment. Supplier cancellation and hazardous/weather cancellation are not guest voluntary forfeiture. Owner approves and verifies any manual bank refund, avoiding unilateral withholding and improper claims of guaranteed profit.
- Create individual organic content drafts across Instagram, Facebook, TikTok, YouTube Shorts, WhatsApp Business, Google Business Profile, Telegram. Manually publish and enter actual URL. To enable API automation, establish permissions/connectors separately. Partner marketplace listings require separate account approval.

## Sharing and Private operational instructions (v2.9.0)
1. For each operator and activity create distinct SHARING and PRIVATE rate rows; never reuse an old LEGACY price as proof of the new service.
2. SHARING requires actual operator agreement for net per passenger regardless of spare seats. If partner demands paying for the whole car/boat when underfilled, do not tick "sharing guaranteed" and do not issue a binding quote. If a common departure is manually arranged, get written confirmed participant roster, seat availability and financial exposure prior to approving.
3. PRIVATE island tour can carry a single paying passenger but full exclusive vehicle net remains due. Private snorkeling can carry one passenger when boat/charter fixed fee and per-person charges are confirmed and included.
4. Never sell beyond operator verified capacity. Sharing does NOT guarantee a departure or physical seat until operator acknowledges it.
5. For all modes, quote floor includes verified supplier charges, agency costs, payment fees and >=Rp100,000 profit contribution per booking. Extra lunch and both boat legs priced per guest separately.
6. Existing snapshot quotes and paid bookings are never re-priced. Operators still may be onboarded later when there are consenting leads; do not issue binding payment instructions in advance.

### v3 business launch and full car Sharing
Official self-reported name Nusa Penida Experiences. Keep false `PUBLIC_LEADS_ENABLED` and no payment until official WhatsApp/email, operator agreements and verified privacy/refund terms. Operator net rates provided by owner remain drafts in D1. New Sharing West/East: even 1 guest must cover the entire vehicle if there is no confirmed group pooling. For guests n, minimum base booking total is `Rp600k + Rp100k margin + actual agency costs and payment fees`; extra lunch and boats added per guest. Private snorkeling packages are Manta Bay Rp1.5m and Manta Point Rp2.8m all-in per booking before markup/add-ons, subject to operator-confirmed group capacity and 3 actual spots. Never describe wildlife sightings as guaranteed. Photo source/attribution is Wikimedia Commons, each caption links to source licensing. No use of FinChat/Spenva workers.
