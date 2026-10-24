// Owner-approved Nusa Penida Experience social autopilot.
// Immutable approved snapshots, one queue row per channel, no unattended retry of Graph POST.
// No Metricool mutation: new approval queue never imports existing Metricool posts.
import {postGraph,checkMetaReadAccess} from "./meta-publisher.mjs";
import {marketingIntelligence,MARKETING_STRATEGY_VERSION} from "./marketing-intelligence.mjs";
import {weeklyDrafts,marketingWeekStart,replacementCampaignCaption} from "./sales.mjs";
import {campaignPhotoBySlug,campaignPhotoForDraft} from "./marketing-media.mjs";
import {resolveCampaignPhoto} from "./photo-library.mjs";
import {choosePhotoForReview} from "./photo-research.mjs";
const uid=()=>crypto.randomUUID();
const pageHost="https://marketing-turism-agent.finchat-ai-gateway.workers.dev";
const gBase="https://graph.facebook.com/v26.0";
const channels=new Set(["Facebook","Instagram"]);
const isoUTC=ms=>new Date(ms).toISOString().slice(0,19).replace("T"," ");
const baliDay=ms=>new Date(ms+8*3600000).toISOString().slice(0,10);
const utcFromBali=(day,hour)=>Date.parse(day+"T"+String(hour).padStart(2,"0")+":00:00Z")-8*3600000;
const positive=x=>Number.isFinite(x)&&x>=0&&x<=1000000000?Math.round(x):null;
const goodID=x=>/^[0-9]{6,40}$/.test(String(x||""));
const fresh=(x)=>x&&Date.now()-Date.parse(String(x).replace(" ","T")+"Z")<36*3600000;
function cleanCaption(text){
 const content=String(text||"").replace(/^\[REVIEW [^\]]+\]\s*/,"").trim();
 if(content.length<30||content.length>1800)throw Error("Caption harus 30–1800 karakter setelah metadata editorial dihapus");
 if(/\[(?:AUTO|REVIEW)\s+\d{4}-/.test(content))throw Error("Caption berisi metadata editorial yang tidak valid");
 return content;
}
async function mediaInfo(db,slug){
 const photo=await resolveCampaignPhoto(db,slug);
 if(photo.is_illustrative)throw Error("Foto ilustrasi belum boleh diposting otomatis");
 const rawUrl=(photo.owner_supplied||photo.research_discovered)?
  "https://marketing-turism-agent.finchat-ai-gateway.workers.dev"+photo.url:
  "https://raw.githubusercontent.com/rama160/Marketing-turism/main/public/photos/"+slug+".jpg";
 const captionCredit=photo.owner_supplied?"Photo: Nusa Penida Experiences (owner-supplied image).":
  "Photo: "+photo.credit+" / "+photo.license+". Source: "+photo.source+
  (photo.license_url?" License: "+photo.license_url:"");
 return {photo,image_url:rawUrl,captionCredit};
}
export function approvedAutopilotEnabled(env){return env.META_APPROVED_AUTOPOST_ENABLED==="true";}
export async function chooseApprovedSchedule(db,platform,evidence=[],now=Date.now(),env={}){
 if(!channels.has(platform))throw Error("Hanya Facebook dan Instagram yang didukung");
 const analysis=marketingIntelligence(evidence,weeklyDrafts(marketingWeekStart(baliDay(now))),baliDay(now));
 const measured=analysis.best_hours[platform];
 const hour=measured?.source==="MEASURED"&&Number.isInteger(measured.hour)?measured.hour:
  platform==="Facebook"?12:10;
 const blocked=new Set(String(env.META_EXTERNAL_POST_DATES||"").split(",").filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)));
 for(let i=0;i<45;i++){
  const future=now+(i+1)*86400000; // allow > 12 hours' delay; never same-day unreviewed posts
  const day=baliDay(future),ts=utcFromBali(day,hour);
  if(ts<now+12*3600000||blocked.has(day))continue;
  const count=await db.prepare("SELECT COUNT(*) AS n FROM approved_social_queue WHERE platform=? AND substr(datetime(scheduled_at,'+8 hours'),1,10)=? AND status NOT IN ('CANCELLED','REVIEW_REQUIRED')").bind(platform,day).first();
  if(Number(count?.n||0)!==0)continue;
  return {scheduled_at:isoUTC(ts),scheduled_wita:day+" "+String(hour).padStart(2,"0")+":00",hour,source:measured?.source==="MEASURED"?"MEASURED":"EXPLORATION",evidence:analysis.observation_count};
 }
 throw Error("Tidak ada slot aman dalam 45 hari; jadwal harus ditinjau");
}
export async function queueApprovedCampaign(db,env,old,platforms,evidence=[],options={}){
 if(!approvedAutopilotEnabled(env))throw Error("Autopilot belum diaktifkan pada Worker");
 if(!Array.isArray(platforms)||platforms.length===0||platforms.length>2||
  new Set(platforms).size!==platforms.length||platforms.some(p=>!channels.has(p)))
  throw Error("Pilih Facebook, Instagram, atau keduanya");
 const previouslyApproved=options?.fromApproved===true;
 if(old.rejected_at||old.public_url||(previouslyApproved?old.status!=="APPROVED":old.status!=="DRAFT"))
  throw Error("Hanya draf aktif yang disetujui pemilik dan belum diposting dapat dijadwalkan");
 const existing=await db.prepare("SELECT id FROM approved_social_queue WHERE campaign_id=? LIMIT 1").bind(old.id).first();
 if(existing)throw Error("Draf sudah memiliki jadwal posting; tidak boleh dijadwalkan ulang tanpa pemeriksaan");
 const photo=await mediaInfo(db,old.media_slug||campaignPhotoForDraft(old.activity_id,old.caption).slug);
 if(photo.photo.owner_supplied&&photo.photo.activity_id!==old.activity_id)
  throw Error("Foto pribadi tidak sesuai kegiatan wisata pada draf");
 const caption=cleanCaption(old.caption)+"\n\n"+photo.captionCredit;
 if(caption.length>2200)throw Error("Caption termasuk atribusi melampaui batas Instagram");
 const slots=[];
 for(const platform of platforms)slots.push({platform,...await chooseApprovedSchedule(db,platform,evidence,Date.now(),env)});
 const statements=[
  db.prepare("UPDATE campaign_drafts SET status='APPROVED',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status=? AND public_url IS NULL "+
   "AND NOT EXISTS (SELECT 1 FROM campaign_review_records WHERE campaign_id=? AND rejected_at IS NOT NULL)")
   .bind(old.id,previouslyApproved?"APPROVED":"DRAFT",old.id),
  db.prepare("INSERT INTO campaign_review_records(campaign_id,media_slug,revision) VALUES(?,?,?) ON CONFLICT(campaign_id) DO NOTHING")
   .bind(old.id,photo.photo.slug,Number(old.revision||0))
 ];
 for(const slot of slots)statements.push(db.prepare(
  "INSERT INTO approved_social_queue(id,campaign_id,platform,photo_slug,caption_snapshot,image_url,scheduled_at,status) VALUES(?,?,?,?,?,?,?,'QUEUED')")
  .bind(uid(),old.id,slot.platform,photo.photo.slug,caption,photo.image_url,slot.scheduled_at));
 statements.push(db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
  .bind(uid(),"campaign",old.id,"APPROVED_SCHEDULED",
    JSON.stringify({scheduled:slots.map(x=>({platform:x.platform,wita:x.scheduled_wita,basis:x.source})),owner_approved:true,previously_approved:previouslyApproved})));
 await db.batch(statements);
 return {status:"APPROVED",queue:slots,post_mode:"SCHEDULED_AUTO",publication:"AWAITING_TIME"};
}
export async function approvedQueueStatus(db,env){
 const r=await db.prepare("SELECT q.id,q.campaign_id,q.platform,q.scheduled_at,q.status,q.meta_post_id,q.error_code,q.published_at,q.last_insight_at,"+
  "q.photo_slug,c.activity_id FROM approved_social_queue q JOIN campaign_drafts c ON c.id=q.campaign_id "+
  "ORDER BY q.created_at DESC,q.scheduled_at DESC LIMIT 100").all();
 const metrics=await db.prepare("SELECT m.queue_id,m.observed_on,m.views,m.reach,m.reactions,m.comments,m.shares,m.saves,m.data_status "+
  "FROM approved_social_metrics m WHERE m.observed_on>date('now','-30 days') ORDER BY m.observed_on DESC LIMIT 100").all();
 const latest={};for(const m of metrics.results)if(!latest[m.queue_id])latest[m.queue_id]=m;
 return {enabled:approvedAutopilotEnabled(env),posts:r.results.map(x=>({...x,last_metrics:latest[x.id]||null,
  scheduled_wita:new Date(x.scheduled_at.replace(" ","T")+"Z").toLocaleString("id-ID",{timeZone:"Asia/Makassar",year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})+" WITA"})),
  note:"Jadwal berasal dari persetujuan pemilik. Graph write gagal tidak diulang otomatis; periksa status Meta untuk menghindari duplikasi."};
}
export async function cancelApprovedQueue(db,id){
 const res=await db.prepare("UPDATE approved_social_queue SET status='CANCELLED',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='QUEUED'").bind(id).run();
 return res?.meta?.changes===1;
}
async function readGraph(path,token,request=fetch){
 const res=await request(gBase+path,{method:"GET",headers:{authorization:"Bearer "+token},signal:AbortSignal.timeout(10000)});
 if(!res.ok)throw Error("META_GET_HTTP_"+res.status);
 return res.json();
}
async function publishOne(db,env,row,request=fetch){
 const token=row.platform==="Facebook"?(env.META_PAGE_ACCESS_TOKEN||env.META_GRAPH_PAGE_TOKEN):
  (env.META_IG_ACCESS_TOKEN||env.META_GRAPH_IG_TOKEN||env.META_PAGE_ACCESS_TOKEN||env.META_GRAPH_PAGE_TOKEN);
 const id=row.platform==="Facebook"?(env.META_PAGE_ID||env.META_GRAPH_PAGE_ID):(env.META_IG_USER_ID||env.META_GRAPH_IG_USER_ID);
 if(!goodID(id)||typeof token!=="string"||token.length<24)return "MISSING_CREDENTIAL";
 const claimed=await db.prepare("UPDATE approved_social_queue SET status='CREATING_MEDIA',attempted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP "+
  "WHERE id=? AND status='QUEUED'").bind(row.id).run();
 if(claimed.meta?.changes!==1)return "ALREADY_CLAIMED";
 try{
  if(row.platform==="Facebook"){
   const postID=await postGraph("/"+id+"/photos",{url:row.image_url,caption:row.caption_snapshot,published:"true"},token,request);
   await db.prepare("UPDATE approved_social_queue SET status='POSTED',meta_post_id=?,published_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP "+
    "WHERE id=? AND status='CREATING_MEDIA'").bind(postID,row.id).run();
   return "POSTED";
  }
  const container=await postGraph("/"+id+"/media",{image_url:row.image_url,caption:row.caption_snapshot},token,request);
  await db.prepare("UPDATE approved_social_queue SET status='AWAITING_CONTAINER',meta_container_id=?,updated_at=CURRENT_TIMESTAMP "+
   "WHERE id=? AND status='CREATING_MEDIA'").bind(container,row.id).run();
  return "AWAITING_CONTAINER";
 }catch(_){
  await db.prepare("UPDATE approved_social_queue SET status='REVIEW_REQUIRED',error_code='MEDIA_CREATE_UNCERTAIN',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='CREATING_MEDIA'").bind(row.id).run();
  return "REVIEW_REQUIRED";
 }
}
async function finalizeInstagram(db,env,row,request=fetch){
 const token=env.META_IG_ACCESS_TOKEN||env.META_GRAPH_IG_TOKEN||env.META_PAGE_ACCESS_TOKEN||env.META_GRAPH_PAGE_TOKEN;
 const ig=env.META_IG_USER_ID||env.META_GRAPH_IG_USER_ID;
 if(!goodID(row.meta_container_id)||!goodID(ig)||typeof token!=="string")return "MISSING_CREDENTIAL";
 try{
  const status=await readGraph("/"+row.meta_container_id+"?fields=id,status_code",token,request);
  if(status.status_code==="ERROR"||status.status_code==="EXPIRED"){
   await db.prepare("UPDATE approved_social_queue SET status='REVIEW_REQUIRED',error_code='CONTAINER_INVALID',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='AWAITING_CONTAINER'").bind(row.id).run();
   return "REVIEW_REQUIRED";
  }
  if(status.status_code!=="FINISHED"){
   const elapsed=Date.now()-Date.parse(String(row.attempted_at).replace(" ","T")+"Z");
   if(elapsed>36*3600000)await db.prepare("UPDATE approved_social_queue SET status='REVIEW_REQUIRED',error_code='CONTAINER_TIMEOUT',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='AWAITING_CONTAINER'").bind(row.id).run();
   return "AWAITING_CONTAINER";
  }
 }catch(_){return "META_STATUS_UNAVAILABLE";}
 const claimed=await db.prepare("UPDATE approved_social_queue SET status='PUBLISHING',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='AWAITING_CONTAINER'").bind(row.id).run();
 if(claimed.meta?.changes!==1)return "ALREADY_CLAIMED";
 try{
  const id=await postGraph("/"+ig+"/media_publish",{creation_id:row.meta_container_id},token,request);
  await db.prepare("UPDATE approved_social_queue SET status='POSTED',meta_post_id=?,published_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP "+
   "WHERE id=? AND status='PUBLISHING'").bind(id,row.id).run();
  return "POSTED";
 }catch(_){
  await db.prepare("UPDATE approved_social_queue SET status='REVIEW_REQUIRED',error_code='PUBLISH_UNCERTAIN',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='PUBLISHING'").bind(row.id).run();
  return "REVIEW_REQUIRED";
 }
}
export async function dispatchApprovedQueue(db,env,request=fetch,now=Date.now()){
 if(!approvedAutopilotEnabled(env))return {status:"DISABLED"};
 const latest=await db.prepare("SELECT result,checked_at FROM meta_connection_checks ORDER BY checked_at DESC LIMIT 1").first();
 if(latest?.result!=="READ_OK"||!fresh(latest.checked_at))return {status:"META_READ_CHECK_NOT_FRESH"};
 const iso=isoUTC(now);
 const rows=await db.prepare("SELECT * FROM approved_social_queue WHERE "+
  "(status='QUEUED' AND scheduled_at<=?) OR status='AWAITING_CONTAINER' "+
  "ORDER BY scheduled_at ASC LIMIT 4").bind(iso).all();
 const outcomes=[];
 for(const row of rows.results){
  const status=row.status==="QUEUED"?await publishOne(db,env,row,request):await finalizeInstagram(db,env,row,request);
  outcomes.push({id:row.id,platform:row.platform,status});
 }
 return {status:"CHECKED",outcomes};
}
function valueOfMetric(data,name){
 const v=(data?.data||[]).find(x=>x.name===name)?.values?.[0]?.value;
 return positive(typeof v==="number"?v:null);
}
async function measurePost(row,env,request=fetch){
 const token=row.platform==="Facebook"?(env.META_PAGE_ACCESS_TOKEN||env.META_GRAPH_PAGE_TOKEN):
  (env.META_IG_ACCESS_TOKEN||env.META_GRAPH_IG_TOKEN||env.META_PAGE_ACCESS_TOKEN||env.META_GRAPH_PAGE_TOKEN);
 if(!goodID(row.meta_post_id)||typeof token!=="string")return {data_status:"UNAVAILABLE",error_code:"CREDENTIAL_UNAVAILABLE"};
 let views=null,reach=null,reactions=null,comments=null,shares=null,saves=null,reason="";
 try{
  if(row.platform==="Instagram"){
   const basic=await readGraph("/"+row.meta_post_id+"?fields=id,like_count,comments_count",token,request);
   reactions=positive(basic.like_count);comments=positive(basic.comments_count);
   const insights=await readGraph("/"+row.meta_post_id+"/insights?metric=views,reach,saved,shares",token,request);
   views=valueOfMetric(insights,"views");reach=valueOfMetric(insights,"reach");
   saves=valueOfMetric(insights,"saved");shares=valueOfMetric(insights,"shares");
  }else{
   const basic=await readGraph("/"+row.meta_post_id+"?fields=id,likes.summary(true).limit(0),comments.summary(true).limit(0)",token,request);
   reactions=positive(basic.likes?.summary?.total_count);comments=positive(basic.comments?.summary?.total_count);
   const insights=await readGraph("/"+row.meta_post_id+"/insights?metric=post_media_view",token,request);
   views=valueOfMetric(insights,"post_media_view");
  }
 }catch(e){reason=/META_GET_HTTP_([0-9]+)/.exec(String(e.message))?.[0]||"METRIC_UNSUPPORTED";}
 return {views,reach,reactions,comments,shares,saves,link_clicks:null,
  data_status:views!==null?"VERIFIED":(reactions!==null||comments!==null?"PARTIAL":"UNAVAILABLE"),error_code:reason};
}
export async function feedbackEvidence(db,day){
 const end=day||baliDay(Date.now());
 const cutoff=new Date(end+"T00:00:00Z");cutoff.setUTCDate(cutoff.getUTCDate()-90);
 const manual=(await db.prepare("SELECT * FROM marketing_observations WHERE observed_on>=? AND observed_on<=? ORDER BY observed_on DESC LIMIT 300").bind(cutoff.toISOString().slice(0,10),end).all()).results;
 const real=(await db.prepare(
  "SELECT m.*,q.platform,c.activity_id,q.campaign_id,q.published_at FROM approved_social_metrics m "+
  "JOIN approved_social_queue q ON q.id=m.queue_id JOIN campaign_drafts c ON c.id=q.campaign_id "+
  "WHERE m.data_status='VERIFIED' AND m.views>0 AND m.observed_on>=? AND m.observed_on<=? ORDER BY m.observed_on DESC LIMIT 300")
  .bind(cutoff.toISOString().slice(0,10),end).all()).results;
 return [...manual,...real.map(r=>({...r,impressions:null,source:"META_INSIGHTS",
  published_hour:Number(new Date(r.published_at.replace(" ","T")+"Z").toLocaleString("en-US",{timeZone:"Asia/Makassar",hour:"2-digit",hour12:false}))%24}))];
}
async function newLearningDraft(db,env,row,stats,sourceEvidence){
 if(!(stats.views>=50))return "INSUFFICIENT_VIEWS";
 if(await db.prepare("SELECT queue_id FROM approved_social_learning WHERE queue_id=?").bind(row.id).first())return "ALREADY_LEARNED";
 const day=baliDay(Date.now()),obs=sourceEvidence.filter(x=>(x.views??x.impressions)>0);
 const strategy=marketingIntelligence(obs,weeklyDrafts(marketingWeekStart(day)),day);
 const top=strategy.recommendations.find(x=>channels.has(x.platform)&&x.samples>0)||
  strategy.recommendations.find(x=>channels.has(x.platform));
 const preferredPlatform=top?.platform||row.platform,preferredActivity=top?.activity_id||row.activity_id;
 const revision=(obs.length%5)+1,reason="Buat variasi dari performa "+stats.views+" media views nyata pada "+row.platform;
 let caption=replacementCampaignCaption({activity_id:preferredActivity,platform:preferredPlatform,revision,reason,date:day});
 let generator="CURATED_FEEDBACK";
 if(env.AI){
  try{
   const data=await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast",{messages:[
    {role:"system",content:"Write an original organic tourism caption for owner review only in Indonesian, 100-700 characters. No invented prices, availability, guarantees or wildlife sightings. Avoid repeating the previous post; include a question. Return caption only."},
    {role:"user",content:"Nusa Penida Experiences; "+preferredPlatform+"; "+preferredActivity+". Based on verified "+stats.views+" views and "+(stats.reactions??"unavailable")+" reactions on prior post. Use a different storytelling angle."}
   ]});
   const proposed=String(data?.response||"").trim();
   if(proposed.length>=100&&proposed.length<=700&&!/\b(Rp\s?\d|gratis|diskon|guaranteed)\b/i.test(proposed)){
    caption="[REVIEW "+day+" · LEARNING · AI] "+proposed;
    generator="WORKERS_AI";
   }
  }catch(_){}
 }
 const id=uid();
 // The next draft researches licensed imagery when the owner has not supplied an unused photo.
 // Photo choice remains editable until approval. Offline/invalid Commons falls back to the gallery.
 let discovered={slug:null,origin:"FALLBACK_VETTED_GALLERY"};
 try{discovered=await choosePhotoForReview(db,env,preferredActivity,caption,{discover:true})}catch(_){}
 const draftSlug=discovered.slug||campaignPhotoForDraft(preferredActivity,caption).slug;
 const strategyRows=strategy.recommendations.slice(0,5).map(x=>({platform:x.platform,activity_id:x.activity_id,score:x.strategy_score,basis:x.basis,samples:x.samples}));
 try{
  await db.batch([
   db.prepare("INSERT INTO campaign_drafts(id,activity_id,platform,caption,status) VALUES(?,?,?,?,'DRAFT')")
    .bind(id,preferredActivity,preferredPlatform,caption),
   db.prepare("INSERT INTO campaign_review_records(campaign_id,media_slug,revision) VALUES(?,?,?)")
    .bind(id,draftSlug,0),
   db.prepare("INSERT INTO approved_social_learning(queue_id,new_campaign_id,strategy_version,source_views) VALUES(?,?,?,?)")
    .bind(row.id,id,MARKETING_STRATEGY_VERSION,stats.views),
   db.prepare("INSERT INTO marketing_decisions(id,week_start,strategy_version,input_observations,ranked_json,assumptions) VALUES(?,?,?,?,?,?)")
    .bind(uid(),marketingWeekStart(day),MARKETING_STRATEGY_VERSION,strategy.observation_count,JSON.stringify(strategyRows),
     "Draf baru dari pengamatan Meta asli; "+stats.views+" views, data lainnya nullable; pemilik wajib menyetujui."),
   db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
    .bind(uid(),"campaign",id,"STRATEGY_FEEDBACK_DRAFT",JSON.stringify({source_queue_id:row.id,views:stats.views,generator,owner_review_required:true,
       photo_origin:discovered.origin,photo_slug:draftSlug}))
  ]);
  return "NEW_DRAFT_CREATED";
 }catch(_){return "ALREADY_PROCESSED";}
}
export async function collectApprovedInsights(db,env,request=fetch,now=Date.now()){
 if(!approvedAutopilotEnabled(env))return {status:"DISABLED"};
 const rows=await db.prepare("SELECT q.*,c.activity_id FROM approved_social_queue q "+
  "JOIN campaign_drafts c ON c.id=q.campaign_id WHERE q.status='POSTED' AND q.published_at IS NOT NULL AND "+
  "datetime(q.published_at,'+20 hours')<=CURRENT_TIMESTAMP AND "+
  "(q.last_insight_at IS NULL OR datetime(q.last_insight_at,'+23 hours')<=CURRENT_TIMESTAMP) "+
  "AND datetime(q.published_at,'+21 days')>=CURRENT_TIMESTAMP ORDER BY q.published_at DESC LIMIT 4").all();
 const summary=[];
 for(const row of rows.results){
  const stats=await measurePost(row,env,request);
  const day=baliDay(now);
  await db.prepare("INSERT INTO approved_social_metrics(id,queue_id,observed_on,views,reach,reactions,comments,shares,saves,link_clicks,data_status,error_code) "+
   "VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(queue_id,observed_on) DO UPDATE SET "+
   "views=excluded.views,reach=excluded.reach,reactions=excluded.reactions,comments=excluded.comments,"+
   "shares=excluded.shares,saves=excluded.saves,link_clicks=excluded.link_clicks,data_status=excluded.data_status,error_code=excluded.error_code,recorded_at=CURRENT_TIMESTAMP")
   .bind(uid(),row.id,day,stats.views,stats.reach,stats.reactions,stats.comments,stats.shares,stats.saves,null,stats.data_status,stats.error_code).run();
  await db.prepare("UPDATE approved_social_queue SET last_insight_at=CURRENT_TIMESTAMP WHERE id=? AND status='POSTED'").bind(row.id).run();
  let learning="NEED_VERIFIED_METRICS";
  if(stats.data_status==="VERIFIED"&&stats.views>=50){
   const evidence=await feedbackEvidence(db,day);
   learning=await newLearningDraft(db,env,row,stats,evidence);
  }
  summary.push({queue_id:row.id,platform:row.platform,result:stats.data_status,learning});
 }
 return {status:"CHECKED",outcomes:summary};
}
