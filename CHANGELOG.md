## 26 November 2026 — Record GSC custom processing and first visible page
- Owner screenshots confirm first visible page west-tour.html and Custom report still processing; exact custom dates not visible. Consistent with NO_ROWS; proceed with data coverage improvements before Keyword Planner. Documentation only.

## 26 November 2026 — Record first visible Search Console impression
- Document owner UI evidence (24-hour provisional report, one impression, zero clicks, average position 64; query nusa penida west island tour). Existing final snapshot ends 23 Nov; no contradiction, same-period UI comparison pending. Documentation only.

## 26 November 2026 — Audit first GSC result quality
- Read-only database/source audit: raw Google rows 0, 24 seed plans, unavailable Reddit RSS, final period excludes new activity/article publication. Require owner UI comparison and distinguish aggregate/fresh data before moving to Keyword Planner. Documentation only.

## 26 November 2026 — First live GSC research verified
- CI/deploy/Verify 712d061 succeeded; owner dashboard and read-only D1 confirm DONE/NO_ROWS, zero raw rows, 24 active keyword hypotheses, 14 mapped, no observations. GSC connection verified, ranking baseline unavailable. Roadmap v1.0.35 advances to SEO-006A; documentation only.

## 26 November 2026 — Align remaining dashboard asset regression assertion
- CI/deploy 241 pass, 1 fail: website-cms.test.mjs still expected old script URL. Update exact revision assertion, retain application changes and all tests. Release and live GSC verification pending.

## 26 November 2026 — SEO-003B blank keyword workspace
- Refresh dashboard JS revision, surface loading/failures and safe GSC diagnostics, track raw Google rows vs accepted pairs, bootstrap newly configured GSC through existing hourly cron. Add owner navigation and button regression plus mocked Google/SQLite tests. Cache is a hypothesis; actual production snapshot and CI/deploy pending.

## 26 November 2026 — GSC configuration verified
- Roadmap v1.0.34: owner provisioned API, restricted service account and JSON; both Cloudflare secret bindings verified by metadata only. No D1 keyword run yet; next authenticated research and validation (SEO-003B). Confirm key-creation policy restoration. Documentation only.

## 26 November 2026 — Lock ranking-first SEO roadmap
- Update existing roadmap v1.0.33 with ordered gates, sub-task IDs, metrics provenance, owner approval, 28-day measurement, 90/180-day evaluation and exact next action. Record verified Cloudflare GSC_PROPERTY, missing service-account JSON, no snapshots and successful CI/deploy/live smoke for 720bd376. Update AI_START_HERE active instruction. Documentation only; no code or public content change.

## 26 November 2026 — Ranking-first SEO opportunities
- Extend existing keyword workspace with measured non-brand target-pair Top 3/10, quick wins at average positions >10–30, ordered action recommendations and non-overlapping 28-day snapshot deltas. Missing data remains N/A; no new menu, schema, cron, public edits or paid service. GSC credentials and live data pending; CI/deploy not verified.

## 26 November 2026 — Keyword workspace release hardening
- Restore existing cache version contract; first CI 238 pass/3 version assertion failures. Stable seed IDs, archive/rename retained, manual GSC metrics, full observed query-page view, target-pair priority, 500 plan cap. Pending re-run.

## 26 November 2026 — SEO keyword research workspace
- Add owner-only SEO-006/007 keyword planning and measured snapshots: 24 bilingual seed hypotheses, editable intent/cluster/canonical URL/priority/article topic, archive, manual volume/difficulty and competitor evidence with source/date/period/market/device. Existing public question counts measured per cluster; not search volume. Optional read-only Search Console query/page daily via Worker secret, 28 finalized days, maximum 300 rows, no invented metrics, no indexing API; last successful snapshot retained. Discovered query candidates unmapped; flag actual URL conflicts. Reuse daily cron and owner button, one-hour manual limit. Article priority consumes mapped topic priorities and GSC observations; existing weekly review retained. Additive migration, no paid service or credential stored in repo. GSC access pending owner; full volume/difficulty requires source supplied manually. CI/deploy pending.

## 26 November 2026 — Visual travel guide index
- Owner screenshot showed text-only article index. Production D1 confirms first published article has cover ID 73ceaa31-5fbc-4f1b-9f08-f95722ef9b60. Render published cover, title, summary, publication date and localized read link in responsive editorial cards; first owner-ordered article featured, subsequent cards two-column/one-column on mobile. Existing responsive photo variants, first eager/high priority, remaining lazy; neutral brand fallback only for absent cover. Preserve URLs, metadata, order, detail template and data; no new image or DB mutation. Add unit and live smoke checks; release pending.

## 26 November 2026 — Discover and manage published SEO articles
- Owner screenshot: article shortcut absent and published editor/order/delete difficult to find. Add real bilingual homepage navigation links, visible at mobile widths; fix article header navigation on compact screens. Replace dropdown-only admin discovery with visible state tabs and counts, default Terbit, public snapshot cards/cover, edit scroll/focus, direct order panel and existing confirmation guarded deletion. Existing draft/approval/publish, version guard, shared order and stable URLs retained. No data mutation or actual deletion. Tests and smoke added; release pending.

## 26 November 2026 — Single-master bilingual SEO articles
- Owner found mismatched ID/EN first draft. Generate English master, repair only master if needed, translate numbered title/summary/body segments into Indonesian; require matching segment order, headings, numbers and known destination names, reject unrelated translations, allow one translation retry. Structural checks do not certify semantic equivalence; owner review remains required. Include published activity descriptions as evidence, no extra stops without source support. Existing draft correction separate, no new duplicate or auto-publish. CI/deploy pending.

## 26 November 2026 — Recover malformed bilingual article output
- Production attempt 3/3 reached INVALID_DRAFT. Live Workers AI diagnostic returned bilingual JSON but Indonesian body 141 characters, English 765; structured single-language schema diagnostic failed parsing; plain-text Indonesian diagnostic returned 1658 characters. Exact historical invalid field unknown. Normalize safe formatting, state field-specific length problems, require 500–12000 characters per body, repair only invalid language via bounded plain-text call and preserve provenance. One owner-triggered recovery of exhausted INVALID_DRAFT after this format fix (marked v2, no reset, one successful draft/week). No automatic publish, no database writes during diagnostics, no new provider. CI/deploy/live retry pending.

## 26 November 2026 — Recover article research from unavailable external source
- Owner retry 2/3 shows SOURCE_UNAVAILABLE, confirming source-stage failure rather than AI or DB. Add bounded Wikimedia Action → REST summary → reviewed Indonesia Travel reference fallback for stable geography. Record source type, checked date and failed provider stages in draft research metadata; dashboard explicitly labels cached reference. Never claim cached reference is fresh live research; no dynamic prices/times from cache. Existing one draft/week, three attempts, approval and cover requirements preserved. Regression verifies offline recovery and no auto-publication. CI/deploy/live retry pending.

## 26 November 2026 — Restore failed SEO research retries
- Fix Wikimedia exchars 1800→1200 per documented API bounds; handle API error object. Keep existing supported fast Workers AI model, request JSON mode, validate all six bilingual strings; record safe source/AI/format/validation/database stage-specific errors. Existing weekly row CAS allows manual retry after failure (max 3 attempts, legacy failure counts as 1); cron remains once/week and successful drafts never retry. No schema change, no lock reset, no automatic publication. Add regression for legacy failure, manual retry, successful lock and exhausted limit. Release and live retry pending.

## 26 November 2026 — Review feature regression fixture alignment
- Initial CI found four stale assertions for the retired public enquiry form, cancellation label case and previous WhatsApp CTA count. Review validation/visibility tests passed. Align fixtures to the requested WhatsApp-only flow while retaining cancellation links, anti-bot, no-admin-exposure and contextual CTA checks. Add route rejection tests. Release pending.

## 26 November 2026 — Customer testimonials and WhatsApp-only enquiries
- Owner requests immediate self-submitted public reviews with hide/show controls and removal of website enquiry form. Add isolated review D1 migration, public no-store API, Turnstile action/hostname validation, daily HMAC rate limit, consent and completed-trip declaration, plain text only, reject contact details/links, owner session and version-guarded moderation. No verified-booking claim, fake reviews, rating schema or review-as-lead analytics. Replace public form with review section and retain WhatsApp; disable legacy intake with separate flag (existing internal booking/terms safeguards unaffected). Update privacy/terms, bilingual copy, dashboard content Testimoni tab, regression/smoke. No existing data deletion. Deployment and Android test pending.

## 26 November 2026 — Trust and conversion clarity, review/backlink operating plan
- Align outdated pilot/disabled-form wording with manual enquiry readiness, public contact and payment safeguards; keep cancellation draft and legal details pending. Add contextual WhatsApp routes for Lembongan/boat outside existing Penida-only form; do not alter booking API or data. Tests/smoke added. Record authentic review SOP and five outreach prospects in roadmap, no external messages sent. CI/deploy pending.

## 26 November 2026 — Correct English tour catalog test fixture
- CI failed one outdated fixture expecting hardcoded Lembongan text without published catalog. Pass a representative published catalog and assert actual localized anchors, retaining existing metadata/privacy checks. No production code or database changes. Release pending.

## 26 November 2026 — Crawlable internal links and related published guides
- Prior sales copy CI/deploy/Verify passed. Render published dynamic destinations/roots on EN tour pages; use actual published article links to show relevant localized guide anchors on sale pages. Add unit checks and live homepage reachability traversal of sitemap URLs. No new pages, menu, D1 mutation or paid services; release pending.

## 26 November 2026 — Publish verified tour copy in existing CMS
- D1 root activities Lembongan and Boat Ticket updated version 2→3 with revision snapshots and unchanged photos/prices; read-back confirmed. Fix test fixture expected original West title to match updated text, retaining escaping assertion. First release CI/deploy failed on stale assertion; corrected release not yet verified.

