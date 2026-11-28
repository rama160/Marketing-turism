import {renderWebsiteSitemap} from "./website-cms.mjs";
import {publishedArticles,articleSitemap} from "./seo-articles.mjs";
import {gscToken,gscConfigured} from "./seo-keywords.mjs";

const origin="https://nusapenidaexperiences.com";
const endpoint="https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const hour=3600000;
const pathRE=/^(?:\/|\/(?:snorkeling|island-tour|west-tour|east-tour)\.html|\/en\/tours(?:\/(?:snorkeling|island|west|east))?|\/(?:id|en)\/experiences\/[a-z0-9-]+|\/(?:id|en)\/articles(?:\/[a-z0-9-]+)?)$/;
export function indexingInventory(xml){
 const entries=new Map();
 for(const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)){
  let u;try{u=new URL(m[1]);}catch{continue}
  if(u.origin!==origin||u.search||u.hash||!pathRE.test(u.pathname))continue;
  const p=u.pathname,kind=p.includes("/experiences/")?"ACTIVITY":/^\/(?:id|en)\/articles$/.test(p)?"ARTICLE_LIST":p.includes("/articles/")?"ARTICLE":"PAGE";
  entries.set(u.href,{url:u.href,kind,language:p.startsWith("/en/")?"en":"id"});
 }
 return [...entries.values()];
}
async function inventory(db){
 const [xml,articles]=await Promise.all([renderWebsiteSitemap(db,origin),publishedArticles(db)]);
 return indexingInventory(xml.replace("</urlset>",()=>articleSitemap(articles,origin)+"</urlset>"));
}
const bounded=(s,n=400)=>typeof s==="string"?s.slice(0,n):null;
export function indexVerdict(result,url){
 const s=result?.indexStatusResult;
 if(!s||typeof s.verdict!=="string")return {status:"UNKNOWN",coverage:null,canonical:null,last_crawl:null,inspect_link:null};
 const canonical=bounded(s.googleCanonical,1000);
 const status=s.verdict==="PASS"?(canonical&&canonical!==url?"ALTERNATE":"INDEXED"):["FAIL","NEUTRAL"].includes(s.verdict)?"NOT_INDEXED":"UNKNOWN";
 let inspect_link=null;
 try{const link=new URL(result.inspectionResultLink);if(link.origin==="https://search.google.com")inspect_link=link.href;}catch{}
 return {status,coverage:bounded(s.coverageState),canonical,last_crawl:bounded(s.lastCrawlTime,80),inspect_link};
}
export function dueIndexing(items,now,limit=8){
 const due=items.filter(x=>!x.checked_at||now-Date.parse(x.checked_at)>=(x.status==="INDEXED"?24*hour:6*hour));
 return due.sort((a,b)=>(a.checked_at?Date.parse(a.checked_at):0)-(b.checked_at?Date.parse(b.checked_at):0)||a.url.localeCompare(b.url)).slice(0,limit);
}
export async function readIndexing(db,env){
 const urls=await inventory(db);
 const rows=(await db.prepare("SELECT * FROM seo_indexing_checks").all()).results||[];
 const map=new Map(rows.map(x=>[x.url,x]));
 const items=urls.map(u=>({...u,...(map.get(u.url)||{status:"UNCHECKED",checked_at:null})}));
 const latest=await db.prepare("SELECT * FROM seo_indexing_runs ORDER BY hour_key DESC LIMIT 1").first();
 const counts={INDEXED:0,NOT_INDEXED:0,ALTERNATE:0,UNKNOWN:0,UNCHECKED:0};
 for(const item of items)counts[item.status]=(counts[item.status]||0)+1;
 return {items,counts,total:items.length,configured:gscConfigured(env),latest,source:"Google Search Console URL Inspection API"};
}
export async function collectIndexing(db,env,{now=Date.now(),request=fetch,limit=8}={}){
 if(!gscConfigured(env))return {status:"NOT_CONFIGURED"};
 const current=await readIndexing(db,env),targets=dueIndexing(current.items,now,Math.min(8,Math.max(1,limit)));
 if(!targets.length)return {status:"UP_TO_DATE",checked:0};
 const key=new Date(now).toISOString().slice(0,13),stamp=new Date(now).toISOString();
 const lock=await db.prepare("INSERT OR IGNORE INTO seo_indexing_runs(hour_key,started_at,state,checked) VALUES(?,?,'RUNNING',0)").bind(key,stamp).run();
 if(lock.meta?.changes!==1)return {status:"RECENT",checked:0};
 let error=null,checked=0;const updates=[];
 try{
  const token=await gscToken(env,request,now);
  for(const item of targets){
   const res=await request(endpoint,{method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:JSON.stringify({inspectionUrl:item.url,siteUrl:env.GSC_PROPERTY,languageCode:"en-US"}),signal:AbortSignal.timeout(10000)});
   if(!res.ok){error=res.status===403?"ACCESS":res.status===401?"AUTH":res.status===429?"QUOTA":"HTTP_"+res.status;break;}
   const data=await res.json();
   if(!data?.inspectionResult?.indexStatusResult){error="RESPONSE";break;}
   const v=indexVerdict(data.inspectionResult,item.url);
   updates.push(db.prepare("INSERT INTO seo_indexing_checks(url,status,coverage,canonical,last_crawl,inspect_link,checked_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(url) DO UPDATE SET status=excluded.status,coverage=excluded.coverage,canonical=excluded.canonical,last_crawl=excluded.last_crawl,inspect_link=excluded.inspect_link,checked_at=excluded.checked_at").bind(item.url,v.status,v.coverage,v.canonical,v.last_crawl,v.inspect_link,new Date().toISOString()));
   checked++;
  }
 }catch(e){error=["CONFIG","AUTH","ACCESS","REQUEST"].includes(e?.message)?e.message:"REQUEST";}
 if(updates.length)await db.batch(updates);
 await db.prepare("UPDATE seo_indexing_runs SET state=?,checked=?,error=? WHERE hour_key=?").bind(error?"ERROR":"DONE",checked,error,key).run();
 return {status:error?"ERROR":"DONE",checked,error};
}
