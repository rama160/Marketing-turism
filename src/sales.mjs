// Auditable rules. Sensitive lead phone/email must never be sent to a model.
export function leadScore(lead, today=new Date().toISOString().slice(0,10)){
 let score=0;
 if(lead.consent===1)score+=10;
 if((lead.contact||"").length>=5)score+=10;
 if(lead.guests>=1)score+=15;
 if(lead.activity_id)score+=15;
 if(lead.requested_date>=today){
  const delta=Math.floor((Date.parse(lead.requested_date+"T00:00:00Z")-Date.parse(today+"T00:00:00Z"))/86400000);
  score+=delta<=14?25:delta<=60?18:10;
 }
 if((lead.message||"").trim().length>=15)score+=15;
 if(["QUALIFIED","CONTACTED"].includes(lead.status))score+=10;
 score=Math.min(score,100);
 return {score,stage:score>=75?"HOT":score>=45?"WARM":"COLD"};
}
export function salesDraft(lead){
 const name=(lead.name||"Guest").trim().slice(0,80),n=Number(lead.guests)||1,date=lead.requested_date||"tanggal pilihan";
 const activity=lead.activity_id==="SNORKELING_3_SPOTS"?"snorkeling 3 spot":"island tour Nusa Penida";const mode=lead.booking_mode==="SHARING"?"Sharing (gabung guest lain)":lead.booking_mode==="PRIVATE"?"Private (eksklusif)":"belum ditentukan";
 return "Halo "+name+", terima kasih sudah tertarik dengan "+activity+" mode "+mode+" untuk "+n+" peserta pada "+date+". Boleh diinformasikan titik keberangkatan/penjemputan dan kebutuhan tambahan (lunch atau fast boat)? Kami akan cek ketersediaan operator serta fasilitas dan mengirim penawaran resmi sebelum pembayaran. Terima kasih!";
}
export function normalizeMarketComparison(ref,guestCount){
 if(!Number.isSafeInteger(ref.price)||ref.price<1)throw Error("Harga pasar tidak valid");
 if(ref.unit==="person")return ref.price*guestCount;
 if(ref.unit==="group"&&ref.group_size===guestCount)return ref.price;
 return null; // incomparable group sizes must not be compared as equal
}

// Seven searchable, review-only organic content ideas per ISO Monday week.
// These are suggestions, not promises of real bookings, verified prices, or platform posting.
export function marketingWeekStart(dateString){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(dateString))throw Error("Tanggal kampanye tidak valid");
 const d=new Date(dateString+"T00:00:00Z");
 if(!Number.isFinite(d.valueOf())||d.toISOString().slice(0,10)!==dateString)throw Error("Tanggal kalender tidak valid");
 d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
 return d.toISOString().slice(0,10);
}
export function weeklyDrafts(dateString){
 const monday=marketingWeekStart(dateString);
 const site="https://marketing-turism-agent.finchat-ai-gateway.workers.dev";
 const ideas=[
  {activity_id:"ISLAND_TOUR_CAR",platform:"Instagram",lang:"en",caption:"Not every island escape needs a packed itinerary. ✨ Imagine Kelingking's dramatic cliffs and the deep-blue coastline of West Nusa Penida. Explore the route and ask us about suitable local operators and travel dates. Every arrangement, activity and price requires confirmation. "+site+"/west-tour.html #NusaPenida #KelingkingBeach"},
  {activity_id:"SNORKELING_3_SPOTS",platform:"Facebook",lang:"id",caption:"Bayangkan menjelajah keindahan bawah laut Nusa Penida. 🐠 Snorkeling Sharing atau Private? Keduanya menawarkan pengalaman berbeda. Tanyakan rute, kondisi laut, dan pilihan operator lokal sebelum menentukan perjalanan. Melihat manta tidak dapat dijamin. Info: "+site+"/snorkeling.html #SnorkelingNusaPenida"},
  {activity_id:"ISLAND_TOUR_CAR",platform:"TikTok",lang:"en",caption:"Your next Bali itinerary idea: East Nusa Penida. 🏝️ Diamond Beach, Atuh Beach and dreamy cliff panoramas. See what each destination looks like, then check the possible route with a local operator before planning. No confirmed bookings or availability yet. More: "+site+"/east-tour.html #NusaPenida #BaliTravel"},
  {activity_id:"ISLAND_TOUR_CAR",platform:"Instagram",lang:"id",caption:"Satu pulau, begitu banyak cerita. 🌊 Nusa Penida Barat menyimpan panorama tebing Kelingking, Broken Beach, Angel’s Billabong, hingga Crystal Bay. Yuk kenali destinasi dan persiapkan pilihan perjalanan yang sesuai. Rute dan kondisi lapangan akan dikonfirmasi dengan operator. "+site+"/west-tour.html #NusaPenida #WisataBali"},
  {activity_id:"SNORKELING_3_SPOTS",platform:"Facebook",lang:"en",caption:"Manta rays are wild animals, and seeing one is always a privilege—never a promise. 🌊 Discover how to plan a snorkeling trip around Nusa Penida and why weather, sea conditions and local guidance matter. Browse options: "+site+"/snorkeling.html #MarineLife #NusaPenida"},
  {activity_id:"ISLAND_TOUR_CAR",platform:"Instagram",lang:"en",caption:"West or East Nusa Penida? The iconic cliffs of the west or the beautiful beaches of the east? 🏝️ Explore both routes and tell us which view you dream of seeing. Activity details and operator availability need confirmation. "+site+"/island-tour.html #NusaPenida #IslandTour"},
  {activity_id:"SNORKELING_3_SPOTS",platform:"TikTok",lang:"id",caption:"Kalau liburan ke Nusa Penida, Anda tim pantai atau dunia bawah laut? 🐠 Cari inspirasi snorkeling 3 spot, pelajari pilihan Sharing dan Private, lalu cek kondisi laut bersama operator setempat sebelum berangkat. Penampakan manta tidak dijamin. "+site+"/snorkeling.html #NusaPenida #Snorkeling"}
 ];
 return ideas.map((idea,index)=>{
  const date=new Date(monday+"T00:00:00Z");
  date.setUTCDate(date.getUTCDate()+index);
  return {...idea,planned_date:date.toISOString().slice(0,10),
   caption:"[REVIEW "+date.toISOString().slice(0,10)+" · "+idea.lang.toUpperCase()+"] "+idea.caption};
 });
}

