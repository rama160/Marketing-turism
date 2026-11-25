# Roadmap SEO — Nusa Penida Experiences (NPE)

**Dokumen pengendali pekerjaan SEO | Versi 1.0.6 | Diperbarui: 26 November 2026 (WITA)**

- Website resmi: https://nusapenidaexperiences.com
- Repo: rama160/Marketing-turism, branch `main`.
- Pemilik keputusan dan persetujuan publikasi: owner NPE.
- Pelaksana: owner dan AI yang mendapat akses serta mandat pada sesi kerja.
- Status: aktif. Fokus saat ini: **SEO-002 pengajuan tertahan kuota; lanjut pekerjaan independen SEO-004/006/007/009 sesuai instruksi owner, tanpa fitur baru**.
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
| Integritas website | CI, deploy dan live smoke lulus pada commit 23c7283 | Tidak ada regresi keamanan, SEO, CMS, gambar atau booking | GitHub Actions/live smoke |

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
| GA4, event whatsapp_click/generate_lead | Implementasi consent-based tersedia | Realtime, konfigurasi, tautan GSC dan atribusi belum dibuktikan |
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
| SEO-003 | P0 | Ekspor GSC Search results: query, page, country, device, 28 hari terakhir dan periode pembanding jika tersedia; simpan agregat tanpa data pribadi | Tabel baseline; data kurang ditandai; pisahkan brand/non-brand | [!] Data GSC Performance belum tersedia; independen dari kuota request, minta ekspor saat owner siap |
| SEO-004 | P0 | Uji GA4 consent, Realtime, Organic Search, whatsapp_click dan generate_lead; cek enhanced measurement agar tidak duplikat; link GSC jika owner setuju | Bukti event sesuai definisi, tidak membocorkan PII; klik ≠ booking | [~] Gap filter route artikel diperbaiki; CI/deploy dan Realtime akun belum dikonfirmasi |
| SEO-005 | P0 | Tetapkan URL prioritas dari sitemap aktual, catat PSI mobile/desktop per template dan CWV jika ada | Baseline dan daftar masalah nyata; tidak mengulang redesign | [ ] |

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
| SEO-008 | P1 | Perbaiki halaman penjualan prioritas: judul, ringkasan, itinerary, lokasi berangkat, inclusions/exclusions, opsi private/sharing, harga terverifikasi, keselamatan, FAQ dan CTA | Isi spesifik, akurat dan lebih membantu; persetujuan owner/operator; URL tidak berubah tanpa alasan | [ ] |
| SEO-009 | P1 | Perbaiki tautan internal HTML yang dapat dirayapi dari Beranda, tur dan artikel relevan | Tidak ada orphan page prioritas; anchor natural; link 200 ke canonical | [~] Tautan child → parent lokal ditambahkan; CI/deploy/live smoke dan audit keseluruhan belum dikonfirmasi |
| SEO-010 | P1 | Periksa dan kurangi masalah teknis aktual yang menghambat indexasi/UX | Bukti sebelum/sesudah, CI/deploy/live smoke jika kode berubah | [ ] |

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
| SEO-011 | P1 | Audit inventaris artikel dan panduan yang sudah terbit; pilih gap berdasarkan kueri dan kebutuhan pelanggan | Backlog tanpa artikel/URL duplikat, alasan pemilihan per artikel | [ ] |
| SEO-012 | P1 | Siapkan artikel orisinal bilingual di CMS existing, 1–2 topik/minggu sebagai batas awal, bukan kuota wajib | Setiap artikel punya intent, sumber fakta, nilai tambah, foto berizin, judul/meta, link ke produk; review owner sebelum publish | [~] Owner mengizinkan riset dan draft otomatis terbatas; approval dan publish terpisah; uji release diperlukan |
| SEO-013 | P1 | Setelah publikasi verifikasi status 200, canonical, hreflang, sitemap dan link dari halaman lain; cek indexasi setelah wajar | URL dan tanggal publish tercatat, bukti indeks bila tersedia | [ ] |
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
| SEO-015 | P1 | Perkuat trust: identitas bisnis/role agen, kontak, kebijakan pemesanan/pembatalan, operator dan sumber foto | Fakta terverifikasi; tidak klaim izin, rating atau kemitraan yang belum ada | [ ] |
| SEO-016 | P1 | Uji alur mobile dari halaman tur/artikel → WA atau formulir → enquiry → booking | CTA jelas, tidak rusak, atribusi sejauh tersedia dan booking manual tervalidasi | [ ] |
| SEO-017 | P2 | Minta ulasan asli setelah pelanggan menyelesaikan perjalanan; publikasi hanya dengan hak/persetujuan | Ulasan genuine, tidak diinsentifkan; tidak ada rating palsu | [ ] |
| SEO-018 | P2 | Identifikasi mitra relevan (hotel/villa/homestay, operator, travel guide); tawarkan referensi yang bermanfaat | Daftar target, kontak melalui owner approval, respons dan link aktif relevan tercatat | [ ] |
| SEO-019 | P2 | Evaluasi Google Business Profile hanya jika memenuhi aturan kelayakan interaksi pelanggan | Kelayakan terdokumentasi; tanpa alamat palsu atau listing bisnis online-only | [ ] |

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
