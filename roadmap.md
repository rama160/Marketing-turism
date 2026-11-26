# Roadmap SEO — Nusa Penida Experiences (NPE)

**Dokumen pengendali pekerjaan SEO | Versi 1.0.30 | Diperbarui: 26 November 2026 (WITA)**

- Website resmi: https://nusapenidaexperiences.com
- Repo: rama160/Marketing-turism, branch `main`.
- Pemilik keputusan dan persetujuan publikasi: owner NPE.
- Pelaksana: owner dan AI yang mendapat akses serta mandat pada sesi kerja.
- Status: aktif. Fokus saat ini: **SEO-002/013 request indexasi tertahan kuota (konfirmasi owner 26 Nov); verifikasi teknis 32/32 lulus. SEO-018 opsional, ditangani mandiri oleh owner tanpa ketergantungan pada daftar mitra tetap; SEO-019 evaluasi selesai (tidak eligible, N/A; owner hanya menerima booking online). Prioritas berikut SEO-003/020 cek data ketika tersedia dan evaluasi SEO berbasis bukti; SEO-011/012 artikel pertama terbit, review terjemahan berikutnya; SEO-015/016/017 uji nyata pending. Tidak mengulang pekerjaan selesai atau menambah fitur.**.
- Siklus: evaluasi mingguan dan pembaruan dokumen setiap pekerjaan; evaluasi tren setiap 28 hari.
- Anggaran: manfaatkan alat gratis dan infrastruktur yang ada; biaya baru memerlukan persetujuan owner.

## 1. Sasaran dan batasan

Sasaran utama: halaman penjualan/panduan NPE yang relevan mencapai 10 posisi organik teratas Google untuk kueri non-brand berintensi wisata dan pembelian; menghasilkan kunjungan, enquiry berkualitas dan pemesanan. Posisi 1–3 merupakan sasaran lanjutan setelah Top 10 stabil. Tidak ada jaminan ranking maupun tenggat Google; domain baru, persaingan, negara, perangkat dan waktu memengaruhi hasil. Tidak mengejar peringkat melalui manipulasi.

**Bukan sasaran:** banyak fitur, dashboard baru, jumlah artikel besar, skor Lighthouse 100 semata, jumlah backlink tanpa kualitas, atau ranking brand sebagai pengganti ranking non-brand.

### Indikator keberhasilan

| KPI | Baseline 26 Nov 2026 | Sasaran kerja (bukan prakiraan) | Bukti |
|---|---|---|---|
| Halaman prioritas terindeks | 10/10 URL yang diperiksa dilaporkan terindeks pada 25 Nov 2026; 28 URL ditemukan via sitemap (bukan 28 terindeks) | Seluruh URL prioritas yang layak terindeks; alasan pengecualian dicatat | URL Inspection / Page indexing |
| Kueri non-brand dengan posisi rata-rata 1–10 | Belum diketahui | Minimal 3 pasangan kueri–URL prioritas dalam 90 hari evaluasi, lalu 5–10 dalam 180 hari jika realistis | GSC Web, periode 28 hari; minimal 30 impressions per pasangan sebagai ambang evaluasi internal |
| Impressions dan clicks non-brand | Belum diketahui | Tren meningkat terhadap 28 hari sebelumnya; target angka ditetapkan setelah baseline | GSC export |
| CTR per kueri–halaman | Belum diketahui | Membaik pada kelompok yang memiliki impressions memadai dan posisi sebanding | GSC |
| Enquiry organik yang valid | Belum diketahui | Pertumbuhan terhadap baseline; tetapkan target setelah data tersedia | GA4 Organic Search + catatan leads |
| Booking terkonfirmasi dari organik | Belum diketahui | Pertumbuhan jumlah dan nilai booking aktual; jangan samakan klik dengan penjualan | Catatan booking dengan atribusi yang diketahui |
| Core Web Vitals mobile | Data lapangan belum tersedia/terverifikasi | LCP ≤2,5 s; INP ≤200 ms; CLS ≤0,1 pada persentil ke-75 jika tersedia | CrUX/GSC; PSI lab sebagai diagnostik |
| Integritas website | CI, deploy dan live smoke lulus pada commit aplikasi 1ff4eca (26 Nov) | Tidak ada regresi keamanan, SEO, CMS, gambar atau booking | GitHub Actions/live smoke |

Posisi rata-rata GSC bukan bukti bahwa semua pencarian muncul di halaman pertama. Catat negara, perangkat, query dan URL, serta periode yang sama; sampel SERP manual hanya pelengkap, tidak disamakan dengan GSC. Ambang 30 impressions dan target waktu merupakan usulan internal, revisi berdasarkan data; jangan memalsukan metrik. Jika data kosong tandai N/A/belum tersedia, bukan nol. Pisahkan kueri brand dan non-brand.

## 2. Baseline yang diketahui dari repo

