// Consent-first customer acquisition: public travel questions -> helpful draft -> owner action.
import {scanAdditionalNetworks,additionalNetworkOpportunities,progressNetworkOpportunity} from "./growth-platforms.mjs";
// Never joins groups, scrapes private lists or sends unsolicited messages. No social writes.
const uuid=()=>crypto.randomUUID();
const text=s=>String(s??"").replace(/<[^>]*>/g," ").replace(/&(?:amp|quot|apos|lt|gt|#39|nbsp);/g," ").replace(/\s+/g," ").trim();
const escapeXml=s=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1");
const topics=/\b(nusa penida|penida|manta|snorkel|bali itinerary|day trip|bali trip|boat to bali|fast boat)\b/i;
const commercial=/\b(sell|for sale|promo|discount|coupon|cheap followers|crypto|adult|bitcoin|affiliate)\b/i;
const question=/\?|recommend|advice|help|how to|where|looking for|worth visiting|tips|itinerary|plan|transport|boat|snorkel|guide|travel/i;
const cleanHeading=s=>text(escapeXml(s)).slice(0,240);
const nowDay=()=>new Date(Date.now()+8*3600000).toISOString().slice(0,10);
const HOUR=3600000, DAY=24*HOUR, MAX_REDDIT_AGE=48*HOUR;
// Use original publication time, never the feed's updated/ingestion time.
function freshPublicQuestion(entry,nowMs){
 const stamp=entry.match(/<published(?:\s[^>]*)?>([^<]+)<\/published>/i)?.[1]||
  entry.match(/<pubDate(?:\s[^>]*)?>([^<]+)<\/pubDate>/i)?.[1];
 const published=Date.parse(stamp||"");
 if(!Number.isFinite(published)||published>nowMs+5*60000||nowMs-published>MAX_REDDIT_AGE)return null;
 const words=escapeXml(entry).replace(/<[^>]+>/g," ").slice(0,14000);
 const baliMidnight=Math.floor((published+8*HOUR)/DAY)*DAY-8*HOUR;
 const cutoff=/\b(tomorrow|esok)\b/i.test(words)?baliMidnight+2*DAY-1000:
  /\b(today|tonight)\b|hari ini/i.test(words)?baliMidnight+DAY-1000:Infinity;
 const expires=Math.min(published+MAX_REDDIT_AGE,cutoff);
 if(expires<=nowMs)return null;
 const ageHours=Math.max(0,Math.floor((nowMs-published)/HOUR));
 return {published_at:new Date(published).toISOString().replace("T"," ").slice(0,19),
  expires_at:new Date(expires).toISOString().replace("T"," ").slice(0,19),
  age_hours:ageHours,urgency:ageHours<6?"HIGH":ageHours<24?"ACTIVE":"VERIFY"};
}
const urlSafe=url=>{try{const u=new URL(url);return u.protocol==="https:"&&u.hostname==="www.reddit.com"&&/^\/r\/[a-z0-9_]+\/comments\/[a-z0-9]+\/?/i.test(u.pathname)?u.toString():null}catch{return null}};
const hubs=Object.freeze([
 {name:"Facebook Groups: Bali travel",network:"Facebook",type:"MANUAL_SEARCH",
  url:"https://www.facebook.com/search/groups/?q=bali%20travel",description:"Temukan komunitas publik, baca aturan; bergabung dan berkontribusi secara manual"},
 {name:"Facebook Groups: Nusa Penida",network:"Facebook",type:"MANUAL_SEARCH",
  url:"https://www.facebook.com/search/groups/?q=nusa%20penida",description:"Periksa aturan promosi dan relevansi sebelum berinteraksi"},
 {name:"Hotel, hostel, villa Nusa Penida",network:"Google Maps",type:"PARTNER_RESEARCH",
  url:"https://www.google.com/maps/search/?api=1&query=Nusa+Penida+hotel+hostel+villa",description:"Temukan calon mitra B2B; kontak hanya pada kanal bisnis yang tersedia dan sesuai aturan"},
 {name:"Reddit: pertanyaan Nusa Penida",network:"Reddit",type:"MANUAL_SEARCH",
  url:"https://www.reddit.com/r/bali/search/?q=nusa%20penida&restrict_sr=1&sort=new",description:"Tinjau pertanyaan publik, hormati larangan promosi dan aturan subreddit"},
 {name:"Instagram: unggahan Nusa Penida",network:"Instagram",type:"MANUAL_SEARCH",
  url:"https://www.instagram.com/explore/tags/nusapenida/",description:"Tinjau percakapan dan lokasi publik secara manual; API bisnis hanya membaca aset yang diizinkan"},
 {name:"TikTok: pencarian Nusa Penida",network:"TikTok",type:"MANUAL_SEARCH",
  url:"https://www.tiktok.com/search?q=nusa%20penida",description:"Cari pertanyaan tentang itinerary; tidak ada pengambilan akun pribadi atau API riset komersial otomatis"},
 {name:"YouTube: wisata Nusa Penida",network:"YouTube",type:"MANUAL_SEARCH",
  url:"https://www.youtube.com/results?search_query=Nusa+Penida+travel+advice",description:"Cari video dan komentar publik yang relevan, bukan bukti otomatis calon booking"},
 {name:"Threads: percakapan wisata",network:"Threads",type:"MANUAL_SEARCH",
  url:"https://www.threads.com/search?q=nusa%20penida",description:"Riset manual percakapan yang tersedia publik; akses API mengikuti izin platform"},
 {name:"X: pertanyaan wisata terbaru",network:"X",type:"MANUAL_SEARCH",
  url:"https://x.com/search?q=nusa%20penida&f=live",description:"Periksa pertanyaan wisata terbaru, tanpa scraping atau DM massal"},
 {name:"Tripadvisor: forum Bali",network:"Tripadvisor",type:"MANUAL_SEARCH",
  url:"https://www.tripadvisor.com/Search?q=Nusa%20Penida",description:"Periksa forum dan ulasan untuk memahami kebutuhan wisata, tanpa menyalin data pribadi"},
 {name:"Bluesky: pencarian Nusa Penida",network:"Bluesky",type:"MANUAL_SEARCH",
  url:"https://bsky.app/search?q=nusa%20penida",description:"Pelengkap penelusuran otomatis melalui pencarian publik resmi"}
]);
export const growthHubs=()=>hubs;
function validTitle(title){return title.length>=10&&title.length<=240&&topics.test(title)&&question.test(title)&&!commercial.test(title);}
function scoring(title){
 const s=title.toLowerCase();
 let score=35;
 if(/nusa penida/.test(s))score+=30;
 if(/snorkel|manta|tour|itinerary|day trip|fast boat/.test(s))score+=15;
 if(/recommend|help|advice|how|where|looking for|\?/.test(s))score+=15;
 return Math.min(100,score);
}
function themeOf(title){
 if(/snorkel|manta|underwater/i.test(title))return "SNORKELING";
 if(/island tour|day trip|itinerary|beach|kelingking|diamond beach|transport/i.test(title))return "ISLAND_TOUR";
 return "GENERAL";
}
function answer(theme,source){
 const tag="I help visitors plan Nusa Penida trips with Nusa Penida Experiences (disclosure).";
 if(source==="OWNER_PARTNER")return "Hello, I coordinate Nusa Penida Experiences with local tour and snorkeling operators. Would a mutually agreed referral arrangement be useful for your guests? We can share itinerary options; pricing, safety, and capacity are confirmed before any booking. No obligation to partner.";
 return (theme==="SNORKELING"?
  "For snorkeling, choose sharing vs private based on group size; check ocean conditions, boat safety, operator capacity and exact stops in advance. Wild manta sightings cannot be guaranteed.":
  theme==="ISLAND_TOUR"?
  "For an island trip, West (Kelingking / Broken Beach) and East (Diamond / Atuh) routes are different. Check travel time, road conditions and whether one side fits your schedule before booking.":
  "For Nusa Penida, check the fast-boat route, realistic island travel time, weather and verified local operator availability before committing to a full itinerary.")+
  " "+tag+" If the community allows business suggestions and you want help, I can answer specific questions about dates or group size. No unsolicited DM.";
}
export function extractPublicQuestions(xml,source="REDDIT_PUBLIC_RSS",nowMs=Date.now()){
 if(typeof xml!=="string"||xml.length>300000||!Number.isFinite(nowMs))return [];
 const result=[];
 for(const entry of xml.match(/<entry\b[^>]*>[\s\S]*?<\/entry>/gi)||[]){
  const title=cleanHeading(entry.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i)?.[1]||"");
  const link=urlSafe(entry.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1]||"");
  if(!link||!validTitle(title))continue;
  const freshness=freshPublicQuestion(entry,nowMs);
  if(!freshness)continue;
  const theme=themeOf(title);
  result.push({id:uuid(),source,source_url:link,headline:title,theme,
   score:Math.min(100,scoring(title)+(freshness.urgency==="HIGH"?12:freshness.urgency==="ACTIVE"?6:0)),
   suggested_reply:answer(theme,source),...freshness});
  if(result.length>=12)break;
 }
 return result;
}
// Reddit RSS is a best-effort PUBLIC source only; this source may be retired or rate-limited.
// We do not bypass authentication, read personal info, or automatically comment.
const feeds=[
 "https://www.reddit.com/r/bali/search.rss?q=nusa%20penida&restrict_sr=on&sort=new&t=week",
 "https://www.reddit.com/r/travel/search.rss?q=nusa%20penida&restrict_sr=on&sort=new&t=week"
];
export function extractOpenBusinesses(json){
 const elements=Array.isArray(json?.elements)?json.elements:[];
 const result=[];
 for(const e of elements.slice(0,50)){
  if(!["node","way","relation"].includes(e?.type)||!Number.isSafeInteger(e.id)||e.id<=0)continue;
  const tags=e.tags||{},kind=String(tags.tourism||"");
  if(!["hotel","guest_house","hostel","resort"].includes(kind))continue;
  const name=cleanHeading(tags.name||"");
  if(name.length<5||name.length>110)continue;
  const link="https://www.openstreetmap.org/"+e.type+"/"+e.id;
  result.push({id:uuid(),source:"OSM_PUBLIC_BUSINESSES",source_url:link,
   headline:"Calon mitra akomodasi: "+name,theme:"PARTNERSHIP",score:65,
   suggested_reply:answer("PARTNERSHIP","OWNER_PARTNER")});
  if(result.length>=15)break;
 }
 return result;
}
async function discoverOpenAccommodation(db,request=fetch){
 const query='[out:json][timeout:12];nwr["tourism"~"^(hotel|guest_house|hostel|resort)$"](-8.84,115.42,-8.65,115.63);out center 45;';
 const url="https://overpass-api.de/api/interpreter";
 let working=false,discovered=0;
 try{
  const res=await request(url,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded","accept":"application/json",
   "user-agent":"NusaPenidaExperiences/1.0 (public OSM partnership research)"},
   body:"data="+encodeURIComponent(query),signal:AbortSignal.timeout(8500)});
  if(res.ok){
   const json=await res.json();
   if(Array.isArray(json.elements)){
    working=true;
    for(const item of extractOpenBusinesses(json)){
     const out=await db.prepare("INSERT OR IGNORE INTO growth_opportunities(id,source,source_url,headline,theme,score,suggested_reply) VALUES(?,?,?,?,?,?,?)")
      .bind(item.id,item.source,item.source_url,item.headline,item.theme,item.score,item.suggested_reply).run();
     discovered+=Number(out.meta?.changes||0);
    }
   }
  }
 }catch(_){}
 return {status:discovered>0?"FOUND":working?"NO_MATCH":"SOURCE_UNAVAILABLE",discovered};
}
export async function researchBuyerQuestions(db,env,request=fetch){
 if(env.GROWTH_PUBLIC_RESEARCH_ENABLED==="false")return {status:"DISABLED",discovered:0};
 const old=await db.prepare("SELECT source FROM growth_discovery_runs WHERE (source='REDDIT_PUBLIC_RSS' AND created_at>=datetime('now','-2 hours')) OR (source='OSM_PUBLIC_BUSINESSES' AND created_at>=datetime('now','-7 days'))").all();
 const done=new Set(old.results.map(x=>x.source));
 // All channels have independent cooldowns. Reddit/OSM being recent must not block new networks.
 const details=[];
 let total=0;
 if(!done.has("REDDIT_PUBLIC_RSS")){
  let discovered=0,working=0;
  for(const url of feeds){
   try{
    const response=await request(url,{method:"GET",headers:{accept:"application/atom+xml,application/rss+xml","user-agent":"NusaPenidaExperiences/1.0 (+https://marketing-turism-agent.finchat-ai-gateway.workers.dev/)"},
     signal:AbortSignal.timeout(4500)});
    if(!response.ok)continue;
    const type=response.headers.get("content-type")||"";
    if(!/xml|rss|atom/i.test(type))continue;
    const body=await response.text();working++;
    for(const item of extractPublicQuestions(body)){
     const r=await db.prepare("INSERT OR IGNORE INTO growth_opportunities(id,source,source_url,headline,theme,score,suggested_reply) VALUES(?,?,?,?,?,?,?)")
      .bind(item.id,item.source,item.source_url,item.headline,item.theme,item.score,item.suggested_reply).run();
     discovered+=Number(r.meta?.changes||0);
     await db.prepare("INSERT OR REPLACE INTO growth_publication_meta(source_url,published_at,expires_at) VALUES(?,?,?)")
      .bind(item.source_url,item.published_at,item.expires_at).run();
     if(discovered>=12)break;
    }
   }catch(_){}
   if(discovered>=12)break;
  }
  const status=discovered>0?"FOUND":working>0?"NO_MATCH":"SOURCE_UNAVAILABLE";
  await db.prepare("INSERT INTO growth_discovery_runs(id,source,result,candidates) VALUES(?,'REDDIT_PUBLIC_RSS',?,?)")
   .bind(uuid(),status,discovered).run();
  details.push({source:"REDDIT_PUBLIC_RSS",status,discovered});total+=discovered;
 }
 if(!done.has("OSM_PUBLIC_BUSINESSES")){
  const found=await discoverOpenAccommodation(db,request);
  await db.prepare("INSERT INTO growth_discovery_runs(id,source,result,candidates) VALUES(?,'OSM_PUBLIC_BUSINESSES',?,?)")
   .bind(uuid(),found.status,found.discovered).run();
  details.push({source:"OSM_PUBLIC_BUSINESSES",...found});total+=found.discovered;
 }
 const networks=await scanAdditionalNetworks(db,env,request);
 details.push(...networks);
 total+=networks.reduce((sum,x)=>sum+x.discovered,0);
 await db.batch([
  db.prepare("UPDATE growth_opportunities SET status='DISMISSED',updated_at=CURRENT_TIMESTAMP WHERE source='REDDIT_PUBLIC_RSS' AND status IN ('REVIEW','SHORTLISTED') AND NOT EXISTS (SELECT 1 FROM growth_publication_meta m WHERE m.source_url=growth_opportunities.source_url AND m.expires_at>datetime('now'))"),
  db.prepare("DELETE FROM growth_opportunities WHERE status IN ('REVIEW','DISMISSED') AND discovered_at<datetime('now','-30 days')"),
  db.prepare("DELETE FROM growth_publication_meta WHERE expires_at<datetime('now','-90 days')"),
  db.prepare("DELETE FROM growth_click_daily WHERE day<date('now','-90 days')")
 ]);
 return {status:details.length===0?"RECENTLY_SCANNED":total>0?"FOUND":details.some(x=>x.status==="NO_MATCH")?"NO_MATCH":"SOURCE_UNAVAILABLE",
  discovered:total,sources:details};
}
export async function growthOverview(db){
 const [opps,clicks,count,scans,bookings,additional]=await Promise.all([
  db.prepare("SELECT g.id,g.source,g.source_url,g.headline,g.theme,g.score,g.suggested_reply,g.status,g.discovered_at,m.published_at,m.expires_at,CAST((julianday('now')-julianday(m.published_at))*24 AS INTEGER) AS age_hours FROM growth_opportunities g LEFT JOIN growth_publication_meta m ON m.source_url=g.source_url WHERE g.discovered_at>=datetime('now','-60 days') AND g.status!='DISMISSED' AND (g.source!='REDDIT_PUBLIC_RSS' OR (m.published_at IS NOT NULL AND m.expires_at>datetime('now'))) ORDER BY CASE g.status WHEN 'REVIEW' THEN 0 WHEN 'SHORTLISTED' THEN 1 WHEN 'CONTACTED' THEN 2 ELSE 3 END,g.score DESC,g.discovered_at DESC LIMIT 60").all(),
  db.prepare("SELECT day,source,landing,count FROM growth_click_daily WHERE day>=date('now','-30 days') ORDER BY day DESC,count DESC LIMIT 120").all(),
  db.prepare("SELECT COUNT(*) AS n FROM leads").first(),
  db.prepare("SELECT source,result,candidates,created_at FROM growth_discovery_runs ORDER BY created_at DESC LIMIT 8").all(),
  db.prepare("SELECT COUNT(*) AS n FROM bookings").first(),
  additionalNetworkOpportunities(db)
 ]);
 const priority=s=>({REVIEW:0,SHORTLISTED:1,CONTACTED:2,RESPONDED:3}[s]??4);
 const all=[...opps.results,...additional].sort((a,b)=>priority(a.status)-priority(b.status)||b.score-a.score).slice(0,80);
 return {opportunities:all,clicks:clicks.results,click_count_30d:clicks.results.reduce((sum,x)=>sum+x.count,0),
  leads:count.n,bookings:bookings.n,research:scans.results,hubs:growthHubs(),
  limits:"Only public Bluesky posts, authorised owned Meta comments, official optional YouTube video metadata and existing Reddit/OSM; no automatic joining, mass DMs, Facebook Group posts, or scraping member identities."};
}
export async function progressOpportunity(db,id,status){
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["REVIEW","SHORTLISTED","CONTACTED","RESPONDED","DISMISSED"].includes(status))throw Error("Invalid opportunity or state");
 const op=await db.prepare("SELECT status FROM growth_opportunities WHERE id=?").bind(id).first();
 if(!op){
  const network=await progressNetworkOpportunity(db,id,status);
  if(network)return network;
  throw Error("Peluang tidak ditemukan");
 }
 const r=await db.prepare("UPDATE growth_opportunities SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,id).run();
 return {id,status,updated:Number(r.meta?.changes||0)===1};
}
export async function addPartnerOpportunity(db,b){
 const title=text(b.title).slice(0,180);
 if(title.length<10)throw Error("Nama calon mitra minimal 10 karakter");
 let url;try{url=new URL(String(b.url||""))}catch{throw Error("URL bisnis tidak valid")}
 if(url.protocol!=="https:"||url.username||url.password||url.hostname.length<5)throw Error("Harus alamat HTTPS publik");
 if(/(^|\.)(localhost|local|invalid)$/.test(url.hostname)||/^\d+(?:\.\d+){3}$/.test(url.hostname))throw Error("Gunakan alamat bisnis publik");
 url.hash="";const source_url=url.toString().slice(0,600);
 const id=uuid();
 await db.prepare("INSERT INTO growth_opportunities(id,source,source_url,headline,theme,score,suggested_reply) VALUES(?,'OWNER_PARTNER',? ,?,'PARTNERSHIP',60,?)")
  .bind(id,source_url,title,answer("PARTNERSHIP","OWNER_PARTNER")).run();
 return {id,status:"REVIEW"};
}
export async function recordChatIntent(request,db){
 const origin=request.headers.get("origin")||"";
 const site=new URL(request.url).origin;
 const referer=request.headers.get("referer")||"";
 const fetchSite=request.headers.get("sec-fetch-site")||"";
 let refererMatches=false;
 try{refererMatches=new URL(referer).origin===site}catch(_){}
 if(origin?origin!==site:!refererMatches&&fetchSite!=="same-origin")
  return {status:403,data:{error:"Same-origin event required"}};
 const len=Number(request.headers.get("content-length")||0);
 if(len>400)return {status:413,data:{error:"Event terlalu besar"}};
 let body;try{body=await request.json()}catch{return {status:400,data:{error:"JSON tidak valid"}}}
 if(body?.kind!=="WHATSAPP")return {status:400,data:{error:"Event tidak dikenal"}};
 const safe=s=>String(s??"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,32);
 const source=safe(body.source)||"direct";
 const landing=safe(body.landing)||"homepage";
 await db.prepare("INSERT INTO growth_click_daily(day,kind,source,landing,count) VALUES(?,'WHATSAPP',?,?,1) ON CONFLICT(day,kind,source,landing) DO UPDATE SET count=MIN(20000,count+1)")
  .bind(nowDay(),source,landing).run();
 return {status:202,data:{accepted:true,meaning:"CLICK_INTENT_NOT_CONFIRMED_CONVERSATION"}};
}
