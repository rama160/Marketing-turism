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
if(health.version!=="3.2.0")throw Error("Cloudflare release version mismatch: "+health.version);
const ready=JSON.parse(await get("/api/public/readiness"));
if(ready.accepting_leads!==false)throw Error("Pilot must remain closed until launch approval");
await get("/privacy.html");await get("/terms.html");await get("/cancellation.html");
const snorkeling=await get("/snorkeling.html");if(!snorkeling.includes("Snorkeling Nusa Penida")||!snorkeling.includes("Manta Bay")||!snorkeling.includes("Wikimedia Commons"))throw Error("Snorkeling/gallery missing");
const island=await get("/island-tour.html");
const west=await get("/west-tour.html");const east=await get("/east-tour.html");
if(!west.includes("Kelingking")||!west.includes("Broken Beach")||!west.includes("Wikimedia Commons"))throw Error("West gallery missing");
if(!east.includes("Diamond Beach")||!east.includes("Atuh Beach")||!east.includes("Wikimedia Commons"))throw Error("East gallery missing");if(!island.includes("Island Tour")||!island.includes("Rp700.000")||!island.includes("/west-tour.html")||!island.includes("/east-tour.html"))throw Error("Island tour guide/pricing missing");
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
const app=await get("/app.js");
if(!app.includes("quotePayload"))throw Error("Frontend application missing");
// v3.1.0 live release: actual published brand, locale controls and authenticated CMS.
const home=await get("/");
if(!home.includes('src="/icon.svg"')||!home.includes('src="/language.js"')||!home.includes('id="cmsPublish"')||!home.includes('data-tab="website"')||!home.includes('class="hero premiumHero"')||!home.includes('class="tour-showcase-grid"')||!home.includes('id="quickSave"'))
 throw Error("New logo/language/editor missing on live website");
const langJS=await get("/language.js");
if(!langJS.includes("navigator.languages")||!langJS.includes("npe-language")||!langJS.includes("site-content?lang="))throw Error("Guest locale selection not live");
const styles=await get("/styles.css");if(!styles.includes(".languagePicker")||!styles.includes(".brandLogo"))throw Error("New CSS missing");
if(!styles.includes(".premiumHero")||!styles.includes(".tour-showcase-grid"))throw Error("Premium public design missing");
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
await get("/api/admin/summary",401);
await get("/api/admin/finance",401);
await get("/api/admin/business",401);
await get("/api/admin/campaigns",401);
await get("/api/admin/market",401);
await get("/api/admin/analytics",401);
await get("/api/admin/bookings/demo/manifest",401);
const req=await fetch(base+"/api/public/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"DO NOT CREATE",contact:"test",consent:false}),signal:AbortSignal.timeout(20000)});
if(req.status!==503)throw Error("Public lead gate should remain closed for pilot, got "+req.status);
console.log("SUCCESS v3.2.0 LIVE: 10 JPGs, public logo, ID/EN, editor, CMS D1 API and 401 auth, original booking APIs, lead gate OFF.");
