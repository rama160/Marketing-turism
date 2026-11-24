## SEO launch and verification: v3.31.0, 24 November 2026
Canonical published guest routes are '/', '/snorkeling.html', '/island-tour.html', '/west-tour.html', '/east-tour.html' and '/id/experiences/:slug' / '/en/experiences/:slug'. The original routes pass through the existing Worker to add search metadata and links from currently published D1 records. Owner site-content fields update corresponding server-rendered tour page h1/meta descriptions without editing source files. If an activity is archived, its homepage link is omitted on the next render and the activity itself is unavailable.
Verify GET /sitemap.xml contains live public activities, bilingual alternates and published dates. Verify no dashboard/private API URLs are in the sitemap. Verify /robots.txt, on-page canonical, OG image and breadcrumb JSON-LD. Run npm run ci, then deploy and live smoke. Before domain migration, confirm redirect and canonical rules; do not index an unverified second hostname. After Search Console ownership verification submit /sitemap.xml, inspect key URLs and monitor clicks, queries, indexing and Core Web Vitals. No automated submission without verified Google permission.
No fictitious reviews, prices, awards or first-page guarantees. Contact details and cancellations remain subject to current operational policy.

---


## Mainline maintenance & source alignment (v3.30.0, 24 November 2026)
**Use only `main`; do not create a branch or PR for maintenance unless the owner authorizes it.** The current deployed dashboard is NPE Studio and website CMS, no other Worker. GitHub CI tests the latest source and a separate live smoke validates deployed Worker health version.
- `npm run ci` must pass before deployment; `node scripts/smoke.mjs` must pass after. The smoke version must equal package version and Worker `/api/health`; dashboard scripts and CSS use matching cache-busted versions.
- Worker `/robots.txt` and `/sitemap.xml` are authoritative dynamic responses. Never add second static public/robots.txt or public/sitemap.xml, and never precache them in guest service worker; sitemap enumerates published bilingual activity pages and legacy public pages.
- Preserve existing local licensed photo fallback images and `public/photos/manifest.json`, all D1 migration history, PHOTO_KV, owner gallery media, routes and uploaded content; these files are not unused garbage.
- Production Worker isolation remains protected by `scripts/preflight.mjs`. Never modify Spenva Worker, Meta permissions, operator rates, owner login, booking/quotes/payment or guest lead guards as an effect of repository cleanup.
- If smoke fails, inspect error first and make the smallest source fix; a green deploy workflow alone does not establish live functional success.

---

## Galeri NPE — view, reuse and delete photos (v3.22.0)
1. Sign in to NPE Studio > Konten & Kampanye > Editor Website. Select the visible Galeri NPE shortcut or tab. A searchable gallery shows all owner-uploaded photos, including unassigned ones.
2. Tap Ganti Foto on an existing published page or destination spot. The same dialog shows stored Galeri NPE photos and a Dari Galeri HP option. Selecting an existing photo reuses its image ID without re-upload; picking a phone image uses existing compression, preview and rights confirmation.
3. Identical files are automatically reused by hash rather than triggering Foto sudah ada.
4. Hapus is disabled for photos currently used in any public page/gallery slot or saved activity draft/publication. Replace all references first, then confirm permanent deletion. An API-level guard enforces the same rule.
5. Photos published from legacy website source files, third-party credits, campaign libraries and historical booking artifacts are outside this media deletion facility.
6. No database migration is required. CI and public smoke must pass before deploying the dedicated NPE Worker.

---

## Fast photo replacement from gallery (v3.21.0)
From NPE Studio > Konten & Kampanye > Editor Website > Published, tap **Ganti Foto** on a page card to open your phone gallery immediately. You can also open a page and tap **Ganti foto** beside a specific spot (Manta Point, Kelingking, etc.); its location is selected automatically. Pick an image, inspect the preview, optionally edit the photo title and Indonesia/English description, confirm commercial rights, then tap **Simpan & Terbitkan Foto**. No need to open Foto & Media or choose the slot again.
If you cancel the gallery picker or preview, nothing changes publicly. If upload or publication fails, the dialog shows the error and permits retry. Do not refresh the page while other title/description edits are unsaved; changing a photo alone does not erase those in-progress edits. The separate Foto & Media library remains available for managing reusable images and Add Activity covers. Only the chosen photo changes; existing booking, prices and marketing remain unchanged.

