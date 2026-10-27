// Public smoke test from GitHub Actions; never requires or prints any secret.
const base=(process.env.SMOKE_URL||"https://marketing-turism-agent.finchat-ai-gateway.workers.dev").replace(/\/$/,"");
async function get(path,expectedStatus=200){
 const res=await fetch(base+path,{signal:AbortSignal.timeout(20000)});
 const text=await res.text();
 if(res.status!==expectedStatus)throw Error("SMOKE "+path+": status "+res.status+", expected "+expectedStatus+", body="+text.slice(0,300));
 return text;
}
const health=JSON.parse(await get("/api/health"));
if(health.db!==true||health.status!=="ok")throw Error("D1 binding not healthy: "+JSON.stringify(health));
if(health.version!=="3.17.1")throw Error("Cloudflare release version mismatch: "+health.version);
const ready=JSON.parse(await get("/api/public/readiness"));
if(ready.accepting_leads!==true||ready.turnstile_required!==true||!ready.business_contact)throw Error("Live guest lead form not ready: "+JSON.stringify({accepting_leads:ready.accepting_leads,turnstile_required:ready.turnstile_required,hasContact:!!ready.business_contact}));
 // Verify unauthenticated/spam attempts are rejected before ever writing guest data.
 const deniedGuestWithoutTurnstile=await fetch(base+"/api/public/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({}),signal:AbortSignal.timeout(20000)});
 if(deniedGuestWithoutTurnstile.status!==403)throw Error("Turnstile fails-open or lead endpoint unexpectedly accepts invalid requests: HTTP "+deniedGuestWithoutTurnstile.status);
 const landingMarkup=await get("/");
 if(!landingMarkup.includes('data-action="lead_enquiry"')||!landingMarkup.includes('data-sitekey="0x4AAAAAAFYd9j0rAcoO31Rh"'))throw Error("Guest anti-bot widget missing from live form");
await get("/privacy.html");await get("/terms.html");await get("/cancellation.html");
const snorkeling=await get("/snorkeling.html");if(!snorkeling.includes("Snorkeling Nusa Penida")||!snorkeling.includes("Manta Bay")||!snorkeling.includes("Wikimedia Commons"))throw Error("Snorkeling/gallery missing");
const island=await get("/island-tour.html");
const west=await get("/west-tour.html");const east=await get("/east-tour.html");
if(!west.includes("Kelingking")||!west.includes("Broken Beach")||!west.includes("Wikimedia Commons"))throw Error("West gallery missing");
if(!east.includes("Diamond Beach")||!east.includes("Atuh Beach")||!east.includes("Wikimedia Commons"))throw Error("East gallery missing");if(!island.includes("Island Tour")||island.includes("Rp700.000")||island.includes("Rp600.000")||!island.includes("/west-tour.html")||!island.includes("/east-tour.html"))throw Error("Island tour guide/pricing missing");
await get("/robots.txt");await get("/sitemap.xml");
const policy=JSON.parse(await get("/api/public/cancellation-policy"));
if(policy.tiers?.length!==4)throw Error("Cancellation disclosure missing");
const cat=JSON.parse(await get("/api/public/catalog"));
if(!Array.isArray(cat.items)||cat.items.length<5||cat.modes?.length!==2||!cat.variants?.ISLAND_TOUR_CAR)throw Error("Public catalog missing items");
const landingResp=await fetch(base+"/",{signal:AbortSignal.timeout(20000)});
const photoPolicy=landingResp.headers.get("content-security-policy")||"";
if(!photoPolicy.includes("https://raw.githubusercontent.com"))throw Error("Reliable gallery image backup host blocked by live CSP");
for(const imageHost of ["https://commons.wikimedia.org","https://upload.wikimedia.org"]){
 if(!photoPolicy.includes(imageHost))throw Error("Photo loading blocked by CSP: "+imageHost);
}
const imageChecks=["kelingking","broken-beach","angels-billabong","crystal-bay","diamond-beach","atuh-beach","tree-house","manta-bay","manta-point","gamat-bay"];
for(const id of imageChecks){
 const response=await fetch(base+"/photos/"+id,{signal:AbortSignal.timeout(20000)});
 const type=response.headers.get("content-type")||"";
 const status=response.headers.get("x-photo-status");
 const gatewayOK=response.status===200&&type.startsWith("image/")&&["upstream-ok","kv-cache","asset-local"].includes(status);
 if(gatewayOK){
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(bytes.length<10000||bytes[0]!==255||bytes[1]!==216)throw Error("Gateway returned invalid JPEG "+id);
 }else{
  throw Error("Cloudflare same-origin photo unavailable: "+id+", HTTP "+response.status+", type="+type+", status="+status);
 }
}
const page=await get("/");
if(!page.includes("NUSA PENIDA")||!page.includes("leadForm"))throw Error("Guest page not served");
const dashboard=await get("/dashboard.html");
const app=await get("/app.js");
const guestScript=await get("/guest.js"),dashboardStyles=await get("/dashboard.css");
const manifest=JSON.parse(await get("/manifest.webmanifest"));
if(manifest.start_url!=="/dashboard.html"||!dashboard.includes('src="/app.js"')||
 !dashboard.includes('id="adminArea"')||!dashboard.includes('id="tab-growth"')||
 !dashboard.includes('id="unlockPanel"')||!dashboard.includes('href="/?view=website"')||
 !dashboard.includes('id="dashMenuToggle"')||!dashboardStyles.includes(".dashMobileToolbar"))
 throw Error("Standalone agent dashboard or navigation missing");
if(/id="(?:adminArea|adminToggle|adminContent|adminToken|cmsPublish|tab-growth)"/.test(page)||
 page.includes('Dashboard agen')||page.includes('src="/app.js"')||
 !page.includes('src="/guest.js"')||!guestScript.includes('publicAPI("leads","POST"')||
 guestScript.includes("ADMIN_TOKEN")||guestScript.includes("tourAdmin")||guestScript.includes("admin/"))
 throw Error("Guest page leaked admin UI/script or public enquiry controller missing");
// NPE Studio must keep a single website button while preserving the owner workspace.
if((dashboard.match(/Lihat Website/g)||[]).length!==1||
 !dashboard.includes('id="dashWorkspaces"')||!dashboard.includes('class="dashBottomNav"')||
 !dashboard.includes('id="dashPriorities"')||!dashboard.includes('id="tab-analytics"')||
 !dashboard.includes('data-workspace="growth"')||!dashboard.includes('data-workspace="settings"')||
 !app.includes('function initCompactPanels')||!app.includes('loadDashboardAnalytics')||
 !dashboardStyles.includes(".dashCompactShortcuts")||!dashboardStyles.includes(".dashPaneNav"))
 throw Error("Compact NPE Studio dashboard, mobile navigation, or single website shortcut not live");
if(page.includes('id="dashWorkspaces"')||page.includes('id="dashPriorities"'))
 throw Error("Owner-only compact dashboard leaked to public tourism site");
if(!app.includes("quotePayload"))throw Error("Owner admin controller missing");
if(!app.includes('document.querySelectorAll(".tabs button").forEach')||!app.includes('document.querySelectorAll("[data-go-tab]").forEach')||!app.includes('document.querySelectorAll("[data-workspace]").forEach'))throw Error("Owner dashboard navigation listeners missing on live Worker");
const badBootLine=app.split("\n").some(line=>{
 const trimmed=line.trimStart();
 return trimmed.startsWith('$(".tabs button").forEach')||trimmed.startsWith('$("[data-go-tab]").forEach');
});
if(badBootLine)throw Error("Owner dashboard broken singleton selector remains");
// v3.1.0 live release: actual published brand, locale controls and authenticated CMS.
const home=await get("/");
if(!home.includes('src="/icon.svg"')||!home.includes('src="/language.js"')||!dashboard.includes('id="cmsPublish"')||!dashboard.includes('data-tab="website"')||!home.includes('class="hero premiumHero"')||!home.includes('class="tour-showcase-grid"')||!dashboard.includes('id="quickSave"'))
 throw Error("New logo/language/editor missing on live website");
// Visitor should see marketing prices, never the owner supplier-net breakdown.
for(const key of ["price.snorkeling","price.island","price.west","price.east"]){
 if(!home.includes('data-copy="'+key+'"'))throw Error("Photo selling price missing "+key);
}
if(!home.includes("Rp350.000/orang")||!home.includes("Rp800.000/mobil"))throw Error("Guest price badge amount or unit missing");
if(!home.includes("penawaran mulai dan belum mengikat"))throw Error("Price disclaimer missing");
for(const [page,path] of [[island,"island-tour"],[west,"west-tour"],[east,"east-tour"],[snorkeling,"snorkeling"]]){
 if(/Rp600\\.000|Rp700\\.000|Hitung Sharing tanpa menebak|margin minimum|keuntungan minimum agen|Tarif net awal/i.test(page))throw Error("Supplier net/margin exposed on "+path);
}
const langJS=await get("/language.js");

if(!langJS.includes("navigator.languages")||!langJS.includes("npe-language")||!langJS.includes("site-content?lang="))throw Error("Guest locale selection not live");
const styles=await get("/styles.css");if(!styles.includes(".languagePicker")||!styles.includes(".brandLogo"))throw Error("New CSS missing");
if(!styles.includes(".premiumHero")||!styles.includes(".tour-showcase-grid"))throw Error("Premium public design missing");
// Regression guard for blank Android destination previews: actual img nodes, not CSS-only backgrounds.
for(const [cl,count] of [["heroBackdrop",1],["package-cover-image",2],["spot-cover-image",3]]){
 const match=home.match(new RegExp('class="'+cl+'"',"g"))||[];
 if(match.length!==count)throw Error("Missing live HTML img coverage "+cl+": "+match.length);
}
if(home.includes("--spot-photo")||home.includes("--tour-photo"))throw Error("Fragile CSS background photo variables remain live");
for(const slug of ["kelingking","broken-beach","diamond-beach","manta-point","manta-bay"]){
 if(!home.includes('src="/photos/'+slug+'"'))throw Error("Missing HTML source for "+slug);
}
if(!styles.includes('.spot-cover .spot-cover-image')||!styles.includes('.packageArt .package-cover-image')||!styles.includes('.premiumHero .heroBackdrop')||!styles.includes('background:#063c58!important'))throw Error("Mobile image fit / fallback styles not deployed");
const swLive=await get("/service-worker.js");
if(!swLive.includes("marketing-turism-public-v26"))throw Error("PWA asset cache did not bump");
// Guest contact: primary click-to-chat must not be confused with public catalog.
const number="628561752525";
const contact="https://wa.me/"+number,catalog="https://wa.me/c/"+number;
if(!home.includes('id="whatsapp"')||!home.includes('class="wa-floating"')||!home.includes(contact)||!home.includes(catalog))throw Error("Public WhatsApp contact links missing");
if(!dashboard.includes('id="tab-whatsapp"')||!dashboard.includes('data-tab="whatsapp"'))throw Error("Owner WhatsApp reply workspace missing");
if(!dashboard.includes("Koneksi otomatis ke inbox WhatsApp")||!dashboard.includes("Tidak ada pengiriman otomatis"))throw Error("WhatsApp connection falsely presented as active");
if(!langJS.includes('encodeURIComponent(message)')||!langJS.includes('View WhatsApp Catalog'))throw Error("Guest WhatsApp language handling absent");
for(const page of [snorkeling,island,west,east]){
 if(!page.includes('data-whatsapp-chat')||!page.includes(catalog))throw Error("Travel detail WhatsApp contact missing");
}
if(!styles.includes('.wa-floating')||!styles.includes('.wa-contact-card'))throw Error("Mobile WhatsApp CSS missing");
// WhatsApp integration stays disconnected and guarded until Meta business onboarding.
// Safe webhook diagnostic: fake token cannot verify; 403 = enabled, 503 = not ready.
const webhookProbe=await fetch(base+"/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=invalid-test-probe&hub.challenge=12345",{signal:AbortSignal.timeout(20000)});
if(![403,503].includes(webhookProbe.status))throw Error("Webhook challenge guard unexpected response: "+webhookProbe.status);
if(webhookProbe.status===503){
 const body=await webhookProbe.text();
 console.log("PUBLIC_WA_WEBHOOK_PROBE_STATUS=503 (safe error reason): "+body.slice(0,240));
}else console.log("PUBLIC_WA_WEBHOOK_PROBE_STATUS=403 (GET configured, invalid test token correctly rejected)");
await get("/api/admin/whatsapp",401);
const waSendWithoutOwner=await fetch(base+"/api/admin/whatsapp/send",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({phone:"628561752525",message:"unauthorized",owner_confirmed:true}),signal:AbortSignal.timeout(20000)});
if(waSendWithoutOwner.status!==401)throw Error("Guest could call WhatsApp sending route: "+waSendWithoutOwner.status);
if(!dashboard.includes('id="waThreadList"')||!dashboard.includes('id="waSendApproved" disabled')||!app.includes('waSendingEnabled=cfg.sending_enabled===true'))throw Error("Owner-only WhatsApp inbox management UI missing");
if(!dashboard.includes('id="marketingMetricsForm"')||!app.includes('admin/marketing/intelligence'))throw Error("Owner learning dashboard v3.8.0 missing");
if(!dashboard.includes('id="prepareMarketingWeek"')||!app.includes('admin/marketing/prepare-week'))throw Error("Owner organic marketing autopilot UI missing");
if(!dashboard.includes('id="waSetupGuideId"')||!dashboard.includes('Panduan Hubungkan WhatsApp (Bahasa Indonesia)'))throw Error("Owner Indonesian WhatsApp guide link missing on live site");
const emblem=await get("/icon.svg");if(!emblem.includes("pari manta")||!emblem.includes("cliff"))throw Error("Manta cliff brand not live");
for(const subpage of ["/snorkeling.html","/island-tour.html","/west-tour.html","/east-tour.html","/privacy.html","/terms.html","/cancellation.html"]){
 const h=await get(subpage);
 if(!h.includes('src="/icon.svg"')||!h.includes('src="/language.js"'))throw Error("Bilingual brand header missing on "+subpage);
}
const localeResponse=JSON.parse(await get("/api/public/site-content?lang=en"));
if(localeResponse.locale!=="en"||typeof localeResponse.items!=="object")throw Error("Localized CMS public API invalid");
const idResponse=JSON.parse(await get("/api/public/site-content?lang=id"));
if(idResponse.locale!=="id")throw Error("Indonesian CMS public API invalid");
await get("/api/admin/site-content",401);
const denied=await fetch(base+"/api/admin/site-content",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key:"hero.title",locale:"en",value:"Unauthorized",expected_version:0,owner_confirmed:true}),signal:AbortSignal.timeout(20000)});
if(denied.status!==401)throw Error("CMS unauthorized publishing not blocked: "+denied.status);
// Acquisition v3.12: verify real deployed assets and fail-closed endpoints without creating leads.
if(!dashboard.includes('id="tab-growth"')||!dashboard.includes('id="growthResearch"')||
 !dashboard.includes('data-tab="growth"')||!app.includes('admin/growth')||
 !app.includes("function renderGrowth")||!langJS.includes("/api/public/intent"))
 throw Error("Customer acquisition dashboard or click-to-chat code not deployed");
