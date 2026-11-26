# Aturan aktif: roadmap SEO (26 November 2026)

**Baca [roadmap.md](./roadmap.md) sebelum setiap pekerjaan SEO NPE.** Ini adalah sumber utama prioritas dan status pekerjaan SEO; permintaan eksplisit owner serta perbaikan kritis tetap berlaku. Fokus halaman pertama Google untuk kueri non-brand relevan dan konversi nyata, bukan penambahan fitur. Kerjakan task ID dengan prioritas tertinggi yang siap, update roadmap yang sama setelah setiap pekerjaan dengan bukti, status, blocker dan next action; jangan tandai selesai tanpa verifikasi. Tidak ada menu/dashboard, layanan berbayar, auto-publish, branch atau dokumen roadmap duplikat tanpa kebutuhan terbukti dan persetujuan owner. Verifikasi GSC dan audit awal 10/10 URL telah dilaporkan selesai pada 25 Nov; owner melaporkan quota exceeded 26 Nov dan mengizinkan pekerjaan independen; SEO-002 ditahan sementara untuk pengajuan baru. Lanjut SEO-003/004 bila data tersedia dan SEO-006/007/009 tanpa fitur baru. Baca log roadmap terbaru. Gunakan checklist URL di roadmap.md, jangan ulang request untuk URL yang sudah terindeks. Dua indeks artikel kosong tidak diprioritaskan. Aturan keamanan dan publikasi existing tetap berlaku.

## 26 November 2026 — Automated editorial research (draft only)
- Owner explicitly authorizes independent SEO article drafts, not social campaigns or automatic publishing. Reuse daily Worker cron with one research attempt per UTC week and review backlog cap of two. Aggregate existing public Reddit topic signals (not keyword volume), choose uncovered topic, retrieve a fixed Wikimedia source and existing product context; Workers AI generates ID/EN text. Failed source/AI/validation creates no article. Evidence shown in editor; owner selects cover, checks facts, edits, approves current version and explicitly publishes. Reject retains history; edit resets approval; public snapshots isolated. Existing direct-position ordering remains. No new menu, paid API, or new cron. CI/deploy/live scheduled research not yet verified.

## 26 November 2026 — Device-only article covers and permanent delete
- Owner requests direct device upload, not gallery selection or external image retrieval. Keep existing cover if unchanged; upload a new one using existing authenticated media storage, rights confirmation and a quality-prioritized article compression profile (max 1600 px, preserve ratio, JPEG 0.90–0.78, target ≤300 KB, fallback ≤850 KB); original device file unchanged. Existing gallery/other photo flows unchanged. Cover-only scope, no body-gallery feature. Save draft applies replacement/removal; approval resets as before.
- Add direct permanent delete for draft/rejected/approved/published articles. Published deletion requires explicit extra confirmation and current version; public ID/EN routes return 404, sitemap/list omit record after cache refresh. Shared photos not automatically deleted. No production article deleted by implementation. Tests added; release/live verification pending.

## 26 November 2026 — Installed dashboard launch recovery
- Owner reports installed dashboard opens public site. Keep canonical /dashboard.html manifest start and add explicit stable identity/scope, remove public shortcut, open explicit Website preview separately, remove manifest from offline cache and revalidate. Serve dashboard aliases directly via private no-store/noindex HTML shell from build template, preserving host migration and auth. Recover legacy standalone root only on devices marked by visiting the owner dashboard; normal guests and explicit website preview are unaffected. Existing home-screen shortcuts without marker may need reinstallation. No token stored, no SEO URL or DB change. CI/deploy and physical Android launch pending.

## 26 November 2026 — Optimize Lembongan activity cover LCP
- Owner PageSpeed report: other five service pages 96–100; Lembongan Island Tour mobile 87, LCP 4.1 s, FCP/Speed Index 0.8 s, TBT 0, CLS 0; accessibility/best practices/SEO 100. D1 read-only reports the published cover is 527627 bytes. Dynamic experience detail cover lacked srcset despite prebuilt WebP variants. Reuse existing responsivePhotoSet in server-rendered HTML, retain original fallback, eager/high priority and current layout; add unit/live regression. No changes to images in KV, CMS records, prices, other templates, or paid services. Release and post-change PageSpeed pending.

---

## Homepage destination card editor
- Group homepage destination section copy, static card cover, thumbnail labels and direct photo actions in one editor. Add a main activity or a static detail from the card editor; publication explicitly requested from this workspace appends it to its selected display group using the existing versioned layout API. Dynamic cards show published child thumbnail links and verified prices; order and hide their details with the existing layout control. No schema changes or reset; original static slots and published URLs remain intact. Drafts published in a different session can be placed using the existing layout selector. Photo and activity publication remains owner-confirmed.

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

## NPE v3.32.0 — SEO and site consistency (24 Nov 2026)
- Continue on `main` only, no duplicate site, no extra GitHub branches or PRs. Existing Indonesian static pages are served by Cloudflare Assets unchanged in routing to avoid previous redirect recursion; published dynamic activities and five new English SEO pages are generated by the existing Worker.
- English `/en/tours` and `/en/tours/{west,east,island,snorkeling}` pages have independent canonical, reciprocal hreflang in sitemap and static Indonesian HTML, verified Wikimedia photo credits, truthful FAQ and WhatsApp request CTAs; they are separate language versions, not replacements for the current dashboard or legacy guest website.
- Original tour pages have FAQ in both languages, aligned meta/OG/schema, image dimensions, static operator and price caveats, and package-specific WhatsApp messages; client-side language toggle remains supported. Website/photo editor, authentication, booking and partner pricing contracts are unchanged.
- D1 published SEO titles (Fast Boat and Nusa Lembongan) corrected. Lembongan gallery includes optional destinations; visitors must confirm which stops are in the booked itinerary.
- Known external follow-up: Google Search Console ownership, indexation and CTR, domain mapping, mobile PageSpeed/Core Web Vitals, GA4 setup, authentic reviews and finalized legal/cancellation policy. Never claim first-page ranking or verification without evidence.