---

## Using the populated Published website editor (v3.20.0)
Open NPE Studio > Konten & Kampanye > Editor Website > Published. Five original public pages must appear with current title, description, price label and image. They remain visible when site_content has zero owner edits.
Select Edit isi lengkap on a page. Current live-source Indonesian/English text is populated automatically, including destination gallery details. Search by section label or edit several columns directly; select Simpan & Terbitkan Perubahan. Only changed content is persisted; untouched text remains unchanged. Select the other language to edit separately.
Under Foto yang sedang tayang choose Ganti foto for one specific slot. Upload a commercially permitted image using Foto & Media; confirm slot before publication. Other pictures and rights credits remain intact.
Dynamic activities are separate: only previously published dynamic activities appear as activity cards. Historic original public pages are edited in the legacy CMS instead of being duplicated as blank activity rows.
The deployment build creates public/site-editor-defaults.json from canonical HTML and language.js. Run CI, validate nonempty snapshot and 18 photo slots, apply additive migration 0024 before updating dedicated NPE Worker, then run live smoke including protected admin access and guest booking functionality.

---

## NPE Published Website Editor v3.19.0
1. NPE Studio > Konten & Kampanye > Editor Website opens Published with published activities and five pre-existing pages.
2. Published activity > Edit semua elemen opens bilingual titles, details, cover, numeric public price, unit and SEO. Save Draft preserves the previous public version until Publish.
3. Add Activity saves a draft even if the price is empty. Pricing stays hidden on public sites when no amount is set; ask via WhatsApp.
4. If entering a public price, enter rupiah numeric and unit then attest verification before Publish; never confuse selling price with operator net.
5. Halaman Website edits legacy page copy and optional static labels. Foto & Media uploads rights-confirmed photos and replaces homepage/tour photo slots.
6. Save & Publish shows a confirmation; missing provider confirmation/photo or unverified price prevents publication, but drafts remain stored.
7. Keep deployed NPE Worker isolated and all existing operator rates, quotes, bookings, sessions, Meta schedules and D1 tables untouched. Run CI and external live smoke.

---

## Website CMS & Add Activity — v3.18.0 (deployment gated)
1. Open dashboard > Konten & Kampanye > Editor Website > Aktivitas & Foto.
2. Upload a rights-confirmed JPEG; the existing browser compression can reduce image size to the Cloudflare 850 KB limit.
3. Click Add Activity; enter unique slug, title/summary/full description in English and Indonesian, choose category and photo. Save Draft.
4. Confirm partner/service scope is genuine; include a public price only after independently confirming sale price and checking the price-verification box. Click Publish after checking the preview and details. Unpublished drafts remain invisible to guests.
5. Existing activity edits save as draft until a new Publish. For removal, Archive. Old public pages remain unchanged during editing. Slugs cannot be edited to avoid breaking SEO.
6. For existing static photos select slot (hero, snorkeling, island, west or east) and uploaded photo, then Publish Photo. Existing text CMS is unchanged.
7. Guests see a new card on the home page and server-rendered pages at `/en/experiences/{slug}` and `/id/experiences/{slug}`; enquiry is via WhatsApp, **not** the original Penida quote workflow.
8. First deployment only: review and execute migration `0023_website_cms.sql` in the dedicated Marketing Tourism D1; validate CI, assets, Worker bindings and live smoke. Do not replay historical migrations. Do not deploy unrelated Workers.

---

