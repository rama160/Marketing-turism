// Guest-facing ID/EN locale selection. Auto follows browser language (not geolocation or guest identity).
// No external translation provider or visitor profiling; only the language preference is stored.
const englishHome = {
 "hero.eyebrow":"EXPLORE · SNORKEL · DISCOVER",
 "hero.title":"Unforgettable adventures",
 "hero.subtitle":"in Nusa Penida.",
 "hero.description":"Picture turquoise seas, dramatic cliffs and the chance to encounter graceful manta rays in the wild. Discover Nusa Penida through an island escape made for the way you love to travel.",
 "hero.cta":"Explore Experiences ↗",
 "packages.eyebrow":"CURATED EXPERIENCES",
 "packages.title":"Choose the adventure you've been dreaming of",
 "packages.description":"Iconic cliffside views or vibrant underwater wonders? Choose from Sharing and Private options, with schedules and inclusions confirmed before booking.",
 "snorkeling.title":"Nusa Penida Snorkeling",
 "snorkeling.description":"Dive into Nusa Penida's magical underwater world: colorful reefs, tropical fish and the chance to spot manta rays when sea conditions allow.",
 "island.title":"Nusa Penida Island Tours",
 "island.description":"From breathtaking Kelingking cliffs to the beauty of Diamond Beach, pick the scenic island route that fits your perfect getaway.",
 "regions.eyebrow":"MEMORIES WORTH MAKING",
 "regions.title":"Every corner of the island tells a story",
 "regions.description":"Discover the dramatic West, dreamy East beaches or the magical marine world of Nusa Penida. Choose your experience; our team will confirm routes, inclusions and availability with operators.",
 "west.title":"Island Tour West",
 "west.description":"Dramatic cliffs, turquoise horizons and unforgettable photo spots.",
 "east.title":"Island Tour East",
 "east.description":"White-sand beaches and enchanting coastal viewpoints.",
 "contact.eyebrow":"PLAN YOUR JOURNEY",
 "contact.title":"Your island adventure starts here",
 "contact.description":"Have a travel date in mind? Tell us what you're dreaming of and we'll help you explore suitable experiences. This is an enquiry, not a confirmed booking.",
 "contact.notice":"Prices, operators and availability must be verified first. Online payment is not available."
};
Object.assign(englishHome,{
  "snorkelingPage.eyebrow": "SEA ADVENTURE · SHARING & PRIVATE",
  "snorkelingPage.title": "Snorkeling Nusa Penida: Manta Bay, Manta Point & More",
  "snorkelingPage.lead": "Discover Nusa Penida's crystal-blue waters, coral reefs and the chance to see manta rays on guided snorkeling adventures.",
  "snorkelingPage.description": "Sharing three-spot trips have a maximum of 20 guests, subject to confirmed boat capacity. Private three-spot options visit either Manta Bay or Manta Point with different exclusive rates. The other two spots depend on the operator, sea conditions and safety. Manta sightings are never guaranteed.",
  "islandPage.eyebrow": "ISLAND TOUR · SHARING & PRIVATE",
  "islandPage.title": "West & East Nusa Penida Island Tours",
  "islandPage.lead": "Two sides of the island, two unique journeys. Choose dramatic West cliffs or beautiful East beaches, then select Sharing or Private to suit your group and budget.",
  "islandPage.description": "Choose Sharing for the possibility of joining other travelers, or Private for a vehicle exclusively for your group—even solo guests. Up to seven passengers are possible when the vehicle is verified. Final prices and inclusions depend on your date and group size. Snorkeling and island tours are planned for separate days.",
  "westPage.eyebrow": "WEST NUSA PENIDA · SHARING & PRIVATE",
  "westPage.title": "West Nusa Penida Tour",
  "westPage.lead": "Discover iconic cliffs, natural rock arches and beaches that make Nusa Penida unforgettable.",
  "westPage.description": "Discover West Nusa Penida with local operators. The order of stops may change according to road access, weather, available visiting time and your travel preferences. We confirm your route and inclusions before booking.",
  "eastPage.eyebrow": "EAST NUSA PENIDA · SHARING & PRIVATE",
  "eastPage.title": "East Nusa Penida Tour",
  "eastPage.lead": "Discover dramatic white cliffs, hidden bays and breathtaking landscapes on Nusa Penida's east coast.",
  "eastPage.description": "Explore turquoise bays and dramatic limestone cliffs at a comfortable pace. Sharing may include other travelers, while Private reserves a vehicle for your group. Routes and access depend on safe travel conditions."
});
// Additional premium landing-page copy; CMS still overrides curated defaults.
Object.assign(englishHome,{
 "sea.title":"Snorkeling 3 Spots",
 "sea.description":"Discover crystal-clear waters and thriving marine life, with the chance to see manta rays.",
});
Object.assign(englishHome,{"price.snorkeling":"Sharing Rp350,000/person","price.island":"From Rp800,000/car","price.west":"From Rp800,000/car","price.east":"From Rp800,000/car"});
const idDefaults={
  "snorkelingPage.eyebrow": "SEA ADVENTURE · SHARING & PRIVATE",
  "snorkelingPage.title": "Snorkeling Nusa Penida: Manta Bay, Manta Point & Spot Pilihan",
  "snorkelingPage.lead": "Jelajahi warna biru laut Nusa Penida, terumbu karang, dan peluang melihat pari manta dalam pengalaman snorkeling berpemandu.",
  "snorkelingPage.description": "Sharing 3 spot memiliki batas grup maksimal 20 guest dan mengikuti kapasitas kapal operator nyata. Private 3 spot tersedia dengan pilihan Manta Bay atau Manta Point, masing-masing berharga paket eksklusif yang berbeda. Lokasi 2 spot lainnya ditentukan bersama operator sesuai keselamatan, cuaca dan kondisi laut; manta tidak dijamin muncul.",
  "islandPage.eyebrow": "ISLAND TOUR · SHARING & PRIVATE",
  "islandPage.title": "Island Tour Barat dan Timur Nusa Penida",
  "islandPage.lead": "Dua sisi pulau, dua karakter perjalanan. Pilih pesona tebing Barat atau kecantikan pantai Timur, lalu tentukan Sharing atau Private sesuai kebutuhan dan budget Anda.",
  "islandPage.description": "Pilih Sharing untuk kemungkinan bergabung dengan tamu lain, atau Private untuk perjalanan dengan kendaraan khusus grup Anda, termasuk jika bepergian sendiri. Kapasitas maksimal tujuh orang mengikuti kendaraan yang telah diverifikasi. Harga dan fasilitas dikonfirmasi berdasarkan tanggal serta jumlah peserta. Snorkeling dan island tour dijadwalkan pada hari yang berbeda.",
  "westPage.eyebrow": "WEST NUSA PENIDA · SHARING & PRIVATE",
  "westPage.title": "Wisata Barat Nusa Penida",
  "westPage.lead": "Temukan tebing ikonik, lengkungan batu alami, dan pantai yang membuat Nusa Penida tak terlupakan.",
  "westPage.description": "Jelajahi Barat Nusa Penida bersama operator lokal. Urutan destinasi dapat berubah mengikuti akses jalan, cuaca, waktu kunjungan, dan pilihan tamu. Kami akan mengonfirmasi rute dan fasilitas sebelum pemesanan.",
  "eastPage.eyebrow": "EAST NUSA PENIDA · SHARING & PRIVATE",
  "eastPage.title": "Wisata Timur Nusa Penida",
  "eastPage.lead": "Sisi timur menawarkan lanskap tebing putih, teluk tersembunyi, dan panorama yang terasa seperti lukisan.",
  "eastPage.description": "Nikmati teluk biru dan tebing kapur yang memesona. Sharing dapat bergabung dengan wisatawan lain, sedangkan Private menyediakan kendaraan khusus untuk grup Anda. Rute dan akses disesuaikan dengan keselamatan perjalanan."
};
Object.assign(idDefaults,{
 "hero.eyebrow":"EXPLORE · SNORKEL · DISCOVER",
 "hero.title":"Liburan tak terlupakan",
 "hero.subtitle":"di Nusa Penida.",
 "hero.description":"Bayangkan birunya laut, megahnya tebing, dan kesempatan bertemu pari manta di habitat alaminya. Jelajahi keindahan Nusa Penida dalam perjalanan yang dirancang sesuai gaya liburan Anda.",
 "hero.cta":"Jelajahi Pengalaman ↗",
 "packages.title":"Pilih petualangan yang paling Anda impikan",
 "packages.description":"Berburu panorama tebing ikonik atau menjelajahi keindahan bawah laut? Nikmati opsi Sharing dan Private, dengan jadwal serta fasilitas yang dikonfirmasi sebelum pemesanan.",
 "regions.title":"Setiap sudut pulau, cerita yang berbeda",
 "regions.description":"Temukan panorama ikonik di Barat, pesona pantai di Timur, atau keajaiban bawah laut Nusa Penida. Pilih pengalaman favorit Anda; detail rute dan fasilitas akan dikonfirmasi bersama operator."
});
Object.assign(idDefaults,{"price.snorkeling":"Sharing Rp350.000/orang","price.island":"Mulai Rp800.000/mobil","price.west":"Mulai Rp800.000/mobil","price.east":"Mulai Rp800.000/mobil"});
const englishText = {
 "Paket":"Experiences","Hubungi":"Enquire","Dashboard agen":"Agent dashboard","Beranda":"Home",
 "Snorkeling 3 spot atau island tour dengan operator lokal. Pilih tanggal, jumlah peserta, dan sampaikan kebutuhan Anda. Tim kami akan mengonfirmasi fasilitas, ketersediaan, dan harga.":"Discover snorkeling or island tours with local operators. We confirm arrangements, availability and prices before booking.",
 "Sharing max. 20 · Private Manta Bay/Point":"Sharing max. 20 · Private Manta Bay/Point",
 "Barat / Timur · Sharing & Private":"West / East · Sharing & Private",
 "Detail snorkeling 3 spot ↗":"Explore three-spot snorkeling ↗","Lihat pilihan Barat & Timur ↗":"Explore East & West ↗",
 "Wisata Barat":"West Nusa Penida","Wisata Timur":"East Nusa Penida",
 "Lihat foto dan lokasi Barat →":"Explore West photos and places →","Lihat foto dan lokasi Timur →":"Explore East photos and places →",
 "Merek sementara Nusa Penida Experiences. Harga dan slot operator harus dikonfirmasi sebelum pembayaran.":"Nusa Penida Experiences is a trading name. Operator availability and prices require confirmation before payment.",
 "Nama guest":"Guest name","Nomor WhatsApp / email":"WhatsApp number / email","Aktivitas":"Activity","Jenis perjalanan":"Travel type",
 "Rute / spot pilihan":"Preferred route / spot","Jumlah peserta":"Number of guests","Tanggal aktivitas":"Activity date","Pesan (opsional)":"Message (optional)",
 "Sharing — boleh dicampur guest lain":"Sharing — may include other guests",
 "Private — eksklusif, mulai 1 orang":"Private — exclusive, from 1 guest",
 "Kirim permintaan":"Send enquiry",
 "Saya setuju dihubungi untuk menanggapi permintaan ini dan telah membaca":"I agree to be contacted about this enquiry and have read",
 "Informasi Privasi":"Privacy information","Ketentuan Layanan":"Terms of service","Kebijakan Pembatalan (Draf)":"Cancellation policy (draft)",
 "Pengiriman lead akan tersedia setelah pemilik mengaktifkan layanan.":"Enquiries are disabled until the owner enables the service.",
 "Privasi":"Privacy","Ketentuan":"Terms","Pembatalan":"Cancellation",
 "Permintaan tidak menjamin ketersediaan aktivitas. Pembayaran hanya setelah penawaran terverifikasi.":"An enquiry does not guarantee availability. Payment is requested only after a verified quotation.",
 "Jelajahi Barat":"Explore West","Jelajahi Timur":"Explore East","Spot Snorkeling":"Snorkeling spots",
 "Lihat formulir permintaan perjalanan →":"Open the trip enquiry form →",
 "Formulir publik belum diaktifkan sampai informasi bisnis dan ketentuan final siap.":"The enquiry form remains disabled until business details and policies are ready.",
 "Formulir guest belum aktif sampai persyaratan bisnis final dan perlindungan data selesai.":"Guest enquiries remain disabled until business and privacy requirements are complete.",
 "Dokumentasi foto berlisensi Creative Commons; klik kredit pada setiap foto.":"Photography is licensed under Creative Commons; view photo credits on each image.",
 "Snorkeling Nusa Penida: Manta Bay, Manta Point & Spot Pilihan":"Nusa Penida Snorkeling: Manta Bay, Manta Point & Other Spots",
 "Jelajahi warna biru laut Nusa Penida, terumbu karang, dan peluang melihat pari manta dalam pengalaman snorkeling berpemandu.":"Explore Nusa Penida's blue waters, coral reefs and a chance to see manta rays on a guided snorkeling trip.",
 "Sharing 3 spot memiliki batas grup maksimal 20 guest dan mengikuti kapasitas kapal operator nyata. Private 3 spot tersedia dengan pilihan Manta Bay atau Manta Point, masing-masing berharga paket eksklusif yang berbeda. Lokasi 2 spot lainnya ditentukan bersama operator sesuai keselamatan, cuaca dan kondisi laut; manta tidak dijamin muncul.":"Sharing three-spot trips have a maximum of 20 guests subject to verified boat capacity. Private three-spot options cover Manta Bay or Manta Point, with different exclusive package rates. The two other spots depend on the operator, sea conditions and safety; manta sightings are never guaranteed.",
 "Kenali spot snorkeling":"Explore our snorkeling spots",
 "Bayangkan berenang di perairan biru Nusa Penida sambil mengamati kehidupan laut yang menakjubkan. Pari manta kadang terlihat, tetapi penampakan tidak dapat dijanjikan; spot ditentukan oleh arus dan kondisi laut.":"Imagine swimming in Nusa Penida's blue waters and discovering amazing marine life. Manta rays are sometimes seen but never guaranteed; currents and weather determine the snorkeling spots.",
 "Perairan lepas dekat tebing selatan yang dikenal sebagai habitat pari manta. Sensasi laut terbuka menghadirkan pengalaman istimewa, namun gelombang dan arus bisa kuat sehingga keputusan berangkat berada pada kapten/operator.":"Open waters near the southern cliffs are known as manta habitat. Waves and currents can be strong, so the captain and operator decide whether a trip is safe.",
 "Pantai dan perairan dengan panorama menawan; ketika cuaca serta visibilitas baik, kawasan ini dapat menawarkan pengalaman menikmati dunia bawah laut yang berwarna. Pilihan masuk air tetap berdasarkan arahan operator.":"A scenic bay where favorable sea conditions can reveal colorful marine life. Entering the water is always subject to the operator's guidance.",
 "Gamat Bay dan perairan karang":"Gamat Bay and coral waters",
 "Di kawasan terumbu yang sehat, warna karang dan ikan tropis menjadi daya tarik utama. Gamat Bay dapat menjadi opsi spot jika aman dan masuk rute operator; dokumentasi foto ini menggambarkan terumbu Nusa Penida secara umum.":"Colorful corals and tropical fish are highlights of healthy reef environments. Gamat Bay may be included when safe and confirmed by the operator; the photo illustrates Nusa Penida reefs generally.",
 "Wisata Barat Nusa Penida":"West Nusa Penida Tour",
 "Temukan tebing ikonik, lengkungan batu alami, dan pantai yang membuat Nusa Penida tak terlupakan.":"Discover dramatic cliffs, natural rock arches and beaches that make Nusa Penida unforgettable.",
 "Jelajahi pesona barat bersama operator lokal. Urutan lokasi dapat berubah mengikuti kondisi jalan, cuaca, waktu kunjungan, dan pilihan guest. Sharing maupun Private memakai kalkulasi aman biaya kendaraan penuh saat kursi lain belum dikonfirmasi.":"Explore West Nusa Penida with local operators. Stops may change with roads, weather, timing and guest preferences. Sharing and Private pricing both account for the full vehicle cost until other seats are confirmed.",
 "Sorotan wisata Barat":"West coast highlights",
 "Tebing ikonik menyerupai T-Rex dan gradasi laut biru yang begitu fotogenik. Nikmati panorama dari titik pandang aman; turun ke pantai bukan bagian wajib dan memerlukan penilaian kondisi jalur.":"An iconic T-Rex-shaped cliff above turquoise seas. Enjoy the viewpoint safely; descending to the beach is optional and depends on trail conditions.",
 "Lengkungan batu raksasa memeluk sebuah teluk bundar—pemandangan unik yang terasa seperti karya seni alam. Area tebing cocok untuk menikmati panorama dan foto dari batas aman.":"A striking stone arch frames a circular bay. Enjoy views and photos from safe lookout areas.",
 "Kolam batu alami di tepi Samudra Hindia menghadirkan warna hijau kebiruan yang kontras dengan tebing. Prioritaskan melihat dari area aman, bukan berenang, karena ombak bisa datang tiba-tiba.":"Natural rock pools near the Indian Ocean contrast with rugged cliffs. Observe from safe areas; swimming is unsafe when unpredictable waves arrive.",
 "Pantai dengan hamparan pasir dan pepohonan yang cocok untuk menikmati suasana santai setelah menjelajah tebing barat. Aktivitas air hanya bila kondisi memungkinkan dan disetujui pemandu.":"A sandy, tree-lined beach for a relaxing stop after exploring West Nusa Penida. Water activities depend on conditions and guide approval.",
 "Wisata Timur Nusa Penida":"East Nusa Penida Tour",
 "Sisi timur menawarkan lanskap tebing putih, teluk tersembunyi, dan panorama yang terasa seperti lukisan.":"The east offers white cliffs, hidden bays and picture-perfect scenery.",
 "Rasakan kontras lautan turquoise dan tebing kapur, dengan waktu singgah menyesuaikan akses serta keselamatan. Sharing dapat dicampur guest lain, sedangkan Private untuk satu grup eksklusif—even satu tamu—jika biaya operator tertutup.":"Enjoy turquoise seas and limestone cliffs. Stops are adjusted for access and safety. Sharing may combine guests; Private is exclusive for one group, including solo travelers, when all operator costs are covered.",
 "Sorotan wisata Timur":"East coast highlights",
 "Bibir tebing putih yang dramatis, batu karang menjulang, dan laut berwarna turquoise menjadi salah satu pemandangan paling memukau di sisi timur. Tangga menuju pantai curam—keamanan didahulukan.":"Dramatic white cliffs, rugged rocks and turquoise water. The stairs to the beach are steep, so safety comes first.",
 "Teluk berpasir cerah yang dikelilingi bukit dan formasi batu unik. Keindahannya terasa semakin berkesan dari titik pandang tinggi; perjalanan turun hanya sesuai kondisi fisik dan jalur.":"A bright sandy bay surrounded by hills and unique rock formations. Enjoy the views from above; the descent depends on trail conditions and fitness.",
 "Rumah Pohon & panorama tebing timur":"Tree House & East cliff views",
 "Rasakan sensasi berdiri di tengah panorama pulau dan jajaran tebing yang megah. Foto rumah pohon adalah dokumentasi kawasan Nusa Penida; akses dan lokasi persis akan ditentukan operator.":"Take in sweeping island panoramas and dramatic cliffs. The Tree House image documents the region; exact access and location must be confirmed by the operator.",
 "Island Tour Barat dan Timur Nusa Penida":"West & East Nusa Penida Island Tours",
 "Dua sisi pulau, dua karakter perjalanan. Pilih pesona tebing Barat atau kecantikan pantai Timur, lalu tentukan Sharing atau Private sesuai kebutuhan dan budget Anda.":"Two sides of the island, two distinct journeys. Choose West cliffs or East beaches, then select Sharing or Private for your group and budget.",
 "Dengan":"With","memberikan mobil eksklusif sejak 1 guest sampai maksimum 7 penumpang jika kapasitas kendaraan terverifikasi. Snorkeling dan island tour harus dilakukan pada hari yang berbeda.":"provides an exclusive vehicle for one to seven guests, subject to verified vehicle capacity. Snorkeling and island tours are arranged on separate days.",
 "Panorama ikonik Kelingking, lengkungan alami Broken Beach, warna Angel’s Billabong, dan suasana santai Crystal Bay.":"Kelingking views, Broken Beach's natural arch, Angel’s Billabong and the tranquil Crystal Bay.",
 "Tebing Diamond Beach, teluk Atuh Beach, dan panorama Rumah Pohon yang membuat sisi timur terasa magis.":"Diamond Beach cliffs, Atuh Bay and picturesque Tree House viewpoints.",
 "Lihat 4 destinasi & foto Barat →":"See four West destinations and photos →",
 "Lihat 3 destinasi & foto Timur →":"See three East destinations and photos →",
 "Sharing atau Private? Anda yang memilih.":"Sharing or Private? You choose.",
 "Sharing dapat digabung dengan guest lain; Private tetap bisa untuk 1 guest setelah harga mencakup seluruh biaya operator dan keuntungan minimum agen.":"Sharing may include other guests. Private is possible even for solo travelers once operator costs and the agency's minimum margin are covered.",
 "Jadwal, ketersediaan, pilihan spot, keamanan, kapasitas, dan fasilitas harus dikonfirmasi sebelum pembayaran.":"Schedules, availability, spots, safety, capacity and inclusions must be verified before payment.",
 "Biaya tambahan dan keselamatan":"Extras and safety",
 "Ajukan permintaan perjalanan →":"Request a trip quote →",
 "Nusa Penida Experiences · Informasi wisata":"Nusa Penida Experiences · Travel information"
};