## IMPORTANT CORRECTION — v3.31.0 final architecture
**Historical v3.31 warning (superseded by v3.33 isolated non-HTML asset templates): do not fetch the public HTML route from inside its Worker handler.** The attempt caused Cloudflare Assets canonical redirect loops and was reverted. The live website uses its original static guest HTML, now enhanced with search metadata, structured data, and permanent internal links. The Worker remains responsible ONLY for /api/*, /photos/*, robots.txt, sitemap.xml and /id|en/experiences/*; published activities are localized SEO pages with related HTML links.
Historical notes below describe experiments and are not an instruction to re-enable original HTML Worker-first routing. Live smoke and current wrangler.jsonc are definitive. Preserve bookings, original gallery content, owner sessions, existing Meta gates and independent Worker isolation.

## 2026-11-24 — SEO implementation v3.31.0 on main
The live original homepage, snorkeling, island tour and West/East pages now use server-side SEO enrichment via the existing Worker. The public HTML remains the canonical visual/editorial source. The Worker reads owner-published site content and activity listings to emit crawled HTML titles, descriptions, social previews, Organization/WebPage/BreadcrumbList graph and real HTML internal links.
Published dynamic activity detail pages remain bilingual with canonical/hreflang and now also include linked children and related activities. The dynamic sitemap includes id/en alternate links and published dates. No new schema, no duplicate site or CMS.
Do not create PRs or extra branches for this work. Keep current binding isolation, business prices, booking, consent, media ownership, existing marketing publication approvals and legal disclosures unchanged. Search Console ownership, indexing and Google rankings cannot be verified from code alone. Do not claim page-one ranking.

---


## 2026-11-24 — Production-source synchronization, v3.30.0
**Source of truth: current website on Cloudflare, branch: main only. No new branches or PRs for this maintenance.**
- Resolved a reproducible version mismatch: Worker/package were 3.29.0, but live smoke still demanded 3.22.0 and therefore every deployed release reported false failure.
- Aligned package, Worker health, NPE Studio visual badge, cache-busted dashboard CSS/JS, public CMS script URLs and PWA cache with release 3.30.0.
- The Worker is canonical for /robots.txt and /sitemap.xml (published CMS activities included). Removed redundant static duplicates, excluded dynamic URLs from service worker cache and updated tests to assert the actual Worker route instead.
- README now describes present-day site, billing/booking restrictions and architecture instead of asserting historical v3.8.0 as current.
- Hardened consistency test to prevent future version drift. Historical CHANGELOG and archived D1 migration files remain intentionally preserved; active local attribution photos remain in use and are not trash.
- Keep current published copy, D1 records, Cloudflare bindings, owner photo assignments, login sessions, marketing approval/Meta gates and guest booking behavior unchanged.

---

## 24 NOV 2026 — NPE GALLERY REUSE & SAFE DELETE v3.22.0
- Owner reported existing photo hash rejects repeated upload and could not find the NPE photo library. Add always-visible "Galeri NPE" shortcut inside Website Editor and a searchable grid listing all owner-uploaded photos independently of other site-content APIs.
- Every "Ganti Foto" now opens a single modal with **Galeri NPE** and **Dari Galeri HP**. Picking a stored photo publishes its existing media ID without upload or redundant rights form. New phone photo retains prior preview + required usage-rights attestation. Neither route navigates to the separate editor or alters unsaved copy.
- Duplicate JPEG digest upload now returns the original media ID with `reused:true` instead of 409 so previously stored photos can be selected; prevents duplicate KV content.
- New owner-authenticated `DELETE /api/admin/website/media/:id` requires `owner_confirmed:true`, checks no use in any homepage/gallery slot or current activity draft/published snapshot via guarded D1 DELETE; a referenced photo returns 409. Deletes the PHOTO_KV content only after the metadata row is removed. Never delete operator photo library, campaign media, or historic bookings.
- Admin media listing includes `usage_count`, allowing the UI to disable Hapus while a photo is referenced. Deletion is permanent and explicitly confirmed. No D1 schema migration; existing CMS, public image URLs, booking and AI workflows remain unchanged. Validate CI and live smoke before deploying.

---

## 24 NOV 2026 — ONE-TAP GANTI FOTO VIA GALERI HP v3.21.0
- In NPE Studio > Editor Website, "Ganti Foto" buttons on published page cards, image tiles and primary page button now invoke native Android image selection immediately, without navigating to a second Media/Website editor or reselecting a photo slot.
- After selecting a local photo, the owner sees one preview dialog with editable Indonesian/English alt text, a required commercial usage-rights confirmation, and "Simpan & Terbitkan Foto". The slot is retained from the initial button and cannot be changed by accident.
- Uses the existing compressOwnerPhoto function, authenticated /api/admin/website/media upload and /api/admin/website/slots publication; no new backend/database/migrations. If the slot publication fails after upload, retry reuses its media ID without duplicating the upload.
- Refreshes only image metadata and published card thumbnails, not full site-content editors: unsaved title, description and price edits are preserved. Existing Media Library remains available independently for bulk photo management and activity cover selections.
- Owner login and rights checks remain mandatory; the public site gets only the approved photo slot. Existing operator prices, quotes, bookings, Meta autopost, AI, Cloudflare secrets and older photo credits are not changed.

---

## 24 NOV 2026 — FIX PUBLISHED WEBSITE CMS EMPTY CONTENT v3.20.0
- Root cause: production site_content holds only overrides (zero rows), while actual public defaults reside in public HTML and language.js. The admin dashboard has no window.NusaLanguage, so editor fields were empty even though public pages worked.
- scripts/build.mjs now creates public/site-editor-defaults.json from existing public HTML and ID/EN translations, with no D1 changes or duplicated source copy. Wrangler uploads public/ assets after npm run ci.
- Published now displays true title, excerpt, price and photo on five original pages; editor loads true defaults plus D1 overrides (including intentionally blank prices). Only modified fields are saved, so owner can change one or many independently.
- Existing 13 destination-card headings/descriptions now data-copy fields; per-spot photos have 13 optional slots using additive D1 migration 0024_website_gallery_slots.sql, without touching the original five photo slots.
- Existing operator rate tables, historical quotations, leads, bookings, admin sessions, Meta/AI autopost, WhatsApp and other Workers are unchanged. Only approved image overrides appear publicly; original credited photos remain fallback. Verify CI and live smoke.

---

## 24 NOV 2026 — NPE CMS FRIENDLY PUBLISHED EDITOR v3.19.0
- Visible optional selling-price field for Add Activity; empty price saves with no public price displayed. Published activities and pages have one-click contextual edits, rather than hiding price under SEO.
- Dashboard Website now has four views: Published, Draft, Halaman Website (grouped existing homepage/West/East/Snorkeling/Island Tour content), and Foto & Media. Activity editor has preview and Save Draft / Save & Publish actions.
- Numeric selling price is IDR integer or blank with unit person/car/group/ticket and optional "Mulai dari". Amount generates bilingual labels. Unverified price can save as a draft but cannot be published; supplier net and historical quotes never change.
- Published activity editing preserves URL and public snapshot until owner publishes. Existing legacy pages can edit configured text/price and website photo slots. Non-CMS hardcoded decorations remain unchanged.
- No schema changes. Reuse current D1 tables, PHOTO_KV, version history, SEO routes, owner session, WhatsApp, booking and AI flows.
- Require CI and live smoke including Published UI, optional price and admin boundaries. Deploy only dedicated NPE Worker preserving bindings and existing migration guard.

---

## 24 NOV 2026 — WEBSITE CMS & ADD ACTIVITY v3.18.0 (pending deployment)
- Public site retains all original guest pages and old operator booking pathways. Additions occur in a standalone `src/website-cms.mjs`, existing `src/worker.mjs`, dashboard and public presentation.
- Existing `site_content` handles static text; new `website_activities` stores versioned draft/public snapshot (no auto publication), `website_media` metadata, `website_photo_slots` existing-page imagery; audit events use existing audit_log. New additive migration: `database/migrations/0023_website_cms.sql`.
- Owner must verify supplier scope before publishing an experience. Public pricing only if confirmed separately. Dynamic website experiences are enquiry-only via WhatsApp; **never** insert new activity codes into existing `rates`, `quotes`, `leads`, or `bookings` or pretend to support automated booking.
- Public SSR SEO pages: `/en/experiences/:slug`, `/id/experiences/:slug`; dynamic `/sitemap.xml` and `/robots.txt` need Worker-first routing. CMS photo binary uses existing `PHOTO_KV` key prefix `website-media/v1/`; unrelated photo library and social queue remain unchanged.
- Public JS `public/website-content.js` only reads published items and image slot metadata. Existing `public/guest.js`, `public/language.js`, guest consent, and WhatsApp intent tracking are preserved.
- The GitHub deployment workflow is opt-in and has been updated to apply ONLY the additive CMS migration; do not replay previously applied D1 schema migrations. Publish only after CI, D1 migration and isolated Worker/assets deployment verified.
- Existing Cloudflare Worker config must preserve `keep_vars`, three cron strings, D1, AI, static assets, PHOTO_KV, Meta, WhatsApp and any dashboard-managed bindings. Never alter other Workers or secrets.

---

## 27 OCT 2026 — FACEBOOK GROUPS SAVE HOTFIX v3.17.1
- Production D1 inspection showed **0 rows** in `growth_facebook_groups` when user reported 2 manual saves. No previous group URLs/names were in DB; never invent or silently re-create groups.
- Permit Facebook group /groups/<slug> plus mobile/tracking URL and Facebook-native /share/g/<token> bookmarks; normalize accepted origins strictly to facebook.com. /share/g links can be saved for review but a group-specific PUBLIC post reference must use the canonical /groups/<slug>/posts/<id> URL for confirmation. This never grants access to private Group content.
- Make group rules note OPTIONAL at bookmark time, filling "Belum diperiksa — jangan promosi sebelum membaca aturan grup" and keeping group in RESEARCH until owner reviews Facebook group rules.
- Owner-only independent GET `/api/admin/growth/facebook-groups` lists saved groups irrespective of concurrent other growth research; POST returns `saved:true` and persisted group after D1 read-after-write. Dashboard now shows saved count, dedicated reload, save errors inline, and displays confirmed items without relying on full dashboard refresh.
- Keep existing authentication cookie/session, Meta API restrictions, no auto-join, no scraping, no messaging/posts, marketing and booking endpoints unchanged. Add in-memory tests with 2 distinct groups, dedup, link variants and guarded GET.

## 27 OCTOBER 2026 — NPE STUDIO COMPACT DASHBOARD v3.17.0
- Use user-provided **Ceritexa dashboard preview v3** as a *layout interaction reference only* (airy neutral canvas, small cards, topbar/sidebar on desktop, bottom navigation on mobile, local mini-tabs and independent scroll sections). Do not copy its brand, story/video sample data, embedded image blob, simulated analytics, or literal purple palette.
- Existing production owner app at `/dashboard.html` now has six grouped workspaces: **Beranda, Tamu & Penjualan, Konten & Kampanye, Akuisisi Pelanggan, Analitik, Pengaturan**. The existing 14 CRUD/workflow tabs remain functional under group-specific contextual subnav, plus **Analitik** tab for genuine status aggregates from `GET /api/admin/analytics`. No API contract changes.
- **Exactly ONE** 'Lihat Website' link in the dashboard topbar and NO admin links on the public site. Homepage hero, small operational KPI cards and actionable priorities remain backed by real `/api/admin/summary`, data lists and `/api/admin/analytics`, not demo placeholders.
- Long operational tabs (`growth`, `campaigns`, `whatsapp`) are split into visible-only-at-a-time inner panes via `initCompactPanels`; preserve every original form, button, input ID, owner review, data fetch and submission handler. Selected workspace/tab/pane tracked in sessionStorage (never the admin token) for refresh continuity. Mobile bottom navigation remains reachable on Android.
- `public/dashboard.css` layers a new NPE ocean/indigo interface and responsive navigation over existing styles; public `/` and its `guest.js` do not change.
- Persistent HttpOnly owner cookie session, Cloudflare D1, booking, pricing, public Turnstile, Meta publishing and account integrations are unchanged. No paid services or new cron jobs.

## 27 OCTOBER 2026 — PERSISTENT OWNER LOGIN (v3.16.0)
- Owner enters Cloudflare ADMIN_TOKEN **once per trusted browser** at `/dashboard.html`. New `src/owner-session.mjs` issues random 256-bit opaque session cookie `__Secure-npe_owner_session` (Secure, HttpOnly, SameSite=Strict, Path=/api/admin), not the token itself. Browser auto-sends it to admin APIs; server stores only SHA256 hashed opaque cookie and an ADMIN_TOKEN fingerprint in D1 `owner_sessions` via additive migration `0022_owner_sessions.sql`.
- Dashboard GET `/api/admin/session` on every startup; valid sessions are extended for 365 days from the most recent opening (rolling expiry). Browser exit/refresh does not logout. No localStorage/sessionStorage raw secret persistence; previous version's tab-only `tourAdmin` secret is one-time migrated to new cookie then deleted.
- Explicit owner **Logout** `POST /api/admin/session/logout` revokes the server record AND deletes cookie. A previously revoked cookie cannot access any admin resource; the login field reappears. If server is offline, do not claim logout succeeded.
- Server validates exact-origin browser mutation requests and secure/Strict cookie, invalidates sessions after secret rotation; previous Bearer token API support is preserved for connected integrations. Never expose stored token in public guest JS, HTML, API response, service worker or audit logs.
- Independent admin/public website split unchanged; social scheduled workflows, photography, operators, guest Turnstile and Cloudflare target remain unchanged. Production smoke must reject unauthorized login and cross-site origins without making fake sessions.
- Security exceptions: explicit logout is the normal user-triggered exit; session may cease to work if cookies cleared, security token rotated, server session revoked, or after prolonged inactivity expiry. This is expected for security rather than silent periodic logout.

## 27 OCT 2026 — PUBLIC WEBSITE AND PRIVATE AGENT DASHBOARD SPLIT (v3.15.0)
- **Public tourism website:** `/` and `/index.html` contain ONLY travel marketing content, WhatsApp/contact and consented anti-bot lead form. Remove every dashboard toggle, admin HTML, admin input and app.js from public page.
- **Private agent dashboard:** `/dashboard.html` is the ONLY UI for operators, rates, leads, quotes, bookings, campaigns, growth, website CMS, WhatsApp owner inbox and finances. `public/app.js` operates ONLY dashboard; `public/dashboard.css` scopes private workspace visuals. It has a functional top-bar **Lihat Website** link to `/`, sidebar pages, mobile hamburger and saved current section. Admin auth still requires Cloudflare `ADMIN_TOKEN`; app session restores after refresh and logout clears it.
- **Public JS:** `public/guest.js` contains only guest variant options, readiness and POST /api/public/leads; guest analytics remains in `public/language.js`. Never move admin auth/token/client code back into public entrypoint. Use same-origin `/api` D1 Worker backend with unchanged operator, booking and privacy guards.
- **Android/PWA:** `manifest.webmanifest` starts at `/dashboard.html` (owner app rather than tourism guest page); guest home opened in installed standalone mode forwards to dashboard to support earlier installations. Public SW v26 caches ONLY public static files and no `dashboard.html`, `app.js`, APIs or admin data. Authenticated private pages require network. Website guest page does not advertise installable agent app.
- **Privacy/security:** dashboard markup is an accessible login shell, not a server-authenticated HTML resource. Protected data comes exclusively from owner-guarded API routes. No secrets persisted to service worker cache, no privilege implied by hiding public links. Dashboard has `noindex,nofollow`.
- Keep all 3 tourism Worker cron strings, keep_vars, D1, routes, Turnstile, Meta bindings and independent Spenva deployment untouched. Keep public contact, reviews, English/Indonesian CMS, image and gallery URLs. Frontend split integration tests and live dual-page smoke required.

## 27 OCT 2026 — DEPLOYMENT VERIFICATION ORDER
- `.github/workflows/live-smoke.yml` runs only when `Deploy Tourism Cloudflare (manual)` completes successfully (or explicit `workflow_dispatch`). Do not restore parallel push smoke: it runs before a deployment and gives false version mismatch. CI and 3-account Cron isolation unchanged.

## 27 OCT 2026 — NUSA LEMBONGAN + OWNER-GUIDED FACEBOOK GROUPS (v3.14.0)
- The user owns **Nusa Penida Experiences** brand; destination acquisition now includes **Nusa Penida and Nusa Lembongan**, with Nusa Ceningan grouped as Lembongan travel intent. Brand/legal entity names and existing published Nusa Penida products, prices, operators, booking modes, and daily schedules remain unchanged.
- Nusa Lembongan **RESEARCH ONLY / NON-BINDING ENQUIRIES**. No verified Lembongan tour or snorkel rates, supplier contract, group capacity, transfer route, or booking availability. NEVER reuse Penida prices/operators for Lembongan. Do not generate or approve binding quotes, prices, payments or published sellable Lembongan catalog until owner verifies actual operator and supplier agreements.
- `src/growth-engine.mjs` and `src/growth-platforms.mjs` now query Penida+Lembongan RSS/Bluesky, plus optional YouTube API; existing Facebook/Instagram read-only owned Meta scope preserved. Existing Cloudflare Cron remains EXACTLY 3 schedules (no fourth).
- `src/group-workflow.mjs` and `database/migrations/0021_facebook_group_owner_workflow.sql`: owner-only public Facebook Group watchlist, group rules, explicitly manual join label; owner-paraphrased public post question metadata and verified published time, 48h freshness/deadline, draft business disclosure, optional owner-marked interaction. Group post not fetched; no Groups API, no automated joins/posts/comments/DMs/group member scraping. No usernames, phone numbers, email addresses stored in group discovery.
- UI `public/index.html` / `public/app.js`: on Akuisisi Pelanggan tab, add group, select destination, save rules, manually mark joined, add PUBLIC post URL and paraphrased question, owner attest source/date, copy AI-assisted draft then respond manually; existing sales and marketing flows preserved.
- **DO NOT miscount** group questions as guest leads or bookings. Genuine lead/booking remains separate after visitor opt-in. Public website guest form already enabled for verified Penida offerings; Lembongan lead interest may be handled via official WhatsApp while pricing/operator still unverified.
- Additive migration 0021 must run after 0020 before Worker deploy; maintain account isolation, keep_vars, Meta secrets, static asset behavior, and version-aligned health/smoke scripts.

## 27 OCT 2026 — OWNER-REQUESTED LIVE GUEST ENQUIRIES (no automatic booking)
- Owner explicitly authorises `PUBLIC_LEADS_ENABLED=true` for `marketing-turism-agent` ONLY. This enables **consented enquiries**, not payments, vendor confirmation or automatic sale.
- Verified before activation: business profile/contact present, owner marked privacy/refund policies approved, production `TURNSTILE_SECRET` installed, official Turnstile sitekey `0x4AAAAAAFYd9j0rAcoO31Rh` is configured for `marketing-turism-agent.finchat-ai-gateway.workers.dev`. Live site widget action `lead_enquiry`; runtime validates successful hostname and action and checks consent, product, variant, guest count.
- LIVE D1 commercial-readiness gate **not complete**: 1 operator is DRAFT, ALL 12 supplier rate records are unverified. Never mark VERIFIED without supplier documentation. Do not quote binding final prices, confirm operator inventory, take guest payments or mark bookings PAID until owner verifies supplier/operator and obligations.
- Safety net: `scripts/smoke.mjs` tests current release version, readiness=true, protected Turnstile form present, and rejects request without Turnstile (403). Smoke NEVER creates guest profiles, paid bookings or fake conversion metrics.
- `wrangler.jsonc` now says true, so future isolated GitHub deploys retain the value. Cloudflare secrets and unrelated Spenva Workers are unchanged; manual tampering with runtime flag is not the release source of truth.
- Next operator actions: verify actual operator contracts, safety/capacity, business licenses as applicable, net rates for variants (sharing/private east/west and Manta Bay/Point), payment/refund agreement, and execute one legitimate owner-authorized test guest enquiry through visible browser Turnstile. Confirm lead appears privately in admin dashboard. No test person/account data should be invented.

## 27 OCT 2026 — CROSS-PLATFORM PUBLIC RESEARCH (3.13.0)
- Canonical real acquisition orchestrator: `src/growth-engine.mjs`, per-network *distinct* adapters: `src/growth-platforms.mjs`. Do not fork a duplicate lead service or alter existing campaign/WhatsApp production flows.
- **Automated**: Reddit public RSS (48h verified publication), Bluesky public AppView search (no auth), OSM hotel/hostel partnership mapping (7d), official Meta Page comments and Instagram Business media comments **only for owned connected assets with valid permissions**. YouTube video metadata search via official Data API is OPTIONAL and disabled unless a `YOUTUBE_DATA_API_KEY` Cloudflare secret plus `GROWTH_YOUTUBE_RESEARCH_ENABLED=true` are configured.
- **Manual research hubs**: Facebook Groups, Instagram hashtags, TikTok, Threads, X, YouTube, Tripadvisor, Google Maps. Do NOT claim these platforms' global users or private conversations have API access. TikTok Research API is not generally available to commercial tourism marketing. Absolutely no social scraping or unsolicited DMs.
- `GROWTH_META_RESEARCH_ENABLED=true` only enables safe read attempts using existing Meta Page/Instagram credentials. An HTTP permission error is `SOURCE_UNAVAILABLE` — no fabricated leads and no new Meta permissions claimed. Actual comments need Page/IG access granted by Meta.
- All automated social observations are max 48 hours old and expire at or before deadline for 'today'/'tomorrow' trips. Short question text and publicly accessible URL; no user names, profiles in database, visitor phone numbers, or private conversations. Owner manually decides any response.
- Additive `database/migrations/0020_multichannel_growth.sql` must apply after 0019 and before Worker code deployment. New `growth_network_opportunities` table avoids rewriting existing Reddit/OSM records; existing API response and status actions are preserved.
- Reuse account's existing hourly tourism Cron; per-source cool-down Bluesky/Meta 2 hours, optional YouTube daily, OSM 7 days. Do not add another Cloudflare Free cron or touch Spenva.
- Dashboard renders one consolidated review queue with source names and separately reported `NO_MATCH`, `SOURCE_UNAVAILABLE`, and missing-config behavior. Each source is an *opportunity for research*, NOT an opt-in guest lead or booking.

## CRITICAL 27 OCT 2026 — FRESH, ACTIONABLE TRAVEL LEADS
- Reddit matches require verifiable original published/pubDate timestamps, age <=48 hours and still-future deadlines for 'today' or 'tomorrow' in Bali time. Missing/old timestamps are NOT actionable leads.
- Reuse the EXISTING hourly Cron with a two-hour Reddit research cooldown; OSM accommodation research stays weekly. Do not add a fourth tourism Cron or pay for a Cloudflare upgrade.
- Additive, rerunnable migration database/migrations/0019_growth_freshness.sql records only public post URL and expiry. Apply after 0018 and before Worker deployment. Existing undated Reddit posts are hidden, not deleted; contacts and guest history remain intact.
- The dashboard displays post age and hides expired records. RSS blocks/403 mean SOURCE_UNAVAILABLE, not manufactured prospects. Responses remain owner-controlled; no auto-DM or group joining.
- This supersedes the 26 October daily-only research schedule described below.

## CRITICAL 26 OCT 2026 FREE CRON CAP HOTFIX — current truth
- This account hit Cloudflare Free **five Cron triggers account-wide** while trying to add tourism `0 3 * * *` (fourth tourism Cron); Wrangler deployment failed code 10072 despite successful D1 migration and Worker asset upload. Never upgrade to paid without user opt-in and never disable Spenva schedules.
- Real acquisition research is on existing tourism `0 2 * * *` at **10:00 WITA**, launched under `ctx.waitUntil` when config `GROWTH_PUBLIC_RESEARCH_ENABLED=true`. Tourism Cron remains exactly `["0 1 * * 1","0 2 * * *","0 * * * *"]`; preserve all three. RSS and OSM requests bounded in background. Historical v3.12.0 documentation referring to a *new 11:00 WITA* Cron is superseded.

## 26 OCTOBER 2026 · CUSTOMER ACQUISITION ENGINE (3.12.0) — READ FIRST
- Root problem verified from LIVE tourism D1, not inferred: FB/IG `POSTED` 25 Oct; FB and IG `VERIFIED` insights on 26 Oct each `views=0`, no engagements, no opt-in leads or bookings. `POSTED` does not mean reach. Do not manufacture engagement; growth marketing must connect audiences → WhatsApp intent → consented guest leads → verified operator quote → booking.
- Canonical `src/growth-engine.mjs` and additive migration `0018_growth_acquisition.sql`. New owner `GET /api/admin/growth`, owner-triggered `POST /api/admin/growth/research`, owner `POST /api/admin/growth/partners` (public business URL only), owner `PATCH /api/admin/growth/opportunities/:id/status`. These never send external messages or create guest leads. D1 stores only public question titles/URLs and public OSM business names, NOT account handles, group members, phone lists or private profiles. Daily research reuses existing 10:00 WITA Cron `0 2 * * *` through `ctx.waitUntil` independent of hourly Meta publishing. Reddit public RSS may become unavailable; fallback OSM partner discovery and human-reviewed search hub links. Correctly label SOURCE_UNAVAILABLE.
- Meta Facebook Groups API `publish_to_groups` removed 22 April 2024; no unauthorized group joining, scraping profiles, automated unsolicited messages or copy-pasted promotional comments. Owner may visit suggested public opportunities, check community rules, and manually share helpful replies with explicit affiliation, opting into promotion only if appropriate. `SHORTLISTED/CONTACTED/RESPONDED` statuses are manually confirmed, never inferred.
- Anonymous `POST /api/public/intent` accepts only same-origin `WHATSAPP` button-click summaries; D1 `growth_click_daily` retains day/source/page/count only, never IP/cookies/phone. `public/language.js` attaches event delegation to existing `data-whatsapp-chat` anchors; click count is not confirmed WhatsApp conversation or lead. `PUBLIC_LEADS_ENABLED=false` and `WA_SEND_ENABLED=false` remain unchanged until owner has approved privacy/refund and Meta permissions; do not silently enable lead collection or automatic WhatsApp sends.
- Public tourism brochure pages (home + 4 products) now allow search indexing; this improves eligibility ONLY, no instant Google visibility. Noindex remained accidentally from pilot, now corrected. SEO and outreach rely on external platform rules.
- Canonical `src/approved-autopilot.mjs` feedback: after actual Graph `data_status='VERIFIED'`, **including 0 views**, draft one new hook/CTA experiment with `status='DRAFT'` for OWNER APPROVAL; never self approve. This supersedes historical >=50 view threshold descriptions. `src/sales.mjs` new review captions ask for travel date/group size and include source-tagged site links where platform permits. Previously scheduled Meta and Metricool posts remain immutable; no duplicate files or Worker services.

## AUTONOMOUS RESEARCH: photo-first owner review and measured strategy (24 OCT 2026)
- Entry points: `src/photo-research.mjs` (central, no duplicates), `src/photo-library.mjs` handles dynamic resolver, `src/worker.mjs` calls photo selection from weekly `prepareMarketingWeek`, `src/approved-autopilot.mjs` calls it for next learned draft after REAL Meta insights. New `database/migrations/0017_photo_research.sql` is additive; `PHOTO_KV` remains sole binary store.
- **Not automatic publication**: Wikimedia Commons candidate is selected in campaign_preview with clearly stated license/source, but owner MUST verify exact subject and location on preview and explicitly approve. Search is bounded and strict; Commons external API may be blocked or return no matches; fallback is the existing vetted static library, preserving ability to generate drafts. No external paid photo service, no Google/social media scraping, no stock image copyright guesswork. Stats-driven topic priority comes from 90-day verified Meta/owner evidence, otherwise is marked exploration; this is NOT a live Google Trends API.
- GET `/photos/research/{uuid}` serves verified JPEG bytes from PHOTO_KV without secrets so Meta Graph can fetch them. The canonical queue stores a frozen public URL and attribution including license source. Dashboard owner POST `/api/admin/campaigns/:id/research-photo` updates only unapproved drafts, not queued posts; rejects unauthenticated users and already approved campaigns. If no new valid licensed result, preserves original image.
- Do not alter `META_APPROVED_AUTOPOST_ENABLED`, `PUBLIC_LEADS_ENABLED`, `WA_SEND_ENABLED`, already queued posts, existing owner-uploaded images or live Metricool times. No automatic change to permissions or source code. Audit photo-research attempts in D1 and continue strategy drafting even when Commons API is unavailable.

## 24 OCT 2026 ADD FOTO — OWNER UPLOAD TO EXISTING WORKER
- Primary module: `src/photo-library.mjs`, schema `database/migrations/0016_owner_photo_library.sql`. Use ONLY existing `PHOTO_KV` for binary; no R2, Supabase, VPS or separate photo repository. D1 keeps metadata and digest, never binary.
- Dashboard `tab-campaigns` has owner-only **+ Add Foto** form; mobile image compression removes original EXIF by drawing canvas into jpeg <850KB. Owner confirms content rights and any needed subject consent. POST `/api/admin/photos` requires ADMIN_TOKEN, returns photo with safe public `/photos/owner/<uuid>`; GET admin lists owner photos. Existing authenticated campaign POST `/api/admin/campaigns/<uuid>/photo` sets photo for DRAFT only (same activity), before owner approval. No schedule modifications or backfills.
- Photo is recorded via canonical `campaign_review_records.media_slug` as `owner-<uuid>`. Campaign preview uses `resolveCampaignPhoto`, Meta posting uses photo URL at Worker origin via `approved-autopilot.mjs` with frozen caption/image. Original Wikimedia photo handling remains unchanged, all queued photos remain immutable. Do not expose admin token in photo URLs or public responses.
- 0016 migration is additive; Cloudflare Workflow deploy only `marketing-turism-agent`. Photo binaries served on /photos/owner/<uuid> are publicly available as required for Meta, so owner must not upload private photos, sensitive documents or images without commercial-use rights.

## LIVE VERIFICATION 24 OCT 2026 — APPROVED BACKLOG
- Production v3.9.0 deployment and CI/smoke success verified in GitHub Actions; Cloudflare hourly Cron confirmed; D1 contains 6 legacy APPROVED, 4 DRAFT, but 0 approved_social_queue, 0 approved_social_metrics, 0 approved_social_learning. Do NOT call pipeline end-to-end validated until owner approves a new post and Graph confirms POSTED and verified insights; Meta read 200 does NOT prove publishing permissions.
- Old APPROVED campaigns are never automatically backfilled. Owner may explicitly select **Jadwalkan otomatis** on an older APPROVED card to call POST `/api/admin/campaigns/{id}/schedule` with `{owner_confirmed:true,auto_publish:true,platforms:[...]}`. Implemented using canonical `queueApprovedCampaign(...,{fromApproved:true})`, only if no existing queue, no public_url and not rejected; audit uniqueness enforced. All scheduled dates skip known Metricool dates Oct 26,28,30 and require owner confirmation.
- PWA cache v22. Follow-up after a live owner-approved trial must verify post IDs on actual Facebook/Instagram, collect REAL insights 20+ hours after publishing, and confirm new REVIEW DRAFT. Do not make unapproved real Graph POST requests or reveal credentials.

## APPROVED-ONLY AUTONOMOUS MARKETING LOOP — 24 October 2026
- Canonical source `src/approved-autopilot.mjs`. **Never** wire owner approval to old `marketing_publications` automatically generated from weekly idea indices; that path is unrelated to approved drafts and must remain disabled.
- New owner PATCH `/api/admin/campaigns/{id}/status` with `{status:"APPROVED",owner_confirmed:true,auto_publish:true,platforms:["Facebook","Instagram"]}` atomically freezes current caption and licensed photo and schedules each chosen channel. Approval requires explicit channel selection in Dashboard. Historic APPROVED records and Metricool posts are not backfilled. Meta Page/IG IDs and secrets stay as Cloudflare dashboard bindings; never print or move token values.
- Cron `0 * * * *` (hourly) dispatches only approved D1 `approved_social_queue` rows after current read identity check; ambiguous Graph posts are set REVIEW_REQUIRED and **never retried automatically**. Instagram media container is created in one cron and published only after subsequent GET shows FINISHED. One channel/day guard and 26/28/30 Oct Metricool dates excluded via `META_EXTERNAL_POST_DATES`; this guard needs updating if Metricool schedules change.
- Graph measurements `approved_social_metrics` retain NULL for unsupported or unavailable views/clicks, avoid any invented analytics. Verified views feed existing `marketingIntelligence`; one learning draft per post after >=50 verified media views in `approved_social_learning`, requiring human approval for every recurrence. `marketing_decisions` stores ranked evidence, no autonomous code changes or unapproved publication.
- Owner-only GET `/api/admin/marketing/approved-queue` shows schedules/status; owner-only POST `.../{id}/cancel` can cancel QUEUED only. No code touches FinChat/Spenva. Keep Cloudflare `keep_vars:true`, keep `PUBLIC_LEADS_ENABLED=false` and `WA_SEND_ENABLED=false` unchanged.
- IMPORTANT: Graph READ_OK does not prove Graph POST permission; failed POST must be inspected on Meta, not retried blindly. FB/IG Graph media insights permissions and metric names change; measure only verified values and degrade to PARTIAL/UNAVAILABLE when not supported.

## OWNER CAMPAIGN REVIEW AND AUTOMATIC REVISION — 23 Oct 2026
- Preserve canonical modules `src/sales.mjs` (caption fallback), `src/marketing-media.mjs` (reusable vetted local photo attribution) and `src/worker.mjs` (admin-only transitions). Do not duplicate services or hardcode new photo sources.
- Admin GET `/api/admin/campaigns` attaches a licensed `preview_photo` object and returns a derived `REJECTED` for drafts with rejection history; storage CHECK in `campaign_drafts` is left intact to avoid destructive migration. `campaign_review_records` via additive migration 0014 stores photo, revision, rejection reason and linked replacement, with a unique audit index preventing concurrent duplicate rejection. A rejected draft cannot be approved.
- Admin PATCH `/api/admin/campaigns/{id}/status` with `{status:"REJECTED",reason,owner_confirmed:true}` creates a replacement DRAFT atomically, with distinct photo, immediate Workers AI attempt and safe deterministic fallback. No post is sent to Meta/Metricool, and no guest data is included in AI prompts. Always require owner approval; existing PUBLISHED/APPROVED workflow is preserved.
- Dashboard Campaign panel renders full-text caption, local photo, Commons author/license and preview link plus approve/reject actions; failed photo uses existing photo-loader fallback. Respect image licences. PWA cache bumped to v20. All changes test via CI and deployed only to tourism Cloudflare Worker.

## AUDIT 23 OCT 2026 — DRAFTS AND GRAPH 401
- Cloudflare D1 showed only two Website drafts from 18 Oct; current week 19 Oct seven-draft run absent. Daily Cron now idempotently calls canonical `prepareMarketingWeek` to recover missed Monday runs. When recovered after Monday, the 7 review dates start at recovery day and move forward; **no Meta publication slots are created on recovery**, protecting against accidental duplicate scheduled Metricool posts. Legacy drafts remain in collapsed owner history (not deleted). Date in legacy `[AUTO 2026-10-18]` caption is creation date, not scheduled publication.
- Both Facebook Page and IG Graph read diagnostics returned HTTP 401 using Cloudflare `META_PAGE_ACCESS_TOKEN` binding, likely invalid/expired/wrong type. Page/Instagram ID vars are correct; secret values are never visible or exposed. Replace only the Cloudflare Page token with a verified Page Access Token after official Meta Graph Explorer permissions checks; retest owner diagnostics. App tokens are not substitutes.
- Keep all outbound publish gate vars unconfigured; keep `PUBLIC_LEADS_ENABLED=false` and `WA_SEND_ENABLED=false`; do not change Metricool schedule or other Workers. Website updates must bump PWA cache and smoke version check.

## META INTERNAL DIAGNOSTICS — 21 October 2026
- Canonical `src/meta-publisher.mjs` uses GET-only Graph identity probes with Cloudflare Secrets, checks returned ID equality and never logs token or response bodies.
- Daily existing Cron `0 2 * * *` (10 WITA) saves anonymized status via additive D1 migration `0013_meta_diagnostics.sql` with 30-day retention. No duplicate Cron trigger.
- Owner dashboard Marketing has status/history and a manual check button. Owner-only GET `/api/admin/marketing/meta/status` reads results; owner-only POST `/api/admin/marketing/meta/diagnostics` triggers a test with five-minute cooldown. No Admin Token in ChatGPT.
- `READ_OK` is not publishing or insights permission. `META_GRAPH_PUBLISH_ENABLED`, `META_GRAPH_OWNER_APPROVED`, leads and WhatsApp gates remain unchanged. Keep `keep_vars:true`, do not touch other Workers.

## CRITICAL WORKER DEPLOYMENT SAFETY — 21 October 2026
- `wrangler.jsonc` uses `keep_vars: true`; retain it for every deployment to `marketing-turism-agent`. Production uses Dashboard-managed plain text `META_PAGE_ID`, `META_IG_USER_ID`, `WA_PHONE_NUMBER_ID`, `WA_SEND_ENABLED`, and `WA_WEBHOOK_ENABLED` in addition to repo-defined `PUBLIC_LEADS_ENABLED=false`. Without this flag, `wrangler deploy` can remove remote dashboard vars not in config and interrupt Meta/WhatsApp connectivity.
- Do NOT broaden deployment beyond this Worker, touch FinChat/Spenva Workers, or enable Meta publishing without explicit owner approval and verified permissions.

## META CLOUDFLARE FIX — 21 OKTOBER 2026 (review status)
- Cloudflare saat audit memiliki `META_PAGE_ID=1375913638943340`, `META_IG_USER_ID=17841473759990847`, `META_PAGE_ACCESS_TOKEN`, `META_APP_SECRET`, dan `META_APP_ACCESS_TOKEN`. Hanya ID yang boleh ditulis pada dokumentasi; token dan secret tidak boleh dibaca atau dikirim ke chat.
- `src/meta-publisher.mjs` sekarang membaca `META_PAGE_ID`, `META_IG_USER_ID`, dan `META_PAGE_ACCESS_TOKEN` yang telah ada; nama `META_GRAPH_*` lama hanya fallback. **Menyimpan credential tidak berarti izin platform lengkap atau publikasi aktif.**
- `GET /api/admin/marketing/meta/status` untuk status konfigurasi dan `?probe=true` untuk pengujian baca Page/IG. Hanya pemilik dengan `ADMIN_TOKEN`; jangan masukkan token ke URL atau screenshot. Tidak ada Graph POST pada endpoint ini.
- Direct Meta posting tetap **OFF** tanpa tiga opt-in independen `META_GRAPH_PUBLISH_ENABLED=true`, `META_GRAPH_OWNER_APPROVED=true`, dan `META_GRAPH_PUBLISH_START=YYYY-MM-DD`. Jangan aktifkan sebelum uji izin `pages_manage_posts`, uji hak Instagram, review konten, dan kesiapan operasional. Meta Insights otomatis dan Metricool HTTP API masih belum terhubung.
- Pekerjaan ini dibatasi pada repositori `rama160/Marketing-turism`; ketika PR belum dideploy, kode live masih versi sebelumnya. Verifikasi tiap deployment dengan GitHub CI + live smoke, jangan klaim produksi sudah berubah sampai dibuktikan.

## PRODUCTION TRUTH — 2026-10-21 (highest priority)
- v3.8.0 LIVE Cloudflare Worker `marketing-turism-agent` version 43 / ID `a2def26d-848f-49fa-abb9-be5b49be301a` (100% traffic); previous rollback version `a829cf8b-22d2-448c-8577-f24038d6288c`.
- Isolated D1 `marketing-turism-db` tables `marketing_observations`, `marketing_decisions`, `marketing_publications` created successfully from additive migrations 0011/0012. Never migrate other D1s.
- Cron active: Monday 09 WITA prepares 7 drafts and 3 gated slots; daily 10 WITA checks queue. META_GRAPH_* bindings NOT SET, so zero Meta API posting by Cloudflare. Metricool autopublish remains the current posting path.
- 12 old secrets/bindings retained, `PUBLIC_LEADS_ENABLED=false`, `WA_SEND_ENABLED=false`; verified in Cloudflare version API and [passing live smoke](https://github.com/rama160/Marketing-turism/actions/runs/39552409086). GitHub Actions auto-deploy separate and still intentionally skipped.
- Active feature is autonomous planning and learning *from entered verified metrics*. Auto-ingestion of Meta Insights and independent Graph publication remain unfinished without owner authorization.

# AI START HERE — Marketing Turism Agent
Version: 3.8.0 | 2026-10-21 | Repository: rama160/Marketing-turism

## Immutable user-approved business rules
- Tourism experiences only: snorkeling, island tours and added activities by verified local operators. Agent owns guest acquisition, price presentation and payment collection; operator delivers activity.
- Snorkeling 3 spots: CURRENT owner-provided draft net SHARING Rp200,000 per guest, max 20; PRIVATE Manta Bay Rp1,500,000 per booking (3 spots), Manta Point Rp2,800,000 per booking (3 spots). Historic Rp350,000 LEGACY rate is only for previous quotes.
- Island car: initial net Rp600,000 per car, seating 6 or 7 must be verified by each partner.
- Lunch: initial net Rp150,000 per person; extra to island car.
- Fast boat: initial net Rp150,000 per person per ONE WAY in either direction, owner-confirmed base cost. Each actual boat operator and quote still requires verification.
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
5a. Only change the dedicated Marketing Turism Worker and D1. Never deploy over finchat-ai-gateway or spenva-play-billing.
5b. When increasing schema, create additive migration; never modify already applied migration.
6. Always use owner authorization for sensitive CRUD and limit public forms.
7. Never claim payment success from a screenshot; require actual externally verified funds.
8. Validate build locally and in GitHub Actions; live smoke checks are separate.
9. Never touch existing FinChat/Spenva Cloudflare resources. Marketing Turism resources are isolated.

## Marketing policy
Market references must preserve observed date, source, included services and pricing unit. NEVER compare a group price to per-person price without normalizing quantity and inclusions. AI Sales replies are drafts only. Campaign status PUBLISHED requires a real external URL entered manually; do not claim auto-posting.

## Production checklist
Real operator agreements and tariffs, capacity, cancellation rules, marine safety, contact and legal identity, privacy notice, payment destination, tests, publication rights and guest support process must be confirmed before public lead intake is enabled.

## Scheduling policy
Cloudflare Cron `0 1 * * 1` on marketing-turism-agent generates only reviewable Website campaign drafts. No outbound messaging, posting, paid ads or AI payments. Do not create triggers in FinChat or Spenva workers.

## Lead intake gate 2.5.0
Never accept real guest data unless: dedicated Tourism D1 business_profile contains verified legal name, public contact, approved FINAL privacy and refund terms; TURNSTILE_SECRET is configured on marketing-turism-agent; Cloudflare PUBLIC_LEADS_ENABLED is intentionally true. Privacy/terms files in pilot are NOT final business policies; update them before approving. The Turnstile widget key is public; its secret must never appear in GitHub or chat.

## Owner-approved October 2026 updates
- Temporary trade brand Penivara Experiences: do not present as registered business/trademark. Keep Cloudflare marketing-turism-agent isolated.
- Operators may be registered manually after leads arrive; public enquiries alone are not confirmed availability or transactions.
- Island vehicle must have seat capacity verified at booking (6 or 7, not automatically assumed 7).
- Outbound AND return fast boat net are each Rp150,000/person/one way, initially DRAFT per operator. Lunch Rp150,000/person net extra. No tourist entrance fee for current route; vehicle owner bears parking.
- Payments: manual bank transfer only, QRIS not available. Never invent bank account or QR image.
- Owner requested cancellation penalties of 25/50/75/100% at H-7+/H-6..3/H-2..1/H0. Policy is DRAFT pending legal review, before-payment consent and supplier cancellation cost agreements. Supplier cancellation/unsafe event must not be treated as voluntary guest forfeiture. AI cannot refund or debit.
- Market distribution: only draft content, manual owner posting and real links for Instagram/Facebook/TikTok/YouTube/Google Business Profile/WhatsApp Business/Telegram/marketplaces. No spam or invented platform connection.

## Sharing and Private — owner-approved
- BOTH snorkelling 3 spots and island tour offer Sharing (may mix unrelated guests) or Private (exclusive for at least 1 guest).
- Sharing must have operator-VERIFIED per-person net, boat/car capacity, and an explicit guarantee that a booked guest costs the agent only their own seat, regardless of other passenger occupancy. If operator charges entire underfilled boat/car, NO binding Sharing quote until exposure is covered with a properly verified different rate.
- Private island tour pays the full exclusive vehicle net per booking even for one guest; actual safe capacity is verified for each supplier.
- Private snorkeling uses operator-verified net per guest PLUS the fixed exclusive boat/service fee per booking. No fixed fee confirmation -> NO Private quote.
- New mode minimum selling price = total actual operator net + agent/transaction costs + at least IDR 100,000 contribution per booking; no AI override. Price per guest in preview is only average, not a separate discount.
- Rate versions are separately scoped by operator/activity/mode. Existing LEGACY rows and quotes are preserved, not converted to guaranteed Shared/Private rates automatically.
- Operator manually confirms availability and guest count before quote approval; there is no real-time seat inventory integration or automatic pooling of bookings.

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

## Photo source CSP consistency
For every deployment path (GitHub Wrangler assets AND manually uploaded `entry.mjs` modules), the live HTML response CSP must include `img-src 'self' data: https://commons.wikimedia.org https://upload.wikimedia.org`. Otherwise every attraction photo is blocked, despite a green HTTP page smoke check. Keep the allowlist restricted to these sources, maintain photographer credits, and verify live response CSP in `scripts/smoke.mjs`. Avoid touching FinChat or Spenva Workers.

## Gallery resilience v3.0.2
Photo images MUST use same-origin `/photos/{slug}` served from canonical Wikimedia thumbnail URLs by `src/photos.mjs`, not `Special:FilePath?width=900`. Only known slugs are allowed; CDN retrieval is cached, falls back to original if thumbnail fails, and frontend displays a local honest placeholder if origin is unavailable. All galleries preserve Commons author/source attribution. Both manual Cloudflare multipart deployment entry router and Wrangler `run_worker_first` must route `/photos/*` through `src/worker.mjs`. Verify 200 image responses for at least Kelingking, Diamond Beach, Manta Point. Do not update Spenva/FinChat.

## Gallery photo delivery 3.0.3 (DO NOT REGRESS)
- Source of truth: public/photos/{slug}.jpg (10 genuine photos), with authors/licenses/hashes in `public/photos/manifest.json`. Scripts: `scripts/sync-photos.mjs`, `scripts/optimize-photos.py`, workflow `sync-photos.yml`. DO NOT replace with broken `Special:FilePath` redirects.
- Production Worker deployment must import `photos.mjs` and route `/photos/*` to API Worker, return real JPEG bytes and cache them; browser `photo-loader.js` falls back to GitHub Raw direct JPG and finally labelled local SVG.
- CSP for image source includes `raw.githubusercontent.com`; public pages have clickable Commons credits. Test `tests/photos.test.mjs` verifies SHA256/JPEG bytes/author attribution; `scripts/smoke.mjs` verifies all ten live photo endpoints. Preserve separation from Spenva/FinChat and maintain lead gate OFF until legal readiness.

## Photo reliability (3.0.4)
Ten photo JPG files at `public/photos/*.jpg` are already verified. The Worker `/photos/{slug}` serves in order: Cloudflare native Assets when binding is configured, dedicated `PHOTO_KV` persistent namespace `marketing-turism-photo-cache` (KV id `75b81d83ac954e57a2976c651470dc85`), then verified Github JPG on cold miss. On successful cold fetch Worker stores source bytes to KV. Backend is not allowed to advertise success based only on external mirror fallback; live smoke checks real JPEGs. `public/photo-loader.js` offers local static, GitHub and labeled SVG fallback. Preserve exact CC credits from `public/photos/manifest.json`. This KV contains only public licensed images. Do not modify Spenva/FinChat and do not cache guest private data.

## v3.1.0 — final logo placement, language selector and owner-approved website copy
- Preserve existing official brand `Nusa Penida Experiences`; reuse the repository's canonical `public/icon.svg` asset as visible header logo across core public pages and PWA icon. Never overwrite with brand guesses or alter business identity.
- Guest frontend detects Indonesian/English from browser locale when `Auto` is selected, with manual ID/EN override persisted only as a language preference in browser localStorage. Static curated translations are stored in `public/language.js`; no third-party translation or tracking.
- Homepage and experience-page heading/intro text can be changed in the existing dashboard > **Editor Website** after admin token verification. Only `src/site-content.mjs` defines allowed public fields. Endpoint GET `/api/public/site-content?lang=en|id` is public read-only; admin GET/POST `/api/admin/site-content` requires existing owner secret. Content updates go to D1 with CAS `expected_version`, immutable revisions and audit_log entry, migration `0009_site_content.sql`.
- CMS publishes **plain text only** (not HTML/script), max 1,200 characters; no pricing, policy, payment promises, bank details, guest data, or safety commitments should be edited via these fields. Initial text is sourced from existing static content until owner publishes changes. Owner must edit Indonesian and English separately to keep the wording consistent.
- No new OAuth, provider API, secret or billing resource. No actions on `finchat-ai-gateway` or `spenva-play-billing`. D1 must be migrated before deploying updated website; deploy only through dedicated Tourism Worker workflow after CI passes. Public lead intake remains OFF.

## v3.1.0 Cloudflare production status — verified live, 2026-10-19
- The current official trade name is **Nusa Penida Experiences**; the earlier Penivara draft name noted in historical entries is superseded.
- Direct Cloudflare upload of static modules, Worker code and new CMS module succeeded on the dedicated `marketing-turism-agent` on 2026-10-19. All previous Worker binding names were inherited strictly. Never update FinChat or Spenva resources.
- GitHub live smoke [#39210622766](https://github.com/rama160/Marketing-turism/actions/runs/39210622766) **passed** against the published HTTPS endpoint for v3.1.0, the new logo, ID/EN language resource, owner CMS endpoint access, seven branded pages and photo gateway, with guest lead intake still OFF.
- Additive Tourism D1 tables `site_content` and `site_content_revisions` are live. Do not re-run historic ALTER migrations blindly.
- GitHub-to-Cloudflare auto-deploy is intentionally still opt-in via `ENABLE_CLOUDFLARE_DEPLOY` and currently lacks GitHub Actions secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`; this does **not** mean the website is offline or the direct Cloudflare deployment failed. Future GitHub code changes are not automatically published until that separate CI integration is configured.

## Public design release v3.2.0 (2026-10-19)
- LIVE Cloudflare version `858ca131-30f2-48cb-b0f1-253adf131a7a` on `marketing-turism-agent` for all traffic. New logo is a manta ray and Nusa Penida cliff silhouette; homepage uses genuine archived destination images and their Commons attribution.
- Public visual theme: deep navy, turquoise, warm gold; photographic full-width hero; West, East and snorkeling image cards; responsive navigation.
- Curated Indonesian and English copy must be inspiring but not promise actual sightings, guaranteed availability, booking confirmation, fixed guest prices or payment while launch gate remains OFF. D1 CMS entries override locale fallbacks.
- Owner dashboard shows only real records and contains a Quick Edit panel for hero title and description for both ID/EN. It submits to existing owner-authenticated `/api/admin/site-content` with optimistic versions; all navigation controls open existing modules. Never insert sample bookings or customers from the visual mockup into production.
- Service worker cache revision v9 caches only public static assets; maintain original lead security, API guards and all seven existing tourism Worker bindings. This direct Cloudflare deployment does not configure GitHub Actions secrets; future CI-to-Cloudflare deployment still requires explicit owner setup.

## Mobile photo reliability release v3.2.1 — 2026-10-19
- Live dedicated Worker deployment `c1b9d5cd-e712-41d1-baf5-475c2d6ff7c9`, serving all traffic. The user reported blank West/East full-size previews despite good small photo thumbnails in Android. All six large hero/package/tour images are now native `<img>` with safe `object-fit`, gradient readability, a real dark fallback, and existing `photo-loader.js` recovery. Never reintroduce CSS-variable-only background photos for essential assets. Keep Wikimedia attribution visible.
- Public-only PWA cache v10 ensures revised HTML/CSS is served to returning users. Keep `/api/admin`, leads, tokens, D1/financial data out of offline cache. No change to owner security, operator rates or blocked public lead intake.
- Canonical smoke `scripts/smoke.mjs` and `tests/pwa.test.mjs` assert all six image elements and fallback CSS. Future deployments must verify real live source asset responses, and ideally test the mobile UI directly on a phone.

## Owner dashboard crash fix v3.2.2 — 2026-10-19
- `public/app.js` had a fatal boot-time `TypeError: $(...).forEach is not a function` for sidebar tab links and dashboard shortcut cards. Use the shared `$$`/querySelectorAll helper for collections; use `$`/querySelector for single DOM elements. Do not silently bypass dashboard initialization.
- Regression test in `tests/pwa.test.mjs` executes app code in a mock DOM, tests admin opener, sidebar/card routing, mock authorized sign-in and logout. Keep this test when modifying web dashboard.
- LIVE dedicated Cloudflare Worker version `0ff952b8-0100-47c8-9520-b99146e4e5cb`, 100% traffic. Refresh static-only PWA cache v11. Seven Worker bindings preserved including the owner secret; guest lead flag remains OFF. Do not change booking workflow or partner rates to fix a UI crash.

## Retail photo prices and guest disclosure boundary — v3.3.0 (2026-10-19)
- **Public retail-only**: Snorkeling 3 Spots Sharing advertises **Rp350,000 per person**, Island Tour West and East **from Rp800,000 per full car**. Keep both unit and 'from/starting' qualification obvious. These are owner-requested *guest display prices*, not verified supplier net or guaranteed final bookings.
- **Supplier-only**: Initial net snorkeling Sharing Rp200k/person, initial island vehicle net Rp600k/car, min agency margin Rp100k/whole booking and internal math must **never appear on customer-facing tour pages, photos or language.js**. Retain the historical operator rate rows and price guard for admin quote calculations.
- Guest photo badges and CMS allowlisted text keys: `price.snorkeling`, `price.island`, `price.west`, `price.east`; admin owner must review changes under both `id` and `en`. Display-only marketing text must not override the mathematically safe final quotation.
- Remove public internal fare arithmetic; don't remove admin quote preview, historical rate snapshots, audit/finance workflows or server price minimum guards. Snorkeling Private retail rate not public until verified. Extras and activity availability must be confirmed.
- LIVE Tourism-only Worker v3.3.0 `06852dc8-6d4c-4a8a-8a3f-a2ea589d056b` at 100%; seven existing bindings preserved, public guest lead gate still OFF. PWA static cache v12; automatic GitHub Worker deployments remain separately opt-in.

## WhatsApp guest acquisition & owner-only Cloud API workflow (v3.5.0)
- Owner-approved business chat: `https://wa.me/628561752525`; owner-approved business catalog: `https://wa.me/c/628561752525`. They MUST remain distinct public links in homepage contact, detail pages, and mobile floating CTA. Locale switch modifies only optional prefilled chat text.
- Dashboard WhatsApp tab has copied reply snippets plus a **disabled-until-connected** verified message inbox, Cloudflare Workers AI human-review drafts, and a send control requiring owner confirmation for each message. The lack of Meta access is not a software defect. Do not claim WhatsApp messages are already connected, read or sent.
- Integration is **fail closed** unless `WA_WEBHOOK_ENABLED=true`, Meta App Secret, verify token and Phone Number ID are present. Incoming webhooks require HMAC-SHA256 `X-Hub-Signature-256`, must match the expected Meta Phone Number ID and insert deduplicated text messages only into dedicated tourism D1. Admin endpoints remain protected by existing `ADMIN_TOKEN`.
- Outbound sending additionally requires `WA_SEND_ENABLED=true` and `WA_ACCESS_TOKEN` granted by the owner after lawful Meta onboarding. Only manually approved replies to recent inbound conversations in the ~24-hour customer-service window; no campaign blast, automated reply, or unsupervised guest quote. Server rate limits and outbox request dedupe are required.
- Additive migration 0010_whatsapp_inbox.sql; do not replay historic ALTER migrations. Complete final privacy and data retention review before enabling message capture. See `docs/WHATSAPP_SETUP.md` for Meta coexistence steps and secret storage in the Tourism Worker (not ChatGPT or GitHub).
- Official WhatsApp Cloud API can have fees. Preserve `PUBLIC_LEADS_ENABLED=false`, all operator/quote/payment gates and the separate FinChat/Spenva infrastructure.

## v3.5.0 live Cloudflare release verification — 2026-10-19
- Direct deployment ID `396ed52a-9d76-401e-bb4c-2705dfe08a00` serves 100% of traffic. Public WhatsApp chat + catalog, owner inbox UI, official signed webhook and safe manual send adapter are uploaded.
- Applied and verified only additive D1 migration 0010 on the dedicated tourism DB. All seven pre-existing Workers bindings preserved; no WhatsApp API credentials are currently configured. Do NOT claim the new inbox is reading guest conversations yet. Public lead intake remains false.
- Official Meta Cloud API onboarding must be done by the owner. Do not collect OTPs or passwords, auto-send, or migrate the existing mobile app number blindly.

## Panduan Meta WhatsApp berbahasa Indonesia dan tombol di dashboard — v3.5.1
- Panduan tunggal `docs/WHATSAPP_SETUP.md` sudah diterjemahkan dan diperluas menjadi langkah dari nol dalam Bahasa Indonesia. **Jangan buat dokumen serupa/duplikat.** Dashboard → WhatsApp menyediakan tautan langsung ke dokumen ini.
- Selalu gunakan jalur resmi **Coexistence** jika memungkinkan agar WhatsApp Business App + nomor 628561752525 tetap berjalan; **jangan menyuruh pemilik menghapus akun untuk jalur API standar**.
- Rute webhook `/api/webhooks/whatsapp`; ketujuh binding lama dan `PUBLIC_LEADS_ENABLED=false` dipertahankan. Koneksi Meta masih belum aktif tanpa konfigurasi rahasia yang dikendalikan pemilik.
- Publikasi Worker langsung v3.5.1, cache statis v15. Perubahan UI/panduan tidak berarti pesan masuk, balasan atau penjualan telah terotomasi.

## WhatsApp webhook Meta verification hotfix v3.5.2 — 20 Oktober 2026
- Meta HTTP GET challenge validation must **not** depend on WA_APP_SECRET or WA_PHONE_NUMBER_ID; those belong to the signed POST processing gate and may never be skipped there. GET still strictly requires WA_WEBHOOK_ENABLED=true, a WA_VERIFY_TOKEN of at least 24 characters, correct hub.mode, constant-time token comparison and a numeric hub.challenge.
- Deployed directly to isolated tourism Worker with all existing twelve bindings strictly inherited, WA_SEND_ENABLED=false. Public CI smoke probe changed from HTTP 503 to HTTP 403 with deliberately incorrect test token, expected and safe, and all live checks passed: https://github.com/rama160/Marketing-turism/actions/runs/39449347646.
- Remaining manual owner step: enter exact Secret value into Meta callback Verify Token field; don't share secret or delete WhatsApp phone. Publish/production webhook subscriptions and live inbox onboarding are separate concerns.

## Oktober 2026 — owner prioritizes marketing validation before company incorporation
- Owner approves prioritizing organic marketing and validating inbound guest interest before incurring PT/CV company formation costs. This does not waive the need for NIB/appropriate tourism permits before the agent independently conducts regulated commercial transactions. Initially refer interested guests to licensed operators; no unverified booking/payment.
- Existing Cloudflare Cron `0 1 * * 1` generates 7 bilingual drafts weekly for Instagram/Facebook/TikTok. The owner-only `POST /api/admin/marketing/prepare-week` prepares the current week, idempotently. Draft status is always DRAFT and NEVER auto-publish in Worker.
- Metricool brand `7483251` currently has NO social networks connected; owner needs to authorize FB/IG before any real scheduled publication. Don't imply automatic posting is working, even if campaign drafts exist.
- Maintain `PUBLIC_LEADS_ENABLED=false`, `WA_SEND_ENABLED=false` and all operator/payment safety gates. WABA restrictions are independent of Facebook Page linking. No auto-DM or mass messaging, no ads spend, no scraped leads, no fabricated analytics.
- Current website remains noindex until final business policies/identity ready; do not present organic search discovery as activated yet.
- Prefer adding future automation to canonical `src/sales.mjs`/Worker, not duplicate modules. Preserve existing Cron value due preflight isolation guard.

## Fallback pemasaran otomatis tanpa sosial/Cloudflare
- Workflow GitHub `.github/workflows/organic-marketing.yml` menjadwalkan ekspor 7 draf kampanye setiap Senin 09 WITA dan menyediakan artefak `nusa-penida-organic-week`. Ekspor harus memakai `src/sales.mjs` satu-satunya sumber draf; jangan duplikasi modul ini.
- Run sukses: https://github.com/rama160/Marketing-turism/actions/runs/39522690636. Pembuatan konten mingguan di GitHub terbukti aktif, namun **bukan autoposting** dan **bukan pemasangan Cloudflare Worker v3.6.0**. Hambatan konektor Cloudflare telah selesai pada 2026-10-21; versi 3.8.0 sekarang live dan live smoke sudah lulus. GitHub auto-deploy terpisah masih digate oleh GitHub Actions secrets.
- Pemilik harus menghubungkan akun sosialnya ke Metricool brand 7483251 untuk memposting terjadwal; promosi tidak memerlukan pengaktifan pembayaran maupun pengumpulan data guest yang belum siap secara legal.

## v3.7.0 — AI marketing independent learning (user-approved 2026-10-21)
- User wants tourism marketing planning, AI campaign drafting, analytics, optimization and continuous **strategy learning** independent of manually prompting ChatGPT. This is **not** authorisation to autonomously modify code, buy ads, spam customers, collect payment, or change admin approvals. Require reproducible algorithm, test, rollback and owner kill switch when implementing external posting.
- New dedicated pure module `src/marketing-intelligence.mjs` implements evidence scoring, 90-day window, conservative 500-impressions smoothing, weakly explored segment ranking and hourly recommendations only if minimum evidence exists. Caption generator stays canonical `src/sales.mjs`.
- New additive migration `database/migrations/0011_marketing_learning.sql`: marketing_observations (aggregated verified numeric only, no guest identities), marketing_decisions (auditable weekly strategy ranking). Always use migration 0011 in tourism DB only.
- Admin GET /api/admin/marketing/intelligence; POST /api/admin/marketing/observations with owner attestation; POST /api/admin/marketing/prepare-week. Worker Monday Cron compares real observations and logs decisions. Does NOT automatically publish Meta or Metricool without the external connector.
- GitHub Actions already generates organic weekly file without ChatGPT. Metricool connected social brands confirmed Facebook+Instagram; one public post Kelingking approved for automatic publication at Oct 23 10:00 WITA (PENDING as of creation). No duplicate or unsupervised posts beyond approved routine.
- Critical capability distinction: Metricool MCP can operate within ChatGPT Free, Metricool **HTTP API Advanced/Custom only**. Independent Meta Graph API integration with token, app review and publishing permissions must be implemented/configured before Worker can autonomously post and pull metrics; not currently active. Do not assume WHATSAPP Meta app secret confers Page publishing permission.
- Maintain all previously approved safety gates. Cloudflare tool temporarily unavailable, v3.7.0 GitHub CI != live Worker. Don't claim live until D1 0011 verified, Worker uploaded and smoke successful. Follow docs/AUTONOMOUS_MARKETING.md.

## v3.8.0 independent marketing development rules
- Canonical planning: `src/sales.mjs` and `src/marketing-intelligence.mjs`. The GitHub planner `scripts/organic-week.mjs` reads `data/marketing/observations.json` and `src/marketing-media.mjs` which reads the one canonical `public/photos/manifest.json`. It exports 3 priority ideas + 7 alternatives as Markdown/JSON; never edits code or publishes via GitHub.
- New additive isolated D1 migration `0012_meta_autopilot.sql`, scheduled status `READY/ATTEMPTED/POSTED/REVIEW_REQUIRED`, and protected `GET /api/admin/marketing/publications`. Migrate ONLY dedicated tourism D1. Never touch FinChat or Spenva.
- Daily Cron `0 2 * * *` (10 WITA) may publish at most one of the three scheduled days/week ONLY with `META_GRAPH_PUBLISH_ENABLED=true`, `META_GRAPH_OWNER_APPROVED=true`, valid start date and official separate Graph Page/IG credentials. Zero retries for partial API success. The weekly draft Cron remains `0 1 * * 1`.
- **NO** production Graph credentials or additional paid Metricool API access exist as of 21 October 2026. All direct publishing is disabled. Existing Metricool posts on Oct 23, 26, 28, 30 must not be duplicated; Graph start no earlier than Nov 2 and after owner's authorization.
- No Meta Insights automatic import implemented. Official Meta v26 deprecates legacy impressions: never silently rename views/impressions or claim the learner has real automatic performance data unless it does.
- GitHub deploy job skips unless `ENABLE_CLOUDFLARE_DEPLOY` set and valid isolated Cloudflare Actions secrets present. Cloudflare connector recovered, v3.8.0 uploaded/deployed to dedicated Worker version 43, and migrations 0011/0012 + live smoke confirmed successful. Full details in `docs/AUTONOMOUS_MARKETING.md`.