## 26 November 2026 — SEO-008 sales copy and trip durations
- Owner confirms 4–5 h per Penida land route and 3–4 h Lembongan land tour (excluding crossings). Preserve existing routes; 3 selected snorkeling sites depending on sea/package; estimated 2–3 h, wildlife disclaimer, separate land day. Boat estimates researched: Sanur–Lembongan 30–45 min; Lembongan–Gili both directions 2–4 h depending on ports and stops. No fixed sailing times, prices, guaranteed sightings or unverified inclusions. Update bilingual defaults, metadata and competitive guide. Dynamic Lembongan/boat content requires separate version-guarded CMS update; release pending.

## 26 November 2026 — Optimize Lembongan activity cover LCP
- Owner PageSpeed report: other five service pages 96–100; Lembongan Island Tour mobile 87, LCP 4.1 s, FCP/Speed Index 0.8 s, TBT 0, CLS 0; accessibility/best practices/SEO 100. D1 read-only reports the published cover is 527627 bytes. Dynamic experience detail cover lacked srcset despite prebuilt WebP variants. Reuse existing responsivePhotoSet in server-rendered HTML, retain original fallback, eager/high priority and current layout; add unit/live regression. No changes to images in KV, CMS records, prices, other templates, or paid services. Release and post-change PageSpeed pending.

## 26 November 2026 — Installed dashboard launch recovery
- Owner reports installed dashboard opens public site. Keep canonical /dashboard.html manifest start and add explicit stable identity/scope, remove public shortcut, open explicit Website preview separately, remove manifest from offline cache and revalidate. Serve dashboard aliases directly via private no-store/noindex HTML shell from build template, preserving host migration and auth. Recover legacy standalone root only on devices marked by visiting the owner dashboard; normal guests and explicit website preview are unaffected. Existing home-screen shortcuts without marker may need reinstallation. No token stored, no SEO URL or DB change. CI/deploy and physical Android launch pending.

## 26 November 2026 — Device-only article covers and permanent delete
- Owner requests direct device upload, not gallery selection or external image retrieval. Keep existing cover if unchanged; upload a new one using existing authenticated media storage, rights confirmation and a quality-prioritized article compression profile (max 1600 px, preserve ratio, JPEG 0.90–0.78, target ≤300 KB, fallback ≤850 KB); original device file unchanged. Existing gallery/other photo flows unchanged. Cover-only scope, no body-gallery feature. Save draft applies replacement/removal; approval resets as before.
- Add direct permanent delete for draft/rejected/approved/published articles. Published deletion requires explicit extra confirmation and current version; public ID/EN routes return 404, sitemap/list omit record after cache refresh. Shared photos not automatically deleted. No production article deleted by implementation. Tests added; release/live verification pending.

## 26 November 2026 — Automated editorial research (draft only)
- Owner explicitly authorizes independent SEO article drafts, not social campaigns or automatic publishing. Reuse daily Worker cron with one research attempt per UTC week and review backlog cap of two. Aggregate existing public Reddit topic signals (not keyword volume), choose uncovered topic, retrieve a fixed Wikimedia source and existing product context; Workers AI generates ID/EN text. Failed source/AI/validation creates no article. Evidence shown in editor; owner selects cover, checks facts, edits, approves current version and explicitly publishes. Reject retains history; edit resets approval; public snapshots isolated. Existing direct-position ordering remains. No new menu, paid API, or new cron. CI/deploy/live scheduled research not yet verified.

## 26 November 2026 — SEO follow-up during indexing quota limit
- Roadmap 1.0.4: record quota blocker; independent keyword research/map and conversion/link audit continue. Add consent-based analytics coverage for public article indexes/details; add localized crawlable parent-tour links on published destination pages. Regression and smoke checks extended; no new menu, URLs, DB or content publication. Live results pending verification.

## 26 November 2026 — Prioritaskan indexasi sisa URL
- Roadmap 1.0.2: buka kembali SEO-002 atas instruksi owner; daftar 18 URL aktivitas bilingual berdasarkan D1 read-only dan kode sitemap, plus dua indeks artikel kosong yang ditunda. GSC verdict belum diperoleh; lanjut pekerjaan SEO setelah gate indexasi. Tidak ada perubahan kode/DB.

## 26 November 2026 — Koreksi baseline SEO roadmap
- Catat hasil GSC yang dilaporkan dalam percakapan 25 Nov: kepemilikan terverifikasi, sitemap 28 URL ditemukan, 10/10 URL awal dilaporkan terindeks. Tidak mengklaim 28 URL terindeks atau audit live baru; daftar URL asli belum tersedia. Lanjutkan SEO-003/004/005, pantau coverage melalui SEO-020. Dokumentasi saja.

## 26 November 2026 — Roadmap SEO berbasis hasil
- Tambah satu roadmap.md sebagai acuan wajib tugas SEO dengan KPI, fase, ID pekerjaan, acceptance criteria, bukti baseline dan siklus evaluasi. Prioritas P0: GSC/indexasi/GA4; konten dan konversi mendahului fitur baru. Hubungkan dari AI_START_HERE dan README.
- Perubahan dokumentasi saja; tidak mengubah kode, database, harga, publikasi artikel, secrets, kampanye, atau konfigurasi deployment. Baseline ranking dan konversi belum diperoleh.

## Homepage destination card editor
- Group homepage destination section copy, static card cover, thumbnail labels and direct photo actions in one editor. Add a main activity or a static detail from the card editor; publication explicitly requested from this workspace appends it to its selected display group using the existing versioned layout API. Dynamic cards show published child thumbnail links and verified prices; order and hide their details with the existing layout control. No schema changes or reset; original static slots and published URLs remain intact. Drafts published in a different session can be placed using the existing layout selector. Photo and activity publication remains owner-confirmed.

## Live verification: published CMS cover and prices
- Align Cloudflare smoke checks with default and owner-customized cover markup, verify the saved bilingual services in order (including an intentionally empty list), and compare price badges to published CMS values. Accept preserved original image markers for owner-replaced photos; existing live image bytes, slot, authorization and SEO checks remain active. No website content, database or secret changes.

## Article list ordering
- Apply direct-position ordering to published article lists in both languages using an independent versioned layout record. Article publication/unpublication remains explicit and sitemap URLs stay intact. Add an article back-to-guide/home link.

## Layout test harness follow-up
- Exercise real shared ordering module in browser-like VM tests, including native history Back preserving authenticated session. Revalidate layout module and rotate offline static cache. No production content edits.

## Direct-position content ordering and navigation
- Add versioned bilingual-independent layout order for homepage package cards, destination cards, thumbnails and static/dynamic detail galleries. Existing published activities can be selected for extra cards and thumbnails; Add Activity/Detail creates new items via existing approval workflow. Hide without deleting data or URLs. Direct position selector for hero and all layout groups; no database migration. Public layout enhancement applies after published activities load. Dashboard tab, CMS view/page, compact pane and article navigation use browser history; remove forced standalone guest redirect; dashboard website link opens same context and public detail pages get Back link. Keep HttpOnly login and explicit logout unchanged. Native Back at the first entry may still exit the app; no fake history trap. Test actual Android navigation and ordering after deployment.

## Editable cover service list and simpler editor
- Replace four fixed hero highlight inputs in the owner editor with one ordered bilingual list (0–8 services; icon, ID and EN labels, add/remove/reorder, fast boat preset, preview, explicit publication). Existing four saved labels remain the default until the owner publishes a new list. Store one versioned value through existing authenticated site-content API; no migration or data reset. Render new list server-side with accessible decorative icons and responsive flow. Move cover photo into Cover section, collapse other photo groups and deduplicate text fields. No change to published photos or automatic campaigns.

## CMS hotfix — 25 Nov 2026
- Fix D1 compound SELECT limit by counting website and article media references separately; merge counts without changing published references or media. Independently settle CMS API loads so gallery errors do not reset published slot photos or activity state. Suppress default photo previews until live slots load, show explicit unavailable states instead of zero counts. Retain existing photo selections and protect referenced media. Add real SQLite regression and D1-limit check.

## Article CMS follow-up
- Editable names for all 12 homepage gallery thumbnails, including separate label for repeated Atuh slot; existing photo references stay shared. Fix nested hero highlight sizing and bilingual article navigation. Add actual SQLite article lifecycle regression, cover foreign-key protection and live article index/404 verification. No article published automatically.

## NPE Studio article CMS and grouped homepage editor (25 Nov 2026)
- Add authenticated article draft/publish/unpublish/delete workflows with separate public snapshots, bilingual text, stable generated slug, metadata, Article JSON-LD, gallery cover, preview and allowlisted tour links; sitemap includes published articles only. Add isolated migration 0026 and protect referenced gallery photos. Public index and article routes; no automatic campaign generation. New covers use existing WebP fallback until next deployment. Group existing homepage fields into Hero, packages, destination cards and contact; list all thumbnail slots and separate cover/galley images. Add editable hero highlights and CTA text; existing shared cover slots remain shared across pages, and duplicate Atuh slots retain their existing mapping. No seed articles published without approval. Verify CI/deploy, authenticated browser editing and Lighthouse before claiming completion.

## Competitive SEO phase 1 (25 Nov 2026)
- Owner PSI baseline on homepage: all four categories 100; LCP 1.8s in one mobile lab run. No homepage performance or booking change in this phase.
- Search competitor examples: nusapenidatransport.com, snorkelinginbali.com, penidaprivatetour.com, nusapenidatravelling.com, lembongantrip.com and scootcruise.com. Prioritise purchase-intent queries, not measured volume or guaranteed rankings.
- Add original bilingual decision guides to existing West/East/Island/Snorkeling pages and existing published Lembongan Island Tour and Boat Ticket slugs. Cover illustrative route sequence, accessibility/safety, shared vs private, pickup, inclusions and total quote questions; distinguish onshore mangrove from snorkeling and ticket directions. Add contextual internal links to existing canonical tours. English legacy detail images reuse existing responsive delivery. No new URL, price, fixed schedule, review, CMS data or paid service. No same-day snorkeling plus land tour promoted.
- Next: measure query/impression/CTR/lead baselines in Search Console/GA4, verify real sale prices and itineraries with operator, research distinct guide topics and legitimate partner backlinks. No measured ranking, volume or backlink acquisition asserted. CI, live smoke and PSI retest needed before declaring deployment complete.

