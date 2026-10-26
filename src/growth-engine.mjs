// Consent-first customer acquisition: public travel questions -> helpful draft -> owner action.
// Never joins groups, scrapes private lists or sends unsolicited messages. No social writes.
const uuid=()=>crypto.randomUUID();
const text=s=>String(s??"").replace(/<[^>]*>/g," ").replace(/&(?:amp|quot|apos|lt|gt|#39|nbsp);/g," ").replace(/\s+/g," ").trim();
const escapeXml=s=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1");
const topics=/\b(nusa penida|penida|manta|snorkel|bali itinerary|day trip|bali trip|boat to bali|fast boat)\b/i;
const commercial=/\b(sell|for sale|promo|discount|coupon|cheap followers|crypto|adult|bitcoin|affiliate)\b/i;
const question=/\?|recommend|advice|help|how to|where|looking for|worth visiting|tips|itinerary|plan|transport|boat|snorkel|guide|travel/i;
const cleanHeading=s=>text(escapeXml(s)).slice(0,240);
const nowDay=()=>new Date(Date.now()+8*3600000).toISOString().slice(0,10);
const urlSafe=url=>{try{const u=new URL(url);return u.protocol==="https:"&&u.hostname==="www.reddit.com"&&/^\/r\/[a-z0-9_]+\/comments\/[a-z0-9]+\/?/i.test(u.pathname)?u.toString():null}catch{return null}};
const hubs=Object.freeze([
 {name:"Facebook Groups: Bali travel",network:"Facebook",type:"MANUAL_SEARCH",
  url:"https://www.facebook.com/search/groups/?q=bali%20travel",description:"Temukan komunitas publik, baca aturan; bergabung dan berkontribusi secara manual"},
 {name:"Facebook Groups: Nusa Penida",network:"Facebook",type:"MANUAL_SEARCH",
  url:"https://www.facebook.com/search/groups/?q=nusa%20penida",description:"Periksa aturan promosi dan relevansi sebelum berinteraksi"},
 {name:"Hotel, hostel, villa Nusa Penida",network:"Google Maps",type:"PARTNER_RESEARCH",
  url:"https://www.google.com/maps/search/?api=1&query=Nusa+Penida+hotel+hostel+villa",description:"Temukan calon mitra B2B; kontak hanya pada kanal bisnis yang tersedia dan sesuai aturan"},
 {name:"Reddit: pertanyaan Nusa Penida",network:"Reddit",type:"MANUAL_SEARCH",
  url:"https://www.reddit.com/r/bali/search/?q=nusa%20penida&restrict_sr=1&sort=new",description:"Tinjau pertanyaan publik, hormati larangan promosi dan aturan subreddit"}
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
export function extractPublicQuestions(xml,source="REDDIT_PUBLIC_RSS"){
 if(typeof xml!=="string"||xml.length>300000)return [];
 const result=[];
 for(const entry of xml.match(/<entry\b[^>]*>[\s\S]*?<\/entry>/gi)||[]){
  const title=cleanHeading(entry.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i)?.[1]||"");
  const link=urlSafe(entry.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1]||"");
  if(!link||!validTitle(title))continue;
  const theme=themeOf(title);
  result.push({id:uuid(),source,source_url:link,headline:title,theme,score:scoring(title),suggested_reply:answer(theme,source)});
  if(result.length>=12)break;
 }
 return result;
}
// Reddit RSS is a best-effort PUBLIC source only; this source may be retired or rate-limited.
// We do not bypass authentication, read personal info, or automatically comment.
const feeds=[
 "https://www.reddit.com/r/bali/search.rss?q=nusa%20penida&restrict_sr=on&sort=new&t=month",
 "https://www.reddit.com/r/travel/search.rss?q=nusa%20penida&restrict_sr=on&sort=new&t=month"
];
export async function researchBuyerQuestions(db,env,request=fetch){
 if(env.GROWTH_PUBLIC_RESEARCH_ENABLED==="false")return {status:"DISABLED",discovered:0};
 const today=nowDay();
 const prior=await db.prepare("SELECT id FROM growth_discovery_runs WHERE source='REDDIT_PUBLIC_RSS' AND substr(created_at,1,10)=? LIMIT 1").bind(today).first();
 if(prior)return {status:"ALREADY_SCANNED_TODAY",discovered:0};
 let discovered=0,working=0;
 for(const url of feeds){
  try{
   const response=await request(url,{method:"GET",headers:{accept:"application/atom+xml,application/rss+xml","user-agent":"NusaPenidaExperiences/1.0 (+https://marketing-turism-agent.finchat-ai-gateway.workers.dev/)"},
    signal:AbortSignal.timeout(7000)});
   if(!response.ok)continue;
   const type=response.headers.get("content-type")||"";
   if(!/xml|rss|atom/i.test(type))continue;
   const body=await response.text();
   working++;
   for(const item of extractPublicQuestions(body)){
    const r=await db.prepare("INSERT OR IGNORE INTO growth_opportunities(id,source,source_url,headline,theme,score,suggested_reply) VALUES(?,?,?,?,?,?,?)")
      .bind(item.id,item.source,item.source_url,item.headline,item.theme,item.score,item.suggested_reply).run();
    discovered+=Number(r.meta?.changes||0);
    if(discovered>=12)break;
   }
  }catch(_){/* source may be unavailable, no claims of actual discovery */}
  if(discovered>=12)break;
 }
 const status=discovered>0?"FOUND":working>0?"NO_MATCH":"SOURCE_UNAVAILABLE";
 await db.batch([
  db.prepare("INSERT INTO growth_discovery_runs(id,source,result,candidates) VALUES(?,'REDDIT_PUBLIC_RSS',?,?)").bind(uuid(),status,discovered),
  db.prepare("DELETE FROM growth_opportunities WHERE status IN ('REVIEW','DISMISSED') AND discovered_at<datetime('now','-30 days')"),
  db.prepare("DELETE FROM growth_click_daily WHERE day<date('now','-90 days')")
 ]);
 return {status,discovered};
}
export async function growthOverview(db){
 const [opps,clicks,count,scans,bookings]=await Promise.all([
  db.prepare("SELECT id,source,source_url,headline,theme,score,suggested_reply,status,discovered_at FROM growth_opportunities WHERE discovered_at>=datetime('now','-60 days') AND status!='DISMISSED' ORDER BY CASE status WHEN 'REVIEW' THEN 0 WHEN 'SHORTLISTED' THEN 1 WHEN 'CONTACTED' THEN 2 ELSE 3 END,score DESC,discovered_at DESC LIMIT 60").all(),
  db.prepare("SELECT day,source,landing,count FROM growth_click_daily WHERE day>=date('now','-30 days') ORDER BY day DESC,count DESC LIMIT 120").all(),
  db.prepare("SELECT COUNT(*) AS n FROM leads").first(),
  db.prepare("SELECT source,result,candidates,created_at FROM growth_discovery_runs ORDER BY created_at DESC LIMIT 8").all(),
  db.prepare("SELECT COUNT(*) AS n FROM bookings").first()
 ]);
 return {opportunities:opps.results,clicks:clicks.results,click_count_30d:clicks.results.reduce((sum,x)=>sum+x.count,0),
  leads:count.n,bookings:bookings.n,research:scans.results,hubs:growthHubs(),
  limits:"No automatic joining, mass DM, Facebook Group posts, or scraping member identities. Owner manually reviews public opportunities."};
}
export async function progressOpportunity(db,id,status){
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["REVIEW","SHORTLISTED","CONTACTED","RESPONDED","DISMISSED"].includes(status))throw Error("Invalid opportunity or state");
 const op=await db.prepare("SELECT status FROM growth_opportunities WHERE id=?").bind(id).first();
 if(!op)throw Error("Peluang tidak ditemukan");
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
