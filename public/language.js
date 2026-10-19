// Guest-facing ID/EN locale selection. Auto follows browser language (not geolocation or guest identity).
// No external translation provider or visitor profiling; only the language preference is stored.
const fields = [
 ["hero.eyebrow","Hero label"],["hero.title","Hero title"],["hero.subtitle","Hero subtitle"],["hero.description","Hero introduction"],["hero.cta","Hero action"],
 ["packages.eyebrow","Experiences label"],["packages.title","Experiences heading"],["packages.description","Experiences introduction"],
 ["snorkeling.title","Snorkeling title"],["snorkeling.description","Snorkeling description"],
 ["island.title","Island tour title"],["island.description","Island tour description"],
 ["regions.eyebrow","Destinations label"],["regions.title","Destinations heading"],["regions.description","Destinations introduction"],
 ["west.title","West title"],["west.description","West description"],["east.title","East title"],["east.description","East description"],
 ["contact.eyebrow","Enquiry label"],["contact.title","Enquiry heading"],["contact.description","Enquiry introduction"],["contact.notice","Enquiry notice"]
];
const englishHome = {
 "hero.eyebrow":"NUSA PENIDA · LOCAL EXPERIENCES",
 "hero.title":"Explore the island.",
 "hero.subtitle":"Your journey, your way.",
 "hero.description":"Discover three-spot snorkeling or island tours with local operators. Select your date and group size, then share your plans. Our team will confirm inclusions, availability and your quotation.",
 "hero.cta":"Request a quote ↗",
 "packages.eyebrow":"CURATED EXPERIENCES",
 "packages.title":"Snorkeling and island tours: Sharing & Private",
 "packages.description":"Choose Sharing (join other guests) or Private (exclusive for your group, including solo travelers). Snorkeling and island tours are not combined on the same day.",
 "snorkeling.title":"Nusa Penida Snorkeling",
 "snorkeling.description":"Join other guests on a Sharing trip or choose an exclusive Private experience for one or more guests. Private rates require verified boat pricing.",
 "island.title":"Nusa Penida Island Tour",
 "island.description":"Sharing prices must cover the full vehicle until seats are confirmed. Private means one exclusive vehicle even for a solo guest. Lunch and boat tickets are extra and subject to confirmation.",
 "regions.eyebrow":"ISLAND SIGHTSEEING · TWO REGIONS",
 "regions.title":"Discover West & East Nusa Penida",
 "regions.description":"Choose your favorite route and select Sharing or Private. Each route features local scenery and destination details. Boat tickets, lunch and availability are confirmed separately.",
 "west.title":"West Nusa Penida",
 "west.description":"Kelingking, Broken Beach, Angel’s Billabong and Crystal Bay: dramatic cliffs, natural wonders and beautiful beaches.",
 "east.title":"East Nusa Penida",
 "east.description":"Diamond Beach, Atuh Beach and Tree House viewpoints: white cliffs, beautiful bays and extraordinary island scenery.",
 "contact.eyebrow":"PLAN YOUR JOURNEY",
 "contact.title":"Tell us about your trip",
 "contact.description":"This form requests information. It is not a completed payment or confirmed reservation.",
 "contact.notice":"Prices, operators and availability must be verified first. Online payment is not available."
};
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
 "Hitung Sharing tanpa menebak kursi terjual":"Sharing pricing without assuming unsold seats",
 "Guest terkonfirmasi":"Confirmed guests","Net mobil / guest":"Vehicle net per guest","Harga minimum per booking*":"Minimum per booking*",
 "Nusa Penida Experiences · Informasi wisata":"Nusa Penida Experiences · Travel information"
};
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
window.NusaLanguage={get language(){return current;},get mode(){return mode;},fields,defaults:(lang)=>lang==="en"?englishHome:originals,resetCache:()=>saved.clear(),apply};
await apply();