## Mobile performance follow-up (25 Nov 2026)
- Owner Lighthouse retest: mobile performance 72, LCP 13.4s despite payload dropping to ~2.77 MiB; accessibility/best practices/SEO all 100. Third-party challenge traffic is a large remaining contributor, not a proven cause of LCP variance. Load Turnstile explicitly when form comes near viewport or receives focus/pointer interaction; never send a lead without a token, keep server verification and readiness checks. Retry script failures on interaction, reset widget after submission. Retain all photos and layout, GA4 and Cloudflare Analytics. Add browser-like unit test and live smoke markers. Real browser challenge/lead and repeat Lighthouse measurements still required; no actual customer enquiry sent during automated smoke.

## PageSpeed accessibility and CSP follow-up (25 Nov 2026)
- Owner Lighthouse report: four light-background eyebrow labels fail contrast; change base color from #47818b to #255c66, preserve light hero override. The injected Cloudflare Web Analytics beacon is blocked by CSP: allow the official script and collection origins only on existing public document CSP paths, retain dashboard CSP and no unsafe-inline/eval. Add disclosure of Cloudflare performance measurement separately from optional GA4 to existing privacy page; no new tag or paid service. Automated contrast/CSP tests and live smoke added. Browser Lighthouse retest still required. Turnstile remains unchanged to protect booking reliability. Existing provisional privacy text still requires separate business review.

## Responsive image delivery (25 Nov 2026)
- Generate four WebP sizes (240/480/800/1200) for public static images and currently published CMS slot/activity photos during GitHub deployment using Pillow; originals remain in KV and the source archive. No new paid image service. Internal assets are fetched through a bounded Worker selector; new CMS photos without a built derivative fall back to original JPEG until next deployment. Legacy pages use responsive srcset/sizes, homepage thumbnails use smaller sizes, hero preload matches srcset, dynamic cards use responsive candidates. Original URLs, rights, booking and GA4 preserved. Build and live smoke validate derivative formats. Remaining: remeasure payload/LCP, inspect contrast and console diagnostics, automate variants for new uploads if needed.

## Mobile PageSpeed follow-up (25 Nov 2026)
- Owner report: mobile performance 84, LCP 4.5 s, FCP 1.5 s, speed index 1.6 s, CLS .001, TBT 0; image delivery and total payload still need investigation. Extend UUID-addressed CMS JPEG browser cache from 1 hour to 24 hours (deleted cached copies may remain in a browser until expiry). Set lazy/decoding/dimensions before dynamic image source. Add accessible name to the honeypot while retaining its bot protection. No changes to media bytes, payment, bookings, GA4, or paid services. Detailed Lighthouse resource list, contrast nodes and console errors needed to diagnose remaining failures. No claim of a measured speed gain from this patch until retest.

## PageSpeed follow-up (25 Nov 2026)
- Owner PSI baseline: mobile performance 72, desktop 99, accessibility and best practices 92, SEO 100. Mobile LCP reported 16.2s; field data unavailable. Add a final CMS-matched hero preload, correct hero attribution, remove redundant admin PWA precaching from ordinary public visits while retaining dashboard registration. Update smoke assertions to accept correct owner credits rather than falsely demanding Wikimedia for all photos, and verify actual slot URLs, bytes and preload. No CMS media, booking or analytics changes; no paid image transform service. PSI retest and expanded LCP breakdown required to confirm measured improvement.

## SEO performance hotfix (25 Nov 2026, v3.36.0)
- Render validated CMS photo slots directly in legacy public HTML, keeping final hero eager/high priority and gallery lazy loading. Owner attribution is rendered for replaced figure images; invalid/absent slots keep the original. Browser refresh still checks CMS changes. Avoid redundant assignment when current SSR photo matches. Revalidate updated public scripts and refresh public cache. No DB, URL, layout, GA4 or booking changes. CI covers SSR photo trust boundary; live smoke verifies current hero in raw HTML. PageSpeed lab/CrUX scores remain unmeasured; compare mobile and desktop in PSI before attributing numeric improvements.

## Photo reliability hotfix (25 Nov 2026, v3.36.0)
- Preserve all owner-selected media and activity data. Accept existing static JPG aliases, retry transient CMS image failures once, show honest placeholder only if retry fails, and install recovery on dynamic bilingual pages as well. Refresh public asset cache. Production smoke checks every referenced published CMS JPEG and the static JPG alias; no generated substitute photos.

## NPE v3.36.0 — consent-based public Google Analytics 4
- GA4 G-5232NFPSPV on official public origin only, no dashboard, no ads or Google Signals in tag config. Basic consent: no Google tag until opt-in; reject/revoke supported, no booking restriction. No customer form contents, reference, full outbound WhatsApp URL or arbitrary query values in custom events.
- page_view, whatsapp_click and generate_lead (only after successful guest API response); no fabricated purchases or sales revenue. Existing anonymous aggregate tracking and manual campaigns remain.
- Owner must disable GA4 enhanced measurement for form interactions, outbound clicks and site search (custom events replace them), confirm no user-provided data collection, test Realtime after consent, and link Search Console. No Measurement Protocol secret or purchase reporting without separate verified transaction integration.
- No database change. Existing privacy notice expanded; final business privacy compliance remains owner responsibility.

## NPE v3.35.0 — production domain and technical SEO migration (25 Nov 2026)
- Canonical production website: https://nusapenidaexperiences.com. Existing Worker, D1, KV and owner data are unchanged. Cloudflare www redirect preserves path and query. Keep workers.dev enabled for migration and existing API clients, signed WhatsApp webhooks and approved/historical media links; redirect GET/HEAD public documents and sitemap permanently. Old robots.txt remains crawlable and advertises the new sitemap. Existing HTML paths retained.
- New public metadata, JSON-LD, canonical, hreflang, sitemap, social links and future campaign media/link generation use the official domain. Dynamic trailing slash aliases redirect to the exact canonical URL. Dashboard is noindex/no-store. Host-only owner cookies do not migrate across domains; sign in once at the new address, without changing the admin token. Existing approved campaign snapshots are immutable. Automatic campaign generation remains removed.
- Production smoke verifies new HTTPS origin, old/www/HTTP redirects preserving query parameters, sitemap host, every published canonical URL, and legacy API compatibility. Search Console verification/indexing and GA4 require owner account access. No ranking promise.
- Cloudflare www redirect is zone-scoped (not a new Worker), and custom domain is managed in Cloudflare dashboard; preserve the existing deploy token scope and do not attach unrelated domains.

## NPE v3.34.0 — approved logo and manual campaign creation (25 Nov 2026)
- Owner-approved transparent airplane/cliff/wave wordmark replaces the single existing icon.svg (vector trace of the approved PNG). Public and dashboard headers, all legal/legacy/dynamic tour pages, favicon, PWA and Organization metadata reference it. Dark UI backing is CSS only for contrast. Existing media, social profile images and historical posts are not rewritten.
- Migration 0025 is additive and idempotent: manual rejection table and effective review view retain historical replacement records without requiring a successor. Existing approval and photo guards read the effective view.
- Campaign creation is manual only. Removed the weekly Cloudflare cron and GitHub organic calendar workflow/script, daily recovery and automatic draft replacement after rejection. Legacy prepare-week API returns HTTP 410; rejection records reasons without generating new content. Removed legacy independent idea publication path and kept old records as history. Hourly approved Meta insights collect real metrics only; no automatic successor draft or automatic photo generation. Explicit owner-requested caption helper, manual draft saving, manual licensed-photo search, approved immutable publication queue and analytics remain.
- Do not reintroduce any automatic campaign generator; preserve booking, D1 data, guest intake, owner sessions, website CMS and existing approved queues. Update all version references and smoke checks together. Domain migration/redirect work is separate.

## NPE v3.33.0 — legacy SEO, attribution and crawl audit (24 Nov 2026)
- Five original Indonesian pages use Worker-first exact routes and build-generated non-HTML templates via ASSETS; this replaces the historical v3.31 redirect experiment. Do not fetch public HTML URLs from within the Worker. The build generates templates from the same five public HTML files; no duplicated checked-in content. Internal template URLs return 404. Existing .html canonicals remain stable; clean aliases redirect once to those canonicals, preserving query parameters.
- Render owner-published D1 text and metadata on the server, with escaping, original Indonesian fallback for the existing language picker, related published links, and no changes to bookings, operator rates, gallery, legal approvals or marketing gates. D1 failure uses original source text.
- Optional public GOOGLE_SITE_VERIFICATION variable supports homepage meta verification; no invented token or claim of Search Console ownership.
- Existing aggregate WhatsApp click collector is shared by original and all dynamic SEO pages, with no duplicate listener or additional personal data. Clicks are not confirmed bookings.
- Live smoke checks every sitemap URL for direct HTTP 200 and matching canonical/hreflang, and checks generated source is not public. CI and live deployment must be verified separately.
- External outstanding: GSC ownership/indexation, real Core Web Vitals, GA4/conversion reconciliation, domain decision, genuine reviews, photo rights, and final legal policy. No first-page guarantee.

## [3.32.0] — 2026-11-24 — NPE audited website improvements
- Aligned five original page meta titles/descriptions, social OG previews and WebPage schema.
- Added 18 factual bilingual FAQ entries across the homepage and four tour pages; clear operator/booking expectations and expired form disclosures updated.
- Dimensioned photos in original pages and JS-created CMS experience cards to reduce layout instability.
- Added package-contextual WhatsApp enquiry links without changing the primary contact or consent handling.
- Added five independently indexable English SEO pages to the existing Worker (home, West, East, snorkeling, island), with reciprocal Indonesian/English hreflang, canonical URLs, original licensed photo attributions and in-page FAQ.
- Extended dynamic sitemap to all published bilingual experiences plus English tours, with no duplicated backend or Google-indexable admin routes.
- Updated D1 Published SEO titles for Boat Ticket and Nusa Lembongan; maintained original details and media.
- Regression tests, build and deployed smoke checks verify SEO, public routes, booking security and media.
- Remaining items requiring actual external integrations or human verification: GSC, real search positions, PageSpeed/Lighthouse, first-party analytics, authentic reviews, finalized cancellation/legal content, domain decision.

