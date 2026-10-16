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
 const activity=lead.activity_id==="SNORKELING_3_SPOTS"?"snorkeling 3 spot":"island tour Nusa Penida";
 return "Halo "+name+", terima kasih sudah tertarik dengan "+activity+" untuk "+n+" peserta pada "+date+". Boleh diinformasikan titik keberangkatan/penjemputan dan kebutuhan tambahan (lunch atau fast boat)? Kami akan cek ketersediaan operator serta fasilitas dan mengirim penawaran resmi sebelum pembayaran. Terima kasih!";
}
export function normalizeMarketComparison(ref,guestCount){
 if(!Number.isSafeInteger(ref.price)||ref.price<1)throw Error("Harga pasar tidak valid");
 if(ref.unit==="person")return ref.price*guestCount;
 if(ref.unit==="group"&&ref.group_size===guestCount)return ref.price;
 return null; // incomparable group sizes must not be compared as equal
}

export function weeklyDrafts(day){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw Error("Tanggal draft tidak valid");
 return [
 {activity_id:"SNORKELING_3_SPOTS",platform:"Website",caption:"[AUTO "+day+"] Snorkeling 3 spot Nusa Penida? Konsultasikan tanggal perjalanan, jumlah guest, fasilitas yang tersedia, dan kondisi laut sebelum memilih operator. Tanyakan penawaran resmi kepada agen."},
 {activity_id:"ISLAND_TOUR_CAR",platform:"Website",caption:"[AUTO "+day+"] Rencanakan Island Tour Nusa Penida dengan kendaraan operator lokal. Tanyakan jumlah penumpang, jadwal, pilihan lunch dan boat sebelum memesan. Ketersediaan dan harga final perlu dikonfirmasi."}
 ];
}