Object.assign(englishText,{
 "PERSIAPAN LAYANAN": "SERVICE PREPARATION",
 "DRAF · BELUM DISETUJUI UNTUK TRANSAKSI": "DRAFT · NOT APPROVED FOR TRANSACTIONS",
 "Privasi — Nusa Penida Experiences": "Privacy — Nusa Penida Experiences",
 "Ketentuan — Nusa Penida Experiences": "Terms — Nusa Penida Experiences",
 "Kebijakan Pembatalan (Draf) — Nusa Penida Experiences": "Cancellation Policy (Draft) — Nusa Penida Experiences",
 "Informasi Privasi": "Privacy information",
 "Status:": "Status:",
 "ini adalah pemberitahuan sementara untuk aplikasi pilot. Identitas badan usaha dan alamat kontak penanggung jawab belum dipublikasikan; formulir penerimaan guest dinonaktifkan hingga data tersebut lengkap.": "this is a provisional notice for a pilot service. Verified legal business identity and responsible contact details have not yet been published, and guest enquiries are disabled until this information is complete.",
 "Data yang diproses setelah layanan diaktifkan": "Data processed after service activation",
 "Nama, kontak, jumlah peserta, aktivitas, tanggal yang diminati, pesan, persetujuan untuk dihubungi, serta sumber kampanye bila relevan. Data digunakan untuk menjawab permintaan, mempersiapkan penawaran, melakukan booking dengan operator yang dipilih, dan mencatat administrasi terkait.": "Name, contact information, number of guests, selected activity, preferred date, message, permission to contact and campaign source where applicable. This information is used to respond to enquiries, prepare quotations, arrange operator bookings and maintain necessary records.",
 "Penyimpanan dan berbagi": "Storage and sharing",
 "Data disimpan pada Cloudflare D1 proyek Nusa Penida Experiences, dengan akses pemilik yang dibatasi. Detail guest yang diperlukan untuk menjalankan layanan dapat diserahkan kepada mitra operator berdasarkan persetujuan dan kebutuhan booking. Data tidak dijual untuk pemasaran pihak ketiga. Periode retensi, kontak permintaan akses/penghapusan dan prosedur penanganan insiden akan diumumkan sebelum penerimaan guest dibuka.": "Data is stored in the dedicated Nusa Penida Experiences Cloudflare D1 database with restricted owner access. Details needed to provide an experience may be shared with a partner operator where necessary and with appropriate consent. Data is not sold for third-party marketing. Retention periods, contact details for access/deletion requests and incident procedures will be published before guest enquiries open.",
 "Hak dan pilihan": "Your rights and choices",
 "Guest berhak menolak memberikan data; tanpa informasi yang cukup permintaan mungkin tidak dapat diproses. Setelah kontak resmi usaha tersedia, pemohon dapat meminta akses, koreksi atau penghapusan sesuai hukum yang berlaku dan kewajiban pencatatan transaksi.": "You may decline to provide your information; without enough details we may be unable to respond. Once the official business contact is available, you may request access, correction or deletion in accordance with applicable law and transaction record obligations.",
 "Jangan kirim data pribadi melalui halaman ini sebelum formulir resmi dinyatakan aktif.": "Do not submit personal data through this site until the official enquiry form has been enabled.",
 "Kembali ke halaman utama": "Back to homepage",
 "Informasi perlu dilengkapi sebelum penjualan publik.": "The information must be completed before public sales.",
 "Ketentuan Layanan": "Terms of service",
 "Nusa Penida Experiences bertindak sebagai perantara pemesanan aktivitas Nusa Penida melalui mitra operator. Saat ini situs berada pada tahap pilot; belum merupakan saluran pemesanan dan pembayaran otomatis yang aktif.": "Nusa Penida Experiences assists with booking island activities delivered by local operators. This website is currently a pilot, not an active automated booking or payment service.",
 "Penawaran dan pemesanan": "Quotations and bookings",
 "Setiap penawaran bergantung pada tanggal, kapasitas kendaraan/kapal, cuaca, fasilitas, harga net aktual dan persetujuan operator. Permintaan informasi bukan booking yang pasti. Snorkeling dan island tour disediakan sebagai aktivitas berbeda dan tidak dilakukan pada hari yang sama.": "All quotations depend on the date, confirmed boat or vehicle capacity, weather, inclusions, actual supplier costs and operator approval. An enquiry is not a confirmed booking. Snorkeling and island tours are separate activities and are not combined on the same day.",
 "Pembayaran, perubahan, dan pembatalan": "Payments, changes and cancellations",
 "Jangan mengirim dana sebelum menerima penawaran resmi, identitas penerima yang terverifikasi serta ketentuan yang disetujui. Kebijakan refund, perubahan tanggal, waktu pengembalian dan penanganan situasi cuaca akan diterbitkan sebelum transaksi publik dibuka. Pembayaran dan refund saat ini memerlukan pemeriksaan manusia terhadap dana nyata.": "Do not transfer money before receiving an official quotation, verified payee details and agreed terms. Refunds, date changes, processing times and weather-related arrangements will be published before public transactions open. Payments and refunds require human verification of actual transfers.",
 "Keselamatan": "Safety",
 "Perjalanan laut dan darat mengikuti ketentuan keselamatan serta keputusan operator resmi di lapangan. Tidak ada jaminan spot, kondisi cuaca, atau jam keberangkatan tanpa konfirmasi operator.": "Marine and road activities follow safety requirements and the operator's decisions on site. Destinations, sea/weather conditions and departure times are never guaranteed without operator confirmation.",
 "Lihat": "See",
 "rancangan kebijakan pembatalan bertingkat": "the draft tiered cancellation policy",
 ". Ketentuan tersebut masih membutuhkan persetujuan dan tidak otomatis berlaku untuk transaksi.": ". These terms are pending approval and do not automatically apply to transactions.",
 "Ketentuan akan dilengkapi sebelum transaksi nyata.": "These terms will be completed before real transactions begin.",
 "Kebijakan Pembatalan Wisata": "Tour cancellation policy",
 "Ketentuan berikut adalah rancangan untuk pembatalan sukarela oleh guest. Ketentuan final harus dibacakan/diberikan sebelum pembayaran dan memerlukan persetujuan guest, verifikasi operator, serta pemeriksaan kesesuaiannya dengan hukum perlindungan konsumen.": "The following is a proposed policy for voluntary guest cancellations. Final terms must be provided before payment and require guest consent, operator verification and a review for compliance with consumer protection law.",
 "Waktu pembatalan": "Cancellation timing",
 "Potongan usulan": "Proposed deduction",
 "Estimasi kembali": "Estimated return",
 "H-7 atau lebih": "7+ days before",
 "H-6 sampai H-3": "6 to 3 days before",
 "H-2 sampai H-1": "2 to 1 days before",
 "Hari H atau no-show": "Activity day / no-show",
 "H dihitung berdasarkan tanggal aktivitas dalam zona waktu Bali. Permintaan yang disetujui sebelum perjalanan dibedakan dari tidak hadir tanpa pemberitahuan. Nominal yang dihitung mesin adalah estimasi, bukan pemotongan sepihak atau bukti refund sudah ditransfer.": "Cancellation dates are calculated using Bali local time. An agreed pre-trip request is treated differently from an unannounced no-show. Software calculations are estimates, not unilateral deductions or proof that a refund has been transferred.",
 "Perlindungan guest dan kondisi khusus": "Guest protection and special circumstances",
 "Jika aktivitas tidak dapat diselenggarakan karena pembatalan operator, situasi keselamatan yang tidak memungkinkan, atau layanan tidak tersedia, guest ditawari penjadwalan ulang atau peninjauan pengembalian penuh sesuai ketentuan hukum dan kesepakatan yang berlaku. Kegagalan layanan tidak otomatis dikenai penalti pembatalan sukarela. Biaya vendor yang sudah dibayarkan tidak boleh dipakai untuk mengalihkan seluruh tanggung jawab tanpa dasar yang sah.": "If an activity cannot proceed due to operator cancellation, unsafe conditions or unavailable services, guests will be offered rescheduling or a review for a full refund under applicable law and agreed terms. A service failure does not automatically trigger voluntary-cancellation penalties. Paid supplier expenses do not by themselves justify shifting all liability to the guest.",
 "Pembayaran dan refund": "Payments and refunds",
 "Pembayaran yang dipersiapkan adalah transfer bank setelah penawaran resmi. QRIS belum tersedia. Pengembalian dana dilakukan oleh pemilik usaha setelah pemeriksaan transaksi sebenarnya, tidak diproses otomatis oleh AI. Potongan dan pengembalian aktual diinformasikan secara tertulis kepada guest.": "The planned payment method is bank transfer after an official quotation. QRIS is unavailable. The business owner handles refunds after checking real transaction records; AI does not send funds. Actual deductions and refunds are confirmed to the guest in writing.",
 "Belum berlaku untuk penjualan publik sampai identitas bisnis, aturan refund final, dan kontrak operator disetujui. Penawaran existing tidak boleh diubah sepihak.": "Not yet applicable to public sales until the business identity, final refund terms and operator contracts have been approved. Existing quotations cannot be changed unilaterally.",
 "Kembali": "Back",
 "Konfirmasi ketentuan sebelum pembayaran.": "Confirm all terms before payment.",
 "Nusa Penida Experiences (merek sementara)": "Nusa Penida Experiences (trade name)",
 "Kapasitas maksimal tujuh guest sesuai kendaraan yang diverifikasi. Sharing tetap memperhitungkan biaya satu mobil penuh sampai seluruh peserta dan biaya terkunci. Tidak termasuk lunch dan transport fast boat. Titik foto/akses Rumah Pohon wajib dikonfirmasi agar tidak menjanjikan akses yang belum termasuk.": "Maximum capacity is seven guests on a verified vehicle. Sharing quotations cover the full vehicle cost until participants and costs are confirmed. Lunch and fast boat transport are extra. Tree House viewpoint access must be confirmed; unapproved access cannot be promised.",
 "Foto: hak cipta fotografer masing-masing melalui Wikimedia Commons.": "Photos: copyright belongs to the credited photographers via Wikimedia Commons.",
 "Dengan": "With",
 "memberikan mobil eksklusif sejak 1 guest sampai maksimum 7 penumpang jika kapasitas kendaraan terverifikasi. Snorkeling dan island tour harus dilakukan pada hari yang berbeda.": "provides an exclusive car for one to seven guests, subject to verified safe capacity. Snorkeling and island tours take place on different days.",
 "SEA ADVENTURE · SHARING & PRIVATE": "SEA ADVENTURE · SHARING & PRIVATE",
 "· Ilustrasi snorkeling bersama manta di perairan Nusa Penida": "· Illustration of manta snorkeling in Nusa Penida waters",
 "· Dokumentasi manta dari wilayah Manta Point, bukan jaminan penampakan": "· Manta documentation from the Manta Point area; sightings are not guaranteed",
 "· Foto pantai Crystal Bay, bukan kondisi terumbu hari ini": "· Crystal Bay beach photograph; not today's reef conditions",
 "· Foto ilustrasi terumbu Nusa Penida, bukan foto terverifikasi Gamat Bay": "· Illustrative Nusa Penida reef photo; not a verified photo of Gamat Bay",
 "Nusa Penida Experiences · Pilot": "Nusa Penida Experiences · Pilot"
});
Object.assign(englishText,{
 "Beranda":"Home","Paket Wisata":"Island Tours","Destinasi":"Destinations","Tentang Kami":"About Us",
 "Rencanakan Liburan ↗":"Plan Your Escape ↗","Rencanakan Liburan →":"Plan Your Escape →",
 "Island Tour Barat & Timur":"West & East Island Tours","Snorkeling & Manta":"Snorkeling & Manta Rays",
 "Jelajahi bersama operator lokal":"Explore with local operators",
 "Temukan petualangan laut ↗":"Discover snorkeling ↗","Lihat wisata pulau ↗":"Explore island tours ↗",
 "PENGALAMAN PILIHAN":"CURATED EXPERIENCES",
 "Foto:":"Photo:","Aktivitas dan penampakan manta bergantung kondisi alam.":"Activities and manta encounters depend on nature and conditions.",
 "Lihat tur ↗":"Explore Tour ↗","TEMPAT YANG SELALU INGIN DIKENANG":"MEMORIES WORTH MAKING",
 "YOUR ISLAND, YOUR STORY":"YOUR ISLAND, YOUR STORY",
 "Perjalanan yang terasa lebih personal":"A journey that's uniquely yours",
 "Setiap perjalanan punya cerita. Jelajahi sisi terbaik Nusa Penida melalui pilihan wisata darat dan snorkeling yang dapat disesuaikan dengan kebutuhan Anda.":"Every trip tells a story. Discover the very best of Nusa Penida with island tours and snorkeling options shaped around your plans.",
 "Kami mengutamakan informasi yang jelas: pilihan rute, kapasitas, keselamatan, dan penawaran baru dikonfirmasi setelah operator serta kondisi aktivitas diperiksa. Pertemuan dengan manta merupakan pengalaman alam yang tidak dapat dijamin.":"Your safety and clarity matter. Routes, capacity, activities and quotations are confirmed after checking with operators and local conditions. Manta sightings are a wild encounter and cannot be guaranteed.",
 "Mari wujudkan cerita liburan Anda":"Your island adventure starts here",
 "Sudah punya tanggal perjalanan? Ceritakan pengalaman yang Anda impikan; kami akan membantu menyiapkan informasi paket dan pilihan yang sesuai. Form ini merupakan permintaan informasi, bukan booking terkonfirmasi.":"Have a travel date in mind? Tell us what you're dreaming of and we'll help you explore suitable experiences. This is an enquiry, not a confirmed booking.",
 "Nusa Penida Experiences membantu Anda merencanakan perjalanan. Harga, fasilitas, dan slot operator dikonfirmasi sebelum pemesanan.":"Nusa Penida Experiences helps plan your escape. Prices, inclusions and availability are verified before booking."
});
Object.assign(englishText,{
 "Harga yang ditampilkan merupakan penawaran mulai dan belum mengikat. Ketersediaan, jumlah peserta, fasilitas, cuaca, dan biaya tambahan dikonfirmasi sebelum pemesanan. Snorkeling Private: minta penawaran sesuai spot.": "Displayed prices are starting offers, not final quotations. Availability, group size, inclusions, weather, and extras must be confirmed before booking. For Private snorkeling, request a quote for your preferred spot.",
 "Pilih Sharing untuk berkesempatan bergabung dengan wisatawan lain, atau Private untuk pengalaman eksklusif, termasuk perjalanan seorang diri.": "Choose Sharing to potentially join other travelers or Private for an exclusive escape, including solo journeys.",
 "Wisata Barat dan Timur ditawarkan sebagai rute terpisah. Kapasitas kendaraan mengikuti tempat duduk aman yang diverifikasi, maksimal tujuh tamu. Harga yang ditampilkan di beranda adalah harga mulai per mobil; makan siang dan tiket fast boat belum otomatis termasuk.": "West and East are separate tour routes. Vehicle capacity is subject to verified safe seating, with up to seven guests. Homepage prices start per vehicle; lunch and fast boat tickets are additional.",
 "Kapasitas kendaraan maksimal tujuh tamu jika telah dikonfirmasi aman. Harga mulai per mobil dapat dilihat pada kartu foto beranda; makan siang dan fast boat belum termasuk. Akses ke titik foto Rumah Pohon akan diperiksa bersama operator agar fasilitas yang ditawarkan sesuai kondisi di lapangan.": "Vehicles carry up to seven guests only with verified safe seating. Starting prices per vehicle appear on the homepage photo cards; lunch and fast boat tickets are extra. Tree House viewpoints and access are confirmed with the operator.",
 "Harga promosi wisata darat ditampilkan pada kartu foto di beranda. Makan siang, tiket fast boat, biaya masuk destinasi bila berlaku, dan layanan tambahan belum otomatis termasuk. Kami akan memastikan rute, kapasitas kendaraan, fasilitas, cuaca, serta ketersediaan operator sebelum memberikan penawaran akhir.": "Island tour starting prices are displayed on homepage photo cards. Lunch, fast boat transfers, applicable entrance fees and other extras are not automatically included. Routes, safe capacity, weather, inclusions and operator availability are verified before we issue a final quotation."
});

