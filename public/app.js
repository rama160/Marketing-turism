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
const VARIANTS={
 SNORKELING_3_SPOTS:{SHARING:[["STANDARD_3_SPOTS","Sharing 3 spot"]],PRIVATE:[["MANTA_BAY","Private 3 spot · Manta Bay"],["MANTA_POINT","Private 3 spot · Manta Point"]]},
 ISLAND_TOUR_CAR:{SHARING:[["WEST","Sharing · Wisata Barat"],["EAST","Sharing · Wisata Timur"]],PRIVATE:[["WEST","Private · Wisata Barat"],["EAST","Private · Wisata Timur"]]}
};
function updateVariants(form,selector){
 const item=form.querySelector('[name=activity_id]')?.value||form.querySelector('[name=item_id]')?.value;
 const mode=form.querySelector('[name=booking_mode]')?.value||"LEGACY",select=$(selector);
 if(!select)return;
 const variants=VARIANTS[item]?.[mode]||[["DEFAULT","Komponen tanpa varian / legacy"]];
 const previous=select.value;select.innerHTML=variants.map(([key,label])=>'<option value="'+esc(key)+'">'+esc(label)+'</option>').join("");
 if(variants.some(x=>x[0]===previous))select.value=previous;
 const count=form.querySelector('[name=guests]'),max=item==="ISLAND_TOUR_CAR"?7:20;
 if(count){count.max=String(max);if(+count.value>max)count.value=max;}
}
for(const [formId,selector] of [["#leadForm","#leadVariant"],["#quoteForm","#quoteVariant"],["#rateForm","#rateVariant"]]){
 const form=$(formId);
 form.addEventListener("change",e=>{if(["activity_id","item_id","booking_mode"].includes(e.target.name))updateVariants(form,selector);});
 updateVariants(form,selector);
}
const options=(arr,label)=>arr.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name||x.title||label||x.id)+'</option>').join("");
function changeTab(name){
  if(name==="whatsapp"&&token)loadWhatsAppInbox();
  if(name==="website")loadSiteEditor();
  if(name==="summary")loadQuickEditor();
 $$(".tabs button").forEach(b=>b.classList.toggle("current",b.dataset.tab===name));
 $$(".tabcontent").forEach(el=>el.hidden=el.id!=="tab-"+name);
}
$$( ".tabs button" ).forEach(el=>el.addEventListener("click",()=>changeTab(el.dataset.tab)));
$$( "[data-go-tab]" ).forEach(button=>button.addEventListener("click",()=>changeTab(button.dataset.goTab)));
$$("[data-wa-copy]").forEach(button=>button.addEventListener("click",async()=>{
 const key=button.dataset.waCopy,reply=$("#"+key)?.textContent?.trim();
 if(!reply){say("#waDraftFeedback","Balasan tidak tersedia.");return;}
 try{
  await navigator.clipboard.writeText(reply);
  say("#waDraftFeedback","Balasan disalin. Periksa informasi sebelum mengirim ke guest.",true);
 }catch{say("#waDraftFeedback","Penyalinan otomatis tidak tersedia. Pilih dan salin teks balasan secara manual.");}
}));