if(!styles.includes(".growthKpi")||!styles.includes(".growthColumns"))
 throw Error("Customer acquisition mobile styling absent");
for(const pageToIndex of [home,snorkeling,island,west,east]){
 if(!pageToIndex.includes('<meta name="robots" content="index, follow"'))
  throw Error("Tourism landing page remains blocked from indexing");
}
await get("/api/admin/growth",401);
await get("/api/admin/growth/facebook-groups",401);
await get("/api/admin/growth/facebook-groups",401);
await get("/api/admin/growth/facebook-questions",401);
await get("/api/admin/growth/research",401);
const researchUnauthorized=await fetch(base+"/api/admin/growth/research",{
 method:"POST",headers:{"content-type":"application/json"},
 body:JSON.stringify({owner_confirmed:true}),signal:AbortSignal.timeout(20000)});
if(researchUnauthorized.status!==401)throw Error("Unauthorized public prospect research not guarded: "+researchUnauthorized.status);
const crossOriginClick=await fetch(base+"/api/public/intent",{
 method:"POST",headers:{"content-type":"application/json",origin:"https://attacker.invalid"},
 body:JSON.stringify({kind:"WHATSAPP",source:"test",landing:"test"}),signal:AbortSignal.timeout(20000)});
if(crossOriginClick.status!==403)throw Error("Cross-origin click event not blocked: "+crossOriginClick.status);
const unauthSession=JSON.parse(await get("/api/admin/session",401));
if(unauthSession.authenticated!==false)throw Error("Owner session claims authenticated without a cookie");
const deniedLogin=await fetch(base+"/api/admin/session/login",{
 method:"POST",headers:{"content-type":"application/json",origin:base},
 body:JSON.stringify({token:"intentionally-invalid-test-token-0000000000"}),signal:AbortSignal.timeout(20000)});
if(deniedLogin.status!==401||deniedLogin.headers.get("set-cookie"))throw Error("Owner login security check failed");
const deniedOrigin=await fetch(base+"/api/admin/session/login",{
 method:"POST",headers:{"content-type":"application/json",origin:"https://evil.invalid"},
 body:JSON.stringify({token:"intentionally-invalid-test-token-0000000000"}),signal:AbortSignal.timeout(20000)});
if(deniedOrigin.status!==403)throw Error("Cross-origin owner login must reject requests");
await get("/api/admin/summary",401);
await get("/api/admin/finance",401);
await get("/api/admin/business",401);
await get("/api/admin/campaigns",401);
await get("/api/admin/market",401);
await get("/api/admin/analytics",401);
await get("/api/admin/bookings/demo/manifest",401);
const req=await fetch(base+"/api/public/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"DO NOT CREATE",contact:"test",consent:false}),signal:AbortSignal.timeout(20000)});
if(req.status!==403)throw Error("Public guest anti-bot proof must be required before lead creation, got HTTP "+req.status);
console.log("SUCCESS v3.17.1 LIVE: consented guest intake active, Turnstile fail-closed (403), public photos, catalog, privacy, protected CMS and booking APIs.");
