// Autonomous photo research for OWNER-REVIEW drafts. Never searches Google/social images.
// Commons imageinfo metadata is necessary but not enough to prove exact spot or subject rights:
// always show photo, provenance, and license before explicit owner approval.
const root="https://marketing-turism-agent.finchat-ai-gateway.workers.dev";
const key=id=>"research-photo/v1/"+id;
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i;
const genres=new Set(["ISLAND_TOUR_CAR","SNORKELING_3_SPOTS"]);
const topics=Object.freeze({
 "kelingking":{activity_id:"ISLAND_TOUR_CAR",name:"Kelingking",search:"Kelingking Beach Nusa Penida"},
 "diamond":{activity_id:"ISLAND_TOUR_CAR",name:"Diamond Beach",search:"Diamond Beach Nusa Penida"},
 "broken":{activity_id:"ISLAND_TOUR_CAR",name:"Broken Beach",search:"Broken Beach Nusa Penida"},
 "crystal":{activity_id:"ISLAND_TOUR_CAR",name:"Crystal Bay",search:"Crystal Bay Nusa Penida"},
 "atuh":{activity_id:"ISLAND_TOUR_CAR",name:"Atuh Beach",search:"Atuh Beach Nusa Penida"},
 "manta":{activity_id:"SNORKELING_3_SPOTS",name:"Manta",search:"Manta Nusa Penida"},
 "snorkeling":{activity_id:"SNORKELING_3_SPOTS",name:"Snorkeling",search:"Snorkeling Nusa Penida"}
});
export const isResearchSlug=x=>typeof x==="string"&&/^research-[0-9a-f-]{36}$/i.test(x)&&uuidPattern.test(x.slice(9));
function cleanText(value,max=160){
 return String(value||"").replace(/<[^>]*>/g," ").replace(/&(?:nbsp|amp|quot|lt|gt);/g," ").replace(/\s+/g," ").trim().slice(0,max);
}
export function topicForCampaign(activity,caption){
 if(!genres.has(activity))throw Error("Unrecognized campaign activity");
 const body=String(caption||"").toLowerCase();
 if(activity==="SNORKELING_3_SPOTS")return /manta/.test(body)?"manta":"snorkeling";
 if(/diamond|east|timur/.test(body))return "diamond";
 if(/broken/.test(body))return "broken";
 if(/crystal/.test(body))return "crystal";
 if(/atuh/.test(body))return "atuh";
 return "kelingking";
}
export function validCommonsCandidate(page,topic){
 const info=page?.imageinfo?.[0],meta=info?.extmetadata;
 if(!info||!meta||!topics[topic]||info.mime!=="image/jpeg")return null;
 const title=String(page.title||"");
 const lower=title.toLowerCase();
 const keyword=topics[topic].name.toLowerCase().split(" ")[0];
 if(!/^File:/i.test(title)||!lower.includes("penida")||!lower.includes(keyword))return null;
 const license=cleanText(meta.LicenseShortName?.value,40);
 if(!["CC BY 4.0","CC BY-SA 4.0","CC0"].includes(license))return null;
 const author=cleanText(meta.Artist?.value||meta.Credit?.value,170);
 if(author.length<3)return null;
 const licenseUrl=String(meta.LicenseUrl?.value||"");
 const canonical=license==="CC0"?"https://creativecommons.org/publicdomain/zero/1.0/":
  "https://creativecommons.org/licenses/"+(license==="CC BY 4.0"?"by":"by-sa")+"/4.0/";
 if(licenseUrl&&licenseUrl!==canonical)return null;
 const source="https://commons.wikimedia.org/wiki/"+encodeURIComponent(title.replace(/ /g,"_"));
 const photoUrl=info.thumburl||info.url;
 try{
  const u=new URL(photoUrl);
  if(u.protocol!=="https:"||u.hostname!=="upload.wikimedia.org")return null;
 }catch{return null;}
 return {title:cleanText(title.replace(/^File:/i,""),140),topic,activity_id:topics[topic].activity_id,author,license,
  license_url:canonical,source_url:source,source_file_url:photoUrl};
}
export function photoResearchEnabled(env){return env.MARKETING_PHOTO_RESEARCH_ENABLED!=="false";}
const photoResult=r=>({
 slug:"research-"+r.id,photo_id:r.id,title:r.title,alt:r.title,topic:r.topic,activity_id:r.activity_id,
 url:"/photos/research/"+r.id,credit:r.author,license:r.license,license_url:r.license_url,
 source:r.source_url,owner_supplied:false,research_discovered:true,is_illustrative:false,
 needs_owner_visual_review:true,created_at:r.created_at
});
export async function resolveResearchPhoto(db,id){
 if(!uuidPattern.test(id||""))throw Error("Foto riset tidak ditemukan");
 const r=await db.prepare("SELECT * FROM researched_photo_library WHERE id=?").bind(id).first();
 if(!r)throw Error("Foto riset tidak ditemukan");
 return photoResult(r);
}
export async function serveResearchPhoto(request,env,db){
 const id=new URL(request.url).pathname.slice("/photos/research/".length);
 if(!uuidPattern.test(id)||!["GET","HEAD"].includes(request.method))return new Response("Not found",{status:404});
 const row=await db.prepare("SELECT id FROM researched_photo_library WHERE id=?").bind(id).first();
 if(!row)return new Response("Not found",{status:404});
 let data;try{data=await env.PHOTO_KV?.get(key(id),"arrayBuffer")}catch{}
 const jpeg=data?new Uint8Array(data):null;
 if(!jpeg||jpeg.length<10000||jpeg[0]!==255||jpeg[1]!==216||jpeg.at(-1)!==217)return new Response("Image unavailable",{status:503});
 return new Response(request.method==="HEAD"?null:jpeg,{status:200,headers:{"content-type":"image/jpeg","cache-control":"public, max-age=3600","x-content-type-options":"nosniff",
  "cross-origin-resource-policy":"cross-origin"}});
}
async function safeFetchBytes(url,request){
 const result=await request(url,{headers:{"accept":"image/jpeg","user-agent":"NusaPenidaExperiencesMarketingAgent/1.0 (Wikimedia licensed image research; https://marketing-turism-agent.finchat-ai-gateway.workers.dev/)"},
  signal:AbortSignal.timeout(9000)});
 if(!result.ok||!/^image\/jpeg/i.test(result.headers.get("content-type")||""))throw Error("image-unavailable");
 if(Number(result.headers.get("content-length")||0)>850000)throw Error("image-too-big");
 if(!result.body){const b=new Uint8Array(await result.arrayBuffer());if(b.length>850000)return null;return b;}
 const chunks=[];let len=0;
 for await(const chunk of result.body){len+=chunk.length;if(len>850000){await result.body.cancel?.();return null;}chunks.push(chunk);}
 const resultBytes=new Uint8Array(len);let i=0;for(const b of chunks){resultBytes.set(b,i);i+=b.length;}
 return resultBytes;
}
export async function discoverCommonsPhoto(db,env,topic,request=fetch){
 if(!topics[topic]||!env.PHOTO_KV||!photoResearchEnabled(env))return {status:"DISABLED",photo:null};
 const activity=topics[topic].activity_id;
 const uri=new URL("https://commons.wikimedia.org/w/api.php");
 for(const [k,v] of Object.entries({action:"query",format:"json",formatversion:"2",generator:"search",gsrsearch:topics[topic].search,
  gsrnamespace:"6",gsrlimit:"12",prop:"imageinfo",iiprop:"url|mime|extmetadata",iiurlwidth:"1100",
  iiextmetadatafilter:"LicenseShortName|LicenseUrl|Artist|Credit"}))uri.searchParams.set(k,v);
 let found=null,outcome="EXTERNAL_UNAVAILABLE";
 try{
  const response=await request(uri.href,{headers:{"accept":"application/json","user-agent":"NusaPenidaExperiencesMarketingAgent/1.0 (research; https://marketing-turism-agent.finchat-ai-gateway.workers.dev/)"},
   signal:AbortSignal.timeout(9000)});
  if(!response.ok)throw Error("commons-search-unavailable");
  const json=await response.json();if(json?.error||!Array.isArray(json.query?.pages))throw Error("commons-no-results");
  outcome="NO_VALID_LICENSE";
  for(const page of json.query.pages.slice(0,12)){
   const candidate=validCommonsCandidate(page,topic);if(!candidate)continue;
   const duplicate=await db.prepare("SELECT id FROM researched_photo_library WHERE source_url=?").bind(candidate.source_url).first();
   if(duplicate)continue;
   let bytes;try{bytes=await safeFetchBytes(candidate.source_file_url,request)}catch{continue;}
   if(!bytes||bytes.length<10000||bytes[0]!==255||bytes[1]!==216||bytes.at(-2)!==255||bytes.at(-1)!==217)continue;
   const sha=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))).map(b=>b.toString(16).padStart(2,"0")).join("");
   if(await db.prepare("SELECT id FROM researched_photo_library WHERE sha256=?").bind(sha).first())continue;
   const id=crypto.randomUUID();
   await env.PHOTO_KV.put(key(id),bytes.buffer);
   try{
    await db.prepare("INSERT INTO researched_photo_library(id,activity_id,topic,title,author,license,license_url,source_url,source_file_url,sha256,bytes) "+
     "VALUES(?,?,?,?,?,?,?,?,?,?,?)").bind(id,candidate.activity_id,topic,candidate.title,candidate.author,candidate.license,
       candidate.license_url,candidate.source_url,candidate.source_file_url,sha,bytes.length).run();
   }catch(e){try{await env.PHOTO_KV.delete(key(id))}catch{}continue;}
   found=await resolveResearchPhoto(db,id);outcome="FOUND";break;
  }
 }catch{outcome="EXTERNAL_UNAVAILABLE";}
 try{await db.prepare("INSERT INTO photo_research_runs(id,activity_id,topic,outcome) VALUES(?,?,?,?)").bind(
  crypto.randomUUID(),activity,topic,outcome).run()}catch{}
 return {status:outcome,photo:found};
}
// User images take priority when never selected. Then unused legally sourced Commons photos;
// otherwise fall back to pre-vetted repo photos. No posting is authorized by research.
export async function choosePhotoForReview(db,env,activity,caption,{request=fetch,discover=false,exclude=new Set()}={}){
 const q=await db.prepare("SELECT p.id,p.title,p.activity_id,p.created_at FROM owner_photo_library p "+
  "WHERE p.activity_id=? AND NOT EXISTS (SELECT 1 FROM campaign_review_records c WHERE c.media_slug='owner-'||p.id) "+
  "ORDER BY p.created_at DESC LIMIT 15").bind(activity).all();
 const owner=q.results.find(x=>!exclude.has("owner-"+x.id));
 if(owner)return {slug:"owner-"+owner.id,origin:"OWNER_PHOTO"};
 const topic=topicForCampaign(activity,caption);
 const known=await db.prepare("SELECT r.* FROM researched_photo_library r WHERE activity_id=? AND topic=? "+
  "AND NOT EXISTS (SELECT 1 FROM campaign_review_records c WHERE c.media_slug='research-'||r.id) "+
  "ORDER BY created_at DESC LIMIT 15").bind(activity,topic).all();
 const existing=known.results.find(x=>!exclude.has("research-"+x.id));
 if(existing)return {slug:"research-"+existing.id,origin:"LICENSED_RESEARCH"};
 if(discover){
  const newSource=await discoverCommonsPhoto(db,env,topic,request);
  if(newSource.photo)return {slug:newSource.photo.slug,origin:"LICENSED_RESEARCH"};
  return {slug:null,origin:"FALLBACK_VETTED_GALLERY",search_status:newSource.status};
 }
 return {slug:null,origin:"FALLBACK_VETTED_GALLERY",search_status:"SEARCH_DEFERRED"};
}
