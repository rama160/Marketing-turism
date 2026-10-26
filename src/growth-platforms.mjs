// Approved read-only multi-network prospect discovery for Nusa Penida Experiences.
// Bluesky: public AppView; Meta: ONLY comments on owner's authorised Page/IG media;
// YouTube: optional official search API. Never search private profiles, send messages,
// contact people or claim any discovery is an opt-in lead.
const HOUR=3600000, MAX_AGE=48*HOUR, DAY=24*HOUR;
const UUID=()=>crypto.randomUUID();
const networks=["BLUESKY_PUBLIC","FACEBOOK_PAGE_COMMENTS","INSTAGRAM_MEDIA_COMMENTS","YOUTUBE_PUBLIC_VIDEO"];
const tourism=/\b(nusa penida|penida|manta|snorkel|bali itinerary|bali trip|day trip|fast boat)\b/i;
const question=/\?|recommend|suggest|advice|help|how|where|looking for|should we|is it worth|worth it|itinerary|planning|plan to visit|tips|anyone|book a tour/i;
const spam=/\b(crypto|discount codes?|buy followers|affiliate|airdrop|bitcoin|adult content|for sale)\b/i;
const clean=s=>String(s??"").replace(/<[^>]*>/g," ").replace(/&(?:amp|quot|lt|gt|#39);/g," ").replace(/\s+/g," ").trim();
const httpsHost=(input,host)=>{try{const u=new URL(input);return u.protocol==="https:"&&(u.hostname===host||u.hostname==="www."+host)?u:null}catch{return null}};
function fresh(text,published,now=Date.now()){
 const ts=Date.parse(published||"");
 if(!Number.isFinite(ts)||ts>now+300000||now-ts>MAX_AGE)return null;
 const mid=Math.floor((ts+8*HOUR)/DAY)*DAY-8*HOUR;
 const deadline=/\b(tomorrow|esok)\b/i.test(text)?mid+DAY*2-1000:
  /\b(today|tonight)\b|hari ini/i.test(text)?mid+DAY-1000:Infinity;
 const expires=Math.min(ts+MAX_AGE,deadline);
 if(expires<=now)return null;
 const age_hours=Math.max(0,Math.floor((now-ts)/HOUR));
 return {published_at:new Date(ts).toISOString().replace("T"," ").slice(0,19),
  expires_at:new Date(expires).toISOString().replace("T"," ").slice(0,19),age_hours};
}
function candidate(source,url,title,published,now=Date.now()){
 title=clean(title).slice(0,240);
 if(title.length<12||!tourism.test(title)||!question.test(title)||spam.test(title))return null;
 const age=fresh(title,published,now);if(!age)return null;
 const theme=/snorkel|manta/i.test(title)?"SNORKELING":/itinerary|day trip|kelingking|diamond beach|tour|boat/i.test(title)?"ISLAND_TOUR":"GENERAL";
 const score=Math.min(100,35+(/nusa penida/i.test(title)?30:10)+(/tour|snorkel|manta|boat|itinerary/i.test(title)?15:0)+(/recommend|advice|\?|help|looking for/i.test(title)?12:0)+(age.age_hours<6?8:age.age_hours<24?4:0));
 const activity=theme==="SNORKELING"?"sea conditions, licensed operators and safe group sizes":
  theme==="ISLAND_TOUR"?"travel times, East/West routes and operator availability":"boat connections, realistic itineraries and weather";
 const reply="I help visitors plan Nusa Penida trips with Nusa Penida Experiences (business disclosure). For this question, I'd check "+activity+
  ". If community rules allow business replies, I can share options after confirming your dates and group size. No unsolicited direct messages.";
 return {id:UUID(),source,source_url:url,headline:title,theme,score,suggested_reply:reply,...age};
}
export function extractBlueskyPosts(data,now=Date.now()){
 if(!Array.isArray(data?.posts))return [];
 const out=[];
 for(const p of data.posts.slice(0,35)){
  const uri=String(p?.uri||""),did=String(p?.author?.did||"");
  const match=uri.match(/^at:\/\/(did:(?:plc|web):[a-zA-Z0-9.:%_-]+)\/app\.bsky\.feed\.post\/([a-zA-Z0-9]+)$/);
  if(!match||match[1]!==did)continue;
  const source_url="https://bsky.app/profile/"+encodeURIComponent(did)+"/post/"+match[2];
  const item=candidate("BLUESKY_PUBLIC",source_url,p?.record?.text,p?.record?.createdAt,now);
  if(item)out.push(item);
  if(out.length>=12)break;
 }
 return out;
}
export function extractMetaPageComments(data,now=Date.now()){
 if(!Array.isArray(data?.data))return [];
 const out=[];
 for(const post of data.data.slice(0,8)){
  const postId=String(post?.id||"");
  if(!/^[0-9]+(?:_[0-9]+)?$/.test(postId))continue;
  for(const c of (Array.isArray(post?.comments?.data)?post.comments.data:[]).slice(0,20)){
   const id=String(c?.id||"");
   if(!/^[0-9]+(?:_[0-9]+)?$/.test(id))continue;
   const url="https://www.facebook.com/"+postId+"?comment_id="+encodeURIComponent(id);
   const item=candidate("FACEBOOK_PAGE_COMMENTS",url,c?.message,c?.created_time,now);
   if(item)out.push(item);
   if(out.length>=12)return out;
  }
 }
 return out;
}
export function extractInstagramComments(data,now=Date.now()){
 if(!Array.isArray(data?.data))return [];
 const out=[];
 for(const media of data.data.slice(0,8)){
  const base=httpsHost(media?.permalink,"instagram.com");
  if(!base)continue;
  for(const c of (Array.isArray(media?.comments?.data)?media.comments.data:[]).slice(0,20)){
   const id=String(c?.id||"");if(!/^[0-9]+$/.test(id))continue;
   const url=new URL(base);url.searchParams.set("comment_id",id);
   const item=candidate("INSTAGRAM_MEDIA_COMMENTS",url.toString(),c?.text,c?.timestamp,now);
   if(item)out.push(item);
   if(out.length>=12)return out;
  }
 }
 return out;
}
export function extractYouTubeVideos(data,now=Date.now()){
 if(!Array.isArray(data?.items))return [];
 const out=[];
 for(const item of data.items.slice(0,20)){
  const video=String(item?.id?.videoId||"");
  if(!/^[a-zA-Z0-9_-]{11}$/.test(video))continue;
  // A video is an awareness/discussion signal, NEVER proof its author wants a booking.
  const obj=candidate("YOUTUBE_PUBLIC_VIDEO","https://www.youtube.com/watch?v="+video,
   item?.snippet?.title,item?.snippet?.publishedAt,now);
  if(obj){obj.score=Math.min(obj.score,65);obj.suggested_reply="Public video worth reviewing for travel questions and market insights. Do not treat its creator as a booking prospect or leave unsolicited promotional comments.";out.push(obj);}
 }
 return out;
}
async function getJson(url,request=fetch,token){
 try{
  const headers={accept:"application/json"};
  if(token)headers.authorization="Bearer "+token;
  const resp=await request(url,{method:"GET",headers,signal:AbortSignal.timeout(6500)});
  if(!resp.ok)return null;
  if(Number(resp.headers?.get("content-length")||0)>300000)return null;
  const result=await resp.json();
  return result&&typeof result==="object"&&!Array.isArray(result)?result:null;
 }catch{return null;}
}
async function save(db,source,items){
 let discovered=0;
 for(const x of items){
  const result=await db.prepare("INSERT OR IGNORE INTO growth_network_opportunities(id,source,source_url,headline,theme,score,suggested_reply,published_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?)")
   .bind(x.id,source,x.source_url,x.headline,x.theme,x.score,x.suggested_reply,x.published_at,x.expires_at).run();
  discovered+=Number(result.meta?.changes||0);
 }
 return discovered;
}
async function runOne(db,source,call){
 const items=await call();
 const status=items===null?"SOURCE_UNAVAILABLE":items.length?"FOUND":"NO_MATCH";
 const discovered=items===null?0:await save(db,source,items);
 await db.prepare("INSERT INTO growth_discovery_runs(id,source,result,candidates) VALUES(?,?,?,?)").bind(UUID(),source,status,discovered).run();
 return {source,status,discovered};
}
export async function scanAdditionalNetworks(db,env={},request=fetch){
 const sources=await db.prepare("SELECT source FROM growth_discovery_runs WHERE (source IN ('BLUESKY_PUBLIC','FACEBOOK_PAGE_COMMENTS','INSTAGRAM_MEDIA_COMMENTS') AND created_at>=datetime('now','-2 hours')) OR (source='YOUTUBE_PUBLIC_VIDEO' AND created_at>=datetime('now','-24 hours'))").all();
 const done=new Set(sources.results.map(x=>x.source)),results=[];
 if(!done.has("BLUESKY_PUBLIC")){
  results.push(await runOne(db,"BLUESKY_PUBLIC",async()=>{
   const endpoint="https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q="+encodeURIComponent("nusa penida")+"&sort=latest&limit=30";
   const result=await getJson(endpoint,request);
   return result?extractBlueskyPosts(result):null;
  }));
 }
 const page=String(env.META_PAGE_ID||env.META_GRAPH_PAGE_ID||"");
 const ig=String(env.META_IG_USER_ID||env.META_GRAPH_IG_USER_ID||"");
 const pageToken=env.META_PAGE_ACCESS_TOKEN||env.META_GRAPH_PAGE_TOKEN;
 const igToken=env.META_IG_ACCESS_TOKEN||env.META_GRAPH_IG_TOKEN||pageToken;
 const metaOn=env.GROWTH_META_RESEARCH_ENABLED==="true";
 if(!done.has("FACEBOOK_PAGE_COMMENTS")){
  if(metaOn&&/^[0-9]{6,30}$/.test(page)&&typeof pageToken==="string"&&pageToken.length>=24){
   results.push(await runOne(db,"FACEBOOK_PAGE_COMMENTS",async()=>{
    const fields=encodeURIComponent("id,comments.limit(15){id,message,created_time}");
    const result=await getJson("https://graph.facebook.com/v26.0/"+page+"/posts?fields="+fields+"&limit=6",request,pageToken);
    return result?extractMetaPageComments(result):null;
   }));
  }else results.push({source:"FACEBOOK_PAGE_COMMENTS",status:"NOT_CONFIGURED",discovered:0});
 }
 if(!done.has("INSTAGRAM_MEDIA_COMMENTS")){
  if(metaOn&&/^[0-9]{6,30}$/.test(ig)&&typeof igToken==="string"&&igToken.length>=24){
   results.push(await runOne(db,"INSTAGRAM_MEDIA_COMMENTS",async()=>{
    const fields=encodeURIComponent("id,permalink,comments.limit(15){id,text,timestamp}");
    const result=await getJson("https://graph.facebook.com/v26.0/"+ig+"/media?fields="+fields+"&limit=6",request,igToken);
    return result?extractInstagramComments(result):null;
   }));
  }else results.push({source:"INSTAGRAM_MEDIA_COMMENTS",status:"NOT_CONFIGURED",discovered:0});
 }
 if(!done.has("YOUTUBE_PUBLIC_VIDEO")){
  const key=String(env.YOUTUBE_DATA_API_KEY||"");
  if(env.GROWTH_YOUTUBE_RESEARCH_ENABLED==="true"&&key.length>=20){
   results.push(await runOne(db,"YOUTUBE_PUBLIC_VIDEO",async()=>{
    const query=new URLSearchParams({part:"snippet",type:"video",order:"date",q:"Nusa Penida travel advice",
     maxResults:"20",publishedAfter:new Date(Date.now()-MAX_AGE).toISOString(),key});
    const data=await getJson("https://www.googleapis.com/youtube/v3/search?"+query,request);
    return data?extractYouTubeVideos(data):null;
   }));
  }else results.push({source:"YOUTUBE_PUBLIC_VIDEO",status:"NOT_CONFIGURED",discovered:0});
 }
 await db.prepare("DELETE FROM growth_network_opportunities WHERE expires_at<datetime('now','-30 days')").run();
 return results;
}
export async function additionalNetworkOpportunities(db){
 const rows=await db.prepare("SELECT id,source,source_url,headline,theme,score,suggested_reply,status,discovered_at,published_at,expires_at,CAST((julianday('now')-julianday(published_at))*24 AS INTEGER) AS age_hours FROM growth_network_opportunities WHERE expires_at>datetime('now') AND status!='DISMISSED' ORDER BY score DESC,discovered_at DESC LIMIT 60").all();
 return rows.results;
}
export async function progressNetworkOpportunity(db,id,status){
 if(!/^[0-9a-f-]{36}$/i.test(id)||!["REVIEW","SHORTLISTED","CONTACTED","RESPONDED","DISMISSED"].includes(status))return null;
 const found=await db.prepare("SELECT id FROM growth_network_opportunities WHERE id=? AND expires_at>datetime('now')").bind(id).first();
 if(!found)return null;
 const res=await db.prepare("UPDATE growth_network_opportunities SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,id).run();
 return {id,status,updated:Number(res.meta?.changes||0)===1};
}
export const supportedDiscoverySources=Object.freeze([...networks]);
