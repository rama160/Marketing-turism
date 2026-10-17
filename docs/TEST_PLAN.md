# Test and Release Plan — v2.7.0
## CI automatable
1. Syntax-check Worker, pricing module and UI.
2. Verify snorkeling per-person pricing and Rp100k minimum per booking.
3. Verify vehicle pricing per car, not per guest.
4. Verify seating limit and missing boat return price refusal.
5. Verify lunch and boat independent rate net additions.
6. Reject unverified operator rates and negative contributions.
7. Reject competitor price below floor; reject underpriced guest sale.
8. Build public dist/ artifact.
9. Split payables by immutable rate-provider mapping and block mismatched net sum.
9a. Reject premature full refund or missing real settlement reference.
9b. Require verified operator before reschedule approval and manifest before paid handover.
10. Live smoke /api/health, /api/public/catalog, HTML, JavaScript.
10. Ensure unauthenticated admin request denied.
11. Ensure public lead intake disabled until compliance authorization.

## AI Marketing regression
- LeadScore tests hot/cold, reply draft with no invented monetary price.
- Comparable market-price reference normalizes guest count and rejects mismatched group-size comparison.
- Campaign publication must require owner confirmation and real URL; cannot publish automatically.

## Business/Turnstile protections
- Confirm public readiness false while no valid business identity/terms approvals exist.
- Confirm no owner-less edit of business profile.
- Confirm no accepted lead without Turnstile response even if launch flag is true.
- Confirm Cloudflare Turnstile action and hostname are verified server-side and fail closed on outage.
- Test privacy and terms pages load from public origin with appropriate security policy.

## Manual acceptance before launch
1. Operator A and B rate versions; old quote snapshot remains unchanged.
2. Set tour operator, separate lunch operator and separate boat operator.
3. Successful lead with explicit consent and lawful privacy disclosure.
4. Date, passenger capacity and full quote approval.
5. Payment proof alone must not mark PAID; owner checks actual funds.
6. Operator confirmation / manifest before handover.
7. Recover from network offline, invalid token, invalid JSON and lost tab.
8. Return fare different from outbound correctly priced.
9. Refund/reschedule policy workflow and refund ledger (must be developed before accepting prepaid cancellations).
10. End-to-end real guest journey, including safety and incident escalation.
## Release gates
No real guest sales until privacy policy/business info, operator verification, bank settlement path and refund handling approved.

## New cancellation and sales tests
- Exact cutoff H-7, H-6..3, H-2..1, H-day; penalties never decrease closer to visit.
- Operator cancellation/unsafe condition does not apply guest forfeiture.
- Refund preview cannot override net margin or imply supplier fees refunded; owner must inspect exposure.
- New boat return draft price never becomes verified automatically.
- Official business name stays separate from temporary marketing trade name; intake stays fail closed.
- Manual social media content is not posted or sent by AI and QRIS stays marked unavailable.