Object.assign(englishHome,{
 "whatsapp.eyebrow":"DIRECT CONTACT",
 "whatsapp.heading":"Dreaming of Nusa Penida? Let's talk on WhatsApp.",
 "whatsapp.description":"Share your travel dates, group size, and preferred experiences. Our team can explain available tours and check availability. No automatic booking or payment.",
 "whatsapp.disclaimer":"Prices, activities and schedules are confirmed before booking."
});
Object.assign(idDefaults,{
 "whatsapp.eyebrow":"KONTAK LANGSUNG",
 "whatsapp.heading":"Punya rencana liburan? Chat kami di WhatsApp.",
 "whatsapp.description":"Ceritakan tanggal perjalanan, jumlah tamu, dan paket favorit Anda. Tim kami akan membantu menjelaskan pilihan tur serta mengecek ketersediaan. Tidak ada pemesanan atau pembayaran otomatis.",
 "whatsapp.disclaimer":"Penawaran, spot, dan jadwal dikonfirmasi sebelum booking."
});
Object.assign(englishText,{
 "Chat WhatsApp":"Chat on WhatsApp",
 "Chat via WhatsApp ↗":"Chat on WhatsApp ↗",
 "Lihat Katalog WhatsApp":"View WhatsApp Catalog",
 "WhatsApp Business:":"WhatsApp Business:",
 "Kontak Kami ↗":"Contact Us ↗"
});
const originalNodes=[];
const originals={};
for(const node of document.querySelectorAll("[data-copy]"))originals[node.dataset.copy]=node.textContent.trim();
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
for(let n; (n=walker.nextNode());){
 const el=n.parentElement;
 if(!el||el.closest("#adminArea,[data-copy],script,style,select#languageChoice"))continue;
 const source=n.nodeValue;
 if(source.trim())originalNodes.push([n,source]);
}
const storedMode=localStorage.getItem("npe-language")||"auto";
let mode=["auto","id","en"].includes(storedMode)?storedMode:"auto",current="id";
const detect=()=>/^(id|in)(-|$)/i.test(navigator.languages?.[0]||navigator.language||"")?"id":"en";
const saved=new Map();
async function load(lang){
 if(saved.has(lang))return saved.get(lang);
 try{
  const response=await fetch("/api/public/site-content?lang="+lang,{cache:"no-store"});
  if(!response.ok)throw Error("CMS unavailable");
  const payload=await response.json();
  const values=payload?.items&&typeof payload.items==="object"?payload.items:{};
  saved.set(lang,values);
  return values;
 }catch{return {}}
}
const picker=document.createElement("label");
picker.className="languagePicker";
picker.setAttribute("aria-label","Language / Bahasa");
picker.innerHTML='<span>🌐</span><select id="languageChoice" aria-label="Language / Bahasa"><option value="auto">Auto</option><option value="id">Bahasa Indonesia</option><option value="en">English</option></select>';
document.querySelector(".top nav")?.prepend(picker);
const select=picker.querySelector("select");
if(select)select.value=mode;
const idTitle=document.title;
async function apply(){
 const lang=mode==="auto"?detect():mode;
 current=lang;
 document.documentElement.lang=lang;
 for(const [node,source] of originalNodes){
  const trim=source.trim();
  const translated=lang==="en"?(englishText[trim]||trim):trim;
  node.nodeValue=source.replace(trim,translated);
 }
 const message=lang==="en"
  ?"Hello Nusa Penida Experiences, I would like to ask about Island Tours or Snorkeling. Can you help?"
  :"Halo Nusa Penida Experiences, saya ingin informasi Island Tour atau Snorkeling. Bisa bantu?";
 for(const link of document.querySelectorAll("[data-whatsapp-chat]"))link.href="https://wa.me/628561752525?text="+encodeURIComponent(message);
 const translations=await load(lang);
 for(const el of document.querySelectorAll("[data-copy]")){
  const key=el.dataset.copy;
  el.textContent=typeof translations[key]==="string"?translations[key]:(lang==="en"?englishHome[key]||originals[key]:originals[key]);
 }
 if(document.querySelector("[data-copy]"))document.title=lang==="en"?"Nusa Penida Experiences | Snorkeling & Island Tours":idTitle;
 else document.title=lang==="en"?(englishText[idTitle]||idTitle):idTitle;
 window.dispatchEvent(new CustomEvent("npe:language",{detail:{language:lang,mode}}));
}
if(select)select.onchange=()=>{mode=select.value;localStorage.setItem("npe-language",mode);apply();};
window.NusaLanguage={get language(){return current;},get mode(){return mode;},defaults:(lang)=>lang==="en"?englishHome:{...idDefaults,...originals},resetCache:()=>saved.clear(),apply};
await apply();
