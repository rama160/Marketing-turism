# Panduan Lengkap Menghubungkan WhatsApp Business ke Agen AI — Nusa Penida Experiences

**Bahasa: Indonesia | Pembaruan: 20 Oktober 2026 | Proyek: Marketing-turism | Status: fondasi versi 3.5.0 sudah terpasang, koneksi Meta belum diaktifkan.**

Panduan ini ditulis bagi pemilik bisnis yang **belum pernah membuat akun Meta Business/Meta for Developers**, menggunakan HP Android, dan ingin mempertahankan WhatsApp Business yang sekarang digunakan.

## 0. Pahami apa yang sudah aktif dan apa yang belum

**Sudah aktif di website publik:**
- Tombol **Chat WhatsApp** ke https://wa.me/628561752525 (membuka percakapan langsung).
- Tombol **Katalog WhatsApp** ke https://wa.me/c/628561752525 (membuka katalog).
- Tombol WhatsApp mengambang di HP serta tautan dari halaman wisata.
- Dashboard Agen → WhatsApp: balasan siap salin dalam bahasa Indonesia/Inggris, panel inbox, tombol membuat draf AI, dan tombol pengiriman dengan konfirmasi.

**Belum aktif sampai Anda menyelesaikan proses di bawah:**
- Agen AI membaca pesan masuk dari WhatsApp Business.
- Percakapan WhatsApp asli tampil di Dashboard Agen.
- Agen mengirim balasan dari dashboard melalui WhatsApp Business Cloud API.

**Keamanan:** fitur inbox dan pengiriman otomatis ditolak oleh server selama belum ada kredensial resmi Meta. Agen **tidak** dapat masuk ke WhatsApp HP dengan akun Google, QR WhatsApp Web, PIN, atau OTP. Tidak ada autoresponder yang langsung mengirim balasan tanpa tinjauan manusia pada versi ini.

## 1. Persiapan dari nol

Siapkan:
1. HP Android dengan **WhatsApp Business** yang aktif pada nomor **+62 856-1752-525** dan SIM/kartu yang dapat menerima verifikasi ketika proses resmi memerlukannya.
2. Email yang Anda kuasai untuk akun Facebook/Meta. Email bisnis sebaiknya konsisten dengan identitas usaha.
3. Akun Facebook yang Anda kuasai dan dapat Anda gunakan untuk membuat/menjadi admin **Meta Business Portfolio**. Jika belum punya, daftar melalui https://www.facebook.com/.
4. Nama usaha: **Nusa Penida Experiences**, kategori wisata/turisme, situs publik https://marketing-turism-agent.finchat-ai-gateway.workers.dev/.
5. Alamat, kontak, situs kebijakan privasi, dan dokumen legalitas bila diminta Meta. Jangan mengisi data palsu untuk melewati verifikasi.
6. Akses akun Cloudflare tempat **Worker khusus pariwisata** bernama **marketing-turism-agent** berada.
7. Laptop/komputer disarankan untuk dashboard Meta dan Cloudflare; HP tetap diperlukan untuk verifikasi dan memastikan akun WhatsApp Business tidak terputus.

**Sebelum langkah teknis:** buat cadangan percakapan WhatsApp Business dengan fitur pencadangan resmi pada HP Anda. Pencadangan tidak menjamin semua riwayat dapat dipindahkan ke Cloud API; tujuannya mengurangi risiko kehilangan data. Aktifkan autentikasi dua faktor pada akun Facebook dan Cloudflare.

## 2. Tentukan jalur nomor: langkah paling penting

Ada dua jalur. **Pilih A untuk nomor bisnis Anda yang sudah aktif di HP.**

### Jalur A — Mempertahankan nomor WhatsApp Business yang sekarang

