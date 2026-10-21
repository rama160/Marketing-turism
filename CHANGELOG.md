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
