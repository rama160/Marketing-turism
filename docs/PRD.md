# PRD — AI Tourism Marketing & Booking Agent v2.1.0
## Goal
Support an independent travel sales agent in Nusa Penida to attract consenting leads, qualify guests, quote tourism activities without loss, collect guest payments via verified manual processes, hand over activities to local operator, and retain auditable records.

## Roles
Guest: browses activity and requests offer. Owner: manages catalogue, partners, rates, quotes, verified payments and handover. Operator: executes service, manually confirms capacity/availability and receives manifest. AI: drafts sales content and recommends price; cannot independently approve operational or financial events.

## Product catalogue
SNORKELING_3_SPOTS per person; ISLAND_TOUR_CAR per car; LUNCH, BOAT_OUT, BOAT_RETURN separate add-ons. Each add-on may use a different operator. Return fare requires independent verification. No same-day package combination.

## MVP acceptance
FR-01 Public responsive bilingual-ready (Indonesian first) customer website and enquiry form.
FR-02 Explicit consent before storing contact data and anti-spam protection.
FR-03 Private owner login; secrets never embedded in frontend or repo.
FR-04 Add/verify/deactivate operators; free choice of provider by activity.
FR-05 Create immutable rate versions with net IDR per person/per car and capacity for car.
FR-06 Quote calculation on backend, not from browser; floor markup Rp100k and cost-inclusive positive contribution.
FR-07 Human approval of suggested public price; quote snapshot records source rates.
FR-08 Lead listing/status. Operator availability confirmation before approved quote.
FR-09 Booking from approved quote only. Incoming payment marked after owner checks real funds.
FR-10 Handover only once paid and operator acknowledges guest, date and scope.
FR-11 AI-assisted caption drafts with owner review, no unattended publishing.
FR-12 Cloudflare D1 persistent records, dedicated Worker, GitHub CI tests and live smoke.
FR-13 Guest manifest stored per booking, with manual owner confirmation before handover.
FR-14 Allocate quote snapshot net to each operator and record separately when owner actually transfers funds to operator.
FR-15 Allow audited request/approve or reject reschedule, unpaid cancellation, and full refund with an externally verified settlement reference.
FR-16 Changes cannot rewrite original quote snapshot, ignore held operator liability, or automatically move money.

## Deferred, NOT launch-ready
Full WhatsApp outbound, Google/Meta organic post automation, GetYourGuide pricing API, paid ads campaigns, payment gateway/webhook, real availability APIs, operator automated portal, invoice/voucher PDF, partial refund, automatic refund funds transfer, OAuth, scheduling autonomous content, analytics attribution and genuine end-to-end payment testing. None should be described as enabled.

## Security
Public lead collection OFF by default pending legal/privacy readiness. Admin bearer token must be kept outside repository; do not persist guest contacts in public browser storage. Do not attempt competitor price scraping against platform restrictions. Operator in charge of marine risk and guest safety.

## Success metrics
Qualified leads; booked and paid conversions; margin contribution; failed quotes; operator response time; refunds and safety incidents; approved marketing content performance.