1. **Jangan** memilih opsi menghapus akun WhatsApp Business, **Delete my account**, mengganti nomor, atau melepas nomor dari aplikasi.
2. Cari layanan onboarding resmi **WhatsApp Business App Coexistence** melalui mitra/penyedia solusi Meta yang benar-benar mendukung penggunaan aplikasi WhatsApp Business **bersamaan** dengan Cloud API.
3. Tanyakan kepada penyedia sebelum mendaftar:
   - Apakah nomor Indonesia **+62 856-1752-525** memenuhi syarat Coexistence?
   - Apakah aplikasi WhatsApp Business di HP, riwayat chat, dan katalog akan tetap dipertahankan?
   - Apakah API akan terhubung ke **WABA/akun bisnis milik Anda**, bukan semata-mata akun penyedia?
   - Apakah Anda menerima hak untuk mengatur **webhook, Phone Number ID, izin, dan token** yang diperlukan Worker khusus Anda?
   - Apakah ada biaya bulanan, biaya pesan, biaya aktivasi, atau komisi? Mintalah rincian sebelum menyetujui.
4. Jika tersedia, ikuti **Embedded Signup khusus Coexistence** yang diberikan penyedia, autentikasi dengan akun Meta pemilik, pilih bisnis dan nomor yang benar, baca seluruh izin, lalu selesaikan verifikasi sesuai petunjuk resmi.
5. Setelah onboarding, **uji dari HP** bahwa aplikasi WhatsApp Business masih dapat dibuka, percakapan lama ada, katalog terlihat, dan chat biasa tetap berjalan.
6. Catat **Phone Number ID**, **WABA ID**, dan **Meta App ID** yang diberikan onboarding. Ketiganya bukan nomor telepon, bukan password, dan nilainya bisa berbeda.
7. Jangan lanjut ke bagian aktivasi backend bila Coexistence tidak terbukti berjalan.

**Catatan:** fitur Coexistence, akses API langsung, sinkronisasi historis, dan kepemilikan kredensial berbeda antarpenyedia dan wilayah. Tidak semua penyedia memberikan token yang dapat digunakan oleh Worker milik sendiri. **Jangan berlangganan sebelum Anda memastikan hal ini.**

### Jalur B — Nomor pengujian atau nomor baru (tidak mengganggu nomor lama)

Jika Coexistence belum didukung atau Anda tidak ingin menggunakan penyedia berbayar, gunakan **nomor uji dari dashboard Meta** atau nomor bisnis terpisah untuk bereksperimen dengan Cloud API. Nomor uji hanya untuk pengujian dengan batasan Meta, bukan nomor publik yang dapat dihubungi semua guest. Nomor baru yang didaftarkan khusus Cloud API juga tidak sama dengan nomor WhatsApp Business yang sekarang digunakan.

**Jangan mendaftarkan nomor WhatsApp Business aktif ke jalur standar bila prosesnya menyuruh menghapus/menderegistrasi akun di HP.** Berhenti dan kembali ke Jalur A.

## 3. Membuat akun Meta Business Portfolio dari nol

1. Di browser, buka **https://business.facebook.com/** lalu login menggunakan akun Facebook yang Anda kuasai.
2. Cari menu **Buat akun bisnis / Create a business portfolio / Create business** (nama dan lokasi menu bisa berubah).
3. Isi nama bisnis **Nusa Penida Experiences**, nama penanggung jawab, dan email bisnis yang Anda gunakan.
4. Selesaikan verifikasi email jika diminta.
5. Buka **Pengaturan Bisnis / Business Settings** dan pastikan akun Facebook Anda memiliki hak **Admin / Full control**.
6. Lengkapi informasi bisnis secara jujur: alamat/kota, kontak, website, kategori, dan profil usaha.
7. Jika diminta **Business Verification**, ikuti petunjuk dokumen resmi perusahaan yang benar. Status bisnis baru dapat membatasi beberapa fitur; jangan memakai identitas pihak lain tanpa otorisasi.
8. Catat **Business Portfolio ID** di catatan pribadi Anda. Biasanya tersedia pada informasi bisnis/URL Meta Business, tetapi jangan keliru dengan WABA ID.

