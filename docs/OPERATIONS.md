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