Tanggal 26 November 2026, commit aplikasi `23c72839d4d5106794c9b3ac330b72fe5e9345e7`:
- [Web CI lulus](https://github.com/rama160/Marketing-turism/actions/runs/45637258239)
- [Deploy Cloudflare lulus](https://github.com/rama160/Marketing-turism/actions/runs/45637258351)
- [Verify Cloudflare lulus](https://github.com/rama160/Marketing-turism/actions/runs/45637444290)

| Komponen | Status | Catatan |
|---|---|---|
| Domain resmi, HTTPS, redirect lama/www, canonical, sitemap, robots | Implementasi dan smoke tersedia | Audit ulang saat ada regresi |
| Halaman ID/EN, hreflang, metadata, schema, link, FAQ | Implementasi tersedia | Validasi kualitas isi, indexasi dan internal link pada URL live |
| CMS artikel bilingual, foto, URL/SEO otomatis, draft/publish | Implementasi tersedia | Jumlah artikel yang benar-benar terbit dan terindeks belum diukur |
| Editor kartu, detail dan pengurutan | CI/deploy/smoke lulus | Uji Android owner masih diperlukan bila dipakai |
| Panduan kompetitif existing tours | Implementasi tersedia | Verifikasi fakta produk, kesenjangan konten dan data GSC |
| GA4, event whatsapp_click/generate_lead | GA4 aktif menurut riwayat 25 Nov: page_view tercatat, whatsapp_click aktif, generate_lead ditambahkan sebagai key event | Atribusi booking dan tautan GSC belum dikonfirmasi; tidak mengulang verifikasi awal |
| PSI mobile | Catatan owner: satu run 100 pada semua kategori, LCP 1,8 s | Hasil lab historis bervariasi; bukan data lapangan atau bukti ranking |
| Search Console | Verifikasi berhasil menurut catatan percakapan 25 Nov 2026 | Tipe property dan akses baca langsung AI belum dikonfirmasi; ekspor performa masih diperlukan |
| Sitemap dan indexasi awal | Sitemap berhasil dikirim/dibaca; 28 URL ditemukan, 10/10 URL diperiksa dilaporkan terindeks (25 Nov 2026) | Status 18 URL lain dan URL baru belum diketahui; jangan mengulang permintaan indeks 10 halaman tanpa alasan |

| Keyword, backlink, leads, booking organik | Baseline belum diketahui | Dilarang mengarang angka |

Sumber baseline GSC: percakapan proyek tanggal 25 November 2026 (pemilik menyatakan 10 URL diajukan satu per satu; laporan asisten saat itu mencatat seluruh 10 berstatus URL is on Google/Page is indexed, sitemap menemukan 28 URL). Screenshot asli, daftar persis 10 URL, jenis property dan ekspor GSC tidak tersedia dalam sesi koreksi ini. Ini adalah riwayat hasil yang dilaporkan, bukan audit GSC live baru.

Dokumen pendukung tetap `AI_START_HERE.md`, `CHANGELOG.md`, `README.md` dan `docs/TEST_PLAN.md`. Catatan historis bukan instruksi untuk mengulang pekerjaan yang telah lulus.

## 3. Roadmap berurutan

Status: [ ] TODO; [~] IN PROGRESS; [!] BLOCKED (catat pemilik tindakan); [x] DONE (wajib bukti). P0 kritis; P1 dampak utama; P2 optimasi; P3 hanya jika terbukti diperlukan. Jangka waktu dimulai dari ketersediaan data/akses, bukan janji ranking.

### Fase 0 — Pengukuran dan indexasi (hari 1–7)

| ID | Prioritas | Pekerjaan | Kriteria selesai | Status |
|---|---|---|---|---|
| SEO-001 | P0 | Verifikasi kepemilikan GSC website `nusapenidaexperiences.com` | Verifikasi berhasil | [x] Selesai menurut laporan 25 Nov; akses baca langsung/jenis property tidak dipastikan, ekspor untuk SEO-003 |
| SEO-002 | P0 | Audit sitemap dan indexasi 10 URL awal; lanjutkan pemantauan coverage | Sitemap diterima, 10 URL awal terindeks; coverage URL lain dicatat bila data tersedia | [!] Audit awal selesai (10/10); owner melaporkan Quota exceeded 26 Nov. Jumlah request tambahan dan verdict belum dilaporkan. Lanjutkan saat kuota tersedia. |
| SEO-003 | P0 | Ekspor GSC Search results: query, page, country, device, 28 hari terakhir dan periode pembanding jika tersedia; simpan agregat tanpa data pribadi | Tabel baseline; data kurang ditandai; pisahkan brand/non-brand | [!] Screenshot owner 26 Nov 09.17 WITA: periode 28 hari, Web, Processing data / No data. Metrik N/A, bukan nol. Periksa kembali 27–28 Nov jika data sudah tersedia; lanjut SEO-004/005 tanpa menunggu. |
| SEO-004 | P0 | Uji GA4 consent, Realtime, Organic Search, whatsapp_click dan generate_lead; cek enhanced measurement agar tidak duplikat; link GSC jika owner setuju | Bukti event sesuai definisi, tidak membocorkan PII; klik ≠ booking | [x] Verifikasi awal selesai berdasarkan konfirmasi owner dan laporan 25 Nov: page_view tercatat, whatsapp_click aktif, generate_lead ditambahkan sebagai key event. Atribusi booking aktual dipantau pada SEO-020; konfigurasi tambahan hanya jika diperlukan. |
| SEO-005 | P0 | Tetapkan URL prioritas dari sitemap aktual, catat PSI mobile/desktop per template dan CWV jika ada | Baseline dan daftar masalah nyata; tidak mengulang redesign | [x] Audit awal selesai: homepage mobile 97/desktop 100 (25 Nov); lima halaman layanan lain 96–100 (26 Nov, laporan owner); Lembongan 87 → 97 setelah perbaikan (laporan owner). LCP pascaperbaikan, skor desktop tiap layanan dan CWV field belum tersedia; pantau bila ada regresi. |

Jika akses GSC/GA4 belum tersedia, owner dapat memberikan ekspor atau tangkapan layar yang relevan. Lakukan audit publik yang independen sambil menunggu; jangan mengarang hasil. Tidak perlu membuat integrasi API/dashboard sebelum membuktikan ekspor manual tidak memadai. Setelah perbaikan indexasi, ajukan request indexing hanya untuk URL prioritas baru/berubah secara wajar; bukan berkali-kali setiap hari.

### SEO-002 lanjutan — checklist indexasi (26 November 2026)

Owner meminta menuntaskan 18 URL tersisa sebelum fase berikutnya. Query SELECT read-only D1 menemukan sembilan aktivitas terbit; kode renderWebsiteSitemap menghasilkan masing-masing URL EN/ID (18) dan sepuluh URL utama. Riwayat awal 28 URL ditemukan dan 10 terindeks; daftar persis sepuluh URL kini dikonfirmasi dari screenshot checklist owner 26 Nov 2026. Seluruhnya adalah halaman utama ID/EN; 18 URL aktivitas di bawah tidak tumpang tindih. Status indeks aktual 18 URL tersebut masih harus diperiksa di GSC. Kode artikel menambahkan dua indeks bahasa; D1 belum memiliki artikel terbit sehingga total sitemap yang dihitung dari kode dan data adalah 30, bukan hasil fetch XML langsung. Akses langsung sitemap melalui web tool tidak berhasil; [Verify Cloudflare terbaru lulus](https://github.com/rama160/Marketing-turism/actions/runs/45722066142) termasuk HTTP 200/canonical/hreflang seluruh sitemap dan halaman indeks artikel. Tidak ada perubahan aplikasi, database, harga atau publikasi.

**10 URL yang telah dilaporkan selesai oleh owner (screenshot checklist 26 Nov):**

- https://nusapenidaexperiences.com/
- https://nusapenidaexperiences.com/en/tours/snorkeling
- https://nusapenidaexperiences.com/en/tours
- https://nusapenidaexperiences.com/en/tours/west
- https://nusapenidaexperiences.com/en/tours/east
- https://nusapenidaexperiences.com/en/tours/island
- https://nusapenidaexperiences.com/snorkeling.html
- https://nusapenidaexperiences.com/west-tour.html
- https://nusapenidaexperiences.com/east-tour.html
- https://nusapenidaexperiences.com/island-tour.html

**18 URL yang belum masuk checklist selesai:**

| No. | URL canonical | Status GSC / tanggal |
|---|---|---|
| 1 | https://nusapenidaexperiences.com/en/experiences/nusa-lembongan-island-tour | Belum diperiksa pada sesi ini |
| 2 | https://nusapenidaexperiences.com/id/experiences/nusa-lembongan-island-tour | Belum diperiksa pada sesi ini |
| 3 | https://nusapenidaexperiences.com/en/experiences/boat-ticket | Belum diperiksa pada sesi ini |
| 4 | https://nusapenidaexperiences.com/id/experiences/boat-ticket | Belum diperiksa pada sesi ini |
| 5 | https://nusapenidaexperiences.com/en/experiences/snorkeling-mangrove-point | Belum diperiksa pada sesi ini |
| 6 | https://nusapenidaexperiences.com/id/experiences/snorkeling-mangrove-point | Belum diperiksa pada sesi ini |
| 7 | https://nusapenidaexperiences.com/en/experiences/nusa-lembongan-island-tour-dream-beach | Belum diperiksa pada sesi ini |
| 8 | https://nusapenidaexperiences.com/id/experiences/nusa-lembongan-island-tour-dream-beach | Belum diperiksa pada sesi ini |
| 9 | https://nusapenidaexperiences.com/en/experiences/nusa-lembongan-island-tour-devil-s-tear | Belum diperiksa pada sesi ini |
| 10 | https://nusapenidaexperiences.com/id/experiences/nusa-lembongan-island-tour-devil-s-tear | Belum diperiksa pada sesi ini |
| 11 | https://nusapenidaexperiences.com/en/experiences/nusa-lembongan-island-tour-yellow-bridge | Belum diperiksa pada sesi ini |
| 12 | https://nusapenidaexperiences.com/id/experiences/nusa-lembongan-island-tour-yellow-bridge | Belum diperiksa pada sesi ini |
| 13 | https://nusapenidaexperiences.com/en/experiences/nusa-lembongan-island-tour-mangrove-point | Belum diperiksa pada sesi ini |
| 14 | https://nusapenidaexperiences.com/id/experiences/nusa-lembongan-island-tour-mangrove-point | Belum diperiksa pada sesi ini |
| 15 | https://nusapenidaexperiences.com/en/experiences/nusa-lembongan-island-tour-panorama-point | Belum diperiksa pada sesi ini |
| 16 | https://nusapenidaexperiences.com/id/experiences/nusa-lembongan-island-tour-panorama-point | Belum diperiksa pada sesi ini |
| 17 | https://nusapenidaexperiences.com/en/experiences/nusa-lembongan-island-tour-mahagiri-beach | Belum diperiksa pada sesi ini |
| 18 | https://nusapenidaexperiences.com/id/experiences/nusa-lembongan-island-tour-mahagiri-beach | Belum diperiksa pada sesi ini |

Indeks artikel tambahan: https://nusapenidaexperiences.com/en/articles dan https://nusapenidaexperiences.com/id/articles. Tunda permintaan manual sampai terdapat artikel bermanfaat terbit (saat ini kosong); tidak memaksa Google mengindeks halaman kosong. Jangan memasukkan dashboard, alias redirect, draft atau halaman duplikat.

Prosedur owner: buka https://search.google.com/search-console, pilih property NPE, buka URL Inspection; URL is on Google → catat selesai tanpa request ulang. URL is not on Google → Test live URL, periksa crawl/fetch/indexing/canonical; bila layak dan belum pernah diajukan, Request indexing satu kali. Jika gagal, catat alasan untuk koreksi teknis/konten. Request berhasil bukan bukti indexasi. Jika quota habis, lanjut saat tersedia; sitemap yang sukses tidak perlu dikirim ulang tanpa perubahan penting. Periksa hasil setelah waktu wajar (Google menyarankan setidaknya satu minggu sebelum menganggap ada masalah). Sumber: https://support.google.com/webmasters/answer/9012289 dan https://support.google.com/webmasters/answer/7474347.

Gate: catat verdict per URL, tanggal request dan tindak lanjut. Target seluruh URL canonical yang layak terindeks atau alasan pengecualian sah yang disetujui owner; owner mengizinkan pekerjaan independen dilanjutkan 26 Nov karena quota exceeded; lanjutkan indexasi saat kuota tersedia. Google menentukan indexasi; tidak ada jaminan semua URL masuk indeks. Akses akun GSC tidak tersedia bagi AI pada sesi ini; owner melakukan inspeksi/request dan melaporkan hasil. Tidak membuat fitur/cron baru.

### Fase 1 — Kata kunci dan halaman penjualan (hari 7–21)

| ID | Prioritas | Pekerjaan | Kriteria selesai | Status |
|---|---|---|---|---|
| SEO-006 | P1 | Riset intent dan SERP untuk 10–20 kueri; 3–5 kompetitor per klaster | Catat tanggal/negara/perangkat, tipe hasil, URL pesaing, kebutuhan pengunjung dan gap; volume hanya jika sumber jelas | [~] Sampel 10 query dan tambahan Lembongan; lihat catatan riset. Negara/device/rank Google aktual belum diperoleh |
| SEO-007 | P1 | Buat peta keyword → URL canonical existing; cegah kanibalisasi | Satu halaman utama per intent dan bahasa; URL baru hanya bila intent belum terlayani | [~] Peta keyword awal diperluas; validasi dengan GSC setelah data tersedia |
| SEO-008 | P1 | Perbaiki halaman penjualan prioritas: judul, ringkasan, itinerary, lokasi berangkat, inclusions/exclusions, opsi private/sharing, harga terverifikasi, keselamatan, FAQ dan CTA | Isi spesifik, akurat dan lebih membantu; persetujuan owner/operator; URL tidak berubah tanpa alasan | [~] Audit kode dan data CMS publik 26 Nov; owner konfirmasi durasi land tour dan 3 spot kondisional; copy ID/EN diperbarui; aktivitas dinamis D1 versi 3 terverifikasi; CI/deploy/Verify commit 703d494 lulus. Copy awal selesai; fasilitas/harga spesifik belum dikonfirmasi, tetap tidak diasumsikan |
| SEO-009 | P1 | Perbaiki tautan internal HTML yang dapat dirayapi dari Beranda, tur dan artikel relevan | Tidak ada orphan page prioritas; anchor natural; link 200 ke canonical | [x] Verify 45749519570: 32/32 URL sitemap terjangkau dari homepage melalui HTML anchors, termasuk artikel pertama ID/EN. Pantau bila ada regresi. |
| SEO-010 | P1 | Periksa dan kurangi masalah teknis aktual yang menghambat indexasi/UX | Bukti sebelum/sesudah, CI/deploy/live smoke jika kode berubah | [x] Perbaikan teknis teridentifikasi pada cover Lembongan: skor 87 → 97; CI/deploy/smoke lulus. Evaluasi lanjutan bila ada temuan nyata. |

Kandidat awal peta kata kunci (hipotesis, bukan ranking atau volume terukur):

| Klaster | Query utama/variasi | URL sasaran existing (verifikasi sitemap) |
|---|---|---|
| Penida private/island tour | nusa penida private tour; nusa penida island tour; paket tour nusa penida | /en/tours/island dan /island-tour.html |
| West | nusa penida west tour; west nusa penida day trip | /en/tours/west dan /west-tour.html |
| East | nusa penida east tour; diamond beach tour | /en/tours/east dan /east-tour.html |
| Snorkeling | nusa penida snorkeling tour; manta ray snorkeling nusa penida; private/shared snorkeling | /en/tours/snorkeling dan /snorkeling.html |
| Lembongan | nusa lembongan island tour; lembongan ceningan tour | /en/experiences/nusa-lembongan-island-tour dan pasangan ID jika masih published |
| Fast boat | sanur to nusa lembongan fast boat; lembongan to sanur boat; fast boat to gili | /en/experiences/boat-ticket dan pasangan ID jika masih published; intent per rute diperiksa |
| Panduan | west vs east; itinerary; manta bay vs manta point | Artikel yang relevan; link ke halaman jual, hindari duplikasi guide yang sudah ada |

Prioritas awal EN untuk wisatawan internasional dan ID untuk kebutuhan lokal; negara/perangkat spesifik baru ditetapkan setelah GSC. Jangan menambahkan harga net pemasok, menjanjikan penampakan manta, atau menawarkan snorkeling + island tour Penida pada hari yang sama apabila layanan tidak tersedia. Validasi rute, jadwal, harga, kapasitas dan keselamatan ke operator sebelum terbit.

### Fase 2 — Konten dan authority per topik (hari 14–45)

| ID | Prioritas | Pekerjaan | Kriteria selesai | Status |
|---|---|---|---|---|
| SEO-011 | P1 | Audit inventaris artikel dan panduan yang sudah terbit; pilih gap berdasarkan kueri dan kebutuhan pelanggan | Backlog tanpa artikel/URL duplikat, alasan pemilihan per artikel | [~] D1 26 Nov: 1 artikel terbit; enam kandidat awal tersedia, riset pertama memilih lembongan-two-days dengan sinyal pertanyaan 0 (bukan volume). Validasi gap dan prioritas berikut dari GSC/kebutuhan pelanggan. |
| SEO-012 | P1 | Siapkan artikel orisinal bilingual di CMS existing, 1–2 topik/minggu sebagai batas awal, bukan kuota wajib | Setiap artikel punya intent, sumber fakta, nilai tambah, foto berizin, judul/meta, link ke produk; review owner sebelum publish | [~] Siklus pertama berhasil: draft dikoreksi editorial, owner upload cover/publish 26 Nov 11.04 WITA; D1 1/1 terbit. Generator naskah induk + terjemahan terpasang; keselarasan otomatis artikel berikut perlu review. Tidak mengulang riset minggu ini. |
| SEO-013 | P1 | Setelah publikasi verifikasi status 200, canonical, hreflang, sitemap dan link dari halaman lain; cek indexasi setelah wajar | URL dan tanggal publish tercatat, bukti indeks bila tersedia | [!] URL ID/EN pertama, HTTP 200, canonical/hreflang, sitemap dan crawlability lulus Verify 45749519570. Owner kembali melaporkan kuota request habis 26 Nov. Indeks aktual belum diketahui; inspeksi ketika tersedia, tidak request berulang. |
| SEO-014 | P2 | Perkuat halaman yang memperoleh impressions, bukan membuat artikel serupa | Catat query/URL, CTR/position sebelum, revisi, hasil 28 hari setelah | [ ] |

Topik calon artikel (uji gap sebelum membuat, perbarui panduan existing bila sudah menjawab):
1. West vs East Nusa Penida: pilihan berdasarkan waktu, kondisi jalan dan minat wisatawan.
2. Manta Bay vs Manta Point: kondisi, peluang satwa (tidak dijamin), sharing/private dan persiapan.
3. Lembongan–Ceningan 2D1N: itinerary realistis, pilihan aktivitas dan transfer.
4. Fast boat Sanur–Lembongan: pelabuhan, check-in, bagasi dan arah perjalanan; jadwal/harga diverifikasi.
5. Lembongan snorkeling vs mangrove visit: bedakan kegiatan laut dan darat.
6. Biaya dan pilihan private vs sharing; transparansi yang benar, tanpa bocor harga supplier.

Standar artikel: bantu keputusan riil wisatawan, gunakan pengalaman lokal yang dapat dibuktikan, review manusia, link kontekstual (umumnya 1–3 yang benar-benar relevan), judul deskriptif, tanggal pembaruan faktual. Tidak ada keyword stuffing, artikel massal AI, review palsu, tanggal palsu atau schema yang tidak sesuai isi. Artikel baru tidak boleh otomatis terbit. Riset dan pembuatan draft otomatis diizinkan owner 26 Nov, maksimal satu percobaan per minggu; backlog review maksimal dua. Tidak mengubah kampanye otomatis.

### Fase 3 — Reputasi, backlink dan konversi (hari 21–60)

| ID | Prioritas | Pekerjaan | Kriteria selesai | Status |
|---|---|---|---|---|
| SEO-015 | P1 | Perkuat trust: identitas bisnis/role agen, kontak, kebijakan pemesanan/pembatalan, operator dan sumber foto | Fakta terverifikasi; tidak klaim izin, rating atau kemitraan yang belum ada | [~] Copy trust dan testimoni release a5ecbd3 CI/deploy/Verify lulus; detail retensi/kebijakan final perlu owner |
| SEO-016 | P1 | Uji alur mobile dari halaman tur/artikel → WA atau formulir → enquiry → booking | CTA jelas, tidak rusak, atribusi sejauh tersedia dan booking manual tervalidasi | [~] WhatsApp jalur utama; form website dihapus, endpoint legacy 410 terverifikasi smoke; uji chat/booking nyata belum dilakukan |
| SEO-017 | P2 | Minta ulasan asli setelah pelanggan menyelesaikan perjalanan; publikasi hanya dengan hak/persetujuan | Ulasan genuine, tidak diinsentifkan; tidak ada rating palsu | [~] Testimoni langsung tampil/hide/show: CI/deploy/Verify lulus; D1 0 total/0 tampil. Uji pelanggan/Android dan ulasan nyata belum ada |
| SEO-018 | P2 | Identifikasi mitra relevan (hotel/villa/homestay, operator, travel guide); tawarkan referensi yang bermanfaat | Daftar target, kontak melalui owner approval, respons dan link aktif relevan tercatat | [ ] Opsional / owner-managed: owner dapat memilih dan menghubungi mitra sendiri; daftar prospek historis hanya referensi yang dapat berubah. Tidak menjadi prasyarat fase berikutnya; tidak ada outreach otomatis, klaim backlink aktif, atau biaya tanpa persetujuan. |
| SEO-019 | P2 | Evaluasi Google Business Profile hanya jika memenuhi aturan kelayakan interaksi pelanggan | Kelayakan terdokumentasi; tanpa alamat palsu atau listing bisnis online-only | [x] Evaluasi selesai — N/A: owner mengonfirmasi 26 Nov NPE hanya menerima booking; pelayanan langsung oleh operator lokal. Model online-only tidak eligible menurut panduan resmi Google. Tidak membuat profil, evaluasi ulang hanya jika model layanan berubah. |

Tidak membeli link untuk ranking, tidak spam grup/komentar, tidak menggunakan jaringan backlink, tidak mengirim outreach tanpa mandat. Aktivitas sosial hanya mendukung penemuan, kunjungan dan referensi; bukan bukti ranking.

### Fase 4 — Optimasi berbasis data (hari 30–90 dan seterusnya)

| ID | Prioritas | Pekerjaan | Kriteria selesai | Status |
|---|---|---|---|---|
| SEO-020 | P1 | Review mingguan GSC, indexing, clicks, impressions, CTR, posisi, enquiry dan booking | Catatan snapshot dan tindakan berikutnya, periode sebanding | [ ] berulang |
| SEO-021 | P1 | Fokus quick wins: query posisi 11–30 dengan impressions dan intent relevan, lalu CTR rendah pada posisi yang sebanding | Perubahan substansial berbasis gap; evaluasi 28 hari | [ ] berulang |
| SEO-022 | P1 | Review setiap 28 hari, periksa dampak dan prioritas ulang; bedakan musiman/algorithm update dari efek revisi | Keputusan lanjut/tahan/perbaiki/revert berdasar data; tidak ubah semua sekaligus | [ ] berulang |
| SEO-023 | P2 | Audit pada hari 90/180; nilai capaian Top 10 dan konversi | Perbandingan baseline, hasil, hambatan dan target periode berikutnya | [ ] |
| SEO-024 | P3 | Pertimbangkan otomasi pengambilan data saja jika terbukti menghemat pekerjaan berulang | Dokumen kebutuhan, biaya, manfaat, persetujuan owner; tanpa dashboard/menu baru secara default | [ ] ditunda |

Pedoman keputusan:
- Belum terindeks: cek penyebab (canonical, noindex, duplikat, kualitas, crawling) terlebih dahulu.
- Terindeks, impressions rendah: cek intent, relevansi, kualitas dan demand; bukan menambah banyak halaman.
- Posisi 11–30 + impressions: bandingkan SERP, perbaiki isi dan internal link yang relevan.
- Top 10 + CTR rendah: cek intent, snippet dan tampilan SERP; jangan clickbait.
- Clicks meningkat, enquiry rendah: audit penawaran/CTA/UX dan pengukuran, bukan otomatis menambah fitur.
- Enquiry ada, booking rendah: analisis kualitas lead, kecepatan respons dan penawaran; jangan menyimpulkan SEO gagal hanya karena booking rendah.
- Jangan mengubah URL atau isi besar-besaran akibat fluktuasi harian. Simpan kondisi awal dan ukur dalam jendela data yang memadai.

## 4. Aturan pelaksanaan wajib untuk AI/kontributor

1. Sebelum bekerja baca `roadmap.md`, `AI_START_HERE.md`, `CHANGELOG.md`, dan status branch `main` terbaru. Roadmap adalah pengendali prioritas SEO; permintaan eksplisit owner dan perbaikan kritis keamanan/layanan tetap berlaku.
2. Pilih pekerjaan TODO dengan prioritas tertinggi yang dependensinya siap. Jika terhambat, catat BLOCKED, kebutuhan akses dan pekerjaan independen berikutnya. Jangan melewati P0 untuk membuat fitur P3.
3. Tulis tujuan dan ID tugas, baseline, hipotesis, kriteria penerimaan sebelum implementasi. Mulai dari data dan konten; jangan otomatis mengubah kode.
4. Gunakan file, CMS artikel, data dan infrastruktur existing. Tidak ada branch tambahan, file mirip/duplikat, dashboard SEO baru, layanan berbayar, cron atau integrasi eksternal tanpa justifikasi dan persetujuan yang sesuai.
5. Pertahankan data produksi D1/KV, URL, foto, harga owner, session, booking, security, consent analytics dan pengamanan publikasi. Jangan mengubah secret atau meminta token di chat. Jangan aktifkan kembali pembuatan kampanye otomatis yang telah dihentikan. Draft artikel dan outreach tetap memerlukan persetujuan owner.
6. Uji perubahan kode melalui pemeriksaan sintaks/unit/integration/build/CI yang relevan, deploy existing workflow, cek live smoke. Perubahan konten diverifikasi di URL publik setelah publish. Jangan melemahkan tes hanya agar hijau. Catat CI, deploy dan live smoke secara terpisah; bila belum selesai tulis status faktual.
7. Sesudah setiap pekerjaan, update **file roadmap.md yang sama**: tanggal, status ID, bukti/link, ringkasan hasil, KPI, blocker, next action. Catat perubahan kode/arsitektur juga di CHANGELOG dan AI_START_HERE bila relevan. Status DONE hanya dengan bukti sesuai kriteria selesai; keberhasilan deploy tidak berarti ranking meningkat.
8. Jangan menyimpan data pelanggan, kredensial, ekspor berisi PII atau angka tanpa sumber pada repo publik. Hanya agregat anonim yang diperlukan. Tidak perlu commit bila review tanpa perubahan selain pembaruan bukti/status.
9. Setiap laporan ke owner menyatakan yang selesai, yang belum, bukti, perubahan KPI, langkah berikutnya dan kebutuhan persetujuan. Jika pekerjaan baru menyimpang dari target, tunda kecuali owner meminta atau ada insiden kritis.
10. Roadmap diperbarui pada setiap sesi kerja dan saat review mingguan benar-benar dijalankan. File ini sendiri tidak menjalankan proses terjadwal; tidak mengklaim pemantauan otomatis/GSC API aktif tanpa alat dan persetujuan. Hindari jadwal palsu dan status yang belum diverifikasi.

## 5. Log evaluasi (tambahkan entri, jangan hapus riwayat)

### 2026-11-26 — Roadmap awal
- Tugas: tata kelola SEO; pemilik meminta fokus halaman pertama, bukan penambahan fitur.
- Bukti: CI, deploy, verify live untuk commit aplikasi 23c7283 lulus (tautan pada bagian 2).
- Hasil: fondasi teknis tersedia; bukti indexasi, query, posisi, konversi aktual belum diperoleh.
- Keputusan: tidak menambah SEO Intelligence dashboard, rank tracker khusus atau AI autopublish. Mulai dengan GSC dan alat existing.
- **Next action: SEO-001, SEO-002, SEO-003 dan SEO-004**. Periksa property Search Console dan ekspor performa; audit URL publik; uji pengukuran konversi. SEO-005 menyusul.
- Hambatan: belum tersedia data akun GSC/GA4 dalam sesi ini; bukan bukti bahwa akun tidak terhubung.
- Review berikut: 3 Desember 2026 sebagai tanggal evaluasi usulan, atau lebih awal ketika pekerjaan dilaksanakan/data diterima. Belum ada penjadwalan otomatis tambahan.

### 2026-11-26 — Koreksi baseline GSC berdasarkan riwayat pekerjaan 25 November
- SEO-001: verifikasi kepemilikan GSC dilaporkan berhasil; jenis property dan akses langsung AI belum dipastikan.
- SEO-002: pengiriman sitemap berhasil dan dibaca 25 Nov; 28 URL ditemukan, 0 video. Owner mengajukan indeks 10 halaman satu per satu. Laporan asisten 25 Nov mencatat 10/10 URL diperiksa berstatus URL is on Google/Page is indexed. Tidak menyatakan seluruh 28 URL terindeks. Daftar URL dan screenshot asli belum tersedia pada sesi koreksi.
- Keputusan: tandai verifikasi dan audit awal selesai berdasarkan riwayat; jangan mengulang permintaan indeks. Pantau sisa coverage dan URL baru secara berkala pada SEO-020 (dan SEO-013 untuk artikel baru).
- Next action: SEO-003 (baseline Performance/Search results: clicks, impressions, CTR, posisi, queries, pages), SEO-004 (GA4 dan konversi), SEO-005 (baseline performa). Jika data domain baru belum mencukupi, catat dan lanjutkan riset kompetitor/keyword independen SEO-006 serta peta keyword SEO-007 tanpa membuat fitur baru.
- Bukti: catatan percakapan proyek 25 Nov 2026 dan koreksi owner 26 Nov 2026; bukan akses baru ke akun GSC. Tidak ada perubahan website/DB/publikasi.

### 2026-11-26 — Gate indexasi lanjutan
- SEO-002 dibuka kembali atas instruksi owner. 18 kandidat URL diambil dari sembilan aktivitas published di D1 dan aturan URL bilingual di kode sitemap. Dua indeks artikel tambahan belum berisi artikel. Tidak mengklaim hasil indeks baru. Daftar dan prosedur tercatat di atas.
- Bukti teknis: Verify Cloudflare 45722066142 lulus. Akses XML langsung dan GSC tidak tersedia; owner perlu menjalankan URL Inspection dan menyerahkan verdict. SEO-003 dan fase berikutnya ditunda hingga gate SEO-002 selesai.

### 2026-11-26 — Rekonsiliasi daftar URL dari screenshot owner
- Screenshot checklist berisi sepuluh halaman utama ID/EN, semuanya ditandai selesai; catat URL persis di SEO-002. Screenshot bukan tampilan verdict GSC langsung, status terindeks mengikuti laporan owner.
- D1 read-only diperiksa ulang: 9 aktivitas terbit, 0 artikel terbit. 18 URL bilingual tidak tumpang tindih dengan sepuluh URL pada screenshot; indeks artikel kosong tetap ditunda. [Verify Cloudflare terbaru lulus](https://github.com/rama160/Marketing-turism/actions/runs/45722581500). Fetch sitemap langsung tidak tersedia pada sesi ini.
- Next: owner memeriksa 18 URL via GSC dan mengirim verdict/request; lanjut SEO-003 hanya setelah gate SEO-002. Tidak ada perubahan aplikasi atau database.

### 2026-11-26 — Quota exceeded; lanjut pekerjaan independen
- Owner melaporkan batas Request Indexing terlampaui dan mengizinkan melanjutkan pekerjaan lain. SEO-002 BLOCKED untuk pengajuan baru; inspeksi/Performance tidak diasumsikan terblokir. Pertahankan checklist 18 URL; jangan mengarang jumlah request/index tambahan. Lanjut ketika kuota tersedia, tanpa spam request.
- SEO-003/004: ekspor GSC/Realtime GA4 tetap dibutuhkan untuk baseline. Audit kode menemukan artikel memuat analytics.js tetapi filter pathname menolak /id|en/articles dan detail; perbaiki allowlist untuk route publik saja, tetap opt-in, tanpa PII, dashboard tetap dikecualikan. Tambah regresi consent dan event artikel.
- SEO-009: renderExperiencePage memiliki tautan parent→child tetapi child tidak punya tautan langsung parent. Tambah tautan HTML lokal kembali ke paket induk yang valid (dynamic published parent atau static tour). Tambah unit dan live smoke checks; tidak mengubah URL, D1, foto, harga atau artikel yang telah terbit. Status release belum terverifikasi saat commit.
- SEO-006/007: riset awal pencarian web 26 Nov 2026 (bukan SERP Google terlokalisasi, negara/perangkat tidak dikontrol, bukan ranking/volume). Query: Nusa Penida private island tour; Nusa Penida West Tour private; Nusa Penida East Tour; Nusa Penida snorkeling tour sharing private; Nusa Penida Manta Point snorkeling; Nusa Lembongan island tour private; Nusa Lembongan Ceningan 2 day itinerary; Sanur to Nusa Lembongan fast boat; Nusa Lembongan to Gili fast boat; Nusa Penida west vs east tour. Pencarian tambahan: Lembongan local private car dan fast boat routes.
- Sampel kompetitor dan kebutuhan pengunjung:
  - West/East/island: https://penidaprivatetour.com/west-tour/ ; https://penidaprivatetour.com/east-tour/ ; https://nusapenidatransport.com/tour/west-nusa-penida-private-driver/ ; https://visitpenida.com/tours/day-trips/east-nusa-penida-day-tour/ — rute, titik jemput, harga berdasarkan grup, fasilitas.
  - Snorkeling: https://www.snorkelinginbali.com/tours ; https://nusapenidatransport.com/tour/nusa-penida-snorkeling-tour/ ; https://snorkeling.doelrentalpenida.com/package/ ; https://visitpenida.com/tours/snorkeling/private-nusa-penida-snorkeling/ — bedakan Manta Bay/Point, kapasitas, biaya per orang/per kapal, durasi.
  - Lembongan: https://lembongantrip.com/day-trips/from-mainland/island-tour-from-bali.php ; https://www.thelembongantraveller.com/portfolio-category/island-transport/ ; https://tikolembongantaxi.com/ ; https://arjunlembonganactivities.com/island-tour/ — paket dari pulau vs Bali, transport lokal, itinerary.
  - Boat: https://sailtix.com/routes/sanur-to-nusa-lembongan ; https://penidaboat.com/routes/sanur-nusa-lembongan ; https://setiafastferry.com/timetable/ ; https://nusalembongan.org/fast-boats/ — arah rute, pelabuhan, check-in, tarif/availability aktual. Jangan menyalin jadwal/harga kompetitor.
  - Informasional: https://visitpenida.com/guide/west-vs-east-nusa-penida/ ; https://penidaprivatetour.com/nusa-penida-itinerary/ ; https://bali-explorer.com/blog/nusa-lembongan-in-2-days/ ; https://fivepillarexperiences.com/experiences/lembongan-beyond-the-blue/ — itinerary yang menjawab keputusan perjalanan.
- Audit kode panduan kompetitif NPE: rute ilustratif, biaya yang perlu dikonfirmasi, keselamatan, private/sharing dan titik jemput sudah ada. Gap utama: penawaran nyata yang terverifikasi (harga jual, durasi, kapasitas, inclusions/exclusions). Jangan menulis ulang guide existing hanya karena kompetitor juga membahas topik tersebut. Web fetch live NPE tidak berhasil pada sesi ini, sehingga perbandingan NPE berbasis kode repo, bukan audit visual live.
- Peta prioritas awal (hipotesis, bukan volume):
  - /en/tours/west + /west-tour.html → west tour/private west tour; /en/tours/east + /east-tour.html → east tour/private east tour.
  - /en/tours/island + /island-tour.html → private island tour, west vs east (informasi sudah ada pada halaman ini).
  - /en/tours/snorkeling + /snorkeling.html → snorkeling tour, Manta Bay/Point, private/sharing. Detail Mangrove Point tidak menggantikan halaman induk.
  - /en/experiences/nusa-lembongan-island-tour + /id/experiences/nusa-lembongan-island-tour → private Lembongan island tour; detail destinasi target nama tempat dan link kembali ke tur.
  - /en/experiences/boat-ticket + /id/experiences/boat-ticket → Sanur–Lembongan, arah sebaliknya, Lembongan–Gili sesuai rute yang tersedia. Pertimbangkan artikel rute khusus hanya jika punya nilai tambah.
  - Calon artikel berbeda intent: Lembongan–Ceningan 2D1N (panduan, bukan klaim paket siap jual), persiapan naik fast boat dari Sanur, memilih private/shared snorkeling. Prioritaskan setelah inventaris dan persetujuan owner; tidak auto-publish.
- Next: verifikasi CI/deploy/smoke, minta data Performance 28 hari dan GA4 Realtime tanpa PII, konfirmasi penawaran operator sebelum ubah halaman, lanjut checklist indexasi saat kuota tersedia. Tidak ada ranking baru yang diklaim.

### 2026-11-26 — SEO-011/012: riset mandiri dan draft artikel
- Owner menyetujui automasi riset dan pembuatan draft artikel saja; bukan publikasi. Gunakan CMS existing, riset topik dari pertanyaan publik agregat dan sumber Wikimedia live serta inventaris produk; tidak mengklaim volume/ranking. Hindari duplikasi topik dan halaman penjualan. 1 percobaan per minggu UTC, batas backlog 2 draft, daily cron existing; sumber/AI gagal maka tidak membuat artikel. Tidak ada pembelian layanan baru; pemakaian Workers AI mengikuti kuota akun.
- Workflow: Draft → edit/preview, tolak atau setujui → Publish manual; edit membatalkan approval sebelumnya, versi publik tidak berubah sampai publish. Cover dipilih owner. Urutan artikel terbit dapat dipindahkan langsung. Tidak mempublikasikan artikel saat implementasi.
- Bukti: kode dan regression tests; status release dan hasil riset live belum diverifikasi. SEO-002 masih tertahan quota; SEO-003 butuh data GSC, SEO-008 butuh fakta penawaran.

### 2026-11-26 — SEO-012: upload foto perangkat dan hapus artikel
- Sesuai permintaan owner, cover artikel hanya dipilih dari perangkat dan diunggah langsung dari editor. Gunakan kompresi browser yang memprioritaskan kualitas, max 1600 px, rasio asli, JPEG 0,90–0,78, target 300 KB, fallback maksimal 850 KB, file asli tidak disentuh. Tidak mencari/mengambil gambar eksternal, tidak menambah menu/layanan. Cover existing tetap; tidak mencakup galeri gambar isi artikel. Hak pakai wajib dikonfirmasi.
- Hapus artikel permanen pada semua status; untuk published wajib konfirmasi spesifik, version guard, keluarkan dari daftar dan sitemap, URL ID/EN 404; gambar bersama tetap aman. Tidak menghapus artikel aktual. Perubahan cover tetap draft hingga approval dan publish ulang.
- Status: kode dan regression tests ditambahkan, CI/deploy/live belum dikonfirmasi. SEO-002 masih tertahan kuota, tidak mengubah prioritas SEO lainnya.

### 2026-11-26 — Verifikasi release dan prioritas berikutnya
- Release aplikasi `1ff4eca8a262f310da0511263f9137d89ad4900a`: [CI lulus](https://github.com/rama160/Marketing-turism/actions/runs/45725185505), [Deploy lulus](https://github.com/rama160/Marketing-turism/actions/runs/45725185519), [Verify Cloudflare lulus](https://github.com/rama160/Marketing-turism/actions/runs/45725287322). Release riset otomatis sebelumnya `0397a3a` juga lulus ketiganya. Smoke bukan bukti penggunaan cover melalui Android atau keberhasilan AI di produksi.
- D1 read-only: 0 artikel total, 0 published, tabel seo_research_runs belum berisi record saat pemeriksaan. Cron existing 02:00 UTC (10:00 WITA) memuat generator; belum ada bukti satu run. Owner dapat menekan Riset & buat draft di Artikel SEO bila ingin menjalankan lebih awal (batas mingguan tetap berlaku). Upload foto dari device, review, approve dan publish manual. Jangan menambah fitur atau mengklaim artikel terbit sebelum data tersedia.
- SEO-004/009: live smoke lulus untuk filter analytics artikel dan link child → parent. GA4 Realtime/konversi akun dan audit link artikel nyata belum diverifikasi.
- SEO-008 audit penawaran: data site_content harga ID untuk snorkeling, island, west, east berupa string kosong; dua aktivitas root Lembongan dan Boat Ticket mempunyai price_label_en kosong dan price_verified=0. Pertahankan pilihan harga kosong, jangan isi tarif net atau perkiraan. Lembongan memiliki deskripsi empat destinasi dan panduan pickup/rute; Boat Ticket memiliki penjelasan rute Sanur–Lembongan/Bali–Gili dan batasan jadwal. Panduan existing West/East/Island/Snorkeling memuat contoh rute, pertanyaan fasilitas, perbandingan dan catatan keselamatan. Gap: detail penawaran yang benar-benar disediakan, durasi, titik jemput, kapasitas, include/exclude dan harga jual jika owner ingin menampilkan. Tidak mengubah copy atau harga tanpa konfirmasi.
- Next P0: SEO-003 ekspor Performance GSC 28 hari (clicks/impressions/CTR/position, queries/pages/country/device); SEO-004 uji Realtime page_view dan whatsapp_click setelah consent, tanpa mengirim data tamu atau booking palsu; SEO-005 PSI mobile/desktop untuk beranda, snorkeling, west/east, island, Lembongan dan fast boat. Skor historis bukan pengukuran baru. SEO-002 lanjutkan checklist 18 URL saat kuota tersedia; tidak mengulang 10 URL yang selesai.
- Next P1: validasi penawaran enam klaster dengan owner/operator, perkuat halaman existing (SEO-008); siapkan draft pertama melalui CMS (SEO-011/012), verifikasi HTTP/canonical/hreflang/sitemap dan link setelah publish (SEO-013). Baru lakukan trust/backlink sesuai prioritas roadmap. Tidak ada perubahan kode, D1, publikasi atau harga dalam review ini; hanya dokumentasi. Ranking, impressions, clicks, enquiry dan booking organik masih belum terukur.

### 2026-11-26 — Pemulihan akses dashboard (perbaikan operasional)
- Owner melaporkan aplikasi membuka website publik. Stabilkan manifest launch /dashboard.html, direct shell tiga alias, cache manifest, dan buka website di jendela terpisah. Pemulihan legacy standalone root hanya untuk perangkat yang telah mengunjungi dashboard (marker non-rahasia); shortcut lama tanpa marker mungkin perlu diinstal ulang dari dashboard. Guest browser dan canonical SEO tidak berubah, dashboard tetap noindex/no-store serta login cookie existing.
- Tambah regression dan live smoke; belum ada bukti Android aktual atau deployment saat commit. Tidak mengubah D1, harga, konten atau urutan pekerjaan SEO P0/P1.

### 2026-11-26 — Bukti Performance GSC dan verifikasi pemulihan dashboard
- Screenshot owner pukul 09.17 WITA: Performance, 28 days, Search type Web (text), Last update 3 hours ago; pesan “Processing data, please check again in a day or so”, tabel Queries “No data”. SEO-003 tetap BLOCKED oleh pemrosesan Google; clicks, impressions, CTR, position dan query belum tersedia (N/A, bukan nol). Tidak menyimpulkan ranking/indexasi dari laporan kosong. Periksa kembali 27–28 November atau ketika data tersedia; tidak perlu verifikasi domain/sitemap ulang karena kondisi ini.
- Release pemulihan dashboard `c18522102406965093c01f79b91766aad4b839a1`: [CI lulus](https://github.com/rama160/Marketing-turism/actions/runs/45733867157), [Deploy lulus](https://github.com/rama160/Marketing-turism/actions/runs/45733867192), [Verify Cloudflare lulus](https://github.com/rama160/Marketing-turism/actions/runs/45733962505). Uji buka ikon aplikasi pada Android owner masih belum dilaporkan.
- Prioritas berikut: SEO-004 verifikasi GA4 Realtime dan event setelah consent; SEO-005 audit performa mobile/desktop aktual. SEO-002 lanjut saat kuota tersedia; SEO-003 kembali saat Google menyajikan data. Tidak ada perubahan kode/data produksi dan tidak ada klaim KPI baru.

### 2026-11-26 — Rekonsiliasi pekerjaan GA4 dan PageSpeed sebelumnya
- Owner menegaskan SEO-004 sudah dilakukan kemarin dan tidak boleh diulang. Riwayat percakapan 25 Nov (laporan asisten pukul 08.44 UTC) mencatat GA4 aktif, page_view diuji/tercatat, whatsapp_click aktif, generate_lead ditambahkan sebagai key event. Tandai verifikasi awal selesai; angka realtime, bukti konversi booking aktual, pemeriksaan duplikasi dan link GSC tidak ditemukan dalam cuplikan riwayat. Jangan mengklaim pengujian tambahan tersebut selesai; tangani hanya jika ada kebutuhan nyata melalui SEO-020. Screenshot asli tidak tersedia pada sesi rekonsiliasi.
- Riwayat 25 Nov (laporan pukul 13.30 UTC) mencatat PageSpeed homepage mobile meningkat 72 menjadi 97; FCP 0,9 s, LCP 2,5 s, TBT 0 ms, CLS 0,001; accessibility, best practices dan SEO 100. Desktop sebelumnya 100, FCP 0,7 s, LCP 0,9 s, TBT 0 ms, CLS 0,007. Ini baseline lab historis, bukan pengukuran baru atau CWV field. Catatan run mobile 100/LCP 1,8 s sebelumnya dipertahankan sebagai run berbeda; tidak dicampur dengan run 97.
- Next: SEO-005 hanya melengkapi baseline template yang belum diperiksa (tour, aktivitas, artikel setelah terbit); tidak mengulang homepage tanpa indikasi regresi. SEO-008 optimasi penawaran existing dan SEO-011/012 artikel pertama dapat berjalan. SEO-003 masih menunggu pemrosesan Google dan SEO-002 menunggu kuota. Tidak ada perubahan aplikasi atau database.

### 2026-11-26 — SEO-005/010: audit PageSpeed layanan dan perbaikan Lembongan
- Owner melaporkan lima halaman lain (West, East, Island, Snorkeling, Fast Boat) memperoleh 96–100; skor masing-masing dan desktop per halaman tidak dilaporkan, tidak perlu mengulang audit mobile yang lulus. Screenshot Lembongan EN mobile 09.26 WITA: performance 87, accessibility/best practices/SEO 100, FCP 0,8 s, LCP 4,1 s, TBT 0 ms, CLS 0, Speed Index 0,8 s. Tidak ada field data. Insight gambar 698 KiB, cache 321 KiB, render blocking 140 ms dan legacy JS 10 KiB (estimasi Lighthouse, bukan penghematan terukur).
- D1 read-only: cover published Lembongan 527627 bytes. Audit kode menemukan renderExperiencePage belum memasang srcset untuk cover utama walaupun build responsive WebP sudah ada. Perbaiki hanya template aktivitas dinamis: srcset/sizes pada HTML awal, mempertahankan JPEG fallback, eager/high priority, rasio/layout serta sumber foto. Tidak mengubah data/URL/gambar asli atau template statis yang lulus. Tambahkan unit dan smoke assertions.
- Kriteria: CI/deploy/live smoke lulus; retest PageSpeed Lembongan mobile setelah deployment, target performance >=90 dan LCP <=2,5 s. Jika tidak tercapai, lihat rincian LCP dan resource image aktual; jangan mengoptimasi tanpa bukti. Tidak mengklaim skor sesudah perbaikan sebelum diukur.
- Berikutnya SEO-008 dan SEO-011/012; SEO-002/003 masih bergantung pada kuota dan data Google. Tidak menambah fitur.

### 2026-11-26 — SEO-005/010: hasil retest Lembongan
- Owner melaporkan skor PageSpeed setelah perbaikan 97 (baseline screenshot 87, +10 poin). Lima layanan lainnya sebelumnya dilaporkan 96–100. Target skor >=90 terpenuhi. LCP pascaperbaikan tidak dilaporkan; tidak menyatakan target LCP tercapai. Skor per halaman lain dan field CWV tidak tersedia; tidak mengarang angka.
- Release aplikasi 6ee527af18f201583005a523840317157d9beba8: [CI lulus](https://github.com/rama160/Marketing-turism/actions/runs/45736127105), [Deploy lulus](https://github.com/rama160/Marketing-turism/actions/runs/45736127158), [Verify lulus](https://github.com/rama160/Marketing-turism/actions/runs/45736253975).
- Tutup audit performa awal dan perbaikan teknis yang teridentifikasi; tidak mengejar skor 100 atau mengulang audit tanpa indikasi regresi. Metrik lapangan dan desktop yang belum tersedia dicatat sebagai keterbatasan baseline, dipantau pada evaluasi berikutnya bila relevan.
- Prioritas aktif SEO-008: optimasi halaman penjualan yang sudah ada berdasarkan informasi produk terverifikasi, tanpa mengubah harga kosong menjadi perkiraan. SEO-011/012: review dan publish artikel berkualitas. SEO-002/003 dilanjutkan ketika kuota/data tersedia. Tidak mengubah aplikasi, harga atau database pada sesi pencatatan ini.

### 2026-11-26 — SEO-008: optimasi copy penjualan
- Owner konfirmasi Penida land tour 4–5 jam per rute, Lembongan 3–4 jam; tidak termasuk fast boat. Pertahankan destinasi existing West/East, Lembongan Dream Beach, Devil’s Tear, Yellow Bridge, Mangrove Point darat; Panorama/Mahagiri tambahan bila waktu memungkinkan. Snorkeling pilih 3 dari 5 spot website (Manta Bay, Manta Point, Gamat Bay, Crystal Bay, Mangrove Point) sesuai paket/rute/kondisi, tidak menjamin manta satwa liar. Estimasi snorkeling 2–3 jam dari referensi https://nusapenidatransport.com/tour/nusa-penida-snorkeling-tour/ dan https://www.snorkelinginbali.com/tours ; rute jauh bisa berbeda. Boat Sanur–Lembongan 30–45 menit (https://setiafastferry.com/timetable/ dan https://sailtix.com/routes/sanur-to-nusa-lembongan); Lembongan–Gili PP sekitar 2–4 jam, berdasarkan jadwal https://ekajayafastferry.com/schedule.aspx (beda arah, pulau, singgah). Jadwal aktual selalu dikonfirmasi. Durasi tidak termasuk check-in/transfer; tidak ada klaim harga, include/exclude yang belum dikonfirmasi.
- Perbarui judul, ringkasan, deskripsi ID/EN di homepage dan empat halaman statis, fallback EN dan guide. CMS aktivitas dinamis Lembongan/boat perlu update terpisah menggunakan version guard dan revision history. Tidak mengubah URL, foto, tarif, struktur aktivitas, approval artikel atau desain. CI/deploy/smoke belum diverifikasi saat commit. SEO-008 tetap in progress sampai konten CMS dan live diverifikasi.

### 2026-11-26 — SEO-008 publikasi konten CMS dan koreksi pengujian
- Dua aktivitas root diperbarui melalui D1 sesuai instruksi owner: boat-ticket dan nusa-lembongan-island-tour, masing-masing versi 2 → 3 dengan guard versi/draft sama, revision history, draft dan published sinkron. Read-back lulus; foto dan harga kosong tetap sama. Judul/summary/description bilingual, metadata manual spesifik dan durasi sesuai riset; rute Bali–Gili sekitar 1,5–5 jam bergantung pelabuhan dan singgah (https://ekajayafastferry.com/schedule.aspx). Tidak mengklaim operator tertentu sebagai mitra.
- CI 45737813899 gagal pada assertion judul default West lama; deploy 45737813930 gagal sebelum deploy dan Verify dilewati. Koreksi assertion agar tetap menguji escaping dan default baru, bukan mengabaikan regresi. Perubahan D1 telah tersimpan; template statis menunggu release berhasil. Jangan klaim seluruh live selesai sampai CI/deploy/Verify lulus.
- SEO-008 masih in progress; harga dan fasilitas spesifik tidak diasumsikan. Setelah release, SEO-011/012 dan SEO-009 dilanjutkan; GSC data/kuota tetap tertahan.

### 2026-11-26 — SEO-008 verifikasi release, SEO-009 audit internal links
- Commit 703d494: [CI lulus](https://github.com/rama160/Marketing-turism/actions/runs/45737950970), [deploy lulus](https://github.com/rama160/Marketing-turism/actions/runs/45737951073), [Verify lulus](https://github.com/rama160/Marketing-turism/actions/runs/45738040821). Copy jual awal dan durasi sesuai instruksi owner diterapkan. Tidak mengasumsikan harga/fasilitas khusus.
- Audit kode: halaman English static tour belum merender dynamic child anchors; Mangrove Point EN berpotensi orphan di HTML awal. Root dynamic EN hardcoded dua slug, tidak mencerminkan katalog perubahan. Perbaiki anchor dari aktivitas published yang sudah tersedia; tidak mengubah URL/desain/DB. Artikel hanya dari published snapshot dengan explicit link key cocok, maksimum 3 per halaman jual; tidak tampil ketika kosong. Draft tidak dapat tampil. Tambah regression dan live smoke graph traversal dari homepage melalui <a href>, tidak menghitung sitemap/hreflang sebagai internal navigation. Status CI/deploy/graph belum diverifikasi saat commit.
- D1 read-only: 9 aktivitas published; 0 artikel total/terbit, belum ada riwayat seo_research_runs. Pukul 09.49 WITA sebelum jadwal 10.00 WITA yang sebelumnya dicatat. Jangan klaim riset gagal tanpa record; tidak memasukkan draft manual atau menjalankan cron lewat DB. Owner dapat menggunakan Riset & buat draft pada dashboard existing; review, upload cover dan publish manual. SEO-011/012 belum selesai.
- Next: verifikasi release/graph, lanjut SEO-011–013 dengan artikel pertama dan SEO-015/016 trust/konversi. SEO-002/003 tetap menunggu kuota/data. Tidak ada fitur menu baru, perubahan harga, artikel publik atau DB pada sesi ini.

### 2026-11-26 — SEO-009 koreksi fixture CI
- CI 45738442723: 226 lulus, 1 gagal. Test lama renderEnglishTourPage memanggil renderer tanpa katalog published tetapi mengharapkan nama Lembongan yang sebelumnya hardcoded. Deploy 45738442682 gagal, Verify 45738475311 skipped. Release produksi sebelumnya 703d494 lulus; tidak mengubah konten atau D1.
- Sesuaikan fixture test lama dengan katalog published yang berisi Lembongan dan Boat Ticket, pertahankan seluruh assertion SEO, privasi, metadata, deterministic rendering; tambah assertion href keduanya. Test baru untuk katalog kosong tetap memastikan tidak membuat tautan aktivitas yang belum terbit. Tidak mengubah renderer atau melemahkan smoke reachability.
- CI/deploy/Verify koreksi belum terkonfirmasi saat commit. SEO-009 tetap in progress hingga verifikasi live graph lulus.

### 2026-11-26 — SEO-015–018: kepercayaan, konversi dan otoritas
- SEO-009 release 0e13557: [CI lulus](https://github.com/rama160/Marketing-turism/actions/runs/45739126551), [deploy lulus](https://github.com/rama160/Marketing-turism/actions/runs/45739126537), [Verify lulus](https://github.com/rama160/Marketing-turism/actions/runs/45739215447). Smoke seluruh URL sitemap terjangkau dari homepage melalui HTML anchors; artikel nyata masih menunggu publikasi.
- SEO-015: audit menemukan halaman privasi/terms masih menyatakan pilot dan formulir nonaktif, sementara smoke readiness lulus dan intake aktif. Sesuaikan informasi permintaan manual, kontak, perlindungan data pembayaran, transparansi quote dan peran perantara. Tampilkan business_name/public_contact dari endpoint publik existing dengan textContent. Kebijakan pembatalan tetap DRAFT; tidak mengubah tarif, approval, konfigurasi legal/retensi atau klaim izin. Rincian retensi dan kebijakan final masih perlu konfirmasi owner, bukan audit legal.
- SEO-016: form existing hanya menerima Penida snorkeling/island; tambahkan dua CTA kontekstual WhatsApp Lembongan/fast boat dekat form, bukan jenis booking baru yang belum didukung backend. Pertahankan Turnstile, consent, readiness guard dan proses manual. Live smoke release sebelumnya memvalidasi readiness dan penolakan request tanpa Turnstile (403), bukan transaksi nyata. Tidak membuat lead/booking palsu atau mengirim WA. Uji perangkat dan booking aktual masih perlu bukti; CI/deploy koreksi terbaru pending.
- SEO-017: SOP setelah perjalanan selesai: owner meminta ulasan jujur dari seluruh tamu aktual yang bersedia dihubungi, tanpa hadiah, tanpa meminta 5 bintang atau menyaring hanya tamu puas. Tanyakan izin terpisah sebelum menayangkan kutipan/nama depan/foto; minimalkan data; hormati penolakan dan penghapusan. Simpan referensi booking internal, tanggal perjalanan, izin, teks asli, sumber dan tanggal izin; jangan simpan data tamu di repo publik. Belum ada ulasan yang diverifikasi/dipublikasikan dalam sesi ini; tidak membuat rating schema atau fitur review baru.
- Template ID: "Terima kasih sudah memilih Nusa Penida Experiences. Bagaimana pengalaman perjalanan Anda? Kami menghargai ulasan jujur, termasuk saran perbaikan. Jika Anda bersedia, bolehkah kami menampilkan kutipan ulasan Anda dengan nama depan saja di website? Tidak wajib dan tidak memengaruhi layanan."
- Template EN: "Thank you for travelling with Nusa Penida Experiences. How was your trip? We would appreciate your honest feedback, including anything we could improve. If you are comfortable, may we share a quote from your feedback on our website using your first name only? This is entirely optional and does not affect your service."
- SEO-018: riset prospek website resmi 26 Nov. Belum ada kontak, kesepakatan, biaya atau backlink aktif yang dikonfirmasi. Prioritas: direktori/guide editorial, kemudian akomodasi. Tawarkan informasi praktis untuk tamu (durasi rute, meeting point, pilihan paket), tautan editorial secara sukarela; jangan meminta pertukaran wajib, anchor manipulatif atau membeli link ranking. Jika listing berbayar, evaluasi referral value dan rel=sponsored/nofollow, hanya setelah persetujuan biaya.
  - NusaLembongan.org — https://nusalembongan.org/contact-us/ ; https://nusalembongan.org/advertise/ — permohonan review listing kegiatan/transport, konfirmasi syarat dan biaya, prioritas 1.
  - The Lembongan Traveller — https://www.thelembongantraveller.com/portfolio_page/work-with-tlt/ — program activity business; tanyakan editorial/referral dan biaya, prioritas 1.
  - Batu Karang Resort — https://batukaranglembongan.com/ — concierge guide/panduan rute untuk tamu, prioritas 2.
  - Mahagiri Resort — https://www.mahagiriresortnusalembongan.com/public/ — informasi island tour 3–4 jam dan transport bagi tamu, prioritas 2.
  - Adiwana Warnakali — https://adiwanahotels.com/warnakali-resort-nusa-penida-bali/contact/ — panduan west/east/private dan snorkeling bersyarat, prioritas 2.
  - Google link spam: https://developers.google.com/search/docs/essentials/spam-policies ; gunakan hubungan relevan, bukan kuota backlink.
- Draft outreach EN: "Hello, I represent Nusa Penida Experiences, a local travel booking service coordinating with local operators. We offer island tour and snorkeling information and fast boat booking enquiries for Penida and Lembongan. Would your team be interested in reviewing our practical travel information for guests? Our website is https://nusapenidaexperiences.com/. If relevant, we would welcome an editorial mention or resource link at your discretion. Please let us know your criteria and any listing fees. No obligation. Thank you."
- Tracker awal: kelima prospek = READY FOR OWNER REVIEW; sent = 0; replies = 0; active links verified = 0 (hanya untuk prospek ini, bukan keseluruhan profil backlink). Setelah persetujuan, catat tanggal kirim, status, URL referensi, traffic referral jika tersedia; evaluasi satu follow-up yang sopan setelah 7–10 hari bila sesuai. Tidak outreach otomatis.
- Next: verifikasi release, owner review rincian privasi/pembatalan dan lakukan uji WA/form nyata bila siap; minta review hanya dari guest selesai; owner memilih prospek untuk outreach. SEO-002/003 tetap bergantung data/kuota Google. Tidak ada penambahan dashboard, DB, artikel publik atau pembelian layanan.

### 2026-11-26 — SEO-015/016/017: testimoni publik dan WhatsApp
- Owner meminta pelanggan menulis review sendiri, langsung tampil dan owner dapat hide/show, serta form enquiry dihapus. Tambah Testimoni di Konten & Kampanye, form review homepage, nama depan/samaran, layanan, rating 1–5, teks, deklarasi telah menggunakan layanan, persetujuan publikasi, Turnstile deferred, validasi teks dan pembatas 3 per hari dengan HMAC IP (tanpa IP mentah; bersihkan key lama pada submit berikutnya). Tidak klaim booking terverifikasi; owner tidak dapat mengubah teks/rating, hanya visibilitas dengan session dan version guard. Review hidden tidak dikirim API publik. Tidak membuat ulasan uji di produksi atau rating schema, tidak kirim review ke GA4 sebagai lead.
- Form lead hilang; WhatsApp dan katalog tetap, endpoint public/leads ditolak 410 di produksi melalui flag PUBLIC_WEB_ENQUIRIES_DISABLED (PUBLIC_LEADS_ENABLED dipertahankan untuk ketentuan penawaran internal). Privacy/terms/copy dan smoke diselaraskan; migration 0027 additive. Review dimuat API no-store agar hide tidak bocor lewat cache. CI/deploy/Verify dan uji perangkat belum terkonfirmasi. Moderasi berdasarkan spam, privasi atau pelanggaran, bukan skor negatif. Tidak menghapus data historis.
- SEO-015/016/017 tetap in progress hingga verifikasi dan review nyata; SEO-018 prospek belum dikirim, SEO-002/003 menunggu Google.

### 2026-11-26 — Koreksi CI testimoni
- CI 45741234334 gagal 4 assertion lama (form lead, label pembatalan, jumlah CTA WhatsApp, action Turnstile). Tes validasi/review langsung tampil/hide/show/limit lulus. CI release trust sebelumnya juga gagal pada fixture jumlah CTA. Koreksi fixture sesuai perubahan owner, tetap uji keamanan, tautan kebijakan, CTA, dan tambahkan penolakan API. Tidak menghapus review atau mengubah data lama. Release terbaru belum diverifikasi.

### 2026-11-26 — Verifikasi release testimoni dan prioritas pemulihan artikel
- Release a5ecbd32b43e83b937c3fcf598f4c5175829dcbb: [CI lulus](https://github.com/rama160/Marketing-turism/actions/runs/45741357607), [deploy lulus](https://github.com/rama160/Marketing-turism/actions/runs/45741357642), [Verify lulus](https://github.com/rama160/Marketing-turism/actions/runs/45741466594). Tidak mengulang pengembangan; uji Android oleh owner/pelanggan dan transaksi nyata belum dibuktikan.
- D1 read-only: website_reviews 0 total/0 visible; seo_articles 0 total/0 published. seo_research_runs minggu 2026-11-23: FAILED, topic lembongan-two-days, detail “Riset atau AI gagal; tidak ada publikasi otomatis.” Audit generator: catch generik tidak membedakan kegagalan sumber, AI, JSON/validasi atau DB; INSERT OR IGNORE lock mingguan mencegah retry normal walau gagal. Penyebab spesifik belum diketahui. Tidak reset lock, tidak menjalankan AI, tidak membuat review/draft palsu.
- Prioritas berikut SEO-011/012: diagnosis tahap dan error yang aman tanpa secret/PII, perbaiki sebab nyata, retry terbatas hanya failure dan cegah draft duplikat, verifikasi draft tersimpan; persetujuan/upload foto/publish tetap owner. SEO-013 cek URL/sitemap/tautan setelah artikel terbit. SEO-018 outreach 5 prospek menunggu owner; SEO-019 evaluasi kelayakan lokasi/interaksi pelanggan sebelum membuat profil, tanpa alamat palsu. SEO-002/003 lanjut saat kuota/data tersedia. SEO-020 evaluasi berkala setelah baseline tersedia. Perubahan dokumentasi saja.

### 2026-11-26 — SEO-011/012: pemulihan riset gagal
- Screenshot owner 10.31 WITA menunjukkan FAILED dan pesan Riset minggu ini sudah dijalankan. Audit menemukan exchars 1800 melampaui batas 1200 (https://www.mediawiki.org/wiki/Extension:TextExtracts), generic catch dan lock mingguan yang mencegah retry. Tidak dapat memastikan penyebab exception historis dari log yang tersedia. Perbaiki parameter, respons API error, JSON mode Workers AI (https://developers.cloudflare.com/workers-ai/features/json-mode/) dan validasi enam string. Model fast tetap didukung menurut changelog 8 Mei 2026 (https://developers.cloudflare.com/changelog/post/2026-05-08-planned-model-deprecations/).
- Retry manual maksimal 3 percobaan total/minggu, row FAILED lama dihitung sebagai percobaan pertama, atomic CAS menghindari double click; sukses tetap maksimal satu draft, cron tidak mengulang kegagalan otomatis. Status error terpisah, tidak membocorkan rahasia atau raw response. Tidak mengubah schema, menghapus lock, membuat artikel palsu, atau mempublikasikan artikel. Review/upload cover/publish tetap owner.
- Release CI/deploy/Verify dan retry production belum terbukti. Setelah release lulus, klik Riset & buat draft sekali, periksa draft atau status error yang spesifik.

### 2026-11-26 — SEO-011/012: sumber riset cadangan
- Screenshot owner 10.36 WITA: percobaan 2/3, SOURCE_UNAVAILABLE, koneksi atau respons Wikimedia gagal. Belum ada draft; penyebab jaringan spesifik tidak diketahui, tetapi tahap sumber terkonfirmasi. Tambah Action API → REST summary → referensi geografi stabil Indonesia Travel yang diperiksa 26 Nov. Gunakan sumber cadangan hanya dengan provenance REVIEWED_REFERENCE; simpan tanggal dan kegagalan endpoint. Topik masih dipilih dari sinyal pertanyaan publik dan katalog, tidak mengklaim volume pencarian atau riset daring baru jika fallback. Tidak gunakan cache untuk harga/jadwal/kondisi aktual.
- Referensi: https://www.indonesia.travel/id/id/travel-ideas/adventure/di-indonesia-aja-rekomendasi-wisata-di-nusa-lembongan-dan-ceningan-puas-jelajah-seharian ; https://www.indonesia.travel/id/id/travel-ideas/adventure/nusa-penida ; https://www.indonesia.travel/id/en/destination/bali-nusa-tenggara/west-nusa-tenggara/lombok---gili-trawangan-and-the-gilis ; https://www.mediawiki.org/wiki/Wikimedia_REST_API .
- Tidak reset lock, tidak menghapus data, tidak menambah biaya/provider AI. Satu kesempatan tersisa minggu ini. Setelah deploy/Verify lulus, owner klik riset sekali; jika AI/DB gagal, diagnosis tahap yang ditampilkan. CI/deploy/live draft belum terverifikasi. Tidak ada publikasi otomatis.

### 2026-11-26 — SEO-011/012: koreksi keluaran AI
- Screenshot owner 10.39 WITA dan D1 read-only: week 2026-11-23, attempt 3/3 INVALID_DRAFT, topic lembongan-two-days, 0 artikel. Release a3ba384 CI 45743650435, deploy 45743650409, Verify 45743750028 sukses. Tahap source dan AI sudah dilewati; field historis tidak tercatat.
- Diagnostic langsung Workers AI model existing: JSON bilingual body_id 141 karakter dan body_en 765 (minimum 500); uji single-language JSON schema gagal parsing; plain-text Indonesia 1658 karakter. Ini reproduksi masalah panjang, bukan bukti field historis yang sama. Tidak simpan output uji atau publish. Maks 2 perbaikan bahasa per run, hanya jika invalid; normalize kontrol/whitespace, batas metadata, error per bahasa/field, tetap 500–12000 karakter body, tolak HTML/URL; provenance format_repairs. Konten tetap perlu review fakta oleh owner.
- Tambahkan satu pemulihan manual khusus INVALID_DRAFT yang kehabisan 3 percobaan, marker Pemulihan format v2 (tidak reset history, tidak boleh berulang, sukses tetap satu draft/minggu, cron tidak membuka lock). Tidak mengubah schema atau menghapus data. Uji baru untuk fallback teks, invalid, recovery dan no publish. CI/deploy/live draft belum terverifikasi. Model existing memakai kuota AI; tidak menambah layanan berbayar.

### 2026-11-26 — SEO-011/012: keselarasan bilingual
- Release 9011bb8 CI 45744220691, deploy 45744220758, Verify 45744321131 lulus. D1 draft lembongan-two-days-fa0f5e50 v1, 0 published; AI menciptakan itinerary EN hari 1/2 dan mercusuar Ceningan, ID hasil repair berisi uraian umum, bukan terjemahan. Owner meminta keselarasan. Riset nyata Wikimedia Action berhasil, sinyal pertanyaan 0 (bukan volume).
- Generator satu naskah induk EN, terjemahan ID berurutan dengan marker; cek jumlah/urutan bagian, heading, angka, nama destinasi yang dikenal, panjang dan teks tidak diterjemahkan. Maks dua panggilan terjemahan, gagal tidak simpan. Masukkan deskripsi produk published sebagai bahan. Uji langsung model existing terjemahan enam baris mempertahankan angka/rute/negasi. Cek struktur bukan jaminan makna; owner tetap review. Tidak mengubah harga, URL atau aturan publikasi.
- Koreksi draft produksi existing dilakukan terpisah dengan version guard, tidak membuat artikel duplikat atau mempublikasikan. CI/deploy generator terbaru belum diverifikasi.

### 2026-11-26 — SEO-012/013: pintasan dan manajemen artikel terbit
- D1 artikel pertama lembongan-two-days-fa0f5e50 published 26 Nov 11.04 WITA (03.04 UTC), bahasa ID/EN, URL tetap. Owner screenshot header tidak ada Artikel, daftar admin sulit ditemukan. Tambah anchor header bilingual /id/articles dan /en/articles, tetap terlihat mobile. Header artikel juga menampilkan navigasi di layar kecil.
- Tab Terbit default dengan count, Perlu review/Disetujui/Ditolak/Semua, daftar publik mengikuti posisi yang disimpan, kartu snapshot publik dan tombol Edit artikel terbit, Lihat ID/EN, Tarik publikasi, Hapus artikel. Panel urutan terbuka, posisi bebas dan Simpan urutan memakai key layout.order.articles existing. Editor langsung fokus/scroll. Revisi tetap draft, versi publik lama tidak berubah sebelum Setujui/Publish. Hapus butuh konfirmasi dan expected_version. Tidak menghapus artikel/foto, tidak menambah tabel atau biaya.
- Tambah tes/smoke navigasi dan manajemen. Release belum terverifikasi; uji HP owner setelah deploy. SEO-013 belum dinyatakan selesai: verifikasi publik URL, canonical, hreflang, sitemap dan tautan pada release; status index Google belum tersedia.

### 2026-11-26 — SEO-013/016: tampilan daftar artikel
- Release d8f9e27 CI/deploy/Verify lulus. Screenshot owner 11.28 WITA: halaman daftar artikel hanya judul/ringkasan. D1 read-only: artikel pertama published dengan media_id 73ceaa31-5fbc-4f1b-9f08-f95722ef9b60. Renderer index tidak menampilkan cover, bukan kegagalan upload.
- Buat kartu editorial responsif dengan cover published, judul, ringkasan, tanggal publikasi, CTA baca ID/EN. Artikel pertama mengikuti order owner sebagai unggulan, sisanya grid dua kolom/HP satu kolom. Seluruh kartu link HTML, srcset existing, pertama eager/high priority dan sisanya lazy. Fallback brand bila cover kosong, tidak membuat foto baru. Tidak mengubah artikel, URL, sitemap, schema, data atau dashboard. Unit dan smoke memeriksa visual cover/tautan. CI/deploy/Verify release baru dan uji HP belum terverifikasi; indexasi Google tetap belum diketahui.

### 2026-11-26 — Rekonsiliasi roadmap sesudah artikel pertama terbit
- Release e2133f9: [CI lulus](https://github.com/rama160/Marketing-turism/actions/runs/45749438337), [deploy lulus](https://github.com/rama160/Marketing-turism/actions/runs/45749438340), [Verify lulus](https://github.com/rama160/Marketing-turism/actions/runs/45749519570). Log smoke 03.32 UTC menyatakan Crawlable homepage links reach 32 of 32 sitemap URLs; validasi penemuan artikel dan kartu cover lulus. Ini bukti crawlability internal, bukan Google indexing. Uji tampilan fisik HP belum dilaporkan.
- D1 read-only: 1 artikel total/1 terbit, lembongan-two-days-fa0f5e50, published_at 2026-11-26 03:04:14 UTC (11.04 WITA). Testimoni 0 total/0 visible saat diperiksa. Tidak ada perubahan data.
- SEO-009 selesai untuk audit awal. SEO-011/012 siklus pertama selesai, aktivitas editorial berkala masih berjalan. SEO-013 teknis lulus, status indeks belum diketahui: cek https://nusapenidaexperiences.com/en/articles/lembongan-two-days-fa0f5e50 dan https://nusapenidaexperiences.com/id/articles/lembongan-two-days-fa0f5e50 di GSC. Request satu kali hanya jika belum terindeks dan layak, sesuai kuota. Dua halaman indeks artikel kini berisi konten, dapat diperiksa tanpa request berulang. Sitemap tidak perlu dikirim ulang.
- Urutan berikut: SEO-013/002 saat kuota tersedia; SEO-018 lima prospek yang telah dicatat, outreach dengan persetujuan owner; SEO-019 evaluasi kelayakan Google Business Profile tanpa alamat palsu; SEO-003/020 cek data 27–28 Nov jika tersedia dan review mingguan. SEO-014/021–023 menunggu baseline. SEO-008 harga/fasilitas, SEO-015 ketentuan, SEO-016 booking dan SEO-017 ulasan asli tetap memerlukan konfirmasi/bukti nyata. Tidak membuat fitur baru, melakukan outreach, mengubah harga atau memulai riset duplikat. Perubahan dokumentasi saja.

### 2026-11-26 — Kuota GSC habis kembali; lanjut otoritas
- Owner melaporkan kuota habis setelah checklist SEO-013. SEO-002/013 tertahan untuk request manual; sitemap dan tautan 32/32 telah lulus. Tidak mengulang submit sitemap, tidak menggunakan Indexing API untuk artikel wisata, tidak menganggap seluruh 32 terindeks. Periksa ketika kuota tersedia; waktu reset tidak dijanjikan. Referensi: https://support.google.com/webmasters/answer/9012289 .
- SEO-018: gunakan lima prospek existing, bukan riset ulang. Prioritaskan NusaLembongan.org dan The Lembongan Traveller dengan referensi artikel nyata https://nusapenidaexperiences.com/en/articles/lembongan-two-days-fa0f5e50 . Pesan editorial yang disesuaikan: "Hello, I represent Nusa Penida Experiences. We recently published a practical two-day Lembongan and Ceningan travel guide covering island tour planning and fast boat transfers. If useful for your readers, would you consider it as an editorial travel resource? https://nusapenidaexperiences.com/en/articles/lembongan-two-days-fa0f5e50 . We would appreciate your listing or editorial criteria. Thank you." Tidak dikirim, tidak membeli backlink, tidak klaim kemitraan atau respons.
- SEO-019: cek panduan resmi https://support.google.com/business/answer/13763036 , https://support.google.com/business/answer/7039811 , https://support.google.com/business/answer/9157481 . Interaksi tatap muka pelanggan diperlukan; online-only dan lead generation tidak eligible. Bila NPE sendiri melayani langsung di lokasi pelanggan dan memenuhi seluruh syarat, evaluasi service-area business dengan alamat disembunyikan bila tidak menerima pelanggan di alamat; bila murni perantara online yang menyerahkan seluruh layanan langsung kepada operator independen, jangan buat profil. Perlu konfirmasi owner apakah usaha sendiri bertemu dan melayani tamu secara langsung secara rutin. Tidak memakai alamat operator tanpa hak, tidak membuat profil atau klaim izin.
- Prioritas berikut: outreach dengan persetujuan owner, konfirmasi kelayakan GBP, cek GSC Performance 27–28 Nov jika ada data. Tidak mengubah kode, DB, harga, artikel, biaya atau melakukan komunikasi eksternal.

### 2026-11-26 — SEO-019 keputusan kelayakan final
- Owner mengonfirmasi NPE hanya menerima booking, tanpa pelayanan tatap muka oleh usaha sendiri; operator lokal melaksanakan wisata. Berdasarkan https://support.google.com/business/answer/13763036 dan https://support.google.com/business/answer/7039811, bisnis online-only tidak memenuhi syarat Google Business Profile. Evaluasi SEO-019 selesai, implementasi N/A. Jangan membuat profil dengan alamat fiktif atau operator lain. Evaluasi ulang hanya bila model usaha berubah.
- Fokus SEO-018: lima calon mitra existing, referensi artikel pertama, outreach menunggu persetujuan owner. SEO-002/013 kuota habis, SEO-003/020 menunggu data Google. Tetap artikel berkualitas, testimoni asli, konversi WhatsApp. Tidak mengubah aplikasi/DB, membuat profil, membeli backlink atau mengirim pesan eksternal.

### 2026-11-26 — SEO-018 opsional dan dikelola owner
- Owner menegaskan mitra bersifat opsional karena dapat berubah dan dapat dihubungi sendiri. SEO-018 bukan lagi prioritas wajib atau blocker; daftar lima prospek lama dipertahankan sebagai referensi historis, bukan target tetap. Tidak menghubungi mitra, membuat integrasi outreach, atau mengklaim backlink baru.
- Lanjut SEO-003/020 saat data GSC tersedia (cek 27–28 Nov bila tersedia), SEO-002/013 ketika kuota tersedia, SEO-011/012 artikel mingguan sesuai review owner, SEO-017 ulasan nyata. SEO-014/021/022 membutuhkan baseline sebelum optimasi ranking. Tidak mengulang pekerjaan teknis yang sudah lulus atau menambah fitur tanpa kebutuhan. Perubahan dokumentasi saja.

### Template review berikutnya (isi nyata)
- Tanggal WITA / periode data / sumber:
- ID tugas / status / commit / link URL atau workflow:
- Baseline → hasil terukur (impressions, clicks, posisi, CTR, enquiry, booking):
- Temuan dan alasan perubahan:
- Keputusan (lanjut, tunda, rollback, selesai):
- Blocker / tindakan owner:
- Next action / prioritas / tanggal evaluasi:

## 6. Rujukan resmi

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Search Console performance report](https://support.google.com/webmasters/answer/7576553)
- [Arti impressions, position dan clicks](https://support.google.com/webmasters/answer/7042828)
- [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)

**Prinsip akhir:** hasil bisnis dan visibilitas organik terukur lebih penting daripada banyaknya kode atau fitur. Roadmap ini hidup dan harus disesuaikan jika bukti mengubah prioritas.
