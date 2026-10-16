# Test and Release Plan — v2.0.0
## CI automatable
1. Syntax-check Worker, pricing module and UI.
2. Verify snorkeling per-person pricing and Rp100k minimum per booking.
3. Verify vehicle pricing per car, not per guest.
4. Verify seating limit and missing boat return price refusal.
5. Verify lunch and boat independent rate net additions.
6. Reject unverified operator rates and negative contributions.
7. Reject competitor price below floor; reject underpriced guest sale.
8. Build public dist/ artifact.
9. Live smoke /api/health, /api/public/catalog, HTML, JavaScript.
10. Ensure unauthenticated admin request denied.
11. Ensure public lead intake disabled until compliance authorization.

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
