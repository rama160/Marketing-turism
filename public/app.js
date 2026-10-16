const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const money=n=>"Rp"+new Intl.NumberFormat("id-ID").format(n||0);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let token=sessionStorage.getItem("tourAdmin")||"",data={operators:[],rates:[],leads:[],quotes:[],bookings:[]},lastMarketing="";
const say=(id,msg,success=false)=>{const el=$(id);if(el){el.textContent=msg;el.style.color=success?"#167058":"#a24836"}};
async function api(path,method="GET",payload,admin=true){
 const headers={"accept":"application/json"};if(payload!==undefined)headers["content-type"]="application/json";
 if(admin&&token)headers.authorization="Bearer "+token;
 const res=await fetch("/api/"+path,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload)});
 const text=await res.text();let j;try{j=JSON.parse(text)}catch{throw Error("Respons server bukan JSON ("+res.status+")")}
 if(!res.ok)throw Error(j.error||"Server "+res.status);return j;
}
const options=(arr,label)=>arr.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name||x.title||label||x.id)+'</option>').join("");
function changeTab(name){
 $$(".tabs button").forEach(b=>b.classList.toggle("current",b.dataset.tab===name));
 $$(".tabcontent").forEach(el=>el.hidden=el.id!=="tab-"+name);
}
$$(".tabs button").forEach(el=>el.addEventListener("click",()=>changeTab(el.dataset.tab)));
$("#adminToggle").onclick=()=>{$("#adminArea").hidden=false;$("#adminArea").scrollIntoView({behavior:"smooth"});};
$("#lock").onclick=()=>{token="";sessionStorage.removeItem("tourAdmin");$("#adminContent").hidden=true;$("#unlockPanel").hidden=false;say("#loginMessage","Sesi admin ditutup.",true)};
$("#leadDate").min=new Date().toISOString().slice(0,10);$("#quoteDate").min=$("#leadDate").min;
$("#leadForm").onsubmit=async e=>{
 e.preventDefault();const b=Object.fromEntries(new FormData(e.target));
 b.guests=Number(b.guests);b.consent=$('#leadForm [name=consent]').checked;b.website=b.website||"";
 try{const res=await api("public/leads","POST",b,false);say("#leadFeedback","Permintaan diterima. Nomor referensi: "+res.reference,true);e.target.reset();}
 catch(err){say("#leadFeedback",err.message+" — Silakan hubungi agen melalui kontak resmi yang diberikan.")}
};
$("#unlock").onclick=async()=>{
 const value=$("#adminToken").value.trim();if(value.length<24){say("#loginMessage","Token minimal 24 karakter");return;}
 token=value;try{await api("admin/summary");sessionStorage.setItem("tourAdmin",token);$("#unlockPanel").hidden=true;$("#adminContent").hidden=false;say("#adminFeedback","Dashboard tersambung.",true);await refresh();}catch(err){token="";say("#loginMessage",err.message)}
};
async function refresh(){
 try{
  const [summary,operators,rates,leads,quotes,bookings]=await Promise.all([
   api("admin/summary"),api("admin/operators"),api("admin/rates"),api("admin/leads"),api("admin/quotes"),api("admin/bookings")]);
  data={operators:operators.items,rates:rates.items,leads:leads.items,quotes:quotes.items,bookings:bookings.items};
  $("#stats").innerHTML=Object.entries(summary).map(([key,num])=>'<div class="stat"><strong>'+Number(num)+'</strong><span>'+esc({operators:"Operator",leads:"Guest leads",quotes:"Penawaran",bookings:"Booking"}[key]||key)+'</span></div>').join("");
  $("#rateOperator").innerHTML=options(data.operators);
  $("#quoteOperator").innerHTML=options(data.operators.filter(x=>x.status==="VERIFIED"));
  renderOperators();renderRates();renderLeads();renderQuotes();renderBookings();
  say("#adminFeedback","Data diperbarui.",true);
 }catch(err){say("#adminFeedback",err.message)}
}
$("#refreshAll").onclick=refresh;
function renderOperators(){
 $("#operatorList").innerHTML=data.operators.map(o=>
  '<div class="item"><div class="meta"><b>'+esc(o.name)+'</b><span class="pill '+(o.status==="VERIFIED"?"good":"")+'">'+esc(o.status)+'</span></div><small>'+esc(o.contact||"Kontak belum diisi")+'</small><small>'+esc(o.notes||"")+'</small>'+
  (o.status!=="VERIFIED"?'<button class="outline" data-action="verifyOperator" data-id="'+esc(o.id)+'">Tandai operator terverifikasi</button>':'<button class="outline" data-action="disableOperator" data-id="'+esc(o.id)+'">Nonaktifkan</button>')+'</div>').join("")||"<p>Belum ada operator.</p>";
}
function renderRates(){
 $("#rateList").innerHTML=data.rates.map(r=>'<div class="item"><div class="meta"><b>'+esc(r.operator_name)+' · '+esc(r.item_title)+'</b><span class="pill '+(r.verified?"good":"")+'">v'+r.version+' '+(r.verified?"Verified":"Draft")+'</span></div><div>'+money(r.net)+' / '+esc(r.unit)+(r.capacity?" · "+r.capacity+" kursi":"")+'</div><small>'+esc(r.active?"Tarif versi aktif":"Versi lama, tidak aktif")+'</small></div>').join("")||"<p>Belum ada tarif.</p>";
}
function renderLeads(){
 $("#leadList").innerHTML=data.leads.map(l=>'<div class="item"><div class="meta"><b>'+esc(l.name)+' · '+esc(l.activity_id)+'</b><span class="pill">'+esc(l.status)+'</span></div><small>'+esc(l.contact)+' · '+esc(l.requested_date)+' · '+l.guests+' guest</small><small>'+esc(l.message)+'</small><small>ID: '+esc(l.id)+'</small><div class="actions"><button class="outline" data-action="leadQualify" data-id="'+esc(l.id)+'">Kualifikasi</button><button class="outline" data-action="leadContact" data-id="'+esc(l.id)+'">Sudah dihubungi</button></div></div>').join("")||"<p>Belum ada lead.</p>";
}
function renderQuotes(){
 $("#quoteList").innerHTML=data.quotes.map(q=>'<div class="item"><div class="meta"><b>'+esc(q.activity_id)+' · '+q.guests+' guest</b><span class="pill '+(q.status==="APPROVED"?"good":"")+'">'+esc(q.status)+'</span></div><div>Harga guest '+money(q.selling_price)+' · Net '+money(q.net)+'</div><small>'+esc(q.requested_date)+' · '+esc(q.operator_name)+' · ID '+esc(q.id)+'</small><div class="actions">'+
  (q.status==="DRAFT"?'<button class="outline" data-action="confirmQuote" data-id="'+esc(q.id)+'">Operator konfirmasi tersedia</button>':"")+
  (q.status==="OPERATOR_CONFIRMED"?'<button class="outline" data-action="approveQuote" data-id="'+esc(q.id)+'">Setujui harga final</button>':"")+
  (q.status==="APPROVED"?'<button class="primary" data-action="bookQuote" data-id="'+esc(q.id)+'">Buat booking</button>':"")+'</div></div>').join("")||"<p>Belum ada quote.</p>";
}
function renderBookings(){
 $("#bookingList").innerHTML=data.bookings.map(b=>'<div class="item"><div class="meta"><b>'+esc(b.activity_id)+' · '+esc(b.requested_date)+'</b><span class="pill '+(b.status==="HANDED_OVER"?"good":"")+'">'+esc(b.status)+'</span></div><div>'+b.guests+' guest · '+money(b.selling_price)+'</div><small>Payment: '+esc(b.payment_status)+' · ID '+esc(b.id)+'</small><div class="actions">'+
  (b.payment_status!=="PAID"?'<button class="outline" data-action="verifyPayment" data-id="'+esc(b.id)+'">Verifikasi dana masuk</button>':"")+
  (b.status==="PAID"?'<button class="primary" data-action="handover" data-id="'+esc(b.id)+'">Operator terima guest</button>':"")+
  '</div></div>').join("")||"<p>Belum ada booking.</p>";
}
const formValues=(form)=>Object.fromEntries(new FormData(form));
$("#operatorForm").onsubmit=async e=>{
 e.preventDefault();try{await api("admin/operators","POST",formValues(e.target));e.target.reset();await refresh();say("#adminFeedback","Operator baru disimpan sebagai draft.",true)}catch(err){say("#adminFeedback",err.message)}
};
$("#rateForm").onsubmit=async e=>{
 e.preventDefault();const b=formValues(e.target);
 const unit=b.item_id==="ISLAND_TOUR_CAR"?"car":"person";
 const payload={operator_id:b.operator_id,item_id:b.item_id,unit,net:Number(b.net),capacity:unit==="car"?Number(b.capacity):null,verified:e.target.querySelector('[name="verified"]').checked};
 if(payload.verified&&!confirm("Sudah diverifikasi langsung dengan operator? Harga yang salah dapat merugikan guest dan agen."))return;
 try{await api("admin/rates","POST",payload);await refresh();say("#adminFeedback","Versi tarif baru disimpan. Quote lama tetap memakai snapshot.",true)}catch(err){say("#adminFeedback",err.message)}
};
function quotePayload(){
 const b=formValues($("#quoteForm"));const numberOrZero=x=>Number(x)||0;
 return {operator_id:b.operator_id,activity_id:b.activity_id,guests:Number(b.guests),requested_date:b.requested_date,agency_costs:numberOrZero(b.agency_costs),payment_fee:numberOrZero(b.payment_fee),selling_price:b.selling_price?Number(b.selling_price):null,lead_id:b.lead_id||null,extras:{LUNCH:numberOrZero(b.lunch),BOAT_OUT:numberOrZero(b.boat_out),BOAT_RETURN:numberOrZero(b.boat_return)}};
}
$("#previewQuote").onclick=async()=>{
 try{const p=(await api("admin/quotes/preview","POST",quotePayload())).preview;
  $("#previewOutput").textContent="Total net: "+money(p.net)+"\nBatas aman: "+money(p.minimum)+"\nHarga rekomendasi matematika: "+money(p.recommendation)+"\n"+p.lines.map(l=>l.kind+": "+l.qty+" × "+money(l.unit_net)).join("\n")+"\n\nIni belum booking.";
 }catch(err){$("#previewOutput").textContent=err.message}
};
$("#quoteForm").onsubmit=async e=>{
 e.preventDefault();if(!confirm("Pastikan semua biaya dan harga jual telah disetujui. Simpan quote draft?"))return;
 try{const r=await api("admin/quotes","POST",quotePayload());await refresh();$("#previewOutput").textContent="Quote draft berhasil: "+r.id+"\nHarga jual "+money(r.quote.sellingPrice)}catch(err){$("#previewOutput").textContent=err.message}
};
document.addEventListener("click",async e=>{
 const button=e.target.closest("[data-action]");if(!button)return;const a=button.dataset.action,id=button.dataset.id;
 try{
  if(a==="verifyOperator"){if(!confirm("Operator dan syarat kerja sama sudah diverifikasi?"))return;await api("admin/operators/"+encodeURIComponent(id)+"/status","PATCH",{status:"VERIFIED"})}
  if(a==="disableOperator"){if(!confirm("Nonaktifkan operator ini?"))return;await api("admin/operators/"+encodeURIComponent(id)+"/status","PATCH",{status:"INACTIVE"})}
  if(a==="leadQualify")await api("admin/leads/"+encodeURIComponent(id),"PATCH",{status:"QUALIFIED"});
  if(a==="leadContact")await api("admin/leads/"+encodeURIComponent(id),"PATCH",{status:"CONTACTED"});
  if(a==="confirmQuote"){if(!confirm("Operator telah mengonfirmasi ketersediaan di tanggal tersebut?"))return;await api("admin/quotes/"+encodeURIComponent(id)+"/status","PATCH",{status:"OPERATOR_CONFIRMED"})}
  if(a==="approveQuote"){if(!confirm("Anda menyetujui harga final ke guest?"))return;await api("admin/quotes/"+encodeURIComponent(id)+"/status","PATCH",{status:"APPROVED"})}
  if(a==="bookQuote"){if(!confirm("Buat booking dari penawaran yang disetujui?"))return;await api("admin/bookings","POST",{quote_id:id})}
  if(a==="verifyPayment"){
   const reference=prompt("Masukkan referensi mutasi rekening atau transaksi yang telah Anda verifikasi:");
   if(!reference||reference.trim().length<5)return;
   if(!confirm("ANDA SENDIRI sudah mengecek dana benar-benar diterima, bukan hanya screenshot?"))return;
   await api("admin/bookings/"+encodeURIComponent(id)+"/payment","POST",{reference:reference.trim(),owner_confirmed:true});
  }
  if(a==="handover"){if(!confirm("Operator telah menerima manifest guest, jadwal, dan tanggung jawab aktivitas?"))return;await api("admin/bookings/"+encodeURIComponent(id)+"/handover","POST",{operator_acknowledged:true})}
  await refresh();
 }catch(err){say("#adminFeedback",err.message)}
});
$("#generateContent").onclick=async()=>{
 try{const draft=await api("admin/marketing/draft","POST",{activity_id:$("#marketingProduct").value,use_ai:$("#marketingAI").checked});lastMarketing=draft.title+"\n\n"+draft.caption+"\n\n"+draft.cta||"";$("#marketingOutput").textContent=lastMarketing+"\n\n[DRAFT - menunggu persetujuan pemilik; generator: "+draft.generator+"]"}catch(err){$("#marketingOutput").textContent=err.message}
};
$("#copyMarketing").onclick=async()=>{if(!lastMarketing)return;try{await navigator.clipboard.writeText(lastMarketing);say("#adminFeedback","Teks draf tersalin.",true)}catch(err){say("#adminFeedback","Tidak dapat menyalin otomatis pada browser ini.")}};
if(token){$("#adminArea").hidden=false;$("#unlockPanel").hidden=true;$("#adminContent").hidden=false;refresh()}