---

## [3.31.0] SEO routing stabilization — 2026-11-24
- Final deployment keeps existing static homepage and legacy tour routes out of Worker-first, avoiding Cloudflare Assets infinite redirects discovered by live smoke.
- Improves original HTML SEO titles, descriptions, factual Organization/WebPage/BreadcrumbList JSON-LD and image previews.
- Adds direct homepage links for published Lembongan/fast boat pages and server-rendered related links to bilingual activity pages.
- Dynamic sitemap includes hreflang alternates and actual publication dates. No invented reviews or ratings.
- Owner site-content overrides on legacy pages remain client-side; do not claim otherwise. Existing design, booking, session, prices, gallery and social integrations remain unchanged.

---

## [3.31.0] — 2026-11-24
- SEO: Serve original tour pages with real HTML metadata and current published CMS copy via existing Cloudflare Worker, without replacing source pages or changing guest designs.
- Add Organization, WebPage and BreadcrumbList JSON-LD, social sharing preview images, unique titles and useful meta descriptions.
- Expose approved published experience links in server-rendered homepage HTML, plus related links on dynamic detail pages, so search crawlers do not depend solely on JavaScript.
- Add bilingual sitemap URL alternates and real publication dates; keep original canonical activity URLs.
- Align versioned scripts, dashboard and offline cache with v3.31.0; enhance CI and deployed live smoke to check SEO behavior.
- Preserve pricing, booking, owner photo library, Meta marketing gates, WhatsApp and original photo attribution. No invented reviews or rankings; first-page Google ranking cannot be guaranteed.

---

## [3.30.0] — 2026-11-24
- Mainline-only repository synchronization; no new branch or PR.
- Fix live smoke version regression (expected v3.22 vs actual v3.29).
- Bring Worker health, package, dashboard badge, JS/CSS query versions and guest service-worker cache into release alignment.
- Eliminate redundant static robots.txt and sitemap.xml (Worker already owns both dynamic routes) and remove dynamic responses from offline precache.
- Add direct release consistency regression tests, update README to latest production architecture, preserve working CMS, 9 published activities, photo library and existing booking/marketing integration gates.
- All existing local licensed JPGs, D1 migrations, historical release notes and production data are retained.

---

## [3.29.0] — 2026-11-24
- Simplify activity photo chooser to Galeri NPE or Galeri HP, optional photo title and rights only.
- Fix asynchronous form reset after upload and preserve saved media.
- Add persistent manual website activity categories and parent inheritance.
- Prevent stale dashboard asset caching with versioned assets and no-store HTML; allow local blob previews.

---

## [3.28.0] — 2026-11-24
- Synchronize the Snorkeling 3 Spots homepage cover with the existing snorkeling package photo.
- Synchronize all original homepage destination thumbnails with their corresponding destination editor photos.
- Expose cover controls inside the tour page editor, refresh image fallback state, and clarify mixed photo credits.
- Preserve existing photos and database assignments; no migration.

---

## [3.27.0] — 2026-11-24
- Choose or upload an activity/detail photo directly in the existing editor without repeating title or description fields.
- Generate photo title and bilingual alt text automatically from the existing content title or file name.
- Simplify standalone gallery upload to file and rights confirmation; retain saved-photo reuse.
- Preserve unsaved form fields, publish boundaries, previous media and regression coverage.

---

## [3.26.0] — 2026-11-24
- Fix published destination visibility for clean URLs and .html routes.
- Mark all static tour galleries with explicit parent IDs and decouple activity loading from photo override requests.
- Refresh restored browser pages and invalidate old tour rendering scripts.
- Preserve existing published records and destination cards.

---

## [3.25.0] — 2026-11-24
- Fix rejected multi-paragraph website descriptions and summaries while keeping input safety and limits.
- Add automatic localized SEO titles and meta descriptions, on-demand suggestions and manual overrides.
- Show validation errors using the corresponding field label and focus the affected field.
- Add regression tests; no migration or provider costs.

---

## [3.24.0] — 2026-11-24
- Remove manual URL/slug field from the website activity editor.
- Generate unique SEO-friendly URLs automatically from title and parent context on the server; preserve existing links on edit.
- Automatically lock the clicked parent for Add Detail and keep Add Activity as a top-level entry.
- Add regression tests for automatic URL allocation and the form.

---

## [3.23.0] — 2026-11-24
- Add activity detail creation for existing tour pages and published dynamic activities, bilingual fields, gallery photo, draft, publish and archive.
- Show child details only on the parent activity, preserve existing gallery spots and homepage cards, and hide orphaned details.
- Reuse existing CMS data and authentication; no migration or changes to pricing/booking.

---

## [3.22.0] — 2026-11-24
### Added
- A visible Galeri NPE shortcut, searchable owner-photo grid, usage indicators, and confirmed deletion of unused photos.
- Ganti Foto now supports reusing saved images or choosing new photos from the phone without navigating away.
- Authenticated photo-deletion endpoint with atomic reference check and dedicated Cloudflare KV cleanup.
### Fixed
- Duplicate uploads reuse matching stored photo IDs instead of showing Foto sudah ada.
- Gallery loads independently from other content editor endpoints.
### Preserved
- Active images, bookings, operator rates, quotes, admin login, Meta/AI autopilot and existing external photographer credits.

---

## [3.21.0] — 2026-11-24
### Improved
- Published page and individual spot "Ganti Foto" now open the native photo gallery immediately, without an intermediate Website/Media editor.
- Single preview with bilingual alt text, usage-rights confirmation, and targeted Save & Publish.
- Existing media upload/compression and authenticated publication reused; after publication refresh only photo previews and preserve unsaved page copy.
### Unchanged
- Cloudflare D1 schema, owner authentication, booking/quote/rate flows, public SEO text, marketing automations, and Media Library management.

---

## [3.20.0] — 2026-11-24
### Fixed
- Published website editor preloads actual text, both translations and original media even with an empty site_content table.
- Replaces generic Published cards with previews of existing title, excerpt, current retail label and current photo.
- Owner can edit only selected text fields or many fields without overwriting unmodified content.
### Added
- 13 destination gallery-card headings and descriptions use the existing bilingual CMS.
- New independently editable photo placements for 13 gallery locations via additive D1 migration 0024.
- Build-generated snapshot derived only from the canonical checked-in guest website, with test and live smoke assertions.
### Preserved
- Original rates, quotations, payment approvals, bookings, session security, existing photo credits, Meta automation and other Workers.

---

## [3.19.0] — 2026-11-24
### Improved
- Mobile-friendly Published, Draft, Halaman Website and Foto & Media workspace inside NPE Studio.
- Published activity cards are reopenable and all CMS-supported fields are editable.
- Clear numeric optional selling price in rupiah, with units and preview, outside collapsed SEO; empty amount saves and displays no price badge.
- Bilingual price labels derived from numeric amount. Unverified prices can save as drafts but cannot publish.
- Existing public page text and price labels grouped in a friendly editor; photos managed via existing Cloudflare storage.
### Preserved
- Operator net, immutable quotes, payment and booking approvals, admin sessions, AI marketing, Cloudflare resources and existing draft version history.

---

## [3.18.0] — 2026-11-24 (branch implementation; live deployment not yet verified)
### Added
- Website CMS Add Activity form, two-language copy, SEO metadata, owner-approved publication, archive and immutable revisions.
- Own-photo website media upload, dynamic photo slot assignments, auto-generated public activity cards, SEO HTML pages and live sitemap.
- Isolated Cloudflare D1 migration 0023 and CMS tests.
### Preserved
- Original pricing, partner rates, guest lead opt-in, WhatsApp, booking/payment process, AI marketing, existing owner login, cron and site text editor.
### Deployment
- Apply only the new additive D1 migration; CI and live rollout must be independently verified before claiming public availability.

---

### 3.17.1 — 27 October 2026: repair Facebook Group bookmarks not persisting
- Verified production D1 has no saved Facebook Groups; report user-created groups were not recorded and cannot be recovered without re-entry.
- Support standard, mobile/tracking and Facebook share/g group links in owner bookmarks. Allow rules pending review while rejecting off-Facebook profile links and ensuring owner acknowledges manual-only interaction.
- Independent owner-authorized group list endpoint, D1 read-after-write save acknowledgement, visible saved count and manual reload to avoid a full growth research failure concealing a successfully written record.
- New integration and UI regression tests guard two-group durable storage, duplicate normalization, authentication, archive and error surfaces.

### 3.17.0 — 27 October 2026: elegant compact NPE Studio workspace
- Restyle owner dashboard in a modern, compact, light workspace inspired by the structural design of the supplied Ceritexa dashboard reference, adapted to Nusa Penida Experiences' marine branding.
- Group over 14 operator/marketing pages into six workspace categories; on desktop use clean sidebar, on mobile six-icon bottom navigation and horizontally scrolling contextual submenu.
- One **Lihat Website** action in the topbar only; remove duplicated buttons from home, admin heading and editor.
- Rework home into slim branded hero, eight compact action shortcuts, real KPI tiles and data-backed action priorities; advanced quick editor is collapsed by default rather than filling the screen.
- Break large campaigns, growth research and WhatsApp pages into selectable nested panes, keeping all previous controls and authorized API behaviors intact.
- Add genuine `/api/admin/analytics` counts and status breakdown view, explicitly not fabricating platform views or reach; maintain full module function under grouped navigation.
- Regression guards and live smoke now check grouped workspace availability, one website shortcut and compact nav classes.

### 3.16.0 — 27 October 2026: stay signed in until owner Logout
- Replace tab-only raw ADMIN_TOKEN browser storage with an opaque, revocable, persistent D1 session + secure HttpOnly SameSite=Strict cookie.
- After first token login, dashboard automatically restores the session across refresh, browser close and app restart. Login again is required only after owner Logout or a security exception (cookie removal, credential rotation or long inactivity expiry).
- Explicit owner Logout revokes the server session and expires the cookie. Server rejects the revoked session even if the old cookie is replayed.
- Keep existing admin Bearer token API interoperability without exposing it to the dashboard or public website. Add origin/Fetch-Metadata CSRF defenses for cookie-authorized mutations.
- Add migration 0022, frontend auth tests, integration tests for restore/logout/expiry/rotation and live unauthenticated login security checks. Existing guest lead Turnstile remains unchanged.

