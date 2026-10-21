// Autonomous organic marketing intelligence for Nusa Penida Experiences.
// Deterministic, explainable and bounded: learns ONLY from owner-verified or official
// platform metrics, never invents analytics, guest data or production API permissions.
export const MARKETING_STRATEGY_VERSION="1.0.0";
export const MARKETING_PLATFORMS=Object.freeze(["Instagram","Facebook","TikTok"]);
export const MARKETING_ACTIVITIES=Object.freeze(["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"]);
const finiteInt=(x,max=1000000000)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
const dayOK=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+"T00:00:00Z"))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
export function validateMarketingObservation(data,today=new Date().toISOString().slice(0,10)){
 if(!data||!MARKETING_PLATFORMS.includes(data.platform)||!MARKETING_ACTIVITIES.includes(data.activity_id))throw Error("Kanal atau aktivitas pemasaran tidak valid");
 if(!dayOK(data.observed_on)||data.observed_on>today)throw Error("Tanggal pengamatan tidak valid atau di masa depan");
 if(data.published_hour!==null&&data.published_hour!==undefined&&!finiteInt(data.published_hour,23))throw Error("Jam publikasi WITA harus 0–23");
 const out={platform:data.platform,activity_id:data.activity_id,observed_on:data.observed_on,published_hour:data.published_hour??null};
 for(const key of ["impressions","reach","reactions","comments","shares","saves","link_clicks"]){
  if(!finiteInt(data[key]??0))throw Error("Metrik "+key+" harus bilangan bulat yang valid");
  out[key]=data[key]??0;
 }
 if(out.reach>out.impressions&&out.impressions>0)throw Error("Jangkauan tidak boleh lebih dari impressions dalam laporan ini");
 if(out.impressions===0&&["reactions","comments","shares","saves","link_clicks"].some(k=>out[k]>0))throw Error("Interaksi harus memiliki impressions terukur");
 if(!["OWNER_VERIFIED","META_INSIGHTS","METRICOOL_EXPORT"].includes(data.source))throw Error("Sumber metrik harus dinyatakan");
 out.source=data.source;
 out.source_url=typeof data.source_url==="string"&&/^https:\/\//.test(data.source_url)&&data.source_url.length<=500?data.source_url:"";
 out.campaign_id=typeof data.campaign_id==="string"&&/^[a-f0-9-]{20,70}$/i.test(data.campaign_id)?data.campaign_id:null;
 return out;
}
const keyOf=v=>v.platform+":"+v.activity_id;
// A conservative score: engagement & clicks normalised by impressions,
// with a fixed prior to prevent overfitting to one viral or tiny post.
function evidenceScore(rows){
 const impressions=rows.reduce((s,r)=>s+(r.impressions||0),0);
 const engagement=rows.reduce((s,r)=>s+(r.reactions||0)+(r.comments||0)+(r.shares||0)+(r.saves||0),0);
 const clicks=rows.reduce((s,r)=>s+(r.link_clicks||0),0);
 const engagementRate=impressions?Math.min(0.25,engagement/impressions):0;
 const clickRate=impressions?Math.min(0.12,clicks/impressions):0;
 const raw=Math.min(100,60*Math.min(1,engagementRate/0.08)+40*Math.min(1,clickRate/0.04));
 const weight=impressions/(impressions+500);
 return {score:Math.round(50*(1-weight)+raw*weight),impressions,
  engagement_rate:Number(engagementRate.toFixed(4)),click_rate:Number(clickRate.toFixed(4)),samples:rows.length};
}
export function marketingIntelligence(observations,weekIdeas,today=new Date().toISOString().slice(0,10)){
 if(!dayOK(today))throw Error("Tanggal analisis tidak valid");
 const earliest=new Date(today+"T00:00:00Z");
 earliest.setUTCDate(earliest.getUTCDate()-90);
 const start=earliest.toISOString().slice(0,10);
 const eligible=(Array.isArray(observations)?observations:[]).filter(x=>
  MARKETING_PLATFORMS.includes(x.platform)&&MARKETING_ACTIVITIES.includes(x.activity_id)&&
  dayOK(x.observed_on)&&x.observed_on>=start&&x.observed_on<=today&&finiteInt(x.impressions));
 const strategies=MARKETING_PLATFORMS.flatMap(platform=>MARKETING_ACTIVITIES.map(activity_id=>{
  const group=eligible.filter(o=>o.platform===platform&&o.activity_id===activity_id);
  const e=evidenceScore(group);
  const exploration=e.samples===0?8:e.samples===1?4:e.samples===2?2:0;
  return {platform,activity_id,...e,priority:e.score+exploration,
   basis:e.samples===0?"BELUM_ADA_DATA":e.impressions<300?"DATA_TERBATAS":"METRIK_TERUKUR"};
 }));
 const prior=new Map(strategies.map(s=>[keyOf(s),s]));
 const recommendations=(Array.isArray(weekIdeas)?weekIdeas:[]).map((idea,i)=>{
  const evidence=prior.get(keyOf(idea))||{score:50,priority:50,basis:"BELUM_ADA_DATA",samples:0};
  return {index:i,platform:idea.platform,activity_id:idea.activity_id,planned_date:idea.planned_date,
   strategy_score:evidence.score,priority:evidence.priority,basis:evidence.basis,samples:evidence.samples};
 }).sort((a,b)=>b.priority-a.priority||a.index-b.index);
 const best_hours={};
 for(const platform of MARKETING_PLATFORMS){
  const hours=Array.from({length:24},(_,hour)=>{
   const group=eligible.filter(o=>o.platform===platform&&o.published_hour===hour);
   return {hour,...evidenceScore(group)};
  }).filter(x=>x.samples>=2&&x.impressions>=300);
  hours.sort((a,b)=>b.score-a.score||b.impressions-a.impressions||a.hour-b.hour);
  best_hours[platform]=hours.length?{hour:hours[0].hour,source:"MEASURED",observations:hours[0].samples}:{
   hour:null,source:"INSUFFICIENT_DATA",observations:0};
 }
 return {strategy_version:MARKETING_STRATEGY_VERSION,observation_count:eligible.length,
  lookback_days:90,best_hours,strategies,recommendations,
  note:eligible.length?"Strategi berbasis data terukur; skor prediksi bukan jaminan hasil.":
  "Belum ada metrik nyata. Gunakan variasi organik; sistem tidak mengarang engagement."};
}
