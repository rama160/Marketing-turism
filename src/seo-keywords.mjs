// Owner planning is separate from immutable measured observations. No AI-generated metrics.
const origin="https://nusapenidaexperiences.com";
const norm=v=>String(v??"").normalize("NFKC").trim().toLowerCase().replace(/\s+/g," ");
const clean=(v,n)=>String(v??"").trim().slice(0,n);
const clusters={penida:/nusa penida|kelingking|broken beach|diamond beach|atuh beach/i,west:/west|barat|kelingking|broken beach|billabong/i,east:/east|timur|diamond beach|atuh beach/i,snorkeling:/snorkel|manta|gamat bay/i,lembongan:/lembongan|ceningan|yellow bridge|mangrove/i,boat:/fast boat|ferry|kapal|sanur|gili/i};
export const keywordTopics=["lembongan-two-days","penida-snorkel-preparation","sanur-boat-preparation","penida-viewpoints-access","lembongan-mangrove-visit","gili-boat-planning"];
const basePaths=["/","/en/tours","/en/tours/island","/en/tours/west","/en/tours/east","/en/tours/snorkeling","/island-tour.html","/west-tour.html","/east-tour.html","/snorkeling.html","/en/articles","/id/articles"];
const seed=[
 ["nusa penida private tour","en","penida","BUY","/en/tours/island"],["paket tour nusa penida","id","penida","BUY","/island-tour.html"],
 ["nusa penida west tour","en","west","BUY","/en/tours/west"],["tour nusa penida barat","id","west","BUY","/west-tour.html"],
 ["nusa penida east tour","en","east","BUY","/en/tours/east"],["tour nusa penida timur","id","east","BUY","/east-tour.html"],
 ["nusa penida snorkeling tour","en","snorkeling","BUY","/en/tours/snorkeling"],["snorkeling nusa penida 3 spot","id","snorkeling","BUY","/snorkeling.html"],
 ["nusa lembongan island tour","en","lembongan","BUY","/en/experiences/nusa-lembongan-island-tour"],["tour pulau nusa lembongan","id","lembongan","BUY","/id/experiences/nusa-lembongan-island-tour"],
 ["sanur to lembongan fast boat","en","boat","BUY","/en/experiences/boat-ticket"],["tiket fast boat sanur lembongan","id","boat","BUY","/id/experiences/boat-ticket"],
 ["nusa lembongan 2 day itinerary","en","lembongan","PLAN","","lembongan-two-days"],["itinerary 2 hari lembongan ceningan","id","lembongan","PLAN","","lembongan-two-days"],
 ["nusa penida snorkeling preparation","en","snorkeling","PLAN","","penida-snorkel-preparation"],["persiapan snorkeling nusa penida","id","snorkeling","PLAN","","penida-snorkel-preparation"],
 ["sanur fast boat check in","en","boat","PLAN","","sanur-boat-preparation"],["persiapan naik fast boat sanur","id","boat","PLAN","","sanur-boat-preparation"],
 ["nusa penida viewpoints accessibility","en","penida","PLAN","","penida-viewpoints-access"],["akses destinasi nusa penida","id","penida","PLAN","","penida-viewpoints-access"],
 ["lembongan mangrove snorkeling","en","lembongan","PLAN","","lembongan-mangrove-visit"],["wisata mangrove lembongan","id","lembongan","PLAN","","lembongan-mangrove-visit"],
 ["lembongan to gili fast boat","en","boat","PLAN","","gili-boat-planning"],["kapal lembongan ke gili","id","boat","PLAN","","gili-boat-planning"]
];
const dateOK=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+"T00:00:00Z"))&&new Date(s+"T00:00:00Z").toISOString().slice(0,10)===s;
const safeQuery=s=>s.length>=3&&s.length<=140&&!/[@<>\\]|https?:|www\.|\d{7,}|[\u0000-\u001f]/i.test(s);
export async function keywordPaths(db){
 const [a,b]=await Promise.all([db.prepare("SELECT slug FROM website_activities WHERE status='PUBLISHED' AND published_json IS NOT NULL").all(),db.prepare("SELECT slug FROM seo_articles WHERE published_json IS NOT NULL").all()]);
 const valid=x=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.slug);
 return [...basePaths,...a.results.filter(valid).flatMap(x=>["/id/experiences/"+x.slug,"/en/experiences/"+x.slug]),...b.results.filter(valid).flatMap(x=>["/id/articles/"+x.slug,"/en/articles/"+x.slug])];
}
export function validateKeyword(input,paths){
 const keyword=clean(input.keyword,140),normalized=norm(keyword),locale=input.locale,cluster=input.cluster,intent=input.intent,target=clean(input.target_path,240),priority=Number(input.priority),topic=clean(input.topic,80);
 if(!safeQuery(keyword)||!["id","en"].includes(locale)||!Object.hasOwn(clusters,cluster)||!["BUY","PLAN","LEARN"].includes(intent)||![1,2,3].includes(priority)||topic&&!keywordTopics.includes(topic))throw Error("Keyword, bahasa, klaster, intent, prioritas atau topik tidak valid.");
 if(target&&!paths.includes(target))throw Error("Pilih URL canonical yang sudah terbit.");
 if(target&&((locale==="id"&&target.startsWith("/en/"))||(locale==="en"&&(target.startsWith("/id/")||target.endsWith(".html")))))throw Error("Bahasa keyword dan halaman sasaran harus sesuai.");
 const m=input.manual||{},numeric=(v,min,max,integer=false)=>{if(v===""||v===null||v===undefined)return null;const n=Number(v);if(!Number.isFinite(n)||n<min||n>max||integer&&!Number.isInteger(n))throw Error("Metrik manual tidak valid.");return n;};
 const manual={volume:numeric(m.volume,0,1e9,true),difficulty:numeric(m.difficulty,0,100),impressions:numeric(m.impressions,0,1e9,true),clicks:numeric(m.clicks,0,1e9,true),position:numeric(m.position,1,1000),source:clean(m.source,200),period:clean(m.period,100),country:clean(m.country,60),device:clean(m.device,40),checked:clean(m.checked,10),competitors:clean(m.competitors,1800),notes:clean(m.notes,1500)};
 if(manual.clicks!==null&&(manual.impressions===null||manual.clicks>manual.impressions))throw Error("Klik manual tidak boleh melebihi impressions.");
 if((manual.volume!==null||manual.difficulty!==null||manual.impressions!==null||manual.clicks!==null||manual.position!==null||manual.competitors)&&(!manual.source||!manual.period||!manual.country||!manual.device||!dateOK(manual.checked)))throw Error("Metrik/riset kompetitor memerlukan sumber, periode, negara, perangkat dan tanggal cek.");
 return {keyword,normalized,locale,cluster,intent,target_path:target,priority,topic,manual,active:input.active===false?0:1};
}
export async function ensureKeywordSeeds(db){
 const paths=await keywordPaths(db);
 const seeded=await db.prepare("SELECT count(*) AS n FROM seo_keyword_plans WHERE origin='SEED'").first();
 if(Number(seeded?.n)>=seed.length)return paths;
 const stmts=seed.map(([keyword,locale,cluster,intent,target,topic=""],index)=>{
  if(topic==="lembongan-two-days")target=paths.find(p=>p.startsWith("/"+locale+"/articles/lembongan-two-days-"))||"";
  return db.prepare("INSERT OR IGNORE INTO seo_keyword_plans(id,keyword,normalized,locale,cluster,intent,target_path,priority,topic,origin) VALUES(?,?,?,?,?,?,?,2,?,'SEED')").bind("00000000-0000-4000-8000-"+String(index+1).padStart(12,"0"),keyword,norm(keyword),locale,cluster,intent,paths.includes(target)?target:"",topic);
 });
 await db.batch(stmts);return paths;
}
export async function saveKeyword(db,input,id=null){
 const p=validateKeyword(input,await keywordPaths(db));
 const values=[p.keyword,p.normalized,p.locale,p.cluster,p.intent,p.target_path,p.priority,p.topic,JSON.stringify(p.manual),p.active];
 if(id){
  if(!Number.isSafeInteger(input.expected_version))throw Error("Versi keyword diperlukan.");
  const result=await db.prepare("UPDATE seo_keyword_plans SET keyword=?,normalized=?,locale=?,cluster=?,intent=?,target_path=?,priority=?,topic=?,manual_json=?,active=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=?").bind(...values,id,input.expected_version).run();
  if(result.meta?.changes!==1)throw Error("Keyword berubah atau tidak ditemukan. Muat ulang.");
 }else{
  if(Number((await db.prepare("SELECT count(*) AS n FROM seo_keyword_plans").first()).n)>=500)throw Error("Batas 500 keyword tercapai.");
  const result=await db.prepare("INSERT OR IGNORE INTO seo_keyword_plans(id,keyword,normalized,locale,cluster,intent,target_path,priority,topic,manual_json,active,origin) VALUES(?,?,?,?,?,?,?,?,?,?,?,'OWNER')").bind(crypto.randomUUID(),...values).run();
  if(result.meta?.changes!==1)throw Error("Keyword sudah ada untuk bahasa ini. Gunakan Edit.");
 }
 return {saved:true};
}
const b64url=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
const enc=s=>b64url(new TextEncoder().encode(s));
const configured=env=>!!env.GSC_SERVICE_ACCOUNT_JSON&&["sc-domain:nusapenidaexperiences.com",origin+"/"].includes(env.GSC_PROPERTY);
async function gscToken(env,request,now){
 const credentials=JSON.parse(env.GSC_SERVICE_ACCOUNT_JSON);
 if(!/^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/.test(credentials.client_email||"")||typeof credentials.private_key!=="string")throw Error("CONFIG");
 const pem=credentials.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,"");
 const key=await crypto.subtle.importKey("pkcs8",Uint8Array.from(atob(pem),c=>c.charCodeAt(0)),{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
 const iat=Math.floor(now/1000),unsigned=enc(JSON.stringify({alg:"RS256",typ:"JWT"}))+"."+enc(JSON.stringify({iss:credentials.client_email,scope:"https://www.googleapis.com/auth/webmasters.readonly",aud:"https://oauth2.googleapis.com/token",iat,exp:iat+3000}));
 const sig=await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,new TextEncoder().encode(unsigned));
 const r=await request("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:unsigned+"."+b64url(sig)}),signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error("AUTH");
 const data=await r.json();if(typeof data.access_token!=="string")throw Error("AUTH");return data.access_token;
}
export function parseGscRows(data,paths){
 const out=[],seen=new Set();
 for(const r of (Array.isArray(data?.rows)?data.rows:[]).slice(0,300)){
  const [query,page]=r.keys||[],q=typeof query==="string"?query.trim():"";if(!safeQuery(q))continue;
  let u;try{u=new URL(page);}catch{continue}
  if(u.origin!==origin||u.search||u.hash||!paths.includes(u.pathname))continue;
  const clicks=r.clicks,impressions=r.impressions,position=r.position;
  if(!Number.isSafeInteger(clicks)||!Number.isSafeInteger(impressions)||clicks<0||impressions<clicks||impressions<=0||!Number.isFinite(position)||position<1)continue;
  const normalized=norm(q),key=normalized+"|"+u.pathname;if(seen.has(key))continue;seen.add(key);
  out.push({query:q,normalized,path:u.pathname,clicks,impressions,position});
 }
 return out;
}
export async function runKeywordResearch(db,env,{manual=false,now=Date.now(),request=fetch}={}){
 const paths=await ensureKeywordSeeds(db),day=new Date(now).toISOString().slice(0,10);
 // One scheduled run per UTC day; manual at most once/hour, including failures.
 const latest=await db.prepare("SELECT created_at,state FROM seo_keyword_runs ORDER BY created_at DESC LIMIT 1").first();
 if(latest&&now-Date.parse(latest.created_at.replace(" ","T")+"Z")<(manual?3600000:86400000))return {status:"RECENT",detail:"Hasil terakhir masih berlaku; lihat dashboard."};
 const end=new Date(now-3*86400000).toISOString().slice(0,10),start=new Date(now-30*86400000).toISOString().slice(0,10);
 // Serialized by an atomic hour lock (id is a fixed UTC-hour key, not a user-supplied identifier).
 const lock=day+"T"+new Date(now).toISOString().slice(11,13);
 const ins=await db.prepare("INSERT OR IGNORE INTO seo_keyword_runs(id,day,state,period_start,period_end) VALUES(?,?,'RUNNING',?,?)").bind(lock,day,start,end).run();
 if(ins.meta?.changes!==1)return {status:"RECENT",detail:"Riset pada jam ini sudah dijalankan."};
 let gsc="NOT_CONFIGURED",rows=[],signals={status:"UNAVAILABLE",counts:{},sample:null};
 try{
  const r=await db.prepare("SELECT result,created_at FROM growth_discovery_runs WHERE source='REDDIT_PUBLIC_RSS' AND created_at>=datetime('now','-24 hours') ORDER BY created_at DESC LIMIT 1").first();
  if(r&&r.result!=="SOURCE_UNAVAILABLE"){
   const q=await db.prepare("SELECT headline FROM growth_opportunities WHERE source='REDDIT_PUBLIC_RSS' AND discovered_at>=datetime('now','-14 days') ORDER BY discovered_at DESC LIMIT 200").all();
   signals={status:"MEASURED",counts:Object.fromEntries(Object.entries(clusters).map(([k,re])=>[k,q.results.filter(x=>re.test(x.headline)).length])),sample:q.results.length,days:14,limit:200};
  }
 }catch{}
 if(configured(env)){
  try{
   const token=await gscToken(env,request,now);
   const response=await request("https://www.googleapis.com/webmasters/v3/sites/"+encodeURIComponent(env.GSC_PROPERTY)+"/searchAnalytics/query",{method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:JSON.stringify({startDate:start,endDate:end,type:"web",dataState:"final",dimensions:["query","page"],rowLimit:300}),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error(response.status===403?"ACCESS":"REQUEST");
   const data=await response.json();rows=parseGscRows(data,paths);gsc=rows.length?"MEASURED":"NO_ROWS";
   // Bounded batches; an incomplete run is never returned as a successful snapshot.
   for(let i=0;i<rows.length;i+=50)await db.batch(rows.slice(i,i+50).map(x=>db.prepare("INSERT INTO seo_keyword_observations(run_id,query,normalized,path,clicks,impressions,position) VALUES(?,?,?,?,?,?,?)").bind(lock,x.query,x.normalized,x.path,x.clicks,x.impressions,x.position)));
   // Discovered queries are candidates, not automatically approved URL assignments.
   const plans=(await db.prepare("SELECT count(*) AS n FROM seo_keyword_plans").first()).n;
   const candidates=rows.filter(x=>Object.values(clusters).some(re=>re.test(x.query))).slice(0,Math.max(0,Math.min(40,500-Number(plans))));
   if(candidates.length)await db.batch(candidates.map(x=>{
    const locale=x.path.startsWith("/en/")?"en":"id",cluster=Object.keys(clusters).find(k=>k!=="penida"&&clusters[k].test(x.query))||"penida";
    return db.prepare("INSERT OR IGNORE INTO seo_keyword_plans(id,keyword,normalized,locale,cluster,intent,target_path,priority,origin) VALUES(?,?,?,?,?,'PLAN','',2,'GSC')").bind(crypto.randomUUID(),x.query,x.normalized,locale,cluster);
   }));
  }catch{gsc="ERROR";rows=[];await db.prepare("DELETE FROM seo_keyword_observations WHERE run_id=?").bind(lock).run();}
 }
 await db.prepare("UPDATE seo_keyword_runs SET state='DONE',signal_json=?,gsc_status=?,gsc_rows=? WHERE id=?").bind(JSON.stringify(signals),gsc,rows.length,lock).run();
 // Keep 90 days of snapshots. Explicitly delete children because D1 behavior is not assumed.
 await db.batch([db.prepare("DELETE FROM seo_keyword_observations WHERE run_id IN (SELECT id FROM seo_keyword_runs WHERE created_at<datetime('now','-90 days'))"),db.prepare("DELETE FROM seo_keyword_runs WHERE created_at<datetime('now','-90 days')")]);
 return {status:"DONE",gsc_status:gsc,rows:rows.length,signal_status:signals.status};
}
export async function listKeywords(db,env){
 const paths=await ensureKeywordSeeds(db);
 const plans=(await db.prepare("SELECT * FROM seo_keyword_plans ORDER BY active DESC,priority,locale,keyword LIMIT 500").all()).results.map(x=>({...x,manual:JSON.parse(x.manual_json),manual_json:undefined}));
 const latest=await db.prepare("SELECT * FROM seo_keyword_runs ORDER BY created_at DESC LIMIT 1").first();
 const snapshot=await db.prepare("SELECT * FROM seo_keyword_runs WHERE state='DONE' AND gsc_status IN ('MEASURED','NO_ROWS') ORDER BY created_at DESC LIMIT 1").first();
 const observations=snapshot?(await db.prepare("SELECT query,normalized,path,clicks,impressions,position FROM seo_keyword_observations WHERE run_id=? ORDER BY impressions DESC").bind(snapshot.id).all()).results:[];
 return {plans,paths,latest:latest?{...latest,signals:JSON.parse(latest.signal_json),signal_json:undefined}:null,snapshot:snapshot?{period_start:snapshot.period_start,period_end:snapshot.period_end,created_at:snapshot.created_at,gsc_status:snapshot.gsc_status}:null,observations,gsc_configured:configured(env),limit:300};
}
export async function keywordArticlePriorities(db){
 try{
  const plans=(await db.prepare("SELECT keyword,normalized,locale,topic,priority,target_path FROM seo_keyword_plans WHERE active=1 AND topic!='' ORDER BY priority,keyword").all()).results;
  const snap=await db.prepare("SELECT id,period_start,period_end FROM seo_keyword_runs WHERE state='DONE' AND gsc_status='MEASURED' ORDER BY created_at DESC LIMIT 1").first();
  const obs=snap?(await db.prepare("SELECT normalized,impressions,path FROM seo_keyword_observations WHERE run_id=?").bind(snap.id).all()).results:[];
  const out={};for(const p of plans){
   const impressions=obs.filter(o=>o.normalized===p.normalized&&o.path===p.target_path).reduce((a,b)=>a+b.impressions,0);
   const prev=out[p.topic];if(!prev||p.priority<prev.priority||p.priority===prev.priority&&impressions>prev.impressions)out[p.topic]={keyword:p.keyword,locale:p.locale,priority:p.priority,impressions:impressions||null,period:snap?[snap.period_start,snap.period_end]:null};
  }return out;
 }catch{return {};}
}