### 3.15.0 — 27 October 2026: dedicated agent dashboard, public guest website
- Move the original extensive admin UI from `public/index.html` to `public/dashboard.html`, with branded login, sticky header, adaptive side navigation, mobile menu and one-click **Lihat Website** access.
- Separate public website JS `public/guest.js` from owner-only `public/app.js`; preserve guest consent + Turnstile lead intake and all existing owner operational form handlers.
- App manifest launches `/dashboard.html`; public legacy standalone home forwards to owner dashboard. Static PWA cache v26 excludes private script, admin page, APIs and sensitive data.
- Bump Worker, package and live smoke to 3.15.0. Add frontend regression checks for HTML isolation, protected business APIs, 14 dashboard pages, Android start URL and safe cache; ensure live smoke separately checks both pages.
- No changes to partner costs, prices, quotas, Cloudflare cron schedules, social publishing or WhatsApp sending approval.

### Facebook Group moderation guard — 27 October 2026
- When owner marks a Facebook Group NO_PROMOTION or DISMISSED, automatically dismiss pending REVIEW/SHORTLISTED question suggestions, hide prior CONTACTED/RESPONDED questions from active owner queue, and prevent API status transitions or new questions from blocked groups.
- Preserve historical records for audit rather than deleting previously recorded interactions. No Facebook API joins/comments/posts added.
- Integration tests cover moderation transitions, deleted active suggestions, blocked follow-ups and historical audit retention.

### 3.14.0 CI follow-up — 27 October 2026
- Fix live smoke release race: run smoke after successful deployment using GitHub Actions workflow_run, not simultaneously on push. Owner may also dispatch smoke manually. Each smoke checks out deployed commit SHA; Spenva deployments unaffected.

### 3.14.0 — 27 October 2026: Facebook Groups assisted outreach + Nusa Lembongan
- Expand acquisition research topics and manual discovery hubs to Nusa Lembongan/Ceningan, without inventing supplier costs or introducing an unverified bookable product.
- Add owner-operated public Facebook Group watchlist and manually summarized post ingestion. Check group rules, public-post link, verified original published timestamp and 48-hour expiry; prevent identity/contact data from being stored. Suggest transparent informative replies, never automate group joins, group posts, comments or DMs.
- Combine group opportunities with existing public research dashboard and manually updated follow-up statuses; leave consented enquiries, quotes, Meta publishing and approvals unchanged.
- Add additive D1 migration 0021, new API integration tests, Worker release v3.14.0 and updated production verification.

### 3.13.0 LIVE guest enquiry activation — 27 Oct 2026
- As explicitly authorised by owner, set `PUBLIC_LEADS_ENABLED="true"` for the isolated tourism Worker.
- Preflight: Turnstile widget/sitekey matches the production Worker domain, server secret is present, and business profile, contact and owner-approved policy flags are populated.
- Update live smoke: production readiness must be true and form must deny missing Turnstile proof (403), never creating fake booking/lead or bypassing bot protection.
- **Boundary:** enquiries now allowed; no supplier inventory, paid booking or final quote was auto-approved. One operator is still DRAFT, and 12 rate records have no supplier verification. Live sales/payment flows remain subject to owner verification.

### 3.13.0 — 27 October 2026: customer research expands beyond Reddit
- Integrate public Bluesky search via public AppView API, permission-gated Facebook Page comments, Instagram Business media comments via read-only Graph API, and optional API-keyed YouTube public video search.
- Preserve existing Reddit, OSM, owner review statuses, marketing/Meta publishing and WhatsApp behavior. No automatic response, direct messaging or unauthorized cross-platform scraping.
- Expand dashboard per-source labels, public-source monitoring and manual research hubs for Facebook Groups, Instagram, TikTok, YouTube, Threads, X and Tripadvisor.
- Apply additive D1 `0020_multichannel_growth.sql` after 0019. Social results are isolated, deduplicated by URL and expire after 48h or past 'today/tomorrow' travel deadlines; old sales records unchanged.
- Reuse existing Cloudflare hourly scheduler and only approved/read-only API surfaces. YouTube is opt-in via `YOUTUBE_DATA_API_KEY`, not assumed ready in production.
- Add integration security/freshness tests for source extraction, access errors, scoring, unified dashboard and status updates; CI and deployment verification required.

### 3.12.1 — 27 October 2026: verified fresh travel opportunities
- Root cause: Reddit feed allowed posts up to a month old and the engine did not read publication dates or recognize already-passed 'tomorrow' trips.
- Require per-entry published/pubDate, 48-hour maximum age, WITA 'today'/'tomorrow' expiry; reward the freshest posts and retain consent-first owner review.
- Add a repeat-safe public URL/timestamp metadata table via migration 0019; old undated Reddit entries are not shown as active opportunities, while existing interactions and hotel partnership research remain unchanged.
- Reuse existing hourly Cloudflare Cron, scan Reddit at most once per two hours, and preserve OSM weekly cadence; no additional scheduled triggers.
- Display post age in the acquisition dashboard and add regression coverage for one-month-old, undated and expired-tomorrow prospects.

### 3.12.0 deployment hotfix — Cloudflare Free account Cron cap (26 October 2026)
- Initial production upload and D1 migration succeeded but final deploy job failed while setting a fourth Cron: Cloudflare API 10072, account-wide Free cap of 5 Cron triggers. **No paid upgrade and no Spenva cron changes.**
- Restore the original three tourism triggers. Start public customer research via `ctx.waitUntil` on existing 10:00 WITA daily `0 2 * * *` Cron, independent of daily health work and hourly approved Meta posts. Add explicit `GROWTH_PUBLIC_RESEARCH_ENABLED=true` Worker variable, bounded RSS / OSM request timeouts, and preflight to prevent recurrence.

## 3.12.0 — 26 October 2026: Marketing becomes an opt-in acquisition and sales system
- **Production audit:** two approved Graph posts are truly POSTED (25 October, one Facebook and one Instagram); 26 October verified media insight snapshots report 0 views and 0 interactions for each, with 0 guest leads, 0 quotes, and 0 bookings. This is a reach/distribution gap, not proof the publishing pipeline is broken.
- **Owner workspace:** new `Akuisisi Pelanggan` dashboard shows discovered public tourism questions, mapped public lodging/hostel partnership prospects, scored suggestions, review-only draft answers with explicit agency affiliation, links to community/partnership research, and manual status updates. Social community joining/commenting/direct messaging remains manual; deprecated Facebook Groups API does not support official automatic joining/group posting, and the agent never scrapes group member/visitor identities or mass-messages.
- **Daily discovery at 10 WITA:** existing `0 2 * * *` Cron starts bounded public Reddit RSS and OpenStreetMap accommodation research via `ctx.waitUntil` (OSM at most weekly); rate-limited/unavailable sources are explicitly reported. The attempted fourth Cron was rejected by the Cloudflare Free cap and is not deployed. The Reddit RSS source may be discontinued; OSM + manual hubs remain. No inferred buyer identities, invented prospects or paid tools. Attribution for OpenStreetMap data is explicit.
- **Website conversions:** anonymous aggregated WhatsApp click-to-chat intent by source/landing/day in tourism D1 only, without IP/cookies/visitor names; 90-day retention. Clicks are NOT messages or bookings. Guest lead form remains OFF pending real business/privacy/refund and Turnstile readiness. Privacy policy discloses analytics. Public home/snorkeling/island/west/east brochures are now eligible for search indexing (previously `noindex`), without guaranteeing indexing, ranking or traffic.
- **Improve low-reach strategy:** future owner-review captions ask for travel dates and group size and use trackable organic landing source tags where applicable. Verified 0-view posts now produce exactly one alternative **DRAFT** with different hook/CTA and licensed imagery rather than waiting for the old 50-view threshold. Each new post still needs explicit owner approval. No previously approved/queued post or Metricool job is edited.
- New additive migration `0018_growth_acquisition.sql`, canonical `src/growth-engine.mjs`, PWA v25, CI tests for privacy, protected dashboards, discovery source fallback, zero-view feedback and never-auto-contact security.

## 3.11.0 — 24 October 2026: autonomous safe photo research when owner has no new images
- Weekly marketing intelligence (real Meta/owner observations; exploratory when none) now seeks a matching photo for each new owner-review draft, prioritizing unused owner uploads. It consults Commons only when unused licensed/photo-category matches are not available, bounded to one remote discovery attempt per activity per weekly run. Research results are attributed, source-linked, and stored in existing PHOTO_KV, with original file and licensing metadata in additive D1 migration 0017. No new paid services.
- Validates Wikimedia imageinfo extmetadata: JPEG only, filename must explicitly indicate Nusa Penida plus matched tourist topic, author/credit must exist, allowable licenses are CC BY 4.0 / CC BY-SA 4.0 / CC0 with link, Wikimedia-hosted image URL only, duplicate URL and bytes hash rejected; downloaded JPEG is size-limited to 850KB and immutable after owner approval.
- Publishing is never authorized by photo discovery. Dashboard campaign cards show new Commons source/photo license and explicit owner visual review warning; owner can press **Cari foto otomatis** to retry for pending drafts. Real Meta publication still requires approval + scheduling; old queues and Metricool are unchanged. Metadata cannot guarantee geolocation/individual consent so human visual review is essential. When research is blocked/unavailable, use vetted built-in gallery and never invent photographs or claims.
- Verified-feedback drafts also trigger photo selection before creation, feeding the same performance-review campaign loop without self-approving. Bump PWA cache v24, version 3.11.0 and test provider failures/unsafe licenses/canonical snapshots.

