## Compact interactive agent dashboard (v3.17.0)
- A complete, visually restrained, responsive workspace inspired by the **layout** of Ceritexa sample: sidebar on desktop, bottom nav on Android, slim contextual tabs, light cards, clear current section, and small action-first homepage.
- Six primary groupings: Home, Guest/Sales, Content/Campaigns, Acquisition, Analytics, Settings. Map all existing original operational pages to these groups without dropping controls or backend workflows.
- Ensure growth, campaigns, WhatsApp long pages have inner page selector; only selected section is shown and scrolled independently. Never disable required fields; form validation and approval actions remain preserved.
- At most one View Website button. Keep guest marketing pages entirely separate. Analytics must use only saved live data with explicit blanks/zeros instead of inventing impressions.

## Owner login persistence & explicit logout
- Owner enters ADMIN_TOKEN once per trusted browser and remains signed in after refresh, navigation, closing Android PWA or reopening browser. Only pressing Logout intentionally ends that device session.
- Use revocable opaque server sessions in D1 and a Secure HttpOnly SameSite=Strict cookie scoped to /api/admin. Do not persist the admin token to localStorage/sessionStorage/IndexedDB or service worker.
- Dashboard startup automatically checks/reissues valid session cookies; Login POST establishes session; Logout POST revokes it and shows login again. Protect mutation requests against cross-origin CSRF, and continue rejecting unauthorized direct admin API calls.
- Security invalidation or long inactivity expiry can still require a new token: owner-controlled logout is not a claim of technically infinite credential validity.

## Website/dashboard product boundary — 27 October 2026
- Public Nusa Penida Experiences website must not show admin login, supplier nets, campaign management, analytics or dashboard link anywhere; visitors can only browse and submit real opt-in requests/WhatsApp contacts.
- Agent application must open the /dashboard.html route directly, show a branded owner sign-in if no token is available, and provide a website view control.
- Logged-in owner sees clean interactive multi-page operations with a stable sidebar (mobile hamburger), homepage shortcuts, data-backed KPIs, persistent selected section across refresh, logout and original controlled business/marketing actions.
- Preserve entire CRUD/lead/sales/WhatsApp integration via existing authenticated backend, not a second duplicate service, and do not expose API data in public caching or HTML.

## Owner-assisted group acquisition & Nusa Lembongan — Oct 27
- Add Nusa Lembongan and optional Nusa Ceningan intent to the discovery source/query and dashboard distinct from Penida.
- Owner can save public Facebook Group links, summarized group rules, and manual join status. Owner can supply publicly available group post URL, its original publication time and a short de-identified question summary. Agent scores and drafts a factual, non-price reply that discloses affiliation. Owner alone chooses and performs all interactions in Facebook.
- No Groups API use, automated membership, auto comments/posts, bulk messaging or harvesting private memberships/identities. No auto-created opt-in leads/bookings.
- Lembongan product pricing, supplier availability and booking are disabled as unverified until approved supplier cost and service scope exist; do not reuse Penida bookings or packages as verified Lembongan supply.

## Multi-platform acquisition research — 27 October 2026
- Discover recent, actionable Nusa Penida travel questions from authorized/public sources, not solely Reddit.
- Automated: Reddit, Bluesky public search, permitted own Facebook Page and Instagram Business comments; optional official YouTube Data API. Partner research: public OpenStreetMap lodging.
- Manual follow-up hubs: Facebook Groups, Instagram public hashtags, TikTok, Threads, YouTube, X, Tripadvisor, maps. Official API restrictions must be reported and no private scraping is allowed.
- Owner dashboard shows network, publication age, title, freshness and recommended reply draft. Never count observations as consented leads or guaranteed bookings.
- All first-party sales, booking, WhatsApp and publishing permissions remain unchanged. No unsolicited messaging or automatic group posts.

# PRD — AI Tourism Marketing & Booking Agent v3.0.0
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
FR-17 Sales assistant computes lead score and drafts messages without auto-sending or fabricated prices.
FR-18 Campaign draft -> owner approved -> manually posted with real URL.
FR-19 Owner enters dated marketplace prices with comparable units; never replace price floor.
FR-20 Lead attribution is recorded only for consented leads referring to already published campaigns.
FR-21 Owner edits legal business contact and must approve final privacy/refund policy before lead intake.
FR-22 Server must validate Turnstile token against Cloudflare and matching hostname/action; no verified token, no stored customer record.
FR-23 Public privacy and terms pilot notices are available, but must be replaced with complete legally reviewed documents before activating guest intake.

FR-24 Trade brand editable independently of legal business name; Penivara Experiences provisional only.
FR-25 Draft cancellation policy calculator preserves version/penalty/refund amount, confirms supplier exposure review and logs actual bank settlement; operator/safety cases reviewed separately.
FR-26 Return boat net Rp150,000 per person as unverified supplier draft; per-operator rate versioning remains.
FR-27 Manual bank transfer; QRIS absent until officially provisioned. No deposit without confirmed supplier and written guest terms.
FR-28 Campaign templates for multiple channels, published attribution URLs manually recorded; no direct API posting without user-approved linked accounts.

## Deferred, NOT launch-ready
Full WhatsApp outbound, Google/Meta organic post automation, GetYourGuide pricing API, paid ads campaigns, payment gateway/webhook, real availability APIs, operator automated portal, invoice/voucher PDF, partial refund, automatic refund funds transfer, OAuth, scheduling autonomous content, analytics attribution and genuine end-to-end payment testing. None should be described as enabled.

## Security
Public lead collection OFF by default pending legal/privacy readiness. Admin bearer token must be kept outside repository; do not persist guest contacts in public browser storage. Do not attempt competitor price scraping against platform restrictions. Operator in charge of marine risk and guest safety.

## Success metrics
Qualified leads; booked and paid conversions; margin contribution; failed quotes; operator response time; refunds and safety incidents; approved marketing content performance.

## Guest-selectable SHARING/PRIVATE (2.9.0)
Both snorkeling 3 spots and island tour have SHARING (guest can join other parties) and PRIVATE (exclusive activity even with 1 guest). The public form and admin quote must record the selected mode. Provider fare and safe capacity must be verified for that specific mode; do not infer sharing group occupancy. Shared per-person supplier rates must explicitly guarantee there is no cost for unused seats. Private island tour charges a whole vehicle; private snorkeling requires verified person net plus an explicit per-booking exclusive boat/service charge. Selling floor must cover every verified provider cost, agency expenses, payment fees, and >=Rp100,000 contribution per booking. Legacy price rows remain unchanged. No binding guest booking/payment without operator availability confirmation.

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