**Hasil tahap ini:** Anda punya akun bisnis Meta yang kendalinya ada pada Anda. **Belum** berarti nomor WhatsApp sudah terhubung ke AI.

## 4. Membuat aplikasi Meta for Developers (untuk jalur yang mendukung akses langsung)

**Lewati langkah membuat aplikasi sendiri bila penyedia Coexistence mewajibkan aplikasi milik penyedia.** Pastikan terlebih dahulu penyedia mendukung integrasi webhook ke backend Anda; jangan mencoba mereplikasi Embedded Signup penyedia tanpa izin.

1. Buka https://developers.facebook.com/ dan login dengan akun Facebook pemilik yang sama.
2. Jika pertama kali menggunakan Meta for Developers, ikuti proses pendaftaran developer yang ditawarkan Meta.
3. Pilih **My Apps / Aplikasi Saya → Create App / Buat Aplikasi**. Pilih penggunaan/kategori bisnis yang menawarkan **WhatsApp Business Platform** (pilihan antarmuka dapat berubah).
4. Tautkan aplikasi ke Business Portfolio **Nusa Penida Experiences** yang sudah dibuat.
5. Tambahkan produk/use case **WhatsApp**, kemudian masuk ke **WhatsApp → API Setup / Getting Started**.
6. Jika Meta memberi **nomor uji** dan **temporary access token**, gunakan hanya untuk pengujian. Jangan menyalin nomor uji ke website publik; nomor bisnis Anda tetap **+62 856-1752-525**.
7. Catat **App ID**, **App Secret**, **WABA ID**, dan **Phone Number ID** yang relevan untuk nomor yang sudah resmi dihubungkan. **App Secret dan token adalah rahasia**: jangan kirim ke chat atau commit ke GitHub.
8. Bila onboarding menggunakan provider Coexistence, ikuti petunjuk provider untuk mengakses aset dan koneksi webhook; Meta mungkin meminta **App Review / Advanced Access** untuk penggunaan lebih luas.

**Hasil:** akun/aplikasi Meta sudah disiapkan. Tahap berikutnya tetap memerlukan nomor yang telah benar-benar didaftarkan/diotorisasi sesuai jalur yang dipilih.

## 5. Mendapatkan Phone Number ID, izin dan token yang benar

Penting membedakan informasi ini:

| Nama | Artinya | Kerahasiaan |
| --- | --- | --- |
| Nomor WhatsApp +62 856-1752-525 | Nomor chat yang dikenal tamu | Publik |
| Business Portfolio ID | Identitas bisnis Meta | Simpan sebagai informasi konfigurasi |
| WABA ID | Identitas WhatsApp Business Account | Simpan sebagai informasi konfigurasi |
| Phone Number ID | Identitas nomor di Graph API Meta | Variabel konfigurasi Worker |
| Meta App ID | Identitas aplikasi Meta | Informasi konfigurasi |
| Meta App Secret | Rahasia aplikasi untuk memverifikasi webhook | **Secret**, jangan pernah dibagikan |
| WA_VERIFY_TOKEN | Token acak yang Anda buat untuk validasi webhook | **Secret**, jangan pernah dibagikan |
| System User Access Token | Token izin akses untuk mengirim pesan dari backend | **Secret**, jangan pernah dibagikan |

Untuk jalur Cloud API yang mendukung penggunaan aplikasi Anda sendiri:

1. Di Meta Business Settings, cari **Users → System Users / Pengguna Sistem**.
2. Buat pengguna sistem khusus integrasi WhatsApp jika fitur tersedia untuk Business Portfolio Anda.
3. Berikan akses pada aset WhatsApp Business Account yang benar serta aplikasi Meta yang benar, dengan izin minimum yang diperlukan.
4. Saat membuat token, pilih aplikasi dan izin yang relevan, terutama **whatsapp_business_messaging**. Izin **whatsapp_business_management** diperlukan untuk pengelolaan WABA dan beberapa proses langganan/onboarding sesuai aturan Meta.
5. Pilih token sistem yang masa berlakunya sesuai kebutuhan produksi. Token sementara dari halaman pengujian bisa kedaluwarsa dan tidak cocok untuk operasional jangka panjang.
6. Pastikan Phone Number ID merujuk **nomor bisnis yang benar**, bukan Meta test phone number.
7. Jangan simpan access token, App Secret, PIN, atau OTP di pesan ChatGPT, catatan publik, kode GitHub, atau screenshot yang dibagikan.

