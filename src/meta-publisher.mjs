// Optional independent Meta publishing adapter. DISABLED unless owner explicitly opts in.
// Never reuse WhatsApp credentials, never log tokens, never retry ambiguous publishes.
import {marketingMediaForIdea} from "./marketing-media.mjs";
import {weeklyDrafts} from "./sales.mjs";

const idPattern=/^[0-9]{6,30}$/;
const isoDay=/^\d{4}-\d{2}-\d{2}$/;
// Cloudflare production bindings are META_PAGE_ID, META_IG_USER_ID and
// META_PAGE_ACCESS_TOKEN. Read deprecated META_GRAPH_* names only as a
// compatibility fallback. Never copy or expose secrets in an API response.
function metaCredentials(env){
 const pageId=env.META_PAGE_ID||env.META_GRAPH_PAGE_ID;
 const igId=env.META_IG_USER_ID||env.META_GRAPH_IG_USER_ID;
 const pageToken=env.META_PAGE_ACCESS_TOKEN||env.META_GRAPH_PAGE_TOKEN;
 const igToken=env.META_IG_ACCESS_TOKEN||env.META_GRAPH_IG_TOKEN||pageToken;
 return {pageId,igId,pageToken,igToken};
}
export function metaConnectionStatus(env,day){
 const c=metaCredentials(env);
 const ids_valid=idPattern.test(c.pageId||"")&&idPattern.test(c.igId||"");
 const tokens_present=typeof c.pageToken==="string"&&c.pageToken.length>=24&&
  typeof c.igToken==="string"&&c.igToken.length>=24;
 const owner_opted_in=env.META_GRAPH_PUBLISH_ENABLED==="true"&&env.META_GRAPH_OWNER_APPROVED==="true";
 const start=env.META_GRAPH_PUBLISH_START;
 const start_valid=isoDay.test(start||"")&&!Number.isNaN(Date.parse(start+"T00:00:00Z"))&&
  new Date(start+"T00:00:00Z").toISOString().slice(0,10)===start;
 return {ids_valid,tokens_present,owner_opted_in,start_valid,
  publishing_enabled:ids_valid&&tokens_present&&owner_opted_in&&start_valid&&day>=start,
  // Credentials may exist without being valid at Meta. Do not claim that API calls worked.
  graph_api_verified:false};
}
export function metaPublicationConfig(env,day){
 if(!metaConnectionStatus(env,day).publishing_enabled)return null;
 const c=metaCredentials(env);
 return {pageId:c.pageId,igId:c.igId,pageToken:c.pageToken,igToken:c.igToken,
  start:env.META_GRAPH_PUBLISH_START};
}
// Read-only identity probes: do not send tokens as query parameters or return
// Meta error bodies (which may contain sensitive diagnostic details).
export async function checkMetaReadAccess(env,request=fetch){
 const c=metaCredentials(env);
 if(!metaConnectionStatus(env,new Date().toISOString().slice(0,10)).ids_valid||
    typeof c.pageToken!=="string"||c.pageToken.length<24)
  return {configured:false,page:{ok:false},instagram:{ok:false}};
 async function probe(path){
  try{
   const res=await request("https://graph.facebook.com/v26.0"+path,{
    method:"GET",headers:{authorization:"Bearer "+c.pageToken},signal:AbortSignal.timeout(10000)});
   return {ok:res.ok,status:res.status};
  }catch{return {ok:false,status:null};}
 }
 const [page,instagram]=await Promise.all([
  probe("/"+c.pageId+"?fields=id,name"),
  probe("/"+c.igId+"?fields=id,username")
 ]);
 return {configured:true,page,instagram};
}
function campaignForIdea(week,index){
 const idea=weeklyDrafts(week)[index],photo=marketingMediaForIdea(index);
 if(!idea||!["Instagram","Facebook"].includes(idea.platform))throw Error("Channel or campaign idea not eligible for independent Meta publication");
 const copyright="Photo: "+photo.credit+" / "+photo.license+". Source: "+photo.source+". License: "+photo.license_url;
 return {imageUrl:photo.url,caption:idea.caption.replace(/^\[REVIEW [^\]]+\] /,"")+"\n\n"+copyright,photo};
}
export async function postGraph(path,params,token,request=fetch){
 if(!/^\/[0-9]+\/(photos|media|media_publish)$/.test(path))throw Error("Disallowed Meta path");
 const body=new URLSearchParams(params);
 const response=await request("https://graph.facebook.com/v26.0"+path,{
  method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/x-www-form-urlencoded"},
  body:body.toString(),signal:AbortSignal.timeout(15000)});
 let data;try{data=await response.json()}catch{throw Error("Meta response is not valid JSON")}
 if(!response.ok||!idPattern.test(String(data?.id||"")))throw Error("Meta publish step rejected (HTTP "+response.status+")");
 return data.id;
}
// Callback must record each completed external action in D1 before the next request.
// If any operation fails or times out, the row stays REVIEW_REQUIRED, not retried.
export async function publishMetaTourism(week,index,env,record,request=fetch){
 const config=metaPublicationConfig(env,new Date().toISOString().slice(0,10));
 if(!config)throw Error("Direct Meta publishing is not explicitly enabled or credentials missing");
 const content=campaignForIdea(week,index);
 const facebookId=await postGraph("/"+config.pageId+"/photos",
  {url:content.imageUrl,caption:content.caption,published:"true"},config.pageToken,request);
 await record("facebook",facebookId);
 const container=await postGraph("/"+config.igId+"/media",
  {image_url:content.imageUrl,caption:content.caption},config.igToken,request);
 await record("container",container);
 const instagramId=await postGraph("/"+config.igId+"/media_publish",
  {creation_id:container},config.igToken,request);
 await record("instagram",instagramId);
 return {facebookId,instagramId};
}
