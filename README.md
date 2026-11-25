## Roadmap SEO aktif (26 November 2026)

Untuk setiap pekerjaan optimasi pencarian, ikuti [roadmap.md](./roadmap.md). Dokumen ini mengatur target Top 10 non-brand dan konversi, prioritas, bukti, aturan anti-penambahan fitur tanpa manfaat, serta pembaruan status setiap sesi. Mulai dari baseline Search Console dan indexasi; tidak ada klaim peringkat tanpa data.

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
- Campaign creation is manual only. Removed the weekly Cloudflare cron and GitHub organic calendar workflow/script, daily recovery and automatic draft replacement after rejection. Legacy prepare-week API returns HTTP 410; rejection records reasons without generating new content. Removed legacy independent idea publication path and kept old records as history. Hourly approved Meta insights collect real metrics only; no automatic successor draft or automatic photo generation. Explicit owner-requested caption helper, manual draft saving, manual licensed-photo search, approved immutable publication queue and analytics remain.
- Do not reintroduce any automatic campaign generator; preserve booking, D1 data, guest intake, owner sessions, website CMS and existing approved queues. Update all version references and smoke checks together. Domain migration/redirect work is separate.

## NPE v3.33.0 — legacy SEO, attribution and crawl audit (24 Nov 2026)
- Five original Indonesian pages use Worker-first exact routes and build-generated non-HTML templates via ASSETS; this replaces the historical v3.31 redirect experiment. Do not fetch public HTML URLs from within the Worker. The build generates templates from the same five public HTML files; no duplicated checked-in content. Internal template URLs return 404. Existing .html canonicals remain stable; clean aliases redirect once to those canonicals, preserving query parameters.
- Render owner-published D1 text and metadata on the server, with escaping, original Indonesian fallback for the existing language picker, related published links, and no changes to bookings, operator rates, gallery, legal approvals or marketing gates. D1 failure uses original source text.
- Optional public GOOGLE_SITE_VERIFICATION variable supports homepage meta verification; no invented token or claim of Search Console ownership.
- Existing aggregate WhatsApp click collector is shared by original and all dynamic SEO pages, with no duplicate listener or additional personal data. Clicks are not confirmed bookings.
- Live smoke checks every sitemap URL for direct HTTP 200 and matching canonical/hreflang, and checks generated source is not public. CI and live deployment must be verified separately.
- External outstanding: GSC ownership/indexation, real Core Web Vitals, GA4/conversion reconciliation, domain decision, genuine reviews, photo rights, and final legal policy. No first-page guarantee.

> **NPE v3.32.0 — 24 November 2026 (main only).** Five original Indonesian tour pages retain their existing design, now with 18 bilingual FAQ entries, canonical/OG alignment, image dimensions, clear operator coordination and contextual WhatsApp enquiry links. Five separately indexable **English-language** pages are served directly by the existing Worker at `/en/tours`, `/en/tours/west`, `/en/tours/east`, `/en/tours/snorkeling` and `/en/tours/island`. Each pairs via canonical/hreflang with its Indonesian original. Dynamic bilingual `/en|id/experiences/*` routes remain unchanged. The dynamic sitemap includes both language variants. Production title updates to Fast Boat and Nusa Lembongan were made in D1 with all other published data retained. SEO rankings, GSC indexing, GA4 and a custom domain are not automatically connected.

> **Verified SEO architecture, v3.31.0 (24 Nov 2026):** Cloudflare serves the original five public HTML documents directly to avoid asset redirect loops. Each static source now has unique search titles/descriptions, factual Organization/WebPage/BreadcrumbList structured data, Open Graph imagery, and high-intent internal links to live NPE tour/boat pages. Published dynamic activity routes retain server-rendered localized SEO, hreflang, image previews, related destinations and bilingual sitemap entries. The previous plan to route all public HTML through Worker-first was rolled back after live smoke detected redirect loops. Google search ranking and indexing are not guaranteed. No user data or bookings modified.

# Nusa Penida Experiences (NPE) — Tourism Website & AI Marketing Agent

**Status (24 November 2026): v3.30.0 source of truth = `main`.** The production tourism Cloudflare Worker is `marketing-turism-agent`, served at `https://marketing-turism-agent.finchat-ai-gateway.workers.dev/`. Owner dashboard: `/dashboard.html`. No feature branches are required for this synchronized mainline release.