Bila penyedia Coexistence tidak memberikan izin/token untuk backend milik sendiri, **berhenti**. Kita tidak dapat menghubungkan Worker ini ke inbox penyedia hanya bermodal nomor WhatsApp.

## 6. Menyiapkan Cloudflare — Worker khusus pariwisata

1. Buka https://dash.cloudflare.com/ dan login ke akun Cloudflare Anda.
2. Masuk ke **Workers & Pages** (atau **Compute → Workers** jika antarmuka berubah).
3. Cari Worker bernama **marketing-turism-agent**. **Pastikan benar:** jangan ubah Worker FinChat/Spenva.
4. Buka **Settings → Variables and Secrets / Pengaturan → Variabel dan Rahasia**.
5. Tambahkan variabel di bawah **satu per satu**, lalu tekan **Save / Simpan** atau **Deploy** jika diminta.
6. Jangan menimpa binding yang sudah ada: ADMIN_TOKEN, AI, DB, PHOTO_KV, PUBLIC_LEADS_ENABLED, RATE_SALT, dan TURNSTILE_SECRET.
7. Atur masing-masing nilai berikut:

| Nama variabel di Cloudflare | Jenis | Nilai / petunjuk |
| --- | --- | --- |
| **WA_APP_SECRET** | **Secret** | App Secret asli dari aplikasi Meta yang memproses webhook, minimal 24 karakter |
| **WA_VERIFY_TOKEN** | **Secret** | Buat rangkaian acak unik minimal 24 karakter; nilai yang sama dimasukkan ke Meta |
| **WA_PHONE_NUMBER_ID** | **Text** | Phone Number ID Meta untuk nomor yang sudah terotorisasi |
| **WA_WEBHOOK_ENABLED** | **Text** | Awalnya **false**. Setelah review privasi dan data Meta benar, ubah menjadi **true** tepat sebelum verifikasi webhook |
| **WA_ACCESS_TOKEN** | **Secret** | System User Access Token yang benar, bukan temporary token uji |
| **WA_SEND_ENABLED** | **Text** | Awalnya **false**; pengiriman hanya diaktifkan setelah tes masuk dan persetujuan pemilik |
| **WA_GRAPH_VERSION** | **Text, opsional** | Versi Graph API yang berlaku menurut Meta; kode memakai v25.0 bila tidak ditentukan, tetapi cek dukungan versi terbaru sebelum produksi |

**Penting:** kode Worker memerlukan WA_WEBHOOK_ENABLED = true beserta WA_APP_SECRET, WA_VERIFY_TOKEN dan WA_PHONE_NUMBER_ID yang valid untuk menerima tantangan verifikasi dari Meta. Sebelum itu endpoint verifikasi akan menjawab **HTTP 503** (ini normal). Pengiriman masih tetap terkunci oleh WA_SEND_ENABLED = false.

**Webhook yang benar:**

    https://marketing-turism-agent.finchat-ai-gateway.workers.dev/api/webhooks/whatsapp

Jangan menggunakan alamat homepage tanpa jalur **/api/webhooks/whatsapp**.

**Database tidak perlu dibuat ulang.** Tabel **wa_inbox_messages** dan **wa_outbox_requests** sudah dibuat pada database Cloudflare D1 terpisah **marketing-turism-db**. Hindari menjalankan seluruh file migrasi lama secara massal.

## 7. Hubungkan webhook dari Meta ke Cloudflare