## Facebook Group save verification — 27 Oct 2026
In dashboard `Akuisisi Pelanggan → Akuisisi Pelanggan → Facebook Groups`, enter group name (min 5 characters), destination, and Facebook link (accepts /groups/ or /share/g/ links). Rules can be blank initially and display "Belum diperiksa"; do not promote before checking them yourself. Press Simpan grup and confirm the status displays `Grup berhasil tersimpan: <name>. Total N grup tersimpan.` The backend independently reads the stored row from D1, then GETs current saved groups. Use `Muat grup tersimpan` to inspect saved entries even when other growth sources are unavailable. This is a manual bookmark list; does not join Facebook, read private group data, publish or message users.
If link is rejected, copy the actual Facebook group share link rather than an individual profile or Page. If the browser displays `Belum tersimpan: ...`, preserve form values and inspect error instead of assuming saved. Old failed attempts with zero D1 rows require manual re-entry by the owner; do not synthesize or guess them.

## NPE Studio compact dashboard — October 27 2026
At `/dashboard.html`, restore existing persistent session automatically (once-per-device token login unchanged). Desktop: sidebar selects workspaces Home/Tamu/Konten/Peluang/Analitik/Pengaturan; the small bar at the top of the active work area selects specific modules. Android: same groups are available in the bottom navigation; local submenu selects module. Campaigns, Growth and WhatsApp have additional selectable inner panes to avoid long scrolling; all original actions remain under their specific pane. Home shows only real saved counts and actionable priorities, never demo reach.
Only one **Lihat Website** shortcut is visible in dashboard topbar; it opens `/?view=website` in a new tab so an installed PWA still can view the public tourist landing page.
Do not add new dashboard links to the public tourism website or copy Ceritexa-specific branding/content. The new `Analitik` tab reads `/api/admin/analytics` only; undefined Meta engagement metrics are not fabricated. When reviewing a form, use the pane tabs first to locate the corresponding section before submitting.

## Persistent owner dashboard authentication — October 27, 2026
1. On the secure NPE dashboard `/dashboard.html`, paste ADMIN_TOKEN into the login field **once** on each trusted browser/device and press Hubungkan dashboard.
2. The backend verifies the token and creates a server-side session identified by a random opaque HttpOnly secure cookie. Only its SHA256 digest is stored in tourism D1, not the token or private guest data in browser storage.
3. Normal refresh, closing Android PWA, switching tabs or reopening the browser keeps the owner logged in. At startup, GET `/api/admin/session` transparently renews a 365-day rolling browser session. A one-time migration discards the old insecure sessionStorage token.
4. Press **Keluar** to explicitly revoke the current cookie in D1 and clear browser cookie; a stale cookie then produces 401. Never assume logout succeeded if the device is offline.
5. Under safety exceptions, the owner will need to reauthenticate: clearing site cookies, revocation by ADMIN_TOKEN rotation, a browser change/new device, or after >365 days with no successful session renewal.
6. The existing Worker maintains a guarded Bearer-token access path for non-browser authorized integrations; all frontend operations now rely exclusively on same-origin cookie sessions and origin-checked mutations. Never log a session cookie or publish ADMIN_TOKEN.

## Public Website vs Dashboard — 27 Oct 2026
- Website for guests: `https://marketing-turism-agent.finchat-ai-gateway.workers.dev/`. This contains tourism offers, photos, bilingual CMS and consented guest enquiry; NO link or admin login is visible to visitors.
- Agent owner dashboard: `https://marketing-turism-agent.finchat-ai-gateway.workers.dev/dashboard.html`. Bookmark this on Android and desktop; app installation uses this as the default home. Use Lihat Website to open public site without losing current dashboard session.
- If owner token was already set in sessionStorage, dashboard restores the session upon refresh. Otherwise show login immediately. Only authenticated API routes return customer, supplier or business data. On Logout, clear existing session.
- On mobile use Menu navigasi to switch functional modules without scrolling a monolithic combined tourism landing page.
- Static guest SW caches public assets only. Neither admin JS nor private dashboard HTML nor guest/booking/API data is cached for offline use; private dashboard needs internet to work.
- Public smoke asserts `/dashboard.html` exists with admin modules while `/` contains none. Confirm genuine browser Turnstile submission separately with owner-authorized test data, without inventing leads or bookings.

