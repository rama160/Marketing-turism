// Public destination JPGs: Cloudflare static asset -> Worker photo KV -> verified GitHub archive.
// No guest or booking data enters this namespace. Bump version when source photo files change.
export const photoKeys=Object.freeze(["kelingking","broken-beach","angels-billabong","crystal-bay","diamond-beach","atuh-beach","tree-house","manta-bay","manta-point","gamat-bay"]);
const cdn="https://raw.githubusercontent.com/rama160/Marketing-turism/main/public/photos/";
const storageVersion="v1/";
const isJpeg=bytes=>bytes.length>=10000&&bytes.length<=900000&&bytes[0]===255&&bytes[1]===216&&bytes.at(-2)===255&&bytes.at(-1)===217;
const imageResponse=(bytes,status)=>new Response(bytes,{headers:{
 "content-type":"image/jpeg","cache-control":"public, max-age=86400, stale-while-revalidate=604800",
 "x-content-type-options":"nosniff","x-photo-status":status
}});
// Only prebuilt, bounded variants. No paid image resizing and no arbitrary source URL.
export async function readResponsivePhoto(req,env,key){
 const width=new URL(req.url).searchParams.get("npew");
 if(!["240","480","800","1200"].includes(width)||!env.ASSETS||!(/^[a-z-]+$|^[0-9a-f]{8}-[0-9a-f-]{27,36}$/.test(key)))return null;
 try{
  const path="/__npe_templates/responsive/"+key+"-"+width+".webp";
  const asset=await env.ASSETS.fetch(new Request(new URL(path,req.url),{method:"GET"}));
  if(!asset.ok||!(asset.headers.get("content-type")||"").startsWith("image/webp"))return null;
  const bytes=new Uint8Array(await asset.arrayBuffer());
  if(bytes.length<20||bytes.length>900000||String.fromCharCode(...bytes.slice(0,4))!=="RIFF"||String.fromCharCode(...bytes.slice(8,12))!=="WEBP")return null;
  return new Response(req.method==="HEAD"?null:bytes,{headers:{"content-type":"image/webp","content-length":String(bytes.length),"cache-control":"public,max-age=86400","x-content-type-options":"nosniff","x-photo-status":"responsive-webp"}});
 }catch{return null;}
}
export function responsivePhotoSet(url){
 if(!/^\/photos\/(?:website\/[0-9a-f]{8}-[0-9a-f-]{27,36}|[a-z-]+)$/.test(url))return "";
 return [240,480,800,1200].map(w=>url+"?npew="+w+" "+w+"w").join(", ");
}
export function addResponsivePhotos(html,home=false){
 return html.replace(/<img\b[^>]*>/gi,tag=>{
  const url=tag.match(/\ssrc="([^"]+)"/)?.[1]||"",set=responsivePhotoSet(url);
  if(!set||/\ssrcset=/.test(tag))return tag;
  const hero=/data-npe-slot="hero"/.test(tag);
  const thumb=home&&!hero&&!/(?:package-cover-image|spot-cover-image)/.test(tag);
  const sizes=hero?"(max-width: 700px) 800px, 100vw":thumb?"(max-width: 700px) 28vw, 140px":"(max-width: 700px) 100vw, 50vw";
  return tag.slice(0,-1)+' srcset="'+set+'" sizes="'+sizes+'">';
 });
}
export async function servePhoto(req,env={},ctx){
 const u=new URL(req.url),slug=u.pathname.replace(/^\/photos\//,"").replace(/\.jpg$/,"");
 if(!photoKeys.includes(slug))return new Response("Photo not found",{status:404});
 if(req.method!=="GET")return new Response("Method not allowed",{status:405});
 const responsive=await readResponsivePhoto(req,env,slug);if(responsive)return responsive;
 // A distinct cache key prevents stale 3.0.3 gateway responses from blocking KV population.
 const cacheReq=new Request(new URL("/photos/"+slug+"?photo-cache=v1",req.url).href);
 const cache=typeof caches==="undefined"?null:caches.default;
 try{const hit=await cache?.match(cacheReq);if(hit)return hit;}catch(_){}
 const save=async(response)=>{if(cache&&ctx?.waitUntil)ctx.waitUntil(cache.put(cacheReq,response.clone()).catch(()=>{}));return response;};
 // Once Wrangler deploys ./public/photos, use the Cloudflare-native static binary asset.
 try{
  if(env.ASSETS){
   const assetUrl=new URL("/photos/"+slug+".jpg",req.url);
   const asset=await env.ASSETS.fetch(new Request(assetUrl.href));
   if(asset.ok&&(asset.headers.get("content-type")||"").startsWith("image/")){
    const bytes=new Uint8Array(await asset.arrayBuffer());
    if(isJpeg(bytes))return await save(imageResponse(bytes,"asset-local"));
   }
  }
 }catch(_){}
 // KV is persistent across regions and deployments, unlike an edge cache or external mirror.
 const key=storageVersion+slug;
 try{
  const stored=await env.PHOTO_KV?.get(key,"arrayBuffer");
  if(stored){
   const bytes=new Uint8Array(stored);
   if(isJpeg(bytes))return await save(imageResponse(bytes,"kv-cache"));
  }
 }catch(_){}
 try{
  const upstream=await fetch(cdn+slug+".jpg",{signal:AbortSignal.timeout(12000),headers:{"accept":"image/jpeg"}});
  if(!upstream.ok||!(upstream.headers.get("content-type")||"").startsWith("image/"))throw Error("Photo archive unavailable");
  const bytes=new Uint8Array(await upstream.arrayBuffer());
  if(!isJpeg(bytes))throw Error("Invalid archived JPEG");
  try{await env.PHOTO_KV?.put(key,bytes.buffer);}catch(_){}
  return await save(imageResponse(bytes,"upstream-ok"));
 }catch(_){
  // The browser's photo-loader.js tries the local static asset and GitHub mirror.
  // Do not return an HTML/200 masquerading as a photo.
  return new Response("Photo temporarily unavailable",{status:502,headers:{"cache-control":"no-store","x-photo-status":"upstream-unavailable"}});
 }
}