**Kerjakan hanya setelah nomor bisnis benar-benar masuk ke Cloud API/Coexistence dan pemberitahuan privasi Anda siap.**

1. Masuk ke aplikasi Meta yang sesuai, lalu buka pengaturan **WhatsApp → Configuration / Webhooks**, atau menu **Webhooks** di dashboard developer.
2. Cari **Callback URL / URL Panggilan Balik** dan isi:

       https://marketing-turism-agent.finchat-ai-gateway.workers.dev/api/webhooks/whatsapp

3. Isi **Verify Token / Token Verifikasi** dengan nilai acak yang **sama persis** dengan rahasia **WA_VERIFY_TOKEN** di Cloudflare.
4. Periksa Cloudflare sudah berisi WA_APP_SECRET, WA_PHONE_NUMBER_ID dan WA_WEBHOOK_ENABLED = true. Pastikan nomor Phone Number ID adalah nomor milik Anda.
5. Tekan **Verify and Save / Verifikasi dan Simpan**. Meta akan memanggil endpoint HTTP GET dan memeriksa bahwa Worker mengembalikan challenge yang benar.
6. Pada langganan webhook, aktifkan **messages**. Jika diperlukan, pastikan aplikasi telah berlangganan ke WABA yang benar (**subscribed_apps**).
7. Untuk pengujian, kirim **satu pesan teks baru** dari nomor HP lain yang sah/Anda kuasai ke nomor WhatsApp Business bisnis Anda.
8. Di browser, buka Dashboard Agen → login admin → menu **WhatsApp** → **Muat Percakapan**. Jika koneksi aktif dan webhook benar, nomor dan pesan tersebut akan muncul.
9. Jangan menggunakan pesan lama sebelum aktivasi untuk menyimpulkan bahwa webhook rusak: backend hanya menyimpan pesan masuk baru setelah koneksi aktif. Teks non-pesan (gambar, video, status pengiriman) belum menjadi inbox lengkap pada versi 3.5.0.

**Jika verifikasi Meta gagal:**
- **503** → WA_WEBHOOK_ENABLED belum true, salah Worker, atau salah satu rahasia/Phone Number ID belum lengkap.
- **403** → nilai Verify Token tidak cocok, atau signature POST webhook salah.
- **Tidak ada percakapan** → salah Phone Number ID, field **messages** belum disubscribe, aplikasi belum subscribe ke WABA, atau nomor belum benar-benar ditautkan.
- **404** → callback URL atau rute keliru; pastikan memakai URL HTTPS lengkap di atas.

## 8. Mengaktifkan AI untuk membuat draf balasan

Setelah ada pesan masuk asli di Dashboard Agen:

1. Tekan **Dashboard agen**, login dengan token admin yang sudah ada (bukan token Meta).
2. Pilih menu **WhatsApp**.
3. Tekan **Muat Percakapan**.
4. Pilih nomor/percakapan yang ingin dibalas.
5. Tekan **Buat Draf AI**.
6. Ketika muncul pertanyaan persetujuan pemrosesan pesan, setujui hanya bila informasi guest dapat diproses menurut kebijakan privasi Anda.
7. Agen menggunakan **Cloudflare Workers AI** bila tersedia; jika gagal, tersedia draf template aman.
8. Baca kembali isi draf. **Wajib periksa** tanggal, jumlah peserta, jenis Sharing/Private, harga awal, fasilitas, kondisi laut, dan ketersediaan operator. AI **tidak boleh** menjanjikan penampakan manta, konfirmasi booking, pembayaran aman, atau operator tersedia tanpa verifikasi.
9. Bila Anda belum mengaktifkan API pengiriman, tekan **Salin Draf**, buka WhatsApp Business di HP, dan kirim manual.

**Harga referensi guest yang dipakai draf saat ini:** Snorkeling Sharing **mulai Rp350.000/orang**; Island Tour Barat/Timur **mulai Rp800.000/mobil**. Ini harga penawaran awal, bukan tarif final yang terjamin.