## 27 October 2026 — Nusa Lembongan and assisted Facebook Groups
Operator workflow: dashboard → Akuisisi Pelanggan → research link Nusa Penida/Nusa Lembongan groups → owner manually checks public group rules and joins where permitted → owner writes a minimal anonymous question summary and original post time (max 48h) with public permalink → agent scores and drafts transparent reply → owner manually responds, then marks contacted/responses. Never import private group posts, accounts, contact lists or members. Meta Groups API is not available for external Group publishing/reading; approved own Page and Instagram connections remain distinct.
Lembongan is a destination **for prospect research** and should not be represented as an already confirmed tour product. Verify operator, rates, boat transfers, licenses and safety and agree pricing before taking a Lembongan booking or deposit. Preserve pricing controls for Nusa Penida; do not apply existing Penida tariffs to Lembongan.

## 27 October 2026 — Public guest enquiry mode
The owner expressly requested enabling guest enquiry capture. On successful isolated deployment, `PUBLIC_LEADS_ENABLED=true` in `wrangler.jsonc`; production `/api/public/readiness` should show `accepting_leads=true`. This state requires Turnstile secret, valid host/action challenge, real guest consent, business contact and policy flags.
**Enquiry does not equal verified booking.** Current supplier operator is DRAFT and all 12 tariffs remain unverified in production D1. Owner must independently verify availability, safety, licenses/permissions, operator pricing and guest terms before final quotations, payment collection, or booking PAID transitions. Use the owner-protected dashboard to review genuine consented enquiries.
Release smoke sends an **empty denied** anti-bot request, asserts HTTP 403 and checks Page widget; no artificial customer entries are generated. One genuine, owner-authorised end-to-end Turnstile test is still required before claiming that successful live submissions have been tested from a real browser.

# Marketing Turism Agent v2.0.0 — Operations
## Completed code
Static PWA + owner-protected Cloudflare Worker API + D1 schema, operator/rate CRUD, immutable rate history, lead capture (disabled by default), admin quote pricing with Rp100k gross markup per booking, bookings, manual payment verification, operator handover, copywriting drafts and CI test/build.
## Required before live business
1. Set Worker secret ADMIN_TOKEN (random 24+ characters). Never place secret in GitHub.
2. Verify operator identity, agreement, actual 6 vs 7 car-seat capacity, snorkeling facilities, guest policies, safety and availability.
3. Set operator to VERIFIED and enter new VERIFIED rates. Existing rates are intentionally DRAFT.
4. Check NIB, refund rules, privacy disclosure, payment ownership, local rules. Enable PUBLIC_LEADS_ENABLED=true only after readiness and protection from spam.
5. Verify guest money in actual bank or trusted payment provider before clicking PAID. A screenshot is insufficient.
6. Owner approves final quote, operator confirms availability, then issue booking. Handover only when paid and operator acknowledges guest list.
## Limits
No payment gateway, WhatsApp automated outbound, live marketplace scraping, automated AI posting, confirmed operating permits, or proven external sales. Workers AI optional and drafts only. All pricing is deterministic and never AI-driven below safe floor. A combined snorkeling+island tour same-day package is not offered. Boat return net must be independently verified.
## Dev and deployment
Run npm run ci. D1 migrations: npx wrangler d1 migrations apply marketing-turism-db --remote.
In Cloudflare configure D1 binding DB, Workers AI binding AI, ADMIN_TOKEN secret and PUBLIC_LEADS_ENABLED public variable. Worker assets at public/. Build artifact dist/ on GitHub Actions.