## Current application (2026-11-24)
- **Public website:** Nusa Penida tours (west/east), snorkeling, published Nusa Lembongan and fast boat activities, bilingual site text, editable destination galleries, published media slots, CTA and optional guest leads protected by Turnstile.
- **Owner NPE Studio:** owner session login persists until logout, Website Editor (published-first), editable bilingual copy, draft/publish activity pages with categories and child destinations, Galeri NPE upload/reuse/remove unused photos, booking and quote workflows, rates and operators, lead/financial dashboards.
- **Marketing:** review/approval of drafts, scheduled campaigns, Meta/IG integrations under existing permission gates, group prospect research and analytics. Automated outbound publication and WhatsApp sends must obey configured approvals and integration status, not be assumed active.
- **Backend:** isolated Cloudflare Workers `src/worker.mjs`, D1 `marketing-turism-db`, KV `PHOTO_KV`, static public assets `public/`, 24 additive D1 migrations. NEVER replay old non-idempotent schema migrations against production; deployment workflow limits schema application to the additive CMS migrations already designed for repeated execution.
- **SEO:** public legacy pages carry static title, descriptions and canonical links; published new activity pages have localized SSR title/description, canonical, alternates, Open Graph and WebPage JSON-LD. Worker supplies **the only canonical** dynamic `/robots.txt` and `/sitemap.xml` from published activities. No promise of Google indexing, ranking or official business registration.
- **Photos:** keep all 10 licensed local JPGs, their attribution `public/photos/manifest.json`, fallback loader and renewal workflow; they are active backups even when NPE owner media overrides a photo. Keep archived migration files and script references.

## Commands and release verification
- `npm run ci` — syntax, isolated Worker target preflight, tests, build `dist/`.
- `npm run build` — produces `public/site-editor-defaults.json` (generated and ignored) and `dist/` from canonical public HTML and bilingual translation text.
- `node scripts/smoke.mjs` — read-only end-to-end checks against the live tourism URL; verify current `package.json` version matches the Worker health.
- GitHub Actions: `.github/workflows/ci.yml`, `deploy-cloudflare.yml`, `live-smoke.yml`. Deploy is gated by GitHub variable `ENABLE_CLOUDFLARE_DEPLOY`; Cloudflare secrets stay in GitHub/Cloudflare, NEVER in repo.
- Production health: `/api/health`; sitemap: `/sitemap.xml`; crawlers: `/robots.txt`.
- D1 historical data, supplier net prices, booking/quote snapshots, operator records, user photos, login sessions and existing campaign approvals are not reset by code cleanup.

## Canonical files and maintenance discipline
- `src/worker.mjs` — Worker routes/auth; `src/website-cms.mjs` — website activities, media and SSR; `src/site-content.mjs` — editable site copy; `src/photo-library.mjs` — marketing owner photo library; `src/photos.mjs` — original creditable tourism photo gateway.
- `public/index.html`, `snorkeling.html`, `island-tour.html`, `west-tour.html`, `east-tour.html` — legacy public pages. `public/language.js` is their bilingual translation source; `public/website-content.js` adds CMS media/activities. `scripts/build.mjs` derives the editing snapshot from these pages (do not store duplicate content files).
- `public/dashboard.html`, `public/app.js`, `public/dashboard.css` — owner dashboard.
- `public/service-worker.js` — offline guest shell only; NEVER cache admin HTML/scripts, authenticated APIs, payments, lead records, sitemap or robots (dynamic Worker responses).
- `AI_START_HERE.md`, `CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/PRD.md`, `docs/OPERATIONS.md`, `docs/TEST_PLAN.md` — canonical instructions/history. Preserve historical release notes as history; this README describes current source.
- Do not create duplicate functions/docs, do not add a second sales, pricing, publishing or photograph service, do not add a new branch unless explicitly reauthorized. Change only what tests prove safe. The automation may publish marketing only under existing explicit owner approval.

## Important boundaries
NPE tourism Worker must never modify Spenva/FinChat or other Workers. Do not change binding IDs, D1 targets, operational flags, outbound permissions, auth cookies, guest contact rules, price margins or payment verification in cosmetic cleanup. Domain mapping, Google Search Console verification, Core Web Vitals and search rankings require external measurements; code checks alone cannot certify those integrations.

For setup details see [Operations](docs/OPERATIONS.md), [Architecture](docs/ARCHITECTURE.md), [Product requirements](docs/PRD.md), [Test plan](docs/TEST_PLAN.md), and [AI start here](AI_START_HERE.md).