## 9. Mengaktifkan pengiriman dari dashboard (opsional, setelah Anda setuju)

**Jangan lakukan bila ingin nol risiko biaya Meta atau belum memeriksa kebutuhan privasi/izin API.** Menghubungkan inbox tanpa mengaktifkan pengiriman adalah pilihan yang valid.

1. Pastikan WA_ACCESS_TOKEN yang benar telah disimpan sebagai Secret di **marketing-turism-agent**, dan memiliki izin WhatsApp yang diperlukan.
2. Pastikan nomor WhatsApp, registrasi Cloud API, kondisi billing, dan pengaturan pesan Meta sudah siap. Akun bisa memiliki biaya/ketentuan berdasarkan kategori pesan dan negara penerima.
3. Pastikan Anda telah berhasil menerima pesan uji dari nomor lain di inbox dashboard.
4. Baru setelah itu ubah **WA_SEND_ENABLED** dari **false** ke **true** di Cloudflare.
5. Muat ulang Dashboard Agen → WhatsApp, pilih percakapan baru dari guest dalam jendela layanan sekitar **24 jam** setelah pesan guest masuk.
6. Tekan **Buat Draf AI**, periksa hasil, lalu tekan **Kirim Setelah Saya Setujui**.
7. Akan muncul dialog persetujuan. Tekan OK **hanya jika** pesan dan tujuan sudah benar.
8. Hasil **SUBMITTED_TO_META** hanya berarti Meta menerima permintaan pengiriman; **bukan** bukti pesan telah sampai/terbaca oleh tamu.
9. Batas internal backend saat ini: sekitar **6 balasan per nomor per jam**, **50 permintaan per hari**, dan hanya jika percakapan masuk masih berada dalam jendela layanan yang diizinkan. Sistem tidak mengirim otomatis dan tidak membuat kampanye broadcast.

**Kondisi jika gagal:**
- Tombol kirim abu-abu → fitur belum aktif, nomor percakapan belum dipilih, atau WA_SEND_ENABLED belum true.
- HTTP 503 → kredensial WA tidak lengkap / pengiriman sengaja dinonaktifkan.
- HTTP 409 → pesan terakhir terlalu lama (di luar jendela layanan), atau permintaan kirim yang sama pernah dipakai.
- HTTP 429 → batas kirim internal telah tercapai.
- HTTP 502 → permintaan ke Meta tidak dapat dipastikan. **Jangan langsung kirim ulang** tanpa memeriksa status di WhatsApp karena ada kemungkinan pesan sudah diproses.

## 10. Cara memeriksa semuanya bekerja

| Pemeriksaan | Hasil yang benar |
| --- | --- |
| Buka https://marketing-turism-agent.finchat-ai-gateway.workers.dev/ | Website Nusa Penida Experiences terbuka |
| Tekan **Chat WhatsApp** | Membuka chat ke +62 856-1752-525 |
| Tekan **Lihat Katalog WhatsApp** | Membuka katalog WhatsApp Business dari nomor yang sama |
| Dashboard Agen → WhatsApp sebelum aktivasi Meta | Menunjukkan koneksi belum aktif, tetapi template bisa disalin |
| Kirim pesan uji setelah onboarding & webhook valid | Pesan tampil di inbox setelah **Muat Percakapan** |
| Tekan **Buat Draf AI** | Muncul draf untuk ditinjau, tidak otomatis terkirim |
| Tekan **Salin Draf** | Teks siap dikirim manual di WhatsApp Business |
| Kirim melalui dashboard sebelum aktivasi pengiriman | **Diblokir** |
| Kirim sesudah semua prasyarat & persetujuan owner | Status pengajuan ke Meta; periksa hasil nyata di WhatsApp |
| Website booking/form lead | Tetap **nonaktif** sampai persyaratan launch terpisah disetujui |

## 11. Biaya dan alternatif tanpa biaya bulanan

