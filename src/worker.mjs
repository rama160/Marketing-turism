import {calculate,aiSuggestion,PricingError} from "./pricing.mjs";
import {payablesForLines,validateChange,allowedChangeTransition,OperationsError} from "./operations.mjs";
import {leadScore,salesDraft,weeklyDrafts,marketingWeekStart,replacementCampaignCaption} from "./sales.mjs";
import {campaignPhotoForDraft,campaignPhotoBySlug} from "./marketing-media.mjs";
import {validateMarketingObservation,marketingIntelligence,MARKETING_STRATEGY_VERSION} from "./marketing-intelligence.mjs";
import {metaPublicationConfig,metaConnectionStatus,checkMetaReadAccess,publishMetaTourism} from "./meta-publisher.mjs";
import {approvedAutopilotEnabled,chooseApprovedSchedule,queueApprovedCampaign,approvedQueueStatus,
 cancelApprovedQueue,dispatchApprovedQueue,collectApprovedInsights,feedbackEvidence} from "./approved-autopilot.mjs";
import {cancellationPreview,CANCELLATION_POLICY_VERSION} from "./cancellation.mjs";
import {servePhoto} from "./photos.mjs";
import {storeOwnerPhoto,serveOwnerPhoto,listOwnerPhotos,selectOwnerPhoto,resolveCampaignPhoto} from "./photo-library.mjs";
import {choosePhotoForReview,serveResearchPhoto,topicForCampaign,photoResearchEnabled} from "./photo-research.mjs";
import {publicSiteContent,adminSiteContent,publishSiteContent} from "./site-content.mjs";
import {waChallenge,waWebhook,waAdminInbox,waAdminThread,waAdminDraft,waAdminSend} from "./whatsapp.mjs";
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const bad=(message,status=400)=>json({error:message},status);
const str=(x,n=160)=>String(x??"").trim().slice(0,n);
const number=(x,min=0,max=100000000)=>Number.isSafeInteger(Number(x))&&Number(x)>=min&&Number(x)<=max?Number(x):null;
const uuid=()=>crypto.randomUUID();
const experienceVariants={
 SNORKELING_3_SPOTS:{SHARING:["STANDARD_3_SPOTS"],PRIVATE:["MANTA_BAY","MANTA_POINT"]},
 ISLAND_TOUR_CAR:{SHARING:["WEST","EAST"],PRIVATE:["WEST","EAST"]}
};
const variantAllowed=(activity,mode,variant)=>mode==="LEGACY"?variant==="DEFAULT":variant==="DEFAULT"||!!experienceVariants[activity]?.[mode]?.includes(variant);