## 3.10.0 — 24 October 2026: owner + Add Foto from mobile
- Adds dashboard **+ Add Foto** upload from phone gallery/camera and owner photo library thumbnails; select image per pending DRAFT using **Pakai foto ini**. Owner supplied photo stays owner verified and tagged by Snorkeling / Island Tour; no new paid storage.
- Front-end compresses to JPG (<=850 KB, max source 15 MB). Server accepts only authenticated multipart image/jpeg with JPEG markers, enforces bounds, SHA-256 duplicate prevention and explicit rights/subject permission affirmation, writes binary to pre-existing `PHOTO_KV` and additive metadata in D1 migration 0016. Public GET /photos/owner/{uuid} serves only existing verified owner metadata and KV value, no secret.
- Owner photo can be assigned only to an active DRAFT before approval, matching activity, not to published or rejected campaigns; stored in existing `campaign_review_records.media_slug`, not duplicate tables. Owner photo preview survives refresh. Canonical queue freezes caption and owner-photo public URL at explicit approval; original Meta/Metricool schedules and image archives remain unchanged.
- PWA asset cache v23 and CI upload/authentication, rights, duplicate prevention, public jpeg, owner selection, immutable approved queue. Preserve `ADMIN_TOKEN` and `PHOTO_KV` bindings; never add public upload endpoint.

## 3.9.0 patch — 24 October 2026: production verification and opt-in scheduling of old approvals
- Live audit: GitHub CI / Cloudflare deployment / smoke succeeded; hourly Cron deployed and D1 approved queue / metrics / learning tables exist. Meta read check succeeded FB/IG 200 but no new owner-approved queue rows or measured outcomes exist yet. This proves deployment, not live external Graph publishing.
- Added owner-only POST `/api/admin/campaigns/{id}/schedule` for campaigns already APPROVED before v3.9.0. Requires explicit owner confirmation and channel selection. No auto backfill. Same canonical snapshot scheduler, unique audit index and no-duplicate queue protection as newly approved campaigns.
- Dashboard displays **Jadwalkan otomatis** next to legacy **Catat sudah diposting manual** when an approved campaign has no queue. PWA cache v22 invalidates outdated app.js. Prevents already PUBLISHED and rejected campaigns from entering queue. No silent changes to Meta/Metricool scheduling.

## 3.9.0 — 24 October 2026: owner-approved social publishing and measured AI growth loop
- **After explicit owner approval:** immutable photo and caption snapshots enter a dedicated D1 `approved_social_queue` for chosen Facebook/Instagram channels. Choose published hour from measured platform results only after sufficient evidence, otherwise use exploratory 10:00 Instagram / 12:00 Facebook WITA. Leave at least 12h before processing and cap to one post per platform/day.
- **Collision precautions:** existing Metricool posts remain untouched. Skip known Metricool scheduled days (26/28/30 Oct 2026) in the Cloudflare channel; never activate the deprecated `marketing_publications` publishing path. Only new owner-approved drafts are eligible; old approved drafts are never retro-posted.
- **Graph publishing:** hourly Cloudflare Cron checks verified fresh identity access, dispatches a max-four-item queue and never automatically retries a Graph write if status is uncertain. Instagram media creation and final publication are separate hourly steps with container readiness GET. Dashboard reports QUEUED / AWAITING_CONTAINER / POSTED / REVIEW_REQUIRED / CANCELLED and lets owner cancel QUEUED items.
- **Measurements:** an at-least-20h-old published post may be read with Graph metrics. Unsupported metrics remain NULL, never fabricated as zero. Verified media views plus engagement feed `marketingIntelligence` for actual per-channel evidence and best-hour discovery. Minimum 50 verified views triggers exactly one new review-only strategy draft per published post; Workers AI is optional and safe curated copy is fallback. New drafts still require owner approval before returning to queue.
- Additive D1 migration 0015, hourly Cron and isolated Worker only, PWA v21, CI end-to-end approval/dispatch/measurement/replanning cases. Publication gate `META_APPROVED_AUTOPOST_ENABLED=true` applies **only** to newly owner-approved campaigns; legacy independent direct publisher remains disabled and third-party Metricool cannot be mutated by Worker.

## 3.8.0 — 23 October 2026: owner visual campaign review & rejection regeneration
- Marketing dashboard now shows a preview photo from licensed local gallery, full caption, language/date label, relevant public tour link and photo credit before approval.
- Every unreviewed DRAFT presents **Setujui draf** and **Tolak & Buat Ulang**. Reject requires a brief reason and explicit owner confirmation. It immediately creates a new DRAFT for the same product/channel with a different photo and revised copy. Workers AI attempts an original caption when available; a curated safe fallback guarantees an immediate replacement without service dependency. Human review remains required.
- All rejection reasons, versions and predecessor→replacement links are saved in additive D1 `0014_campaign_reviews.sql` and audited, with repeat/parallel rejection protected. A rejected draft cannot be approved, while older campaigns and existing records remain untouched.
- Existing Meta direct posting flags, Metricool scheduled posts, public guest leads and WhatsApp send setting unchanged. Approval **does not publish**; publishing manually requires a real URL. No new Cron schedules.
- Bumped offline PWA cache to v20, extended regression tests and deployment migration.

## 3.8.0 — 23 October 2026: Meta 401 guidance and overdue campaign draft recovery
- Audit live D1: Page and Instagram Graph read checks return HTTP 401 with the Cloudflare Page token. Credentials are configured but rejected by Meta; manual replacement of the **correct Page Access Token** in the existing Cloudflare Secret `META_PAGE_ACCESS_TOKEN` is required. Do not place credentials in GitHub, website forms, or chat.
- Daily 10.00 WITA Cron now idempotently restores the current week's missed `WEEKLY_MARKETING_DRAFTS`, even if Monday 09.00 WITA Cron did not execute. Late recovery generates seven review-only drafts with future editorial dates, logs a strategy decision, and **does not enqueue Meta publication slots for late-start weeks**.
- Owner dashboard separates historic DRAFTs in a collapsible history while retaining D1 records/audit, labels creation dates distinctly from real publication dates, explains Graph HTTP 401 and converts diagnostic timestamps to WITA.
- Bump PWA cache to v19; all existing Cloudflare, Spenva, WhatsApp, checkout, and publication gates unchanged. No Graph POST/publication or alteration to existing Metricool scheduled posts.

## 3.8.0 security maintenance — Internal Meta connectivity checks (21 October 2026)
- Reuse the existing publisher adapter for Graph GET-only Page/IG identity checks, requiring exact expected IDs even on HTTP 200.
- The existing daily Cron (10.00 WITA) saves sanitized, daily read status in additive D1 migration `0013_meta_diagnostics.sql` with 30-day retention. No credentials, response bodies, personally identifying guest data, insights or posts are stored.
- Admin dashboard Marketing tab shows last check and history and supports manual identity testing with a five-minute cooldown. Protected GET `/api/admin/marketing/meta/status` reads history; POST `/api/admin/marketing/meta/diagnostics` performs a safe probe.
- `READ_OK` verifies identity read only, never publication authorization/metrics. All existing social-post, WhatsApp and public lead gates remain unchanged.
- Deployment stays scoped to the existing tourism Worker, D1 and Cron schedule, preserving dashboard variables.

## 3.8.0 Cloudflare GitHub token metadata diagnostics — 21 October 2026
- GitHub deployment now checks HTTP status codes (no response body or tokens) for scoped Cloudflare API metadata endpoints before migrating the dedicated tourism D1. The first two deployment attempts passed 101 tests and D1 migrations but failed at Wrangler metadata read with "Unable to fetch bindings, routes, or services metadata from the dashboard". Production Worker remained unchanged.
- This diagnostic is read-only and does not change any permissions, secrets, Worker bindings, schedules or database records.

## 3.8.0 deployment safety hotfix — 21 October 2026
- Set `keep_vars: true` in `wrangler.jsonc`, and guard it in `scripts/preflight.mjs`, to preserve production Dashboard-managed plaintext bindings during Wrangler deployment. Secrets remain protected and preserved per Cloudflare documentation.
- No changes to cron, D1 schema, existing worker target, enabled social publication gates, guest lead gate or WhatsApp sending.
- GitHub Actions deploy still needs operator-owned secret configuration and a successful production run; no new social posting authorization is implied.

## 3.8.0 hotfix — Cloudflare Meta binding alignment (21 Oktober 2026)
- Audit Worker menemukan semua kredensial inti terikat, tetapi modul publisher memakai nama `META_GRAPH_*` yang berbeda. `metaPublicationConfig` sekarang membaca `META_PAGE_ID`, `META_IG_USER_ID`, `META_PAGE_ACCESS_TOKEN` sebagai nama utama dan mendukung nama lama untuk kompatibilitas.
- Menambah status konfigurasi tanpa kebocoran token, ditambah pemeriksaan read-only `GET /api/admin/marketing/meta/status?probe=true` untuk owner dengan Bearer `ADMIN_TOKEN`; pengujian identitas bukan konfirmasi izin penerbitan/insight.
- Menjaga publisher OFF sampai sakelar owner, tanggal mulai, izin platform, dan pengujian selesai. Tidak mengubah schedule, database, lead gate, WhatsApp atau website; tes unit/regresi ditambah.
- Data D1 dari audit: 1 scheduled_run historis, 2 draft, belum ada pengukuran, keputusan strategi atau publikasi otomatis. Pengumpulan Insights otomatis masih perlu implementasi; tidak dinyatakan sudah bekerja.

