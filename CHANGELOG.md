# Changelog

### 3.0.0 — Public website finishing pass (2026-10-18)
- Island tour hub now clearly offers West and East, photos, and a mobile-readable table with conservative one-car Sharing economics.
- New 3.0.0 web regression tests cover credited photo galleries and group floor; official Nusa Penida Experiences icon and masthead aligned.
- No change to customer payments, secrets, shared Workers, or database pricing.


## 3.0.0 — 2026-10-18
- Owner confirmed Nusa Penida Experiences as official business/trade name; public web copy and PWA naming updated.
- Sharing snork net Rp200k per guest, max 20 (draft); private Manta Bay all-in Rp1.5m and Manta Point all-in Rp2.8m per booking (draft).
- West/East island tour route variants, Private/Sharing net Rp600k per full car up to 7; Sharing financial floor never relies on hypothetical future passenger counts.
- New versioned route_id and pricing_scheme schema (D1 0008) and historical rates preserved.
- Licensed scenic Nusa Penida West/East galleries and snorkeling spot descriptions with Wikimedia Commons attribution and safety caveats.
- Public guest lead intake remains disabled until real contact, privacy/refund business approval and supplier confirmation.


## 2.9.1 — 2026-10-17
- Enforce maximum seven verified passenger seats for an island-tour vehicle rate, including Sharing and Private; no operator can accidentally approve a vehicle cap above the agreed safe threshold.


## 2.9.0 — 2026-10-17
- Guest and agent can select SHARING or PRIVATE for both snorkeling and island tours.
- D1 migration 0007_booking_modes.sql saves lead/quote mode and mode-specific supplier net versions, independent of LEGACY rates.
- Sharing requires verified per-person tariff with no-empty-seat-cost operator guarantee and confirmed vehicle/boat capacity.
- Private accepts 1 guest when full exclusive operator costs plus agent/payment costs and >=IDR 100k contribution are covered. Snorkeling private requires a verified fixed boat/charter net fee.
- Added pricing, end-to-end integration and separate rate-version tests; preserves legacy quote snapshots.
- Operator selection/availability and guest acceptance remain human-controlled; no automatic seat assignment, guest payment or public lead intake activated.


## 2.8.0 — 2026-10-17
- Added product-specific informational Nusa Penida landing pages for snorkeling and island tours, with distinct inclusions and booking caveats.
- Added draft search/sitemap and OG metadata. Pages marked noindex while business and brand verification are incomplete.
- Added editable organic marketing launch kit for Instagram, TikTok, Facebook, WhatsApp Business, YouTube Shorts, Google and travel marketplace applications.
- PWA public-static offline cache now includes informational landing pages only.
- No social account automatically created, linked, or posted to. No guest payment or lead intake enabled.


## 2.7.0 — 2026-10-17
- Propose public trade branding Penivara Experiences, preserve original repository and Cloudflare targets.
- User confirmed fast boat RETURN net Rp150,000 per guest per way; add draft supplier rate not a verified supplier rate.
- Add draft graduated cancellation terms: H-7+ 25%, H-6..H-3 50%, H-2..H-1 75%, H-day/no-show 100%, with separate operator/safety cases.
- Deterministic cancellation preview, partial refund audit metadata and explicit owner supplier-cost review. No automatic transfer or false payout.
- Bank transfer supported as manual receipt confirmation; QRIS remains unconfigured.
- Expand manual campaign draft channels and publishable attribution links without paid promotions or automatic messaging.
- Business identity, legal/privacy signoff, real operators and channel account permissions are still required for launch; leads remain OFF.


## 2.6.0 — 2026-10-16
- Aligned Cloudflare Workers static-assets CSP with live pilot: allows Turnstile script and secure frame only.
- Added privacy-safe PWA offline static shell, scalable SVG icon and install manifest metadata.
- Offline cache expressly excludes guest PII, admin authentication, API endpoints and payment responses.


## 2.5.1 — 2026-10-16
- Add backend Turnstile integration tests for hostname mismatch, wrong challenge action, and accepted legitimate lead with explicit consent (local mock only).
- Display configured public business contact in customer page when available, without exposing internal owner credentials.


## 2.5.0 — 2026-10-16
- Added owner Business Profile settings with lead intake readiness gates.
- Created standalone public privacy and service terms pilot notices (not yet production legal policies).
- Added Cloudflare Turnstile widget and mandatory backend siteverify including origin host and action checks for all accepted leads.
- Guest form remains disabled while business identity, Turnstile secret, policy approvals and the independent Cloudflare enable flag are incomplete.
- Added D1 migration 0005, integrated readiness tests, and public smoke checks for privacy/terms and admin boundary.
- No changes to FinChat/Spenva cloud resources.


## 2.4.0 — 2026-10-16
- Added weekly autonomous campaign DRAFT creation via Cloudflare Cron Trigger (only marketing-turism-agent) every Monday 01:00 UTC; no unattended posting.
- New idempotence ledger migration 0004_scheduling.sql and local D1 scheduled integration test.


## 2.3.0 — 2026-10-16
- Fix reschedule deadlock that previously prevented handover after owner and operator approval.
- Prevent payment while booking change is pending, protect payment and handover state transitions against duplicate submissions.
- Validate exact calendar dates; expand full D1-backed integration suite for reschedule/payment/manifest/handover.


## 2.2.1 — 2026-10-16
- Fixed deprecated Workers AI model references: switch from `@cf/meta/llama-3.1-8b-instruct` to supported fast variant in both Sales and Marketing drafts.
- No other Cloudflare Worker, domain, secret or D1 database modified.


## 2.2.0 — 2026-10-16
- Added AI Sales Assistant with deterministic lead scoring and guarded response drafts.
- Added manually entered competitor marketplace price comparisons by product, unit, guest count and observed date.
- Added campaign draft/approval/manual published URL tracking and optional consent-aware attribution on lead intake.
- New migration 0003_marketing.sql and regression tests; no automated messaging, price scraping or ads spending.


## 2.1.0 — 2026-10-16
- Added additive D1 migration for booking guest manifest, operator payable allocation and money tracking.
- Added guarded owner-confirmed reschedule, cancellation before payment, and full-refund request/approval/execution records.
- Added operator settlement dashboard and booking manifest input, refund controls, and immutable quote-to-net allocation.
- Added deterministic operations tests; public lead intake stays disabled.
- All changes only target Marketing-turism repository and marketing-turism-agent Worker / D1. Never modify FinChat or Spenva resources.


## 2.0.0 — 2026-10-16
- Bootstrap GitHub repository rama160/Marketing-turism.
- Responsive customer PWA and owner dashboard.
- Cloudflare Workers API and D1 migration with draft operator rate card.
- Verified immutable operator rate versions, protected pricing floor, lead, quote, booking, manual payment verification and handover.
- Marketing content drafting and GitHub Actions tests/build.
- Pending verified partner details, secrets, deployment and real operational acceptance.
