import {LAYOUT_PREFIX,baseGroups,groupItems,readOrder,orderedKeys,moveTo} from "./content-order.mjs";
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const money=n=>"Rp"+new Intl.NumberFormat("id-ID").format(n||0);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let ownerSignedIn=false,data={operators:[],rates:[],leads:[],quotes:[],bookings:[],finance:{payables:[],changes:[]},campaigns:[],approvedQueue:[],autopilotEnabled:false,ownerPhotos:[],growth:null,market:[]},lastMarketing="",lastSales="";
const say=(id,msg,success=false)=>{const el=$(id);if(el){el.textContent=msg;el.style.color=success?"#167058":"#a24836"}};
async function api(path,method="GET",payload,admin=true){
 const headers={"accept":"application/json"};if(payload!==undefined)headers["content-type"]="application/json";
 // Auth uses a persistent HttpOnly same-origin session cookie; never send the raw admin token on ordinary API calls.
 const res=await fetch("/api/"+path,{method,headers,credentials:"same-origin",cache:"no-store",body:payload===undefined?undefined:JSON.stringify(payload)});
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
for(const [formId,selector] of [["#quoteForm","#quoteVariant"],["#rateForm","#rateVariant"]]){
 const form=$(formId);
 form.addEventListener("change",e=>{if(["activity_id","item_id","booking_mode"].includes(e.target.name))updateVariants(form,selector);});
 updateVariants(form,selector);
}
const options=(arr,label)=>arr.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name||x.title||label||x.id)+'</option>').join("");
const NPE_WORKSPACES={
 home:{name:"Beranda",defaultTab:"summary",title:"Overview",description:"Semua yang perlu ditangani hari ini, dalam satu tampilan."},
 sales:{name:"Tamu & Penjualan",defaultTab:"leads",title:"Kelola calon tamu",description:"Permintaan tamu, penawaran, reservasi dan komunikasi."},
 content:{name:"Konten & Kampanye",defaultTab:"campaigns",title:"Konten yang menghasilkan",description:"Tinjau media, persetujuan konten, jadwal dan website."},
 growth:{name:"Akuisisi Pelanggan",defaultTab:"growth",title:"Temukan pelanggan",description:"Riset peluang terbaru untuk Penida dan Lembongan."},
 analytics:{name:"Analitik",defaultTab:"analytics",title:"Performa aktual",description:"Keputusan berdasarkan data tersimpan, bukan angka perkiraan."},
 settings:{name:"Pengaturan",defaultTab:"business",title:"Pengaturan usaha",description:"Operator, harga net dan konfigurasi bisnis."}
};
const NPE_PAGE_GROUP={
 summary:"home",leads:"sales",quotes:"sales",bookings:"sales",finance:"sales",whatsapp:"sales",
 campaigns:"content",marketing:"content",website:"content",articles:"content",keywords:"content",reviews:"content",
 growth:"growth",market:"growth",analytics:"analytics",
 business:"settings",operators:"settings",rates:"settings"
};
let navRestoring=false,navTab="summary";
function recordDashboardNav(patch={},replace=false){
 if(!ownerSignedIn||navRestoring)return;
 const prev=history.state?.npeDashboard||{};
 const state={...prev,tab:navTab,...patch};
 const hash="#"+[state.tab,state.tab==="website"?state.view:"",state.tab==="website"&&state.view==="pages"?state.page:"",state.tab==="articles"?state.article:"",state.pane===undefined?"":"pane-"+state.pane].filter(Boolean).map(encodeURIComponent).join("/");
 const current=history.state?.npeDashboard;
 if(current&&JSON.stringify(current)===JSON.stringify(state)&&!replace)return;
 history[replace||!current?"replaceState":"pushState"]({...history.state,npeDashboard:state},"",hash);
}
function dashboardBack(){
 if(history.state?.npeDashboard&&history.length>1){history.back();return;}
 if(navTab!=="summary")changeTab("summary");
}
window.addEventListener("popstate",event=>{
 if(!ownerSignedIn)return;
 const state=event.state?.npeDashboard;if(!state)return;
 navRestoring=true;
 try{
  if(navTab!==state.tab)changeTab(state.tab);
  if(state.tab==="website"){
   if(state.page&&[...$("#cmsPagePicker").options].some(x=>x.value===state.page))$("#cmsPagePicker").value=state.page;
   cmsView(state.view||"published");
   if(state.view==="activity")cmsForm.hidden=false;
  }
  if(state.tab==="articles"){if(!state.article)$("#seoForm").hidden=true;else if(seoEditing?.id===state.article||state.article==="new")$("#seoForm").hidden=false;else{const item=seoItems.find(x=>x.id===state.article);if(item)editSeoArticle(item);}}
  if(Number.isInteger(state.pane))document.querySelector("#tab-"+state.tab+" .dashPaneNav [data-pane='"+state.pane+"']")?.click();
 }finally{navRestoring=false;}
});
function changeTab(name){
 const page=document.getElementById("tab-"+name);if(!page)return;
 navTab=name;recordDashboardNav({tab:name,view:name==="website"?npeCmsView:undefined,page:name==="website"?$("#cmsPagePicker").value:undefined,article:undefined,pane:undefined});
 const group=NPE_PAGE_GROUP[name]||"home",workspace=NPE_WORKSPACES[group];
 sessionStorage.setItem("npe-dashboard-tab",name);
 if(name==="whatsapp"&&ownerSignedIn)void loadWhatsAppInbox();
 if(name==="website"&&ownerSignedIn){void loadWebsiteCMS();}
 if(name==="articles"&&ownerSignedIn)void loadSeoArticles();
 if(name==="keywords"&&ownerSignedIn)void loadKeywords();
 if(name==="reviews"&&ownerSignedIn)void loadOwnerReviews();
 if(name==="summary"&&ownerSignedIn)void loadQuickEditor();
 if(name==="analytics"&&ownerSignedIn)void loadDashboardAnalytics();
 if(name==="growth"&&ownerSignedIn)void loadSavedFacebookGroups().catch(err=>say("#growthGroupFeedback","Gagal memuat grup: "+err.message));
 document.querySelectorAll(".tabs button").forEach(b=>{
  const active=b.dataset.tab===name;
  b.classList.toggle("current",active);
  b.hidden=b.dataset.group!==undefined&&b.dataset.group!==group;
  b.setAttribute("aria-selected",String(active));b.setAttribute("tabindex",active?"0":"-1");
 });
 document.querySelectorAll(".tabcontent").forEach(el=>el.hidden=el!==page);
 document.querySelectorAll("[data-workspace]").forEach(b=>{
  const active=b.dataset.workspace===group;
  b.classList.toggle("current",active);b.setAttribute("aria-current",active?"page":"false");
 });
 const title=$("#dashCurrentPage"),current=$(".tabs button.current");
 if(title)title.textContent=current?.textContent||workspace.name;
 const secTitle=$("#dashSectionTitle");if(secTitle)secTitle.textContent=workspace.name;
 const header=$("#dashHeadingTitle");if(header)header.textContent=workspace.title;
 const desc=$("#dashHeadingDescription");if(desc)desc.textContent=workspace.description;
 const crumb=$("#dashWorkspaceName");if(crumb)crumb.textContent=workspace.name;
 const menu=$("#dashNavigation"),toggle=$("#dashMenuToggle");menu?.classList.remove("open");toggle?.setAttribute("aria-expanded","false");
 window.scrollTo?.({top:0,behavior:"instant"});
}
$("#dashBack").onclick=dashboardBack;
const dashMenuToggle=$("#dashMenuToggle");
if(dashMenuToggle)dashMenuToggle.onclick=()=>{
 const open=$("#dashNavigation").classList.toggle("open");dashMenuToggle.setAttribute("aria-expanded",String(open));
};
document.querySelectorAll(".tabs button").forEach(el=>el.addEventListener("click",()=>changeTab(el.dataset.tab)));
document.querySelectorAll("[data-go-tab]").forEach(button=>button.addEventListener("click",()=>changeTab(button.dataset.goTab)));
document.querySelectorAll("[data-workspace]").forEach(button=>button.addEventListener("click",()=>{
 const group=NPE_WORKSPACES[button.dataset.workspace];
 if(group)changeTab(group.defaultTab);
}));
// Break long operational pages into short, selectable panels without replacing their existing forms or handlers.
function initCompactPanels(){
 if(typeof document.createElement!=="function")return;
 const layouts={
  growth:["Riset peluang","Percakapan & mitra","Facebook Groups","Funnel"],
  campaigns:["Pustaka foto","Draf & persetujuan","Jadwal konten","Analisis konten"],
  whatsapp:["Koneksi WhatsApp","Kotak masuk","Balasan cepat"],
  operators:["Tambah operator","Daftar mitra"],
  rates:["Kelola tarif","Riwayat tarif"],
  quotes:["Buat penawaran","Daftar penawaran"],
  market:["Catat harga","Referensi pasar"],
  // Website has its own Published / Draft / Pages / Media navigation.
  marketing:["Buat draf","Hasil draf"]
 };
 for(const [tabName,titles] of Object.entries(layouts)){
  const panel=document.getElementById("tab-"+tabName);
  if(!panel?.children?.length || panel.dataset.compactReady==="true")continue;
  const direct=Array.from(panel.children).filter(el=>el.nodeType===1);
  const split=direct.length===1&&direct[0].classList?.contains("split")?direct[0]:null;
  const container=split||panel;
  const children=Array.from(container.children).filter(el=>el.nodeType===1);
  if(children.length<2)continue;
  if(split)split.classList.add("dashCompactSplit");
  const nav=document.createElement("div");
  nav.className="dashPaneNav";nav.setAttribute("aria-label","Bagian "+tabName);
  const wrappers=[];
  children.forEach((child,i)=>{
   const wrap=document.createElement("div");
   wrap.className="dashPane";wrap.dataset.pane=String(i);
   wrap.appendChild(child);container.appendChild(wrap);wrappers.push(wrap);
   const btn=document.createElement("button");
   btn.type="button";btn.className="dashPaneBtn";btn.textContent=titles[i]||"Bagian "+(i+1);
   btn.dataset.pane=String(i);btn.setAttribute("aria-pressed","false");
   nav.appendChild(btn);
   btn.addEventListener("click",()=>{select(i);recordDashboardNav({pane:i});});
  });
  panel.insertBefore(nav,panel.firstChild);
  function select(index){
   wrappers.forEach((el,i)=>el.hidden=i!==index);
   Array.from(nav.children).forEach((b,i)=>{b.classList.toggle("current",i===index);b.setAttribute("aria-pressed",String(i===index))});
   sessionStorage.setItem("npe-dashboard-pane:"+tabName,String(index));
  }
  const saved=Number(sessionStorage.getItem("npe-dashboard-pane:"+tabName)||0);
  select(Number.isSafeInteger(saved)&&saved>=0&&saved<wrappers.length?saved:0);
  panel.dataset.compactReady="true";
 }
}
initCompactPanels();

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
 if(!ownerSignedIn)return;
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

