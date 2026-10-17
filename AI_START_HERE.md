# AI START HERE — Marketing Turism Agent
Version: 2.7.0 | 2026-10-16 | Repository: rama160/Marketing-turism

## Immutable user-approved business rules
- Tourism experiences only: snorkeling, island tours and added activities by verified local operators. Agent owns guest acquisition, price presentation and payment collection; operator delivers activity.
- Snorkeling 3 spots: initial net Rp350,000 per person.
- Island car: initial net Rp600,000 per car, seating 6 or 7 must be verified by each partner.
- Lunch: initial net Rp150,000 per person; extra to island car.
- Fast boat: initial net Rp150,000 per person per ONE WAY. Return fare not automatically assumed equal; confirm separate operator rate.
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
