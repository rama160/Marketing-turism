const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const money=n=>"Rp"+new Intl.NumberFormat("id-ID").format(n||0);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let token=sessionStorage.getItem("tourAdmin")||"",data={operators:[],rates:[],leads:[],quotes:[],bookings:[],finance:{payables:[],changes:[]},campaigns:[],market:[]},lastMarketing="",lastSales="";
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
$("#leadDate").min=new Date().toISOString().slice(0,10);$("#quoteDate").min=$("#leadDate").min;$("#marketDate").value=$("#leadDate").min;$("#marketDate").max=$("#leadDate").min;$("#leadForm [name=campaign_id]").value=(new URL(location.href).searchParams.get("campaign")||"").slice(0,100);
async function publicReadiness(){
 try{const readiness=await api("public/readiness","GET",undefined,false);
  const enabled=readiness.accepting_leads===true;
  $("#leadSubmit").disabled=!enabled;
  $("#publicBusinessContact").textContent=readiness.business_contact?("Kontak resmi usaha: "+readiness.business_contact):"Kontak resmi usaha belum dipublikasikan.";
  if(!enabled)say("#leadFeedback","Penerimaan permintaan guest belum aktif. Agen sedang menyiapkan informasi usaha dan keamanan.");
  else say("#leadFeedback","Form siap menerima permintaan. Mohon selesaikan verifikasi anti-bot.",true);
 }catch(e){$("#leadSubmit").disabled=true;say("#leadFeedback","Layanan belum siap menerima permintaan.");}
}
publicReadiness();
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
  const [summary,operators,rates,leads,quotes,bookings,finance,campaigns,market,business]=await Promise.all([
   api("admin/summary"),api("admin/operators"),api("admin/rates"),api("admin/leads"),api("admin/quotes"),api("admin/bookings"),api("admin/finance"),api("admin/campaigns"),api("admin/market"),api("admin/business")]);
  data={operators:operators.items,rates:rates.items,leads:leads.items,quotes:quotes.items,bookings:bookings.items,finance,campaigns:campaigns.items,market:market.items};
  $("#stats").innerHTML=Object.entries(summary).map(([key,num])=>'<div class="stat"><strong>'+Number(num)+'</strong><span>'+esc({operators:"Operator",leads:"Guest leads",quotes:"Penawaran",bookings:"Booking"}[key]||key)+'</span></div>').join("");
  $("#rateOperator").innerHTML=options(data.operators);
  $("#quoteOperator").innerHTML=options(data.operators.filter(x=>x.status==="VERIFIED"));["#lunchOperator","#boatOutOperator","#boatReturnOperator"].forEach(selector=>{$(selector).innerHTML=options(data.operators.filter(x=>x.status==="VERIFIED"))});
  renderOperators();renderRates();renderLeads();renderQuotes();renderBookings();renderFinance();renderCampaigns();renderMarket();renderBusiness(business.business);
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
 $("#leadList").innerHTML=data.leads.map(l=>'<div class="item"><div class="meta"><b>'+esc(l.name)+' · '+esc(l.activity_id)+'</b><span class="pill">'+esc(l.status)+'</span></div><small>'+esc(l.contact)+' · '+esc(l.requested_date)+' · '+l.guests+' guest</small><small>'+esc(l.message)+'</small><small>ID: '+esc(l.id)+'</small><div class="actions"><button class="outline" data-action="leadQualify" data-id="'+esc(l.id)+'">Kualifikasi</button><button class="outline" data-action="leadContact" data-id="'+esc(l.id)+'">Sudah dihubungi</button><button class="outline" data-action="salesAssist" data-id="'+esc(l.id)+'">Saran balasan AI</button></div></div>').join("")||"<p>Belum ada lead.</p>";
}
function renderQuotes(){
 $("#quoteList").innerHTML=data.quotes.map(q=>'<div class="item"><div class="meta"><b>'+esc(q.activity_id)+' · '+q.guests+' guest</b><span class="pill '+(q.status==="APPROVED"?"good":"")+'">'+esc(q.status)+'</span></div><div>Harga guest '+money(q.selling_price)+' · Net '+money(q.net)+'</div><small>'+esc(q.requested_date)+' · '+esc(q.operator_name)+' · ID '+esc(q.id)+'</small><div class="actions">'+
  (q.status==="DRAFT"?'<button class="outline" data-action="confirmQuote" data-id="'+esc(q.id)+'">Operator konfirmasi tersedia</button>':"")+
  (q.status==="OPERATOR_CONFIRMED"?'<button class="outline" data-action="approveQuote" data-id="'+esc(q.id)+'">Setujui harga final</button>':"")+
  (q.status==="APPROVED"?'<button class="primary" data-action="bookQuote" data-id="'+esc(q.id)+'">Buat booking</button>':"")+'</div></div>').join("")||"<p>Belum ada quote.</p>";
}
function renderBookings(){
 $("#bookingList").innerHTML=data.bookings.map(b=>'<div class="item"><div class="meta"><b>'+esc(b.activity_id)+' · '+esc(b.requested_date)+'</b><span class="pill '+(b.status==="HANDED_OVER"?"good":"")+'">'+esc(b.status)+'</span></div><div>'+b.guests+' guest · '+money(b.selling_price)+'</div><small>Payment: '+esc(b.payment_status)+' · ID '+esc(b.id)+'</small><small>Manifest: '+(b.manifest_confirmed?"terkonfirmasi":"belum")+' · '+esc(b.guest_name||"Guest belum diisi")+'</small><div class="actions">'+
  (b.payment_status==="UNPAID"&&b.status==="AWAITING_PAYMENT"?'<button class="outline" data-action="verifyPayment" data-id="'+esc(b.id)+'">Verifikasi dana masuk</button>':"")+
  (!["HANDED_OVER","REFUNDED","CANCELLED"].includes(b.status)?'<button class="outline" data-action="manifest" data-id="'+esc(b.id)+'">Isi manifest</button><button class="outline" data-action="changeBooking" data-id="'+esc(b.id)+'">Reschedule / Cancel / Refund</button>':"")+
  (b.status==="PAID"?'<button class="primary" data-action="handover" data-id="'+esc(b.id)+'">Operator terima guest</button>':"")+
  '</div></div>').join("")||"<p>Belum ada booking.</p>";
}
function renderFinance(){
 const pay=(data.finance?.payables||[]),changes=(data.finance?.changes||[]);
 $("#financeList").innerHTML='<h4>Utang kepada operator ('+pay.length+')</h4>'+
 pay.map(p=>'<div class="item"><div class="meta"><b>'+esc(p.operator_name)+'</b><span class="pill '+(p.status==="PAID"?"good":"")+'">'+esc(p.status)+'</span></div><div>'+money(p.net_amount)+'</div><small>Booking: '+esc(p.booking_id)+' · '+esc(p.activity_id)+'</small><div class="actions">'+(p.status==="DUE"?'<button class="outline" data-action="payOperator" data-id="'+esc(p.booking_id)+'" data-operator="'+esc(p.operator_id)+'">Verifikasi transfer net operator</button>':"")+'</div></div>').join("")+
 '<h4>Reschedule, Pembatalan, Refund ('+changes.length+')</h4>'+
 changes.map(c=>'<div class="item"><div class="meta"><b>'+esc(c.change_type)+' · '+esc(c.activity_id)+'</b><span class="pill '+(c.status==="EXECUTED"?"good":"")+'">'+esc(c.status)+'</span></div><small>Booking: '+esc(c.booking_id)+' · '+esc(c.reason)+'</small><small>'+(c.change_type==="RESCHEDULE"?"Tanggal baru: "+esc(c.requested_date):c.change_type==="REFUND"?"Estimasi refund: "+money(c.refund_amount)+" · Potongan: "+money(c.penalty_amount||0):"Pembatalan tanpa pembayaran")+'</small><div class="actions">'+
 (c.status==="REQUESTED"?'<button class="outline" data-action="approveChange" data-id="'+esc(c.id)+'" data-booking="'+esc(c.booking_id)+'" data-type="'+esc(c.change_type)+'">Setujui</button><button class="outline" data-action="rejectChange" data-id="'+esc(c.id)+'" data-booking="'+esc(c.booking_id)+'">Tolak</button>':"")+
 (c.status==="APPROVED"&&c.change_type==="REFUND"?'<button class="primary" data-action="executeRefund" data-id="'+esc(c.id)+'" data-booking="'+esc(c.booking_id)+'">Verifikasi refund terkirim</button>':"")+'</div></div>').join("")||
 '<p>Tidak ada kewajiban/perubahan tercatat.</p>';
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
 return {operator_id:b.operator_id,activity_id:b.activity_id,guests:Number(b.guests),requested_date:b.requested_date,agency_costs:numberOrZero(b.agency_costs),payment_fee:numberOrZero(b.payment_fee),selling_price:b.selling_price?Number(b.selling_price):null,lead_id:b.lead_id||null,extras:{LUNCH:numberOrZero(b.lunch),BOAT_OUT:numberOrZero(b.boat_out),BOAT_RETURN:numberOrZero(b.boat_return)},extra_operators:{LUNCH:b.lunch_operator,BOAT_OUT:b.boat_out_operator,BOAT_RETURN:b.boat_return_operator}};
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

function renderBusiness(profile){
 if(!profile)return;
 const f=$("#businessForm");
 f.querySelector('[name=legal_name]').value=profile.legal_name||"";
 f.querySelector('[name=public_contact]').value=profile.public_contact||"";
 f.querySelector('[name=privacy_approved]').checked=profile.privacy_approved===1;
 f.querySelector('[name=refund_policy_approved]').checked=profile.refund_policy_approved===1;
}
$("#businessForm").onsubmit=async e=>{
 e.preventDefault();
 const b=formValues(e.target);
 b.privacy_approved=e.target.querySelector('[name=privacy_approved]').checked;
 b.refund_policy_approved=e.target.querySelector('[name=refund_policy_approved]').checked;
 if(!confirm("Konfirmasi data resmi usaha dan persetujuan kebijakan sesuai kenyataan?"))return;
 try{await api("admin/business","PATCH",b);await refresh();await publicReadiness();say("#adminFeedback","Data usaha disimpan; penerimaan guest masih memerlukan Turnstile dan persetujuan aktivasi.",true)}
 catch(e){say("#adminFeedback",e.message)}
};
function renderCampaigns(){
 $("#campaignList").innerHTML=data.campaigns.map(c=>'<div class="item"><div class="meta"><b>'+esc(c.platform)+' · '+esc(c.activity_id)+'</b><span class="pill '+(c.status==="PUBLISHED"?"good":"")+'">'+esc(c.status)+'</span></div><small>'+esc(c.caption.slice(0,230))+'</small><div class="actions">'+(c.status==="DRAFT"?'<button class="outline" data-action="approveCampaign" data-id="'+esc(c.id)+'">Setujui</button>':"")+(c.status==="APPROVED"?'<button class="outline" data-action="publishCampaign" data-id="'+esc(c.id)+'">Tandai sudah diposting</button>':"")+(c.status==="PUBLISHED"?'<button class="outline" data-action="copyCampaignLink" data-id="'+esc(c.id)+'">Salin tautan guest</button>':"")+'</div><small>ID tracking: '+esc(c.id)+'</small></div>').join("")||"<p>Belum ada kampanye.</p>";
}
function renderMarket(){
 $("#marketList").innerHTML=data.market.map(m=>'<div class="item"><div class="meta"><b>'+esc(m.platform)+' · '+esc(m.activity_id)+'</b><span class="pill">'+esc(m.verified?"Diperiksa":"Belum diverifikasi")+'</span></div><div>'+money(m.price)+' / '+esc(m.unit)+(m.group_size?" ('+m.group_size+' orang)":"")+'</div><small>Diamati '+esc(m.observed_on)+' · '+esc(m.inclusions)+'</small><small>'+esc(m.source_url)+'</small></div>').join("")||"<p>Belum ada referensi harga.</p>";
}
$("#reuseDraft").onclick=()=>{if(lastMarketing)$("#campaignForm [name=caption]").value=lastMarketing;};
$("#campaignForm").onsubmit=async e=>{
 e.preventDefault();try{await api("admin/campaigns","POST",formValues(e.target));e.target.reset();await refresh();say("#adminFeedback","Kampanye disimpan sebagai draf.",true);}catch(err){say("#adminFeedback",err.message)}
};
$("#marketForm").onsubmit=async e=>{
 e.preventDefault();const b=formValues(e.target);b.price=Number(b.price);b.group_size=b.unit==="group"?Number(b.group_size):null;b.owner_confirmed=e.target.querySelector('[name=owner_confirmed]').checked;
 try{await api("admin/market","POST",b);e.target.reset();$("#marketDate").value=new Date().toISOString().slice(0,10);await refresh();say("#adminFeedback","Harga kompetitor dicatat sebagai referensi.",true);}catch(err){say("#adminFeedback",err.message)}
};
$("#copySales").onclick=async()=>{if(!lastSales)return;try{await navigator.clipboard.writeText(lastSales);say("#adminFeedback","Draf sales disalin.",true)}catch(err){say("#adminFeedback","Gagal menyalin otomatis.")}};
document.addEventListener("click",async e=>{
 const button=e.target.closest("[data-action]");if(!button)return;const a=button.dataset.action,id=button.dataset.id;
 try{
  if(a==="salesAssist"){
   const res=await api("admin/leads/"+encodeURIComponent(id)+"/assistant","POST",{use_ai:true});
   lastSales=res.reply;$("#salesOutput").textContent="Skor lead "+res.score+"/100 ("+res.stage+"), generator "+res.generator+"\n\n"+res.reply+"\n\nDraf untuk diperiksa sebelum menghubungi guest.";changeTab("leads");
  }
  if(a==="copyCampaignLink"){const url=location.origin+"/?campaign="+encodeURIComponent(id);await navigator.clipboard.writeText(url);say("#adminFeedback","Tautan kampanye tersalin, publikasi dilakukan manual.",true)}
  if(a==="approveCampaign"||a==="publishCampaign"){
   const status=a==="approveCampaign"?"APPROVED":"PUBLISHED",payload={status,owner_confirmed:true};
   if(status==="PUBLISHED"){
    const url=prompt("URL HTTPS posting yang SUDAH diterbitkan secara manual:");
    if(!url)return;payload.public_url=url;
   }
   if(!confirm("Konfirmasi status kampanye "+status+"?"))return;
   await api("admin/campaigns/"+encodeURIComponent(id)+"/status","PATCH",payload);
  }
  if(a==="verifyOperator"){if(!confirm("Operator dan syarat kerja sama sudah diverifikasi?"))return;await api("admin/operators/"+encodeURIComponent(id)+"/status","PATCH",{status:"VERIFIED"})}
  if(a==="disableOperator"){if(!confirm("Nonaktifkan operator ini?"))return;await api("admin/operators/"+encodeURIComponent(id)+"/status","PATCH",{status:"INACTIVE"})}
  if(a==="leadQualify")await api("admin/leads/"+encodeURIComponent(id),"PATCH",{status:"QUALIFIED"});
  if(a==="leadContact")await api("admin/leads/"+encodeURIComponent(id),"PATCH",{status:"CONTACTED"});
  if(a==="confirmQuote"){if(!confirm("Operator telah mengonfirmasi ketersediaan di tanggal tersebut?"))return;await api("admin/quotes/"+encodeURIComponent(id)+"/status","PATCH",{status:"OPERATOR_CONFIRMED"})}
  if(a==="approveQuote"){if(!confirm("Anda menyetujui harga final ke guest?"))return;await api("admin/quotes/"+encodeURIComponent(id)+"/status","PATCH",{status:"APPROVED"})}
  if(a==="bookQuote"){if(!confirm("Buat booking dari penawaran yang disetujui?"))return;await api("admin/bookings","POST",{quote_id:id})}
  if(a==="manifest"){
   const current=data.bookings.find(x=>x.id===id);
   const name=prompt("Nama pemesan / guest utama:",current?.guest_name||"");if(name===null)return;
   const contact=prompt("Nomor WhatsApp/email guest:",current?.guest_contact||"");if(contact===null)return;
   const pickup=prompt("Titik kumpul atau penjemputan:",current?.pickup||"");if(pickup===null)return;
   const special_notes=prompt("Catatan kebutuhan guest (hindari data sensitif):",current?.special_notes||"");if(special_notes===null)return;
   if(!confirm("Manifest sudah diperiksa dan benar?"))return;
   await api("admin/bookings/"+encodeURIComponent(id)+"/manifest","POST",{guest_name:name,guest_contact:contact,pickup,special_notes,owner_confirmed:true});
  }
  if(a==="changeBooking"){
   const current=data.bookings.find(x=>x.id===id),kind=prompt("Jenis perubahan: RESCHEDULE / CANCEL / REFUND",current?.payment_status==="PAID"?"REFUND":"RESCHEDULE");
   if(!kind)return;const change_type=kind.toUpperCase().trim();
   const reason=prompt("Alasan dan konteks permintaan:");if(!reason)return;
   let requested_date=null,refund_amount=0,cancellation_cause=null;
   if(change_type==="RESCHEDULE"){requested_date=prompt("Tanggal baru YYYY-MM-DD",current?.requested_date||"");if(!requested_date)return;}
   if(change_type==="REFUND"){
    const c=prompt("Penyebab: GUEST (batal sendiri) atau OPERATOR_OR_SAFETY (operator batal/tidak aman)","GUEST");
    if(!c)return;cancellation_cause=c.trim().toUpperCase();
    const resp=await api("admin/bookings/"+encodeURIComponent(id)+"/cancellation-preview","POST",{cause:cancellation_cause});
    const p=resp.preview;refund_amount=p.refundIdr;
    if(!confirm("Estimasi kebijakan "+p.label+"\nPenalti: "+money(p.penaltyIdr)+"\nRefund: "+money(p.refundIdr)+"\nStatus biaya mitra harus ditinjau manual.\n\nBuat permintaan refund untuk diperiksa?"))return;
   }
   await api("admin/bookings/"+encodeURIComponent(id)+"/changes","POST",{change_type,reason,requested_date,refund_amount,cancellation_cause});
  }
  if(a==="payOperator"){
   const ref=prompt("Masukkan referensi transfer net yang SUDAH diterima operator:");if(!ref)return;
   if(!confirm("Dana sudah benar-benar ditransfer ke mitra dan referensi bank benar?"))return;
   await api("admin/bookings/"+encodeURIComponent(id)+"/payables/"+encodeURIComponent(button.dataset.operator)+"/pay","POST",{reference:ref,owner_confirmed:true});
  }
  if(a==="approveChange"||a==="rejectChange"||a==="executeRefund"){
   const booking=button.dataset.booking,kind=button.dataset.type;
   const next=a==="approveChange"?"APPROVED":a==="rejectChange"?"REJECTED":"EXECUTED";
   const payload={status:next};
   if(next==="APPROVED"&&kind==="RESCHEDULE"){
    if(!confirm("Operator menyatakan tersedia pada tanggal BARU dan guest setuju?"))return;
    payload.operator_acknowledged=true;
   }
   if(next==="APPROVED"&&kind==="REFUND"){
    if(!confirm("Anda sudah meninjau total biaya operator, pembayaran supplier yang tak dapat kembali, biaya transaksi, dan kewajiban hukum? Menyetujui estimasi refund bukan mengirim dana."))return;
    payload.supplier_exposure_reviewed=true;
    payload.owner_confirmed=true;
   }
   if(next==="EXECUTED"){
    const existing=(data.finance?.changes||[]).find(x=>x.id===id);
    const isZero=existing?.refund_amount===0;
    const ref=isZero?"NO_REFUND_DUE":prompt("Referensi transaksi refund BANK yang SUDAH terkirim:");
    if(!ref)return;
    if(!confirm(isZero?"Konfirmasi bahwa refund Rp0 sesuai kebijakan yang sudah disetujui guest, tanpa transaksi pengembalian.":"Dana refund sungguh sudah keluar/settled dan tidak hanya bukti unggahan?"))return;
    payload.owner_confirmed=true;payload.external_reference=ref;
   }
   await api("admin/bookings/"+encodeURIComponent(booking)+"/changes/"+encodeURIComponent(id),"PATCH",payload);
  }
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

// Offline static shell only; no API, guest data or credentials are cached.
if("serviceWorker" in navigator)navigator.serviceWorker.register("/service-worker.js").catch(()=>{});
