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
