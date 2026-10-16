# Changelog

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