## 3.8.0 production activation — 21 Oktober 2026
- Recovered connected Cloudflare access. Migrated isolated `marketing-turism-db` with additive 0011 and 0012; verified three required marketing tables.
- Uploaded protected Worker version 43 (`a2def26d-848f-49fa-abb9-be5b49be301a`) using inherited 12 existing bindings and restored full public PWA routing; deployed to 100% traffic. Previous rollback version: `a829cf8b-22d2-448c-8577-f24038d6288c`.
- Activated `0 1 * * 1` Monday drafts and `0 2 * * *` daily gated publication check on the dedicated tourism Worker only. Meta Graph publish credentials and owner opt-in flags are NOT configured, so outgoing publisher remains OFF.
- [GitHub external smoke rerun succeeded](https://github.com/rama160/Marketing-turism/actions/runs/39552409086): `SUCCESS v3.8.0 LIVE: 10 JPGs, public logo, ID/EN, editor, CMS D1 API and 401 auth, original booking APIs, lead gate OFF`. Invalid WA verify token correctly returns HTTP 403. No FinChat/Spenva changes.
- Automatic social Insights ingestion and independent Meta Graph publishing still need permitted official Meta access; Metricool is currently the verified scheduled-post provider.

## 3.8.0 — Independent bounded marketing planner and opt-in Meta publishing (2026-10-21)
- GitHub independent weekly strategist `scripts/organic-week.mjs` learns ranking from truthful, aggregate `data/marketing/observations.json` using `marketingIntelligence()`, selects three priority posting ideas, and generates licensed media/attribution from canonical `public/photos/manifest.json`. Output includes both Markdown + machine-readable JSON; no fabricated impressions.
- Verified four Meta posts scheduled through Metricool (Kelingking Oct 23, Diamond Oct 26, snorkeling Oct 28, Broken Beach Oct 30) with `autoPublish=true` and original image credits. Publication remains pending until the dates.
- Added `src/marketing-media.mjs`, `src/meta-publisher.mjs`, and additive `database/migrations/0012_meta_autopilot.sql`. Full Graph publisher uses owner-only secrets, step-by-step Facebook/IG response recording, disabled by default, and no replay of uncertain partial posts.
- Dedicated Marketing Tourism Cron extended to daily 10.00 WITA behind explicit owner Graph flags; public lead/payment/WhatsApp send gates unchanged. Owner-only API and dashboard expose safe queue/status without tokens.
- GitHub test/CI updated for opt-in, audit/at-most-once, failure and licensing. Cloudflare deploy remains NOT DONE due disconnected/unavailable Cloudflare connector and skipped GitHub deploy configuration; cannot claim a production autonomous Graph agent. Independent Meta analytics ingestion likewise still needs proper app permissions.
- No business registration, no real consumer payment acceptance, no ads, no spam, no self-modifying production source code.

## 3.7.0 — AI Marketing learning engine and audit trail (2026-10-21)
- Menambah modul khusus `src/marketing-intelligence.mjs` untuk memvalidasi performa organik dari sumber nyata, mempelajari rasio interaksi dan klik dengan smoothing untuk sampel kecil, menentukan prioritas platform/aktivitas, serta memilih jam publikasi hanya ketika bukti cukup.
- Menambah migrasi aditif `0011_marketing_learning.sql` untuk riwayat `marketing_observations` dan keputusan strategis `marketing_decisions`. Tidak mengubah migrasi historis dan tidak menyimpan nomor/identitas guest.
- Worker Cron, `POST /api/admin/marketing/prepare-week` dan endpoint admin `GET /api/admin/marketing/intelligence` kini menggunakan rangking terukur dan menyimpan ringkasan keputusan mingguan. `POST /api/admin/marketing/observations` menerima angka yang pemilik verifikasi secara eksplisit.
- Dashboard pemilik menunjukkan skor dan jam berdasarkan bukti, serta formulir metrik asli. Nilai tidak dimanipulasi sebagai hasil media sosial jika sumber belum tersedia.
- GitHub Actions kalender konten mandiri tetap aktif. Facebook/Instagram Metricool sudah terhubung; posting Kelingking 23 Okt 10 WITA telah diubah `draft=false`, `autoPublish=true` sesuai persetujuan user. Status Meta terakhir `PENDING`, belum dibuktikan tayang.
- Kode dan tes v3.7.0 sudah di GitHub. Deploy Worker publik tertunda karena Cloudflare connector internal error dan GitHub deploy tetap skipped tanpa secrets. Jangan klaim kode baru sudah live atau publikasikan melalui Cloudflare.
- Tidak mengaktifkan iklan berbayar, WhatsApp auto-send, pembayaran, publikasi langsung via Graph API, penulisan kode otomatis atau penerimaan lead publik.
- Dokumen `docs/AUTONOMOUS_MARKETING.md` memisahkan arsitektur nyata, izin Meta yang diperlukan, dan keterbatasan paket Metricool.

### 3.6.0 — Kalender organik GitHub Actions berjalan
- Menambahkan `scripts/organic-week.mjs` sebagai ekspor Markdown 7 draf dari modul kanonis `src/sales.mjs`, tanpa menyalin logika caption.
- Menambahkan workflow `organic-marketing.yml` yang berjalan terjadwal tiap Senin 09:00 WITA, `workflow_dispatch`, dan uji push. Terbukti sukses pada [run #39522690636](https://github.com/rama160/Marketing-turism/actions/runs/39522690636) dengan artefak `nusa-penida-organic-week`.
- Penerbitan ke media sosial tetap OFF sebelum otorisasi Facebook/Instagram, dan Worker Cloudflare v3.6.0 belum live: konektor Cloudflare sedang tidak merespons pada sesi ini. CI GitHub berhasil, tetapi smoke live pada kode baru gagal sampai deployment berhasil.

## 3.6.0 — Pemasaran organik semi-otomatis (2026-10-21)
- Memperluas `weeklyDrafts()` menjadi tujuh draf pemasaran dengan topik West/East Nusa Penida, snorkeling, manta wildlife, dan pilihan itinerary. Bahasa Indonesia/Inggris serta kanal Instagram/Facebook/TikTok bervariasi, dengan tautan website yang benar dan tanpa janji ketersediaan.
- Cloudflare Cron khusus tourism tetap Senin 09:00 WITA (0 1 * * 1 UTC), tanpa mengubah trigger FinChat/Spenva. Menyimpan 7 draf DRAFT per pekan yang idempoten; tidak auto-publish.
- Menambah endpoint owner-only `POST /api/admin/marketing/prepare-week` dengan persetujuan eksplisit untuk menyiapkan pekan berjalan dan mencegah draf ganda. Menambah tombol ke Dashboard Agen → Kampanye.
- Menambahkan pintasan koneksi akun Facebook/Instagram melalui brand Metricool yang tersedia. **Belum ada koneksi akun sosial pada Metricool**, sehingga auto-posting eksternal belum bisa beroperasi. Pemasaran konten otomatis/draf bukan berarti publikasi otomatis.
- Mempertahankan `PUBLIC_LEADS_ENABLED=false`, `WA_SEND_ENABLED=false`, pembayaran serta konfirmasi booking tetap terkunci. Tidak membuat klaim bisnis berizin. PWA cache v16, pengujian regresi, panduan promosi di `docs/MARKETING_LAUNCH_KIT.md`.

## 3.5.2 — Perbaikan verifikasi Webhook Meta (20 Oktober 2026)
- Mengatasi kegagalan verifikasi URL callback Meta dengan memisahkan persyaratan tantangan awal HTTP GET dari penerimaan pesan bertanda tangan HTTP POST.
- Verifikasi GET sekarang cukup menggunakan WA_WEBHOOK_ENABLED=true dan WA_VERIFY_TOKEN yang valid (minimal 24 karakter). WA_APP_SECRET dan WA_PHONE_NUMBER_ID tetap wajib untuk POST agar pesan masuk tidak pernah diproses tanpa verifikasi tanda tangan HMAC dan identitas nomor.
- Menambahkan tes regresi dengan token cocok, salah, token pendek, serta POST tanpa secret. Tidak mengubah otorisasi admin, harga, booking, tabel D1 atau pengiriman WhatsApp.
- Worker pariwisata v3.5.2 berhasil dipasang dengan 12 binding (termasuk lima konfigurasi WA) yang dipertahankan. WA_SEND_ENABLED tetap false.
- Verifikasi live: token percobaan salah sebelumnya memperoleh HTTP 503, sekarang mendapatkan HTTP 403 sesuai rancangan. GitHub Actions pilot rerun 39449347646 sukses. Untuk menyelesaikan setup Meta, pemilik harus memasukkan WA_VERIFY_TOKEN yang sama persis pada halaman "Verifikasi token", lalu "Verifikasi dan simpan". Tidak ada kredensial Meta yang dibuka/diubah oleh agen.

## 3.5.1 — Panduan WhatsApp lengkap Bahasa Indonesia dari nol (2026-10-20)
- Mengganti isi **dokumen yang sama** `docs/WHATSAPP_SETUP.md` dari bahasa Inggris menjadi panduan Bahasa Indonesia terstruktur 14 tahap, khusus nomor +62 856-1752-525 dan Worker `marketing-turism-agent`.
- Memisahkan jalur WhatsApp Business **Coexistence** (pertahankan aplikasi HP) dari nomor uji/baru sehingga tidak merekomendasikan penghapusan akun yang sedang aktif.
- Menguraikan pendaftaran Meta Business/Developers, akses WABA/Phone Number ID, token sistem, konfigurasi secret Cloudflare, webhook, draf AI, pengiriman manual yang disetujui, uji masalah 401/403/409/503, dan pertimbangan biaya/privasi.
- Menambahkan tautan **Panduan Hubungkan WhatsApp (Bahasa Indonesia)** pada dashboard WhatsApp pemilik dan merilis Worker v3.5.1 dengan cache PWA statis v15. Integrasi inbox dan pengiriman masih sengaja nonaktif sampai ada otorisasi Meta.

## 3.5.0 — Prepared official WhatsApp inbox and AI-assisted owner replies — DEPLOYED 2026-10-19
- Added direct WhatsApp chat and catalog links to public contact, mobile floating CTA, and package detail pages, with localized prefilled chat enquiries.
- Owner WhatsApp dashboard now includes an inbox shell for signed messages, conversation history, owner-triggered Workers AI reply suggestions, copy-to-clipboard, and explicit owner confirmation before any outbound message.
- Implemented fail-closed signed Meta Cloud API webhook adapter with `X-Hub-Signature-256`, exact Phone Number ID check, D1 dedupe, token-protected thread APIs, and guarded outbound Graph API requests only in the WhatsApp 24-hour service window. No unsolicited sends or automatic AI replies.
- Added isolated D1 migration `0010_whatsapp_inbox.sql` (messages and outbox idempotency), onboarding/privacy instructions in `docs/WHATSAPP_SETUP.md`, and security regression tests. New credentials are **not present**, so direct inbox access and Cloud API sending remain INACTIVE pending owner Meta onboarding, privacy approval and optional fees.
- Direct Cloudflare production deployment succeeded: tourism Worker version `396ed52a-9d76-401e-bb4c-2705dfe08a00` at 100% traffic. Remote D1 tables `wa_inbox_messages` and `wa_outbox_requests` verified. No `WA_` credentials configured, so inbox/send are correctly OFF.\n- Updated public PWA static-only cache to v14. The existing `PUBLIC_LEADS_ENABLED=false` lead gate and admin tokens were not changed. No FinChat/Spenva resources touched.

## 3.3.0 — Guest selling-price previews, no supplier cost disclosure — 2026-10-19
- Removed the entire public island-tour `Hitung Sharing tanpa menebak kursi terjual` section, supplier vehicle net/cost per guest table, minimum agency margin and agency arithmetic. The associated guest copy on snorkeling/West/East pages was rewritten as ordinary travel information; operator expenses and minimum contribution remain in the authenticated admin pricing engine and quote workflow.
- Displayed starting guest-facing offers **on destination/photo previews** instead of in a supplier cost table: **Snorkeling Sharing Rp350.000/orang** and **West/East Island Tour mulai Rp800.000/mobil**. Private snorkeling remains quotation only. Explicit disclaimer: amounts are indicative, depend on inclusions, group size, operator verification and additional services, and are not automatically accepted bookings.
- These are *retail/public display prices*, not the old historical `LEGACY` snorkeling supplier rate of Rp350k. Supplier draft net remains Rp200k/pax for snorkeling Sharing and Rp600k/vehicle for island tours, accessible only through admin pricing workflow on the site; unchanged in database.
- Extended existing admin-authenticated CMS content allowlist with `price.snorkeling`, `price.island`, `price.west`, `price.east`; bilingual ID/EN fallbacks and normal D1 version history. Label edits are promotional text only and never bypass rate verification or mathematically calculated booking price floors.
- Revved static-only PWA cache to v12. Updated public regression, authenticated CMS and live smoke tests.
- Deployed through connected Cloudflare directly to Tourism-only Worker `marketing-turism-agent`, version `06852dc8-6d4c-4a8a-8a3f-a2ea589d056b` serving 100%. Seven existing Worker bindings and `PUBLIC_LEADS_ENABLED=false` preserved. No changes to FinChat/Spenva.

## 3.2.2 — Restore owner dashboard interactions — 2026-10-19
- Root cause: front-end dashboard boot crashed with `TypeError: $(...).forEach is not a function`, because single-element `querySelector` was incorrectly used when registering listeners on all admin tabs and dashboard shortcut tiles. This prevented the script from attaching the dashboard open and owner login handlers.
- Fixed both `public/app.js` listener registrations to use the existing multi-element selector `$$` (`querySelectorAll`). No pricing, booking, API, database schema or authentication rule changes.
- Added a DOM-like JavaScript execution regression test to `tests/pwa.test.mjs`: loads the full app source, confirms no bootstrap exception, opens the admin area, switches sidebar tabs and dashboard shortcuts, simulates a test-only authenticated admin session, loads real-summary-shaped backend data and logs out.
- Bumped Worker health and package to 3.2.2; refreshed static-only PWA cache to v11 so Android browsers can update the old broken `/app.js`. No administrative API data or tokens enter offline cache.
- Deployed directly to the isolated Cloudflare `marketing-turism-agent`, Worker version `0ff952b8-0100-47c8-9520-b99146e4e5cb` at 100% traffic, strictly inheriting all seven bindings. `ADMIN_TOKEN` remains a secret and `PUBLIC_LEADS_ENABLED=false`. FinChat/Spenva workers are untouched.

## 3.2.1 — Fix blank destination previews on Android/mobile — 2026-10-19
- Replaced CSS variable backgrounds with six genuine `<img>` elements: hero, two package covers, and three large West/East/Snorkeling tour covers; thumbnails and photo credits remain unchanged.
- Added object-fit, stable overlay, and dark fallback styles so missing or loading imagery cannot produce white-on-white headings. Existing multi-stage `photo-loader.js` fallback now applies to all large photo previews as well.
- Revved public-only offline PWA cache v9 → v10. Tested in CI with assertions covering image counts, required source slugs, removed CSS variables, and safe fallback styles. Live smoke also checks v3.2.1 assets, photo gateway, admin auth, D1 and lead-off gate.
- Uploaded directly to dedicated tourism Worker `marketing-turism-agent`, Cloudflare deployment version `c1b9d5cd-e712-41d1-baf5-475c2d6ff7c9` at 100% traffic, inheriting all seven existing bindings. No changes to FinChat/Spenva Workers, supplier prices, guest information or launch readiness.

## 3.2.0 — Premium tourism redesign, verified production — 2026-10-19
- Replaced the legacy NP monogram with a responsive vector emblem combining an elegant manta-ray silhouette, Nusa Penida cliffs, turquoise ocean and warm-gold sunlight; logo remains available offline via PWA cache.
- Redesigned the public landing page around live licensed destination photography, cinematic hero, West/East/three-spot snorkeling photo collections and prominent tour exploration calls-to-action, including photographer attribution. Preserved public enquiry and non-guaranteed manta disclosures and did not open public lead intake.
- Rewrote Indonesian and English marketing copy to feel welcoming and experience-led while retaining confirmed-operator, weather and price safeguards. Existing owner-published CMS data always takes priority over design defaults.
- Refreshed mobile styles and owner dashboard as a sidebar-and-cards workspace. Dashboard tiles open real modules; quick editing of EN/ID hero title and description uses existing owner-authenticated optimistic-version CMS endpoints and reports partial-save conflicts honestly. Displayed statistics remain actual backend data, never mocked reference image figures.
- Refreshed public-only offline service worker cache to v9; no guest/admin API data or token may enter service worker storage.
- Deployed directly to dedicated `marketing-turism-agent` Cloudflare Worker, version `858ca131-30f2-48cb-b0f1-253adf131a7a` receiving 100% of traffic. Existing seven Worker bindings were inherited without modification. This release does not change FinChat/Spenva deployments, operator net pricing or lead gate.
- GitHub-initiated Cloudflare deployments are still explicitly gated by repository secrets and opt-in variable; this direct authorized Cloudflare deployment is already live.

## 3.1.0 production verified — 2026-10-19
- Published v3.1.0 through the connected Cloudflare API to `marketing-turism-agent` without changing Spenva/FinChat Workers; all seven existing bindings inherited.
- Confirmed deployment version `5fff37c2-bdf0-41f1-922b-b159a61a1dcb` serving 100% of traffic and dedicated Tourism D1 CMS tables available.
- Live GitHub external smoke [#39210622766](https://github.com/rama160/Marketing-turism/actions/runs/39210622766) passed: logo, ID/EN selector, editable admin landing/tour pages, protected CMS HTTP 401, 10 JPEG galleries, stable catalog and guest intake OFF.
- Separate automated deployment from GitHub remains opt-in and requires GitHub Actions Cloudflare credentials, not yet provided. Previous failed GitHub deployment was not a release failure; production was updated directly.

## 3.1.0 — 2026-10-19
- Display canonical Nusa Penida Experiences logo in all core public experience-page headers, favicon and PWA icon.
- Automatic visitor language detection (Indonesian/English) with persisted manual selection; curated translations for guest pages without third-party translation API.
- New versioned homepage and tour-page text editor inside authenticated admin dashboard. Public read-only localized copy; owner write with secret, validation, optimistic locking, revisions and audit log. Additive D1 migration 0009.
- Scope unchanged: no rate changes, no operator verification shortcuts, no guest lead activation, no external posting, and no updates to FinChat/Spenva resources.
- Add regression coverage for language, logo, CMS authentication, XSS blocking, conflicts and audit.

# Changelog

## 3.0.4 — 2026-10-19
- Fix intermittent gallery failure caused by CDN dependency: dedicated Tourism-only Cloudflare KV now persists real source JPEGs, while bundled Cloudflare assets are preferred when available.
- Add versioned mobile photo URLs, fallback chain local static > GitHub raw > labeled placeholder, and refresh PWA offline static-shell cache.
- Add test coverage for KV persistence when external network fails and for local asset precedence; live smoke requires 10 valid same-origin JPEGs.
- No changes to operator pricing, guest data, admin secrets or Spenva/FinChat applications.


## 3.0.3 — 2026-10-19
- Fixed the recurring broken gallery problem: replaced unreliable Wikimedia photo redirects with ten licensed, downloaded, optimized, SHA-verified JPEG photo files in GitHub.
- Switched Cloudflare same-origin `/photos/<slug>` gateway to serve those archived images; added direct GitHub Raw browser image fallback and an explicit unavailable-message SVG.
- Updated original Commons credits on West, East, snorkeling and tour pages; added per-photo MIME/magic/hash tests and live verification of ALL TEN photo endpoints.
- Refreshed public PWA cache and CSP for image-only GitHub fallback. No change to tariffs, guest data, admin secrets or Spenva/FinChat deployments.


## 3.0.2 — 2026-10-19
- Fix guest photo failures with same-origin `/photos/{slug}` gateway, fixed canonical Wikimedia thumbnails, original fallback, and Cloudflare edge caching.
- Every gallery retains photographer/source credits. Missing upstream displays clear local SVG placeholder instead of broken image icon.
- Added tests for image slug whitelist and live photo retrieval; updated both Cloudflare Worker and Wrangler routing for `/photos/*`.
- No changes to booking, pricing, D1 guest data, secrets or FinChat/Spenva deployments.


## 3.0.1 — 2026-10-18
- Fixed all off-domain Wikimedia attraction photos being blocked by the separately deployed Worker CSP, while preserving restriction to trusted Commons and upload.wikimedia.org hosts.
- Added gallery image-origin allowlist regression test and live Cloudflare CSP smoke check; the static `_headers` rule was already correct.
- No tariff, booking, customer data, D1 migrations, worker secrets or FinChat/Spenva worker changes.


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
