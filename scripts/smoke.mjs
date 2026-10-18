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
if(health.version!=="3.0.2")throw Error("Cloudflare release version mismatch: "+health.version);
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
for(const imageHost of ["https://commons.wikimedia.org","https://upload.wikimedia.org"]){
 if(!photoPolicy.includes(imageHost))throw Error("Photo loading blocked by CSP: "+imageHost);
}
const imageChecks=["kelingking","diamond-beach","manta-point"];
for(const id of imageChecks){
 const response=await fetch(base+"/photos/"+id,{signal:AbortSignal.timeout(20000)});
 const type=response.headers.get("content-type")||"";
 if(response.status!==200||!type.startsWith("image/")||response.headers.get("x-photo-status")!=="upstream-ok")
  throw Error("Tourism photo gateway unavailable: "+id+" HTTP "+response.status+" "+type);
}
const page=await get("/");
if(!page.includes("NUSA PENIDA")||!page.includes("leadForm"))throw Error("Guest page not served");
const app=await get("/app.js");
if(!app.includes("quotePayload"))throw Error("Frontend application missing");
await get("/api/admin/summary",401);
await get("/api/admin/finance",401);
await get("/api/admin/business",401);
await get("/api/admin/campaigns",401);
await get("/api/admin/market",401);
await get("/api/admin/analytics",401);
await get("/api/admin/bookings/demo/manifest",401);
const req=await fetch(base+"/api/public/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"DO NOT CREATE",contact:"test",consent:false}),signal:AbortSignal.timeout(20000)});
if(req.status!==503)throw Error("Public lead gate should remain closed for pilot, got "+req.status);
console.log("SUCCESS: public HTML, app JS, D1 API, catalogue, admin auth and closed lead intake.");
