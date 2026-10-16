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
if(health.version!=="2.2.0")throw Error("Cloudflare release version mismatch: "+health.version);
const cat=JSON.parse(await get("/api/public/catalog"));
if(!Array.isArray(cat.items)||cat.items.length<5)throw Error("Public catalog missing items");
const page=await get("/");
if(!page.includes("Marketing")||!page.includes("leadForm"))throw Error("Guest page not served");
const app=await get("/app.js");
if(!app.includes("quotePayload"))throw Error("Frontend application missing");
await get("/api/admin/summary",401);
await get("/api/admin/finance",401);
await get("/api/admin/campaigns",401);
await get("/api/admin/market",401);
await get("/api/admin/analytics",401);
await get("/api/admin/bookings/demo/manifest",401);
const req=await fetch(base+"/api/public/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"DO NOT CREATE",contact:"test",consent:false}),signal:AbortSignal.timeout(20000)});
if(req.status!==503)throw Error("Public lead gate should remain closed for pilot, got "+req.status);
console.log("SUCCESS: public HTML, app JS, D1 API, catalogue, admin auth and closed lead intake.");
