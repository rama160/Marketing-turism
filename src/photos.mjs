// Self-origin public destination photo gateway. Strict slug and upstream allowlist, no guest data.
const photoFiles=Object.freeze(Object.fromEntries([["kelingking","Kelingking_Beach.jpg","3a"],["broken-beach","Broken_Beach_Nusa_Penida.jpg","09"],["angels-billabong","Angel-billabong.jpg","55"],["crystal-bay","Crystal_Bay_Beach.jpg","76"],["diamond-beach","Diamond_Beach_in_Nusa_Penida,_Bali.jpg","49"],["atuh-beach","Atuh_Beach,_Nusa_Penida_Bali.jpg","59"],["tree-house","Amazing_Tree_House_at_Nusa_Penida.jpg","81"],["manta-bay","Snorkeling-with-manta-penida.jpg","9a"],["manta-point","19-Indonesia-Bali_Nusa-Penida_Manta-Point_14_(Manta_Ray)-APiazza.JPG","dc"],["gamat-bay","Penida-snorkeling.jpg","fd"]].map(([key,name,hash])=>{
 const enc=encodeURIComponent(name);
 const root="https://upload.wikimedia.org/wikipedia/commons/";
 return [key,{thumb:root+"thumb/"+hash[0]+"/"+hash+"/"+enc+"/640px-"+enc,original:root+hash[0]+"/"+hash+"/"+enc}];
})));
export const photoKeys=Object.freeze(Object.keys(photoFiles));
export async function servePhoto(request,ctx){
 const url=new URL(request.url),slug=url.pathname.replace(/^\/photos\//,"");
 if(!Object.hasOwn(photoFiles,slug))return new Response("Foto tidak ditemukan",{status:404,headers:{"cache-control":"no-store"}});
 if(request.method!=="GET")return new Response("Method not allowed",{status:405});
 const cache=typeof caches!=="undefined"?caches.default:null;
 try{const cached=await cache?.match(request);if(cached)return cached;}catch(_){}
 for(const upstream of [photoFiles[slug].thumb,photoFiles[slug].original]){
  try{
   const r=await fetch(upstream,{redirect:"follow",signal:AbortSignal.timeout(9000),headers:{"Accept":"image/jpeg,image/*"}});
   const type=r.headers.get("content-type")||"";
   if(!r.ok||!/^image\/(jpeg|png|webp)/i.test(type)){try{r.body?.cancel?.();}catch(_){}continue;}
   const result=new Response(r.body,{status:200,headers:{"content-type":type.split(";")[0],"cache-control":"public, max-age=86400, stale-while-revalidate=604800","x-content-type-options":"nosniff","x-photo-status":"upstream-ok"}});
   if(cache&&ctx?.waitUntil)ctx.waitUntil(cache.put(request,result.clone()).catch(()=>{}));
   return result;
  }catch(_){}
 }
 return new Response("Foto belum tersedia, coba lagi nanti",{status:502,headers:{"cache-control":"no-store","x-photo-status":"upstream-unavailable"}});
}
