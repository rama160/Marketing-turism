# AI START HERE — Marketing Turism Agent
Version: 2.0.0 | 2026-10-16 | Repository: rama160/Marketing-turism

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
6. Always use owner authorization for sensitive CRUD and limit public forms.
7. Never claim payment success from a screenshot; require actual externally verified funds.
8. Validate build locally and in GitHub Actions; live smoke checks are separate.
9. Never touch existing FinChat/Spenva Cloudflare resources. Marketing Turism resources are isolated.

## Production checklist
Real operator agreements and tariffs, capacity, cancellation rules, marine safety, contact and legal identity, privacy notice, payment destination, tests, publication rights and guest support process must be confirmed before public lead intake is enabled.