async function enterOwnerDashboard(){
 ownerSignedIn=true;
 $("#unlockPanel").hidden=true;$("#adminContent").hidden=false;$("#lock").hidden=false;$("#dashBack").hidden=false;
 const previous=history.state?.npeDashboard;
 navRestoring=true;
 try{changeTab(previous?.tab||sessionStorage.getItem("npe-dashboard-tab")||"summary");if(previous?.tab==="website"){if(previous.page)$("#cmsPagePicker").value=previous.page;cmsView(previous.view==="activity"?"published":previous.view||"published");}}finally{navRestoring=false;}
 recordDashboardNav({tab:navTab,view:navTab==="website"?npeCmsView:undefined,page:navTab==="website"?$("#cmsPagePicker").value:undefined},true);
 await refresh();
}
$("#lock").onclick=async()=>{
 const button=$("#lock");button.disabled=true;
 try{
  await api("admin/session/logout","POST",{});
  ownerSignedIn=false;
  sessionStorage.removeItem("tourAdmin");
  $("#adminContent").hidden=true;$("#unlockPanel").hidden=false;button.hidden=true;$("#dashBack").hidden=true;
  $("#adminToken").value="";
  data={operators:[],rates:[],leads:[],quotes:[],bookings:[],finance:{payables:[],changes:[]},campaigns:[],approvedQueue:[],autopilotEnabled:false,ownerPhotos:[],growth:null,market:[]};
  say("#loginMessage","Anda sudah logout. Masukkan admin token untuk login kembali.",true);
 }catch(err){say("#adminFeedback","Logout belum berhasil: "+err.message+". Sesi tidak diubah.");}
 finally{button.disabled=false;}
};
const witaToday=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
$("#quoteDate").min=witaToday;$("#marketDate").value=witaToday;$("#marketDate").max=witaToday;
$("#unlock").onclick=async()=>{
 const value=$("#adminToken").value.trim();
 if(value.length<24){say("#loginMessage","Token minimal 24 karakter");return;}
 const button=$("#unlock");button.disabled=true;
 try{
  await api("admin/session/login","POST",{token:value});
  $("#adminToken").value="";
  sessionStorage.removeItem("tourAdmin");
  say("#adminFeedback","Login berhasil. Sesi akan dipulihkan saat aplikasi dibuka kembali.",true);
  await enterOwnerDashboard();
 }catch(err){$("#adminToken").value="";say("#loginMessage",err.message);}
 finally{button.disabled=false;}
};
async function refresh(){
 try{
  const [summary,operators,rates,leads,quotes,bookings,finance,campaigns,market,business,marketingIntel,autoQueue,photos,growth]=await Promise.all([
   api("admin/summary"),api("admin/operators"),api("admin/rates"),api("admin/leads"),api("admin/quotes"),api("admin/bookings"),api("admin/finance"),api("admin/campaigns"),api("admin/market"),api("admin/business"),api("admin/marketing/intelligence"),api("admin/marketing/approved-queue"),api("admin/photos"),api("admin/growth")]);
  data={operators:operators.items,rates:rates.items,leads:leads.items,quotes:quotes.items,bookings:bookings.items,finance,campaigns:campaigns.items,market:market.items,marketingIntel,approvedQueue:autoQueue.posts,autopilotEnabled:autoQueue.enabled,ownerPhotos:photos.items,growth};
  $("#stats").innerHTML=Object.entries(summary).map(([key,num])=>'<div class="stat"><strong>'+Number(num)+'</strong><span>'+esc({operators:"Operator",leads:"Guest leads",quotes:"Penawaran",bookings:"Booking"}[key]||key)+'</span></div>').join("");
  $("#rateOperator").innerHTML=options(data.operators);
  $("#quoteOperator").innerHTML=options(data.operators.filter(x=>x.status==="VERIFIED"));["#lunchOperator","#boatOutOperator","#boatReturnOperator"].forEach(selector=>{$(selector).innerHTML=options(data.operators.filter(x=>x.status==="VERIFIED"))});
  renderOperators();renderRates();renderLeads();renderQuotes();renderBookings();renderFinance();renderCampaigns();renderOwnerPhotos();renderGrowth();renderMarketingIntelligence();renderMarket();renderBusiness(business.business);void loadMetaDiagnostic();
  renderDashPriorities();
  if(!$("#tab-summary").hidden)await loadQuickEditor();
  say("#adminFeedback","Data diperbarui.",true);
 }catch(err){say("#adminFeedback",err.message)}
}
function renderDashPriorities(){
 const target=$("#dashPriorities");if(!target)return;
 const leads=Array.isArray(data.leads)?data.leads:[],campaigns=Array.isArray(data.campaigns)?data.campaigns:[],operators=Array.isArray(data.operators)?data.operators:[];
 const openLeads=leads.filter(x=>!["CONVERTED","CLOSED","CANCELLED","REJECTED"].includes(String(x.status||"").toUpperCase())).length;
 const reviewCampaigns=campaigns.filter(x=>["DRAFT","REVIEW","PENDING_REVIEW"].includes(String(x.status||"").toUpperCase())).length;
 const pendingOperators=operators.filter(x=>x.status!=="VERIFIED").length;
 const actionable=[
  {tab:"leads",title:"Periksa permintaan tamu",info:openLeads+" permintaan dalam proses"},
  {tab:"campaigns",title:"Review kampanye",info:reviewCampaigns+" draf perlu dicek"},
  {tab:"operators",title:"Verifikasi operator",info:pendingOperators+" operator belum terverifikasi"}
 ];
 target.innerHTML=actionable.map(x=>'<button class="dashPriorityItem" type="button" data-go-tab="'+x.tab+'"><span><strong>'+esc(x.title)+'</strong><small>'+esc(x.info)+'</small></span><span aria-hidden="true">↗</span></button>').join("");
}
$("#dashPriorities")?.addEventListener("click",e=>{
 const action=e.target.closest("[data-go-tab]");if(action)changeTab(action.dataset.goTab);
});
async function loadDashboardAnalytics(){
 if(!ownerSignedIn)return;
 const el=$("#dashAnalyticsStats"),sales=$("#dashAnalyticsSales"),posts=$("#dashAnalyticsCampaigns");
 try{
  const a=await api("admin/analytics");
  const groups=[["Permintaan",a.leads],["Penawaran",a.quotes],["Booking",a.bookings],["Konten",a.campaigns]];
  const total=rows=>(Array.isArray(rows)?rows:[]).reduce((acc,x)=>acc+Number(x.n||0),0);
  if(el)el.innerHTML=groups.map(([label,rows])=>'<article class="dashMetric"><span>'+esc(label)+'</span><strong>'+total(rows)+'</strong><small>Rekaman tersimpan</small></article>').join("");
  function breakdown(rows){return (Array.isArray(rows)&&rows.length?rows.map(x=>
   '<div class="dashMetricLine"><span>'+esc(x.status||"Belum berstatus")+'</span><strong>'+Number(x.n||0)+'</strong></div>').join(""):'<p class="feedback">Belum ada data tercatat.</p>')}
  if(sales)sales.innerHTML='<h4>Permintaan tamu</h4>'+breakdown(a.leads)+'<h4>Penawaran & booking</h4>'+breakdown(a.quotes)+breakdown(a.bookings);
  if(posts)posts.innerHTML=breakdown(a.campaigns)+'<p class="feedback">Jangkauan dan impresi tidak ditampilkan jika belum tersedia dari platform.</p>';
 }catch(err){if(el)el.textContent="Analitik belum dapat dimuat: "+err.message;}
}
const dashRefreshAnalytics=$("#dashRefreshAnalytics");if(dashRefreshAnalytics)dashRefreshAnalytics.onclick=loadDashboardAnalytics;
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
 try{await api("admin/business","PATCH",b);await refresh();say("#adminFeedback","Pengaturan usaha disimpan. Testimoni publik memakai Turnstile dan persetujuan; permintaan wisata melalui WhatsApp.",true)}
 catch(e){say("#adminFeedback",e.message)}
};
function renderOwnerPhotos(){
 const root=$("#ownerPhotoList");if(!root)return;
 const photos=data.ownerPhotos||[];
 root.innerHTML=photos.length?photos.map(p=>
  '<div class="ownerPhotoTile"><img src="'+esc(p.url)+'" alt="'+esc(p.title)+'" loading="lazy" decoding="async">'+
  '<div><strong>'+esc(p.title)+'</strong><small>'+esc(p.activity_id==="ISLAND_TOUR_CAR"?"Island Tour":"Snorkeling")+
  ' · '+esc((p.bytes/1024).toFixed(0))+' KB · '+esc(p.queued_posts)+' posting terkait</small></div></div>'
 ).join(""):'<p class="feedback">Belum ada foto milik Anda. Tekan + Add Foto untuk menambahkan.</p>';
}
async function compressOwnerPhoto(file,profile="default"){
 if(!file||file.size>15000000)throw Error("Foto sumber maksimum 15 MB");
 let bitmap;
 try{bitmap=await createImageBitmap(file);}
 catch(_){throw Error("Jenis foto tidak bisa dibuka di browser ini. Pilih JPEG, PNG, atau WebP.");}
 try{
  let scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
  if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>50000000)throw Error("Resolusi foto terlalu besar");
  const canvas=document.createElement("canvas");
  const article=profile==="article";
  let best=null;
  for(const maxEdge of article?[1600,1400,1200]:[1600,1400,1200,1000]){
   scale=Math.min(1,maxEdge/Math.max(bitmap.width,bitmap.height));
   canvas.width=Math.max(1,Math.round(bitmap.width*scale));
   canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const context=canvas.getContext("2d");
   if(!context)throw Error("Browser tidak mendukung kompresi foto");
   if(article){context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.imageSmoothingEnabled=true;context.imageSmoothingQuality="high";}
   context.drawImage(bitmap,0,0,canvas.width,canvas.height);
   for(const q of article?[0.90,0.86,0.82,0.78]:[0.86,0.74,0.62,0.50]){
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",q));
    if(blob&&blob.size>=10000&&blob.size<=850000){
     if(!article||blob.size<=300000)return blob;
     // Preserve the highest-resolution/highest-quality valid fallback instead of forcing a tiny image.
     if(!best)best=blob;
    }
   }
   if(article&&Math.max(bitmap.width,bitmap.height)<=maxEdge&&maxEdge===1200)break;
  }
  if(best)return best;
  throw Error("Foto tidak memenuhi batas 10–850 KB dengan kualitas yang layak. Pilih foto lain.");
 }finally{bitmap.close?.();}
}
$("#ownerPhotoForm").onsubmit=async e=>{
 e.preventDefault();
 const b=$("#ownerPhotoUpload");
 b.disabled=true;say("#ownerPhotoFeedback","Memproses dan mengunggah foto ...",true);
 try{
  if(!$("#ownerPhotoRights").checked)throw Error("Konfirmasi hak penggunaan foto diperlukan");
  const file=$("#ownerPhotoFile").files?.[0];
  const jpeg=await compressOwnerPhoto(file);
  const form=new FormData();
  form.append("file",jpeg,"npe-photo.jpg");
  form.append("title",$("#ownerPhotoTitle").value.trim());
  form.append("activity_id",$("#ownerPhotoActivity").value);
  form.append("rights_confirmed","true");
  const response=await fetch("/api/admin/photos",{method:"POST",credentials:"same-origin",cache:"no-store",body:form});
  const json=await response.json();
  if(!response.ok)throw Error(json.error||"Upload gagal ("+response.status+")");
  e.target.reset();
  await refresh();
  say("#ownerPhotoFeedback","Foto berhasil ditambahkan: "+json.photo.title+". Pilih melalui menu foto pada kartu draf.",true);
 }catch(err){say("#ownerPhotoFeedback",err.message);}
 finally{b.disabled=false;}
};
function renderSavedFacebookGroups(groups){
 groups=Array.isArray(groups)?groups:[];
 const status=$("#growthGroupCount");
 if(status)status.textContent=groups.length+" grup tersimpan di database";
 const list=$("#growthGroupList"),select=$("#growthGroupSelect");
 if(!list||!select)return;
 list.innerHTML=groups.length?groups.map(x=>
  '<div class="item"><b>'+esc(x.name)+'</b><small>'+esc(x.destination==="NUSA_LEMBONGAN"?"Nusa Lembongan":"Nusa Penida")+
  ' · '+esc({RESEARCH:"Perlu periksa aturan",JOINED_MANUALLY:"Sudah bergabung (ditandai pemilik)",NO_PROMOTION:"Promosi dilarang"}[x.status]||x.status)+'</small>'+
  '<small>Aturan: '+esc(x.rules_note)+'</small>'+
  '<a class="outline small" href="'+esc(x.group_url)+'" target="_blank" rel="noopener noreferrer">Buka grup di Facebook ↗</a>'+
  (x.status==="RESEARCH"?'<button class="outline small" data-group-status="JOINED_MANUALLY" data-id="'+esc(x.id)+'">Saya sudah bergabung</button>':"")+
  (x.status!=="NO_PROMOTION"?'<button class="outline small" data-group-status="NO_PROMOTION" data-id="'+esc(x.id)+'">Promosi dilarang</button>':"")+
  '<button class="outline small" data-group-status="DISMISSED" data-id="'+esc(x.id)+'">Arsipkan</button></div>'
 ).join(""):'<p class="feedback">Belum ada grup tersimpan. Isi form dan tekan Simpan grup untuk menambahkan.</p>';
 const selected=select.value;
 select.innerHTML='<option value="">Pilih grup tersimpan</option>'+groups
  .filter(x=>x.status!=="NO_PROMOTION").map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+' · '+esc(x.destination==="NUSA_LEMBONGAN"?"Lembongan":"Penida")+'</option>').join("");
 if(groups.some(x=>x.id===selected))select.value=selected;
}
async function loadSavedFacebookGroups(){
 const res=await api("admin/growth/facebook-groups");
 if(!Array.isArray(res.groups))throw Error("Daftar grup tidak tersedia dari database");
 renderSavedFacebookGroups(res.groups);
 return res.groups;
}
function renderGrowth(){
 const g=data.growth||{},opportunities=Array.isArray(g.opportunities)?g.opportunities:[];
 const stats=$("#growthStats");
 if(!stats)return;
 const clickTotal=Number(g.click_count_30d||0);
 stats.innerHTML=[
  ["Klik WhatsApp (30 hari)",clickTotal,"Klik, bukan chat masuk"],
  ["Peluang riset",opportunities.filter(x=>x.status==="REVIEW").length,"Pertanyaan publik untuk diperiksa"],
  ["Interaksi dicatat",opportunities.filter(x=>["CONTACTED","RESPONDED"].includes(x.status)).length,"Ditandai manual oleh pemilik"],
  ["Lead terdaftar",Number(g.leads||0),"Kontak yang masuk dengan persetujuan"],
  ["Booking",Number(g.bookings||0),"Pesanan nyata"]
 ].map(([label,val,caption])=>'<div class="growthKpi"><small>'+esc(label)+'</small><strong>'+esc(val)+'</strong><small>'+esc(caption)+'</small></div>').join("");
 const statuses={REVIEW:"Perlu tinjauan",SHORTLISTED:"Siap ditindaklanjuti",CONTACTED:"Sudah dihubungi",RESPONDED:"Ada respons",DISMISSED:"Diabaikan"};
 const sources={REDDIT_PUBLIC_RSS:"Pertanyaan publik",OSM_PUBLIC_BUSINESSES:"Data bisnis publik · © OpenStreetMap contributors (ODbL)",OWNER_PARTNER:"Calon mitra ditambahkan pemilik",BLUESKY_PUBLIC:"Bluesky · postingan publik",FACEBOOK_PAGE_COMMENTS:"Facebook · komentar pada Page sendiri",INSTAGRAM_MEDIA_COMMENTS:"Instagram · komentar pada akun bisnis sendiri",YOUTUBE_PUBLIC_VIDEO:"YouTube · video publik (bukan calon booking terverifikasi)",FACEBOOK_GROUP_MANUAL:"Facebook Group · ditinjau manual oleh pemilik"};
 $("#growthOpportunities").innerHTML=opportunities.length?
  opportunities.map(o=>
   '<article class="growthOpportunity"><div class="meta"><strong>'+esc(o.headline)+'</strong><span class="pill">'+esc(statuses[o.status]||o.status)+'</span></div>'+
   '<small>'+esc(sources[o.source]||o.source)+' · Skor kecocokan '+esc(o.score)+'/100 · '+esc(o.theme)+' · '+esc(o.destination==="NUSA_LEMBONGAN"?"Nusa Lembongan":o.destination==="NUSA_PENIDA"?"Nusa Penida":"Bali umum")+(Number.isFinite(o.age_hours)?' · Diterbitkan '+esc(Math.max(0,o.age_hours))+' jam lalu':'')+'</small>'+
   '<p class="growthSuggestion">'+esc(o.suggested_reply)+'</p><div class="actions">'+
   '<a class="outline small" target="_blank" rel="noopener noreferrer" href="'+esc(o.source_url)+'">Baca sumber &amp; aturan ↗</a>'+
   '<button class="outline small" data-action="growthCopy" data-id="'+esc(o.id)+'">Salin saran</button>'+
   (o.status==="REVIEW"?'<button class="outline small" data-action="growthShortlist" data-id="'+esc(o.id)+'">Prioritaskan</button>':"")+
   (["REVIEW","SHORTLISTED"].includes(o.status)?'<button class="outline small" data-action="growthContacted" data-id="'+esc(o.id)+'">Sudah berinteraksi</button>':"")+
   (o.status==="CONTACTED"?'<button class="outline small" data-action="growthResponded" data-id="'+esc(o.id)+'">Ada respons</button>':"")+
   '<button class="outline small" data-action="growthDismiss" data-id="'+esc(o.id)+'">Abaikan</button></div></article>'
  ).join(""):'<p class="feedback">Belum ada pertanyaan publik yang cocok. Anda bisa membuka tautan riset komunitas atau menambahkan mitra. Ini bukan bukti ada calon tamu yang ditemukan.</p>';
 $("#growthHubs").innerHTML=(g.hubs||[]).map(h=>
   '<div class="item"><b>'+esc(h.name)+'</b><small>'+esc(h.description)+'</small>'+
   '<a class="outline small" href="'+esc(h.url)+'" target="_blank" rel="noopener noreferrer">Telusuri manual ↗</a></div>').join("");
 renderSavedFacebookGroups(g.facebook_groups);
 const clickRows=g.clicks||[];
 $("#growthClickStats").innerHTML=clickRows.length?
  '<div class="growthClickList">'+clickRows.slice(0,24).map(x=>
    '<span>'+esc(x.day)+' · '+esc(x.source)+' · '+esc(x.landing)+'</span><strong>'+esc(x.count)+' klik</strong>').join("")+'</div>':
  '<p class="feedback">Belum ada klik WhatsApp terukur. Saat pengunjung menekan tombol chat di website, jumlah klik agregat tercatat tanpa identitas mereka.</p>';
 const scans=g.research||[];
 const status={FOUND:"Ada hasil",NO_MATCH:"Belum ada yang cocok",SOURCE_UNAVAILABLE:"API tidak tersedia / akses terbatas"};
 const displaySource={BLUESKY_PUBLIC:"Bluesky",FACEBOOK_PAGE_COMMENTS:"Facebook Page",INSTAGRAM_MEDIA_COMMENTS:"Instagram Bisnis",YOUTUBE_PUBLIC_VIDEO:"YouTube",REDDIT_PUBLIC_RSS:"Reddit",OSM_PUBLIC_BUSINESSES:"Mitra hotel"};
 $("#growthResearchStatus").textContent=scans.length?
  "Sumber terpantau: "+scans.slice(0,8).map(x=>(displaySource[x.source]||x.source)+" · "+(status[x.result]||x.result)+" ("+x.candidates+")").join(" | ")+
  ". Temuan adalah bahan riset, bukan calon pelanggan yang sudah menyetujui kontak.":
  "Pemindaian multi-platform memakai Cron yang sudah ada, dengan jeda riset untuk tiap sumber; dapat dicoba sekarang secara manual.";
}
$("#growthRefresh").onclick=refresh;
$("#growthResearch").onclick=async()=>{
 const button=$("#growthResearch");
 button.disabled=true;say("#growthFeedback","Mencari peluang dari sumber publik ...",true);
 try{
  const result=await api("admin/growth/research","POST",{owner_confirmed:true});
  await refresh();
  say("#growthFeedback",result.status==="FOUND"?
   "Tercatat "+result.discovered+" temuan baru lintas platform. Periksa apakah benar pertanyaan calon tamu sebelum berinteraksi.":
   result.status==="RECENTLY_SCANNED"?"Sumber telah diperiksa baru-baru ini; pemindaian selanjutnya mengikuti jeda masing-masing platform.":
   "Belum ada kandidat. Sumber mungkin membatasi akses; gunakan tautan riset komunitas.",result.status==="FOUND");
 }catch(err){say("#growthFeedback","Pencarian gagal: "+err.message)}
 finally{button.disabled=false;}
};
$("#growthPartnerForm").onsubmit=async e=>{
 e.preventDefault();
 const payload=formValues(e.target);
 if(!confirm("Catat calon mitra bisnis publik ini untuk ditinjau? Agen tidak akan menghubunginya otomatis."))return;
 try{
  const result=await api("admin/growth/partners","POST",{...payload,owner_confirmed:true});
  e.target.reset();await refresh();say("#growthFeedback","Calon mitra disimpan untuk ditinjau: "+result.id,true);
 }catch(err){say("#growthFeedback",err.message)}
};
// User-curated Facebook Groups: no Graph Groups requests and no autonomous social actions.
$("#growthGroupsReload").onclick=async()=>{
 const button=$("#growthGroupsReload");button.disabled=true;
 try{
  const groups=await loadSavedFacebookGroups();
  data.growth={...(data.growth||{}),facebook_groups:groups};
  say("#growthGroupFeedback","Daftar terbaru dari database: "+groups.length+" grup tersimpan.",true);
 }catch(err){say("#growthGroupFeedback","Tidak bisa memuat daftar grup: "+err.message);}
 finally{button.disabled=false;}
};
$("#growthGroupForm").onsubmit=async e=>{
 e.preventDefault();
 const form=e.target,button=form.querySelector('[type="submit"]'),b=formValues(form);
 if(button?.disabled)return;
 if(!confirm("Simpan tautan grup untuk ditinjau manual? Tidak ada tindakan otomatis pada Facebook."))return;
 if(button)button.disabled=true;
 say("#growthGroupFeedback","Menyimpan grup ke database Cloudflare ...",true);
 try{
  const result=await api("admin/growth/facebook-groups","POST",{...b,owner_confirmed:true});
  if(!result.saved||!result.group?.id)throw Error("Server belum mengonfirmasi penyimpanan grup");
  // Confirmation is backed by a read-after-write D1 query, even if the full acquisition refresh fails.
  renderSavedFacebookGroups([result.group,...(Array.isArray(data.growth?.facebook_groups)?data.growth.facebook_groups:[]).filter(x=>x.id!==result.group.id)]);
  form.reset();
  const notice=result.already_exists?"Grup sudah tersimpan sebelumnya":"Grup berhasil tersimpan";
  say("#growthGroupFeedback",notice+": "+result.group.name+". Memeriksa daftar...",true);
  try{
   const groups=await loadSavedFacebookGroups();
   if(!groups.some(x=>x.id===result.group.id))throw Error("Grup belum muncul di daftar database");
   data.growth={...(data.growth||{}),facebook_groups:groups};
   say("#growthGroupFeedback",notice+": "+result.group.name+". Total "+groups.length+" grup tersimpan.",true);
  }catch(err){
   say("#growthGroupFeedback",notice+": "+result.group.name+". Konfirmasi database diterima, namun memuat daftar ulang gagal: "+err.message,true);
  }
 }catch(err){
  say("#growthGroupFeedback","Belum tersimpan: "+err.message+". Periksa tautan grup, lalu coba lagi.");
 }finally{if(button)button.disabled=false;}
};
$("#growthGroupQuestionForm").onsubmit=async e=>{
 e.preventDefault();const b=formValues(e.target);
 const stamp=Date.parse(b.published_local||"");
 if(!Number.isFinite(stamp)){say("#growthGroupFeedback","Tanggal publikasi harus valid.");return;}
 if(!confirm("Anda memastikan ini postingan PUBLIK, ringkasannya tidak menyimpan identitas, dan tidak ada kontak otomatis?"))return;
 try{
  await api("admin/growth/facebook-questions","POST",{group_id:b.group_id,url:b.url,summary:b.summary,
   published_at:new Date(stamp).toISOString(),owner_verified_public:true,owner_confirmed:true});
  e.target.reset();await refresh();say("#growthGroupFeedback","Pertanyaan publik dicatat. Balasan hanya draf dan harus Anda posting sendiri setelah memeriksa aturan grup.",true);
 }catch(err){say("#growthGroupFeedback",err.message)}
};
$("#growthGroupList").addEventListener("click",async e=>{
 const button=e.target.closest("button[data-group-status]");
 if(!button)return;
 const status=button.dataset.groupStatus,id=button.dataset.id;
 if(!confirm("Perubahan status ini hanya mencatat tindakan manual Anda. Lanjutkan?"))return;
 button.disabled=true;
 try{
  await api("admin/growth/facebook-groups/"+encodeURIComponent(id)+"/status","PATCH",{status,owner_confirmed:true});
  const groups=await loadSavedFacebookGroups();
  data.growth={...(data.growth||{}),facebook_groups:groups};
  say("#growthGroupFeedback","Status grup disimpan. Total "+groups.length+" grup aktif.",true);
 }catch(err){say("#growthGroupFeedback",err.message)}finally{button.disabled=false;}
});
function renderCampaigns(){
 const localDay=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 const monday=new Date(localDay+"T00:00:00Z");
 monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);
 const week=monday.toISOString().slice(0,10);
 const history=c=>c.status==="REJECTED"||(c.status==="DRAFT"&&String(c.created_at||"").slice(0,10)<week&&!(c.caption||"").startsWith("[REVIEW "+localDay));
 const current=data.campaigns.filter(c=>!history(c)),archived=data.campaigns.filter(history);
 function card(c,old=false){
  const photo=c.preview_photo||{},slug=String(photo.slug||"");
  const image=(photo.owner_supplied||photo.research_discovered)?photo.url:slug&&/^[a-z-]+$/.test(slug)?'/photos/'+slug:"/photo-unavailable.svg";
  const title=c.activity_id==="SNORKELING_3_SPOTS"?"Snorkeling Nusa Penida":"Island Tour Nusa Penida";
  const planned=/^\[REVIEW (\d{4}-\d{2}-\d{2})/.exec(c.caption||"");
  const label=planned?"Ide editorial "+planned[1]:"Dibuat "+String(c.created_at||"").slice(0,10);
  const page=c.activity_id==="SNORKELING_3_SPOTS"?"/snorkeling.html":/diamond|atuh|east|timur/i.test(c.caption)?"/east-tour.html":"/west-tour.html";
  const queue=(data.approvedQueue||[]).filter(q=>q.campaign_id===c.id);
  const statusLabel={QUEUED:"Terjadwal",CREATING_MEDIA:"Mengirim",AWAITING_CONTAINER:"Menunggu Instagram siap",
   PUBLISHING:"Menerbitkan",POSTED:"Terbit",REVIEW_REQUIRED:"Perlu pemeriksaan manual",CANCELLED:"Dibatalkan"};
  const queues=queue.map(q=>'<div class="item"><b>'+esc(q.platform)+' · '+esc(statusLabel[q.status]||q.status)+'</b>'+
    '<small>Jadwal '+esc(q.scheduled_wita)+'</small>'+
    (q.meta_post_id?'<small>ID posting Meta: '+esc(q.meta_post_id)+'</small>':"")+
    (q.last_metrics?'<small>Statistik Meta: '+(q.last_metrics.views===null?"Views belum tersedia":esc(q.last_metrics.views)+" views terukur")+
     ' · '+esc(q.last_metrics.data_status)+'</small>':"")+
    (q.status==="QUEUED"?'<button class="outline" type="button" data-action="cancelAutoPost" data-id="'+esc(q.id)+'">Batalkan jadwal</button>':"")+
    (q.status==="REVIEW_REQUIRED"?'<small>Posting tidak diulang otomatis. Periksa akun Meta sebelum menjadwalkan ulang secara manual.</small>':"")+
    '</div>').join("");
  const credit=photo.owner_supplied?
   '<strong>Nusa Penida Experiences · foto milik Anda</strong>':
   photo.source?.startsWith("https://commons.wikimedia.org/wiki/File:")?
   '<a href="'+esc(photo.source)+'" target="_blank" rel="noopener noreferrer">'+esc(photo.credit)+' / '+esc(photo.license)+'</a>':"Foto referensi katalog";
  const actions=c.status==="DRAFT"&&!old?
   '<button class="primary" type="button" data-action="approveCampaign" data-id="'+esc(c.id)+'">✓ Setujui draf</button>'+
   '<button class="outline" type="button" data-action="rejectCampaign" data-id="'+esc(c.id)+'">✕ Tolak Draf</button>'+
    '<button class="outline" type="button" data-action="researchPhoto" data-id="'+esc(c.id)+'">🔎 Cari foto otomatis</button>':"";
  const own=data.ownerPhotos.filter(p=>p.activity_id===c.activity_id);
  const pick=c.status==="DRAFT"&&!old&&own.length?
   '<div class="ownerPhotoSelect"><label>Ganti dengan foto Anda<select data-photo-pick="'+esc(c.id)+'">'+
   own.map(p=>'<option value="'+esc(p.photo_id)+'">'+esc(p.title)+'</option>').join("")+
   '</select></label><button type="button" class="outline" data-action="applyOwnerPhoto" data-id="'+esc(c.id)+'">Pakai foto ini</button></div>':"";
  const after=c.status==="REJECTED"?
   '<small>Alasan: '+esc(c.rejection_reason||"Revisi diminta")+' · ID pengganti: '+esc(c.replacement_id||"—")+'</small>':"";
  return '<article class="campaignPreviewCard">'+
   '<div class="campaignVisual"><img src="'+esc(image)+'" alt="'+esc(photo.alt||title)+'" loading="lazy" decoding="async" data-photo-slug="'+esc(slug)+'">'+
   '<small>Foto destinasi untuk review, bukan bukti posting</small></div>'+
   '<div class="campaignPreviewText"><div class="meta"><strong>'+esc(title)+' · '+esc(c.platform)+'</strong> <span class="pill '+(c.status==="PUBLISHED"?"good":"")+'">'+esc(c.status)+'</span></div>'+
   '<small>'+esc(label)+' · Revisi '+esc(c.revision||0)+'</small>'+
   '<div class="campaignCaption" aria-label="Pratinjau caption utuh">'+esc(c.caption)+'</div>'+
   '<small class="campaignCredit">Kredit foto: '+credit+'</small>'+
   (photo.is_illustrative?'<small>Ilustrasi lokasi; bukan dokumentasi spot spesifik.</small>':"")+
   (photo.research_discovered?'<small class="photoResearchNotice">📸 Foto riset Wikimedia Commons: tinjau visual, nama lokasi, lisensi, dan hak subjek sebelum menyetujui.</small>'+
      '<small>Lisensi: '+esc(photo.license||"")+
      ' · <a href="'+esc(photo.license_url||"#")+'" target="_blank" rel="noopener noreferrer">Ketentuan lisensi ↗</a></small>':"")+
   '<a class="textLink" href="'+esc(page)+'" target="_blank" rel="noopener noreferrer">Lihat halaman paket wisata ↗</a>'+
   pick+'<div class="actions campaignReviewActions">'+actions+
   (c.status==="APPROVED"&&!queue.length?
     '<button type="button" class="primary" data-action="scheduleApproved" data-id="'+esc(c.id)+'">Jadwalkan otomatis</button>'+
     '<button type="button" class="outline" data-action="publishCampaign" data-id="'+esc(c.id)+'">Catat sudah diposting manual</button>':"")+
   (c.status==="PUBLISHED"?'<button type="button" class="outline" data-action="copyCampaignLink" data-id="'+esc(c.id)+'">Salin tautan guest</button>':"")+
   '</div>'+queues+after+'<small>ID tracking: '+esc(c.id)+'</small></div></article>';
 }
 $("#campaignList").innerHTML='<p class="feedback">Tinjau <strong>foto, caption lengkap, dan kanal</strong> sebelum memutuskan. Jika Anda menyetujui dan memilih kanal, AI akan menjadwalkan publikasi otomatis. Penolakan membuat alternatif baru. Jadwal Metricool lama tetap terpisah.</p>'+
  (current.map(x=>card(x)).join("")||'<p>Belum ada draf baru. Buat kampanye secara manual.</p>')+
  (archived.length?'<details class="item"><summary>Riwayat draf lama / ditolak ('+archived.length+')</summary>'+
   '<p class="feedback">Buat draf baru sebelum menyetujui materi lama. Draf yang ditolak tidak dapat disetujui lagi.</p>'+
   archived.map(x=>card(x,true)).join("")+'</details>':"");
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
  ' · Pembuatan kampanye manual. <strong>'+esc(data.autopilotEnabled?"Draf yang disetujui masuk antrean publikasi terjadwal.":"Penjadwalan otomatis sedang dinonaktifkan.")+'</strong> Statistik hanya berdasarkan hasil Meta yang benar-benar tersedia.</p>'+
  '<h4>Waktu terbaik berdasarkan data</h4>'+timeLines+
  '<h4>Prioritas eksperimen konten berikutnya</h4>'+recommendations;
}
async function loadMetaDiagnostic(){
 const target=$("#metaDiagnosticResults");
 if(!target||!ownerSignedIn)return;
 try{
  const status=await api("admin/marketing/meta/status"),latest=status.latest;
  if(!latest){target.textContent="Belum ada hasil tersimpan. Pemeriksaan otomatis pertama berjalan pada Cron harian 10.00 WITA. Anda dapat menekan Uji koneksi sekarang.";return;}
  const txt=latest.result==="READ_OK"?"Page dan Instagram dapat dibaca":
   latest.result==="READ_PARTIAL"?"Sebagian koneksi gagal":
   latest.result==="INCOMPLETE"?"Konfigurasi belum lengkap":"Keduanya belum dapat dibaca";
  const localTime=new Date(latest.checked_at).toLocaleString("id-ID",{timeZone:"Asia/Makassar",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false})+" WITA";
  const unauthorized=[latest.page.status,latest.instagram.status].includes(401);
  const action=unauthorized?'<p class="feedback"><strong>Perlu tindakan:</strong> Meta menolak akses (HTTP 401). Periksa apakah <code>META_PAGE_ACCESS_TOKEN</code> berisi Page Access Token yang masih valid, bukan App Access Token. Perbarui hanya Secret tersebut di Cloudflare Workers, lalu tekan Uji koneksi sekarang. Jangan tempel token di website atau chat. Pemeriksaan ini tidak menghapus jadwal Metricool.</p>':"";
  target.innerHTML='<p class="feedback"><strong>'+esc(txt)+'</strong> · '+esc(localTime)+
   ' · '+esc(latest.source==="DAILY_CRON"?"Cron otomatis":"Uji pemilik")+
   ' · '+esc(status.check_fresh?"Data pemeriksaan terbaru":"Hasil lama, perlu pemeriksaan baru")+'</p>'+action+
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
  if(["growthCopy","growthShortlist","growthContacted","growthResponded","growthDismiss"].includes(a)){
   const opp=data.growth?.opportunities?.find(o=>o.id===id);
   if(!opp)throw Error("Peluang perlu dimuat ulang");
   if(a==="growthCopy"){
    await navigator.clipboard.writeText(opp.suggested_reply);
    say("#growthFeedback","Saran tersalin. Baca aturan komunitas dan ungkapkan afiliasi sebelum mengirim.",true);
   }else{
    const transitions={growthShortlist:"SHORTLISTED",growthContacted:"CONTACTED",growthResponded:"RESPONDED",growthDismiss:"DISMISSED"};
    const next=transitions[a];
    if(a==="growthContacted"&&!confirm("Anda sudah benar-benar berinteraksi secara manual dan tidak melanggar aturan komunitas?"))return;
    if(a==="growthResponded"&&!confirm("Pihak lain benar-benar memberi respons?"))return;
    await api("admin/growth/opportunities/"+encodeURIComponent(id)+"/status","PATCH",{status:next,owner_confirmed:true});
    await refresh();say("#growthFeedback","Status peluang diperbarui: "+next,true);
   }
   return;
  }
  if(a==="salesAssist"){
   const res=await api("admin/leads/"+encodeURIComponent(id)+"/assistant","POST",{use_ai:true});
   lastSales=res.reply;$("#salesOutput").textContent="Skor lead "+res.score+"/100 ("+res.stage+"), generator "+res.generator+"\n\n"+res.reply+"\n\nDraf untuk diperiksa sebelum menghubungi guest.";changeTab("leads");
  }
  if(a==="researchPhoto"){
   if(!confirm("Cari foto yang relevan dan memiliki metadata lisensi bebas untuk draf ini? Foto baru tetap memerlukan pemeriksaan Anda sebelum posting."))return;
   button.disabled=true;
   try{
    const found=await api("admin/campaigns/"+encodeURIComponent(id)+"/research-photo","POST",{owner_confirmed:true});
    await refresh();
    say("#adminFeedback",found.status==="PHOTO_SELECTED_FOR_REVIEW"?
     "Foto sudah dipilih untuk pratinjau. Periksa sumber, kecocokan lokasi, dan hak penggunaan sebelum setuju.":
     "Belum ditemukan foto baru yang layak; katalog lama tetap bisa dipakai. Anda juga dapat Add Foto.",found.status==="PHOTO_SELECTED_FOR_REVIEW");
   }finally{button.disabled=false;}
   return;
  }
  if(a==="applyOwnerPhoto"){
   const picker=document.querySelector('[data-photo-pick="'+CSS.escape(id)+'"]');
   const photo_id=picker?.value;
   if(!photo_id)throw Error("Silakan unggah dan pilih foto dahulu");
   if(!confirm("Gunakan foto Anda sebagai gambar draf ini? Ini tidak mengubah posting yang sudah dijadwalkan."))return;
   button.disabled=true;
   try{
    await api("admin/campaigns/"+encodeURIComponent(id)+"/photo","POST",{photo_id,owner_confirmed:true});
    await refresh();say("#adminFeedback","Foto draf sudah diganti. Tinjau pratinjau sebelum menyetujui posting.",true);
   }finally{button.disabled=false;}
   return;
  }
  if(a==="copyCampaignLink"){const url=location.origin+"/?campaign="+encodeURIComponent(id);await navigator.clipboard.writeText(url);say("#adminFeedback","Tautan kampanye tersalin, publikasi dilakukan manual.",true)}
  if(a==="rejectCampaign"){
   const reason=prompt("Mengapa draf ini ditolak? Contoh: gambar kurang cocok / caption terlalu formal / ganti sudut destinasi:");
   if(reason===null)return;
   if(reason.trim().length<3){say("#adminFeedback","Tuliskan alasan penolakan minimal 3 karakter.");return;}
   if(!confirm("Tolak draf ini? Draf tetap tersimpan di riwayat dan tidak dibuat ulang otomatis."))return;
   button.disabled=true;
   try{
    const result=await api("admin/campaigns/"+encodeURIComponent(id)+"/status","PATCH",
     {status:"REJECTED",owner_confirmed:true,reason:reason.trim()});
    await refresh();
    say("#adminFeedback","Draf ditolak. Tidak ada draf pengganti otomatis.",true);
   }finally{button.disabled=false;}
   return;
  }
  if(a==="approveCampaign"||a==="publishCampaign"||a==="scheduleApproved"){
   const status=a==="publishCampaign"?"PUBLISHED":"APPROVED",payload={status,owner_confirmed:true};
   if(status==="APPROVED"){
    const draft=data.campaigns.find(v=>v.id===id);
    const suggested=["Instagram","Facebook"].includes(draft?.platform)?draft.platform:"Instagram,Facebook";
    const answer=prompt("Jadwalkan publikasi otomatis ke kanal mana? Isi: Instagram, Facebook, atau Instagram,Facebook",suggested);
    if(answer===null)return;
    const chosen=answer.split(",").map(x=>x.trim()).filter(Boolean);
    if(!chosen.length||chosen.length>2||chosen.some(x=>!["Instagram","Facebook"].includes(x))||
      new Set(chosen).size!==chosen.length){say("#adminFeedback","Pilih hanya Instagram, Facebook, atau keduanya.");return;}
    payload.auto_publish=true;payload.platforms=chosen;
    if(!confirm("Konfirmasi: foto dan caption ini sudah layak terbit. Agen akan menentukan jadwal dan otomatis memposting ke "+chosen.join(" & ")+". Periksa agar tidak ganda dengan Metricool. Lanjutkan?"))return;
   }else{
    const url=prompt("URL HTTPS posting yang SUDAH diterbitkan secara manual:");
    if(!url)return;payload.public_url=url;
    if(!confirm("Catat sebagai posting manual yang sudah terbit?"))return;
   }
   const r=await api("admin/campaigns/"+encodeURIComponent(id)+(a==="scheduleApproved"?"/schedule":"/status"),
    a==="scheduleApproved"?"POST":"PATCH",payload);
   if(r.post_mode==="SCHEDULED_AUTO")say("#adminFeedback","Persetujuan tersimpan. Jadwal "+r.queue.map(v=>v.platform+": "+v.scheduled_wita+" WITA").join("; "),true);
  }
  if(a==="cancelAutoPost"){
   if(!confirm("Batalkan jadwal publikasi ini? Hanya antrean yang belum diproses dapat dibatalkan."))return;
   await api("admin/marketing/approved-queue/"+encodeURIComponent(id)+"/cancel","POST",{owner_confirmed:true});
   say("#adminFeedback","Jadwal dibatalkan. Draf dan riwayat tetap tersimpan.",true);
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
 if(!ownerSignedIn)return;
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
let cmsRecords=new Map(),cmsFields=[],cmsPhotoOverrides=new Map(),cmsSlotsLoaded=false,cmsMediaLoaded=false,cmsActivitiesLoaded=false,cmsLoadGeneration=0;
let cmsPublishedSnapshot={id:{},en:{},photos:{}},cmsPublishedSnapshotPromise=null;
async function loadCmsPublishedSnapshot(){
 if(cmsPublishedSnapshotPromise)return cmsPublishedSnapshotPromise;
 cmsPublishedSnapshotPromise=fetch("/site-editor-defaults.json",{cache:"no-store",credentials:"same-origin"})
  .then(async r=>{
   if(!r.ok)throw Error("Data awal editor tidak tersedia (HTTP "+r.status+")");
   const result=await r.json();
   if(!result?.id?.["hero.title"]||!result?.en?.["hero.title"]||!result?.photos?.hero)throw Error("Isi website belum lengkap pada data awal editor");
   cmsPublishedSnapshot=result;return result;
  }).catch(err=>{cmsPublishedSnapshotPromise=null;throw err;});
 return cmsPublishedSnapshotPromise;
}
const cmsId=(key,locale)=>locale+":"+key;
const cmsDefaultValue=(key,locale)=>cmsPublishedSnapshot?.[locale]?.[key]??window.NusaLanguage?.defaults(locale)?.[key]??"";
const cmsEffectiveValue=(key,locale)=>cmsRecords.get(cmsId(key,locale))?.value??cmsDefaultValue(key,locale);
function cmsSelection(){
 const key=$("#cmsKey").value,locale=$("#cmsLocale").value;
 const existing=cmsRecords.get(cmsId(key,locale));
 return {key,locale,existing,value:cmsEffectiveValue(key,locale)};
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
  // Admin site_content stores only overrides; published HTML and translation maps provide initial values.
  await loadCmsPublishedSnapshot();
  const response=await api("admin/site-content");
  cmsRecords=new Map((response.items||[]).map(x=>[cmsId(x.key,x.locale),x]));
  cmsFields=response.fields||[];
  const keyInput=$("#cmsKey"),previous=keyInput.value;
  keyInput.innerHTML=cmsFields.filter(([key])=>!/^hero\.highlight[1-4]$/.test(key)).map(([key,label])=>'<option value="'+esc(key)+'">'+esc(label)+'</option>').join("");
  if([...keyInput.options].some(o=>o.value===previous))keyInput.value=previous;
  syncCms();
  renderCmsPageFields();
  drawPublishedPageCards();
 }catch(err){say("#cmsFeedback",err.message);say("#cmsStudioFeedback","Tidak dapat memuat konten website: "+err.message);return false;}
 return true;
}
$("#cmsLocale").onchange=syncCms;
$("#cmsKey").onchange=syncCms;
$("#cmsValue").oninput=()=>{$("#cmsPreviewText").textContent=$("#cmsValue").value||"Konten kosong."};
$("#cmsPreview").onclick=()=>{ $("#cmsPreviewText").textContent=$("#cmsValue").value; say("#cmsFeedback","Pratinjau lokal. Konten belum diterbitkan.",true); };
$("#cmsPublish").onclick=async()=>{
 const state=cmsSelection(),value=$("#cmsValue").value.trim();
 if((!state.key.startsWith("price.")&&value.length<2)||value.length>1200){say("#cmsFeedback","Teks minimal 2 karakter; harga boleh kosong.");return;}
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

// Dynamic website CMS: content editor only. Existing supplier rates, quotes, guest leads and bookings stay isolated.
let npeCmsActivities=[],npeCmsMedia=[],npeCmsEditing=null,npeCmsView="published",npeCmsReturn="published",npeCmsPhotoReturn=false,npeCmsPriceCleared=false;
let cmsRegionPlacement=null;
const cmsRegionPending=new Map();
const cmsForm=$("#cmsActivityForm");
const cmsField=name=>cmsForm.elements.namedItem(name);
const cmsSet=(name,value)=>{const el=cmsField(name);if(!el)return;if(el.type==="checkbox")el.checked=value===true;else el.value=value??"";};
const cmsRead=name=>{const el=cmsField(name);return el?.type==="checkbox"?el.checked:el?.value?.trim()??"";};
const cmsCategoryLabel=key=>cmsCategories[key]||(key?.startsWith("CUSTOM:")?key.slice(7):key)||"Aktivitas";
const cmsCategories={SNORKELING:"Snorkeling",ISLAND_TOUR:"Island Tour",TRANSPORT:"Fast Boat / Transport",OTHER:"Aktivitas lainnya"};
const cmsUnitId={PERSON:"orang",CAR:"mobil",GROUP:"grup",TICKET:"tiket"};
const cmsIdPrice=n=>new Intl.NumberFormat("id-ID").format(n);
let cmsCustomCategories=[];
function renderCmsCategories(selected){
 const sel=cmsField("category");
 if(!sel)return;
 const value=selected??sel.value;
 const keys=[...Object.keys(cmsCategories),...cmsCustomCategories.map(x=>x.category)];
 if(value?.startsWith("CUSTOM:")&&!keys.includes(value))keys.push(value);
 sel.innerHTML=keys.map(k=>'<option value="'+esc(k)+'">'+esc(cmsCategoryLabel(k))+'</option>').join("");
 sel.value=keys.includes(value)?value:"ISLAND_TOUR";
}
$("#cmsAddCategory").onclick=async()=>{
 const input=$("#cmsNewCategory"),name=input.value.trim();
 if(!name){input.focus();return;}
 const button=$("#cmsAddCategory");button.disabled=true;
 try{
  const result=await api("admin/website/categories","POST",{name});
  if(!cmsCustomCategories.some(c=>c.category===result.category))cmsCustomCategories.push(result);
  renderCmsCategories(result.category);input.value="";
  say("#cmsCategoryFeedback","Kategori tersimpan dan dapat digunakan kembali.",true);refreshActivityPreview();
 }catch(e){say("#cmsCategoryFeedback",e.message);}
 finally{button.disabled=false;}
};
const cmsDefaultFields=["category","parent_activity","media_id","title_en","title_id","summary_en","summary_id","description_en","description_id","seo_mode","seo_title_en","seo_title_id","seo_description_en","seo_description_id","price_amount","price_unit","price_from","price_verified","supplier_confirmed"];
function cmsView(name){
 if(!["published","drafts","activity","pages","media"].includes(name))return;
 npeCmsView=name;
 if(navTab==="website")recordDashboardNav({view:name,page:name==="pages"?$("#cmsPagePicker").value:undefined});
 document.querySelectorAll("[data-cms-view]").forEach(el=>{el.hidden=el.dataset.cmsView!==name;});
 document.querySelectorAll("[data-cms-view-button]").forEach(b=>{
  const on=b.dataset.cmsViewButton===name;b.classList.toggle("current",on);b.setAttribute("aria-pressed",String(on));
 });
 $("#cmsStudioFeedback").textContent="";
 if(name==="media")void refreshNpeGallery();
 if(name==="pages"&&!cmsFields.length)void loadSiteEditor();
 if(name==="pages")renderCmsPageFields();
 if(name==="activity")refreshActivityPreview();
 $("#cmsBackFromPhoto").hidden=!npeCmsPhotoReturn;
}
document.querySelectorAll("[data-cms-view-button]").forEach(b=>b.addEventListener("click",()=>{
 npeCmsPhotoReturn=false;cmsView(b.dataset.cmsViewButton);
}));
const cmsSeoFields=["seo_title_en","seo_title_id","seo_description_en","seo_description_id"];
function cmsSeoMode(){
 const auto=cmsRead("seo_mode")!=="MANUAL";
 for(const k of cmsSeoFields)cmsField(k).readOnly=auto;
}
$("#cmsSeoMode").addEventListener("change",cmsSeoMode);
$("#cmsGenerateSeo").onclick=async()=>{
 const button=$("#cmsGenerateSeo");button.disabled=true;
 const currentForm=npeCmsEditing?.id||null;
 try{
  const fields=Object.fromEntries(["category","parent_activity","title_en","title_id","summary_en","summary_id","description_en","description_id"].map(k=>[k,cmsRead(k)]));
  if(!fields.title_en||!fields.title_id)throw Error("Isi judul Indonesia dan English terlebih dahulu.");
  if(cmsRead("seo_mode")==="MANUAL"&&!window.confirm("Ganti SEO manual dengan rekomendasi baru?"))return;
  const result=await api("admin/website/seo","POST",fields);
  if((npeCmsEditing?.id||null)!==currentForm||Object.entries(fields).some(([k,v])=>cmsRead(k)!==v))return;
  for(const k of cmsSeoFields)cmsSet(k,result.items[k]);
  say("#cmsSeoFeedback","Rekomendasi SEO diperbarui dari konten saat ini.",true);
 }catch(e){say("#cmsSeoFeedback",e.message);}
 finally{button.disabled=false;}
};
function cmsReportError(error){
 const labels={title_id:"Judul (Indonesia)",title_en:"Judul (English)",summary_id:"Ringkasan (Indonesia)",summary_en:"Ringkasan (English)",description_id:"Deskripsi lengkap (Indonesia)",description_en:"Deskripsi lengkap (English)",seo_title_id:"SEO Title Indonesia",seo_title_en:"SEO Title English",seo_description_id:"Meta Description Indonesia",seo_description_en:"Meta Description English"};
 const message=String(error?.message||error);
 const key=Object.keys(labels).find(k=>message.startsWith(k+" "));
 if(key){
  say("#cmsActivityFeedback",message.replace(key,labels[key]));
  const field=cmsField(key);if(field){const details=field.closest("details");if(details)details.open=true;field.focus();field.scrollIntoView({block:"center"});}
 }else say("#cmsActivityFeedback",message);
}
function cmsPricePreview(){
 const amount=Number(cmsRead("price_amount")),raw=cmsRead("price_amount");
 const unit=cmsUnitId[cmsRead("price_unit")]||"orang";
 const label=$("#cmsPricePreview");
 if(!raw){label.textContent="Harga dikosongkan — tidak ditampilkan di halaman wisata.";return;}
 if(!Number.isSafeInteger(amount)||amount<1){label.textContent="Isi harga jual dalam rupiah, contoh 350000.";return;}
 label.textContent=(cmsRead("price_from")?"Mulai ":"")+"Rp"+cmsIdPrice(amount)+"/"+unit+" · hanya tampil setelah harga diverifikasi.";
}
function refreshActivityPreview(){
 if(npeCmsView!=="activity")return;
 cmsPricePreview();
 const e=$("#cmsActivityPreview"),title=cmsRead("title_en")||"Activity title",desc=cmsRead("summary_en")||"Deskripsi singkat aktivitas akan tampil di sini.";
 const amount=cmsRead("price_amount"),cover=npeCmsMedia.find(x=>x.id===cmsRead("media_id"));
 const image=$("#cmsActivityImage");
 image.hidden=!cover;if(cover){image.src=cover.url;image.alt=cover.alt_en;}
 const url=cover?.url||"/photo-unavailable.svg";
 e.innerHTML='<img src="'+esc(url)+'" alt="'+esc(cover?.alt_en||title)+'" loading="lazy"><div class="npeCmsPreviewBody"><small>'+esc(cmsCategoryLabel(cmsRead("category")))+'</small><h4>'+esc(title)+'</h4><p>'+esc(desc)+'</p>'+
  (amount&&Number(amount)>0?'<strong>'+esc($("#cmsPricePreview").textContent.split(" · ")[0])+'</strong>':'<small>Harga: Tanya via WhatsApp</small>')+'</div>';
}
for(const el of cmsForm.querySelectorAll("input,textarea,select"))el.addEventListener("input",refreshActivityPreview);
$("#cmsClearPrice").onclick=()=>{
 cmsSet("price_amount","");cmsSet("price_verified",false);npeCmsPriceCleared=true;refreshActivityPreview();
 say("#cmsActivityFeedback","Harga dikosongkan. Aktivitas tetap dapat disimpan tanpa harga.",true);
};
function cmsParseLegacyPrice(p){
 const label=p?.price_label_id||"";
 const match=label.match(/Rp\s*([\d.,]+)/i);
 return match?String(Number(match[1].replace(/\D/g,""))||""):"";
}
function cmsLegacyUnit(p){
 const x=p?.price_label_id||"";
 return /mobil/i.test(x)?"CAR":/grup/i.test(x)?"GROUP":/tiket/i.test(x)?"TICKET":"PERSON";
}
const cmsStaticParents=[["static:snorkeling","Snorkeling","SNORKELING"],["static:island","Island Tour","ISLAND_TOUR"],["static:west","West Tour","ISLAND_TOUR"],["static:east","East Tour","ISLAND_TOUR"]];
function cmsParentOptions(selected=""){
 const options=[...cmsStaticParents,...npeCmsActivities.filter(a=>a.status==="PUBLISHED"&&a.published&&!a.published.parent_activity&&a.id!==npeCmsEditing?.id).map(a=>["activity:"+a.slug,a.published.title_id,a.published.category])];
 const sel=cmsField("parent_activity");
 sel.innerHTML='<option value="">Aktivitas utama (beranda)</option>'+options.map(([key,label,cat])=>'<option value="'+esc(key)+'" data-category="'+esc(cat)+'">'+esc(label)+'</option>').join("");
 if(selected&&!options.some(x=>x[0]===selected))sel.add(new Option("Induk tidak aktif · "+selected,selected));
 sel.value=selected;
}
function cmsSyncParent(){
 const sel=cmsField("parent_activity");
 const cat=sel.selectedOptions[0]?.dataset.category;
 if(cat)renderCmsCategories(cat);
}
$("#cmsParentActivity").addEventListener("change",()=>{cmsSyncParent();refreshActivityPreview();});
function startWebsiteDetail(parent){
 resetWebsiteForm();cmsParentOptions(parent);cmsSyncParent();cmsField("category").disabled=true;$("#cmsNewCategoryWrap").hidden=true;
 $("#cmsFormHeading").textContent="Tambah Detail Aktivitas";
}
function resetWebsiteForm(){
 cmsRegionPlacement=null;
 npeCmsReturn=npeCmsView==="activity"?"drafts":npeCmsView;npeCmsEditing=null;npeCmsPriceCleared=false;cmsForm.reset();
 cmsSet("seo_mode","AUTO");cmsSeoMode();
 cmsParentOptions();cmsField("parent_activity").disabled=true;cmsField("category").disabled=false;renderCmsCategories("ISLAND_TOUR");$("#cmsNewCategoryWrap").hidden=false;$("#cmsNewCategory").value="";$("#cmsCategoryFeedback").textContent="";
 cmsSet("price_unit","PERSON");cmsSet("price_from",true);
 $("#cmsFormHeading").textContent="Tambah Aktivitas Baru";
 $("#cmsEditingStatus").textContent="Draft Baru";$("#cmsActivityFeedback").textContent="";
 cmsForm.hidden=false;cmsView("activity");
}
function editWebsiteActivity(id,from="published"){
 cmsRegionPlacement=null;
 const a=npeCmsActivities.find(x=>x.id===id);if(!a)return;
 npeCmsReturn=from;npeCmsEditing=a;npeCmsPriceCleared=false;cmsForm.reset();
 const d=a.draft||a.published||{};
 cmsParentOptions(d.parent_activity||"");cmsField("parent_activity").disabled=true;
 renderCmsCategories(d.category);
 for(const [k,v] of Object.entries(d))cmsSet(k,v);
 cmsSet("seo_mode",d.seo_mode||(cmsSeoFields.some(k=>d[k])?"MANUAL":"AUTO"));cmsSeoMode();
 if(d.price_amount===null||d.price_amount===undefined)cmsSet("price_amount",cmsParseLegacyPrice(d));
 if(!d.price_unit)cmsSet("price_unit",cmsLegacyUnit(d));
 cmsSet("price_from",d.price_from!==undefined?d.price_from:/^Mulai/i.test(d.price_label_id||""));
 cmsField("category").disabled=!!d.parent_activity;$("#cmsNewCategoryWrap").hidden=!!d.parent_activity;$("#cmsNewCategory").value="";$("#cmsCategoryFeedback").textContent="";
 $("#cmsFormHeading").textContent="Edit · "+(d.title_id||d.title_en||a.slug);
 $("#cmsEditingStatus").textContent=a.status==="PUBLISHED"?"Published · edit draft":"Draft";
 $("#cmsActivityFeedback").textContent=a.status==="PUBLISHED"?"Perubahan tidak mengganti versi publik sampai Anda menekan Simpan & Publish.":"Simpan perubahan lalu terbitkan ketika sudah siap.";
 cmsForm.hidden=false;cmsView("activity");
}
function cmsActivityCard(a,isPublished){
 const d=isPublished?(a.published||a.draft):a.draft||{};
 const img=npeCmsMedia.find(x=>x.id===d.media_id)||(/^[0-9a-f-]{36}$/.test(d.media_id||"")?{url:"/photos/website/"+d.media_id,alt_id:d.title_id||d.title_en||"Foto aktivitas"}:null);
 const name=d.title_id||d.title_en||a.slug;
 const price=d.price_verified?(d.price_label_id||""):"";
 const parent=d.parent_activity? (cmsStaticParents.find(x=>x[0]===d.parent_activity)?.[1]||npeCmsActivities.find(x=>"activity:"+x.slug===d.parent_activity)?.published?.title_id||d.parent_activity):"";
 const badge=isPublished?(a.pending_changes?"Published · Ada revisi draft":"Published"):(a.status==="ARCHIVED"?"Arsip":"Draft");
 return '<article class="npeCmsPublishedCard">'+
  '<div class="npeCmsPublishedImage">'+(img?'<img src="'+esc(img.url)+'" loading="lazy" alt="'+esc(img.alt_id)+'">':'<div class="npeCmsNoImage">▧ Foto</div>')+'</div>'+
  '<div class="npeCmsPublishedInfo"><small>'+esc(cmsCategoryLabel(d.category))+' · '+esc(badge)+(parent?' · Detail: '+esc(parent):'')+'</small><h4>'+esc(name)+'</h4>'+
  '<p>'+esc((d.summary_id||d.summary_en||"").slice(0,170))+'</p>'+
  '<strong class="npeCmsPublishedPrice">'+(price?esc(price):'<span>Harga belum ditampilkan</span>')+'</strong>'+
  '<div class="npeCmsCardActions">'+
  '<button class="primary small" data-cms-edit="'+esc(a.id)+'" data-source="'+(isPublished?"published":"drafts")+'">✎ Edit semua elemen</button>'+
  (isPublished&&!d.parent_activity?'<button type="button" class="outline small" data-cms-add-detail="activity:'+esc(a.slug)+'">+ Tambah Detail</button>':'')+
  (isPublished?'<a class="outline small" target="_blank" rel="noopener" href="/id/experiences/'+encodeURIComponent(a.slug)+'">↗ Lihat</a>':'')+
  ((a.status==="DRAFT"||a.pending_changes||a.status==="ARCHIVED")?'<button class="outline small" data-cms-publish="'+esc(a.id)+'">Publish</button>':'')+
  (isPublished?'<button class="outline small" data-cms-archive="'+esc(a.id)+'">Arsipkan</button>':'')+
  '</div></div></article>';
}
function drawWebsiteCMS(){
 const published=npeCmsActivities.filter(a=>a.status==="PUBLISHED"&&a.published);
 const drafts=npeCmsActivities.filter(a=>a.status!=="PUBLISHED"||a.pending_changes);
 $("#cmsPublishedCount").textContent=cmsActivitiesLoaded?String(published.length+5):"—"; // Five legacy public pages below
 $("#cmsDraftCount").textContent=cmsActivitiesLoaded?String(drafts.length):"—";
 $("#cmsPublishedList").innerHTML=!cmsActivitiesLoaded?'<p class="feedback">Aktivitas belum tersinkron. Tekan Refresh.</p>':published.length?published.map(a=>cmsActivityCard(a,true)).join(""):'<div class="npeCmsEmpty">Belum ada aktivitas tambahan yang dipublikasikan. Halaman NPE yang sudah tersedia terlihat di bawah.</div>';
 $("#cmsDraftList").innerHTML=!cmsActivitiesLoaded?'<p class="feedback">Draft belum tersinkron. Tekan Refresh.</p>':drafts.length?drafts.map(a=>cmsActivityCard(a,false)).join(""):'<div class="npeCmsEmpty">Belum ada draft. Tekan <strong>Add Activity</strong> untuk membuat aktivitas baru.</div>';
 for(const root of [$("#cmsPublishedList"),$("#cmsDraftList")]){
  root.querySelectorAll("[data-cms-edit]").forEach(b=>b.onclick=()=>editWebsiteActivity(b.dataset.cmsEdit,b.dataset.source));
  root.querySelectorAll("[data-cms-add-detail]").forEach(b=>b.onclick=()=>startWebsiteDetail(b.dataset.cmsAddDetail));
  root.querySelectorAll("[data-cms-publish]").forEach(b=>b.onclick=()=>cmsPublishActivity(b.dataset.cmsPublish));
  root.querySelectorAll("[data-cms-archive]").forEach(b=>b.onclick=()=>cmsArchiveActivity(b.dataset.cmsArchive));
 }
 const lists=[$("#cmsActivityMedia"),$("#cmsSlotMedia")];
 for(const input of lists){
  const old=input.value;
  input.innerHTML='<option value="">Pilih foto...</option>'+npeCmsMedia.map(m=>'<option value="'+esc(m.id)+'">'+esc(m.title)+'</option>').join("");
  if(npeCmsMedia.some(m=>m.id===old))input.value=old;
 }
 renderNpeMediaGallery();
 renderCmsPageDetails();
 refreshActivityPreview();
}
function renderNpeMediaGallery(){
 if(!cmsMediaLoaded){$("#cmsGalleryCount").textContent="(—)";$("#cmsGalleryStatus").textContent="Galeri belum tersinkron. Tekan Refresh.";$("#cmsMediaGrid").textContent="Foto tersimpan tidak dihapus.";return;}
 const q=$("#cmsGallerySearch").value.trim().toLowerCase();
 const shown=npeCmsMedia.filter(m=>(m.title+" "+m.alt_id+" "+m.alt_en).toLowerCase().includes(q));
 $("#cmsGalleryCount").textContent="("+npeCmsMedia.length+")";
 $("#cmsGalleryStatus").textContent=shown.length+" dari "+npeCmsMedia.length+" foto tersimpan";
 const root=$("#cmsMediaGrid");
 root.innerHTML=shown.length?shown.map(m=>
  '<article class="npeCmsMedia"><img src="'+esc(m.url)+'" loading="lazy" alt="'+esc(m.alt_id)+'">'+
  '<strong>'+esc(m.title)+'</strong><small>'+esc(m.alt_id)+'</small>'+
  '<small class="npeMediaUsage">'+(m.usage_count>0?"Dipakai pada "+m.usage_count+" bagian":"Tidak digunakan")+'</small>'+
  '<div class="npeMediaActions"><button type="button" class="outline small" data-cms-use-media="'+esc(m.id)+'">Gunakan</button>'+
  '<button type="button" class="outline small" data-cms-delete-media="'+esc(m.id)+'" '+(m.usage_count>0?'disabled title="Ganti foto pada halaman atau aktivitas sebelum menghapus"':'')+'>Hapus</button></div></article>'
 ).join(""):'<p class="feedback">Belum ada foto tersimpan yang cocok. Klik Upload Foto Baru untuk menambahkan foto.</p>';
 root.querySelectorAll("[data-cms-use-media]").forEach(b=>b.onclick=()=>{
  if(npeCmsPhotoReturn){
   cmsSet("media_id",b.dataset.cmsUseMedia);cmsView("activity");npeCmsPhotoReturn=false;
   refreshActivityPreview();say("#cmsActivityFeedback","Foto dipilih. Simpan draft untuk menyimpan perubahan.",true);
  }else{
   $("#cmsSlotMedia").value=b.dataset.cmsUseMedia;
   say("#cmsMediaFeedback","Foto dipilih. Pilih bagian website lalu klik Simpan & Terbitkan Foto.",true);
  }
 });
 root.querySelectorAll("[data-cms-delete-media]").forEach(b=>b.onclick=()=>void deleteNpeMedia(b.dataset.cmsDeleteMedia));
}
async function deleteNpeMedia(id){
 const photo=npeCmsMedia.find(m=>m.id===id);
 if(!photo)return;
 if(photo.usage_count>0){say("#cmsMediaFeedback","Foto sedang digunakan. Ganti pada semua halaman atau aktivitas sebelum menghapus.");return;}
 if(!window.confirm("Hapus foto '"+photo.title+"' secara permanen dari Galeri NPE? Tindakan ini tidak dapat dibatalkan."))return;
 const buttons=Array.from($("#cmsMediaGrid").querySelectorAll("[data-cms-delete-media]"));
 buttons.forEach(b=>b.disabled=true);
 try{
  const deleted=await api("admin/website/media/"+id,"DELETE",{owner_confirmed:true});
  if(!deleted.deleted)throw Error("Server tidak mengonfirmasi penghapusan.");
  npeCmsMedia=npeCmsMedia.filter(m=>m.id!==id);
  drawWebsiteCMS();
  say("#cmsMediaFeedback",deleted.storage_cleaned?"Foto berhasil dihapus dari Galeri NPE.":"Foto dihapus dari galeri; pembersihan penyimpanan perlu diperiksa.",true);
 }catch(e){say("#cmsMediaFeedback","Gagal menghapus: "+e.message);renderNpeMediaGallery();}
}
async function refreshNpeGallery(){
 if(!ownerSignedIn)return;
 try{
  const r=await api("admin/website/media");
  npeCmsMedia=r.items||[];cmsMediaLoaded=true;
  renderNpeMediaGallery();
 }catch(e){say("#cmsMediaFeedback","Tidak dapat memuat Galeri NPE: "+e.message);}
}
$("#cmsGallerySearch").oninput=renderNpeMediaGallery;
$("#cmsOpenGallery").onclick=()=>{
 npeCmsPhotoReturn=false;cmsView("media");
};
async function loadWebsiteCMS(){
 if(!ownerSignedIn)return;
 const generation=++cmsLoadGeneration;
 const errors=[];
 // A failure in the gallery must never discard a successful published slot or activity response.
 const [acts,media,slots,copy,categories]=await Promise.allSettled([
  api("admin/website/activities"),api("admin/website/media"),api("public/website/slots"),loadSiteEditor(),api("admin/website/categories")
 ]);
 if(generation!==cmsLoadGeneration||!ownerSignedIn)return;
 if(slots.status==="fulfilled"&&Array.isArray(slots.value.items)){
  cmsPhotoOverrides=new Map(slots.value.items.map(x=>[x.slot,x]));cmsSlotsLoaded=true;
 }else{cmsSlotsLoaded=false;errors.push("foto terbit: "+(slots.reason?.message||"respons tidak valid"));}
 if(acts.status==="fulfilled"&&Array.isArray(acts.value.items)){npeCmsActivities=acts.value.items;cmsActivitiesLoaded=true;}
 else{cmsActivitiesLoaded=false;errors.push("aktivitas: "+(acts.reason?.message||"respons tidak valid"));}
 if(media.status==="fulfilled"&&Array.isArray(media.value.items)){npeCmsMedia=media.value.items;cmsMediaLoaded=true;}
 else{cmsMediaLoaded=false;errors.push("galeri: "+(media.reason?.message||"respons tidak valid"));}
 if(copy.status!=="fulfilled"||copy.value!==true)errors.push("teks halaman belum tersinkron");
 if(categories.status==="fulfilled"){cmsCustomCategories=categories.value.items||[];if(npeCmsView==="activity")renderCmsCategories();}
 else errors.push("kategori: "+(categories.reason?.message||"belum tersedia"));
 drawWebsiteCMS();drawPublishedPageCards();renderCmsPagePhotos();
 say("#cmsStudioFeedback",errors.length?"Sebagian data belum berhasil dimuat. "+errors.join(" · ")+". Tekan Refresh; foto publik tidak diubah.":"Data website dan galeri berhasil disinkronkan.",errors.length===0);
}
$("#cmsAddActivity").onclick=resetWebsiteForm;
$("#cmsRefresh").onclick=()=>void loadWebsiteCMS();
$("#cmsCancelActivity").onclick=()=>{cmsForm.hidden=true;cmsView(npeCmsReturn);};
$("#cmsBackToList").onclick=()=>{cmsForm.hidden=true;cmsView(npeCmsReturn);};
$("#cmsChoosePhoto").onclick=()=>beginCmsQuickPhoto("__activity__");
$("#cmsBackFromPhoto").onclick=()=>{npeCmsPhotoReturn=false;cmsView("activity");};
async function cmsSaveDraft(){
 const fields=Object.fromEntries(cmsDefaultFields.map(k=>[k,cmsRead(k)]));
 // Labels are derived from the numeric price. Clearing the numeric field also removes any old label.
 const draft={...fields,price_label_en:"",price_label_id:""};
 if(draft.seo_mode==="AUTO")for(const k of cmsSeoFields)draft[k]="";
 if(npeCmsEditing&&!npeCmsPriceCleared&&!draft.price_amount){
  // Preserve historical custom selling labels if no numeric amount can be inferred.
  const d=npeCmsEditing.draft;
  if(!cmsParseLegacyPrice(d)){draft.price_label_en=d.price_label_en||"";draft.price_label_id=d.price_label_id||"";}
 }
 const path=npeCmsEditing?"admin/website/activities/"+npeCmsEditing.id:"admin/website/activities";
 const payload={draft,...(npeCmsEditing?{expected_version:npeCmsEditing.version}:{})};
 const result=await api(path,npeCmsEditing?"PATCH":"POST",payload);
 if(cmsRegionPlacement)cmsRegionPending.set(result.id,cmsRegionPlacement);
 await loadWebsiteCMS();
 // After the first draft save, keep editing that record instead of accidentally creating the same slug again.
 npeCmsEditing=npeCmsActivities.find(x=>x.id===result.id)||null;
 if(npeCmsEditing){for(const k of cmsSeoFields)cmsSet(k,npeCmsEditing.draft[k]);$("#cmsEditingStatus").textContent=npeCmsEditing.status==="PUBLISHED"?"Published · revisi draft":"Draft tersimpan";}
 return result;
}
cmsForm.onsubmit=async e=>{
 e.preventDefault();const b=$("#cmsSaveActivity");b.disabled=true;
 try{
  await cmsSaveDraft();cmsForm.hidden=true;cmsView("drafts");
  say("#cmsStudioFeedback","Draft tersimpan. Harga boleh kosong; publik tidak berubah sebelum Publish.",true);
 }catch(e){cmsReportError(e);}
 finally{b.disabled=false;}
};
$("#cmsPublishFromEditor").onclick=async()=>{
 if(!cmsForm.reportValidity())return;
 const btn=$("#cmsPublishFromEditor");btn.disabled=true;$("#cmsSaveActivity").disabled=true;
 try{
  const result=await cmsSaveDraft();
  const saved=npeCmsActivities.find(a=>a.id===result.id);
  if(!saved)throw Error("Draft tidak ditemukan setelah penyimpanan");
  if(!saved.draft.media_id||!saved.draft.supplier_confirmed){
   say("#cmsActivityFeedback","Draft disimpan. Untuk Publish, pilih foto dan konfirmasi layanan/operator.");return;
  }
  if((saved.draft.price_amount||saved.draft.price_label_id)&&!saved.draft.price_verified){
   say("#cmsActivityFeedback","Draft disimpan. Verifikasi harga atau kosongkan harga sebelum Publish.");return;
  }
  if(!window.confirm("Terbitkan perubahan pada "+saved.draft.title_id+" sekarang?")){say("#cmsActivityFeedback","Draft tersimpan; publikasi dibatalkan.");return;}
  const published=await cmsPublishActivity(saved.id,true);
  if(published){cmsForm.hidden=true;cmsView(npeCmsReturn==="pages"?"pages":"published");}
  else say("#cmsActivityFeedback","Draft tersimpan, namun publikasi belum berhasil. Periksa pesan dan coba lagi.");
 }catch(e){cmsReportError(e);}
 finally{btn.disabled=false;$("#cmsSaveActivity").disabled=false;}
};
async function cmsPublishActivity(id,confirmed=false){
 const a=npeCmsActivities.find(x=>x.id===id);if(!a)return;
 if(!a.draft.supplier_confirmed){say("#cmsStudioFeedback","Periksa operator & cakupan aktivitas sebelum Publish.");return false;}
 if(!a.draft.media_id){say("#cmsStudioFeedback","Pilih foto utama sebelum Publish.");return false;}
 if((a.draft.price_amount||a.draft.price_label_id)&&!a.draft.price_verified){say("#cmsStudioFeedback","Harga belum diverifikasi. Edit aktivitas, atau kosongkan harga sebelum Publish.");return false;}
 if(!confirmed&&!window.confirm("Publikasikan "+a.draft.title_id+" ke website publik?"))return false;
 try{
  await api("admin/website/activities/"+id+"/publish","POST",{expected_version:a.version,owner_confirmed:true});
  let placementError="";
  const target=cmsRegionPending.get(id);
  if(target){
   try{await placePublishedRegionItem(target,id);cmsRegionPending.delete(id);}
   catch(e){placementError=" Aktivitas sudah terbit, tetapi penempatan belum tersimpan: "+e.message+". Gunakan Atur susunan untuk menampilkannya.";}
  }
  await loadWebsiteCMS();say("#cmsStudioFeedback","Aktivitas berhasil diterbitkan."+placementError,!placementError);return true;
 }catch(e){say("#cmsStudioFeedback","Publikasi gagal: "+e.message);return false;}
}
async function cmsArchiveActivity(id){
 const a=npeCmsActivities.find(x=>x.id===id);if(!a||!window.confirm("Arsipkan "+a.draft.title_id+" dari website publik?"))return;
 try{await api("admin/website/activities/"+id+"/archive","POST",{expected_version:a.version,owner_confirmed:true});await loadWebsiteCMS();say("#cmsStudioFeedback","Aktivitas telah diarsipkan.",true);}
 catch(e){say("#cmsStudioFeedback",e.message);}
}
$("#cmsMediaUpload").onsubmit=async e=>{
 e.preventDefault();const form=e.currentTarget,b=form.querySelector("button[type=submit]");b.disabled=true;
 try{
  const raw=new FormData(form),file=raw.get("file");
  const meta=cmsPhotoMetadata(file,String(raw.get("title")||"").trim());
  const j=await uploadCmsWebsitePhoto(file,meta.title,meta.altId,meta.altEn,raw.has("rights_confirmed"));
  form.reset();
  if(!npeCmsMedia.some(m=>m.id===j.id))npeCmsMedia.push({...j,usage_count:0});
  drawWebsiteCMS();await refreshNpeGallery();
  $("#cmsSlotMedia").value=j.id;
  say("#cmsMediaFeedback","Foto tersimpan di Galeri NPE. Anda dapat memilihnya saat membuat aktivitas atau detail tanpa upload ulang.",true);
 }catch(e){say("#cmsMediaFeedback",e.message);}
 finally{b.disabled=false;}
};
$("#cmsPublishSlot").onclick=async()=>{
 const slot=$("#cmsPhotoSlot").value,media_id=$("#cmsSlotMedia").value;
 if(!media_id){say("#cmsSlotFeedback","Pilih foto yang sudah diupload.");return;}
 if(!window.confirm("Ubah foto "+slot+" pada website publik?"))return;
 try{await api("admin/website/slots","POST",{slot,media_id,owner_confirmed:true});await loadWebsiteCMS();say("#cmsSlotFeedback","Foto berhasil diterbitkan pada halaman website; foto lain tetap sama.",true);}
 catch(e){say("#cmsSlotFeedback",e.message);}
};
// Friendly grouped editor for existing published pages, using the original versioned text CMS API.
const cmsPageMap={
 "home": [
  "hero.eyebrow",
  "hero.title",
  "hero.subtitle",
  "hero.description",
  "hero.cta",
  "homeThumb.west-kelingking.title",
  "homeThumb.west-broken-beach.title",
  "homeThumb.west-angels-billabong.title",
  "homeThumb.west-crystal-bay.title",
  "homeThumb.east-diamond-beach.title",
  "homeThumb.east-atuh-beach.title",
  "homeThumb.east-tree-house.title",
  "homeThumb.east-atuh-beach-second.title",
  "homeThumb.snorkeling-manta-bay.title",
  "homeThumb.snorkeling-manta-point.title",
  "homeThumb.snorkeling-gamat-bay.title",
  "homeThumb.snorkeling-crystal-bay.title",
  "hero.whatsapp",
  // Legacy highlights remain available as migration defaults; edit them in the structured bilingual list.
  "regions.west.cta",
  "regions.east.cta",
  "regions.sea.cta",
  "west.title","west.description","east.title","east.description","price.west","price.east","price.snorkeling","price.island","snorkeling.title","snorkeling.description","island.title","island.description",
  "packages.eyebrow",
  "packages.title",
  "packages.description",
  "regions.eyebrow",
  "regions.title",
  "regions.description",
  "contact.eyebrow",
  "contact.title",
  "contact.description",
  "contact.notice",
  "sea.title",
  "sea.description",
  "whatsapp.eyebrow",
  "whatsapp.heading",
  "whatsapp.description",
  "whatsapp.disclaimer"
 ],
 "snorkeling": [
  "snorkeling.title",
  "snorkeling.description",
  "price.snorkeling",
  "snorkelingPage.eyebrow",
  "snorkelingPage.title",
  "snorkelingPage.lead",
  "snorkelingPage.description",
  "snorkelingSpot.mantaBay.title",
  "snorkelingSpot.mantaBay.description",
  "snorkelingSpot.mantaPoint.title",
  "snorkelingSpot.mantaPoint.description",
  "snorkelingSpot.crystalBay.title",
  "snorkelingSpot.crystalBay.description",
  "snorkelingSpot.gamatBay.title",
  "snorkelingSpot.gamatBay.description"
 ],
 "island": [
  "island.title",
  "island.description",
  "price.island",
  "islandPage.eyebrow",
  "islandPage.title",
  "islandPage.lead",
  "islandPage.description",
  "islandSpot.west.title",
  "islandSpot.west.description",
  "islandSpot.east.title",
  "islandSpot.east.description"
 ],
 "west": [
  "west.title",
  "west.description",
  "price.west",
  "westPage.eyebrow",
  "westPage.title",
  "westPage.lead",
  "westPage.description",
  "westSpot.kelingking.title",
  "westSpot.kelingking.description",
  "westSpot.brokenBeach.title",
  "westSpot.brokenBeach.description",
  "westSpot.angelsBillabong.title",
  "westSpot.angelsBillabong.description",
  "westSpot.crystalBay.title",
  "westSpot.crystalBay.description"
 ],
 "east": [
  "east.title",
  "east.description",
  "price.east",
  "eastPage.eyebrow",
  "eastPage.title",
  "eastPage.lead",
  "eastPage.description",
  "eastSpot.diamondBeach.title",
  "eastSpot.diamondBeach.description",
  "eastSpot.atuhBeach.title",
  "eastSpot.atuhBeach.description",
  "eastSpot.treeHouse.title",
  "eastSpot.treeHouse.description"
 ]
};
const cmsPagePhotoSlots={
 "home": [
  "hero",
  "snorkeling",
  "island",
  "west",
  "east",
  "west-kelingking","west-broken-beach","west-angels-billabong","west-crystal-bay","east-diamond-beach","east-atuh-beach","east-tree-house","snorkeling-manta-bay","snorkeling-manta-point","snorkeling-gamat-bay","snorkeling-crystal-bay"
 ],
 "snorkeling": [
  "snorkeling",
  "snorkeling-manta-bay",
  "snorkeling-manta-point",
  "snorkeling-crystal-bay",
  "snorkeling-gamat-bay"
 ],
 "island": [
  "island-west",
  "island-east"
 ],
 "west": [
  "west",
  "west-kelingking",
  "west-broken-beach",
  "west-angels-billabong",
  "west-crystal-bay"
 ],
 "east": [
  "east",
  "east-diamond-beach",
  "east-atuh-beach",
  "east-tree-house"
 ]
};
const cmsPageSlotLabels={
 "hero": "Banner utama",
 "snorkeling": "Cover Snorkeling (Paket & 3 Spots)",
 "island": "Kartu Island Tour",
 "west": "Kartu Wisata Barat",
 "east": "Kartu Wisata Timur",
 "snorkeling-manta-bay": "Manta Bay",
 "snorkeling-manta-point": "Manta Point",
 "snorkeling-crystal-bay": "Crystal Bay",
 "snorkeling-gamat-bay": "Gamat Bay",
 "island-west": "Island Tour · Barat",
 "island-east": "Island Tour · Timur",
 "west-kelingking": "Kelingking Beach",
 "west-broken-beach": "Broken Beach",
 "west-angels-billabong": "Angel’s Billabong",
 "west-crystal-bay": "Crystal Bay",
 "east-diamond-beach": "Diamond Beach",
 "east-atuh-beach": "Atuh Beach",
 "east-tree-house": "Rumah Pohon"
};
const cmsPublishedPages=[
 [
  "home",
  "Beranda NPE",
  "hero.title",
  "hero.description",
  "hero",
  "/"
 ],
 [
  "snorkeling",
  "Snorkeling Nusa Penida",
  "snorkelingPage.title",
  "snorkelingPage.lead",
  "snorkeling",
  "/snorkeling.html"
 ],
 [
  "island",
  "Island Tour Nusa Penida",
  "islandPage.title",
  "islandPage.lead",
  "island",
  "/island-tour.html"
 ],
 [
  "west",
  "West Island Tour",
  "westPage.title",
  "westPage.lead",
  "west",
  "/west-tour.html"
 ],
 [
  "east",
  "East Island Tour",
  "eastPage.title",
  "eastPage.lead",
  "east",
  "/east-tour.html"
 ]
];
// Direct photo replacement: tapping the picture opens the phone's native image gallery.
// The current page remains visible and the chosen slot is never reselected manually.
let cmsQuickPhotoSlot=null,cmsQuickPhotoSource=null,cmsQuickPhotoObjectUrl=null,cmsQuickPhotoMediaId=null,cmsQuickPhotoBusy=false;
const quickPhotoDialog=$("#cmsQuickPhotoDialog");
// Photo metadata is derived once; no repeated activity title/description fields.
function cmsPhotoMetadata(file,titleId="",titleEn=""){
 const clean=(v,max)=>String(v||"").replace(/[<>\u0000-\u001f\u007f-\u009f]/g," ").replace(/\s+/g," ").trim().slice(0,max).trim();
 const filename=clean(String(file?.name||"").replace(/\.[^.]+$/,"").replace(/[_-]+/g," "),120);
 const fallback=filename||"NPE";
 const id=clean(titleId,120)||clean(titleEn,120)||fallback;
 const en=clean(titleEn,120)||clean(titleId,120)||fallback;
 return {title:clean(titleId||titleEn,120)||fallback,altId:clean("Foto "+id+" — Nusa Penida Experiences",180),altEn:clean("Photo of "+en+" — Nusa Penida Experiences",180)};
}
function beginCmsQuickPhoto(slot){
 if(!ownerSignedIn){say("#cmsStudioFeedback","Login admin diperlukan untuk mengganti foto.");return;}
 if(slot!=="__activity__"&&!Object.prototype.hasOwnProperty.call(cmsPageSlotLabels,slot)){
  say("#cmsStudioFeedback","Lokasi foto tidak dikenali. Tidak ada foto yang diubah.");return;
 }
 if(cmsQuickPhotoBusy)return;
 cmsQuickPhotoSlot=slot;
 clearCmsQuickSelection();
 const activity=slot==="__activity__";
 $("#cmsQuickPhotoHeading").textContent=activity?"Pilih foto aktivitas":"Ganti Foto";
 $("#cmsQuickPhotoSave").textContent=activity?"Gunakan Foto":"Simpan & Terbitkan Foto";
 $("#cmsQuickPhotoTarget").textContent=activity?"Untuk "+(cmsRead("title_id")||cmsRead("title_en")||"aktivitas ini")+" · judul dan deskripsi yang sudah diisi tetap tersimpan di formulir.":"Mengganti: "+cmsPageSlotLabels[slot]+" · pilih dari Galeri NPE atau galeri HP";
 $("#cmsQuickPhotoChooser").hidden=false;
 $("#cmsQuickPhotoSelected").hidden=true;
 $("#cmsQuickPhotoSearch").value="";$("#cmsQuickGalleryPanel").hidden=true;
 $("#cmsQuickPhotoGalleryStatus").textContent="Memuat foto yang sudah diunggah...";
 quickPhotoDialog.showModal();
 void refreshCmsQuickGallery();
}
async function refreshCmsQuickGallery(){
 try{
  const r=await api("admin/website/media");
  npeCmsMedia=r.items||[];
  drawCmsQuickGallery();
 }catch(e){say("#cmsQuickPhotoGalleryStatus","Tidak dapat membaca galeri: "+e.message);}
}
function drawCmsQuickGallery(){
 const q=$("#cmsQuickPhotoSearch").value.trim().toLowerCase();
 const available=npeCmsMedia.filter(m=>(m.title+" "+m.alt_id+" "+m.alt_en).toLowerCase().includes(q));
 $("#cmsQuickPhotoGalleryStatus").textContent=available.length+" foto tersedia di Galeri NPE";
 const root=$("#cmsQuickPhotoGallery");
 root.innerHTML=available.length?available.map(m=>
  '<button type="button" class="npeQuickGalleryItem" data-quick-existing="'+esc(m.id)+'">'+
  '<img src="'+esc(m.url)+'" loading="lazy" alt="'+esc(m.alt_id)+'"><span>'+esc(m.title)+'</span></button>'
 ).join(""):'<p class="feedback">Belum ada foto yang cocok. Gunakan tombol Dari Galeri HP untuk menambahkan foto.</p>';
 root.querySelectorAll("[data-quick-existing]").forEach(b=>b.onclick=()=>{
  const m=npeCmsMedia.find(x=>x.id===b.dataset.quickExisting);
  if(!m||!cmsQuickPhotoSlot)return;
  clearCmsQuickSelection();
  cmsQuickPhotoMediaId=m.id;
  $("#cmsQuickPhotoPreview").src=m.url;
  $("#cmsQuickPhotoMetaNote").textContent=m.title||"Foto tersimpan";$("#cmsQuickPhotoTitleWrap").hidden=true;
  $("#cmsQuickPhotoRightsWrap").hidden=true;
  $("#cmsQuickPhotoReuseNote").hidden=false;
  $("#cmsQuickPhotoChooser").hidden=true;
  $("#cmsQuickPhotoSelected").hidden=false;
 });
}
function clearCmsQuickSelection(){
 if(cmsQuickPhotoObjectUrl){URL.revokeObjectURL(cmsQuickPhotoObjectUrl);cmsQuickPhotoObjectUrl=null;}
 cmsQuickPhotoSource=null;cmsQuickPhotoMediaId=null;
 $("#cmsQuickPhotoFile").value="";
 $("#cmsQuickPhotoRights").checked=false;
 $("#cmsQuickPhotoRightsWrap").hidden=false;
 $("#cmsQuickPhotoReuseNote").hidden=true;
 $("#cmsQuickPhotoFeedback").textContent="";
 $("#cmsQuickPhotoMetaNote").textContent="";$("#cmsQuickPhotoName").value="";$("#cmsQuickPhotoTitleWrap").hidden=true;
}
function closeCmsQuickPhoto(){
 if(cmsQuickPhotoBusy)return;
 quickPhotoDialog.close();
}
quickPhotoDialog.addEventListener("cancel",event=>{if(cmsQuickPhotoBusy)event.preventDefault();});
quickPhotoDialog.addEventListener("close",()=>{
 clearCmsQuickSelection();
 cmsQuickPhotoSlot=null;
 $("#cmsQuickPhotoChooser").hidden=false;
 $("#cmsQuickPhotoSelected").hidden=true;
});
$("#cmsQuickPhotoCancel").onclick=closeCmsQuickPhoto;
$("#cmsQuickPhotoClose").onclick=closeCmsQuickPhoto;
$("#cmsQuickPhotoBack").onclick=()=>{
 if(cmsQuickPhotoBusy)return;
 clearCmsQuickSelection();$("#cmsQuickGalleryPanel").hidden=true;
 $("#cmsQuickPhotoChooser").hidden=false;
 $("#cmsQuickPhotoSelected").hidden=true;
 void refreshCmsQuickGallery();
};
$("#cmsQuickPhotoSearch").oninput=drawCmsQuickGallery;
$("#cmsQuickPickExisting").onclick=()=>{$("#cmsQuickGalleryPanel").hidden=false;$("#cmsQuickPhotoSearch").focus();void refreshCmsQuickGallery();};
$("#cmsQuickPickPhone").onclick=()=>{
 const picker=$("#cmsQuickPhotoFile");
 picker.value="";
 picker.click(); // native file picker called directly by user gesture
};
$("#cmsQuickPhotoFile").onchange=event=>{
 const file=event.target.files?.[0];
 if(!file)return; // selecting Cancel does not discard gallery selection
 if(!cmsQuickPhotoSlot)return;
 if(!file.type.startsWith("image/")){say("#cmsQuickPhotoGalleryStatus","Pilih foto JPG, PNG atau WebP.");return;}
 if(file.size>15000000){say("#cmsQuickPhotoGalleryStatus","Ukuran foto maksimum 15 MB.");return;}
 clearCmsQuickSelection();
 cmsQuickPhotoSource=file;
 cmsQuickPhotoObjectUrl=URL.createObjectURL(file);
 const label=cmsQuickPhotoSlot==="__activity__"?(cmsRead("title_id")||cmsRead("title_en")):cmsPageSlotLabels[cmsQuickPhotoSlot];
 $("#cmsQuickPhotoPreview").src=cmsQuickPhotoObjectUrl;
 $("#cmsQuickPhotoName").value=cmsPhotoMetadata(file,label).title;$("#cmsQuickPhotoTitleWrap").hidden=false;
 $("#cmsQuickPhotoMetaNote").textContent="Deskripsi foto dibuat otomatis." ;
 $("#cmsQuickPhotoChooser").hidden=true;
 $("#cmsQuickPhotoSelected").hidden=false;
};
async function uploadCmsWebsitePhoto(file,title,altId,altEn,rightsConfirmed,profile="default"){
 if(!rightsConfirmed)throw Error("Konfirmasi hak pakai komersial diperlukan.");
 if(title.length<2||altId.length<2||altEn.length<2||title.length>120||altId.length>180||altEn.length>180)
  throw Error("Nama dan deskripsi foto harus diisi (minimal 2 karakter).");
 const jpeg=await compressOwnerPhoto(file,profile);
 const form=new FormData();
 form.append("file",jpeg,"npe-website-photo.jpg");
 form.append("title",title);
 form.append("alt_id",altId);
 form.append("alt_en",altEn);
 form.append("rights_confirmed","true");
 const res=await fetch("/api/admin/website/media",{method:"POST",credentials:"same-origin",cache:"no-store",body:form});
 let out;try{out=await res.json();}catch(_){throw Error("Respons server tidak dapat dibaca.");}
 if(!res.ok)throw Error(out.error||"Unggah foto gagal.");
 return {...out,compressed_bytes:jpeg.size};
}
$("#cmsQuickPhotoSave").onclick=async()=>{
 if(cmsQuickPhotoBusy||(!cmsQuickPhotoSource&&!cmsQuickPhotoMediaId)||!cmsQuickPhotoSlot)return;
 if(cmsQuickPhotoSource&&!$("#cmsQuickPhotoRights").checked){say("#cmsQuickPhotoFeedback","Centang konfirmasi hak penggunaan foto terlebih dahulu.");return;}
 const isActivity=cmsQuickPhotoSlot==="__activity__";
 const label=cmsPageSlotLabels[cmsQuickPhotoSlot]||"";
 const entered=$("#cmsQuickPhotoName").value.trim();
 const {title,altId,altEn}=cmsPhotoMetadata(cmsQuickPhotoSource,entered||(isActivity?cmsRead("title_id"):label),isActivity?cmsRead("title_en"):entered||label);
 const button=$("#cmsQuickPhotoSave");cmsQuickPhotoBusy=true;button.disabled=true;
 $("#cmsQuickPhotoCancel").disabled=true;$("#cmsQuickPhotoClose").disabled=true;
 say("#cmsQuickPhotoFeedback","Mengoptimalkan foto dan menyimpan perubahan...",true);
 try{
  // Keep uploaded media if the slot update fails, so retry cannot upload a duplicate.
  if(!cmsQuickPhotoMediaId){
   const uploaded=await uploadCmsWebsitePhoto(cmsQuickPhotoSource,title,altId,altEn,true);
   cmsQuickPhotoMediaId=uploaded.id;
   if(!npeCmsMedia.some(m=>m.id===uploaded.id))npeCmsMedia.push({...uploaded,usage_count:0});
  }
  if(isActivity){
   // Only bind the media to the active form; the existing activity save/publish handles persistence.
   const photo=npeCmsMedia.find(m=>m.id===cmsQuickPhotoMediaId);
   if(!photo)throw Error("Foto tidak tersedia. Pilih kembali dari Galeri NPE.");
   const select=$("#cmsActivityMedia");
   if(!Array.from(select.options).some(o=>o.value===photo.id))select.add(new Option(photo.title,photo.id));
   cmsSet("media_id",photo.id);
   refreshActivityPreview();
   quickPhotoDialog.close();
   say("#cmsActivityFeedback","Foto dipilih. Semua isi formulir tetap sama; lanjutkan Simpan Draft atau Simpan & Publish.",true);
   return;
  }
  const slot=cmsQuickPhotoSlot;
  await api("admin/website/slots","POST",{slot,media_id:cmsQuickPhotoMediaId,owner_confirmed:true});
  const selected=npeCmsMedia.find(m=>m.id===cmsQuickPhotoMediaId);
  cmsPhotoOverrides.set(slot,{slot,media_id:cmsQuickPhotoMediaId,url:"/photos/website/"+cmsQuickPhotoMediaId,alt_id:selected?.alt_id||slot});
  // Refresh only image records: do not discard unsaved title/description edits.
  try{
   const [photos,media]=await Promise.all([api("public/website/slots"),api("admin/website/media")]);
   cmsPhotoOverrides=new Map((photos.items||[]).map(x=>[x.slot,x]));cmsSlotsLoaded=true;
   npeCmsMedia=media.items||[];cmsMediaLoaded=true;
   drawPublishedPageCards();
   renderCmsPagePhotos();
  }catch(_){ /* publication already succeeded; user can refresh to see the image */ }
  quickPhotoDialog.close();
  say("#cmsStudioFeedback","Foto "+(cmsPageSlotLabels[slot]||slot)+" berhasil diganti di website publik. Foto lain tidak berubah.",true);
  say("#cmsPageFeedback","Foto berhasil diganti tanpa meninggalkan editor. Perubahan teks yang belum disimpan tetap ada.",true);
 }catch(e){say("#cmsQuickPhotoFeedback","Gagal menyimpan foto: "+e.message);}
 finally{
  cmsQuickPhotoBusy=false;
  button.disabled=false;
  $("#cmsQuickPhotoCancel").disabled=false;
  $("#cmsQuickPhotoClose").disabled=false;
 }
};
function cmsCurrentPhoto(slot){
 if(!cmsSlotsLoaded)return null;
 const overridden=cmsPhotoOverrides.get(slot),fallback=cmsPublishedSnapshot.photos?.[slot];
 return overridden?.url?{url:overridden.url,alt:overridden.alt_id||slot}:fallback||null;
}
function drawPublishedPageCards(){
 const container=$("#cmsLegacyPublished");if(!container||!cmsPublishedSnapshot.id?.["hero.title"])return;
 container.innerHTML=cmsPublishedPages.map(([id,label,titleKey,summaryKey,slot,url])=>{
  const name=cmsEffectiveValue(titleKey,"id")||label,desc=cmsEffectiveValue(summaryKey,"id");
  const photo=cmsCurrentPhoto(slot),price=cmsEffectiveValue("price."+id,"id");
  return '<article class="npeCmsPublishedCard npeLegacyPublishedCard">'+
   '<div class="npeCmsPublishedImage">'+(photo?'<img loading="lazy" src="'+esc(photo.url)+'" alt="'+esc(photo.alt||name)+'">':'<div class="npeCmsNoImage">Foto belum tersinkron</div>')+'</div>'+
   '<div class="npeCmsPublishedInfo"><small>Halaman publik · Terbit</small><h4>'+esc(name)+'</h4><p>'+esc(desc.slice(0,180))+'</p>'+
   (price?'<strong class="npeCmsPublishedPrice">'+esc(price)+'</strong>':'')+
   (id!=="home"?'<button type="button" class="outline small" data-cms-add-detail="static:'+esc(id)+'">+ Tambah Detail</button>':'')+
   '<div class="npeCmsCardActions"><button type="button" class="primary small" data-cms-page="'+esc(id)+'">✎ Edit isi lengkap</button>'+ 
   '<button type="button" class="outline small" data-cms-quick-photo="'+esc(slot)+'">▧ Ganti Foto</button>'+
   '<a class="outline small" target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">Lihat ↗</a></div></div></article>';
 }).join("");
 container.querySelectorAll("[data-cms-page]").forEach(b=>b.onclick=()=>cmsPublishedPage(b.dataset.cmsPage));
 container.querySelectorAll("[data-cms-add-detail]").forEach(b=>b.onclick=()=>startWebsiteDetail(b.dataset.cmsAddDetail));
 container.querySelectorAll("[data-cms-quick-photo]").forEach(b=>b.onclick=()=>beginCmsQuickPhoto(b.dataset.cmsQuickPhoto));
}
function renderCmsPageDetails(){
 const page=$("#cmsPagePicker").value,parent="static:"+page,section=$("#cmsPageDetails");
 section.hidden=!cmsStaticParents.some(x=>x[0]===parent);
 if(section.hidden)return;
 $("#cmsAddPageDetail").onclick=()=>startWebsiteDetail(parent);
 const root=$("#cmsPageDetailList");
 if(!cmsActivitiesLoaded){root.textContent="Detail aktivitas belum tersinkron. Tekan Refresh.";return;}
 const children=npeCmsActivities.filter(a=>a.draft?.parent_activity===parent||a.published?.parent_activity===parent);
 root.innerHTML=children.length?children.map(a=>cmsActivityCard(a,a.status==="PUBLISHED"&&!!a.published)).join(""):'<p class="feedback">Belum ada detail tambahan. Tekan Tambah Detail.</p>';
 root.querySelectorAll("[data-cms-edit]").forEach(b=>b.onclick=()=>editWebsiteActivity(b.dataset.cmsEdit,"pages"));
 root.querySelectorAll("[data-cms-publish]").forEach(b=>b.onclick=()=>cmsPublishActivity(b.dataset.cmsPublish));
 root.querySelectorAll("[data-cms-archive]").forEach(b=>b.onclick=()=>cmsArchiveActivity(b.dataset.cmsArchive));
}
function renderCmsPagePhotos(){
 const root=$("#cmsPagePhotos");if(!root)return;
 const page=$("#cmsPagePicker").value;
 const slots=page==="home"?["hero","island"]:(cmsPagePhotoSlots[page]||[]);
 renderCmsPageDetails();
 renderLayoutEditor();
 const groups=new Map();for(const slot of slots){const group=slot==="hero"?"01 · Foto cover utama":!slot.includes("-")?"02 · Cover kartu wisata (dipakai bersama halaman paket)":"03 · Galeri destinasi / thumbnail";if(!groups.has(group))groups.set(group,[]);groups.get(group).push(slot);}
 root.innerHTML=[...groups].map(([name,list])=>'<details class="panel cmsPart" '+(page!=="home"?"open":"")+'> <summary>'+esc(name)+'</summary><div class="npeCmsPagePhotos">'+list.map(slot=>{
  const photo=cmsCurrentPhoto(slot);
  return '<article class="npeCmsPhotoTile">'+
   (photo?'<img src="'+esc(photo.url)+'" loading="lazy" alt="'+esc(photo.alt||slot)+'">':'<div class="npeCmsNoImage">Foto belum tersinkron / tersedia</div>')+
   '<div><strong>'+esc(cmsPageSlotLabels[slot]||slot)+'</strong>'+
   '<button type="button" class="outline small" data-cms-edit-photo="'+esc(slot)+'" '+(!cmsSlotsLoaded?"disabled":"")+'>Ganti foto</button></div></article>';
 }).join("")+'</div></details>').join("");
 root.querySelectorAll("[data-cms-edit-photo]").forEach(b=>b.onclick=()=>beginCmsQuickPhoto(b.dataset.cmsEditPhoto));
 const coverMount=$("#cmsHeroCoverPhoto");
 if(page==="home"&&coverMount){const cover=[...root.querySelectorAll("details")].find(el=>el.querySelector('[data-cms-edit-photo="hero"]'));if(cover){coverMount.replaceChildren(cover);cover.open=true;}}
 $("#cmsPagePhoto").hidden=page==="home";
 refreshRegionCardPreviews();
}
function cmsPublishedPage(page){
 $("#cmsPagePicker").value=page;$("#cmsPageLocale").value="id";
 $("#cmsPageFilter").value="";
 cmsView("pages");if(!cmsFields.length)void loadSiteEditor();
}
document.querySelectorAll("[data-cms-page]").forEach(b=>b.onclick=()=>cmsPublishedPage(b.dataset.cmsPage));
function renderCmsPageFields(){
 const root=$("#cmsPageFields"),notice=$("#cmsPageSummary");
 if(!root)return;
 if(!cmsFields.length||!cmsPublishedSnapshot.id?.["hero.title"]){
  root.innerHTML='<p class="feedback">Memuat konten website yang sudah terbit...</p>';
  return;
 }
 const page=$("#cmsPagePicker").value,lang=$("#cmsPageLocale").value,fields=new Map(cmsFields);
 const keys=[...new Set(cmsPageMap[page]||[])].filter(k=>fields.has(k));
 const missing=keys.filter(k=>!cmsEffectiveValue(k,lang).trim());
 const labels={home:"Beranda NPE",snorkeling:"Snorkeling Nusa Penida",island:"Island Tour",west:"Wisata Barat",east:"Wisata Timur"};
 notice.textContent=labels[page]+" · "+keys.length+" bagian isi saat ini berhasil dimuat ("+(lang==="en"?"English":"Bahasa Indonesia")+"). Ubah satu atau beberapa kolom; kolom yang tidak diubah akan tetap sama."+
  (missing.length?" "+missing.length+" bagian belum mempunyai konten bawaan; dapat diisi melalui editor.":"");
 const sectionFor=k=>page==="home"?(k.startsWith("hero.")?"01 · Cover / Hero":k.startsWith("packages.")||k.startsWith("island.")||k.startsWith("snorkeling.")||k==="price.island"||k==="price.snorkeling"?"02 · Isi paket wisata":/^(regions|west|east|sea)\.|^price\.(west|east)$/.test(k)?"03 · Kartu destinasi Barat, Timur & Snorkeling":k.startsWith("homeThumb.")?"04 · Nama thumbnail galeri":"05 · Kontak & isi lainnya"):/Spot\./.test(k)?"03 · Isi galeri destinasi":k.startsWith("price.")?"02 · Harga":"01 · Cover & isi halaman";
 const groups=new Map();for(const k of keys){const group=sectionFor(k);if(!groups.has(group))groups.set(group,[]);groups.get(group).push(k);}
 root.innerHTML=[...groups].sort(([a],[b])=>a.localeCompare(b)).map(([group,groupKeys],i)=>'<details class="panel cmsPart"'+(i===0?" open":"")+'> <summary>'+esc(group)+'</summary><div class="npeCmsPageFields">'+groupKeys.map(k=>{
  const value=cmsEffectiveValue(k,lang),label=fields.get(k)||k,isPrice=k.startsWith("price.");
  const rows=isPrice?2:/description|deskripsi|ringkasan|lead|summary/i.test(k+" "+label)?4:2;
  return '<label class="npeCmsPageField" data-cms-page-field="'+esc(k)+'">'+
   '<span>'+esc(label)+(isPrice?' <small>· boleh kosong</small>':'')+'</span>'+
   '<textarea data-cms-page-key="'+esc(k)+'" rows="'+rows+'" maxlength="1200" placeholder="'+
    (isPrice?"Kosongkan untuk menyembunyikan harga":"Isi konten halaman")+'">'+esc(value)+'</textarea></label>';
 }).join("")+'</div></details>').join("");
 renderHeroListEditor(page);
 renderRegionCardsEditor(page);
 $("#cmsPageFeedback").textContent="";
 renderCmsPagePhotos();filterCmsPageFields();
}
function filterCmsPageFields(){
 const q=$("#cmsPageFilter")?.value?.trim().toLowerCase()||"";
 $("#cmsPageFields")?.querySelectorAll("[data-cms-page-field]").forEach(el=>{
  const field=el.querySelector("span")?.textContent?.toLowerCase()||"";
  el.hidden=Boolean(q&&!field.includes(q)&&!el.dataset.cmsPageField.toLowerCase().includes(q));
  if(q&&!el.hidden){for(let group=el.closest("details");group;group=group.parentElement?.closest("details"))group.open=true;}
 });
}
$("#cmsPageFilter").oninput=filterCmsPageFields;
$("#cmsPagePicker").onchange=()=>{recordDashboardNav({view:"pages",page:$("#cmsPagePicker").value});renderCmsPageFields();};
$("#cmsPageLocale").onchange=renderCmsPageFields;
$("#cmsPagePhoto").onclick=()=>{
 const page=$("#cmsPagePicker").value,slot=cmsPublishedPages.find(([id])=>id===page)?.[4]||"hero";
 beginCmsQuickPhoto(slot);
};
$("#cmsPageSave").onclick=async()=>{
 const btn=$("#cmsPageSave");btn.disabled=true;
 const lang=$("#cmsPageLocale").value;
 let updated=0;
 try{
  for(const el of $("#cmsPageFields").querySelectorAll("[data-cms-page-key]")){
   const key=el.dataset.cmsPageKey,value=el.value.trim(),prev=cmsRecords.get(lang+":"+key);
   if(value===cmsEffectiveValue(key,lang))continue;
   if(!key.startsWith("price.")&&value.length<2)throw Error("Judul/deskripsi minimal 2 karakter: "+key);
   if(/[<>\u0000-\u001f\u007f]/.test(value)||value.length>1200)throw Error("Konten tidak valid: "+key);
   const saved=await api("admin/site-content","POST",{key,locale:lang,value,expected_version:prev?.version||0,owner_confirmed:true});
   cmsRecords.set(lang+":"+key,saved);updated++;
  }
  window.NusaLanguage?.resetCache();
  drawPublishedPageCards();
  say("#cmsPageFeedback",updated?updated+" bagian berhasil diterbitkan. Bagian lain tetap seperti semula.":"Tidak ada perubahan baru.",true);
 }catch(e){say("#cmsPageFeedback",updated+" elemen tersimpan. "+e.message+" Muat ulang jika ada konflik.");}
 finally{btn.disabled=false;}
};

const heroListKey="hero.highlights";
const heroIconChoices={tour:["✦","Island tour"],snorkel:["〰","Snorkeling"],private:["◈","Sharing / Private"],local:["♡","Operator lokal"],boat:["⛴","Fast boat"],beach:["☀","Pantai"],check:["✓","Lainnya"]};
let heroListDraft=null,heroListVersion=0,heroListDirty=false;
function readHeroList(){
 const saved=cmsRecords.get("id:"+heroListKey);
 if(saved){try{const rows=JSON.parse(saved.value);if(Array.isArray(rows))return rows;}catch(_){}}
 return ["tour","snorkel","private","local"].map((icon,i)=>({icon,id:cmsEffectiveValue("hero.highlight"+(i+1),"id"),en:cmsEffectiveValue("hero.highlight"+(i+1),"en")}));
}
function renderHeroListEditor(page){
 const root=$("#cmsPageFields");
 if(page!=="home")return;
 const cover=root.querySelector("details");
 if(!cover)return;
 const mount=document.createElement("div");mount.id="cmsHeroCoverPhoto";cover.insertBefore(mount,cover.children[1]||null);
 if(!heroListDirty){heroListDraft=readHeroList();heroListVersion=cmsRecords.get("id:"+heroListKey)?.version||0;}
 const panel=document.createElement("section");panel.className="heroListEditor";panel.id="cmsHeroListEditor";
 panel.innerHTML='<div class="npeCmsSectionHeader"><div><h4>Layanan di bawah cover</h4><p class="feedback">Tambah, ubah, hapus atau atur urutan. ID dan EN tersimpan bersama. Maksimal 8 layanan.</p></div></div><div id="cmsHeroListRows"></div><div class="actions"><button type="button" class="outline small" id="cmsHeroAdd">+ Tambah layanan</button><button type="button" class="outline small" id="cmsHeroBoat">+ Fast Boat Ticket</button></div><div id="cmsHeroListPreview" class="heroListPreview"></div><div class="actions"><button type="button" class="primary small" id="cmsHeroListSave">Simpan & terbitkan layanan</button><button type="button" class="outline small" id="cmsHeroListReset">Batalkan perubahan</button></div><p class="feedback" role="status" id="cmsHeroListFeedback"></p>';
 cover.append(panel);
 drawHeroListRows();
 $("#cmsHeroAdd").onclick=()=>addHeroListRow({icon:"check",id:"",en:""});
 $("#cmsHeroBoat").onclick=()=>addHeroListRow({icon:"boat",id:"Tiket Fast Boat",en:"Fast Boat Tickets"});
 $("#cmsHeroListReset").onclick=()=>{heroListDirty=false;heroListDraft=readHeroList();heroListVersion=cmsRecords.get("id:"+heroListKey)?.version||0;drawHeroListRows();say("#cmsHeroListFeedback","Perubahan daftar dibatalkan.",true);};
 $("#cmsHeroListSave").onclick=async()=>{
  const btn=$("#cmsHeroListSave");btn.disabled=true;
  try{
   const rows=heroListDraft.map(x=>({icon:x.icon,id:x.id.trim(),en:x.en.trim()}));
   if(rows.some(x=>x.id.length<2||x.en.length<2))throw Error("Lengkapi nama layanan dalam kedua bahasa.");
   if(!confirm("Terbitkan daftar layanan cover dalam kedua bahasa?"))return;
   const result=await api("admin/site-content","POST",{key:heroListKey,locale:"id",value:JSON.stringify(rows),expected_version:heroListVersion,owner_confirmed:true});
   cmsRecords.set("id:"+heroListKey,result);heroListVersion=result.version;heroListDraft=rows;heroListDirty=false;
   drawHeroListRows();say("#cmsHeroListFeedback","Daftar layanan berhasil diterbitkan. Muat ulang website untuk melihatnya.",true);
  }catch(err){say("#cmsHeroListFeedback",err.message);}finally{btn.disabled=false;}
 };
}
function addHeroListRow(row){
 if(heroListDraft.length>=8){say("#cmsHeroListFeedback","Maksimal 8 layanan.");return;}
 heroListDraft.push(row);heroListDirty=true;drawHeroListRows();
}
function drawHeroListPreview(){
 const root=$("#cmsHeroListPreview");if(!root)return;
 const lang=$("#cmsPageLocale").value;
 root.innerHTML='<small>Pratinjau · '+lang.toUpperCase()+'</small><div>'+heroListDraft.map(row=>'<span><b>'+esc(heroIconChoices[row.icon]?.[0]||"✓")+'</b> '+esc(row[lang]||"Nama layanan")+'</span>').join("")+'</div>';
}
function drawHeroListRows(){
 const root=$("#cmsHeroListRows");if(!root)return;
 root.innerHTML=heroListDraft.map((row,i)=>'<div class="heroListRow"><div class="heroListRowHead"><strong>Layanan '+(i+1)+'</strong><div class="actions"><label class="orderPosition">Posisi <select aria-label="Pindahkan layanan '+(i+1)+' ke posisi" data-hero-position="'+i+'">'+heroListDraft.map((_,j)=>'<option value="'+j+'" '+(i===j?"selected":"")+'>'+(j+1)+'</option>').join("")+'</select></label><button type="button" class="outline small" data-hero-remove="'+i+'">Hapus</button></div></div><label>Ikon<select data-hero-row="'+i+'" data-hero-field="icon">'+Object.entries(heroIconChoices).map(([key,[symbol,label]])=>'<option value="'+key+'" '+(row.icon===key?"selected":"")+'>'+esc(symbol+" "+label)+'</option>').join("")+'</select></label><div class="npeCms2col"><label>Indonesia<input maxlength="60" data-hero-row="'+i+'" data-hero-field="id" value="'+esc(row.id)+'"></label><label>English<input maxlength="60" data-hero-row="'+i+'" data-hero-field="en" value="'+esc(row.en)+'"></label></div></div>').join("")||'<p class="feedback">Tidak ada layanan. Tambahkan layanan jika diinginkan.</p>';
 root.querySelectorAll("[data-hero-field]").forEach(el=>el.oninput=()=>{heroListDraft[Number(el.dataset.heroRow)][el.dataset.heroField]=el.value;heroListDirty=true;drawHeroListPreview();});
 root.querySelectorAll("[data-hero-remove]").forEach(el=>el.onclick=()=>{heroListDraft.splice(Number(el.dataset.heroRemove),1);heroListDirty=true;drawHeroListRows();});
 root.querySelectorAll("[data-hero-position]").forEach(el=>el.onchange=()=>{heroListDraft=moveTo(heroListDraft,Number(el.dataset.heroPosition),Number(el.value));heroListDirty=true;drawHeroListRows();});
 $("#cmsHeroAdd").disabled=heroListDraft.length>=8;$("#cmsHeroBoat").disabled=heroListDraft.length>=8||heroListDraft.some(row=>row.icon==="boat");
 drawHeroListPreview();
}


// Homepage destination workspace: keep the existing CMS fields, photo slots and activity forms.
const regionStaticCards=[
 ["west","west","West Tour","static:west"],
 ["east","east","East Tour","static:east"],
 ["snorkeling","sea","Snorkeling","static:snorkeling"]
];
function regionNavigate(action){
 if([...$("#cmsPageFields").querySelectorAll("[data-cms-page-key]")].some(el=>el.value.trim()!==cmsEffectiveValue(el.dataset.cmsPageKey,$("#cmsPageLocale").value))&&
 !confirm("Ada perubahan teks yang belum diterbitkan. Lanjutkan tanpa menyimpannya?"))return;
 action();
}
function openRegionOrder(group){
 const picker=$("#cmsLayoutGroup");
 if(![...picker.options].some(x=>x.value===group))return;
 if(layoutEdit?.dirty&&layoutEdit.group!==group&&!confirm("Batalkan perubahan susunan yang belum disimpan?"))return;
 if(layoutEdit?.group!==group||!layoutEdit?.dirty){picker.value=group;loadLayoutDraft();}
 $("#cmsLayoutPanel").open=true;$("#cmsLayoutPanel").scrollIntoView({block:"start"});
}
function newRegionItem(group,parent=""){
 regionNavigate(()=>{
  if(parent)startWebsiteDetail(parent);else resetWebsiteForm();
  cmsRegionPlacement=group||null;
 });
}
async function placePublishedRegionItem(group,id){
 // Read the latest version rather than overwriting a concurrent layout change.
 const records=(await api("admin/site-content")).items||[];
 const key=LAYOUT_PREFIX+group,record=records.find(x=>x.key===key&&x.locale==="id");
 const config=readOrder(record?{[key]:record.value}:{},group),item="activity:"+id;
 const base=groupItems(group,layoutActivities()).filter(x=>!x.optional).map(x=>x.key);
 const order=[...new Set([...config.order,...base,item])];
 const saved=await api("admin/site-content","POST",{key,locale:"id",value:JSON.stringify({order,hidden:config.hidden.filter(k=>k!==item)}),expected_version:record?.version||0,owner_confirmed:true});
 cmsRecords.set("id:"+key,saved);
 if(layoutEdit?.group===group&&!layoutEdit.dirty)loadLayoutDraft();
}
function regionPhotoTile(slot,label){
 return '<div class="regionPhotoTile"><img data-region-photo="'+esc(slot)+'" alt="'+esc(label)+'" hidden><button type="button" class="outline small" data-region-photo-edit="'+esc(slot)+'">Ganti foto</button></div>';
}
function renderRegionCardsEditor(page){
 if(page!=="home")return;
 const root=$("#cmsPageFields");
 const section=root.querySelector('[data-cms-page-field="regions.title"]')?.closest("details");
 if(!section)return;
 section.querySelector("summary").textContent="03 · Destinasi & aktivitas (kartu dan detail)";
 const intro=document.createElement("div");intro.className="npeCmsPageFields";
 const cards=document.createElement("div");cards.id="cmsRegionCards";cards.className="regionCardEditorList";
 const actions=document.createElement("div");actions.className="actions";
 actions.innerHTML='<button type="button" class="primary small" id="cmsRegionAdd">+ Tambah aktivitas</button><button type="button" class="outline small" id="cmsRegionOrder">Atur posisi / tampilkan kartu</button>';
 const moveField=(key,to)=>{const field=root.querySelector('[data-cms-page-field="'+key+'"]');if(field)to.append(field);};
 for(const key of ["regions.eyebrow","regions.title","regions.description"])moveField(key,intro);
 const original=section.querySelector(".npeCmsPageFields");
 section.append(intro,actions,cards);
 for(const [slot,prefix,label,parent] of regionStaticCards){
  const card=document.createElement("details");card.className="regionEditorCard";card.dataset.regionCard=slot;
  card.innerHTML='<summary><span data-region-card-title>'+esc(label)+'</span> <small data-region-status></small></summary><div class="regionEditorBody">'+regionPhotoTile(slot,label)+'<div class="npeCmsPageFields" data-region-fields></div><div class="actions"><button type="button" class="outline small" data-region-page="'+esc(slot)+'">Edit halaman & deskripsi lengkap</button><button type="button" class="primary small" data-region-add-detail="'+esc(parent)+'" data-region-placement="thumb:'+esc(slot)+'">+ Tambah detail</button><button type="button" class="outline small" data-region-order="thumb:'+esc(slot)+'">Atur posisi thumbnail</button></div><h5>Thumbnail & detail</h5><div class="regionEditorThumbs" data-region-thumbs></div><div data-region-children></div></div>';
  cards.append(card);
  for(const key of [prefix+".title",prefix+".description","regions."+prefix+".cta","price."+slot])moveField(key,card.querySelector("[data-region-fields]"));
  for(const thumb of groupItems("thumb:"+slot,[])){
   const key=thumb.key,photoSlot=key.replace(/-second$/,"");
   const tile=document.createElement("div");tile.className="regionEditorThumb";
   tile.innerHTML=regionPhotoTile(photoSlot,cmsPageSlotLabels[photoSlot]||key)+'<div data-region-thumb-label></div><button type="button" class="outline small" data-region-page="'+esc(photoSlot)+'">Edit detail</button>';
   card.querySelector("[data-region-thumbs]").append(tile);
   moveField("homeThumb."+key+".title",tile.querySelector("[data-region-thumb-label]"));
  }
 }
 const dynamic=document.createElement("div");dynamic.id="cmsRegionDynamicCards";cards.append(dynamic);
 if(original&&!original.children.length)original.remove();
 for(const group of [...root.querySelectorAll(":scope > details")]){if(group!==section&&!group.querySelector("[data-cms-page-field]")&&!group.querySelector("#cmsHeroListEditor"))group.remove();}
 $("#cmsRegionAdd").onclick=()=>newRegionItem("regions");
 $("#cmsRegionOrder").onclick=()=>openRegionOrder("regions");
 section.addEventListener("click",event=>{
  const b=event.target.closest("button");if(!b)return;
  if(b.dataset.regionPhotoEdit)beginCmsQuickPhoto(b.dataset.regionPhotoEdit);
  else if(b.dataset.regionPage)regionNavigate(()=>cmsPublishedPage(b.dataset.regionPage));
  else if(b.dataset.regionAddDetail)newRegionItem(b.dataset.regionPlacement||"",b.dataset.regionAddDetail);
  else if(b.dataset.regionOrder)openRegionOrder(b.dataset.regionOrder);
  else if(b.dataset.regionEdit)regionNavigate(()=>editWebsiteActivity(b.dataset.regionEdit,"pages"));
 });
 refreshRegionCardPreviews();
}
function refreshRegionCardPreviews(){
 const root=$("#cmsRegionCards");if(!root)return;
 const lang=$("#cmsPageLocale").value;
 for(const img of root.querySelectorAll("[data-region-photo]")){
  const photo=cmsCurrentPhoto(img.dataset.regionPhoto);img.hidden=!photo;
  if(photo){img.src=photo.url;img.alt=photo.alt||img.dataset.regionPhoto;}
 }
 for(const b of root.querySelectorAll("[data-region-photo-edit]"))b.disabled=!cmsSlotsLoaded;
 const record=cmsRecords.get("id:"+LAYOUT_PREFIX+"regions"),config=readOrder(record?{[LAYOUT_PREFIX+"regions"]:record.value}:{},"regions");
 const childrenHTML=parent=>npeCmsActivities.filter(a=>a.status==="PUBLISHED"&&a.published?.parent_activity===parent).map(a=>'<div class="regionChildRow"><img loading="lazy" src="/photos/website/'+esc(a.published.media_id)+'" alt=""><strong>'+esc(a.published["title_"+lang])+'</strong><button type="button" class="outline small" data-region-edit="'+esc(a.id)+'">Edit detail</button></div>').join("")||'<p class="feedback">Belum ada detail tambahan.</p>';
 for(const [slot,prefix,label,parent] of regionStaticCards){
  const card=root.querySelector('[data-region-card="'+slot+'"]');if(!card)continue;
  card.querySelector("[data-region-card-title]").textContent=cmsEffectiveValue(prefix+".title",lang)||label;
  card.querySelector("[data-region-status]").textContent=config.hidden.includes(slot)?"Disembunyikan":"Tampil";
  card.querySelector("[data-region-children]").innerHTML=cmsActivitiesLoaded?childrenHTML(parent):'<p class="feedback">Memuat detail...</p>';
 }
 const dynamic=$("#cmsRegionDynamicCards");if(!dynamic)return;
 if(!cmsActivitiesLoaded){dynamic.textContent="Memuat aktivitas...";return;}
 const roots=layoutActivities().filter(a=>!a.parent_activity),map=new Map(roots.map(a=>["activity:"+a.id,a]));
 const open=new Set([...dynamic.querySelectorAll("details[open]")].map(n=>n.dataset.regionCard));
 dynamic.innerHTML=orderedKeys([...map.keys()],config).map(key=>{
  const a=map.get(key),parent="activity:"+a.slug,shown=config.order.includes(key)&&!config.hidden.includes(key);
  return '<details class="regionEditorCard" data-region-card="'+esc(key)+'" '+(open.has(key)?"open":"")+'><summary>'+esc(a["title_"+lang])+' <small>'+ (shown?"Tampil":"Belum ditampilkan / disembunyikan")+'</small></summary><div class="regionEditorBody"><img class="regionDynamicCover" loading="lazy" src="/photos/website/'+esc(a.media_id)+'" alt=""><p>'+esc(a["summary_"+lang]||"")+'</p><div class="actions"><button type="button" class="primary small" data-region-edit="'+esc(a.id)+'">Edit aktivitas & cover</button><button type="button" class="outline small" data-region-order="regions">Atur posisi / tampilkan</button><button type="button" class="outline small" data-region-add-detail="'+esc(parent)+'">+ Tambah detail</button><button type="button" class="outline small" data-region-order="detail:'+esc(parent)+'">Atur detail & thumbnail</button></div><h5>Detail / thumbnail</h5>'+childrenHTML(parent)+'</div></details>';
 }).join("");
 // Mixed static/dynamic ordering is shown in the shared direct-position control.
 const byKey=new Map(regionStaticCards.map(([key])=>[key,root.querySelector('[data-region-card="'+key+'"]')]));
 for(const key of orderedKeys([...byKey.keys()],config))root.insertBefore(byKey.get(key),dynamic);
}
const layoutLabels={packages:"Paket wisata di beranda",regions:"Kartu destinasi di beranda","thumb:west":"Thumbnail West Tour","thumb:east":"Thumbnail East Tour","thumb:snorkeling":"Thumbnail Snorkeling","detail:static:west":"Detail West Tour","detail:static:east":"Detail East Tour","detail:static:snorkeling":"Detail Snorkeling","detail:static:island":"Detail Island Tour"};
let layoutEdit=null;
function layoutActivities(){return npeCmsActivities.filter(x=>x.status==="PUBLISHED"&&x.published).map(x=>({id:x.id,...x.published}));}
function renderLayoutEditor(){
 const picker=$("#cmsLayoutGroup");if(!picker)return;
 const old=picker.value;
 const labels={...layoutLabels};
 for(const item of layoutActivities().filter(x=>!x.parent_activity))labels["detail:activity:"+item.slug]="Detail "+item.title_id;
 picker.innerHTML=Object.entries(labels).map(([key,label])=>'<option value="'+esc(key)+'">'+esc(label)+'</option>').join("");
 const page=$("#cmsPagePicker").value,preferred="detail:static:"+page;
 picker.value=Object.hasOwn(labels,old)?old:Object.hasOwn(labels,preferred)?preferred:page==="home"?"regions":"packages";
 if(!layoutEdit||layoutEdit.group!==picker.value||!layoutEdit.dirty)loadLayoutDraft();
 else drawLayoutRows();
}
function loadLayoutDraft(){
 const group=$("#cmsLayoutGroup").value,record=cmsRecords.get("id:"+LAYOUT_PREFIX+group);
 const config=readOrder(record?{[LAYOUT_PREFIX+group]:record.value}:{},group);
 const items=groupItems(group,layoutActivities()).map(x=>({...x,label:x.optional||x.key.startsWith("activity:")?x.label:cmsPageSlotLabels[x.key.replace(/-second$/,"")]||x.label}));
 const keys=orderedKeys(items.map(x=>x.key),config);
 layoutEdit={group,version:record?.version||0,items,keys,hidden:new Set([...config.hidden,...items.filter(x=>x.optional&&!config.order.includes(x.key)).map(x=>x.key)]),dirty:false};
 drawLayoutRows();
}
function drawLayoutRows(){
 const root=$("#cmsLayoutRows");if(!root||!layoutEdit)return;
 if(!cmsActivitiesLoaded){root.textContent="Memuat daftar aktivitas...";$("#cmsLayoutSave").disabled=true;return;}
 $("#cmsLayoutSave").disabled=false;
 const x=layoutEdit,visible=x.keys.filter(k=>!x.hidden.has(k)),hidden=x.keys.filter(k=>x.hidden.has(k));
 const title=k=>x.items.find(i=>i.key===k)?.label||k;
 root.innerHTML=visible.map((k,i)=>'<div class="layoutOrderRow"><strong>'+esc(title(k))+'</strong><label>Posisi <select data-layout-position="'+i+'" aria-label="Posisi '+esc(title(k))+'">'+visible.map((_,j)=>'<option value="'+j+'" '+(j===i?"selected":"")+'>'+(j+1)+'</option>').join("")+'</select></label><button type="button" class="outline small" data-layout-hide="'+esc(k)+'">Sembunyikan</button></div>').join("")+
 (hidden.length?'<details class="layoutAvailable"><summary>Item tersedia / disembunyikan ('+hidden.length+')</summary>'+hidden.map(k=>'<div class="layoutOrderRow"><span>'+esc(title(k))+'</span><button type="button" class="outline small" data-layout-show="'+esc(k)+'">+ Tampilkan</button></div>').join("")+'</details>':"");
 root.querySelectorAll("[data-layout-position]").forEach(el=>el.onchange=()=>{x.keys=[...moveTo(visible,Number(el.dataset.layoutPosition),Number(el.value)),...hidden];x.dirty=true;drawLayoutRows();});
 root.querySelectorAll("[data-layout-hide]").forEach(el=>el.onclick=()=>{x.hidden.add(el.dataset.layoutHide);x.dirty=true;drawLayoutRows();});
 root.querySelectorAll("[data-layout-show]").forEach(el=>el.onclick=()=>{x.hidden.delete(el.dataset.layoutShow);x.dirty=true;drawLayoutRows();});
}
$("#cmsLayoutGroup").onchange=()=>{if(layoutEdit?.dirty&&!confirm("Batalkan perubahan susunan yang belum disimpan?")){$("#cmsLayoutGroup").value=layoutEdit.group;return;}loadLayoutDraft();};
$("#cmsLayoutReset").onclick=loadLayoutDraft;
$("#cmsLayoutAdd").onclick=()=>{
 const group=$("#cmsLayoutGroup").value;
 if(group.startsWith("thumb:"))startWebsiteDetail("static:"+group.slice(6));
 else if(group.startsWith("detail:"))startWebsiteDetail(group.slice(7));
 else resetWebsiteForm();
};
$("#cmsLayoutSave").onclick=async()=>{
 if(!layoutEdit||!cmsActivitiesLoaded)return;
 const x=layoutEdit,btn=$("#cmsLayoutSave");btn.disabled=true;
 try{
  if(!confirm("Terbitkan susunan ini dalam kedua bahasa? Item yang disembunyikan tidak dihapus dari database."))return;
  const key=LAYOUT_PREFIX+x.group,result=await api("admin/site-content","POST",{key,locale:"id",value:JSON.stringify({order:x.keys,hidden:[...x.hidden]}),expected_version:x.version,owner_confirmed:true});
  cmsRecords.set("id:"+key,result);x.version=result.version;x.dirty=false;refreshRegionCardPreviews();say("#cmsLayoutFeedback","Susunan terbit. Muat ulang website untuk melihat hasilnya.",true);
 }catch(err){say("#cmsLayoutFeedback",err.message);}finally{btn.disabled=false;}
};

// Automatically restore durable login even after browser/app restart. No admin token stored in localStorage.
(async function restoreOwnerSession(){
 try{
  await api("admin/session");
  sessionStorage.removeItem("tourAdmin");
  await enterOwnerDashboard();
 }catch(err){
  // One-time migration from the previous tab-only version; discard the stored secret immediately.
  const legacy=sessionStorage.getItem("tourAdmin");
  sessionStorage.removeItem("tourAdmin");
  if(legacy){
   try{
    await api("admin/session/login","POST",{token:legacy});
    await enterOwnerDashboard();
    return;
   }catch(_){/* User can authenticate with an updated token. */}
  }
  ownerSignedIn=false;$("#unlockPanel").hidden=false;$("#adminContent").hidden=true;$("#lock").hidden=true;
  if(!/Akses owner|Server 401|authenticated/i.test(err.message))
   say("#loginMessage","Koneksi atau sesi belum tersedia. Periksa internet lalu coba kembali.");
 }
})();
// Admin sessions and API responses are never cached by the guest service worker.
// A non-secret marker identifies devices that opened the owner workspace; never store credentials here.
try{localStorage.setItem("npe-owner-workspace-visited","1");}catch(_){}
// Register the static PWA shell for Android installation; it intentionally excludes dashboard.html, APIs and credentials.
if("serviceWorker" in navigator)navigator.serviceWorker.register("/service-worker.js").catch(()=>{});

let seoItems=[],seoEditing=null,seoMedia=[],seoOrder=[],seoOrderVersion=0,seoCoverBusy=false,seoEditorGeneration=0;
const seoForm=$("#seoForm");
function seoFormPayload(){
 const data=new FormData(seoForm);
 return {...Object.fromEntries(data),links:data.getAll("links"),expected_version:seoEditing?.version||0};
}
function drawSeoCover(){
 const id=$("#seoMedia").value,photo=seoMedia.find(p=>p.id===id),root=$("#seoCoverPreview");
 root.innerHTML=id?'<img class="seoEditorCover" alt="'+esc(photo?.title||"Foto cover artikel")+'" src="'+esc(photo?.url||"/photos/website/"+id)+'?npew=480">':"<p>Belum ada cover.</p>";
 $("#seoCoverRemove").disabled=!id||seoCoverBusy;
}
function editSeoArticle(item=null){
 if(seoCoverBusy)return;
 seoEditorGeneration++;
 seoEditing=item;seoForm.reset();seoForm.hidden=false;recordDashboardNav({article:item?.id||"new"});$("#seoPreviewArea").textContent="";
 $("#seoMedia").value="";
 say("#seoCoverFeedback","Pilih foto dari perangkat, konfirmasi hak, lalu Upload. Simpan draft untuk menerapkan cover.",true);
 const draft=item?.draft||{};
 $("#seoEditStatus").textContent=item?.published?"Artikel sedang terbit. Simpan revisi sebagai draft; versi publik lama tetap tampil sampai revisi disetujui dan diterbitkan.":"Isi kedua bahasa, pilih cover, lalu simpan draft.";
 for(const [key,value] of Object.entries(draft)){
  if(key==="links")continue;
  const el=seoForm.elements.namedItem(key);if(el)el.value=value;
 }
 for(const input of seoForm.querySelectorAll('[name="links"]'))input.checked=(draft.links||[]).includes(input.value);
 $("#seoUrl").textContent=item?"URL tetap: /id/articles/"+item.slug+" · /en/articles/"+item.slug:"URL dibuat saat simpan draft.";
 const evidence=item?.research;
 $("#seoResearchEvidence").innerHTML=evidence?'<small>Riset otomatis · '+esc(evidence.research_date||"")+'</small><p>'+esc(evidence.keyword||"")+' · sinyal pertanyaan publik: '+esc(String(evidence.public_question_signals??0))+' (bukan volume pencarian)</p><p>'+(evidence.sources||[]).map(u=>'<span>'+esc(u)+'</span>').join(" · ")+'</p><p>'+esc(evidence.source_kind==="REVIEWED_REFERENCE"?"Referensi cadangan ditinjau "+(evidence.source_checked_at||"")+"; pengambilan sumber daring gagal.":evidence.source_kind?"Sumber daring: "+evidence.source_kind:"") +'</p><p>Periksa kesamaan makna kedua bahasa, fakta dan cover sebelum Setujui.</p>':"";
 drawSeoCover();
 $("#seoEditorHeading").focus({preventScroll:true});seoForm.scrollIntoView({block:"start",behavior:"instant"});
}

function drawSeoOrder(){
 const root=$("#seoOrderRows");if(!root)return;
 root.innerHTML=seoOrder.map((key,i)=>{const article=seoItems.find(x=>"article:"+x.id===key);return '<div class="layoutOrderRow"><strong>'+esc(article?.published?.title_id||key)+'</strong><label>Posisi <select data-seo-position="'+i+'">'+seoOrder.map((_,j)=>'<option value="'+j+'" '+(j===i?"selected":"")+'>'+(j+1)+'</option>').join("")+'</select></label></div>';}).join("")||'<p class="feedback">Terbitkan artikel terlebih dahulu.</p>';
 root.querySelectorAll("[data-seo-position]").forEach(el=>el.onchange=()=>{seoOrder=moveTo(seoOrder,Number(el.dataset.seoPosition),Number(el.value));drawSeoOrder();drawSeoList();say("#seoOrderFeedback","Urutan belum disimpan.",true);});
 $("#seoOrderSave").disabled=seoOrder.length===0;
}
$("#seoOrderSave").onclick=async()=>{
 const btn=$("#seoOrderSave");btn.disabled=true;
 try{if(!confirm("Terbitkan urutan artikel baru?"))return;
  const result=await api("admin/site-content","POST",{key:"layout.order.articles",locale:"id",value:JSON.stringify({order:seoOrder,hidden:[]}),expected_version:seoOrderVersion,owner_confirmed:true});
  seoOrderVersion=result.version;drawSeoList();say("#seoOrderFeedback","Urutan artikel berhasil diterbitkan.",true);
 }catch(err){say("#seoOrderFeedback",err.message);}finally{btn.disabled=!seoOrder.length;}
};

async function loadSeoArticles(){
 if(!ownerSignedIn)return;
 try{
  const [r,m,copy]=await Promise.all([api("admin/website/articles"),api("admin/website/media"),api("admin/site-content")]);
  seoItems=r.items||[];seoMedia=m.items||[];
  const row=(copy.items||[]).find(x=>x.key==="layout.order.articles"&&x.locale==="id");seoOrderVersion=row?.version||0;
  seoOrder=orderedKeys(seoItems.filter(x=>x.published).sort((a,b)=>String(b.published_at||"").localeCompare(String(a.published_at||""))).map(x=>"article:"+x.id),readOrder({"layout.order.articles":row?.value},"articles"));drawSeoOrder();
  const latest=r.latest_research;
  $("#seoResearchStatus").textContent="Riset otomatis: maksimal 1 draft/minggu. Jika gagal, gunakan tombol riset untuk mencoba ulang (total 3 percobaan/minggu; satu pemulihan khusus setelah perbaikan format). Tidak pernah auto-publish. "+(latest?latest.week+" · "+latest.status+" · "+(latest.detail||""):"Belum ada riwayat riset.");
  drawSeoList();
 }catch(e){say("#seoFeedback",e.message);}
}
function drawSeoList(){
 const filter=$("#seoFilter").value;
 const matches=(a,key)=>key==="all"||key==="published"&&!!a.published||key==="review"&&a.review_state==="DRAFT"||key==="approved"&&a.review_state==="APPROVED"||key==="rejected"&&a.review_state==="REJECTED";
 const visible=seoItems.filter(a=>matches(a,filter));
 if(filter==="published")visible.sort((a,b)=>seoOrder.indexOf("article:"+a.id)-seoOrder.indexOf("article:"+b.id));
 $("#seoPublishedOrder").hidden=filter!=="published";
 $("#seoArticleTabs").querySelectorAll("[data-seo-filter]").forEach(b=>{const key=b.dataset.seoFilter;b.classList.toggle("current",key===filter);b.setAttribute("aria-pressed",String(key===filter));b.querySelector("span").textContent=String(seoItems.filter(a=>matches(a,key)).length);});
 const btn=(action,label,a,primary=false)=>'<button type="button" class="'+(primary?"primary":"outline")+' small" data-seo-action="'+action+'" data-id="'+esc(a.id)+'">'+label+'</button>';
 $("#seoList").innerHTML=visible.map(a=>{const content=filter==="published"?a.published:a.draft;return '<article class="panel seoManageCard">'+(content.media_id?'<img class="seoManageCover" loading="lazy" alt="" src="/photos/website/'+esc(content.media_id)+'?npew=480">':"")+'<small>'+esc(a.review_state==="APPROVED"?"Disetujui":a.review_state==="REJECTED"?"Ditolak":a.review_state==="PUBLISHED"?"Published":"Draft")+(a.published?" · versi terbit tersedia":"")+(a.research?" · Riset otomatis":"")+'</small><h4>'+esc(content.title_id)+'</h4><p>'+esc(content.summary_id)+'</p><div class="actions"><button type="button" class="outline small" data-seo-edit="'+esc(a.id)+'">'+(a.published?"Edit artikel terbit":"Edit draft")+'</button>'+
 (a.review_state==="DRAFT"?btn("approve","Setujui",a,true)+btn("reject","Tolak",a):a.review_state==="APPROVED"?btn("publish","Publish",a,true)+btn("reject","Tolak draft",a):"")+
 (a.published?'<a target="_blank" rel="noopener noreferrer" href="/id/articles/'+esc(a.slug)+'">Lihat ID</a><a target="_blank" rel="noopener noreferrer" href="/en/articles/'+esc(a.slug)+'">Lihat EN</a>'+btn("unpublish","Tarik publikasi",a)+btn("delete","Hapus artikel",a):btn("delete","Hapus artikel",a))+'</div></article>';}).join("")||'<p>Belum ada artikel pada daftar ini.</p>';
 $("#seoList").querySelectorAll("[data-seo-edit]").forEach(b=>b.onclick=()=>editSeoArticle(seoItems.find(a=>a.id===b.dataset.seoEdit)));
 $("#seoList").querySelectorAll("[data-seo-action]").forEach(b=>b.onclick=async()=>{
  const a=seoItems.find(x=>x.id===b.dataset.id),action=b.dataset.seoAction;
  const messages={approve:"Setujui draft ID dan EN yang tersimpan? Pastikan fakta dan cover benar.",reject:"Tolak draft ini? Versi publik lama (jika ada) tetap tayang.",publish:"Publish versi draft yang disetujui?",unpublish:"Tarik artikel dari website dan sitemap?",delete:"Hapus draft secara permanen?"};
  if(seoCoverBusy||!a)return;
  if(!confirm(action==="delete"&&a.published?"Hapus permanen artikel terbit ID/EN, termasuk draft? URL lama tidak lagi tersedia dan artikel keluar dari sitemap. Jika hanya ingin menyembunyikan, pilih Tarik publikasi.":messages[action]))return;
  b.disabled=true;
  try{await api("admin/website/articles/"+a.id+"/"+action,"POST",{expected_version:a.version,owner_confirmed:true,confirm_published_delete:action==="delete"&&!!a.published});seoForm.hidden=true;recordDashboardNav({article:undefined});if(action==="approve")$("#seoFilter").value="approved";if(action==="publish")$("#seoFilter").value="published";await loadSeoArticles();say("#seoFeedback",action==="approve"?"Draft disetujui. Publish tetap manual.":"Artikel berhasil diproses.",true);}
  catch(e){say("#seoFeedback",e.message);}finally{b.disabled=false;}
 });
}
$("#seoFilter").onchange=drawSeoList;
$("#seoArticleTabs").querySelectorAll("[data-seo-filter]").forEach(b=>b.onclick=()=>{if(seoCoverBusy)return;$("#seoFilter").value=b.dataset.seoFilter;drawSeoList();});
$("#seoResearch").onclick=async()=>{
 const b=$("#seoResearch");b.disabled=true;
 try{const result=await api("admin/website/articles/research","POST",{});await loadSeoArticles();$("#seoFilter").value="review";drawSeoList();say("#seoFeedback",result.detail||result.status,["DRAFT_CREATED","RUNNING"].includes(result.status));}
 catch(e){say("#seoFeedback",e.message);}finally{b.disabled=false;}
};
$("#seoNew").onclick=()=>editSeoArticle();
$("#seoCoverFile").onchange=()=>{
 const file=$("#seoCoverFile").files?.[0];
 if(file)say("#seoCoverFeedback",file.name+" · "+Math.ceil(file.size/1024)+" KB. Konfirmasi hak dan tekan Upload.",true);
};
$("#seoCoverRemove").onclick=()=>{
 if(seoCoverBusy)return;
 $("#seoMedia").value="";$("#seoCoverFile").value="";$("#seoCoverRights").checked=false;
 drawSeoCover();say("#seoCoverFeedback","Cover dilepas dari draft. Simpan untuk menerapkan; versi terbit tidak berubah.",true);
};
$("#seoCoverUpload").onclick=async()=>{
 if(seoCoverBusy)return;
 const file=$("#seoCoverFile").files?.[0];
 if(!file){say("#seoCoverFeedback","Pilih foto dari perangkat terlebih dahulu.");return;}
 if(!$("#seoCoverRights").checked){say("#seoCoverFeedback","Konfirmasi hak penggunaan foto terlebih dahulu.");return;}
 const generation=seoEditorGeneration,button=$("#seoCoverUpload"),save=seoForm.querySelector('[type="submit"]');
 seoCoverBusy=true;button.disabled=true;save.disabled=true;$("#seoCoverFile").disabled=true;$("#seoCoverRemove").disabled=true;
 say("#seoCoverFeedback","Mengoptimalkan dan mengunggah salinan foto ...",true);
 try{
  const titleId=seoForm.elements.namedItem("title_id").value.trim().slice(0,120)||"Foto artikel NPE";
  const titleEn=seoForm.elements.namedItem("title_en").value.trim().slice(0,180)||"NPE article cover";
  const photo=await uploadCmsWebsitePhoto(file,titleId,titleId,titleEn,true,"article");
  if(!seoMedia.some(p=>p.id===photo.id))seoMedia.push(photo);
  if(generation!==seoEditorGeneration)return;
  $("#seoMedia").value=photo.id;$("#seoCoverFile").value="";$("#seoCoverRights").checked=false;
  say("#seoCoverFeedback","Foto siap: "+Math.ceil(file.size/1024)+" KB → "+Math.ceil(photo.compressed_bytes/1024)+" KB. Simpan draft untuk menerapkan.",true);
 }catch(e){say("#seoCoverFeedback",e.message);}
 finally{seoCoverBusy=false;button.disabled=false;save.disabled=false;$("#seoCoverFile").disabled=false;drawSeoCover();}
};
$("#seoCancel").onclick=()=>{if(seoCoverBusy)return;seoEditorGeneration++;seoForm.hidden=true;recordDashboardNav({article:undefined});};
$("#seoPreview").onclick=()=>{
 const d=seoFormPayload();
 $("#seoPreviewArea").innerHTML=["id","en"].map(l=>'<section class="panel"><small>'+l.toUpperCase()+'</small><h2>'+esc(d["title_"+l])+'</h2><p>'+esc(d["summary_"+l])+'</p>'+String(d["body_"+l]||"").split(/\n+/).filter(Boolean).map(s=>s.startsWith("## ")?"<h3>"+esc(s.slice(3))+"</h3>":"<p>"+esc(s)+"</p>").join("")+'<p>SEO title: '+esc(String(d["title_"+l]||"").slice(0,60))+'</p><p>Meta description: '+esc(String(d["summary_"+l]||"").slice(0,160))+'</p></section>').join("");
};
seoForm.onsubmit=async e=>{
 e.preventDefault();if(seoCoverBusy)return;if($("#seoCoverFile").files?.length){say("#seoCoverFeedback","Upload foto terpilih terlebih dahulu atau kosongkan pilihan file.");return;}const button=seoForm.querySelector('[type="submit"]');button.disabled=true;
 try{const item=await api("admin/website/articles"+(seoEditing?"/"+seoEditing.id:""),seoEditing?"PATCH":"POST",seoFormPayload());$("#seoFilter").value="review";await loadSeoArticles();editSeoArticle(item);say("#seoFeedback","Draft tersimpan. Perubahan membatalkan persetujuan lama. Setujui dahulu, lalu Publish manual.",true);}
 catch(err){say("#seoFeedback",err.message);}finally{button.disabled=false;}
};

let ownerReviewItems=[],ownerReviewOffset=0,ownerReviewsLoading=false;
async function loadOwnerReviews(reset=true){
 if(ownerReviewsLoading)return;ownerReviewsLoading=true;
 try{
  const r=await api("admin/website/reviews?offset="+(reset?0:ownerReviewOffset));
  ownerReviewItems=reset?r.items:ownerReviewItems.concat(r.items);ownerReviewOffset=r.next_offset;
  $("#ownerReviewMore").hidden=ownerReviewOffset===null;
  const root=$("#ownerReviewList");root.replaceChildren();
  for(const row of ownerReviewItems){
   const card=document.createElement("article");card.className="panel";
   const title=document.createElement("h4");title.textContent=row.name+" · "+row.rating+"/5";
   const status=document.createElement("p");status.textContent=(row.visible?"Tampil publik":"Disembunyikan")+" · "+row.service+" · "+row.created_at;
   const text=document.createElement("p");text.textContent=row.body;text.style.whiteSpace="pre-wrap";text.style.overflowWrap="anywhere";
   const button=document.createElement("button");button.type="button";button.className="outline small";button.textContent=row.visible?"Sembunyikan":"Tampilkan";
   button.onclick=async()=>{
    if(!confirm(row.visible?"Sembunyikan ulasan ini dari publik?":"Tampilkan kembali ulasan ini?"))return;
    button.disabled=true;
    try{await api("admin/website/reviews/"+row.id,"PATCH",{visible:!row.visible,expected_version:row.version,owner_confirmed:true});await loadOwnerReviews();say("#ownerReviewFeedback","Status ulasan diperbarui.",true);}
    catch(e){say("#ownerReviewFeedback",e.message);}finally{button.disabled=false;}
   };
   card.append(title,status,text,button);root.append(card);
  }
  if(!ownerReviewItems.length)root.textContent="Belum ada ulasan pelanggan.";
 }catch(e){say("#ownerReviewFeedback",e.message);}
 finally{ownerReviewsLoading=false;}
}
$("#reviewReload").onclick=()=>void loadOwnerReviews();
$("#ownerReviewMore").onclick=()=>void loadOwnerReviews(false);

/* Owner-only SEO keyword workspace; no guessed volume, no editable automatic observations. */
let kwData={plans:[],paths:[],observations:[]},kwEditing=null,kwBusy=false;
const kwForm=$("#kwForm");
function kwEdit(item=null){
 kwEditing=item;kwForm.reset();kwForm.hidden=false;
 $("#kwTarget").innerHTML='<option value="">Belum dipetakan</option>'+kwData.paths.map(p=>'<option value="'+esc(p)+'">'+esc(p)+'</option>').join("");
 if(item){for(const [k,v] of Object.entries({...item,...item.manual})){const el=kwForm.elements.namedItem(k);if(el&&k!=="active")el.value=v??"";}kwForm.elements.namedItem("active").checked=!!item.active;}
 $("#kwHeading").textContent=item?"Edit · "+item.keyword:"Tambah keyword manual";$("#kwHeading").focus({preventScroll:true});kwForm.scrollIntoView({block:"start"});say("#kwEditFeedback","",true);
}
function renderKeywords(){
 const q=$("#kwSearch").value.trim().toLowerCase(),lang=$("#kwLanguage").value,active=$("#kwActive").value;
 const {plans,observations,latest,snapshot,gsc_configured,ranking,previous}=kwData;
 const rankingById=new Map((ranking?.pairs||[]).map((p,i)=>[p.id,{...p,order:i}]));
 const observed=plans.filter(p=>observations.some(o=>o.normalized===p.normalized)).length;
 $("#kwMetrics").innerHTML=[["Keyword aktif",plans.filter(p=>p.active).length],["Terpetakan",plans.filter(p=>p.active&&p.target_path&&kwData.paths.includes(p.target_path)).length],["Keyword dengan data GSC",observed],["Metrik volume manual",plans.filter(p=>p.manual?.volume!=null||p.manual?.volume_min!=null).length],["Top 3 · pasangan target",ranking?.measured?ranking.top3:"N/A"],["Top 10 · pasangan target",ranking?.measured?ranking.top10:"N/A"],["Peluang posisi >10–30",ranking?.measured?ranking.quickWins:"N/A"]].map(([k,v])=>'<div class="panel"><small>'+esc(k)+'</small><h3>'+v+'</h3></div>').join("");
 $("#kwStatus").textContent=(gsc_configured?"GSC terkonfigurasi":"GSC belum terhubung — set secret service account di Cloudflare")+
  " · Riset terakhir: "+(latest?latest.created_at+" UTC · "+latest.gsc_status:"belum dijalankan")+
  " · Snapshot GSC: "+(snapshot?snapshot.period_start+" – "+snapshot.period_end+" (global, semua perangkat; maks. 300 pasangan query–URL)":"N/A")+
  " · Pembanding 28 hari non-overlap: "+(previous?previous.period_start+" – "+previous.period_end:"N/A")+" · Posisi = rata-rata GSC, bukan SERP live. Hanya pasangan target non-brand terukur."+
  (latest?.signals?.gsc_error?" · Diagnosis GSC: "+gscKeywordError(latest.signals.gsc_error):"")+
  (Number.isInteger(latest?.signals?.gsc_raw_rows)?" · Baris Google sebelum filter: "+latest.signals.gsc_raw_rows:"")+
  " · Sinyal publik: "+(latest?.signals?.status==="MEASURED"?"sampel "+latest.signals.sample+" posting, 14 hari":"N/A");
 const visible=plans.filter(p=>(!q||p.keyword.toLowerCase().includes(q)||p.target_path.includes(q))&&(!lang||p.locale===lang)&&(active===""||String(p.active)===active)).sort((a,b)=>(rankingById.get(a.id)?.order??999)-(rankingById.get(b.id)?.order??999));
 $("#kwList").innerHTML=visible.map(p=>{
  const rows=observations.filter(o=>o.normalized===p.normalized),m=p.manual||{},signal=latest?.signals?.counts?.[p.cluster],mapped=p.target_path&&kwData.paths.includes(p.target_path),conflict=rows.length>1||rows.some(o=>mapped&&o.path!==p.target_path);
  const rank=rankingById.get(p.id),actions={QUICK_WIN:"Prioritas: bandingkan intent dan isi dengan hasil Google teratas; perkuat halaman target dan tautan internal.",PROTECT_TOP10:"Pertahankan: cek CTR, judul dan konversi tanpa mengubah URL.",BUILD_RELEVANCE:"Perkuat relevansi dan otoritas; evaluasi gap sebelum revisi."};
  const rankHtml=rank?'<p><strong>'+esc(actions[rank.action])+'</strong><br><small>'+esc(rank.delta?"Perubahan vs periode pembanding: posisi "+(rank.delta.position>=0?"+":"")+rank.delta.position.toFixed(1)+" (positif = membaik) · klik "+rank.delta.clicks+" · impresi "+rank.delta.impressions+" · CTR "+rank.delta.ctr.toFixed(1)+" poin persen":"Belum ada pasangan pembanding terukur")+'</small></p>':"";
  return '<article class="panel kwCard"><small>'+esc(p.locale.toUpperCase()+" · "+p.cluster+" · "+p.intent+" · P"+p.priority+" · "+p.origin)+'</small><h4>'+esc(p.keyword)+'</h4><p><strong>Sasaran:</strong> '+esc(mapped?p.target_path:p.target_path?"URL lama tidak lagi terbit":"Belum dipetakan")+'</p>'+
   '<p>Volume/bulan: <strong>'+esc(m.volume??(m.volume_min!=null&&m.volume_max!=null?m.volume_min+"–"+m.volume_max:"N/A"))+'</strong> · Difficulty: <strong>'+esc(m.difficulty??"N/A")+'</strong><br>Sinyal klaster: '+esc(signal??"N/A")+(m.source?'<br><small>'+esc([m.source,m.period,m.country,m.device,m.checked].filter(Boolean).join(" · "))+'</small>':"")+'</p>'+
   ((m.impressions!==null&&m.impressions!==undefined||m.position!==null&&m.position!==undefined)?'<p><strong>GSC manual:</strong> '+esc(m.impressions??"N/A")+' impressions · '+esc(m.clicks??"N/A")+' klik · posisi '+esc(m.position??"N/A")+'</p>':"")+
   (rows.length?'<div class="kwObserved"><strong>GSC — URL aktual</strong>'+rows.map(o=>'<p>'+esc(o.path)+'<br><small>'+o.impressions+' impressions · '+o.clicks+' klik · '+(o.clicks/o.impressions*100).toFixed(1)+'% CTR · posisi '+o.position.toFixed(1)+'</small></p>').join("")+'</div>':'<p class="feedback">GSC: N/A (tidak ada baris terukur)</p>')+
   rankHtml+(conflict?'<p class="feedback">Periksa potensi konflik URL/intent; tidak otomatis dianggap kanibalisasi.</p>':"")+
   (m.competitors?'<p><strong>Kompetitor/gap:</strong> '+esc(m.competitors)+'</p>':"")+
   '<button type="button" class="outline small" data-kw-edit="'+esc(p.id)+'">Edit / petakan</button></article>';
 }).join("")||"<p>Belum ada keyword pada filter ini.</p>";
 $("#kwAllObserved").innerHTML=observations.filter(o=>!q||o.query.toLowerCase().includes(q)||o.path.includes(q)).map(o=>'<article class="panel kwCard"><strong>'+esc(o.query)+'</strong><p>'+esc(o.path)+'</p><small>'+o.impressions+' impressions · '+o.clicks+' klik · '+(o.clicks/o.impressions*100).toFixed(1)+'% CTR · posisi '+o.position.toFixed(1)+'</small></article>').join("")||"<p>Belum ada pasangan terukur.</p>";
 $("#kwList").querySelectorAll("[data-kw-edit]").forEach(b=>b.onclick=()=>kwEdit(plans.find(p=>p.id===b.dataset.kwEdit)));
}


let kwPlannerBusy=false,kwPlannerGeneration=0;
function plannerInput(){return {market:$("#kwPlannerMarket").value||"GLOBAL",locale:$("#kwPlannerLocale").value||"all"};}
function renderPlannerBaseline(){
 const plans=kwData.plans.filter(p=>p.manual?.source?.startsWith("Google Keyword Planner – Keyword Stats ")&&p.manual.volume_min!=null&&p.manual.volume_max!=null);
 const fmt=n=>Number(n).toLocaleString("id-ID");
 $("#kwPlannerBaseline").innerHTML=plans.map(p=>'<article class="panel kwCard"><strong>'+esc(p.keyword)+'</strong><p>'+fmt(p.manual.volume_min)+'–'+fmt(p.manual.volume_max)+' / bulan</p><small>'+esc([p.manual.source,p.manual.period,p.manual.country,p.manual.checked].filter(Boolean).join(" · "))+'</small><p class="feedback">'+esc(p.manual.notes||"")+'</p></article>').join("")||"<p>Belum ada baseline CSV.</p>";
}
function renderPlannerReport(r){
 renderPlannerBaseline();
 const comparison=r?.baseline_comparison||[],labels={NO_API_ROW:"Belum ada baris API",AMBIGUOUS_GROUP:"Kelompok ambigu",PERIOD_UNVERIFIED:"Periode berbeda / belum terverifikasi",VARIANT_GROUP:"Varian digabung; jangan bandingkan langsung",METRICS_UNAVAILABLE:"Metrik API tidak tersedia",WITHIN_RANGE:"Dalam rentang baseline (bukan bukti akurasi pasti)",OUTSIDE_RANGE:"Di luar rentang; periksa perubahan estimasi"};
 $("#kwPlannerComparison").innerHTML=comparison.map(x=>'<p><strong>'+esc(x.keyword)+'</strong> · '+esc(labels[x.status]||x.status)+' · API '+esc(x.estimate??"N/A")+' · baseline '+esc(x.min+"–"+x.max)+' · '+esc(x.period)+'</p>').join("")||"<p>Belum ada hasil API yang sebanding (Global · semua bahasa · Google Search).</p>";
 const status={NOT_CONFIGURED:"Secret Customer ID atau kredensial belum lengkap.",APPROVAL_REQUIRED:"Konfigurasi tersedia. Aktivasi API menunggu konfirmasi permissible use dari Google untuk tujuan riset yang direncanakan. Gunakan jalur manual jika tersedia.",NOT_RUN:"Belum ada laporan.",RUNNING:"Riset berjalan.",DONE:"Laporan selesai.",PARTIAL:"Sebagian permintaan gagal.",ERROR:"Riset gagal."}[r?.status]||"Belum tersedia.";
 say("#kwPlannerStatus",status+(r?.scope?" · "+r.scope.market+" / "+r.scope.locale.toUpperCase()+" · "+r.scope.network:"")+(r?.checked_at?" · "+r.checked_at:"")+(r?.cooldown?" · Laporan terakhir masih berlaku.":"")+(r?.error?" · "+r.error:""),r?.status==="DONE");
 $("#kwPlannerRun").disabled=kwPlannerBusy||r?.status==="APPROVAL_REQUIRED"||r?.status==="NOT_CONFIGURED";
 for(const [key,id] of [["historical","#kwPlannerHistory"],["ideas","#kwPlannerIdeas"]]){
  const s=r?.sections?.[key],rows=s?.rows||[],fmt=v=>v==null?"N/A":Number(v).toLocaleString("id-ID");
  $(id).innerHTML='<p class="feedback">'+esc(s?s.status+(s.error?" · "+s.error:"")+(s.raw_rows!=null?" · "+s.raw_rows+" baris mentah, "+s.measured+" terukur":"")+(s.truncated?" · hasil dibatasi":""):"Belum tersedia")+'</p>'+rows.map(o=>{
   const known=kwData.plans.some(p=>(r.scope.locale==="all"||p.locale===r.scope.locale)&&p.normalized===o.keyword.normalize("NFKC").trim().toLowerCase().replace(/\s+/g," "));
   return '<article class="panel kwCard"><strong>'+esc(o.keyword)+'</strong><p>Estimasi pencarian/bulan: <strong>'+esc(fmt(o.avg_monthly_searches))+'</strong> · Competition Ads: '+esc(o.ads_competition??"N/A")+' ('+esc(fmt(o.ads_competition_index))+')</p>'+
    (o.close_variants?.length?'<small>Variasi dekat (angka bersama): '+esc(o.close_variants.join(", "))+'</small>':"")+
    (o.monthly?.length?'<details><summary>Riwayat bulanan</summary>'+o.monthly.map(m=>'<p>'+esc(m.month)+' · '+esc(fmt(m.searches))+'</p>').join("")+'</details>':"")+
    (key==="ideas"&&!known?'<p class="feedback">Kandidat baru · tinjau relevansi sebelum menambah pada rencana keyword.</p>':"")+'</article>';
  }).join("");
 }
}
async function loadPlannerReport(refresh=false){
 if(!ownerSignedIn)return;
 const input=plannerInput(),generation=++kwPlannerGeneration;
 say("#kwPlannerStatus",refresh?"Mengambil estimasi Google…":"Memuat laporan tersimpan…",true);
 try{const r=refresh?await api("admin/seo/keywords/planner","POST",input):await api("admin/seo/keywords/planner?"+new URLSearchParams(input));
  if(generation===kwPlannerGeneration&&ownerSignedIn)renderPlannerReport(r);
 }catch(e){if(generation===kwPlannerGeneration&&ownerSignedIn){renderPlannerReport({status:"ERROR"});say("#kwPlannerStatus",e.message);}}
}
for(const id of ["#kwPlannerMarket","#kwPlannerLocale"])$(id).onchange=()=>void loadPlannerReport();
$("#kwPlannerRun").onclick=async()=>{if(kwPlannerBusy||!ownerSignedIn)return;kwPlannerBusy=true;$("#kwPlannerRun").disabled=true;$("#kwPlannerMarket").disabled=true;$("#kwPlannerLocale").disabled=true;try{await loadPlannerReport(true);}finally{kwPlannerBusy=false;$("#kwPlannerMarket").disabled=false;$("#kwPlannerLocale").disabled=false;await loadPlannerReport();}};

let kwPerfGeneration=0,kwPerfBusy=false;
function performanceInput(){
 const preset=$("#kwPerfPeriod").value||"24h",mode=preset==="24h"?"fresh":$("#kwPerfMode").value||"fresh";
 return {preset,mode,...(preset==="custom"?{start:$("#kwPerfStart").value,end:$("#kwPerfEnd").value}:{})};
}
function performanceControls(){
 const custom=performanceInput().preset==="custom";
 $("#kwPerfStartLabel").hidden=!custom;$("#kwPerfEndLabel").hidden=!custom;
 $("#kwPerfMode").disabled=kwPerfBusy||performanceInput().preset==="24h";
 for(const id of ["#kwPerfPeriod","#kwPerfStart","#kwPerfEnd","#kwPerfRun"])$(id).disabled=kwPerfBusy;
}
function renderPublicSources(){
 const sources=kwData.public_sources||[];
 $("#kwPublicSources").innerHTML=sources.map(s=>'<p><strong>'+esc(s.source)+'</strong> · '+esc(s.status)+' · '+esc(s.checked_at||"Belum diperiksa")+(s.diagnostic?'<br><small>Diagnosis '+esc(s.diagnostic.checked_at||"")+': '+esc(Object.entries(s.diagnostic.failures||{}).map(([k,v])=>k+" ×"+v).join(", ")||"Tidak ada kegagalan tercatat")+'</small>':"")+'</p>').join("")||"<p>Belum ada status sumber.</p>";
}
function renderKeywordPerformance(r){
 const range=r?.range,sec=r?.sections||{},total=sec.total?.rows?.[0],fmt=v=>v==null?"N/A":Number(v).toLocaleString("id-ID",{maximumFractionDigits:2});
 const time=range?.start_hour?new Date(range.start_hour).toLocaleString("id-ID",{timeZone:"Asia/Makassar"})+" – "+new Date(range.end_hour).toLocaleString("id-ID",{timeZone:"Asia/Makassar"})+" WITA":range?range.start+" – "+range.end+" (Pacific)": "";
 const description={NOT_RUN:"Belum ada laporan untuk periode ini.",RUNNING:"Pengambilan masih berjalan.",NOT_CONFIGURED:"GSC belum terkonfigurasi.",ERROR:"Laporan gagal.",PARTIAL:"Sebagian laporan gagal.",DONE:"Laporan tersimpan."}[r?.status]||"Laporan belum tersedia.";
 say("#kwPerfStatus",description+(time?" · "+time:"")+(range?" · "+(range.mode==="fresh"?"SEMENTARA (bisa berubah)":"FINAL"):"")+(r?.checked_at?" · Diambil "+r.checked_at:"")+(r?.cooldown?" · Batas satu pengambilan per slot per jam.":"")+(r?.error?" · "+gscKeywordError(r.error):"")+(sec.total?.status==="NO_ROWS"?" · Google tidak mengembalikan agregat; N/A, bukan nol.":"")+(sec.total?.status==="ERROR"?" · Agregat: "+gscKeywordError(sec.total.error):""),r?.status==="DONE");
 $("#kwPerfMetrics").innerHTML=[["Impressions",total?.impressions],["Clicks",total?.clicks],["CTR",total?total.ctr*100:null],["Posisi rata-rata",total?.position]].map(([k,v])=>'<div class="panel"><small>'+esc(k)+'</small><h3>'+esc(fmt(v)+(k==="CTR"&&v!=null?"%":""))+'</h3></div>').join("");
 for(const [kind,id] of [["queries","#kwPerfQueries"],["pages","#kwPerfPages"],["pairs","#kwPerfPairs"]]){
  const s=sec[kind],rows=s?.rows||[];
  const notes=s?" · mentah "+s.raw_rows+" · ditolak "+s.rejected+(s.truncated?" · batas 300 tercapai":"")+(s.first_incomplete?" · awal data belum lengkap "+s.first_incomplete:""):"";
  $(id).innerHTML='<p class="feedback">'+esc(s?.status==="ERROR"?gscKeywordError(s.error):s?s.status+notes:"Belum tersedia")+'</p>'+rows.map(o=>{
   const newQuery=o.query&&!kwData.plans.some(p=>p.normalized===o.query.normalize("NFKC").trim().toLowerCase().replace(/\s+/g," "));
   const mismatch=o.language_hint&&o.page_language&&o.language_hint!==o.page_language;
   return '<article class="panel kwCard"><strong>'+esc(o.query||o.path)+'</strong>'+(o.query&&o.path?'<p>'+esc(o.path)+'</p>':"")+
    '<small>'+esc(o.impressions+" impressions · "+o.clicks+" klik · "+fmt(o.ctr*100)+"% CTR · posisi "+fmt(o.position))+'</small>'+
    (newQuery?'<p>Keyword baru terdeteksi'+(range?.mode==="fresh"?" · kandidat sementara, belum menjadi baseline final":"")+'</p>':"")+
    (mismatch?'<p class="feedback">Periksa bahasa: dugaan query '+esc(o.language_hint.toUpperCase())+' / halaman '+esc(o.page_language.toUpperCase())+'. Bukan bukti kesalahan hreflang.</p>':"")+'</article>';
  }).join("");
 }
}
async function loadKeywordPerformance(refresh=false){
 if(!ownerSignedIn)return;
 const input=performanceInput(),generation=++kwPerfGeneration;
 performanceControls();
 if(input.preset==="custom"&&(!input.start||!input.end)){renderKeywordPerformance({status:"NOT_RUN"});say("#kwPerfStatus","Pilih tanggal awal dan akhir (maksimal 93 hari).");return;}
 say("#kwPerfStatus",refresh?"Mengambil data Google…":"Memuat laporan tersimpan…",true);
 try{const result=refresh?await api("admin/seo/keywords/performance","POST",input):await api("admin/seo/keywords/performance?"+new URLSearchParams(input));
  if(generation===kwPerfGeneration&&ownerSignedIn)renderKeywordPerformance(result);
 }catch(e){if(generation===kwPerfGeneration&&ownerSignedIn){renderKeywordPerformance({status:"ERROR"});say("#kwPerfStatus",e.message);}}
}
for(const id of ["#kwPerfPeriod","#kwPerfMode","#kwPerfStart","#kwPerfEnd"])$(id).onchange=()=>void loadKeywordPerformance();
$("#kwPerfRun").onclick=async()=>{if(kwPerfBusy||!ownerSignedIn)return;kwPerfBusy=true;performanceControls();try{await loadKeywordPerformance(true);}finally{kwPerfBusy=false;performanceControls();}};

function gscKeywordError(code){
 const labels={CONFIG:"Format JSON atau private key tidak valid",AUTH:"Google menolak autentikasi service account",ACCESS:"Periksa akses property dan Search Console API",REQUEST:"Search Analytics gagal atau dibatasi",NETWORK:"Koneksi Google tidak tersedia",STORAGE:"Gagal memproses atau menyimpan snapshot"};
 return labels[code]||"Pengambilan data gagal";
}
async function loadKeywords(){
 if(!ownerSignedIn)return false;
 say("#kwStatus","Memuat data kata kunci…",true);
 try{
  const result=await api("admin/seo/keywords");
  if(!Array.isArray(result.plans)||!Array.isArray(result.paths)||!Array.isArray(result.observations))throw Error("Respons riset tidak lengkap. Muat ulang dashboard.");
  kwData=result;renderKeywords();renderPublicSources();void loadKeywordPerformance();void loadPlannerReport();say("#kwFeedback","",true);return true;
 }catch(e){say("#kwStatus","Gagal memuat riset.",false);say("#kwFeedback",e.message);return false;}
}
$("#kwNew").onclick=()=>kwEdit();
$("#kwClose").onclick=()=>{kwForm.hidden=true;kwEditing=null;};
for(const id of ["#kwSearch","#kwLanguage","#kwActive"])$(id).oninput=renderKeywords;
$("#kwRun").onclick=async()=>{
 if(kwBusy||!ownerSignedIn)return;
 kwBusy=true;$("#kwRun").disabled=true;say("#kwFeedback","Menghubungi Google Search Console…",true);
 try{
  const r=await api("admin/seo/keywords/research","POST",{});
  if(!await loadKeywords())return;
  const state=r.gsc_status||kwData.latest?.gsc_status,error=r.gsc_error||kwData.latest?.signals?.gsc_error;
  const message=state==="MEASURED"?"Google terhubung · "+(r.rows??kwData.latest?.gsc_rows??0)+" pasangan query–URL tersimpan.":state==="NO_ROWS"?"Google terhubung · "+(kwData.latest?.signals?.gsc_raw_rows>0?"baris mentah ada, tetapi tidak lolos filter.":"tidak ada baris query–URL dari Google pada periode final."):state==="ERROR"?"GSC ERROR · "+gscKeywordError(error):state==="NOT_CONFIGURED"?"GSC belum terkonfigurasi.":"Riset belum menghasilkan snapshot selesai.";
  say("#kwFeedback",(r.status==="RECENT"?"Riset terakhir masih berlaku. ":"")+message,state==="MEASURED"||state==="NO_ROWS");
 }catch(e){say("#kwFeedback","Riset gagal: "+e.message);}finally{kwBusy=false;$("#kwRun").disabled=false;}
};
kwForm.onsubmit=async e=>{e.preventDefault();const button=kwForm.querySelector('[type="submit"]');button.disabled=true;const d=Object.fromEntries(new FormData(kwForm));const manual=Object.fromEntries(["volume","volume_min","volume_max","difficulty","impressions","clicks","position","source","period","country","device","checked","competitors","notes"].map(k=>[k,d[k]]));try{await api("admin/seo/keywords"+(kwEditing?"/"+kwEditing.id:""),kwEditing?"PATCH":"POST",{...d,manual,active:kwForm.elements.namedItem("active").checked,expected_version:kwEditing?.version});kwForm.hidden=true;kwEditing=null;if(await loadKeywords())say("#kwFeedback","Keyword disimpan. Tidak mengubah halaman publik.",true);}catch(err){say("#kwEditFeedback",err.message);}finally{button.disabled=false;}};
