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
