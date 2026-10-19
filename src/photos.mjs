// Same-origin destination photos backed by verified optimized JPEG assets in public GitHub.
export const photoKeys=Object.freeze(["kelingking","broken-beach","angels-billabong","crystal-bay","diamond-beach","atuh-beach","tree-house","manta-bay","manta-point","gamat-bay"]);
const cdn="https://raw.githubusercontent.com/rama160/Marketing-turism/main/public/photos/";
export async function servePhoto(req,ctx){
 const slug=new URL(req.url).pathname.replace(/^\/photos\//,"");
 if(!photoKeys.includes(slug))return new Response("Photo not found",{status:404});
 if(req.method!=="GET")return new Response("Method not allowed",{status:405});
 const cache=typeof caches==="undefined"?null:caches.default;
 try{const hit=await cache?.match(req);if(hit)return hit;}catch(_){}
 try{
  const r=await fetch(cdn+slug+".jpg",{signal:AbortSignal.timeout(12000),headers:{"accept":"image/jpeg"}});
  if(!r.ok||!(r.headers.get("content-type")||"").startsWith("image/"))throw Error("Photo upstream unavailable");
  const bytes=new Uint8Array(await r.arrayBuffer());
  if(bytes.length<10000||bytes.length>900000||bytes[0]!==255||bytes[1]!==216||bytes.at(-2)!==255||bytes.at(-1)!==217)throw Error("Image verification failed");
  const out=new Response(bytes,{headers:{"content-type":"image/jpeg","cache-control":"public, max-age=3600, stale-while-revalidate=604800","x-content-type-options":"nosniff","x-photo-status":"upstream-ok"}});
  if(cache&&ctx?.waitUntil)ctx.waitUntil(cache.put(req,out.clone()).catch(()=>{}));
  return out;
 }catch(_){return new Response("Photo gateway unavailable",{status:502,headers:{"cache-control":"no-store","x-photo-status":"upstream-unavailable"}});}
}