// Owner-only official WhatsApp inbox. This does not use WhatsApp Web or automate phone UI.
let waSelectedPhone="",waSendingEnabled=false;
const waSetStatus=(msg,ok=false)=>say("#waInboxFeedback",msg,ok);
function waRenderThread(phone,messages){
 waSelectedPhone=phone;
 $("#waThreadTitle").textContent="Guest: +"+phone;
 $("#waMessages").innerHTML=messages.length?messages.map(m=>'<div class="wa-bubble '+(m.direction==="OUT"?"wa-sent":"wa-received")+'"><p>'+esc(m.body)+'</p><small>'+(m.direction==="OUT"?"Owner":"Guest")+' · '+new Date(m.received_at*1000).toLocaleString()+'</small></div>').join(""):'<p class="feedback">Belum ada pesan yang didukung.</p>';
 $("#waSendApproved").disabled=!waSendingEnabled;
}
async function loadWhatsAppInbox(){
 if(!token)return;
 try{
  const result=await api("admin/whatsapp");
  const cfg=result.connection||{};
  waSendingEnabled=cfg.sending_enabled===true;
  $("#waConnectionStatus").textContent=cfg.webhook_ready
   ?(waSendingEnabled?"Cloud API terhubung: pesan masuk tersedia; balasan hanya setelah persetujuan owner.":"Webhook siap tetapi pengiriman belum diaktifkan.")
   :"Koneksi otomatis ke inbox WhatsApp belum aktif. Aktifkan WhatsApp Business Platform di Cloudflare setelah onboarding Meta.";
  const threads=Array.isArray(result.threads)?result.threads:[];
  $("#waThreadList").innerHTML=threads.length?threads.map(x=>'<button type="button" class="wa-thread-button" data-wa-phone="'+esc(x.phone)+'"><strong>+'+esc(x.phone)+'</strong><small>'+Number(x.message_count||0)+' pesan</small></button>').join(""):'<p class="feedback">Belum ada pesan terhubung. Guest tetap bisa menghubungi langsung melalui tombol WhatsApp publik.</p>';
  waSetStatus(cfg.webhook_ready?"Inbox diperbarui dari sistem resmi Meta.":"Belum terhubung. Jangan memasukkan token Meta atau OTP di halaman publik.",cfg.webhook_ready);
 }catch(err){waSetStatus(err.message);}
}
$("#waRefresh").onclick=loadWhatsAppInbox;
$("#waThreadList").addEventListener("click",async e=>{
 const btn=e.target.closest("[data-wa-phone]");if(!btn)return;
 try{
  const result=await api("admin/whatsapp/thread?phone="+encodeURIComponent(btn.dataset.waPhone));
  waRenderThread(result.phone,result.messages||[]);
  $("#waComposer").value="";
  waSetStatus("Percakapan dimuat. Anda bisa membuat draf; jangan menjanjikan booking sebelum verifikasi.",true);
 }catch(err){waSetStatus(err.message);}
});
$("#waDraftAI").onclick=async()=>{
 if(!waSelectedPhone){waSetStatus("Pilih percakapan terlebih dahulu.");return;}
 if(!confirm("Izinkan AI memproses pesan terbaru guest untuk membuat draf balasan? Draf tidak dikirim otomatis."))return;
 try{
  const result=await api("admin/whatsapp/draft","POST",{phone:waSelectedPhone,use_ai:true,language:"auto"});
  $("#waComposer").value=result.reply||"";
  waSetStatus("Draf "+(result.generator==="workers_ai"?"AI":"template")+" siap ditinjau. Tidak ada pengiriman otomatis.",true);
 }catch(err){waSetStatus(err.message);}
};
$("#waCopyComposer").onclick=async()=>{
 const message=$("#waComposer").value.trim();if(!message){waSetStatus("Tulis atau buat draf terlebih dahulu.");return;}
 try{await navigator.clipboard.writeText(message);waSetStatus("Draf tersalin, silakan kirim dari WhatsApp Business jika akun belum terhubung.",true);}
 catch{waSetStatus("Clipboard tidak tersedia. Salin teks draf secara manual.");}
};
$("#waSendApproved").onclick=async()=>{
 if(!waSendingEnabled||!waSelectedPhone){waSetStatus("Integrasi WhatsApp resmi belum aktif atau percakapan belum dipilih.");return;}
 const message=$("#waComposer").value.trim();
 if(message.length<2||message.length>1200){waSetStatus("Balasan harus 2–1200 karakter.");return;}
 if(!confirm("Kirim balasan ini SEKARANG ke +"+waSelectedPhone+" melalui WhatsApp Business Cloud API? Periksa isi, biaya pesan, dan persetujuan guest."))return;
 $("#waSendApproved").disabled=true;
 try{
  const result=await api("admin/whatsapp/send","POST",{phone:waSelectedPhone,message,owner_confirmed:true,client_nonce:crypto.randomUUID()});
  waSetStatus(result.status==="SUBMITTED_TO_META"?"Balasan dikirim ke Meta untuk diproses (belum tentu sudah terkirim ke HP guest).":"Permintaan diterima.",true);
  $("#waComposer").value="";
  const thread=await api("admin/whatsapp/thread?phone="+encodeURIComponent(waSelectedPhone));
  waRenderThread(waSelectedPhone,thread.messages||[]);
 }catch(err){waSetStatus(err.message);}
 finally{$("#waSendApproved").disabled=!waSendingEnabled||!waSelectedPhone;}
};

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
  const [summary,operators,rates,leads,quotes,bookings,finance,campaigns,market,business,marketingIntel]=await Promise.all([
   api("admin/summary"),api("admin/operators"),api("admin/rates"),api("admin/leads"),api("admin/quotes"),api("admin/bookings"),api("admin/finance"),api("admin/campaigns"),api("admin/market"),api("admin/business"),api("admin/marketing/intelligence")]);
  data={operators:operators.items,rates:rates.items,leads:leads.items,quotes:quotes.items,bookings:bookings.items,finance,campaigns:campaigns.items,market:market.items,marketingIntel};
  $("#stats").innerHTML=Object.entries(summary).map(([key,num])=>'<div class="stat"><strong>'+Number(num)+'</strong><span>'+esc({operators:"Operator",leads:"Guest leads",quotes:"Penawaran",bookings:"Booking"}[key]||key)+'</span></div>').join("");
  $("#rateOperator").innerHTML=options(data.operators);
  $("#quoteOperator").innerHTML=options(data.operators.filter(x=>x.status==="VERIFIED"));["#lunchOperator","#boatOutOperator","#boatReturnOperator"].forEach(selector=>{$(selector).innerHTML=options(data.operators.filter(x=>x.status==="VERIFIED"))});
  renderOperators();renderRates();renderLeads();renderQuotes();renderBookings();renderFinance();renderCampaigns();renderMarketingIntelligence();renderMarket();renderBusiness(business.business);void loadMetaDiagnostic();
  if(!$("#tab-summary").hidden)await loadQuickEditor();
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
 $("#rateList").innerHTML=data.rates.map(r=>'<div class="item"><div class="meta"><b>'+esc(r.operator_name)+' · '+esc(r.item_title)+' · '+esc(r.booking_mode||"LEGACY")+" · "+esc(r.variant_id||"DEFAULT")+'</b><span class="pill '+(r.verified?"good":"")+'">v'+r.version+' '+(r.verified?"Verified":"Draft")+'</span></div><div>'+money(r.net)+' / '+esc(r.pricing_scheme==='FIXED_PACKAGE'?'paket Private':r.pricing_scheme==='FIXED_VEHICLE'?'mobil':r.unit)+(r.capacity?" · "+r.capacity+" kursi":"")+(r.private_fixed_net?" · biaya eksklusif "+money(r.private_fixed_net):"")+(r.sharing_guaranteed?" · net per guest dijamin":"")+'</div><small>'+esc(r.active?"Tarif versi aktif":"Versi lama, tidak aktif")+'</small></div>').join("")||"<p>Belum ada tarif.</p>";
}
function renderLeads(){
 $("#leadList").innerHTML=data.leads.map(l=>'<div class="item"><div class="meta"><b>'+esc(l.name)+' · '+esc(l.activity_id)+' · '+esc(l.booking_mode||"LEGACY")+" · "+esc(l.variant_id||"DEFAULT")+'</b><span class="pill">'+esc(l.status)+'</span></div><small>'+esc(l.contact)+' · '+esc(l.requested_date)+' · '+l.guests+' guest</small><small>'+esc(l.message)+'</small><small>ID: '+esc(l.id)+'</small><div class="actions"><button class="outline" data-action="leadQualify" data-id="'+esc(l.id)+'">Kualifikasi</button><button class="outline" data-action="leadContact" data-id="'+esc(l.id)+'">Sudah dihubungi</button><button class="outline" data-action="salesAssist" data-id="'+esc(l.id)+'">Saran balasan AI</button></div></div>').join("")||"<p>Belum ada lead.</p>";
}
function renderQuotes(){
 $("#quoteList").innerHTML=data.quotes.map(q=>'<div class="item"><div class="meta"><b>'+esc(q.activity_id)+' · '+esc(q.booking_mode||"LEGACY")+" · "+esc(q.variant_id||"DEFAULT")+' · '+q.guests+' guest</b><span class="pill '+(q.status==="APPROVED"?"good":"")+'">'+esc(q.status)+'</span></div><div>Harga guest '+money(q.selling_price)+' · Net '+money(q.net)+'</div><small>'+esc(q.requested_date)+' · '+esc(q.operator_name)+' · ID '+esc(q.id)+'</small><div class="actions">'+
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
 const experience=["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(b.item_id);
 const mode=experience?b.booking_mode:"LEGACY";
 const unit=b.item_id==="ISLAND_TOUR_CAR"?"car":"person";
 const payload={operator_id:b.operator_id,item_id:b.item_id,booking_mode:mode,variant_id:experience?b.variant_id:"DEFAULT",pricing_scheme:!experience?"STANDARD":b.item_id==="SNORKELING_3_SPOTS"&&mode==="PRIVATE"?"FIXED_PACKAGE":b.item_id==="ISLAND_TOUR_CAR"&&mode!=="LEGACY"?"FIXED_VEHICLE":"STANDARD",unit,net:Number(b.net),
  capacity:experience&&b.capacity?Number(b.capacity):null,
  private_fixed_net:mode==="PRIVATE"&&b.item_id==="SNORKELING_3_SPOTS"?Number(b.private_fixed_net):0,
  sharing_guaranteed:mode==="SHARING"&&b.item_id==="SNORKELING_3_SPOTS"&&e.target.querySelector('[name="sharing_guaranteed"]').checked,
  verified:e.target.querySelector('[name="verified"]').checked};
 if(payload.verified&&!confirm("Sudah diverifikasi langsung dengan operator? Harga yang salah dapat merugikan guest dan agen."))return;
 try{await api("admin/rates","POST",payload);await refresh();say("#adminFeedback","Versi tarif baru disimpan. Quote lama tetap memakai snapshot.",true)}catch(err){say("#adminFeedback",err.message)}
};
function quotePayload(){
 const b=formValues($("#quoteForm"));const numberOrZero=x=>Number(x)||0;
 return {operator_id:b.operator_id,activity_id:b.activity_id,booking_mode:b.booking_mode,variant_id:b.variant_id,terms_accepted:$("#quoteForm [name=terms_accepted]").checked,guests:Number(b.guests),requested_date:b.requested_date,agency_costs:numberOrZero(b.agency_costs),payment_fee:numberOrZero(b.payment_fee),selling_price:b.selling_price?Number(b.selling_price):null,lead_id:b.lead_id||null,extras:{LUNCH:numberOrZero(b.lunch),BOAT_OUT:numberOrZero(b.boat_out),BOAT_RETURN:numberOrZero(b.boat_return)},extra_operators:{LUNCH:b.lunch_operator,BOAT_OUT:b.boat_out_operator,BOAT_RETURN:b.boat_return_operator}};
}
$("#previewQuote").onclick=async()=>{
 try{const p=(await api("admin/quotes/preview","POST",quotePayload())).preview;
  $("#previewOutput").textContent="Pilihan: "+(p.booking_mode||"LEGACY")+"\nTotal net: "+money(p.net)+"\nBatas aman (seluruh biaya + margin ≥Rp100.000): "+money(p.minimum)+"\nMinimum rata-rata per guest: "+money(p.minimumPerGuest)+"\nHarga rekomendasi matematika: "+money(p.recommendation)+"\n"+p.lines.map(l=>l.kind+": "+l.qty+" × "+money(l.unit_net)).join("\n")+"\n\nIni belum booking.";
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
function renderMarketingIntelligence(){
 const root=$("#marketingInsights"),info=data.marketingIntel;
 if(!root||!info)return;
 const num=Number(info.observation_count)||0;
 const hours=Object.entries(info.best_hours||{}).filter(([name])=>["Instagram","Facebook","TikTok"].includes(name));
 const timeLines=hours.map(([name,v])=>
  '<div class="item"><b>'+esc(name)+'</b> · '+(v.source==="MEASURED"?esc(String(v.hour).padStart(2,"0")+":00 WITA dari "+v.observations+" observasi"):"Belum cukup statistik asli untuk menyimpulkan jam terbaik")+'</div>').join("");
 const recommendations=(info.recommendations||[]).slice(0,3).map((v,i)=>
  '<div class="item">'+(i+1)+'. <b>'+esc(v.platform)+'</b> · '+esc(v.activity_id==="ISLAND_TOUR_CAR"?"Island Tour":"Snorkeling")+
  ' · skor strategi '+esc(v.strategy_score)+'/100 · '+esc(v.basis==="BELUM_ADA_DATA"?"uji variasi karena belum ada data":v.basis==="DATA_TERBATAS"?"data masih terbatas":"didasarkan pada metrik")+'</div>').join("");
 root.innerHTML='<p class="feedback">Observasi terverifikasi: <strong>'+num+'</strong> · Strategi v'+esc(info.strategy_version)+
  ' · Perencanaan mingguan aktif. <strong>Publikasi mandiri langsung dari Cloudflare belum terhubung ke Meta.</strong></p>'+
  '<h4>Waktu terbaik berdasarkan data</h4>'+timeLines+
  '<h4>Prioritas eksperimen konten berikutnya</h4>'+recommendations;
}
async function loadMetaDiagnostic(){
 const target=$("#metaDiagnosticResults");
 if(!target||!token)return;
 try{
  const status=await api("admin/marketing/meta/status"),latest=status.latest;
  if(!latest){target.textContent="Belum ada hasil tersimpan. Pemeriksaan otomatis pertama berjalan pada Cron harian 10.00 WITA. Anda dapat menekan Uji koneksi sekarang.";return;}
  const txt=latest.result==="READ_OK"?"Page dan Instagram dapat dibaca":
   latest.result==="READ_PARTIAL"?"Sebagian koneksi gagal":
   latest.result==="INCOMPLETE"?"Konfigurasi belum lengkap":"Keduanya belum dapat dibaca";
  target.innerHTML='<p class="feedback"><strong>'+esc(txt)+'</strong> · '+esc(latest.checked_at)+
   ' · '+esc(latest.source==="DAILY_CRON"?"Cron otomatis":"Uji pemilik")+
   ' · '+esc(status.check_fresh?"Data pemeriksaan terbaru":"Hasil lama, perlu pemeriksaan baru")+'</p>'+
   '<div class="item">Facebook Page: '+esc(latest.page.ok?"Berhasil":"Gagal / belum diuji")+
   ' (HTTP '+esc(latest.page.status??"—")+') · Instagram: '+esc(latest.instagram.ok?"Berhasil":"Gagal / belum diuji")+
   ' (HTTP '+esc(latest.instagram.status??"—")+')</div>'+
   '<p class="feedback">Riwayat '+esc(status.history.length)+' hari. Hasil akses baca tidak membuktikan izin posting maupun statistik insight.</p>'+
   (status.history||[]).slice(0,7).map(h=>'<small class="item">'+esc(h.day)+' · '+esc(h.result)+
    ' · FB '+esc(h.page.status??"—")+' / IG '+esc(h.instagram.status??"—")+'</small>').join('');
 }catch(e){target.textContent="Diagnostik belum bisa dimuat: "+e.message;}
}
$("#runMetaDiagnostic").onclick=async()=>{
 const b=$("#runMetaDiagnostic"),target=$("#metaDiagnosticResults");
 b.disabled=true;target.textContent="Menguji akses baca Facebook/Instagram (tidak melakukan posting)...";
 try{
  const r=await api("admin/marketing/meta/diagnostics","POST",{});
  await loadMetaDiagnostic();
  if(r.status==="RECENT_RESULT")target.prepend(document.createTextNode("Hasil dalam 5 menit terakhir digunakan kembali. "));
 }catch(e){target.textContent="Uji diagnostik gagal: "+e.message;}
 finally{b.disabled=false;}
};
function renderMarket(){
 $("#marketList").innerHTML=data.market.map(m=>'<div class="item"><div class="meta"><b>'+esc(m.platform)+' · '+esc(m.activity_id)+'</b><span class="pill">'+esc(m.verified?"Diperiksa":"Belum diverifikasi")+'</span></div><div>'+money(m.price)+' / '+esc(m.unit)+(m.group_size?" ('+m.group_size+' orang)":"")+'</div><small>Diamati '+esc(m.observed_on)+' · '+esc(m.inclusions)+'</small><small>'+esc(m.source_url)+'</small></div>').join("")||"<p>Belum ada referensi harga.</p>";
}
$("#marketingObservedOn").value=new Date().toISOString().slice(0,10);
$("#marketingMetricsForm").onsubmit=async e=>{
 e.preventDefault();
 const form=e.target,b=formValues(form);
 if(!form.querySelector('[name="owner_verified"]').checked)return;
 if(!confirm("Simpan statistik asli ini sebagai dasar pembelajaran AI? Periksa dulu impressions, engagement, dan klik."))return;
 for(const key of ["impressions","reach","reactions","comments","shares","saves","link_clicks"])b[key]=Number(b[key]);
 b.published_hour=b.published_hour.trim()?Number(b.published_hour):null;
 b.owner_verified=true;
 try{
  const res=await api("admin/marketing/observations","POST",b);
  $("#marketingMetricsFeedback").textContent="Statistik tercatat ("+res.id+"). Strategi dihitung ulang dari data asli.";
  form.reset();$("#marketingObservedOn").value=new Date().toISOString().slice(0,10);
  await refresh();
 }catch(err){$("#marketingMetricsFeedback").textContent="Tidak dapat menyimpan metrik: "+err.message;}
};
$("#refreshMetaQueue").onclick=async()=>{
 const target=$("#marketingPublicationQueue"),button=$("#refreshMetaQueue");
 button.disabled=true;target.textContent="Memeriksa status publikasi...";
 try{
  const data=await api("admin/marketing/publications");
  const current=data.independent_meta_publishing_enabled===true
   ?"Kredensial API Graph telah diatur. Periksa hasil dan izin Meta sebelum menyimpulkan posting berhasil."
   :"Publikasi langsung Cloudflare belum diaktifkan atau belum memenuhi gerbang izin. Kampanye Metricool yang sudah terjadwal tetap independen.";
  target.textContent=current+" Antrean: "+data.posts.length+" post.";
  const items=document.createElement("div");
  items.className="scroll";
  items.innerHTML=data.posts.slice(0,12).map(x=>'<div class="item"><b>'+esc(x.intended_date)+' · Ide '+esc(x.idea_index)+'</b> <span class="pill">'+esc(x.status)+'</span><small>Facebook: '+esc(x.facebook_post_id||"—")+' · Instagram: '+esc(x.instagram_post_id||"—")+'</small></div>').join("");
  target.append(items);
 }catch(e){target.textContent="Belum dapat memeriksa antrean publikasi: "+e.message;}
 finally{button.disabled=false;}
};
$("#prepareMarketingWeek").onclick=async()=>{
 if(!confirm("Buat 7 draf konten pemasaran mingguan (Instagram, Facebook, TikTok) untuk diperiksa? Belum ada publikasi otomatis."))return;
 const b=$("#prepareMarketingWeek");
 b.disabled=true;
 try{
  const result=await api("admin/marketing/prepare-week","POST",{owner_confirmed:true});
  $("#marketingWeekFeedback").textContent=result.generated>0
   ?"Berhasil menyiapkan "+result.generated+" draf untuk pekan "+result.week_start+". Periksa daftar kampanye. Facebook/Instagram tersambung ke Metricool; Cloudflare tidak otomatis menerbitkan draf tanpa API yang diotorisasi."
   :"Draf untuk pekan "+result.week_start+" sudah pernah dibuat. Tidak ada duplikasi.";
  await refresh();
 }catch(err){$("#marketingWeekFeedback").textContent="Gagal membuat draf: "+err.message;}
 finally{b.disabled=false;}
};
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

// Genuine owner-only two-language quick editor, sharing canonical CMS endpoint and version checks.
const QUICK_FIELDS=[["en","hero.title","quickTitleEn"],["en","hero.description","quickDescEn"],["id","hero.title","quickTitleId"],["id","hero.description","quickDescId"]];
let quickRecords=new Map(),quickLoaded=false;
const quickFallback={
 "en:hero.title":"Unforgettable adventures",
 "en:hero.description":"Discover breathtaking cliffs, sun-kissed beaches and the chance to encounter majestic manta rays. Your unforgettable Nusa Penida escape begins here.",
 "id:hero.title":"Liburan tak terlupakan",
 "id:hero.description":"Bayangkan birunya laut, megahnya tebing, dan kesempatan bertemu pari manta di habitat alaminya. Jelajahi keindahan Nusa Penida dalam perjalanan yang dirancang sesuai gaya liburan Anda."
};
async function loadQuickEditor(){
 if(!token)return;
 try{
  const result=await api("admin/site-content");
  quickRecords=new Map((result.items||[]).map(item=>[item.locale+":"+item.key,item]));
  for(const [locale,key,id] of QUICK_FIELDS){
   const idKey=locale+":"+key,original=window.NusaLanguage?.defaults(locale)?.[key];
   $("#"+id).value=quickRecords.get(idKey)?.value??original??quickFallback[idKey]??"";
  }
  quickLoaded=true;say("#quickFeedback","Judul dan deskripsi siap diedit.",true);
 }catch(err){quickLoaded=false;say("#quickFeedback",err.message)}
}
$("#quickSave").onclick=async()=>{
 const btn=$("#quickSave");if(!quickLoaded){say("#quickFeedback","Muat data admin sebelum mengubah konten.");return}
 btn.disabled=true;
 let updated=0;
 try{
  for(const [locale,key,id] of QUICK_FIELDS){
   const itemKey=locale+":"+key;
   const value=$("#"+id).value.trim();
   if(value.length<2||value.length>1200||/[<>\u0000-\u001f\u007f]/.test(value))throw Error("Konten "+locale+" harus berupa teks biasa 2–1200 karakter tanpa HTML.");
   const previous=quickRecords.get(itemKey);
   const fallback=window.NusaLanguage?.defaults(locale)?.[key]??quickFallback[itemKey]??"";
   if(value===(previous?.value??fallback))continue;
   const result=await api("admin/site-content","POST",{key,locale,value,expected_version:previous?.version||0,owner_confirmed:true});
   quickRecords.set(itemKey,result);updated++;
  }
  window.NusaLanguage?.resetCache();
  await window.NusaLanguage?.apply();
  say("#quickFeedback",updated?updated+" bagian diterbitkan. Muat ulang website publik untuk melihat perubahan.":"Tidak ada perubahan baru.",true);
 }catch(err){say("#quickFeedback","Sebagian perubahan mungkin sudah tersimpan ("+updated+" dari 4). "+err.message+" Muat ulang editor untuk mengambil versi terbaru.");quickLoaded=false;}
 finally{btn.disabled=false;}
};

// Versioned website content editor. All reading and publishing is authenticated on the Worker.
let cmsRecords=new Map(),cmsFields=[];
const cmsId=(key,locale)=>locale+":"+key;
function cmsSelection(){
 const key=$("#cmsKey").value,locale=$("#cmsLocale").value;
 const existing=cmsRecords.get(cmsId(key,locale));
 const fallback=window.NusaLanguage?.defaults(locale)||{};
 return {key,locale,existing,value:existing?.value??fallback[key]??""};
}
function syncCms(){
 const state=cmsSelection();
 $("#cmsValue").value=state.value;
 $("#cmsPreviewText").textContent=state.value||"Konten belum tersedia.";
 $("#cmsVersion").textContent=state.existing?"Versi terbit "+state.existing.version+" · "+state.existing.updated_at:"Belum ada revisi: menggunakan konten bawaan website.";
 say("#cmsFeedback","");
}
async function loadSiteEditor(){
 try{
  const response=await api("admin/site-content");
  cmsRecords=new Map((response.items||[]).map(x=>[cmsId(x.key,x.locale),x]));
  cmsFields=response.fields||[];
  const keyInput=$("#cmsKey"),previous=keyInput.value;
  keyInput.innerHTML=cmsFields.map(([key,label])=>'<option value="'+esc(key)+'">'+esc(label)+'</option>').join("");
  if(cmsFields.some(([key])=>key===previous))keyInput.value=previous;
  syncCms();
 }catch(err){say("#cmsFeedback",err.message);}
}
$("#cmsLocale").onchange=syncCms;
$("#cmsKey").onchange=syncCms;
$("#cmsValue").oninput=()=>{$("#cmsPreviewText").textContent=$("#cmsValue").value||"Konten kosong."};
$("#cmsPreview").onclick=()=>{ $("#cmsPreviewText").textContent=$("#cmsValue").value; say("#cmsFeedback","Pratinjau lokal. Konten belum diterbitkan.",true); };
$("#cmsPublish").onclick=async()=>{
 const state=cmsSelection(),value=$("#cmsValue").value.trim();
 if(value.length<2||value.length>1200){say("#cmsFeedback","Konten harus 2 sampai 1200 karakter.");return;}
 const button=$("#cmsPublish");button.disabled=true;
 try{
  const result=await api("admin/site-content","POST",{key:state.key,locale:state.locale,value,expected_version:state.existing?.version||0,owner_confirmed:true});
  cmsRecords.set(cmsId(result.key,result.locale),{...result,updated_at:new Date().toISOString()});
  window.NusaLanguage?.resetCache();
  await window.NusaLanguage?.apply();
  $("#cmsVersion").textContent="Versi terbit "+result.version+" (tersimpan ke D1).";
  say("#cmsFeedback","Konten diterbitkan. Pengunjung melihat versi terbaru saat memuat website.",true);
 }catch(err){say("#cmsFeedback",err.message);}
 finally{button.disabled=false;}
};

if(token){
 $("#adminArea").hidden=false;
 api("admin/summary").then(()=>{
  $("#unlockPanel").hidden=true;
  $("#adminContent").hidden=false;
  return refresh();
 }).catch(()=>{
  token="";sessionStorage.removeItem("tourAdmin");
  $("#unlockPanel").hidden=false;$("#adminContent").hidden=true;
  say("#loginMessage","Sesi berakhir; masukkan token admin lagi.");
 });
}

// Offline static shell only; no API, guest data or credentials are cached.
if("serviceWorker" in navigator)navigator.serviceWorker.register("/service-worker.js").catch(()=>{});
