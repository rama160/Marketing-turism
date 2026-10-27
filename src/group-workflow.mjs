// Owner-assisted Facebook Groups prospecting: no Graph Groups API, no join/post/reply automation.
// Store only owner-written PUBLIC discussion summaries, no people identities/contacts.
const uuid=()=>crypto.randomUUID();
const cut=(s,n)=>String(s??"").replace(/\s+/g," ").trim().slice(0,n);
const HOUR=3600000, DAY=24*HOUR,MAX_AGE=48*HOUR;
const allowedDestinations=["NUSA_PENIDA","NUSA_LEMBONGAN"];
const hasIdentity=s=>/@|(?:\+?\d[\d\s()-]{8,}\d)|(?:https?:\/\/)|(?:www\.)|(?:facebook\.com\/profile)/i.test(s);
function facebookGroupUrl(raw){
 let url;try{url=new URL(String(raw||""))}catch{throw Error("Link grup Facebook tidak valid")}
 if(url.protocol!=="https:"||!["facebook.com","www.facebook.com","m.facebook.com"].includes(url.hostname)
   ||url.username||url.password||!/^(?:\/groups\/[a-zA-Z0-9_.-]+)\/?$/.test(url.pathname))throw Error("Gunakan link utama grup Facebook publik: https://www.facebook.com/groups/...");
 return "https://www.facebook.com"+url.pathname.replace(/\/$/,"")+"/";
}
function publicGroupPostUrl(raw,groupUrl){
 let url;try{url=new URL(String(raw||""))}catch{throw Error("Link postingan grup tidak valid")}
 const g=new URL(groupUrl),groupId=g.pathname.split("/")[2];
 if(url.protocol!=="https:"||!["facebook.com","www.facebook.com","m.facebook.com"].includes(url.hostname)
   ||url.username||url.password||!url.pathname.startsWith("/groups/"+groupId+"/")
   ||!/^\/groups\/[a-zA-Z0-9_.-]+\/(?:posts\/[a-zA-Z0-9_.-]+|permalink\/\d+)\/?$/.test(url.pathname))
  throw Error("Gunakan tautan postingan pada grup yang telah disimpan");
 return "https://www.facebook.com"+url.pathname.replace(/\/$/,"")+"/";
}
const titleFor=s=>cut(s,240);
export function groupOpportunityDraft({destination,summary}){
 const island=destination==="NUSA_LEMBONGAN"?"Nusa Lembongan":"Nusa Penida";
 const topic=/snorkel|manta|diving|laut|ocean/i.test(summary)?"SNORKELING":/tour|itinerary|trip|beach|mangrove|devil|dream beach|bridge/i.test(summary)?"ISLAND_TOUR":"GENERAL";
 const opening="I help guests explore "+island+" with Nusa Penida Experiences (business disclosure).";
 const practical=destination==="NUSA_LEMBONGAN"?
  "For Lembongan, consider transfers, weather and whether Dream Beach, Devil's Tear or the mangrove area fits your time. We would need to confirm a suitable local operator, the route and any price before offering a booking.":
  topic==="SNORKELING"?
  "For Nusa Penida snorkeling, check safe conditions, exact spots and confirmed operator capacity. Manta sightings are never guaranteed.":
  "For Nusa Penida, choose an East or West route and allow enough transfer time; operator availability and final pricing require confirmation.";
 return {theme:topic,score:Math.min(95,55+(/looking for|recommend|any advice|book|help|\?/i.test(summary)?25:0)+(/tomorrow|next week|minggu depan|besok/i.test(summary)?10:0)),
  suggested_reply:opening+" "+practical+" If this group permits business replies, happy to share general guidance. What dates and group size are you considering? No unsolicited DMs."};
}
export async function saveGroup(db,b){
 const name=cut(b.name,100),group_url=facebookGroupUrl(b.url),rules=cut(b.rules_note,400);
 const destination=cut(b.destination,30);
 if(name.length<5||!allowedDestinations.includes(destination))throw Error("Nama grup atau destinasi tidak valid");
 if(!rules||rules.length<12)throw Error("Catat aturan grup terlebih dahulu");
 if(hasIdentity(rules))throw Error("Catatan aturan tidak boleh memuat identitas atau tautan pribadi");
 const existing=await db.prepare("SELECT id FROM growth_facebook_groups WHERE group_url=?").bind(group_url).first();
 if(existing)return {id:existing.id,already_exists:true};
 const id=uuid();await db.prepare("INSERT INTO growth_facebook_groups(id,name,group_url,destination,rules_note) VALUES(?,?,?,?,?)")
  .bind(id,name,group_url,destination,rules).run();
 return {id,already_exists:false};
}
export async function changeGroupStatus(db,id,status){
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["RESEARCH","JOINED_MANUALLY","NO_PROMOTION","DISMISSED"].includes(status))
  throw Error("Grup/status tidak valid");
 const current=await db.prepare("SELECT id FROM growth_facebook_groups WHERE id=?").bind(id).first();
 if(!current)throw Error("Grup tidak ditemukan");
 const change=db.prepare("UPDATE growth_facebook_groups SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,id);
 // A group that disallows promotion or is archived must not leave outstanding reply drafts actionable.
 // Keep already recorded CONTACTED/RESPONDED rows for audit history; hide all questions in overview.
 let res;
 if(status==="NO_PROMOTION"||status==="DISMISSED"){
  const dismissed=db.prepare("UPDATE growth_facebook_questions SET status='DISMISSED',updated_at=CURRENT_TIMESTAMP WHERE group_id=? AND status IN ('REVIEW','SHORTLISTED')").bind(id);
  [res]=await db.batch([change,dismissed]);
 }else res=await change.run();
 return {id,status,updated:Number(res.meta?.changes||0)===1};
}
export async function addGroupQuestion(db,b,now=Date.now()){
 if(b.owner_verified_public!==true)throw Error("Pastikan sumber dari grup publik dan tanggal asli telah diperiksa");
 const groupId=cut(b.group_id,36);
 if(!/^[0-9a-f-]{36}$/i.test(groupId))throw Error("Pilih grup yang telah dicatat");
 const group=await db.prepare("SELECT group_url,destination,status FROM growth_facebook_groups WHERE id=?").bind(groupId).first();
 if(!group||group.status==="DISMISSED"||group.status==="NO_PROMOTION")throw Error("Grup tidak siap ditinjau");
 const source_url=publicGroupPostUrl(b.url,group.group_url);
 const summary=titleFor(b.summary);
 if(summary.length<18||summary.length>240||hasIdentity(summary))throw Error("Tulis ringkasan pertanyaan tanpa nama, nomor, email, akun atau tautan");
 const ts=Date.parse(String(b.published_at||""));
 if(!Number.isFinite(ts)||ts>now+300000||now-ts>MAX_AGE)throw Error("Postingan lebih dari 48 jam, tidak bertanggal, atau tanggal tidak valid");
 const midnight=Math.floor((ts+8*HOUR)/DAY)*DAY-8*HOUR;
 const cutoff=/\b(tomorrow|besok|esok)\b/i.test(summary)?midnight+DAY*2-1000:
  /\b(today|tonight)\b|hari ini/i.test(summary)?midnight+DAY-1000:Infinity;
 const expiry=Math.min(ts+MAX_AGE,cutoff);
 if(expiry<=now)throw Error("Tanggal kebutuhan wisata sudah berlalu");
 const draft=groupOpportunityDraft({destination:group.destination,summary});
 const existing=await db.prepare("SELECT id FROM growth_facebook_questions WHERE source_url=?").bind(source_url).first();
 if(existing)return {id:existing.id,already_exists:true};
 const id=uuid();
 await db.prepare("INSERT INTO growth_facebook_questions(id,group_id,source_url,headline,destination,theme,score,suggested_reply,published_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?)")
  .bind(id,groupId,source_url,summary,group.destination,draft.theme,draft.score,draft.suggested_reply,
   new Date(ts).toISOString().replace("T"," ").slice(0,19),new Date(expiry).toISOString().replace("T"," ").slice(0,19)).run();
 return {id,already_exists:false};
}
export async function groupOverview(db){
 const [groups,questions]=await Promise.all([
  db.prepare("SELECT id,name,group_url,destination,rules_note,status,created_at FROM growth_facebook_groups WHERE status!='DISMISSED' ORDER BY created_at DESC LIMIT 50").all(),
  db.prepare("SELECT q.id,q.group_id,q.source_url,q.headline,q.destination,q.theme,q.score,q.suggested_reply,q.status,q.published_at,q.expires_at,q.created_at AS discovered_at,CAST((julianday('now')-julianday(q.published_at))*24 AS INTEGER) AS age_hours FROM growth_facebook_questions q JOIN growth_facebook_groups g ON g.id=q.group_id WHERE q.expires_at>datetime('now') AND q.status!='DISMISSED' AND g.status NOT IN ('NO_PROMOTION','DISMISSED') ORDER BY q.score DESC,q.created_at DESC LIMIT 50").all()
 ]);
 return {groups:groups.results,opportunities:questions.results.map(x=>({...x,source:"FACEBOOK_GROUP_MANUAL"}))};
}
export async function progressGroupQuestion(db,id,status){
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["REVIEW","SHORTLISTED","CONTACTED","RESPONDED","DISMISSED"].includes(status))return null;
 const row=await db.prepare("SELECT q.id FROM growth_facebook_questions q JOIN growth_facebook_groups g ON g.id=q.group_id WHERE q.id=? AND q.expires_at>datetime('now') AND q.status!='DISMISSED' AND g.status NOT IN ('NO_PROMOTION','DISMISSED')").bind(id).first();
 if(!row)return null;
 const r=await db.prepare("UPDATE growth_facebook_questions SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,id).run();
 return {id,status,updated:Number(r.meta?.changes||0)===1};
}