const reviewAlternatives={
 SNORKELING_3_SPOTS:[
  ["Pernah membayangkan snorkeling sambil melihat ikan tropis di perairan Nusa Penida? 🐠 Jelajahi pilihan sharing dan private, lalu konsultasikan kondisi laut dan operator sesuai tanggal perjalanan.","Ready for a sea adventure around Nusa Penida? 🌊 Compare sharing and private snorkeling routes with our local partners. Sea conditions and wildlife sightings are never guaranteed."],
  ["Rencanakan liburan laut yang lebih personal di Nusa Penida. ✨ Tanyakan opsi snorkeling private maupun sharing, fasilitas, dan titik keberangkatan sebelum memutuskan.","Looking for a snorkeling escape with friends? 🐢 Discover Nusa Penida's underwater beauty and ask about suitable boat options, dates and local conditions."],
  ["Manta adalah satwa liar yang hidup bebas. 💙 Ayo kenali snorkeling yang menghargai kehidupan laut, sebelum meminta info rute dan operator Nusa Penida.","Go beyond the beach: explore Nusa Penida's marine life with responsible local operators. Ask us about route options; manta sightings cannot be promised."],
  ["Pilihan perjalanan laut tidak harus sama untuk semua orang. 🐠 Sharing atau private snorkeling? Ceritakan tanggal dan jumlah peserta agar kami dapat mengecek opsi bersama operator.","Which snorkeling experience suits your trip: sharing or private? 🌊 Tell us your dates and group size, and we can check operator options."],
  ["Sedang menyusun itinerary liburan Bali? 🌴 Masukkan snorkeling Nusa Penida sebagai inspirasi dan cek kondisi laut serta ketersediaan sebelum memesan.","Planning a Bali island adventure? Nusa Penida offers an inspiring underwater world. Discover snorkeling options while respecting marine conditions and local guidance."]
 ],
 ISLAND_TOUR_CAR:[
  ["Tebing Kelingking dan panorama laut biru Nusa Penida Barat bisa menjadi inspirasi liburan berikutnya. 🏝️ Kenali pilihan rute dan konsultasikan jadwal dengan operator lokal.","Picture yourself exploring the cliffs of West Nusa Penida. ✨ Discover scenic routes and ask us about available local transport for your travel dates."],
  ["Diamond Beach dan Atuh Beach menawarkan suasana pesisir Nusa Penida Timur yang memikat. 🌊 Jelajahi inspirasi itinerary sebelum menentukan transportasi dan waktu perjalanan.","East Nusa Penida has dramatic cliffs and captivating coastal viewpoints. 🏖️ Explore Diamond Beach and Atuh Beach, then check suitable travel arrangements."],
  ["Dari Broken Beach hingga Crystal Bay, setiap sudut Nusa Penida Barat punya cerita. 📸 Temukan rute yang cocok dengan tempo perjalanan Anda dan konfirmasi detail bersama operator.","A slower island day can be just as memorable. 💚 Explore the West Nusa Penida highlights and talk to our team about feasible routes."],
  ["Lebih suka pantai Nusa Penida Timur atau tebing di bagian Barat? 🌴 Bandingkan dua inspirasi rute wisata sebelum memilih perjalanan yang sesuai dengan rombongan.","West or East Nusa Penida? 🏝️ Compare famous cliff views and beautiful beaches, then ask about a route that suits your group."],
  ["Jelajahi Nusa Penida bersama teman atau keluarga. 🚙 Inspirasi island tour bisa dimulai dari spot foto yang paling Anda sukai. Rute, kendaraan dan ketersediaan dikonfirmasi dulu.","Discover Nusa Penida at your own pace. 📷 Choose favorite viewpoints and ask us about appropriate local transport and available dates."]
 ]
};
// No unverified prices, operator promises or generated images. Return a new editorial
// alternative immediately, with a stable disclosure label for human owner review.
export function replacementCampaignCaption({activity_id,platform,revision,reason="",date}){
 const texts=reviewAlternatives[activity_id];
 if(!texts||!Number.isInteger(revision)||revision<1||revision>100||
  !/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error("Invalid campaign regeneration input");
 const style=/(foto|gambar|image|visual)/i.test(reason)?"Fokus visual dan suasana destinasi. ":
  /(caption|teks|kata|bahasa)/i.test(reason)?"Bahasa dibuat lebih ringkas dan mengundang respons. ":"";
 const index=(revision-1)%texts.length;
 const language=revision%2===0?"en":"id";
 const wording=texts[index][language==="en"?1:0];
 const link="https://marketing-turism-agent.finchat-ai-gateway.workers.dev/"+(activity_id==="SNORKELING_3_SPOTS"?"snorkeling.html":index%2?"east-tour.html":"west-tour.html");
 return "[REVIEW "+date+" · "+language.toUpperCase()+" · V"+revision+"] "+style+wording+" 🌐 "+link+" #NusaPenida #"+(activity_id==="SNORKELING_3_SPOTS"?"SnorkelingNusaPenida":"IslandTour");
}
