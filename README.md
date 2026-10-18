# Marketing Turism — AI Tourism Marketing & Booking Agent

Repository: rama160/Marketing-turism. Release 3.0.0 (MVP pilot).

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
Migrate: npx wrangler d1 migrations apply marketing-turism-db --remote
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
