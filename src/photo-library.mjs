// Owner photo uploads: no new paid storage, preserve existing PHOTO_KV and public JPEG archive.
// Binary JPEG only, owner auth is enforced by src/worker.mjs before upload/list/assign.
import {campaignPhotoBySlug} from "./marketing-media.mjs";
import {isResearchSlug,resolveResearchPhoto} from "./photo-research.mjs";
const idRE=/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i;
const photoKey=id=>"owner-photo/v1/"+id;
const uploadedPrefix="owner-";
const maxBytes=850000;
export const isOwnerPhotoSlug=slug=>typeof slug==="string"&&slug.startsWith(uploadedPrefix)&&idRE.test(slug.slice(uploadedPrefix.length));
const ownerID=slug=>isOwnerPhotoSlug(slug)?slug.slice(uploadedPrefix.length):null;
const knownActivities=new Set(["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"]);
function result(row){
 const slug=uploadedPrefix+row.id;
 return {slug,photo_id:row.id,activity_id:row.activity_id,title:row.title,
  url:"/photos/owner/"+row.id,credit:"Nusa Penida Experiences",license:"OWNER_PERMISSION",
  source:"Foto milik pemilik Nusa Penida Experiences",alt:row.title,is_illustrative:false,
  owner_supplied:true,created_at:row.created_at};
}
export async function resolveCampaignPhoto(db,slug){
 if(isResearchSlug(slug))return resolveResearchPhoto(db,slug.slice(9));
 if(!isOwnerPhotoSlug(slug))return campaignPhotoBySlug(slug);
 const row=await db.prepare("SELECT id,title,activity_id,created_at FROM owner_photo_library WHERE id=?")
  .bind(ownerID(slug)).first();
 if(!row)throw Error("Foto pemilik tidak ditemukan");
 return result(row);
}
export async function listOwnerPhotos(db){
 const rows=await db.prepare("SELECT p.id,p.title,p.activity_id,p.created_at,p.bytes,"+
  "(SELECT COUNT(*) FROM approved_social_queue q WHERE q.photo_slug='owner-'||p.id) AS queued_posts "+
  "FROM owner_photo_library p ORDER BY p.created_at DESC,p.rowid DESC LIMIT 200").all();
 return rows.results.map(r=>({...result(r),bytes:r.bytes,queued_posts:r.queued_posts}));
}
function reply(message,status=400){return new Response(JSON.stringify({error:message}),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});}
function isJpeg(bytes){
 return bytes.length>=10000&&bytes.length<=maxBytes&&bytes[0]===0xff&&bytes[1]===0xd8&&
  bytes[2]===0xff&&bytes.at(-2)===0xff&&bytes.at(-1)===0xd9;
}
export async function storeOwnerPhoto(request,env,db){
 if(!env.PHOTO_KV)return reply("Penyimpanan PHOTO_KV belum tersedia",503);
 const declared=Number(request.headers.get("content-length")||0);
 if(declared>1100000)return reply("Ukuran unggahan melebihi batas 850 KB",413);
 const type=request.headers.get("content-type")||"";
 if(!type.startsWith("multipart/form-data;"))return reply("Gunakan formulir upload foto",415);
 const form=await request.formData();
 const file=form.get("file"),title=String(form.get("title")||"").trim().slice(0,121),
  activity=String(form.get("activity_id")||"");
 if(form.get("rights_confirmed")!=="true")return reply("Konfirmasi hak pakai dan izin subjek foto diperlukan",403);
 if(!knownActivities.has(activity)||title.length<2||title.length>120)return reply("Nama dan kategori foto harus valid",422);
 if(!file||typeof file.arrayBuffer!=="function"||file.type!=="image/jpeg"||file.size>maxBytes||file.size<10000)
  return reply("Unggah JPG maksimal 850 KB (foto dari HP akan dikompresi di browser)",422);
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(!isJpeg(bytes))return reply("Berkas JPG tidak valid atau terlalu besar",422);
 const sha=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)))
  .map(x=>x.toString(16).padStart(2,"0")).join("");
 const duplicate=await db.prepare("SELECT id FROM owner_photo_library WHERE digest=?").bind(sha).first();
 if(duplicate)return reply("Foto yang sama sudah ada di pustaka",409);
 const id=crypto.randomUUID();
 try{await env.PHOTO_KV.put(photoKey(id),bytes.buffer);}
 catch(_){return reply("Gagal menyimpan foto ke Cloudflare KV",503);}
 try{
  await db.batch([
   db.prepare("INSERT INTO owner_photo_library(id,activity_id,title,digest,bytes,rights_confirmed) VALUES(?,?,?,?,?,1)")
    .bind(id,activity,title,sha,bytes.length),
   db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
    .bind(crypto.randomUUID(),"owner_photo",id,"OWNER_PHOTO_ADDED",JSON.stringify({activity_id:activity,bytes:bytes.length}))
  ]);
 }catch(_){
  try{await env.PHOTO_KV.delete(photoKey(id));}catch(_){}
  return reply("Gagal mencatat foto atau foto sudah tersedia",409);
 }
 return new Response(JSON.stringify({status:"STORED",photo:result({id,activity_id:activity,title,created_at:new Date().toISOString()})}),
 {status:201,headers:{"content-type":"application/json","cache-control":"no-store"}});
}
export async function serveOwnerPhoto(request,env,db){
 if(request.method!=="GET"&&request.method!=="HEAD")return reply("Metode tidak diizinkan",405);
 const id=new URL(request.url).pathname.slice("/photos/owner/".length);
 if(!idRE.test(id))return reply("Foto tidak ditemukan",404);
 const exists=await db.prepare("SELECT id FROM owner_photo_library WHERE id=?").bind(id).first();
 if(!exists)return reply("Foto tidak ditemukan",404);
 let bytes;try{bytes=await env.PHOTO_KV?.get(photoKey(id),"arrayBuffer");}catch(_){return reply("Foto belum tersedia",503);}
 if(!bytes)return reply("Foto belum tersedia",503);
 const raw=new Uint8Array(bytes);
 if(!isJpeg(raw))return reply("Foto rusak",503);
 return new Response(request.method==="HEAD"?null:raw,{headers:{
  "content-type":"image/jpeg","content-length":String(raw.length),
  "cache-control":"public, max-age=3600","x-content-type-options":"nosniff",
  "cross-origin-resource-policy":"cross-origin"
 }});
}
export async function selectOwnerPhoto(db,campaignID,photoID){
 if(!idRE.test(campaignID)||!idRE.test(photoID))throw Error("ID foto atau draf tidak valid");
 const row=await db.prepare("SELECT c.status,c.activity_id,c.public_url,r.rejected_at "+
  "FROM campaign_drafts c LEFT JOIN campaign_review_records r ON c.id=r.campaign_id WHERE c.id=?")
  .bind(campaignID).first();
 if(!row||row.status!=="DRAFT"||row.rejected_at||row.public_url)
  throw Error("Hanya draf aktif yang belum disetujui boleh diganti fotonya");
 const photo=await db.prepare("SELECT activity_id FROM owner_photo_library WHERE id=?").bind(photoID).first();
 if(!photo||photo.activity_id!==row.activity_id)throw Error("Foto tidak sesuai kategori kampanye");
 // Transactionally freeze selection before approval; existing queue snapshots are immutable.
 await db.batch([
  db.prepare("INSERT INTO campaign_review_records(campaign_id,media_slug,revision) VALUES(?,?,0) "+
   "ON CONFLICT(campaign_id) DO UPDATE SET media_slug=excluded.media_slug "+
   "WHERE rejected_at IS NULL AND NOT EXISTS (SELECT 1 FROM approved_social_queue WHERE campaign_id=excluded.campaign_id)")
   .bind(campaignID,uploadedPrefix+photoID),
  db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
   .bind(crypto.randomUUID(),"campaign",campaignID,"OWNER_PHOTO_SELECTED",JSON.stringify({photo_id:photoID}))
 ]);
 return {campaign_id:campaignID,photo_id:photoID,photo_slug:uploadedPrefix+photoID};
}
