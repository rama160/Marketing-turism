# Marketing Turism — AI Tourism Marketing & Booking Agent

Repository: rama160/Marketing-turism. Release 2.2.0 (MVP pilot).

Responsive customer PWA + Cloudflare Workers/D1 backend for independent Nusa Penida tourism sales agent. Tourism only. Guest pays agency; local operators deliver activities.

## Implemented
- Customer catalogue and lead form, disabled until privacy and production settings approved.
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
Migrate: npx wrangler d1 migrations apply marketing-turism-db --remote
Local server: npx wrangler dev
Deploy: npx wrangler deploy (only after checking settings and secrets).

## Cloudflare
Dedicated D1: marketing-turism-db, binding DB. Worker: marketing-turism-agent.
Set ADMIN_TOKEN secret (24+ chars), RATE_SALT secret, then carefully enable PUBLIC_LEADS_ENABLED=true when privacy/anti-abuse controls are approved. Site served at workers.dev or assigned domain after deployment.

## Restrictions
No automatic bank settlement and no partial refunds; full refunds are entered only after owner confirms actual transfer. No live payment gateway, external booking supplier API, mass WhatsApp messaging, auto-posting, or fully autonomous marketing campaigns. No verified real-world operator tariff/contract yet. All starting net rates are DRAFT. Return boat tariff and 7th car seat require operator confirmation. No simultaneous snorkeling+island tour on the same day. Booking payment requires human verification, and handover requires operator acknowledgment.

See docs/OPERATIONS.md. Never commit credentials, personal guest details or bank credentials.
