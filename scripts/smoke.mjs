// Public smoke test from GitHub Actions; never requires or prints any secret.
const base=(process.env.SMOKE_URL||"https://nusapenidaexperiences.com").replace(/\/$/,"");
async function get(path,expectedStatus=200){
 const res=await fetch(base+path,{signal:AbortSignal.timeout(20000)});
 const text=await res.text();
 if(res.status!==expectedStatus)throw Error("SMOKE "+path+": status "+res.status+", expected "+expectedStatus+", body="+text.slice(0,300));
 return text;
}
if(base==="https://nusapenidaexperiences.com"){
 const aliases=["https://marketing-turism-agent.finchat-ai-gateway.workers.dev","https://www.nusapenidaexperiences.com","http://nusapenidaexperiences.com"];
 for(const host of aliases){
  for(const path of ["/","/west-tour.html?utm_source=migration","/en/tours/east","/sitemap.xml"]){
   const r=await fetch(host+path,{redirect:"manual",signal:AbortSignal.timeout(20000)});
   if(r.status!==301||r.headers.get("location")!==base+path)throw Error("Canonical migration redirect failed: "+host+path+" "+r.status+" "+r.headers.get("location"));
  }
 }
 const oldHealth=await fetch(aliases[0]+"/api/health",{redirect:"manual",signal:AbortSignal.timeout(20000)});
 if(oldHealth.status!==200)throw Error("Legacy API compatibility lost");
}
const health=JSON.parse(await get("/api/health"));
if(health.db!==true||health.status!=="ok")throw Error("D1 binding not healthy: "+JSON.stringify(health));
if(health.version!=="3.36.0")throw Error("Cloudflare release version mismatch: "+health.version);
const ready=JSON.parse(await get("/api/public/readiness"));
if(ready.accepting_leads!==true||ready.turnstile_required!==true||!ready.business_contact)throw Error("Live guest lead form not ready: "+JSON.stringify({accepting_leads:ready.accepting_leads,turnstile_required:ready.turnstile_required,hasContact:!!ready.business_contact}));
 // Verify unauthenticated/spam attempts are rejected before ever writing guest data.
 const deniedGuestWithoutTurnstile=await fetch(base+"/api/public/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({}),signal:AbortSignal.timeout(20000)});
 if(deniedGuestWithoutTurnstile.status!==403)throw Error("Turnstile fails-open or lead endpoint unexpectedly accepts invalid requests: HTTP "+deniedGuestWithoutTurnstile.status);
 const landingMarkup=await get("/");
 if(!landingMarkup.includes('data-action="lead_enquiry"')||!landingMarkup.includes('data-sitekey="0x4AAAAAAFYd9j0rAcoO31Rh"'))throw Error("Guest anti-bot widget missing from live form");
await get("/privacy.html");await get("/terms.html");await get("/cancellation.html");
if(!landingMarkup.includes('npeAboutProcess')||!landingMarkup.includes('npeFaqGrid'))throw Error("Current site missing owner transparency or bilingual FAQ");
for(const path of ["/en/tours","/en/tours/west","/en/tours/east","/en/tours/snorkeling","/en/tours/island"]){
 const markup=await get(path);
 if(!markup.includes('<html lang="en">')||!markup.includes('hreflang="id"')||
 !markup.includes('application/ld+json')||!markup.includes('npeFaqGrid'))throw Error("English SEO landing failed "+path);

}
for(const path of ["/","/snorkeling.html","/island-tour.html","/west-tour.html","/east-tour.html"]){
 const response=await fetch(base+path,{redirect:"manual",signal:AbortSignal.timeout(20000)});
 if(response.status!==200)throw Error("Canonical guest route not direct HTTP 200: "+path+" "+response.status);
 const html=await response.text();
 if(!html.includes('rel="canonical" href="'+base+path+'"'))throw Error("Wrong canonical "+path);
}
const internal=await fetch(base+"/__npe_templates/index.txt",{redirect:"manual",signal:AbortSignal.timeout(20000)});
if(internal.status!==404)throw Error("Internal generated HTML source must not be public");
const snorkeling=await get("/snorkeling.html");if(!snorkeling.includes("Snorkeling Nusa Penida")||!snorkeling.includes("Manta Bay")||(!snorkeling.includes("Wikimedia Commons")&&!snorkeling.includes('data-npe-owner-photo="true"')))throw Error("Snorkeling/gallery missing");
const island=await get("/island-tour.html");
const west=await get("/west-tour.html");const east=await get("/east-tour.html");
if(![snorkeling,island,west,east].every(page=>page.includes("npeFaqGrid")&&page.includes('data-whatsapp-package=')))throw Error("Tour FAQ or contextual WhatsApp CTA missing");
if(!west.includes("Kelingking")||!west.includes("Broken Beach")||(!west.includes("Wikimedia Commons")&&!west.includes('data-npe-owner-photo="true"')))throw Error("West gallery missing");
if(!east.includes("Diamond Beach")||!east.includes("Atuh Beach")||(!east.includes("Wikimedia Commons")&&!east.includes('data-npe-owner-photo="true"')))throw Error("East gallery missing");if(!island.includes("Island Tour")||island.includes("Rp700.000")||island.includes("Rp600.000")||!island.includes("/west-tour.html")||!island.includes("/east-tour.html"))throw Error("Island tour guide/pricing missing");
const robots=await get("/robots.txt");if(!robots.includes("Sitemap: "+base+"/sitemap.xml"))throw Error("Robots sitemap host mismatch");const websiteSitemap=await get("/sitemap.xml");if(websiteSitemap.includes("workers.dev"))throw Error("Legacy host leaked into sitemap");
for(const path of ["/en/tours","/en/tours/west","/en/tours/east","/en/tours/snorkeling","/en/tours/island"])if(!websiteSitemap.includes(path))throw Error("English tour URL missing from sitemap "+path);
if(!websiteSitemap.includes("/snorkeling.html")||websiteSitemap.includes("/dashboard.html"))throw Error("Dynamic sitemap missing public pages or exposes admin URL");
const websiteCatalog=JSON.parse(await get("/api/public/website/activities"));
const indexedURLs=[...websiteSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
if(new Set(indexedURLs).size!==indexedURLs.length)throw Error("Duplicate URLs in sitemap");
for(const url of indexedURLs){
 if(new URL(url).origin!==base)throw Error("Noncanonical sitemap origin: "+url);
 const response=await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(20000)});
 if(response.status!==200)throw Error("Sitemap URL not direct HTTP 200: "+url+" "+response.status);
 const html=await response.text();
 if(!html.includes('rel="canonical" href="'+url+'"')||!html.includes('hreflang="id"')||!html.includes('hreflang="en"'))throw Error("Missing canonical/hreflang: "+url);
}
if(!Array.isArray(websiteCatalog.items))throw Error("Public CMS activity catalog unavailable");
// SEO crawlers must get metadata and published activity links before JavaScript executes.
if(!landingMarkup.includes('application/ld+json')||!landingMarkup.includes('BreadcrumbList'))throw Error("Homepage SEO schema not server-rendered");
if(!websiteSitemap.includes('xmlns:xhtml')||!websiteSitemap.includes('hreflang="en"'))throw Error("Bilingual sitemap links missing");
if(websiteCatalog.items.length){
 const parent=websiteCatalog.items.find(x=>x.slug&&!x.parent_activity);
 if(parent&&!landingMarkup.includes('/id/experiences/'+parent.slug))throw Error("Homepage missing published crawlable experience links");
 const sample=websiteCatalog.items.find(x=>x.slug&&x.photo_url);
 if(sample){
  const details=await get("/en/experiences/"+sample.slug);
  if(!details.includes('BreadcrumbList')||!details.includes('og:image')||!details.includes('hreflang="id"'))throw Error("Experience search metadata absent");
 }
}
for(const html of [snorkeling,west,east]){
 if(!html.includes('application/ld+json')||!html.includes('og:image'))throw Error("Original tour SEO not server-rendered");
}