const dateOK=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+"T00:00:00Z"))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
async function parse(req){const raw=await req.text();if(raw.length>12000)throw Error("Request terlalu besar");return JSON.parse(raw);}
async function owner(req,env){
 const expected=env.ADMIN_TOKEN||"";
 if(expected.length<24)return false;
 const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 const [a,b]=await Promise.all([crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)),crypto.subtle.digest("SHA-256",new TextEncoder().encode(expected))]);
 let d=0;const x=new Uint8Array(a),y=new Uint8Array(b);for(let i=0;i<x.length;i++)d|=x[i]^y[i];return d===0&&token.length===expected.length;
}
async function audit(db,kind,key,action,detail={}){
 await db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)").bind(uuid(),kind,key,action,JSON.stringify(detail)).run();
}
// Creates a full review-only bilingual week in dedicated tourism D1; no social publishing.
async function marketingEvidence(db,day){
 // Includes only real Graph media views, plus owner-verified campaign metrics.
 return feedbackEvidence(db,day);
}
// Internal Meta diagnostic: GET-only Graph requests, sanitized D1 snapshots.
// One row per UTC day; the owner may refresh at most once every five minutes.
function safeMetaCheck(row){
 if(!row)return null;
 return {day:row.day,checked_at:row.checked_at.replace(" ","T")+"Z",source:row.source,
  configured:row.configured===1,page:{ok:row.page_ok===1,status:row.page_http_status},
  instagram:{ok:row.instagram_ok===1,status:row.instagram_http_status},result:row.result};
}
async function recentMetaChecks(db){
 const rows=await db.prepare("SELECT day,checked_at,source,configured,page_ok,instagram_ok,page_http_status,instagram_http_status,result FROM meta_connection_checks ORDER BY day DESC LIMIT 14").all();
 return rows.results.map(safeMetaCheck);
}
async function runMetaDiagnostic(db,env,source){
 const day=new Date().toISOString().slice(0,10);
 if(source==="OWNER_BUTTON"){
  const existing=await db.prepare("SELECT checked_at FROM meta_connection_checks WHERE day=?").bind(day).first();
  const checkedAt=existing?.checked_at?Date.parse(existing.checked_at.replace(" ","T")+"Z"):0;
  if(checkedAt&&Date.now()-checkedAt<5*60*1000)
   return {status:"RECENT_RESULT",history:await recentMetaChecks(db)};
 }
 const config=metaConnectionStatus(env,day);
 const read=await checkMetaReadAccess(env);
 const configured=config.ids_valid&&config.tokens_present&&read.configured;
 const result=!configured?"INCOMPLETE":
  read.page.ok&&read.instagram.ok?"READ_OK":
  read.page.ok||read.instagram.ok?"READ_PARTIAL":"READ_FAILED";
 await db.prepare(
  "INSERT INTO meta_connection_checks(day,checked_at,source,configured,page_ok,instagram_ok,page_http_status,instagram_http_status,result) "+
  "VALUES(?,CURRENT_TIMESTAMP,?,?,?,?,?,?,?) ON CONFLICT(day) DO UPDATE SET "+
  "checked_at=CURRENT_TIMESTAMP,source=excluded.source,configured=excluded.configured,"+
  "page_ok=excluded.page_ok,instagram_ok=excluded.instagram_ok,page_http_status=excluded.page_http_status,"+
  "instagram_http_status=excluded.instagram_http_status,result=excluded.result"
 ).bind(day,source,Number(configured),Number(read.page.ok),Number(read.instagram.ok),
  read.page.status??null,read.instagram.status??null,result).run();
 // Retain only a small diagnostic window; no historical tokens or response bodies.
 await db.prepare("DELETE FROM meta_connection_checks WHERE day < date('now','-30 days')").run();
 return {status:"CHECKED",history:await recentMetaChecks(db)};
}
async function prepareMarketingWeek(db,env,dateString,source){
 const monday=marketingWeekStart(dateString),runId="campaign-week-"+monday;
 if(await db.prepare("SELECT id FROM scheduled_runs WHERE id=?").bind(runId).first())return {week_start:monday,generated:0,status:"ALREADY_PREPARED"};
 // Daily recovery creates new future-dated review drafts, not expired editorial suggestions.
 const late=dateString>monday;
 const drafts=weeklyDrafts(monday).map((item,i)=>{
  if(!late)return item;
  const d=new Date(dateString+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+i);
  const planned_date=d.toISOString().slice(0,10);
  return {...item,planned_date,caption:item.caption.replace(/^\[REVIEW [^\]]+\]/,
   "[REVIEW "+planned_date+" · "+item.lang.toUpperCase()+"]")};
 });
 const learned=marketingIntelligence(await marketingEvidence(db,dateString),drafts,dateString);
 // Bounded autonomous source discovery BEFORE new review drafts. Existing approved/queued
 // posts never change. Never claim live trends when only exploratory/performance data exists.
 const selectedPhotos=[],reserved=new Set(),attemptedResearch=new Set();
 for(const draft of drafts){
  let selection={slug:null,origin:"FALLBACK_VETTED_GALLERY"};
  try{
   selection=await choosePhotoForReview(db,env,draft.activity_id,draft.caption,{
    discover:!attemptedResearch.has(draft.activity_id),exclude:reserved});
  }catch(_){}
  if(selection.search_status)attemptedResearch.add(draft.activity_id);
  if(selection.slug)reserved.add(selection.slug);
  selectedPhotos.push(selection);
 }
 const ranked=learned.recommendations.map(x=>({...x,recommended_hour:learned.best_hours[x.platform]?.hour??null}));
 const statements=[
  db.prepare("INSERT INTO scheduled_runs(id,kind) VALUES(?,?)").bind(runId,"WEEKLY_MARKETING_DRAFTS"),
  db.prepare("INSERT INTO marketing_decisions(id,week_start,strategy_version,input_observations,ranked_json,assumptions) VALUES(?,?,?,?,?,?)")
    .bind(uuid(),monday,MARKETING_STRATEGY_VERSION,learned.observation_count,JSON.stringify(ranked),
    learned.observation_count?"Kinerja terukur; saran jam hanya jika data memenuhi batas minimum":
    "Tanpa data nyata; semua 7 konten hanya draf, tidak ada publikasi otomatis")
 ];
 for(const [i,item] of drafts.entries()){
  const id=uuid(),picked=selectedPhotos[i];
  statements.push(db.prepare("INSERT INTO campaign_drafts(id,activity_id,platform,caption,status) VALUES(?,?,?,?,?)")
   .bind(id,item.activity_id,item.platform,item.caption,"DRAFT"));
  if(picked.slug)statements.push(db.prepare("INSERT INTO campaign_review_records(campaign_id,media_slug,revision) VALUES(?,?,0)")
   .bind(id,picked.slug));
 }
 // Prepare a bounded 3-post opt-in queue; Graph publication is still DISABLED by default.
 const eligible=ranked.filter(x=>x.platform==="Instagram"||x.platform==="Facebook"),chosen=[],covered=new Set();
 for(const item of eligible){
  if(chosen.length===3)break;
  if(chosen.length===1&&covered.has(item.activity_id)&&eligible.some(c=>!covered.has(c.activity_id)&&!chosen.some(y=>y.index===c.index)))continue;
  chosen.push(item);covered.add(item.activity_id);
 }
 if(!late)for(const [n,item] of chosen.entries()){
  const date=new Date(monday+"T00:00:00Z");date.setUTCDate(date.getUTCDate()+[0,2,4][n]);
  statements.push(db.prepare("INSERT INTO marketing_publications(id,week_start,intended_date,idea_index,status) VALUES(?,?,?,?,?)")
   .bind(uuid(),monday,date.toISOString().slice(0,10),item.index,"READY"));
 }
 statements.push(db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
  .bind(uuid(),"scheduled_run",runId,"DRAFTS_CREATED",JSON.stringify({count:drafts.length,source,late_recovery:late,publication_slots:late?0:chosen.length,observations:learned.observation_count,automatically_published:false,
   imagery:selectedPhotos.map(x=>({source:x.origin||"GALLERY",search:x.search_status||"NOT_REQUIRED"}))})));
 await db.batch(statements);
 return {week_start:monday,generated:drafts.length,status:"DRAFT_REVIEW",observations_used:learned.observation_count,
  best_hours:learned.best_hours,ranked:ranked.slice(0,3),publication:"NONE"};
}
async function activeRate(db,operator,item,bookingMode="LEGACY",variantId="DEFAULT"){
 return db.prepare("SELECT r.* FROM rates r JOIN operators o ON o.id=r.operator_id WHERE r.operator_id=? AND r.item_id=? AND r.booking_mode=? AND r.variant_id=? AND r.active=1 AND r.verified=1 AND o.status='VERIFIED' ORDER BY r.version DESC LIMIT 1").bind(operator,item,bookingMode,variantId).first();
}
async function makePrice(db,b){
 const a=str(b.activity_id,80),op=str(b.operator_id,80),n=number(b.guests,1,100),mode=str(b.booking_mode,16)||"LEGACY",variant=str(b.variant_id,40)||"DEFAULT";
 if(!["LEGACY","SHARING","PRIVATE"].includes(mode)||!variantAllowed(a,mode,variant))throw new PricingError("Jenis paket/rute belum dipilih dengan benar");
 if(!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(a)||!n)throw Error("Aktivitas atau guest tidak valid");
 const base=await activeRate(db,op,a,mode,variant),extras=[];
 for(const item of ["LUNCH","BOAT_OUT","BOAT_RETURN"]){
  const q=number(b.extras?.[item]??0,0,n);
  if(q===null)throw Error("Jumlah tambahan tidak valid");
  if(q>0){const extraOperator=str(b.extra_operators?.[item]||op,100);extras.push({item,qty:q,rate:await activeRate(db,extraOperator,item)});}
 }
 const cost=number(b.agency_costs??0),fee=number(b.payment_fee??0),sell=b.selling_price==null?null:number(b.selling_price,1);
 if(cost===null||fee===null||(b.selling_price!=null&&sell===null))throw Error("Biaya/harga tidak valid");
 const p=calculate({guests:n,base,extras,agencyCosts:cost,paymentFee:fee,sellingPrice:sell,bookingMode:mode,variantId:variant});
 return {...p,activity_id:a,operator_id:op,guests:n,booking_mode:mode,variant_id:variant,recommendation:aiSuggestion(p,number(b.market_reference,1)||null),fulfillment:mode==="SHARING"?"OPERATOR_PER_PERSON_GUARANTEE_REQUIRED":mode==="PRIVATE"?"EXCLUSIVE_OPERATOR_AVAILABILITY_REQUIRED":"LEGACY_QUOTE"};
}
async function route(req,env,ctx){
 const u=new URL(req.url),path=u.pathname,method=req.method,db=env.DB;
 if(path.startsWith("/photos/research/")){
  if(!db)return bad("D1 database belum aktif",503);
  return serveResearchPhoto(req,env,db);
 }
 if(path.startsWith("/photos/owner/")){
  if(!db)return bad("D1 database belum aktif",503);
  return serveOwnerPhoto(req,env,db);
 }
 if(path.startsWith("/photos/"))return servePhoto(req,env,ctx);
 if(path==="/api/webhooks/whatsapp"&&method==="GET")return waChallenge(req,env);
 if(path==="/api/webhooks/whatsapp"&&method==="POST"){if(!db)return bad("D1 database belum aktif",503);return waWebhook(req,env,db);}
 if(method==="OPTIONS")return new Response(null,{status:204,headers:{allow:"GET,POST,PATCH,DELETE"}});
 if(path==="/api/health")return json({status:db?"ok":"database_missing",version:"3.11.0",db:!!db,ai:!!env.AI});
 if(!db)return bad("D1 database belum aktif",503);
 if(path==="/api/public/cancellation-policy"&&method==="GET")return json({version:CANCELLATION_POLICY_VERSION,tiers:[{days:"H-7+",forfeit_percent:25},{days:"H-6 s.d. H-3",forfeit_percent:50},{days:"H-2 s.d. H-1",forfeit_percent:75},{days:"Hari H/no-show",forfeit_percent:100}],status:"DRAFT_REQUIRES_BUSINESS_REVIEW",special_cases:"Pembatalan operator/tidak aman ditinjau terpisah untuk perlindungan guest."});
 if(path==="/api/public/site-content"&&method==="GET")return json(await publicSiteContent(db,u.searchParams.get("lang")));
 if(path==="/api/public/catalog"&&method==="GET"){
  const rows=await db.prepare("SELECT id,title,category,description FROM activities ORDER BY category DESC,id").all();
  return json({items:rows.results,variants:experienceVariants,modes:[{id:"SHARING",description:"Bisa digabung dengan guest lain; operator menjamin tarif per peserta tanpa minimal kuota yang dibebankan ke agen."},{id:"PRIVATE",description:"Perjalanan eksklusif mulai satu guest, selama biaya tetap, tambahan dan margin aman terpenuhi."}],note:"Snorkeling dan island tour tidak dilaksanakan pada hari yang sama. Harga dan jadwal final harus dikonfirmasi."});
 }
 if(path==="/api/public/readiness"&&method==="GET"){
  const info=await db.prepare("SELECT legal_name,public_contact,privacy_approved,refund_policy_approved,trade_brand FROM business_profile WHERE id=1").first();
  const live=env.PUBLIC_LEADS_ENABLED==="true"&&!!env.TURNSTILE_SECRET&&!!info?.legal_name&&!!info?.public_contact&&info.privacy_approved===1&&info.refund_policy_approved===1;
  return json({accepting_leads:!!live,business_name:info?.legal_name||"",trade_brand:info?.trade_brand||"Penivara Experiences",payment_methods:{bank_transfer:"manual_only",qris:"NOT_CONFIGURED"},business_contact:info?.public_contact||"",privacy_page:"/privacy.html",terms_page:"/terms.html",turnstile_required:true});
 }
 if(path==="/api/public/leads"&&method==="POST"){
  const info=await db.prepare("SELECT legal_name,public_contact,privacy_approved,refund_policy_approved,trade_brand FROM business_profile WHERE id=1").first();
  if(env.PUBLIC_LEADS_ENABLED!=="true"||!env.TURNSTILE_SECRET||!info?.legal_name||!info?.public_contact||info.privacy_approved!==1||info.refund_policy_approved!==1)return bad("Form guest belum siap menerima data; hubungi kontak resmi agen",503);
  const b=await parse(req);
  if(b.website)return json({accepted:true});
  const token=str(b["cf-turnstile-response"],2048);
  if(!token||token.length<12)return bad("Verifikasi anti-bot diperlukan",403);
  try{
   const form=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token,remoteip:req.headers.get("cf-connecting-ip")||""});
   const verified=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:form,signal:AbortSignal.timeout(8000)});
   if(!verified.ok)return bad("Verifikasi anti-bot sementara tidak tersedia",503);
   const v=await verified.json();
   if(v.success!==true||v.hostname!==u.hostname||v.action!=="lead_enquiry")return bad("Verifikasi anti-bot tidak sah",403);
  }catch(_){return bad("Verifikasi anti-bot sementara tidak tersedia",503);}
  const name=str(b.name,100),contact=str(b.contact,100),activity=str(b.activity_id,80),mode=str(b.booking_mode,16),variant=str(b.variant_id,40),n=number(b.guests,1,100),day=str(b.requested_date,10),message=str(b.message,800);
  if(name.length<2||contact.length<5||n>(activity==="ISLAND_TOUR_CAR"?7:20)||!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity)||!["SHARING","PRIVATE"].includes(mode)||!variantAllowed(activity,mode,variant)||!n||!dateOK(day)||day<new Date().toISOString().slice(0,10)||b.consent!==true)return bad("Data guest/tanggal/consent tidak lengkap");
  const ip=str(req.headers.get("cf-connecting-ip")||"unknown");
  const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip+":"+(env.RATE_SALT||"tour")));
  const key=Array.from(new Uint8Array(hash)).slice(0,12).map(x=>x.toString(16).padStart(2,"0")).join("")+":"+new Date().toISOString().slice(0,10);
  const count=await db.prepare("SELECT amount FROM lead_limits WHERE id=?").bind(key).first();
  if((count?.amount||0)>=10)return bad("Batas permintaan harian tercapai",429);
  const leadId=uuid();
  const statements=[
   db.prepare("INSERT INTO lead_limits(id,amount) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET amount=amount+1").bind(key),
   db.prepare("INSERT INTO leads(id,name,contact,activity_id,guests,requested_date,message,consent,booking_mode,variant_id) VALUES(?,?,?,?,?,?,?,1,?,?)").bind(leadId,name,contact,activity,n,day,message,mode,variant)
  ];
  const campaignId=str(b.campaign_id,100);
  if(campaignId){const campaign=await db.prepare("SELECT id FROM campaign_drafts WHERE id=? AND status='PUBLISHED'").bind(campaignId).first();if(campaign)statements.push(db.prepare("INSERT INTO lead_attribution(lead_id,campaign_id) VALUES(?,?)").bind(leadId,campaign.id));}
  await db.batch(statements);
  return json({accepted:true,reference:leadId,message:"Permintaan tercatat; belum ada konfirmasi booking."},201);
 }
 if(!path.startsWith("/api/admin/"))return bad("Endpoint tidak ditemukan",404);
 if(!env.ADMIN_TOKEN||env.ADMIN_TOKEN.length<24)return bad("Set ADMIN_TOKEN secret terlebih dahulu",503);
 if(!(await owner(req,env)))return bad("Akses owner diperlukan",401);
 if(path==="/api/admin/whatsapp"){
  if(method==="GET")return waAdminInbox(db,env);
  return bad("Metode tidak diizinkan",405);
 }
 if(path==="/api/admin/whatsapp/thread"&&method==="GET")return waAdminThread(db,u.searchParams.get("phone"));
 if(path==="/api/admin/whatsapp/draft"&&method==="POST")return waAdminDraft(db,env,await parse(req));
 if(path==="/api/admin/whatsapp/send"&&method==="POST"){
  const b=await parse(req),result=await waAdminSend(db,env,b);
  if(result.ok)await audit(db,"whatsapp",String(b.client_nonce||""),"OWNER_SUBMITTED_REPLY",{via:"official_cloud_api"});
  return result;
 }
 if(path==="/api/admin/site-content"){
  if(method==="GET")return json(await adminSiteContent(db));
  if(method==="POST"){
   const b=await parse(req),published=await publishSiteContent(db,b);
   if(published.conflict)return bad("Konten berubah di tab lain. Muat ulang sebelum menyimpan.",409);
   await audit(db,"site_content",published.key+":"+published.locale,"PUBLISHED",{version:published.version});
   return json(published);
  }
  return bad("Metode tidak diizinkan",405);
 }
 if(path==="/api/admin/photos"){
  if(method==="GET")return json({items:await listOwnerPhotos(db),storage:"PHOTO_KV",limit_bytes:850000});
  if(method==="POST")return storeOwnerPhoto(req,env,db);
  return bad("Metode tidak diizinkan",405);
 }
 const ownerPhotoSelect=path.match(/^\/api\/admin\/campaigns\/([^/]+)\/photo$/);
 if(ownerPhotoSelect&&method==="POST"){
  const b=await parse(req);
  if(b.owner_confirmed!==true)return bad("Persetujuan pemilik diperlukan",403);
  try{return json(await selectOwnerPhoto(db,ownerPhotoSelect[1],str(b.photo_id,40)));}
  catch(e){return bad(String(e.message),422);}
 }
 if(path==="/api/admin/business"){
  if(method==="GET"){
   const info=await db.prepare("SELECT * FROM business_profile WHERE id=1").first();
   return json({business:info});
  }
  if(method==="PATCH"){
   const b=await parse(req),name=str(b.legal_name,150),contact=str(b.public_contact,150),brand=str(b.trade_brand,150)||"Penivara Experiences";
   if(name.length<3||contact.length<5)return bad("Identitas bisnis dan kontak resmi wajib diisi");
   if(!/^([+0-9][0-9 -]{6,}|[^@\s]+@[^@\s]+\.[^@\s]+)$/.test(contact))return bad("Kontak harus berupa telepon atau email resmi");
   const privacy=b.privacy_approved===true?1:0,refund=b.refund_policy_approved===true?1:0;
   await db.prepare("UPDATE business_profile SET legal_name=?,public_contact=?,privacy_approved=?,refund_policy_approved=?,trade_brand=?,updated_at=CURRENT_TIMESTAMP WHERE id=1").bind(name,contact,privacy,refund,brand).run();
   await audit(db,"business","1","PROFILE_UPDATED",{privacy,refund});
   return json({updated:true,acceptance_requires_cloudflare_flag:true});
  }
 }
 if(path==="/api/admin/summary"&&method==="GET"){
  const table=["operators","leads","quotes","bookings"],values=await Promise.all(table.map(t=>db.prepare("SELECT COUNT(*) n FROM "+t).first()));
  return json(Object.fromEntries(table.map((t,i)=>[t,values[i].n])));
 }
 if(path==="/api/admin/operators"){
  if(method==="GET")return json({items:(await db.prepare("SELECT * FROM operators ORDER BY created_at DESC").all()).results});
  if(method==="POST"){
   const b=await parse(req),name=str(b.name,120),contact=str(b.contact,100),notes=str(b.notes,500);
   if(name.length<3)return bad("Nama operator minimal 3 karakter");
   const id=uuid();await db.prepare("INSERT INTO operators(id,name,contact,notes) VALUES(?,?,?,?)").bind(id,name,contact,notes).run();
   await audit(db,"operator",id,"CREATE",{name});return json({id,status:"DRAFT"},201);
  }
 }
 const opMatch=path.match(/^\/api\/admin\/operators\/([^/]+)\/status$/);
 if(opMatch&&method==="PATCH"){
  const b=await parse(req),status=str(b.status,20);
  if(!["DRAFT","VERIFIED","INACTIVE"].includes(status))return bad("Status tidak valid");
  const old=await db.prepare("SELECT id FROM operators WHERE id=?").bind(opMatch[1]).first();
  if(!old)return bad("Operator tidak ditemukan",404);
  await db.prepare("UPDATE operators SET status=? WHERE id=?").bind(status,old.id).run();
  await audit(db,"operator",old.id,"STATUS",{status});return json({id:old.id,status});
 }
 if(path==="/api/admin/rates"){
  if(method==="GET")return json({items:(await db.prepare("SELECT r.*,o.name operator_name,a.title item_title FROM rates r JOIN operators o ON o.id=r.operator_id JOIN activities a ON a.id=r.item_id ORDER BY r.created_at DESC,r.version DESC").all()).results});
  if(method==="POST"){
   const b=await parse(req),op=str(b.operator_id,100),item=str(b.item_id,80),net=number(b.net,1),unit=str(b.unit,12),cap=b.capacity==null?null:number(b.capacity,1,30),mode=str(b.booking_mode,16)||"LEGACY",variant=str(b.variant_id,40)||"DEFAULT",scheme=str(b.pricing_scheme,24)||"STANDARD",fixed=number(b.private_fixed_net??0,0),guaranteed=b.sharing_guaranteed===true?1:0;
   const products=["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR","LUNCH","BOAT_OUT","BOAT_RETURN"];
   if(!products.includes(item)||net===null||fixed===null||!["LEGACY","SHARING","PRIVATE"].includes(mode)||!["STANDARD","FIXED_PACKAGE","FIXED_VEHICLE"].includes(scheme))return bad("Tarif/mode belum valid");
   if(!["LUNCH","BOAT_OUT","BOAT_RETURN"].includes(item)&&!variantAllowed(item,mode,variant))return bad("Rute/varian tidak sesuai paket");
   if(["LUNCH","BOAT_OUT","BOAT_RETURN"].includes(item)&&variant!=="DEFAULT")return bad("Add-on harus memakai varian DEFAULT");
   if(item==="ISLAND_TOUR_CAR"&&cap!==null&&cap>7)return bad("Kapasitas maksimum aman island tour adalah 7 guest");
   const isExperience=["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(item);
   if(!isExperience&&mode!=="LEGACY")return bad("Lunch dan fast boat ditarifkan per orang, bukan sebagai mode pengalaman");
   if(isExperience&&mode!=="LEGACY"){
    if(cap===null&&b.verified===true)return bad("Kapasitas kendaraan/kapal wajib dikonfirmasi operator sebelum verifikasi tarif");
    if(item==="ISLAND_TOUR_CAR"&&variant==="DEFAULT"){
      if(mode==="SHARING"&&(unit!=="person"||scheme!=="STANDARD"||guaranteed!==1||fixed!==0||cap>7))return bad("Tarif sharing lama perlu jaminan operator");
      if(mode==="PRIVATE"&&(unit!=="car"||scheme!=="STANDARD"||fixed!==0||cap>7))return bad("Tarif private mobil lama tidak valid");
    }else if(item==="ISLAND_TOUR_CAR"&&variant!=="DEFAULT"){
      if(unit!=="car"||scheme!=="FIXED_VEHICLE"||cap>7||fixed!==0||guaranteed!==0)return bad("Tour Barat/Timur Sharing maupun Private harus memakai biaya SATU mobil penuh, maksimal 7 guest");
    }else if(mode==="SHARING"){
      if(unit!=="person"||scheme!=="STANDARD"||guaranteed!==1||fixed!==0||(item==="SNORKELING_3_SPOTS"?cap>20:cap>7))return bad("Snorkeling Sharing harus dijamin operator per orang, maksimal 20");
    }else if(mode==="PRIVATE"){
      if(unit!=="person"||(variant==="DEFAULT"?scheme!=="STANDARD"||fixed<1:scheme!=="FIXED_PACKAGE"||fixed!==0)||guaranteed!==0)return bad("Snorkeling Private harga paket all-in satu booking, bukan per guest");
    }
   }else if(item==="ISLAND_TOUR_CAR"?(unit!=="car"||cap===null):unit!=="person")return bad("Satuan/kapasitas tarif lama tidak valid");
   const ownerOp=await db.prepare("SELECT status FROM operators WHERE id=?").bind(op).first();
   if(!ownerOp)return bad("Operator tidak ditemukan",404);
   const approved=b.verified===true&&ownerOp.status==="VERIFIED"?1:0;
   const prev=await db.prepare("SELECT COALESCE(MAX(version),0) n FROM rates WHERE operator_id=? AND item_id=? AND booking_mode=? AND variant_id=?").bind(op,item,mode,variant).first();
   const id=uuid();
   await db.batch([
    db.prepare("UPDATE rates SET active=0 WHERE operator_id=? AND item_id=? AND booking_mode=? AND variant_id=?").bind(op,item,mode,variant),
    db.prepare("INSERT INTO rates(id,operator_id,item_id,unit,net,capacity,verified,version,booking_mode,private_fixed_net,sharing_guaranteed,variant_id,pricing_scheme) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,op,item,unit,net,cap,approved,prev.n+1,mode,fixed,guaranteed,variant,scheme)
   ]);
   await audit(db,"rate",id,"NEW_VERSION",{operator:op,item,net,booking_mode:mode,variant_id:variant,pricing_scheme:scheme,private_fixed_net:fixed,sharing_guaranteed:guaranteed,approved});
   return json({id,version:prev.n+1,verified:!!approved},201);
  }
 }
 if(path==="/api/admin/leads"&&method==="GET")return json({items:(await db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 300").all()).results});
 const lm=path.match(/^\/api\/admin\/leads\/([^/]+)$/);
 if(lm&&method==="PATCH"){
  const b=await parse(req),status=str(b.status,24);
  if(!["NEW","QUALIFIED","CONTACTED","CLOSED","LOST"].includes(status))return bad("Status lead tidak valid");
  await db.prepare("UPDATE leads SET status=? WHERE id=?").bind(status,lm[1]).run();await audit(db,"lead",lm[1],"STATUS",{status});return json({id:lm[1],status});
 }
 if(path==="/api/admin/quotes/preview"&&method==="POST")return json({preview:await makePrice(db,await parse(req)),binding:false});
 if(path==="/api/admin/quotes"){
  if(method==="GET")return json({items:(await db.prepare("SELECT q.*,o.name operator_name FROM quotes q JOIN operators o ON o.id=q.operator_id ORDER BY q.created_at DESC LIMIT 300").all()).results});
  if(method==="POST"){
   const b=await parse(req);
   if(env.PUBLIC_LEADS_ENABLED==="true"&&b.terms_accepted!==true)return bad("Guest wajib menyetujui ketentuan yang diberikan sebelum penawaran disimpan",422);
   if(!dateOK(b.requested_date)||b.requested_date<new Date().toISOString().slice(0,10))return bad("Tanggal wisata tidak valid");
   const quote=await makePrice(db,b);if(quote.sellingPrice===null)return bad("Harga jual harus disetujui owner");
   const id=uuid();
   await db.prepare("INSERT INTO quotes(id,lead_id,operator_id,activity_id,guests,requested_date,net,minimum,selling_price,snapshot,booking_mode,variant_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,b.lead_id||null,quote.operator_id,quote.activity_id,quote.guests,b.requested_date,quote.net,quote.minimum,quote.sellingPrice,JSON.stringify({...quote,cancellation_policy_version:CANCELLATION_POLICY_VERSION,guest_terms_acknowledged:b.terms_accepted===true,payment_method:"BANK_TRANSFER_MANUAL",qris_available:false}),quote.booking_mode,quote.variant_id).run();
   await audit(db,"quote",id,"CREATE",{status:"DRAFT"});return json({id,quote,status:"DRAFT"},201);
  }
 }
 const qm=path.match(/^\/api\/admin\/quotes\/([^/]+)\/status$/);
 if(qm&&method==="PATCH"){
  const b=await parse(req),status=str(b.status,40);
  const q=await db.prepare("SELECT status FROM quotes WHERE id=?").bind(qm[1]).first();
  if(!q)return bad("Quote tidak ada",404);
  const transitions={DRAFT:["OPERATOR_CONFIRMED","CANCELLED"],OPERATOR_CONFIRMED:["APPROVED","CANCELLED"],APPROVED:["CANCELLED"],CANCELLED:[]};
  if(!transitions[q.status]?.includes(status))return bad("Transisi status tidak diizinkan");
  await db.prepare("UPDATE quotes SET status=? WHERE id=?").bind(status,qm[1]).run();await audit(db,"quote",qm[1],"STATUS",{from:q.status,to:status});return json({id:qm[1],status});
 }
 if(path==="/api/admin/bookings"){
  if(method==="GET")return json({items:(await db.prepare("SELECT b.*,q.guests,q.activity_id,COALESCE(s.service_date,q.requested_date) requested_date,q.selling_price,m.guest_name,m.guest_contact,m.pickup,m.special_notes,m.confirmed manifest_confirmed FROM bookings b JOIN quotes q ON q.id=b.quote_id LEFT JOIN booking_schedule s ON s.booking_id=b.id LEFT JOIN booking_manifest m ON m.booking_id=b.id ORDER BY b.created_at DESC LIMIT 300").all()).results});
  if(method==="POST"){
   const b=await parse(req),q=await db.prepare("SELECT * FROM quotes WHERE id=? AND status='APPROVED'").bind(str(b.quote_id,100)).first();
   if(!q)return bad("Harga/jadwal belum disetujui operator dan owner");
   let snapshot;
   try{snapshot=JSON.parse(q.snapshot)}catch{return bad("Snapshot quote tidak valid",409)}
   const ids=[...new Set((snapshot.lines||[]).map(l=>l.rate_id))];
   if(!ids.length)return bad("Penawaran belum memiliki item tarif");
   const owners={};
   for(const rateId of ids){const r=await db.prepare("SELECT operator_id FROM rates WHERE id=?").bind(rateId).first();if(!r)return bad("Tarif historis tidak ada",409);owners[rateId]=r.operator_id;}
   const payables=payablesForLines(snapshot.lines,owners,q.net);
   const id=uuid(),statements=[db.prepare("INSERT INTO bookings(id,quote_id) VALUES(?,?)").bind(id,q.id)];
   for(const p of payables)statements.push(db.prepare("INSERT INTO booking_payables(booking_id,operator_id,net_amount) VALUES(?,?,?)").bind(id,p.operator_id,p.net_amount));
   if(q.lead_id){
    const lead=await db.prepare("SELECT name,contact FROM leads WHERE id=?").bind(q.lead_id).first();
    if(lead)statements.push(db.prepare("INSERT INTO booking_manifest(booking_id,guest_name,guest_contact) VALUES(?,?,?)").bind(id,lead.name,lead.contact));
   }
   statements.push(db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)").bind(uuid(),"booking",id,"CREATE",JSON.stringify({quote:q.id,providers:payables.length})));
   await db.batch(statements);
   return json({id,status:"AWAITING_PAYMENT",operator_payables:payables},201);
  }
 }
 const bm=path.match(/^\/api\/admin\/bookings\/([^/]+)\/(payment|handover)$/);
 if(bm&&method==="POST"){
  const b=await parse(req),booking=await db.prepare("SELECT * FROM bookings WHERE id=?").bind(bm[1]).first();
  if(!booking)return bad("Booking tidak ditemukan",404);
  if(bm[2]==="payment"){
   const ref=str(b.reference,120);
   if(booking.payment_status!=="UNPAID"||booking.status!=="AWAITING_PAYMENT"||ref.length<5||b.owner_confirmed!==true)return bad("Harus verifikasi dana nyata; pembayaran belum dapat ditandai");
   const activeChange=await db.prepare("SELECT COUNT(*) n FROM booking_changes WHERE booking_id=? AND status='REQUESTED'").bind(bm[1]).first();
   if(activeChange?.n)return bad("Selesaikan perubahan booking sebelum menerima pembayaran",409);
   const paymentResult=await db.prepare("UPDATE bookings SET payment_status='PAID',status='PAID',reference=?,paid_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='UNPAID' AND status='AWAITING_PAYMENT'").bind(ref,bm[1]).run();
   if(paymentResult.meta?.changes!==1)return bad("Pembayaran sudah diproses oleh permintaan lain",409);
   await audit(db,"booking",bm[1],"PAYMENT_VERIFIED",{reference:ref});return json({status:"PAID"});
  }
  if(booking.payment_status!=="PAID"||booking.status!=="PAID"||b.operator_acknowledged!==true)return bad("Pembayaran lunas dan pengakuan operator wajib");
  const manifest=await db.prepare("SELECT confirmed FROM booking_manifest WHERE booking_id=?").bind(bm[1]).first();
  if(manifest?.confirmed!==1)return bad("Manifest guest belum dikonfirmasi pemilik");
  const pending=await db.prepare("SELECT COUNT(*) n FROM booking_changes WHERE booking_id=? AND status IN ('REQUESTED','APPROVED')").bind(bm[1]).first();
  if(pending?.n)return bad("Masih ada permintaan perubahan/refund yang belum selesai");
  const result=await db.prepare("UPDATE bookings SET status='HANDED_OVER',handed_over_at=CURRENT_TIMESTAMP WHERE id=? AND status='PAID' AND payment_status='PAID'").bind(bm[1]).run();
  if(result.meta?.changes!==1)return bad("Booking sudah ditangani oleh permintaan lain",409);
  await audit(db,"booking",bm[1],"HANDOVER");return json({status:"HANDED_OVER"});
 }

 if(path==="/api/admin/finance" && method==="GET"){
  const [payables,changes]=await Promise.all([
    db.prepare("SELECT p.*,o.name operator_name,q.activity_id,q.requested_date,q.selling_price FROM booking_payables p JOIN operators o ON o.id=p.operator_id JOIN bookings b ON b.id=p.booking_id JOIN quotes q ON q.id=b.quote_id ORDER BY p.created_at DESC LIMIT 400").all(),
    db.prepare("SELECT c.*,q.activity_id FROM booking_changes c JOIN bookings b ON b.id=c.booking_id JOIN quotes q ON q.id=b.quote_id ORDER BY c.created_at DESC LIMIT 400").all()
  ]);
  return json({payables:payables.results,changes:changes.results});
 }
 const manifestMatch=path.match(/^\/api\/admin\/bookings\/([^/]+)\/manifest$/);
 if(manifestMatch&&method==="POST"){
  const booking=await db.prepare("SELECT id,status FROM bookings WHERE id=?").bind(manifestMatch[1]).first();
  if(!booking)return bad("Booking tidak ditemukan",404);
  if(["HANDED_OVER","REFUNDED","CANCELLED"].includes(booking.status))return bad("Manifest booking sudah terkunci",409);
  const b=await parse(req),name=str(b.guest_name,120),contact=str(b.guest_contact,160),pickup=str(b.pickup,300),notes=str(b.special_notes,500);
  if(name.length<2||contact.length<5||b.owner_confirmed!==true)return bad("Identitas guest dan konfirmasi pemilik wajib");
  await db.prepare("INSERT INTO booking_manifest(booking_id,guest_name,guest_contact,pickup,special_notes,confirmed) VALUES(?,?,?,?,?,1) ON CONFLICT(booking_id) DO UPDATE SET guest_name=excluded.guest_name,guest_contact=excluded.guest_contact,pickup=excluded.pickup,special_notes=excluded.special_notes,confirmed=1,updated_at=CURRENT_TIMESTAMP").bind(booking.id,name,contact,pickup,notes).run();
  await audit(db,"manifest",booking.id,"OWNER_CONFIRMED",{pickup,has_contact:true});
  return json({id:booking.id,manifest_confirmed:true});
 }
 const payMatch=path.match(/^\/api\/admin\/bookings\/([^/]+)\/payables\/([^/]+)\/pay$/);
 if(payMatch && method==="POST"){
  const b=await parse(req),reference=str(b.reference,120);
  if(b.owner_confirmed!==true||reference.length<5)return bad("Referensi transfer dan verifikasi pemilik wajib");
  const booking=await db.prepare("SELECT payment_status,status FROM bookings WHERE id=?").bind(payMatch[1]).first();
  if(!booking||booking.payment_status!=="PAID"||["REFUNDED","REFUND_PENDING","CANCELLED"].includes(booking.status))return bad("Pembayaran guest belum beres atau refund masih berlangsung",409);
  const pending=await db.prepare("SELECT COUNT(*) n FROM booking_changes WHERE booking_id=? AND status IN ('REQUESTED','APPROVED') AND change_type IN ('CANCEL','REFUND')").bind(payMatch[1]).first();
  if(pending?.n)return bad("Ada permintaan pembatalan/refund aktif");
  const result=await db.prepare("UPDATE booking_payables SET status='PAID',reference=?,paid_at=CURRENT_TIMESTAMP WHERE booking_id=? AND operator_id=? AND status='DUE'").bind(reference,payMatch[1],payMatch[2]).run();
  if(result.meta?.changes!==1)return bad("Tagihan operator tidak ada/sudah dibayar",409);
  await audit(db,"payable",payMatch[1],"PAID",{operator_id:payMatch[2],reference});
  return json({booking_id:payMatch[1],operator_id:payMatch[2],status:"PAID"});
 }
 const cancelPreview=path.match(/^\/api\/admin\/bookings\/([^/]+)\/cancellation-preview$/);
 if(cancelPreview&&method==="POST"){
  const booking=await db.prepare("SELECT b.*,q.selling_price,COALESCE(s.service_date,q.requested_date) service_date FROM bookings b JOIN quotes q ON q.id=b.quote_id LEFT JOIN booking_schedule s ON s.booking_id=b.id WHERE b.id=?").bind(cancelPreview[1]).first();
  if(!booking)return bad("Booking tidak ditemukan",404);
  const payload=await parse(req),cause=str(payload.cause,32)||"GUEST";
  const costs=await db.prepare("SELECT SUM(net_amount) n FROM booking_payables WHERE booking_id=? AND status='PAID'").bind(booking.id).first();
  return json({preview:cancellationPreview({sellingPrice:booking.selling_price,serviceDate:booking.service_date,requestedOn:new Date().toISOString().slice(0,10),cause,nonRecoverableSupplierIdr:costs?.n??0}),notice:"Beban supplier lain dan hukum berlaku harus diperiksa pemilik."});
 }
 const changeCreate=path.match(/^\/api\/admin\/bookings\/([^/]+)\/changes$/);
 if(changeCreate && method==="POST"){
  const booking=await db.prepare("SELECT b.*,q.selling_price FROM bookings b JOIN quotes q ON q.id=b.quote_id WHERE b.id=?").bind(changeCreate[1]).first();
  if(!booking)return bad("Booking tidak ditemukan",404);
  const p=await db.prepare("SELECT COUNT(*) n FROM booking_changes WHERE booking_id=? AND status IN ('REQUESTED','APPROVED')").bind(booking.id).first();
  if(p?.n)return bad("Ada permintaan perubahan aktif",409);
  const b=await parse(req),data={change_type:str(b.change_type,16),reason:str(b.reason,500),requested_date:str(b.requested_date,10),refund_amount:number(b.refund_amount??0)};
  let policy=null;
  if(data.change_type==="REFUND"){
   const schedule=await db.prepare("SELECT COALESCE(s.service_date,q.requested_date) day FROM bookings bo JOIN quotes q ON q.id=bo.quote_id LEFT JOIN booking_schedule s ON s.booking_id=bo.id WHERE bo.id=?").bind(booking.id).first();
   const paid=await db.prepare("SELECT SUM(net_amount) n FROM booking_payables WHERE booking_id=? AND status='PAID'").bind(booking.id).first();
   policy=cancellationPreview({sellingPrice:booking.selling_price,serviceDate:schedule.day,requestedOn:new Date().toISOString().slice(0,10),cause:str(b.cancellation_cause,32)||(/\b(weather|cuaca|unsafe|operator cancelled)\b/i.test(data.reason)?"OPERATOR_OR_SAFETY":"GUEST"),nonRecoverableSupplierIdr:paid?.n??0});
  }
  validateChange(data,booking,booking.selling_price,policy?.refundIdr);
  const cid=uuid();
  await db.prepare("INSERT INTO booking_changes(id,booking_id,change_type,requested_date,refund_amount,reason,penalty_amount,cancellation_policy_version,cancellation_cause) VALUES(?,?,?,?,?,?,?,?,?)").bind(cid,booking.id,data.change_type,data.change_type==="RESCHEDULE"?data.requested_date:null,data.change_type==="REFUND"?data.refund_amount:0,data.reason,policy?.penaltyIdr||0,policy?.policyVersion||null,policy?.cause||null).run();
  await audit(db,"change",cid,"REQUESTED",{booking_id:booking.id,type:data.change_type});
  return json({id:cid,status:"REQUESTED"},201);
 }
 const changeMatch=path.match(/^\/api\/admin\/bookings\/([^/]+)\/changes\/([^/]+)$/);
 if(changeMatch && method==="PATCH"){
  const b=await parse(req),next=str(b.status,18),c=await db.prepare("SELECT * FROM booking_changes WHERE id=? AND booking_id=?").bind(changeMatch[2],changeMatch[1]).first();
  if(!c)return bad("Permintaan perubahan tidak ditemukan",404);
  if(next==="APPROVED"&&c.change_type==="REFUND"&&c.cancellation_cause==="GUEST"&&b.supplier_exposure_reviewed!==true)return bad("Owner wajib memeriksa biaya dan kewajiban operator sebelum menyetujui refund",422);
  allowedChangeTransition(c,next,b);
  // An approved reschedule has already changed booking_schedule, so it is executed immediately.
  // Leaving it APPROVED would permanently prevent handover.
  const applied=next==="APPROVED"&&c.change_type==="RESCHEDULE"?"EXECUTED":next;
  const stmts=[db.prepare("UPDATE booking_changes SET status=?,updated_at=CURRENT_TIMESTAMP,external_reference=? WHERE id=? AND status=?").bind(applied,next==="EXECUTED"?str(b.external_reference,120):null,c.id,c.status)];
  if(next==="APPROVED"){
   if(c.change_type==="RESCHEDULE"){
    stmts.push(db.prepare("INSERT INTO booking_schedule(booking_id,service_date,change_id) VALUES(?,?,?) ON CONFLICT(booking_id) DO UPDATE SET service_date=excluded.service_date,change_id=excluded.change_id,changed_at=CURRENT_TIMESTAMP").bind(c.booking_id,c.requested_date,c.id));
   }
   if(c.change_type==="CANCEL")stmts.push(db.prepare("UPDATE bookings SET status='CANCELLED' WHERE id=? AND payment_status='UNPAID'").bind(c.booking_id));
   if(c.change_type==="REFUND"){
    stmts.push(db.prepare("UPDATE bookings SET status='REFUND_PENDING' WHERE id=? AND payment_status='PAID'").bind(c.booking_id));
    stmts.push(db.prepare("UPDATE booking_payables SET status='ON_HOLD' WHERE booking_id=? AND status='DUE'").bind(c.booking_id));
   }
  }
  if(next==="EXECUTED"){
   if(c.refund_amount===0)stmts.push(db.prepare("UPDATE bookings SET status='CANCELLED' WHERE id=? AND status='REFUND_PENDING'").bind(c.booking_id));
   else stmts.push(db.prepare("UPDATE bookings SET status='REFUNDED',payment_status='REFUNDED' WHERE id=? AND status='REFUND_PENDING'").bind(c.booking_id));
  }
  stmts.push(db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)").bind(uuid(),"change",c.id,applied,JSON.stringify({booking_id:c.booking_id,external_reference:next==="EXECUTED"?str(b.external_reference,120):null})));
  await db.batch(stmts);
  return json({id:c.id,status:applied});
 }

 if(path==="/api/admin/market"){
  if(method==="GET")return json({items:(await db.prepare("SELECT * FROM market_price_refs ORDER BY observed_on DESC,created_at DESC LIMIT 200").all()).results});
  if(method==="POST"){
   const b=await parse(req),platform=str(b.platform,100),activity=str(b.activity_id,80),url=str(b.source_url,500),price=number(b.price,1,100000000),unit=str(b.unit,12),size=b.group_size==null?null:number(b.group_size,1,100),observed=str(b.observed_on,10),inclusions=str(b.inclusions,600);
   if(platform.length<2||!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity)||!price||!["person","group"].includes(unit)||(unit==="group"&&!size)||!dateOK(observed)||observed>new Date().toISOString().slice(0,10))return bad("Data referensi pasar tidak valid");
   if(url&&!url.startsWith("https://"))return bad("Sumber harga harus alamat HTTPS");
   const id=uuid();await db.prepare("INSERT INTO market_price_refs(id,activity_id,platform,source_url,unit,group_size,price,inclusions,observed_on,verified) VALUES(?,?,?,?,?,?,?,?,?,?)").bind(id,activity,platform,url,unit,size,price,inclusions,observed,b.owner_confirmed===true?1:0).run();
   await audit(db,"market_reference",id,"RECORDED",{platform,activity,price,verified:b.owner_confirmed===true});
   return json({id,status:"REFERENCE_ONLY"},201);
  }
 }
 if(path==="/api/admin/campaigns"){
  if(method==="GET"){
   const rows=await db.prepare("SELECT c.*,r.media_slug,r.revision,r.rejected_at,r.rejection_reason,r.replacement_id "+
    "FROM campaign_drafts c LEFT JOIN campaign_review_records r ON r.campaign_id=c.id "+
    "ORDER BY c.created_at DESC,c.rowid DESC LIMIT 200").all();
   return json({items:await Promise.all(rows.results.map(async x=>{
    const preview=x.media_slug?await resolveCampaignPhoto(db,x.media_slug):campaignPhotoForDraft(x.activity_id,x.caption);
    return {...x,status:x.rejected_at?"REJECTED":x.status,preview_photo:preview};
   }))});
  }
  if(method==="POST"){
   const b=await parse(req),activity=str(b.activity_id,80),platform=str(b.platform,50),caption=str(b.caption,2500);
   if(!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity)||!["Instagram","Facebook","TikTok","Website","WhatsApp Status","WhatsApp Business","Google Business Profile","YouTube Shorts","Telegram","Tripadvisor","GetYourGuide (mitra)","Klook (mitra)"].includes(platform)||caption.length<20)return bad("Konten kampanye tidak lengkap");
   const id=uuid();await db.prepare("INSERT INTO campaign_drafts(id,activity_id,platform,caption) VALUES(?,?,?,?)").bind(id,activity,platform,caption).run();
   await audit(db,"campaign",id,"DRAFT_CREATED",{platform,activity});return json({id,status:"DRAFT"},201);
  }
 }
 const oldApprovedRoute=path.match(/^\/api\/admin\/campaigns\/([^/]+)\/schedule$/);
 if(oldApprovedRoute&&method==="POST"){
  const b=await parse(req);
  if(b.owner_confirmed!==true||b.auto_publish!==true)return bad("Konfirmasi pemilik untuk penjadwalan otomatis diperlukan",403);
  const existing=await db.prepare("SELECT c.*,r.rejected_at,r.media_slug,r.revision "+
   "FROM campaign_drafts c LEFT JOIN campaign_review_records r ON c.id=r.campaign_id WHERE c.id=?")
   .bind(oldApprovedRoute[1]).first();
  if(!existing)return bad("Draf tidak ditemukan",404);
  if(existing.status!=="APPROVED"||existing.rejected_at||existing.public_url)
   return bad("Hanya draf yang sudah disetujui, belum diposting, dan belum dibatalkan dapat dijadwalkan",409);
  try{
   const date=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
   const queued=await queueApprovedCampaign(db,env,existing,b.platforms,await marketingEvidence(db,date),{fromApproved:true});
   return json({id:existing.id,...queued});
  }catch(e){return bad(String(e.message||"Penjadwalan gagal"),409);}
 }
 const research=path.match(/^\/api\/admin\/campaigns\/([^/]+)\/research-photo$/);
 if(research&&method==="POST"){
  const b=await parse(req);
  if(b.owner_confirmed!==true)return bad("Konfirmasi pemilik untuk foto otomatis diperlukan",403);
  const draft=await db.prepare("SELECT c.*,r.rejected_at FROM campaign_drafts c "+
   "LEFT JOIN campaign_review_records r ON c.id=r.campaign_id WHERE c.id=?").bind(research[1]).first();
  if(!draft||draft.status!=="DRAFT"||draft.rejected_at)return bad("Hanya draf belum disetujui yang dapat mengganti foto",409);
  if(!photoResearchEnabled(env))return json({status:"DISABLED"});
  const selected=await choosePhotoForReview(db,env,draft.activity_id,draft.caption,{discover:true});
  if(!selected.slug)return json({status:"NO_VALID_NEW_PHOTO",fallback:"GALLERY",source:"WIKIMEDIA_COMMONS",
    note:"Sumber belum menyediakan foto dengan izin dan lokasi yang dapat diperiksa; gunakan katalog lama atau Add Foto."});
  const check=await db.prepare("SELECT status FROM campaign_drafts WHERE id=?").bind(research[1]).first();
  if(check?.status!=="DRAFT")return bad("Draf sudah diproses; perubahan foto dibatalkan",409);
  await db.batch([
   db.prepare("INSERT INTO campaign_review_records(campaign_id,media_slug,revision) VALUES(?,?,0) "+
    "ON CONFLICT(campaign_id) DO UPDATE SET media_slug=excluded.media_slug WHERE rejected_at IS NULL "+
    "AND NOT EXISTS (SELECT 1 FROM approved_social_queue WHERE campaign_id=excluded.campaign_id)")
    .bind(research[1],selected.slug),
   db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
    .bind(uuid(),"campaign",research[1],"LICENSED_PHOTO_RESEARCH",JSON.stringify({
      source:selected.origin,photo_slug:selected.slug,owner_review_required:true}))
  ]);
  const photo=await resolveCampaignPhoto(db,selected.slug);
  return json({status:"PHOTO_SELECTED_FOR_REVIEW",photo,source:selected.origin});
 }
 const cm=path.match(/^\/api\/admin\/campaigns\/([^/]+)\/status$/);
 if(cm&&method==="PATCH"){
  const b=await parse(req),status=str(b.status,16),old=await db.prepare(
   "SELECT c.*,r.rejected_at,r.media_slug,r.revision,r.replacement_id "+
   "FROM campaign_drafts c LEFT JOIN campaign_review_records r ON r.campaign_id=c.id WHERE c.id=?").bind(cm[1]).first();
  if(!old)return bad("Kampanye tidak ditemukan",404);
  if(b.owner_confirmed!==true)return bad("Persetujuan pemilik wajib",403);
  if(old.rejected_at)return bad("Draf telah ditolak. Tinjau draf pengganti.",409);
  if(status==="REJECTED"){
   if(old.status!=="DRAFT")return bad("Hanya draf yang belum disetujui dapat ditolak",409);
   const reason=str(b.reason,180);
   if(reason.length<3)return bad("Tuliskan alasan penolakan minimal 3 karakter",422);
   const revision=Number(old.revision||0)+1;
   if(revision>100)return bad("Batas revisi tercapai; buat draf manual",422);
   const day=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
   let caption=replacementCampaignCaption({activity_id:old.activity_id,platform:old.platform,reason,revision,date:day});
   let generator="SAFE_EDITORIAL_FALLBACK";
   // Workers AI is optional: owner gets a draft immediately even when AI is unavailable.
   // No guests, tokens, rates or payment data is sent to the model.
   if(env.AI){
    try{
     const output=await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast",{messages:[
      {role:"system",content:"You are an Indonesian tourism editorial assistant. Produce ONE ORIGINAL social media caption in the same language as the previous caption, 90-850 characters. Do not invent prices, discounts, safety guarantees, wildlife sightings, live availability, legal authorizations, testimonials, or specific unverified inclusions. Do not use markdown or quotes. This is an OWNER REVIEW DRAFT and must never be published without approval. Avoid repeating the previous wording. End with an inviting question and hashtags."},
      {role:"user",content:"Brand Nusa Penida Experiences; platform "+old.platform+"; product "+old.activity_id+". Owner rejected prior draft with feedback: "+reason+". Prior copy: "+old.caption.slice(0,700)+". Write a different persuasive caption."}
     ]});
     const suggestion=str(output?.response||"",1150);
     const forbidden=/\b(rp\s?\d|guaranteed|100%|pasti melihat manta|gratis|free trip|discount|diskon|terjamin|insurance included)\b/i;
     if(suggestion.length>=90&&suggestion.length<=850&&!forbidden.test(suggestion)){
      const link="https://marketing-turism-agent.finchat-ai-gateway.workers.dev/"+
       (old.activity_id==="SNORKELING_3_SPOTS"?"snorkeling.html":"island-tour.html");
      caption="[REVIEW "+day+" · AI · V"+revision+"] "+suggestion+" "+link;
      generator="WORKERS_AI";
     }
    }catch(_){/* Fall back to curated safe alternatives; never block owner. */}
   }
   const originalSlug=old.media_slug||campaignPhotoForDraft(old.activity_id,old.caption).slug;
   const newPhoto=campaignPhotoForDraft(old.activity_id,caption,originalSlug,revision);
   const replacementId=uuid();
   // Transactional write: no duplicate replacement on repeat rejection or owner double-click.
   try{
    await db.batch([
     db.prepare("INSERT INTO campaign_drafts(id,activity_id,platform,caption,status) VALUES(?,?,?,?,?)")
      .bind(replacementId,old.activity_id,old.platform,caption,"DRAFT"),
     db.prepare("INSERT INTO campaign_review_records(campaign_id,media_slug,revision) VALUES(?,?,?)")
      .bind(replacementId,newPhoto.slug,revision),
     db.prepare("INSERT INTO campaign_review_records(campaign_id,media_slug,revision,rejected_at,rejection_reason,replacement_id) "+
      "VALUES(?,?,?,CURRENT_TIMESTAMP,?,?) ON CONFLICT(campaign_id) DO UPDATE SET "+
      "rejected_at=CURRENT_TIMESTAMP,rejection_reason=excluded.rejection_reason,replacement_id=excluded.replacement_id "+
      "WHERE campaign_review_records.rejected_at IS NULL")
      .bind(cm[1],originalSlug,Number(old.revision||0),reason,replacementId),
     db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
      .bind(uuid(),"campaign",cm[1],"REJECTED_REGENERATED",JSON.stringify({reason,revision,replacement_id:replacementId,media_slug:newPhoto.slug,generator}))
    ]);
   }catch(_){return bad("Gagal membuat pengganti atau draf sudah diproses. Muat ulang status.",409);}
   return json({id:cm[1],status:"REJECTED",replacement_id:replacementId,replacement_status:"DRAFT",preview_photo:newPhoto,generator});
  }
  if(!((old.status==="DRAFT"&&status==="APPROVED")||(old.status==="APPROVED"&&status==="PUBLISHED")))return bad("Status kampanye tidak valid");
  const posted=str(b.public_url,500);
  if(status==="PUBLISHED"&&!posted.startsWith("https://"))return bad("URL HTTPS posting nyata dibutuhkan. Dashboard tidak menerbitkan konten");
  if(status==="APPROVED"&&b.auto_publish===true){
   try{
    const platforms=b.platforms;
    const day=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
    const plan=await queueApprovedCampaign(db,env,old,platforms,await marketingEvidence(db,day));
    return json({id:cm[1],...plan});
   }catch(e){return bad(String(e.message||"Autopilot gagal"),422);}
  }
  if(status==="APPROVED"){
   const slug=old.media_slug||campaignPhotoForDraft(old.activity_id,old.caption).slug;
   await db.prepare("INSERT INTO campaign_review_records(campaign_id,media_slug,revision) VALUES(?,?,?) "+
    "ON CONFLICT(campaign_id) DO NOTHING").bind(cm[1],slug,Number(old.revision||0)).run();
  }
  await db.prepare("UPDATE campaign_drafts SET status=?,public_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
   .bind(status,status==="PUBLISHED"?posted:null,cm[1]).run();
  await audit(db,"campaign",cm[1],status,{url:posted||null});
  return json({id:cm[1],status});
 }
 const sm=path.match(/^\/api\/admin\/leads\/([^/]+)\/assistant$/);
 if(sm&&method==="POST"){
  const lead=await db.prepare("SELECT * FROM leads WHERE id=?").bind(sm[1]).first();
  if(!lead)return bad("Lead tidak ditemukan",404);
  const b=await parse(req),result={lead_id:lead.id,...leadScore(lead),reply:salesDraft(lead),status:"DRAFT_REVIEW",generator:"template"};
  if(env.AI&&b.use_ai===true){
   try{
    const gen=await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast",{messages:[
     {role:"system",content:"Anda AI sales wisata Nusa Penida. Buat draf jawaban singkat. Jangan mengarang atau memastikan harga, spot snorkeling, fasilitas, ketersediaan, keselamatan, cuaca, maupun pembayaran. Draf selalu perlu persetujuan pemilik."},
     {role:"user",content:"Produk "+lead.activity_id+", peserta "+lead.guests+", tanggal "+lead.requested_date+", pesan "+str(lead.message,400)+". Tanpa mengirim kontak pribadi ke model."}
    ]});
    if(gen?.response){result.reply=str(gen.response,1400);result.generator="workers-ai";}
   }catch(_){}
  }
  return json(result);
 }
 if(path==="/api/admin/analytics"&&method==="GET"){
  const [l,q,b,c]=await Promise.all(["leads","quotes","bookings","campaign_drafts"].map(t=>db.prepare("SELECT status,COUNT(*) n FROM "+t+" GROUP BY status").all()));
  return json({leads:l.results,quotes:q.results,bookings:b.results,campaigns:c.results,note:"Jumlah views/klik marketplace belum tersedia dan tidak dipalsukan"});
 }
 if(path==="/api/admin/marketing/meta/status"&&method==="GET"){
  const day=new Date().toISOString().slice(0,10);
  const status=metaConnectionStatus(env,day);
  const history=await recentMetaChecks(db),latest=history[0]||null;
  const checkedAt=latest?Date.parse(latest.checked_at):0;
  const fresh=Number.isFinite(checkedAt)&&Date.now()-checkedAt<36*60*60*1000&&Date.now()>=checkedAt;
  return json({...status,graph_api_verified:!!(fresh&&latest?.result==="READ_OK"),
   latest,history,check_fresh:!!(latest&&fresh),automatic_diagnostics:"DAILY_CRON_10_WITA",
   note:"GET-only ID checks. These do not verify publishing permissions, metrics access, or posting success."});
 }
 if(path==="/api/admin/marketing/meta/diagnostics"&&method==="POST"){
  const outcome=await runMetaDiagnostic(db,env,"OWNER_BUTTON");
  const latest=outcome.history[0]||null;
  return json({...outcome,latest,graph_api_verified:latest?.result==="READ_OK",
   note:"Read-only identity verification only; no permission-to-publish test or post."});
 }
 if(path==="/api/admin/marketing/publications"&&method==="GET"){
  const day=new Date().toISOString().slice(0,10);
  const rows=await db.prepare("SELECT id,week_start,intended_date,idea_index,status,facebook_post_id,instagram_post_id,error_reason,attempted_at,updated_at FROM marketing_publications ORDER BY intended_date DESC LIMIT 80").all();
  return json({independent_meta_publishing_enabled:metaPublicationConfig(env,day)!==null,
   operator_confirmation_required:true,posts:rows.results,
   note:"Indikator ENABLED hanya berarti konfigurasi memenuhi gerbang lokal; belum membuktikan izin Graph Meta valid atau konten berhasil terbit."});
 }
 if(path==="/api/admin/marketing/approved-queue"&&method==="GET"){
  return json(await approvedQueueStatus(db,env));
 }
 const qp=path.match(/^\/api\/admin\/marketing\/approved-queue\/([^/]+)\/cancel$/);
 if(qp&&method==="POST"){
  const b=await parse(req);
  if(b.owner_confirmed!==true)return bad("Konfirmasi pemilik diperlukan",403);
  if(!(await cancelApprovedQueue(db,qp[1])))return bad("Hanya posting QUEUED dapat dibatalkan",409);
  await audit(db,"approved_queue",qp[1],"CANCELLED_BY_OWNER");
  return json({id:qp[1],status:"CANCELLED"});
 }
 if(path==="/api/admin/marketing/intelligence"&&method==="GET"){
  const day=new Date().toISOString().slice(0,10);
  const observations=await marketingEvidence(db,day),weekly=weeklyDrafts(marketingWeekStart(day));
  const analysis=marketingIntelligence(observations,weekly,day);
  const decisions=(await db.prepare("SELECT week_start,strategy_version,input_observations,ranked_json,assumptions,created_at FROM marketing_decisions ORDER BY created_at DESC LIMIT 8").all()).results;
  return json({...analysis,decisions:decisions.map(x=>({...x,ranked:JSON.parse(x.ranked_json||"[]"),ranked_json:undefined})),
   production:{weekly_cron:"Senin 09.00 WITA",review_only:true,automatic_platform_publishing:approvedAutopilotEnabled(env),
    metricool_api:"EXTERNAL_API_NOT_CONNECTED",meta_graph:metaConnectionStatus(env,day).ids_valid&&metaConnectionStatus(env,day).tokens_present?"CREDENTIALS_PRESENT_NOT_VERIFIED":"CREDENTIALS_INCOMPLETE",
    payment_collection:false,guest_leads:env.PUBLIC_LEADS_ENABLED==="true"}});
 }
 if(path==="/api/admin/marketing/observations"&&method==="POST"){
  const b=await parse(req);
  if(b.owner_verified!==true)return bad("Persetujuan pemilik dan sumber statistik asli diperlukan",403);
  let input;try{input=validateMarketingObservation({...b,source:"OWNER_VERIFIED"});}
  catch(e){return bad(e.message,422);}
  if(input.campaign_id){
   const match=await db.prepare("SELECT activity_id,platform FROM campaign_drafts WHERE id=?").bind(input.campaign_id).first();
   if(!match||match.activity_id!==input.activity_id||match.platform!==input.platform)return bad("Kampanye sumber statistik tidak sesuai",422);
  }
  const id=uuid();
  await db.batch([
   db.prepare("INSERT INTO marketing_observations(id,platform,activity_id,campaign_id,observed_on,published_hour,impressions,reach,reactions,comments,shares,saves,link_clicks,source,source_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
    .bind(id,input.platform,input.activity_id,input.campaign_id,input.observed_on,input.published_hour,
    input.impressions,input.reach,input.reactions,input.comments,input.shares,input.saves,input.link_clicks,input.source,input.source_url),
   db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
    .bind(uuid(),"marketing_observation",id,"OWNER_VERIFIED_METRICS",JSON.stringify({platform:input.platform,activity_id:input.activity_id,observed_on:input.observed_on,source:input.source}))
  ]);
  return json({id,status:"RECORDED",source:"OWNER_VERIFIED",automatic_publishing:false},201);
 }
 if(path==="/api/admin/marketing/prepare-week"&&method==="POST"){
  const b=await parse(req);
  if(b.owner_confirmed!==true)return bad("Persetujuan pemilik wajib untuk menyiapkan kampanye",403);
  const day=new Date().toISOString().slice(0,10);
  return json({...await prepareMarketingWeek(db,env,day,"OWNER_DASHBOARD"),publication:"NONE",social_networks_connected:false});
 }
 if(path==="/api/admin/marketing/draft"&&method==="POST"){
  const b=await parse(req),activity=str(b.activity_id,80);
  if(!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity))return bad("Aktivitas tidak valid");
  const title=activity==="SNORKELING_3_SPOTS"?"Snorkeling 3 Spot Nusa Penida":"Island Tour Nusa Penida";
  const output={title,caption:"Jelajahi Nusa Penida bersama mitra operator lokal. Hubungi kami untuk konfirmasi tanggal, fasilitas, ketersediaan dan harga yang sesuai jumlah peserta.",status:"DRAFT_REVIEW",generator:"template"};
  if(env.AI&&b.use_ai===true){
   try{const result=await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast",{messages:[{role:"system",content:"Buat caption wisata singkat bahasa Indonesia. Jangan mengarang harga, spot, fasilitas, ketersediaan, asuransi atau klaim keselamatan. Draft butuh persetujuan."},{role:"user",content:"Buat konten promosi "+title}]});if(result?.response){output.caption=str(result.response,1300);output.generator="workers-ai"}}catch(_){}
  }
  return json(output);
 }
 return bad("Endpoint tidak ditemukan",404);
}
async function runIndependentMetaPublication(db,env,day){
 // No credential means zero external requests or DB status change.
 if(!metaPublicationConfig(env,day))return {status:"DISABLED"};
 const slot=await db.prepare("SELECT id,week_start,idea_index FROM marketing_publications WHERE intended_date=? AND status='READY' LIMIT 1").bind(day).first();
 if(!slot)return {status:"NO_ELIGIBLE_POST"};
 const claimed=await db.prepare("UPDATE marketing_publications SET status='ATTEMPTED',attempted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='READY'").bind(slot.id).run();
 if(claimed?.meta?.changes!==1)return {status:"CLAIMED_ELSEWHERE"};
 try{
  const record=async(channel,id)=>{
   const fields={facebook:"facebook_post_id",container:"instagram_container_id",instagram:"instagram_post_id"};
   const column=fields[channel];
   if(!column)throw Error("Unknown publishing step");
   await db.prepare("UPDATE marketing_publications SET "+column+"=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='ATTEMPTED'").bind(id,slot.id).run();
  };
  await publishMetaTourism(slot.week_start,slot.idea_index,env,record);
  await db.prepare("UPDATE marketing_publications SET status='POSTED',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='ATTEMPTED'").bind(slot.id).run();
  await audit(db,"marketing_publication",slot.id,"META_PUBLISHED",{week:slot.week_start,day});
  return {status:"POSTED"};
 }catch(_){
  // Facebook may have succeeded before Instagram failed; never retry automatically.
  await db.prepare("UPDATE marketing_publications SET status='REVIEW_REQUIRED',error_reason='Graph publish did not finish: inspect platform before any retry',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(slot.id).run();
  await audit(db,"marketing_publication",slot.id,"MANUAL_REVIEW_REQUIRED",{week:slot.week_start,day});
  return {status:"REVIEW_REQUIRED"};
 }
}
export default {
 async fetch(req,env,ctx){try{return await route(req,env,ctx)}catch(e){return bad(e instanceof SyntaxError?"JSON tidak valid":String(e.message||"Kesalahan"),e instanceof PricingError||e instanceof OperationsError?422:400)}},
 async scheduled(event,env){
  if(!env.DB)return;
  const day=new Date().toISOString().slice(0,10);
  if(event.cron==="0 1 * * 1"){await prepareMarketingWeek(env.DB,env,day,"WEEKLY_CRON");return;}
  // Only previously approved immutable snapshots are eligible. Never retry ambiguous POSTs.
  if(event.cron==="0 * * * *"){
   try{await dispatchApprovedQueue(env.DB,env);}
   catch(_){console.error("APPROVED_SOCIAL_DISPATCH_FAILED");}
   try{await collectApprovedInsights(env.DB,env);}
   catch(_){console.error("APPROVED_SOCIAL_METRICS_FAILED");}
   return;
  }
  // Existing daily trigger: check Meta read connectivity automatically without
  // ADMIN_TOKEN and without publishing. A diagnostic failure must not block the
  // separate explicitly approved publishing path.
  if(event.cron==="0 2 * * *"){
   // Recover missed Monday work without enqueuing any past-dated Meta post.
   try{await prepareMarketingWeek(env.DB,env,day,"DAILY_RECOVERY");}
   catch(_){console.error("WEEKLY_DRAFT_RECOVERY_FAILED");}
   try{await runMetaDiagnostic(env.DB,env,"DAILY_CRON");}
   catch(_){console.error("META_DIAGNOSTIC_UNAVAILABLE");}
   await runIndependentMetaPublication(env.DB,env,day);
  }
 }
};
