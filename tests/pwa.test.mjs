import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const read=file=>readFileSync(new URL("../public/"+file,import.meta.url),"utf8");
test("Turnstile script is permitted by static deployment CSP",()=>{
 const headers=read("_headers");assert.match(headers,/script-src 'self' https:\/\/challenges\.cloudflare\.com/);
 assert.match(headers,/frame-src https:\/\/challenges\.cloudflare\.com/);
});
test("offline shell caches only public resources, not private data",()=>{
 const worker=read("service-worker.js");assert.match(worker,/req\.method!=="GET"/);assert.match(worker,/URLS\.includes\(url\.pathname\)/);
 assert.doesNotMatch(worker,/\/api\/admin\/|\/api\/public\/leads|sessionStorage|ADMIN_TOKEN/);
});
test("PWA install icon exists and manifest links to SVG",()=>{
 const manifest=JSON.parse(read("manifest.webmanifest"));
 assert.equal(manifest.icons[0].src,"/icon.svg");assert.match(read("icon.svg"),/<svg/);
 assert.match(read("app.js"),/serviceWorker\.register/);
});


test("separate public activity pages retain guarded marketing disclosures",()=>{
 const sea=read("snorkeling.html"),island=read("island-tour.html"),home=read("index.html");
 assert.match(sea,/Snorkeling Nusa Penida.*Manta Bay/);
 assert.match(island,/Island Tour/);
 assert.match(sea,/noindex, follow/);
 assert.match(island,/noindex, follow/);
 assert.match(home,/snorkeling\.html/);
 assert.match(home,/island-tour\.html/);
 assert.match(island,/maksim(?:um|al).*(?:7|tujuh)|6–7/i);
 assert.match(sea,/konfirmasi/);
});
test("public marketing resources never promise unattended booking",()=>{
 const robots=read("robots.txt"),site=read("sitemap.xml"),home=read("index.html");
 assert.match(robots,/Disallow: \/api\//);
 assert.match(site,/snorkeling\.html/);
 assert.match(site,/island-tour\.html/);
 assert.match(home,/noindex, follow/);
 assert.doesNotMatch(home,/BANK_ACCOUNT_NUMBER|api_key|secret_key/);
});

test("guest tour guides show experiences instead of private supplier calculations",()=>{
 const island=read("island-tour.html"),west=read("west-tour.html"),east=read("east-tour.html"),sea=read("snorkeling.html");
 assert.match(island,/Wisata Barat/);assert.match(island,/Wisata Timur/);
 assert.match(west,/Kelingking/);assert.match(west,/Broken Beach/);assert.match(west,/Crystal Bay/);
 assert.match(east,/Diamond Beach/);assert.match(east,/Atuh Beach/);
 for(const page of [island,west,east,sea]){
  assert.doesNotMatch(page,/Tarif net awal|margin minimum|keuntungan minimum agen|Harga minimum per booking|Net mobil \/ guest|Hitung Sharing tanpa menebak/i);
 }
 assert.doesNotMatch(island,/Rp600.000|Rp700.000|Rp85.715|pricing-table|PENIVARA/);
});
test("starting selling prices appear only on photo previews, are clear about their units and editable by owner",()=>{
 const home=read("index.html"),css=read("styles.css"),i18n=read("language.js");
 assert.equal((home.match(/data-copy="price.snorkeling"/g)||[]).length,2);
 for(const key of ["price.island","price.west","price.east"])assert.equal((home.match(new RegExp('data-copy="'+key+'"','g'))||[]).length,1);
 assert.match(home,/Rp350.000\/orang/);
 assert.match(home,/Rp800.000\/mobil/);
 assert.match(home,/class="price-preview package-price"/);
 assert.match(home,/class="price-preview" data-copy="price.west"/);
 assert.match(home,/penawaran mulai dan belum mengikat/);
 assert.match(css,/\.spot-cover>\.price-preview/);
 assert.match(i18n,/price\.snorkeling/);
 assert.match(i18n,/Rp350,000\/person/);
 assert.match(i18n,/Rp800,000\/car/);
 assert.doesNotMatch(i18n,/Tarif net awal mobil adalah Rp600.000|Rp600,000 for a full vehicle/);
});

test("all Wikimedia gallery photos credit actual photographers",()=>{
 for(const path of ["snorkeling.html","west-tour.html","east-tour.html"]){const html=read(path);
  const imageCount=html.split('src="/photos/').length-1,credits=(html.match(/Wikimedia Commons/g)||[]).length;
  assert.ok(imageCount>=3, path+" missing image gallery");assert.ok(credits>=imageCount,path+" attribution missing");
 }
});

test("official Nusa Penida Experiences branding is consistent across PWA",()=>{const home=read("index.html"),tour=read("island-tour.html"),icon=read("icon.svg");assert.match(home,/NUSA PENIDA/);assert.match(tour,/NUSA PENIDA/);assert.match(icon,/pari manta|manta/i);assert.match(icon,/cliff|tebing/i);assert.doesNotMatch(home,/PENIVARA/)});

test("gallery CSP allows only Wikimedia Commons and upload thumbnail hosts, plus local site assets",()=>{
 const policy=read("_headers");
 assert.match(policy,/img-src 'self' data: https:\/\/commons\.wikimedia\.org https:\/\/upload\.wikimedia\.org/);
 for(const page of ["index.html","island-tour.html","west-tour.html","east-tour.html","snorkeling.html"]){
  const content=read(page);
  const srcs=[...content.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(x=>x[1]);
  assert.ok(srcs.length>0, "Expected destination photos on "+page);
  for(const src of srcs)assert.ok(src==="/icon.svg"||/^\/photos\/[a-z-]+(?:\?v=4)?$/.test(src),"Unexpected external/unlicensed image "+src);
 }
});

test("photo galleries use same-origin image gateway, recover locally and retain Commons credits",()=>{
 const loader=read("photo-loader.js"),fallback=read("photo-unavailable.svg");
 assert.match(loader,/localPhotoFailed/);assert.match(loader,/photo-unavailable.svg/);assert.match(fallback,/Foto sementara tidak tersedia/);
 for(const page of ["index.html","island-tour.html","west-tour.html","east-tour.html","snorkeling.html"]){const h=read(page);
  assert.match(h,/src="\/photos\//);assert.match(h,/photo-loader.js/);assert.doesNotMatch(h,/src="https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
 }
});

test("brand icon appears in all guest pages and bilingual picker is included",()=>{
 const mainPages=["index.html","snorkeling.html","island-tour.html","west-tour.html","east-tour.html"];
 for(const file of mainPages){
  const html=read(file);
  assert.match(html, /class="brandLogo"[^>]*src="\/icon\.svg"/);
  assert.match(html, /src="\/language\.js"/);
 }
 const i18n=read("language.js"),app=read("app.js");
 assert.match(i18n,/navigator\.languages/);assert.match(i18n,/localStorage/);
 assert.match(i18n,/api\/public\/site-content/);
 assert.match(app,/admin\/site-content/);
 assert.match(read("index.html"),/id="cmsValue"/);
 assert.doesNotMatch(read("service-worker.js"),/\/api\/public\/site-content/);
});

test("premium tourism visuals use real credited destination images and honest actions",()=>{
 const home=read("index.html"),css=read("styles.css"),logo=read("icon.svg");
 assert.match(home,/class="hero premiumHero"/);
 assert.match(css,/\.premiumHero/);
 assert.match(css,/\/photos\/kelingking/);
 assert.match(home,/id="tour-regions"/);
 for(const path of ["/west-tour.html","/east-tour.html","/snorkeling.html"])assert.ok(home.includes(path));
 assert.match(home,/class="tour-showcase-grid"/);
 assert.match(home,/Wikimedia Commons/);
 assert.match(logo,/Siluet tebing Nusa Penida dan pari manta/);
 assert.match(home,/id="quickSave"/);
 assert.match(read("app.js"),/admin\/site-content/);
 assert.match(home,/Penerimaan permintaan|Pengiriman lead akan tersedia/);
});
test("all large cover images render as genuine img elements with safe mobile fallbacks",()=>{
 const home=read("index.html"),css=read("styles.css"),loader=read("photo-loader.js");
 assert.equal((home.match(/class="heroBackdrop"/g)||[]).length,1,"hero cover must use img");
 assert.equal((home.match(/class="package-cover-image"/g)||[]).length,2,"both package covers must use img");
 assert.equal((home.match(/class="spot-cover-image"/g)||[]).length,3,"West, East, and snorkeling covers must use img");
 assert.doesNotMatch(home,/--spot-photo|--tour-photo/,"do not rely on CSS variables for critical photos");
 for(const slug of ["kelingking","broken-beach","diamond-beach","manta-point","manta-bay"]){
  assert.match(home,new RegExp('src="/photos/'+slug+'"'));
 }
 assert.match(css,/\.spot-cover \.spot-cover-image\{[^}]*object-fit:cover/);
 assert.match(css,/\.packageArt \.package-cover-image\{[^}]*object-fit:cover/);
 assert.match(css,/\.premiumHero \.heroBackdrop\{[^}]*object-fit:cover/);
 assert.match(css,/\.spot-cover:after\{/);
 assert.match(css,/background:#063c58!important/);
 assert.match(loader,/photoFallbackStage/);
 assert.match(loader,/photo-unavailable\.svg/);
 assert.match(read("service-worker.js"),/public-v24/);
});

test("dashboard boot and tab interactions execute in a browser-like DOM, including token login",async()=>{
 const {runInNewContext}=await import("node:vm");
 const html=read("index.html"),app=read("app.js");
 const tabs=[...html.matchAll(/<button data-tab="([^"]+)"/g)].map(x=>x[1]);
 const routes=[...html.matchAll(/data-go-tab="([^"]+)"/g)].map(x=>x[1]);
 const contentNames=[...html.matchAll(/id="tab-([a-z-]+)" class="tabcontent"/g)].map(x=>x[1]);
 assert.ok(tabs.length>=8,"expected functional admin tab buttons");
 assert.ok(routes.length>=8,"expected dashboard shortcut tiles");
 const elements=new Map();
 function element(selector,dataset={}){
  const listeners=new Map();
  const classes=new Set();
  return {selector,id:selector.startsWith("#")?selector.slice(1):selector,dataset,listeners,classes,
   style:{},hidden:selector==="#adminArea"||selector==="#adminContent"||selector.startsWith("#tab-")&&selector!=="#tab-summary",
   value:"",textContent:"",innerHTML:"",checked:false,disabled:false,
   classList:{toggle(c,active){if(active)classes.add(c);else classes.delete(c)},contains(c){return classes.has(c)}},
   addEventListener(name,fn){listeners.set(name,fn)},
   querySelector(){return null},
   querySelectorAll(){return []},
   scrollIntoView(){this.scrolled=true},
   click(){const fn=listeners.get("click")||this.onclick;assert.equal(typeof fn,"function",selector+" missing click handler");return fn()},
  };
 }
 function get(selector){
  if(!elements.has(selector))elements.set(selector,element(selector));
  return elements.get(selector);
 }
 const tabButtons=tabs.map((tab,i)=>element("tab:"+i,{tab}));
 const shortcuts=routes.map((goTab,i)=>element("tile:"+i,{goTab}));
 const tabContents=contentNames.map(tab=>{const x=element("#tab-"+tab);elements.set("#tab-"+tab,x);return x});
 const session=new Map();
 const OWNER="test-owner-token-not-used-in-production";
 const fakeFetch=async(url,opts={})=>{
  const address=String(url); const p=address.startsWith("/api/")?address.slice(5):address;
  const auth=(opts.headers?.authorization||"");
  if(p.startsWith("admin/")&&auth!=="Bearer "+OWNER)return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:{"content-type":"application/json"}});
  let body;
  if(p==="public/readiness")body={accepting_leads:false,business_contact:null};
  else if(p==="admin/summary")body={operators:0,leads:0,quotes:0,bookings:0};
  else if(p==="admin/site-content")body={fields:[["hero.title","Title"]],items:[]};
  else if(p==="admin/finance")body={payables:[],changes:[]};
  else if(p==="admin/business")body={business:null};
  else body={items:[]};
  return new Response(JSON.stringify(body),{status:200,headers:{"content-type":"application/json"}});
 };
 const document={
  querySelector:get,
  querySelectorAll(selector){
   if(selector===".tabs button")return tabButtons;
   if(selector==="[data-go-tab]")return shortcuts;
   if(selector===".tabcontent")return tabContents;
   return [];
  },
  addEventListener(){},
 };
 const context={document,window:{NusaLanguage:{defaults:()=>({}),resetCache(){},async apply(){}}},navigator:{},
  sessionStorage:{getItem:key=>session.get(key)||null,setItem:(key,val)=>session.set(key,val),removeItem:key=>session.delete(key)},
  location:{href:"https://tour.example/",origin:"https://tour.example"},fetch:fakeFetch,Response,URL,
  Intl,Date,Number,Array,Object,Map,String,console,confirm:()=>true,prompt:()=>null};
 assert.doesNotThrow(()=>runInNewContext(app,context,{filename:"public/app.js"}),"app bootstrap must not crash before binding owner login");
 assert.equal(typeof get("#adminToggle").onclick,"function");
 get("#adminToggle").click();
 assert.equal(get("#adminArea").hidden,false);
 assert.equal(get("#adminArea").scrolled,true);
 assert.ok(tabButtons.every(btn=>btn.listeners.has("click")),"every sidebar tab must bind a click");
 assert.ok(shortcuts.every(btn=>btn.listeners.has("click")),"every dashboard shortcut must bind a click");
 tabButtons.find(x=>x.dataset.tab==="bookings").click();
 assert.equal(get("#tab-bookings").hidden,false);
 assert.equal(get("#tab-summary").hidden,true);
 shortcuts.find(x=>x.dataset.goTab==="rates").click();
 assert.equal(get("#tab-rates").hidden,false);
 assert.equal(get("#tab-bookings").hidden,true);
 assert.equal(typeof get("#unlock").onclick,"function","owner login handler missing");
 get("#adminToken").value=OWNER;
 await get("#unlock").click();
 assert.equal(get("#adminContent").hidden,false,"verified owner should access dashboard");
 assert.equal(get("#unlockPanel").hidden,true,"login form should close after successful owner auth");
 assert.equal(session.get("tourAdmin"),OWNER,"token must remain session-only");
 assert.ok(get("#stats").innerHTML.includes("Operator"),"live summary cards did not render");
 get("#lock").click();
 assert.equal(get("#adminContent").hidden,true);
 assert.equal(get("#unlockPanel").hidden,false);
 assert.equal(session.has("tourAdmin"),false);
});

test("official WhatsApp Business contact and catalog links are visible, separate and accessible to guests",()=>{
 const home=read("index.html"),lang=read("language.js"),css=read("styles.css"),app=read("app.js");
 const number="628561752525";
 const link="https://wa.me/"+number,catalog="https://wa.me/c/"+number;
 assert.match(home,/id="whatsapp"/);
 assert.match(home,/id="request"/);
 assert.match(home,/class="wa-contact-card"/);
 assert.match(home,/class="wa-floating"/);
 assert.match(home,/data-whatsapp-chat/);
 assert.match(home,/id="tab-whatsapp"/);
 assert.match(home,/data-go-tab="whatsapp"/);
 assert.match(home,/data-tab="whatsapp"/);
 assert.ok(home.includes(link), "Direct chat link missing");
 assert.ok(home.includes(catalog), "Official catalog link missing");
 assert.equal((home.match(/data-whatsapp-chat/g)||[]).length,3);
 for(const file of ["snorkeling.html","island-tour.html","west-tour.html","east-tour.html"]){
  const page=read(file);
  assert.ok(page.includes('data-whatsapp-chat'),file+" direct chat CTA missing");
  assert.ok(page.includes(catalog),file+" catalog CTA missing");
 }
 assert.match(css,/\.wa-floating\{/);
 assert.match(css,/\.wa-tour-links\{/);
 assert.match(lang,/whatsapp\.heading/);
 assert.match(lang,/\[data-whatsapp-chat\]/);
 assert.match(lang,/encodeURIComponent\(message\)/);
 assert.match(lang,/View WhatsApp Catalog/);
 assert.match(app,/\[data-wa-copy\]/);
 assert.match(home,/Koneksi otomatis ke inbox WhatsApp/);
 assert.match(home,/Tidak ada pengiriman otomatis/);
 assert.doesNotMatch(home,/WhatsApp API sudah terhubung|Balasan terkirim secara otomatis/);
});

test("official WhatsApp inbox management is prepared but never falsely shown as connected",()=>{
 const h=read("index.html"),js=read("app.js"),css=read("styles.css"),privacy=read("privacy.html");
 for(const id of ["waRefresh","waConnectionStatus","waThreadList","waMessages","waComposer","waDraftAI","waCopyComposer","waSendApproved"]){
  assert.ok(h.includes('id="'+id+'"'),"WhatsApp UI missing "+id);
 }
 assert.match(h,/id="waSendApproved" disabled/);
 assert.match(h,/Tidak ada pesan yang dibaca atau dikirim sebelum integrasi aktif/);
 assert.match(h,/Tidak ada pengiriman otomatis/);
 assert.match(js,/waSendingEnabled=cfg.sending_enabled===true/);
 assert.match(js,/client_nonce:crypto.randomUUID\(\)/);
 assert.match(js,/owner_confirmed:true/);
 assert.match(css,/\.wa-inbox-grid/);
 assert.match(privacy,/WhatsApp Business/);
});

test("owner WhatsApp dashboard links directly to the Indonesian setup guide",()=>{
 const html=read("index.html");
 assert.match(html,/id="waSetupGuideId"/);
 assert.match(html,/Panduan Hubungkan WhatsApp \(Bahasa Indonesia\)/);
 assert.match(html,/href="https:\/\/github.com\/rama160\/Marketing-turism\/blob\/main\/docs\/WHATSAPP_SETUP.md"/);
 assert.match(html,/id="waSendApproved" disabled/);
});

test("owner marketing organic autopilot is transparent and gated",()=>{
 const html=read("index.html"),app=read("app.js");
 assert.match(html,/id="prepareMarketingWeek"/);
 assert.match(html,/id="marketingWeekFeedback"/);
 assert.match(html,/Hubungkan Instagram & Facebook/);
 assert.match(html,/antrean publikasi draf yang disetujui aktif/);
 assert.match(app,/admin\/marketing\/prepare-week/);
 assert.match(app,/owner_confirmed:true/);
});

test("autonomous marketing learning is owner-only and rejects fabricated analytics UI",()=>{
 const html=read("index.html"),app=read("app.js");
 assert.match(html,/id="marketingMetricsForm"/);
 assert.match(html,/id="marketingInsights"/);
 assert.match(html,/id="marketingObservedOn"/);
 assert.match(html,/statistik akun/);
 assert.match(app,/admin\/marketing\/intelligence/);
 assert.match(app,/admin\/marketing\/observations/);
 assert.match(app,/owner_verified=true/);
});

test("marketing independent Meta Graph queue does not pretend to be connected",()=>{
 const home=read("index.html"),app=read("app.js");
 assert.match(home,/id="refreshMetaQueue"/);
 assert.match(home,/id="marketingPublicationQueue"/);
 assert.match(app,/admin\/marketing\/publications/);
 assert.match(home,/belum aktif|belum diaktifkan/);
});

test("campaign dashboard separates historic drafts and flags invalid Meta credentials clearly",()=>{
 const app=read("app.js"),sw=read("service-worker.js");
 assert.match(app,/Riwayat draf lama/);
 assert.match(app,/Buat draf baru sebelum menyetujui materi lama/);
 assert.match(app,/META_PAGE_ACCESS_TOKEN/);
 assert.match(app,/\b401\b/);
 assert.match(app,/Asia\/Makassar/);
 assert.match(sw,/marketing-turism-public-v24/);
});

test("owner campaign review has licensed photos, full captions and explicit rejection UI",()=>{
 const app=read("app.js"),style=read("styles.css");
 assert.match(app,/campaignPreviewCard/);
 assert.match(app,/campaignVisual/);
 assert.match(app,/campaignCaption/);
 assert.match(app,/preview_photo/);
 assert.match(app,/data-action="rejectCampaign"/);
 assert.match(app,/Tolak &amp; Buat Ulang/);
 assert.match(app,/status:"REJECTED"/);
 assert.match(app,/owner_confirmed:true/);
 assert.match(app,/replacement_id/);
 assert.match(app,/Data diperbarui|Data diperbarui/);
 assert.match(style,/\.campaignVisual img/);
 assert.match(style,/\.campaignReviewActions/);
 assert.match(read("service-worker.js"),/public-v24/);
});

test("owner can deliberately schedule an old approved post without silently posting it",()=>{
 const app=read("app.js");
 assert.match(app,/data-action="scheduleApproved"/);
 assert.match(app,/Jadwalkan otomatis/);
 assert.match(app,/a==="scheduleApproved"/);
 assert.match(app,/\/schedule"/);
 assert.match(app,/Batalkan jadwal/);
});

test("owner can add and choose her own photos on mobile without leaking uploads in offline app cache",()=>{
 const html=read("index.html"),js=read("app.js"),sw=read("service-worker.js");
 assert.match(html,/id="ownerPhotoForm"/);
 assert.match(html,/id="ownerPhotoFile"[^>]*type="file"|id="ownerPhotoFile"[^>]*name="file"/);
 assert.match(html,/\+ Add Foto/);
 assert.match(html,/id="ownerPhotoRights"/);
 assert.match(js,/async function compressOwnerPhoto/);
 assert.match(js,/\/api\/admin\/photos/);
 assert.match(js,/data-action="applyOwnerPhoto"/);
 assert.match(js,/ownerPhotos/);
 assert.match(js,/preview_photo/);
 assert.doesNotMatch(sw,/\/photos\/owner\//);
 assert.doesNotMatch(sw,/\/api\/admin\/photos/);
});
