# AI Marketing Agent Mandiri — Nusa Penida Experiences

**Versi implementasi: 3.7.0 | 21 Oktober 2026 | Status: mesin belajar dan dashboard diuji di GitHub; deployment Worker publik dan Meta API langsung belum aktif.**

## Hasil yang ingin dicapai

Mengurangi ketergantungan operasional harian pada percakapan ChatGPT. AI Agent menyiapkan ide promosi secara terjadwal, mengukur hasil yang asli, belajar memilih kanal dan waktu posting yang lebih efektif, lalu menyimpan keputusan agar bisa diperiksa. AI tidak menyewa VPS, tidak membelanjakan uang, tidak mengirim WhatsApp massal, dan tidak membuat booking/payments.

### Yang benar-benar sudah siap dalam kode

| Kapabilitas | Status |
| --- | --- |
| GitHub Actions 7 caption organik multibahasa per Senin 09.00 WITA | Berjalan dan berhasil menghasilkan artefak |
| Facebook dan Instagram akun Nusa Penida Experiences terhubung ke Metricool | Terverifikasi melalui konektor, posting Kelingking 23 Okt 10 WITA sudah dijadwalkan dengan autoPublish |
| Cloudflare Worker Cron 7 draf per Senin dan tombol menyiapkan draf di dashboard | Kode ada, menunggu publikasi versi baru |
| Mesin statistik D1, peringkat konten, rekomendasi jam, alasan pemilihan, histori keputusan | Dibangun pada v3.7.0, menunggu deploy dan migrasi 0011 |
| Metricool API untuk Cloudflare Worker | **Belum terhubung**; API HTTP resmi Metricool memerlukan Advanced/Custom berbayar, MCP dalam ChatGPT berbeda |
| Alternatif Graph API Meta langsung dari Cloudflare | **Belum dikonfigurasi**; membutuhkan izin penerbitan + analitik, Page/IG ID dan token rahasia resmi |
| AI mengubah kode sendiri | **Dilarang** demi keamanan: perubahan kode hanya melalui review dan tes |
| Auto posting mandiri dari Cloudflare, auto respons WhatsApp, ads, pembayaran | **Nonaktif** |

## Arsitektur pembelajaran

1. **Koleksi bukti:** data asli dari analytics Facebook/Instagram/Metricool dicatat bersama sumber, tanggal, kanal, topik, dan jam WITA. Antarmuka owner menolak angka negatif, tanggal masa depan, dan sumber anonim.
2. **Pengukuran hasil:** `src/marketing-intelligence.mjs` menghitung engagement dan click-through relatif terhadap impressions hanya bila angka tersebut benar-benar tersedia pada sumber. Meta dapat mengganti `impressions` dengan `views`: **jangan diam-diam menyamakan dua metrik ini** saat membangun import Graph otomatis.
3. **Skor yang tidak berlebihan:** sistem memakai pembobotan prior 500 impressions agar sampel kecil/viral tidak mendominasi, serta bonus eksplorasi untuk kombinasi platform–aktivitas yang belum diuji.
4. **Keputusan:** laporan memuat `strategy_score`, `priority`, `basis`, jumlah sampel, jam publikasi terbaik jika ada minimal 2 observasi dan 300 impressions. Jika tidak cukup data: `INSUFFICIENT_DATA`, tanpa angka jam rekaan.
5. **Loop pekanan:** Worker Cron menghitung ulang dan membuat 7 draf dari `src/sales.mjs`, lalu menyimpan audit keputusan pada `marketing_decisions`; data kinerja mentah dicatat pada `marketing_observations`. Tidak ada duplikasi pekan. Draf tidak langsung diterbitkan.

**Penting:** versi ini sudah mampu belajar dari data yang dimasukkan lewat dashboard, tetapi belum dapat **mengambil data sosial secara otomatis** dari Metricool ke Worker. Tanpa impor/otorisasi Graph yang sah, penyesuaian berdasarkan metrik baru bergantung pada pengisian statistik pemilik. ChatGPT automation Metricool bisa beroperasi terpisah, tetapi itu bukan proses mandiri Cloudflare.

## Struktur teknis dan larangan perubahan otomatis