- Tombol WhatsApp dan katalog website **tidak memerlukan** WhatsApp Cloud API: tetap tersedia sekarang.
- Katalog dan aplikasi WhatsApp Business di HP bisa digunakan secara manual, tanpa membayar penyedia SaaS khusus.
- Fondasi Cloudflare Worker/D1 sudah dibuat; kuota penggunaan Cloudflare/Workers AI tetap mengikuti paket akun Anda.
- **Meta Cloud API tidak boleh diasumsikan gratis selamanya.** Pengiriman tertentu, templat, atau onboarding via penyedia solusi dapat memerlukan pembayaran. Periksa ketentuan Meta dan tarif vendor **sebelum** mengaktifkan WA_SEND_ENABLED.
- Jika Anda ingin mempertahankan nomor HP tanpa membayar provider dan Coexistence gratis **tidak tersedia**, gunakan mode sementara **AI membuat draf → Anda salin → kirim sendiri dari WhatsApp Business**. Ini jalur aman untuk usaha yang belum ingin mengeluarkan biaya.
- Jangan memakai robot WhatsApp Web tidak resmi yang meminta scan QR, menyalin cookie sesi, atau berjalan memakai emulator untuk menjalankan pesan massal; risiko gangguan akun dan data tamu tidak sebanding.

## 12. Pertanyaan yang sering muncul

**Apakah saya harus menghapus WhatsApp Business di HP?** **Tidak.** Untuk nomor yang sekarang aktif, jangan lakukan itu. Gunakan jalur Coexistence yang mendukung aplikasi bersama Cloud API, atau tunda dan jalankan balasan manual.

**Apakah nomor harus didaftarkan ke Meta Business?** Untuk Cloud API resmi, nomor serta aset WABA/Meta yang sesuai perlu diotorisasi. Sekadar membuat akun Facebook atau login ke Meta Business **belum** otomatis menghubungkannya.

**Apakah saya perlu kartu kredit?** Bisa bergantung pada alur Meta, profil billing, kategori pesan, penyedia onboarding dan ketentuan saat pendaftaran. Jangan memasukkan metode pembayaran tanpa memahami biayanya.

**Apakah AI bisa membalas otomatis?** Belum. Versi 3.5.0 **hanya menyusun draf**; pemilik membaca serta menyetujui sebelum kirim. Kebijakan ini sengaja menjaga akurasi penawaran dan keamanan data.

**Apakah integrasi akan mengambil chat lama?** Jangan mengasumsikan demikian. Backend saat ini dirancang untuk **pesan teks baru yang diterima webhook** setelah aktivasi, bukan impor riwayat WhatsApp Business dari HP.

**Apakah saya perlu memberikan password atau token kepada ChatGPT?** **Tidak.** Rahasia disimpan sendiri di Cloudflare Worker dengan tipe Secret dan tidak ditulis dalam percakapan.

**Bila saya berhenti di tahap pembuatan Meta Business, apakah website rusak?** Tidak. Tombol chat langsung dan katalog tetap dapat dipakai tanpa Cloud API.

## 13. Referensi resmi untuk verifikasi langkah Meta

- Meta Business Suite: https://business.facebook.com/
- Meta for Developers: https://developers.facebook.com/
- Dokumentasi resmi WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api/overview
- Koleksi API resmi Meta (Postman): https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api
- Dokumentasi Embedded Signup milik Meta (Postman): https://www.postman.com/meta/whatsapp-business-platform/documentation/du6gzjv/embedded-signup
- Cloudflare Workers: https://dash.cloudflare.com/
- Website publik: https://marketing-turism-agent.finchat-ai-gateway.workers.dev/

**Catatan perubahan antarmuka:** tampilan menu Meta dan Cloudflare dapat berubah. Ikuti nama menu yang paling dekat dengan tahap di atas, tetapi **jangan menekan tindakan penghapusan/migrasi nomor hanya karena panduan lebih lama menyebutkannya**. Periksa persyaratan Coexistence pada akun Anda sebelum melanjutkan.
