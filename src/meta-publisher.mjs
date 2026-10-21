// Optional independent Meta publishing adapter. DISABLED unless owner explicitly opts in.
// Never reuse WhatsApp credentials, never log tokens, never retry ambiguous publishes.
import {marketingMediaForIdea} from "./marketing-media.mjs";
import {weeklyDrafts} from "./sales.mjs";

const idPattern=/^[0-9]{6,30}$/;
const isoDay=/^\d{4}-\d{2}-\d{2}$/;
export function metaPublicationConfig(env,day){
 if(env.META_GRAPH_PUBLISH_ENABLED!=="true"||env.META_GRAPH_OWNER_APPROVED!=="true")return null;
 const start=env.META_GRAPH_PUBLISH_START;
 if(!isoDay.test(start||"")||day<start)return null;
 if(!idPattern.test(env.META_GRAPH_PAGE_ID||"")||!idPattern.test(env.META_GRAPH_IG_USER_ID||""))return null;
 if(typeof env.META_GRAPH_PAGE_TOKEN!=="string"||env.META_GRAPH_PAGE_TOKEN.length<24)return null;
 const token=env.META_GRAPH_IG_TOKEN||env.META_GRAPH_PAGE_TOKEN;
 if(typeof token!=="string"||token.length<24)return null;
 return {pageId:env.META_GRAPH_PAGE_ID,igId:env.META_GRAPH_IG_USER_ID,
  pageToken:env.META_GRAPH_PAGE_TOKEN,igToken:token,start};
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