- Modul kanonis generator caption: `src/sales.mjs`. Ranking dan validasi: `src/marketing-intelligence.mjs`. Dilarang menyalin fungsi generator ke modul lain.
- Migrasi D1 tambahan `database/migrations/0011_marketing_learning.sql`: tabel `marketing_observations`, `marketing_decisions` dan indeksnya. Data bersifat agregat, **tidak termasuk nama/nomor guest**.
- API authenticated owner: `GET /api/admin/marketing/intelligence`, `POST /api/admin/marketing/observations`, `POST /api/admin/marketing/prepare-week`. Semua memakai `ADMIN_TOKEN`, tidak ada endpoint publik untuk mengubah rekomendasi.
- Sebelum migrasi 0011 selesai, jangan memanggil endpoint baru di versi live. Hanya jalankan migration 0011 secara aditif pada database **marketing-turism-db**, jangan me-replay ALTER lama 0006–0008.
- Batas aktivitas: tidak boleh memakai AI untuk mengarang penampakan manta, iklan diskon, ketersediaan operator, ulasan, legalitas, harga pasti, atau jumlah leads. Jangan menyalakan `PUBLIC_LEADS_ENABLED` atau `WA_SEND_ENABLED` tanpa kesiapan izin.
- Tidak ada akses write/push GitHub atau sistem deploy yang diberikan ke AI saat menjalankan pemasaran. Update source code memerlukan PR/CI/persetujuan manusia, rollback jika performa memburuk.
- Setiap metrik mempunyai sumber asli dan peringkat transparan. Tidak ada pelatihan ulang model dari data pribadi tamu. Pembelajaran berarti **optimasi strategi** yang dapat diaudit, bukan AI mengubah model secara bebas.

## Langkah menghubungkan penerbitan independen melalui Meta Graph API (jika memenuhi syarat)

**Jangan menggunakan kredensial WhatsApp Cloud API untuk ini.** Facebook/Instagram content publishing adalah izin dan produk aplikasi Meta yang berbeda; aplikasi WhatsApp saat ini belum memiliki izin publikasi Pages/IG.

1. Masuk ke <https://developers.facebook.com/apps/> dan pilih aplikasi Meta yang Anda kuasai; tambahkan produk/use-case pengelolaan Facebook Page dan Instagram Business yang didukung.
2. Periksa Halaman Facebook Nusa Penida Experiences dan akun Instagram Professional terhubung serta Anda mempunyai kontrol penuh.
3. Peroleh izin **`pages_show_list`**, **`pages_read_engagement`**, **`pages_manage_posts`** untuk Facebook Pages; serta **`instagram_basic`** dan **`instagram_content_publish`** untuk Instagram Login via Facebook. Jika akan mengambil Insights, tambahkan izin insights yang sesuai dengan jalur OAuth yang dipilih. Review/publikasi aplikasi mungkin diperlukan.
4. Periksa pemilikan **Facebook Page ID**, **Instagram User ID**, token Page/System User yang sesuai, masa berlaku token dan proses rotasi. Simpan token **hanya** di Cloudflare Worker sebagai Secret, bukan di ChatGPT, Github, atau screenshot.
5. **Jangan menyalakan otomatisasi posting Graph API sebelum kode adapter aman, izin benar, foto valid, Meta Graph error handling/idempotency diuji dan update Worker v3.7.0 telah live.** Jangan posting dua kali saat masih ada konten yang telah terjadwal via Metricool.
6. Jika tidak ingin biaya platform API, Anda dapat tetap menggunakan Metricool Free untuk menjadwalkan posting melalui antarmuka resmi atau tugas ChatGPT yang sudah dipasang. Ini bukan otomatisasi Cloudflare sepenuhnya independen.

Sumber:
- Metricool API paket: https://help.metricool.com/plans-add-ons-and-api-access-explained-xux1u
- MCP dibanding API: https://help.metricool.com/mcp-vs-api-access-what-is-the-difference-5y3ib
- Meta Instagram melalui Facebook Login: https://www.postman.com/meta/instagram/folder/u4g5a2a/instagram-api-with-facebook-login
- Meta Pages API: https://developers.facebook.com/docs/pages-api/

## Checklist Aktivasi Produksi

- [x] Generator konten otomatis tanpa ChatGPT di GitHub Actions
- [x] Facebook/Instagram resmi terhubung ke Metricool
- [x] Satu unggahan Kelingking disetujui pemilik dan terjadwal 23 Oktober 2026
- [x] Kode pembelajaran statistik dan peringkat strategi dibuat serta ditest di GitHub
- [ ] Cloudflare v3.7.0 deployed live dan D1 migration 0011 terverifikasi
- [ ] Metrik nyata mulai masuk ke D1, bukan data uji
- [ ] Token dan izin Meta Graph Pages+IG / konektor publikasi terverifikasi untuk operasional independen
- [ ] Adapter publikasi Graph aman, mempunyai idempotensi, batas frekuensi, audit dan verifikasi hasil
- [ ] Jadwal belajar berulang dan penilaian campaign nyata lulus pemeriksaan produksi

Status yang masih kosong di atas adalah *pekerjaan lanjutan yang nyata*, bukan otomatis selesai karena fitur draf sudah tersedia.