const websiteSlots=JSON.parse(await get("/api/public/website/slots"));
if(!Array.isArray(websiteSlots.items))throw Error("Public CMS photo slots unavailable");
await get("/api/admin/website/activities",401);
await get("/api/admin/website/media",401);
await get("/api/admin/website/slots",401);
const missingExperience=await fetch(base+"/en/experiences/this-activity-does-not-exist",{signal:AbortSignal.timeout(20000)});
if(missingExperience.status!==404)throw Error("Unpublished dynamic activity must remain hidden");
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
// Dedicated Published-first owner editor and visible optional price must be in deployed assets.
if(!dashboard.includes('data-cms-view="published"')||!dashboard.includes('id="cmsPublishedList"')||
 !dashboard.includes('id="cmsDraftList"')||!dashboard.includes('id="cmsPageFields"')||
 !dashboard.includes('name="price_amount" type="number"')||!dashboard.includes('id="cmsClearPrice"')||
 !dashboard.includes('id="cmsPublishFromEditor"')||!app.includes('function cmsSaveDraft')||
 !app.includes('function renderCmsPageFields'))throw Error("Published-first edit website workspace / optional price UI missing from live deployment");
// Photo replacement must allow saved photos or the native phone gallery in one dialog.
if(!dashboard.includes('id="cmsQuickPhotoFile"')||!dashboard.includes('id="cmsQuickPhotoDialog"')||
 !dashboard.includes('id="cmsQuickPhotoRights"')||!dashboard.includes('id="cmsQuickPhotoSave"')||
 !app.includes("beginCmsQuickPhoto(b.dataset.cmsEditPhoto)")||
 !app.includes("beginCmsQuickPhoto(b.dataset.cmsQuickPhoto)")||
 !app.includes('picker.click(); // native file picker called directly by user gesture')||
 !app.includes('await api("admin/website/slots","POST",{slot,media_id:cmsQuickPhotoMediaId,owner_confirmed:true})')||
 !dashboardStyles.includes(".npeQuickPhotoDialog"))
 throw Error("Live direct photo gallery and owner-approved replacement missing");
