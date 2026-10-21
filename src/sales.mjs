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