## 2.1.0 Operations
- Before handover, populate and confirm booking guest manifest, confirm payment in banking/provider independently and verify operator acknowledgement.
- Operator payable allocation is based on the initial quote price snapshot; never recompute from today's net rates. Mark an operator as PAID only after the actual transfer has been confirmed with reference.
- Reschedule requires operator's confirmation of the replacement date. The quote snapshot stays immutable; booking_schedule records the service date override.
- Unpaid booking can be cancelled. Paid booking requires full-refund workflow; request, owner approves, bank/provider funds refunded, then EXECUTED with external reference. No partial refunds in this pilot.
- When a refund is approved, unpaid operator liabilities are put ON_HOLD. Previously paid operators require separate human reconciliation and could result in financial exposure.
- Cloudflare Resources: only marketing-turism-agent and marketing-turism-db. Avoid any CLI command that changes the account worker subdomain, zone, or existing FinChat/Spenva deployments.

## v2.2.0 AI Sales and marketing
- AI and template sales replies are OWNER REVIEW drafts only, and must not include personal contact values in AI prompts.
- Marketplace prices entered through dashboard are manually verified snapshots, not scraped. They must not override the minimum price policy or be compared across unlike group sizes/inclusions.
- Campaigns are not posted by this system. Publishing status requires real URL of an owner-published post. Lead attribution can tag already published campaigns when guest consents and form is enabled.

## v2.4.0 autonomous-but-safe workflow
A weekly Cloudflare cron on marketing-turism-agent generates two Website campaign DRAFT records using fixed, price-free templates. Owner reviews/publishes manually and adds real publication URL. Scheduled runs use unique run ID to prevent duplicates. Cron timezone is UTC: `0 1 * * 1` = Monday 09:00 Bali time.

## Deployment isolation (permanent)
Run `npm run ci` before any deploy. This performs `scripts/preflight.mjs` target checks for the dedicated Marketing Turism Worker and D1. Never set Wrangler `name` to `finchat-ai-gateway` or `spenva-play-billing`, and never change account-wide Workers subdomain or shared DNS routes.

## 2.5.0 Guest reception readiness
1. Worker and D1 remain dedicated to Marketing Turism. Create Turnstile Managed widget on `marketing-turism-agent.finchat-ai-gateway.workers.dev`, public sitekey `0x4AAAAAAFYd9j0rAcoO31Rh` embedded on guest page.
2. Place the matching SECRET through Cloudflare dashboard **Workers & Pages > marketing-turism-agent > Settings > Variables and Secrets > Add secret** as `TURNSTILE_SECRET`. Secret has not been embedded in this repository. Verify secret exists in Cloudflare before continuing. Never send the secret in chat or commit it.
3. Replace pilot privacy/terms pages with genuine legal business details, retention policy, refund/cancellation timelines, customer rights and contact.
4. On owner dashboard, enter official business name and contact. Approve checkboxes ONLY after real policy review.
5. Verify operator contracts, correct tariff and capacity before creating any sale. After all protections are in place, set Worker variable `PUBLIC_LEADS_ENABLED=true` on the dedicated tourism Worker. Default stays FALSE. Test consent, Turnstile, booking, payment and refunds with permitted test data before receiving real funds.
6. Turnstile siteverify checks hostname and lead_enquiry action; fail closed if verifier is unavailable or invalid.
7. Do not change other workers or account-wide DNS. Do not claim this pilot privacy text meets legal requirements for a full commercial launch.

## 2.7.0 Penivara Experiences setup
- The trade name Penivara Experiences is a provisional branding suggestion; search DJKI and platform handles before launch and obtain owner confirmation.
- Do not modify the dedicated worker/database names or shared Cloudflare Workers subdomain.
- Operator details may wait until a guest enquiry; do not quote or collect guest money until verified price, capacity, time and availability are confirmed.
- Owner says 6–7 passengers car: actual max seats is verified per operator and vehicle, cannot assume 7 without evidence.
- Boat net Rp150,000/guest/leg both ways, still unverified supplier DRAFT. Lunch net Rp150,000/guest; island car net Rp600,000/car; snorkeling net Rp350,000/guest; markup ≥Rp100,000 per booking after costs checks.
- Manual bank transfer only. QRIS has not been created. Do not request or record banking password/OTP or make up payee details.
- Draft guest cancellation schedule 25% H-7+, 50% H-6..H-3, 75% H-2..H-1, 100% same day/no-show; read /cancellation.html. Review UU No.8 Tahun 1999 Art.18, supplier contracts and clearly obtain consent prior to accepting payment. Supplier cancellation and hazardous/weather cancellation are not guest voluntary forfeiture. Owner approves and verifies any manual bank refund, avoiding unilateral withholding and improper claims of guaranteed profit.
- Create individual organic content drafts across Instagram, Facebook, TikTok, YouTube Shorts, WhatsApp Business, Google Business Profile, Telegram. Manually publish and enter actual URL. To enable API automation, establish permissions/connectors separately. Partner marketplace listings require separate account approval.