// Owner gallery is discoverable; existing-photo selection and safe deletion are present in deployed assets.
if(!dashboard.includes('id="cmsOpenGallery"')||!dashboard.includes('id="cmsGallerySearch"')||
 !dashboard.includes('id="cmsQuickPhotoGallery"')||!dashboard.includes('id="cmsQuickPickPhone"')||
 !dashboard.includes('id="cmsQuickPickExisting"')||!app.includes('async function deleteNpeMedia(')||
 !app.includes('async function refreshNpeGallery(')||
 !app.includes('beginCmsQuickPhoto(b.dataset.cmsQuickPhoto)')||
 !app.includes('data-quick-existing')||!app.includes('admin/website/media/')){
 throw Error("Gallery reuse/delete or direct photo selection missing from live dashboard");
}
const editorManifest=JSON.parse(await get("/site-editor-defaults.json"));
if(!editorManifest.id?.["hero.title"]||!editorManifest.en?.["hero.title"]||
 !editorManifest.id?.["westSpot.kelingking.description"]||
 !editorManifest.id?.["snorkelingSpot.mantaBay.title"]||
 !editorManifest.photos?.hero||!editorManifest.photos?.["west-kelingking"])
 throw Error("Live published content snapshot incomplete: site editor would display blank copy");
const manifest=JSON.parse(await get("/manifest.webmanifest"));
if(manifest.start_url!=="/dashboard.html"||!dashboard.includes('src="/app.js?v=3.36.0"')||
 !dashboard.includes('id="adminArea"')||!dashboard.includes('id="tab-growth"')||
 !dashboard.includes('id="unlockPanel"')||!dashboard.includes('href="/?view=website"')||
 !dashboard.includes('id="dashMenuToggle"')||!dashboardStyles.includes(".dashMobileToolbar"))
 throw Error("Standalone agent dashboard or navigation missing");
if(/id="(?:adminArea|adminToggle|adminContent|adminToken|cmsPublish|tab-growth)"/.test(page)||
 page.includes('Dashboard agen')||page.includes('src="/app.js?v=3.36.0"')||
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
if(!swLive.includes("marketing-turism-public-v36"))throw Error("PWA asset cache did not bump");
// Guest contact: primary click-to-chat must not be confused with public catalog.
const number="628561752525";
const contact="https://wa.me/"+number,catalog="https://wa.me/c/"+number;
if(!home.includes('id="whatsapp"')||!home.includes('class="wa-floating"')||!home.includes(contact)||!home.includes(catalog))throw Error("Public WhatsApp contact links missing");
if(!dashboard.includes('id="tab-whatsapp"')||!dashboard.includes('data-tab="whatsapp"'))throw Error("Owner WhatsApp reply workspace missing");
if(!dashboard.includes("Koneksi otomatis ke inbox WhatsApp")||!dashboard.includes("Tidak ada pengiriman otomatis"))throw Error("WhatsApp connection falsely presented as active");
if(!langJS.includes('encodeURIComponent(personalized)')||!langJS.includes('View WhatsApp Catalog'))throw Error("Guest WhatsApp language handling absent");
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
if(dashboard.includes('id="prepareMarketingWeek"')||app.includes('admin/marketing/prepare-week')||!dashboard.includes("Kampanye manual"))throw Error("Retired automatic campaign UI still deployed");
if(!dashboard.includes('id="waSetupGuideId"')||!dashboard.includes('Panduan Hubungkan WhatsApp (Bahasa Indonesia)'))throw Error("Owner Indonesian WhatsApp guide link missing on live site");
const emblem=await get("/icon.svg");if(!emblem.includes("Approved transparent logo")||!emblem.includes("airplane, cliff and ocean waves"))throw Error("Approved logo not live");
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
 !app.includes("function renderGrowth")||!(await get("/website-content.js?v=3.36.0")).includes("/api/public/intent"))
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
console.log("SUCCESS v3.36.0 LIVE: consented guest intake active, Turnstile fail-closed (403), public photos, catalog, privacy, protected CMS and booking APIs.");

