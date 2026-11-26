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
 const manual={volume:numeric(m.volume,0,1e9,true),volume_min:numeric(m.volume_min,0,1e9,true),volume_max:numeric(m.volume_max,0,1e9,true),difficulty:numeric(m.difficulty,0,100),impressions:numeric(m.impressions,0,1e9,true),clicks:numeric(m.clicks,0,1e9,true),position:numeric(m.position,1,1000),source:clean(m.source,200),period:clean(m.period,100),country:clean(m.country,60),device:clean(m.device,40),checked:clean(m.checked,10),competitors:clean(m.competitors,1800),notes:clean(m.notes,1500)};
 if(manual.clicks!==null&&(manual.impressions===null||manual.clicks>manual.impressions))throw Error("Klik manual tidak boleh melebihi impressions.");
 if((manual.volume_min!==null)!==(manual.volume_max!==null)||manual.volume_min!==null&&(manual.volume_min>manual.volume_max||manual.volume!==null))throw Error("Isi estimasi tunggal atau rentang volume lengkap, bukan keduanya.");
 if((manual.volume!==null||manual.volume_min!==null||manual.difficulty!==null||manual.impressions!==null||manual.clicks!==null||manual.position!==null||manual.competitors)&&(!manual.source||!manual.period||!manual.country||!manual.device||!dateOK(manual.checked)))throw Error("Metrik/riset kompetitor memerlukan sumber, periode, negara, perangkat dan tanggal cek.");
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
async function gscToken(env,request,now,scope="https://www.googleapis.com/auth/webmasters.readonly"){
 if(!["https://www.googleapis.com/auth/webmasters.readonly","https://www.googleapis.com/auth/adwords"].includes(scope))throw Error("CONFIG");
 let credentials;try{credentials=JSON.parse(env.GSC_SERVICE_ACCOUNT_JSON);}catch{throw Error("CONFIG");}
 if(!credentials||!/^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/.test(credentials.client_email||"")||typeof credentials.private_key!=="string")throw Error("CONFIG");
 const pem=credentials.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,"");
 let key;try{key=await crypto.subtle.importKey("pkcs8",Uint8Array.from(atob(pem),c=>c.charCodeAt(0)),{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);}catch{throw Error("CONFIG");}
 const iat=Math.floor(now/1000),unsigned=enc(JSON.stringify({alg:"RS256",typ:"JWT"}))+"."+enc(JSON.stringify({iss:credentials.client_email,scope,aud:"https://oauth2.googleapis.com/token",iat,exp:iat+3000}));
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
 const {start,end}=performanceRange({preset:"28d",mode:"final"},now);
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
  let stage="NETWORK";
  try{
   const token=await gscToken(env,request,now);
   const response=await request("https://www.googleapis.com/webmasters/v3/sites/"+encodeURIComponent(env.GSC_PROPERTY)+"/searchAnalytics/query",{method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:JSON.stringify({startDate:start,endDate:end,type:"web",dataState:"final",dimensions:["query","page"],rowLimit:300}),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error(response.status===403?"ACCESS":"REQUEST");
   stage="REQUEST";const data=await response.json();
   if(!data||typeof data!=="object"||(data.rows!==undefined&&!Array.isArray(data.rows)))throw Error("REQUEST");
   signals.gsc_raw_rows=data.rows?.length??0;rows=parseGscRows(data,paths);gsc=rows.length?"MEASURED":"NO_ROWS";stage="STORAGE";
   // Bounded batches; an incomplete run is never returned as a successful snapshot.
   for(let i=0;i<rows.length;i+=50)await db.batch(rows.slice(i,i+50).map(x=>db.prepare("INSERT INTO seo_keyword_observations(run_id,query,normalized,path,clicks,impressions,position) VALUES(?,?,?,?,?,?,?)").bind(lock,x.query,x.normalized,x.path,x.clicks,x.impressions,x.position)));
   // Discovered queries are candidates, not automatically approved URL assignments.
   const plans=(await db.prepare("SELECT count(*) AS n FROM seo_keyword_plans").first()).n;
   const candidates=rows.filter(x=>queryLanguage(x.query)&&Object.values(clusters).some(re=>re.test(x.query))).slice(0,Math.max(0,Math.min(40,500-Number(plans))));
   if(candidates.length)await db.batch(candidates.map(x=>{
    const locale=queryLanguage(x.query),cluster=Object.keys(clusters).find(k=>k!=="penida"&&clusters[k].test(x.query))||"penida";
    return db.prepare("INSERT OR IGNORE INTO seo_keyword_plans(id,keyword,normalized,locale,cluster,intent,target_path,priority,origin) VALUES(?,?,?,?,?,'PLAN','',2,'GSC')").bind(crypto.randomUUID(),x.query,x.normalized,locale,cluster);
   }));
  }catch(e){gsc="ERROR";rows=[];signals.gsc_error=["CONFIG","AUTH","ACCESS","REQUEST"].includes(e?.message)?e.message:stage;await db.prepare("DELETE FROM seo_keyword_observations WHERE run_id=?").bind(lock).run();}
 }
 await db.prepare("UPDATE seo_keyword_runs SET state='DONE',signal_json=?,gsc_status=?,gsc_rows=? WHERE id=?").bind(JSON.stringify(signals),gsc,rows.length,lock).run();
 // Keep 90 days of snapshots. Explicitly delete children because D1 behavior is not assumed.
 await db.batch([db.prepare("DELETE FROM seo_keyword_observations WHERE run_id IN (SELECT id FROM seo_keyword_runs WHERE created_at<datetime('now','-90 days'))"),db.prepare("DELETE FROM seo_keyword_runs WHERE created_at<datetime('now','-90 days')")]);
 return {status:"DONE",gsc_status:gsc,rows:rows.length,signal_status:signals.status,gsc_error:signals.gsc_error??null};
}
// Existing hourly cron may bootstrap a newly configured property once; the normal daily schedule remains.
export async function bootstrapKeywordResearch(db,env,options={}){
 if(!configured(env))return {status:"NOT_CONFIGURED"};
 const latest=await db.prepare("SELECT state,gsc_status FROM seo_keyword_runs ORDER BY created_at DESC LIMIT 1").first();
 if(latest&&(latest.state!=="DONE"||latest.gsc_status!=="NOT_CONFIGURED"))return {status:"SKIPPED"};
 return runKeywordResearch(db,env,{...options,manual:true});
}

// Search Analytics dates use Pacific time. Hourly reports are 24 hour buckets including the current partial hour.
const HOUR=3600000,DAY=24*HOUR;
const ptDate=ms=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).format(ms);
const shiftDate=(s,n)=>new Date(Date.parse(s+"T00:00:00Z")+n*DAY).toISOString().slice(0,10);
export function performanceRange(input={},now=Date.now()){
 const preset=String(input.preset||"24h"),mode=preset==="24h"?"fresh":String(input.mode||"final");
 if(!["24h","7d","28d","3m","custom"].includes(preset)||!["fresh","final"].includes(mode))throw Error("Periode atau jenis data tidak valid.");
 const today=ptDate(now),finalEnd=shiftDate(today,-3);
 if(preset==="24h"){
  const endHour=Math.floor(now/HOUR)*HOUR,startHour=endHour-23*HOUR;
  return {key:"24h",preset,mode,state:"hourly_all",start:ptDate(startHour),end:ptDate(endHour),start_hour:new Date(startHour).toISOString(),end_hour:new Date(endHour).toISOString(),timezone:"America/Los_Angeles"};
 }
 let end=mode==="final"?finalEnd:today,start;
 if(preset==="custom"){
  start=String(input.start||"");end=String(input.end||"");
  if(!dateOK(start)||!dateOK(end)||start>end||end>today||start<shiftDate(today,-480)||Date.parse(end)-Date.parse(start)>92*DAY)throw Error("Custom: pilih 1–93 hari, dalam 480 hari terakhir, tidak melewati hari ini (Pacific).");
 }else if(preset==="3m"){
  const x=new Date(end+"T00:00:00Z"),d=x.getUTCDate();x.setUTCDate(1);x.setUTCMonth(x.getUTCMonth()-3);const last=new Date(Date.UTC(x.getUTCFullYear(),x.getUTCMonth()+1,0)).getUTCDate();x.setUTCDate(Math.min(d,last));start=shiftDate(x.toISOString().slice(0,10),1);
 }else start=shiftDate(end,preset==="7d"?-6:-27);
 return {key:preset+":"+mode,preset,mode,state:mode==="final"?"final":"all",start,end,timezone:"America/Los_Angeles"};
}
export function queryLanguage(q){
 const id=/\b(wisata|paket|tiket|kapal|barat|timur|harga|persiapan|pulau|hari|ke|dari)\b/i.test(q);
 const en=/\b(west|east|island|private|sharing|itinerary|preparation|accessibility|day|days|ticket|tickets|from|to|best|how|where|price)\b/i.test(q);
 return id===en?null:id?"id":"en";
}
const pageLanguage=p=>p.startsWith("/en/")?"en":p.startsWith("/id/")||p.endsWith(".html")?"id":null;
const safePage=(value,paths)=>{try{const u=new URL(value);return u.origin===origin&&!u.search&&!u.hash&&paths.includes(u.pathname)?u.pathname:null;}catch{return null;}};
function cleanMetrics(r){
 const {clicks,impressions,position}=r||{};
 return Number.isSafeInteger(clicks)&&Number.isSafeInteger(impressions)&&impressions>0&&clicks>=0&&clicks<=impressions&&Number.isFinite(position)&&position>=1?{clicks,impressions,position}:null;
}
// Independent property, query, page and pair aggregations; do not add page or query totals to property totals.
export function summarizePerformanceRows(data,kind,range,paths){
 const raw=Array.isArray(data?.rows)?data.rows:[],hourly=range.state==="hourly_all",grouped=new Map();let rejected=0,outside=0;
 const low=Date.parse(range.start_hour),high=Date.parse(range.end_hour);
 for(const row of raw){
  const keys=Array.isArray(row?.keys)?row.keys:[],m=cleanMetrics(row);let i=0;
  if(hourly){const ts=Date.parse(keys[i++]);if(!Number.isFinite(ts)||ts<low||ts>high){outside++;continue;}}
  if(!m){rejected++;continue;}
  const query=kind==="queries"||kind==="pairs"?String(keys[i++]||""):null;
  const path=kind==="pages"||kind==="pairs"?safePage(keys[i++],paths):null;
  if((query!==null&&!safeQuery(query))||((kind==="pages"||kind==="pairs")&&!path)){rejected++;continue;}
  const key=JSON.stringify([query,path]),v=grouped.get(key)||{query,path,clicks:0,impressions:0,weighted:0};
  v.clicks+=m.clicks;v.impressions+=m.impressions;v.weighted+=m.position*m.impressions;grouped.set(key,v);
 }
 const rows=[...grouped.values()].map(({weighted,...v})=>({...v,position:weighted/v.impressions,ctr:v.clicks/v.impressions,
  ...(v.query?{language_hint:queryLanguage(v.query)}:{}),...(v.path?{page_language:pageLanguage(v.path)}:{})})).sort((a,b)=>b.impressions-a.impressions||b.clicks-a.clicks);
 return {status:rows.length?"MEASURED":raw.length&&rejected?"FILTERED":"NO_ROWS",raw_rows:raw.length,rejected,outside,truncated:raw.length>=300,
  aggregation:data.responseAggregationType||null,first_incomplete:data.metadata?.firstIncompleteHour||data.metadata?.firstIncompleteDate||null,rows};
}
const performanceKinds={total:[],queries:["query"],pages:["page"],pairs:["query","page"]};
function reportError(e){return ["CONFIG","AUTH","ACCESS","REQUEST"].includes(e?.message)?e.message:"NETWORK";}
export async function readKeywordPerformance(db,input={},now=Date.now()){
 const range=performanceRange(input,now),row=await db.prepare("SELECT status,report_json,started_at FROM seo_performance_reports WHERE cache_key=?").bind(range.key).first();
 if(!row)return {status:"NOT_RUN",range};
 const report=JSON.parse(row.report_json||"{}");
 if(range.preset==="custom"&&(report.range?.start!==range.start||report.range?.end!==range.end))return {status:row.status==="RUNNING"?"RUNNING":"NOT_RUN",range};
 return {...report,status:row.status,started_at:row.started_at};
}
export async function collectKeywordPerformance(db,env,input={}, {now=Date.now(),request=fetch}={}){
 const range=performanceRange(input,now);
 if(!configured(env))return {status:"NOT_CONFIGURED",range};
 const lock=crypto.randomUUID(),pending={range};
 // Fixed cache slots: one refresh per preset/mode per hour. Custom is also a single slot per mode.
 const claim=await db.prepare("INSERT INTO seo_performance_reports(cache_key,lock_id,started_at,status,report_json) VALUES(?,?,?,'RUNNING',?) ON CONFLICT(cache_key) DO UPDATE SET lock_id=excluded.lock_id,started_at=excluded.started_at,status='RUNNING',report_json=excluded.report_json WHERE seo_performance_reports.started_at<=?").bind(range.key,lock,now,JSON.stringify(pending),now-HOUR).run();
 if(claim.meta?.changes!==1){const cached=await readKeywordPerformance(db,input,now);return {...cached,cooldown:true};}
 let status="ERROR",report={range,sections:{},checked_at:new Date(now).toISOString()};
 try{
  const paths=await keywordPaths(db),token=await gscToken(env,request,now);
  const endpoint="https://www.googleapis.com/webmasters/v3/sites/"+encodeURIComponent(env.GSC_PROPERTY)+"/searchAnalytics/query";
  const entries=await Promise.all(Object.entries(performanceKinds).map(async([kind,dims])=>{
   try{
    const dimensions=range.state==="hourly_all"?["hour",...dims]:dims;
    const response=await request(endpoint,{method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},
     body:JSON.stringify({startDate:range.start,endDate:range.end,type:"web",dataState:range.state,dimensions,aggregationType:dims.includes("page")?"auto":"byProperty",rowLimit:300}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error(response.status===403?"ACCESS":"REQUEST");
    const data=await response.json();if(!data||typeof data!=="object"||Array.isArray(data)||data.error||(data.rows!==undefined&&!Array.isArray(data.rows)))throw Error("REQUEST");
    return [kind,summarizePerformanceRows(data,kind,range,paths)];
   }catch(e){return [kind,{status:"ERROR",error:reportError(e),rows:[]}];}
  }));
  report.sections=Object.fromEntries(entries);
  const failed=entries.filter(([,v])=>v.status==="ERROR").length;
  status=failed===0?"DONE":failed===entries.length?"ERROR":"PARTIAL";
 }catch(e){report.error=reportError(e);}
 await db.prepare("UPDATE seo_performance_reports SET status=?,report_json=? WHERE cache_key=? AND lock_id=?").bind(status,JSON.stringify(report),range.key,lock).run();
 return {...report,status,started_at:now};
}
export async function publicResearchStatus(db){
 const sources=["REDDIT_PUBLIC_RSS","BLUESKY_PUBLIC","FACEBOOK_PAGE_COMMENTS","INSTAGRAM_MEDIA_COMMENTS","YOUTUBE_PUBLIC_VIDEO"],out=[];
 for(const source of sources){
  try{const r=await db.prepare("SELECT result,candidates,created_at FROM growth_discovery_runs WHERE source=? ORDER BY created_at DESC LIMIT 1").bind(source).first();out.push({source,status:r?.result||"NOT_RUN",candidates:r?.candidates??null,checked_at:r?.created_at||null});}catch{out.push({source,status:"UNKNOWN"});}
 }
 try{const r=await db.prepare("SELECT diagnostic_json,checked_at FROM growth_source_diagnostics WHERE source='REDDIT_PUBLIC_RSS'").first();if(r)out[0].diagnostic={...JSON.parse(r.diagnostic_json),checked_at:r.checked_at};}catch{}
 return out;
}


// SEO-006A: read-only keyword planning. Basic access is not confirmation of permissible use.
// Owner must obtain confirmation that the declared purpose is allowed before enabling the flag.
const plannerMarkets={GLOBAL:[],ID:["geoTargetConstants/2360"],AU:["geoTargetConstants/2036"],US:["geoTargetConstants/2840"],GB:["geoTargetConstants/2826"]};
const plannerLanguages={all:null,en:"languageConstants/1000",id:"languageConstants/1025"};
const plannerTTL=90*86400000,plannerWeek=7*86400000;
function plannerConfig(env){
 const configured=!!env.GSC_SERVICE_ACCOUNT_JSON&&/^\d{10}$/.test(String(env.GOOGLE_ADS_CUSTOMER_ID||""));
 return {configured,approved:env.GOOGLE_ADS_KEYWORD_RESEARCH_APPROVED==="true"};
}
export function plannerScope(input={}){
 const market=String(input.market||"GLOBAL"),locale=String(input.locale||"en");
 if(!Object.hasOwn(plannerMarkets,market)||!Object.hasOwn(plannerLanguages,locale))throw Error("Pasar atau bahasa Keyword Planner tidak valid.");
 return {market,locale,key:market+":"+locale,network:"GOOGLE_SEARCH",period:"Google default: last 12 months",source:"GOOGLE_ADS_API_V26"};
}
const plannerInt=v=>{if(typeof v!=="number"&&!(typeof v==="string"&&/^\d+$/.test(v)))return null;const n=Number(v);return Number.isSafeInteger(n)&&n>=0?n:null;};
const monthNames=["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
export function parsePlannerRows(data,kind,requested=[]){
 if(!data||typeof data!=="object"||Array.isArray(data)||data.error||(data.results!==undefined&&!Array.isArray(data.results)))throw Error("RESPONSE");
 const raw=data.results||[],seen=new Set(),rows=[],requestedSet=new Set(requested.map(norm));
 for(const r of raw.slice(0,300)){
  const keyword=typeof r?.text==="string"?r.text.trim():"",key=norm(keyword);
  if(!safeQuery(keyword)||seen.has(key))continue;
  const variants=[...new Set((Array.isArray(r.closeVariants)?r.closeVariants:[]).filter(v=>typeof v==="string"&&safeQuery(v)).map(v=>v.trim()))].slice(0,100);
  if(kind==="historical"&&!requestedSet.has(key)&&!variants.some(v=>requestedSet.has(norm(v))))continue;
  if(kind==="ideas"&&!Object.values(clusters).some(re=>re.test(keyword)))continue;
  seen.add(key);const m=(kind==="historical"?r.keywordMetrics:r.keywordIdeaMetrics)||{};
  const monthly=(Array.isArray(m.monthlySearchVolumes)?m.monthlySearchVolumes:[]).slice(0,48).map(v=>{
   const year=plannerInt(v.year),month=monthNames.indexOf(v.month)+1;
   return year&&month?{month:year+"-"+String(month).padStart(2,"0"),searches:plannerInt(v.monthlySearches)}:null;
  }).filter(Boolean).sort((a,b)=>a.month.localeCompare(b.month));
  const competition=["LOW","MEDIUM","HIGH"].includes(m.competition)?m.competition:null,index=plannerInt(m.competitionIndex);
  rows.push({keyword,close_variants:variants,avg_monthly_searches:plannerInt(m.avgMonthlySearches),monthly,ads_competition:competition,ads_competition_index:index!==null&&index<=100?index:null});
 }
 const measured=rows.filter(r=>r.avg_monthly_searches!==null||r.monthly.some(m=>m.searches!==null)).length;
 return {status:measured?"MEASURED":rows.length?"METRICS_UNAVAILABLE":raw.length?"FILTERED":"NO_ROWS",raw_rows:raw.length,measured,rows,truncated:raw.length>300||!!data.nextPageToken};
}
// Round-robin across service clusters; no one alphabetical cluster monopolizes idea seeds.
export function diversePlannerSeeds(plans,keywords){
 const allowed=new Set(keywords),groups=new Map(),out=[],seen=new Set();
 for(const p of plans){if(!allowed.has(p.keyword))continue;const group=groups.get(p.cluster)||[];group.push(p.keyword);groups.set(p.cluster,group);}
 for(let i=0;i<100&&out.length<20;i++){let found=false;for(const group of groups.values()){if(i>=group.length)continue;found=true;const k=group[i];if(!seen.has(k)&&out.length<20){seen.add(k);out.push(k);}}if(!found)break;}
 return out;
}
// Compare only an explicitly scoped manual baseline against a compatible API report.
export function comparePlannerBaseline(plans,report){
 const scope=report?.scope;if(scope?.market!=="GLOBAL"||scope?.locale!=="all"||scope?.network!=="GOOGLE_SEARCH")return [];
 const rows=report?.sections?.historical?.rows||[];
 return plans.filter(p=>p.manual?.source?.startsWith("Google Keyword Planner – Keyword Stats ")&&p.manual.country==="Global (All locations)"&&p.manual.notes?.includes("All languages")&&p.manual.volume_min!=null&&p.manual.volume_max!=null).map(p=>{
  const m=p.manual,period=String(m.period||"").match(/^(\d{4}-\d{2})-01 – (\d{4}-\d{2})-\d{2}$/),matches=rows.filter(r=>norm(r.keyword)===p.normalized||(r.close_variants||[]).some(v=>norm(v)===p.normalized));
  let status="NO_API_ROW",estimate=null;
  if(matches.length>1)status="AMBIGUOUS_GROUP";
  else if(matches.length===1){const r=matches[0];estimate=r.avg_monthly_searches;
   const months=[...new Set((r.monthly||[]).map(v=>v.month))].sort(),expected=[];
   if(period){const start=new Date(period[1]+"-01T00:00:00Z");if(Number.isFinite(start.getTime()))for(let i=0;i<48;i++){const month=start.toISOString().slice(0,7);if(month>period[2])break;expected.push(month);start.setUTCMonth(start.getUTCMonth()+1);}}
   if(!period||!expected.length||expected.at(-1)!==period[2]||JSON.stringify(months)!==JSON.stringify(expected))status="PERIOD_UNVERIFIED";
   else if((r.close_variants||[]).some(v=>norm(v)!==p.normalized)||norm(r.keyword)!==p.normalized)status="VARIANT_GROUP";
   else if(estimate==null)status="METRICS_UNAVAILABLE";
   else status=estimate>=m.volume_min&&estimate<=m.volume_max?"WITHIN_RANGE":"OUTSIDE_RANGE";
  }
  return {keyword:p.keyword,min:m.volume_min,max:m.volume_max,estimate,status,period:m.period};
 });
}
function plannerError(e){return ["CONFIG","AUTH","ACCESS","QUOTA","REQUEST","RESPONSE","NETWORK","NO_SEEDS"].includes(e?.message)?e.message:"NETWORK";}
async function plannerRequest(request,env,token,operation,body){
 if(!["generateKeywordHistoricalMetrics","generateKeywordIdeas"].includes(operation))throw Error("CONFIG");
 const r=await request("https://googleads.googleapis.com/v26/customers/"+env.GOOGLE_ADS_CUSTOMER_ID+":"+operation,{method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error(r.status===401?"AUTH":r.status===403?"ACCESS":r.status===429?"QUOTA":"REQUEST");
 try{return await r.json();}catch{throw Error("RESPONSE");}
}
export async function readKeywordPlanner(db,env,input={},now=Date.now()){
 const scope=plannerScope(input),config=plannerConfig(env);
 if(!config.configured)return {status:"NOT_CONFIGURED",scope,...config};
 if(!config.approved)return {status:"APPROVAL_REQUIRED",scope,...config};
 const row=await db.prepare("SELECT status,started_at,report_json FROM seo_keyword_planner_reports WHERE market_key=?").bind(scope.key).first();
 if(!row||row.started_at<now-plannerTTL)return {status:"NOT_RUN",scope,...config};
 return {...JSON.parse(row.report_json||"{}"),status:row.status,started_at:row.started_at,...config};
}
export async function collectKeywordPlanner(db,env,input={}, {manual=false,now=Date.now(),request=fetch,pause=()=>new Promise(resolve=>setTimeout(resolve,1200))}={}){
 const scope=plannerScope(input),config=plannerConfig(env);
 // Retention enforcement even when authorization is revoked; no Google request without approval.
 await db.prepare("DELETE FROM seo_keyword_planner_reports WHERE started_at<?").bind(now-plannerTTL).run();
 if(!config.configured||!config.approved)return readKeywordPlanner(db,env,input,now);
 const lock=crypto.randomUUID(),report={scope,checked_at:new Date(now).toISOString(),sections:{}};
 const claim=await db.prepare("INSERT INTO seo_keyword_planner_reports(market_key,lock_id,started_at,status,report_json) VALUES(?,?,?,'RUNNING',?) ON CONFLICT(market_key) DO UPDATE SET lock_id=excluded.lock_id,started_at=excluded.started_at,status='RUNNING',report_json=excluded.report_json WHERE seo_keyword_planner_reports.started_at<=?").bind(scope.key,lock,now,JSON.stringify(report),now-(manual?3600000:plannerWeek)).run();
 if(claim.meta?.changes!==1)return {...await readKeywordPlanner(db,env,input,now),cooldown:true};
 let status="ERROR";
 try{
  await ensureKeywordSeeds(db);
  // Only owner-authored or built-in tourism seeds, never raw GSC query exports or guest information.
  const plans=(await db.prepare("SELECT keyword,cluster FROM seo_keyword_plans WHERE active=1 AND (?='all' OR locale=?) AND origin IN ('SEED','OWNER') ORDER BY priority,keyword LIMIT 100").bind(scope.locale,scope.locale).all()).results;
  const keywords=[...new Set(plans.map(p=>p.keyword).filter(s=>typeof s==="string"&&safeQuery(s)&&Object.values(clusters).some(re=>re.test(s))))];
  if(!keywords.length)throw Error("NO_SEEDS");
  report.requested_keywords=keywords;report.seed_limit=100;
  const token=await gscToken(env,request,now,"https://www.googleapis.com/auth/adwords");
  const common={geoTargetConstants:plannerMarkets[scope.market],...(plannerLanguages[scope.locale]?{language:plannerLanguages[scope.locale]}:{}),keywordPlanNetwork:"GOOGLE_SEARCH",includeAdultKeywords:false};
  try{report.sections.historical=parsePlannerRows(await plannerRequest(request,env,token,"generateKeywordHistoricalMetrics",{...common,keywords}),"historical",keywords);}catch(e){report.sections.historical={status:"ERROR",error:plannerError(e),rows:[]};}
  // Keyword planning has separate rate limits. Do not repeat a denied/throttled request.
  if(["AUTH","ACCESS","QUOTA"].includes(report.sections.historical.error))report.sections.ideas={status:"SKIPPED",rows:[]};
  else{
   await pause();
   try{report.sections.ideas=parsePlannerRows(await plannerRequest(request,env,token,"generateKeywordIdeas",{...common,keywordSeed:{keywords:diversePlannerSeeds(plans,keywords)},pageSize:100}),"ideas");}catch(e){report.sections.ideas={status:"ERROR",error:plannerError(e),rows:[]};}
  }
  const baseline=(await db.prepare("SELECT keyword,normalized,manual_json FROM seo_keyword_plans WHERE manual_json!='{}'").all()).results.map(p=>({...p,manual:JSON.parse(p.manual_json)}));
  report.baseline_comparison=comparePlannerBaseline(baseline,report);
  const failed=Object.values(report.sections).filter(s=>["ERROR","SKIPPED"].includes(s.status)).length;
  status=failed===0?"DONE":failed===2?"ERROR":"PARTIAL";
 }catch(e){report.error=plannerError(e);}
 await db.prepare("UPDATE seo_keyword_planner_reports SET status=?,report_json=? WHERE market_key=? AND lock_id=?").bind(status,JSON.stringify(report),scope.key,lock).run();
 return {...report,status,started_at:now,...config};
}

// Ranking actions use observed query–URL pairs only; no estimated Google rank or volume.
export function rankingOpportunities(plans,observations,previous=[]){
 const old=new Map(previous.map(o=>[o.normalized+"|"+o.path,o]));
 const pairs=[];
 for(const p of plans){
  if(!p.active||!p.target_path||/\bnusa\s*penida\s*experiences\b|nusapenidaexperiences/i.test(p.keyword))continue;
  const o=observations.find(o=>o.normalized===p.normalized&&o.path===p.target_path);
  if(!o||o.impressions<=0)continue;
  const prior=old.get(o.normalized+"|"+o.path),ctr=o.clicks/o.impressions;
  const delta=prior?{position:prior.position-o.position,clicks:o.clicks-prior.clicks,impressions:o.impressions-prior.impressions,ctr:100*(ctr-prior.clicks/prior.impressions)}:null;
  const action=o.position>10&&o.position<=30?"QUICK_WIN":o.position<=10?"PROTECT_TOP10":"BUILD_RELEVANCE";
  pairs.push({id:p.id,keyword:p.keyword,path:o.path,intent:p.intent,priority:p.priority,position:o.position,impressions:o.impressions,clicks:o.clicks,ctr:100*ctr,action,delta});
 }
 const order={QUICK_WIN:0,PROTECT_TOP10:1,BUILD_RELEVANCE:2};
 pairs.sort((a,b)=>order[a.action]-order[b.action]||Number(b.intent==="BUY")-Number(a.intent==="BUY")||a.priority-b.priority||b.impressions-a.impressions||a.position-b.position);
 return {pairs,measured:pairs.length,top3:pairs.filter(x=>x.position<=3).length,top10:pairs.filter(x=>x.position<=10).length,quickWins:pairs.filter(x=>x.action==="QUICK_WIN").length};
}
export async function listKeywords(db,env){
 const paths=await ensureKeywordSeeds(db);
 const plans=(await db.prepare("SELECT * FROM seo_keyword_plans ORDER BY active DESC,priority,locale,keyword LIMIT 500").all()).results.map(x=>({...x,manual:JSON.parse(x.manual_json),manual_json:undefined}));
 const latest=await db.prepare("SELECT * FROM seo_keyword_runs ORDER BY created_at DESC LIMIT 1").first();
 const snapshot=await db.prepare("SELECT * FROM seo_keyword_runs WHERE state='DONE' AND gsc_status IN ('MEASURED','NO_ROWS') ORDER BY created_at DESC LIMIT 1").first();
 const observations=snapshot?(await db.prepare("SELECT query,normalized,path,clicks,impressions,position FROM seo_keyword_observations WHERE run_id=? ORDER BY impressions DESC").bind(snapshot.id).all()).results:[];
 const previous=snapshot?await db.prepare("SELECT id,period_start,period_end FROM seo_keyword_runs WHERE state='DONE' AND gsc_status='MEASURED' AND period_end<? ORDER BY period_end DESC,created_at DESC LIMIT 1").bind(snapshot.period_start).first():null;
 const previousRows=previous?(await db.prepare("SELECT normalized,path,clicks,impressions,position FROM seo_keyword_observations WHERE run_id=?").bind(previous.id).all()).results:[];
 const ranking=rankingOpportunities(plans.filter(p=>paths.includes(p.target_path)),observations,previousRows);
 return {public_sources:await publicResearchStatus(db),ranking,previous:previous?{period_start:previous.period_start,period_end:previous.period_end}:null,plans,paths,latest:latest?{...latest,signals:JSON.parse(latest.signal_json),signal_json:undefined}:null,snapshot:snapshot?{period_start:snapshot.period_start,period_end:snapshot.period_end,created_at:snapshot.created_at,gsc_status:snapshot.gsc_status}:null,observations,gsc_configured:configured(env),limit:300};
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