## Sharing and Private operational instructions (v2.9.0)
1. For each operator and activity create distinct SHARING and PRIVATE rate rows; never reuse an old LEGACY price as proof of the new service.
2. SHARING requires actual operator agreement for net per passenger regardless of spare seats. If partner demands paying for the whole car/boat when underfilled, do not tick "sharing guaranteed" and do not issue a binding quote. If a common departure is manually arranged, get written confirmed participant roster, seat availability and financial exposure prior to approving.
3. PRIVATE island tour can carry a single paying passenger but full exclusive vehicle net remains due. Private snorkeling can carry one passenger when boat/charter fixed fee and per-person charges are confirmed and included.
4. Never sell beyond operator verified capacity. Sharing does NOT guarantee a departure or physical seat until operator acknowledges it.
5. For all modes, quote floor includes verified supplier charges, agency costs, payment fees and >=Rp100,000 profit contribution per booking. Extra lunch and both boat legs priced per guest separately.
6. Existing snapshot quotes and paid bookings are never re-priced. Operators still may be onboarded later when there are consenting leads; do not issue binding payment instructions in advance.

### v3 business launch and full car Sharing
Official self-reported name Nusa Penida Experiences. Keep false `PUBLIC_LEADS_ENABLED` and no payment until official WhatsApp/email, operator agreements and verified privacy/refund terms. Operator net rates provided by owner remain drafts in D1. New Sharing West/East: even 1 guest must cover the entire vehicle if there is no confirmed group pooling. For guests n, minimum base booking total is `Rp600k + Rp100k margin + actual agency costs and payment fees`; extra lunch and boats added per guest. Private snorkeling packages are Manta Bay Rp1.5m and Manta Point Rp2.8m all-in per booking before markup/add-ons, subject to operator-confirmed group capacity and 3 actual spots. Never describe wildlife sightings as guaranteed. Photo source/attribution is Wikimedia Commons, each caption links to source licensing. No use of FinChat/Spenva workers.

## Official site / imagery — October 18, 2026
Nusa Penida Experiences is the owner-provided official brand. It is not evidence of registered trademark or licensed tour-operator status. Photo locations and credits on the West, East and snorkeling pages link to Wikimedia Commons; user should verify rights when replacing images. Sharing tour prices always include the full Rp600,000 vehicle operator obligation unless a separate documented, fully guaranteed per-seat operator agreement exists. Per-person values on the website are illustrative only, not confirmed sellable inventory. Public lead gate remains OFF while real customer contact and approved legal policies are missing.

## Photo CDN troubleshooting / release 3.0.3
Photographs are publicly licensed JPEGs checked into this repo at `public/photos/*.jpg`. Each source, photographer, license and SHA-256 is in `public/photos/manifest.json`. Verify local asset integrity through `npm test`. The dedicated Tourism Worker uses `/photos/{slug}` and `src/photos.mjs` to fetch optimized image from the public repo, checks image/jpeg and JPEG signature, caches successful responses. If Worker retrieval fails, `public/photo-loader.js` retrieves GitHub Raw image directly (allowed by image CSP). The placeholder SVG only appears if both methods fail. Live GitHub Actions smoke checks ten distinct JPEG paths. When publishing edits, bust PWA public cache version and preserve photo-loader, fallback SVG, and strict domain allowlist. Never modify other Workers.