const analytics=await get("/analytics.js");if(!analytics.includes("G-5232NFPSPV")||!analytics.includes("generate_lead")||!analytics.includes("whatsapp_click"))throw Error("GA4 asset missing");
for(const path of ["/","/en/tours/snorkeling","/privacy.html"]){const page=await get(path);if(!page.includes('/analytics.js?v=3.36.0'))throw Error("GA4 missing "+path);}
if((await get("/dashboard.html")).includes('/analytics.js'))throw Error("GA4 must not load on dashboard");

// Verify actual bytes for every live owner-selected CMS photo, not just static catalog IDs.
const publishedPhotos=new Set([...websiteSlots.items.map(x=>x.url),...websiteCatalog.items.map(x=>x.photo_url)].filter(Boolean));
for(const path of publishedPhotos){
 const response=await fetch(base+path,{signal:AbortSignal.timeout(20000)});
 const type=response.headers.get("content-type")||"";
 const bytes=new Uint8Array(await response.arrayBuffer());
 if(response.status!==200||!type.startsWith("image/jpeg")||bytes.length<10000||bytes[0]!==255||bytes[1]!==216||bytes.at(-2)!==255||bytes.at(-1)!==217)throw Error("Published CMS photo unavailable: "+path+" HTTP "+response.status);
}
const jpg=await fetch(base+"/photos/kelingking.jpg?v=5",{signal:AbortSignal.timeout(20000)});
if(jpg.status!==200||!(jpg.headers.get("content-type")||"").startsWith("image/jpeg"))throw Error("Static JPG fallback broken");
console.log("Verified "+publishedPhotos.size+" distinct published CMS photos and JPG fallback");

// The current CMS-selected hero must be discoverable before any JavaScript runs.
const heroSlot=websiteSlots.items.find(x=>x.slot==="hero");
if(heroSlot){
 const heroTag=[...landingMarkup.matchAll(/<img\b[^>]*data-npe-slot="hero"[^>]*>/g)][0]?.[0]||"";
 if(!heroTag.includes('src="'+heroSlot.url+'"')||!heroTag.includes('fetchpriority="high"'))throw Error("Published hero is not server-rendered for LCP");
}
console.log("Verified server-rendered published hero for LCP");

// Validate rendered gallery sources AND correct credits after CMS substitutions.
const liveSlots=new Map(websiteSlots.items.map(x=>[x.slot,x.url]));
for(const html of [landingMarkup,snorkeling,west,east,island]){
 for(const match of html.matchAll(/<img\b[^>]*data-npe-slot="([^"]+)"[^>]*>/g)){
  const slot=liveSlots.get(match[1]);if(slot&&!match[0].includes(' src="'+slot+'"'))throw Error("Wrong published slot "+match[1]);
 }
 for(const figure of html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)){
  if(figure[0].includes('data-npe-rendered-photo="true"')&&figure[0].includes("<figcaption")&&!figure[0].includes('data-npe-owner-photo="true"'))throw Error("Missing owner photo credit");
 }
}
if(heroSlot&&!landingMarkup.includes('<link rel="preload" as="image" href="'+heroSlot.url+'" fetchpriority="high" imagesrcset="'))throw Error("LCP preload not matching published hero");
if((await get("/guest.js")).includes('navigator.serviceWorker.register('))throw Error("Public browsing must not precache admin PWA");
console.log("Verified CMS gallery credits, final hero preload and public PWA separation");

if(heroSlot){
 const image=await fetch(base+heroSlot.url,{signal:AbortSignal.timeout(20000)});
 if(image.status!==200||!/\bmax-age=86400\b/.test(image.headers.get("cache-control")||""))throw Error("Published hero cache policy not deployed");
}
if(!/<input name="website"[^>]*aria-label="[^"]+"/.test(landingMarkup))throw Error("Honeypot accessible name missing");
console.log("Verified public image cache policy and labelled honeypot");

for(const path of ["/photos/kelingking",...(heroSlot?[heroSlot.url]:[])]){
 const variant=await fetch(base+path+"?npew=240",{signal:AbortSignal.timeout(20000)});
 const bytes=new Uint8Array(await variant.arrayBuffer());
 if(!variant.ok||!variant.headers.get("content-type")?.startsWith("image/webp")||String.fromCharCode(...bytes.slice(8,12))!=="WEBP")throw Error("Responsive variant missing "+path);
}
console.log("Responsive WebP confirmed for static and CMS hero");
