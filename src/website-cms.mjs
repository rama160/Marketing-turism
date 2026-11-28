import {HERO_LIST_KEY,HERO_ICONS,validateHeroHighlights,formatRupiah,normalizePublicPriceLabel} from "./site-content.mjs";
import {readResponsivePhoto,addResponsivePhotos,responsivePhotoSet} from "./photos.mjs";
import {renderRelatedArticleLinks} from "./seo-articles.mjs";
// Independent website content publishing. Never mutate operator rates, quote snapshots or bookings.
// Website photos use the existing PHOTO_KV binding but a separate key prefix and metadata table.
const emailWhatsApp="628561752525";
const mediaKey=id=>"website-media/v1/"+id;
const idRE=/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i;
const slugRE=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const legacyPhotoSlots=new Set(["hero","snorkeling","island","west","east"]);
const galleryPhotoSlots=new Set([
 "snorkeling-manta-bay","snorkeling-manta-point","snorkeling-crystal-bay","snorkeling-gamat-bay",
 "island-west","island-east",
 "west-kelingking","west-broken-beach","west-angels-billabong","west-crystal-bay",
 "east-diamond-beach","east-atuh-beach","east-tree-house"
]);
const validSlots=new Set([...legacyPhotoSlots,...galleryPhotoSlots]);
const staticParents=new Map([["static:snorkeling","SNORKELING"],["static:island","ISLAND_TOUR"],["static:west","ISLAND_TOUR"],["static:east","ISLAND_TOUR"]]);
const validCategories=new Set(["SNORKELING","ISLAND_TOUR","TRANSPORT","OTHER"]);
const customCategoryValid=x=>x.startsWith("CUSTOM:")&&/^[\p{L}\p{N}][\p{L}\p{N} &()'’./-]{1,59}$/u.test(x.slice(7));
export async function listWebsiteCategories(db){
 const r=await db.prepare("SELECT category,name FROM website_custom_categories ORDER BY name COLLATE NOCASE").all();
 return {items:r.results};
}
export async function createWebsiteCategory(db,input){
 const name=String(input?.name||"").trim().replace(/\s+/g," ");
 const category="CUSTOM:"+name;
 if(!customCategoryValid(category))throw Error("Nama kategori harus 2–60 karakter berupa teks biasa");
 if(["snorkeling","island tour","fast boat / transport","aktivitas lainnya","transport","other"].includes(name.toLowerCase()))throw Error("Kategori sudah tersedia");
 await db.prepare("INSERT INTO website_custom_categories(category,name) VALUES(?,?) ON CONFLICT(name) DO NOTHING").bind(category,name).run();
 return await db.prepare("SELECT category,name FROM website_custom_categories WHERE name=? COLLATE NOCASE").bind(name).first();
}
async function verifyCategory(db,data){
 if(validCategories.has(data.category))return;
 const row=await db.prepare("SELECT category FROM website_custom_categories WHERE category=?").bind(data.category).first();
 if(!row)throw Error("Kategori belum terdaftar. Tambahkan kategori terlebih dahulu.");
}
const plain=(x,max=1500)=>typeof x==="string"&&x.trim().length>0&&x.trim().length<=max&&!/[<>\u0000-\u001f\u007f]/.test(x);
const escapeHTML=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const jsonReply=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const reject=(msg,code=422)=>jsonReply({error:msg},code);
const binaryJpeg=b=>b.length>=10000&&b.length<=850000&&b[0]===255&&b[1]===216&&b[2]===255&&b.at(-2)===255&&b.at(-1)===217;
const u16=x=>String(x??"").trim();
// URL identifiers are allocated on the server only, and never change after creation.
const slugPart=(value,max)=>u16(value).normalize("NFKD").replace(/\p{Mark}/gu,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,max).replace(/-+$/g,"");
export function websiteSlugBase(input){
 const parent=u16(input.parent_activity);
 const prefix=staticParents.has(parent)?parent.slice(7):parent.startsWith("activity:")?slugPart(parent.slice(9),45):"";
 const title=slugPart(input.title_en,90)||slugPart(input.title_id,90)||"activity";
 const segment=title.length>=3?title:"activity-"+title;
 const joined=prefix&&!segment.startsWith(prefix+"-")?prefix+"-"+segment:segment;
 return joined.slice(0,90).replace(/-+$/g,"");
}
// Textareas accept normal paragraphs, tabs and pasted Windows line endings; HTML and other control bytes remain forbidden.
const multiline=(x,max)=>x.length>=3&&x.length<=max&&!/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/.test(x);
const seoText=x=>u16(x).replace(/[<>\u0000-\u001f\u007f-\u009f]/g," ").replace(/\s+/g," ").trim();
function seoClip(x,max){
 if(x.length<=max)return x;
 const cut=x.slice(0,max-1),space=cut.lastIndexOf(" ");
 return (space>max*0.6?cut.slice(0,space):cut).replace(/[ ,;:.\-–]+$/,"")+"…";
}
export function suggestWebsiteSEO(input){
 const contexts={
  SNORKELING:{en:"Snorkeling",id:"Snorkeling"},
  ISLAND_TOUR:{en:"Island Tour",id:"Wisata Pulau"},
  TRANSPORT:{en:"Transport",id:"Transportasi"},
  OTHER:{en:"",id:""}
 };
 const staticContext={
  "static:snorkeling":contexts.SNORKELING,
  "static:island":contexts.ISLAND_TOUR,
  "static:west":{en:"West Island Tour",id:"Wisata Barat"},
  "static:east":{en:"East Island Tour",id:"Wisata Timur"}
 };
 const out={};
 for(const lang of ["en","id"]){
  const title=seoText(input["title_"+lang]);
  const summary=seoText(input["summary_"+lang]);
  const desc=seoText(input["description_"+lang]);
  const context=(staticContext[input.parent_activity]||contexts[input.category]||{en:input.category?.startsWith("CUSTOM:")?seoText(input.category.slice(7)):"",id:input.category?.startsWith("CUSTOM:")?seoText(input.category.slice(7)):""})[lang];
  const geographicContext=input.parent_activity==="activity:nusa-lembongan-island-tour"?"Nusa Lembongan":"";
  const located=title&&geographicContext&&!title.toLowerCase().includes(geographicContext.toLowerCase())?title+" "+geographicContext:title;
  const topic=located&&context&&!located.toLowerCase().includes(context.toLowerCase())?located+" – "+context:located;
  const brand=" | Nusa Penida Experiences";
  out["seo_title_"+lang]=topic?seoClip(topic,65-brand.length)+brand:"";
  const combined=summary&&desc&&!desc.toLowerCase().startsWith(summary.toLowerCase())&&summary.length<110?summary+" "+desc:summary||desc;
  const snippet=combined||topic;
  out["seo_description_"+lang]=seoClip(snippet,160);
 }
 return out;
}
export function validateWebsiteDraft(input){
 if(!input||typeof input!=="object")throw Error("Isi aktivitas tidak valid");
 const slug=u16(input.slug).toLowerCase(),category=u16(input.category);
 if(slug.length<3||slug.length>90||!slugRE.test(slug))throw Error("Slug gunakan huruf kecil, angka, dan tanda hubung (3–90 karakter)");
 if(!validCategories.has(category)&&!customCategoryValid(category))throw Error("Kategori aktivitas tidak valid");
 const parent_activity=u16(input.parent_activity);
 if(parent_activity){
  const staticCategory=staticParents.get(parent_activity);
  const dynamicSlug=parent_activity.startsWith("activity:")?parent_activity.slice(9):"";
  if(staticCategory?staticCategory!==category:(!slugRE.test(dynamicSlug)||dynamicSlug===slug||dynamicSlug.length>90))throw Error("Aktivitas induk tidak valid atau kategori berbeda");
 }
 const data={slug,category,parent_activity};
 for(const field of ["title_id","title_en","summary_id","summary_en","description_id","description_en"]){
  const max=field.startsWith("description_")?3000:field.startsWith("summary_")?300:150;
  const isTitle=field.startsWith("title_");
  const value=u16(input[field]).replace(/\r\n?/g,"\n");
  if(!(isTitle?plain(value,max)&&value.length>=3:multiline(value,max)))throw Error(field+" harus teks biasa 3–"+max+" karakter");

  data[field]=value;
 }
 const seoFields=["seo_title_id","seo_title_en","seo_description_id","seo_description_en"];
 const generated=suggestWebsiteSEO(data);
 const mode=input.seo_mode|| (seoFields.some(f=>u16(input[f]))?"MANUAL":"AUTO");
 if(!["AUTO","MANUAL"].includes(mode))throw Error("Mode SEO tidak valid");
 data.seo_mode=mode;
 for(const f of seoFields){
  const limit=f.startsWith("seo_title")?140:300;
  const raw=mode==="MANUAL"?u16(input[f]):"";
  // Manual metadata is single line; allow ordinary textarea line breaks but not HTML/control characters.
  const value=raw.replace(/\r\n?|\n|\t/g," ").replace(/ +/g," ").trim();
  if(value&&!plain(value,limit))throw Error(f+" tidak valid");
  data[f]=value||generated[f];
 }
 data.media_id=u16(input.media_id);
 if(data.media_id&&!idRE.test(data.media_id))throw Error("Foto utama tidak valid");
 // A selling price is optional; it is never the supplier net from the quote engine.
 // Drafts may contain unverified prices, but publication refuses them.
 const rawAmount=input.price_amount;
 data.price_amount=rawAmount===null||rawAmount===undefined||String(rawAmount).trim()===""?null:Number(rawAmount);
 if(data.price_amount!==null&&(!Number.isSafeInteger(data.price_amount)||data.price_amount<1||data.price_amount>1000000000))
  throw Error("Harga jual harus berupa rupiah bulat antara Rp 1 dan Rp 1.000.000.000");
 data.price_unit=u16(input.price_unit)||"PERSON";
 if(!["PERSON","CAR","GROUP","TICKET"].includes(data.price_unit))throw Error("Satuan harga tidak valid");
 data.price_from=input.price_from!==false;
 data.price_label_id=u16(input.price_label_id);
 data.price_label_en=u16(input.price_label_en);
 const hasLabel=!!(data.price_label_id||data.price_label_en);
 if(hasLabel&&(!plain(data.price_label_id,120)||!plain(data.price_label_en,120)))
  throw Error("Label harga harus lengkap dalam bahasa Indonesia dan Inggris");
 if(data.price_amount!==null){
  data.price_label_id=formatRupiah(data.price_amount,data.price_unit,data.price_from,"id");
  data.price_label_en=formatRupiah(data.price_amount,data.price_unit,data.price_from,"en");
 }else{
  data.price_label_id=normalizePublicPriceLabel(data.price_label_id,"id");
  data.price_label_en=normalizePublicPriceLabel(data.price_label_en,"en");
 }
 data.price_verified=input.price_verified===true&&(data.price_amount!==null||hasLabel);
 data.supplier_confirmed=input.supplier_confirmed===true;
 return data;
}
async function verifyParent(db,data){
 if(!data.parent_activity||staticParents.has(data.parent_activity))return;
 const parent=await db.prepare("SELECT published_json FROM website_activities WHERE slug=? AND status='PUBLISHED' AND published_json IS NOT NULL").bind(data.parent_activity.slice(9)).first();
 if(!parent)throw Error("Aktivitas induk belum diterbitkan");
 const a=JSON.parse(parent.published_json);
 if(a.parent_activity||a.category!==data.category)throw Error("Induk harus aktivitas utama dengan kategori yang sama");
}
export function activityPublicPrice(a,locale){
 if(a.price_verified!==true)return "";
 const lang=locale==="en"?"en":"id";
 if(a.price_amount!==null&&a.price_amount!==undefined)return formatRupiah(a.price_amount,a.price_unit,a.price_from!==false,lang);
 return normalizePublicPriceLabel(a["price_label_"+lang],lang);
}
function publicValue(row){
 const a=JSON.parse(row.published_json);
 return {id:row.id,...a,price_label_id:activityPublicPrice(a,"id"),price_label_en:activityPublicPrice(a,"en"),photo_url:a.media_id?"/photos/website/"+a.media_id:null,published_at:row.published_at};
}
export async function listWebsiteActivities(db){
 const r=await db.prepare("SELECT id,slug,draft_json,published_json,status,version,published_at,created_at,updated_at FROM website_activities ORDER BY updated_at DESC LIMIT 150").all();
 return {items:r.results.map(x=>({id:x.id,slug:x.slug,draft:JSON.parse(x.draft_json),published:x.published_json?JSON.parse(x.published_json):null,status:x.status,version:x.version,published_at:x.published_at,updated_at:x.updated_at,pending_changes:x.published_json!==x.draft_json}))};
}
export async function publicWebsiteActivities(db){
 const r=await db.prepare("SELECT id,published_json,published_at FROM website_activities WHERE status='PUBLISHED' AND published_json IS NOT NULL ORDER BY published_at DESC LIMIT 100").all();
 const items=r.results.map(publicValue);
 const roots=new Set(items.filter(a=>!a.parent_activity).map(a=>"activity:"+a.slug));
 return {items:items.filter(a=>!a.parent_activity||staticParents.has(a.parent_activity)||roots.has(a.parent_activity))};
}
export async function saveWebsiteActivity(db,b,id=null){
 if(!b?.draft||typeof b.draft!=="object")throw Error("Isi aktivitas tidak valid");
 if(!id){
  const base=websiteSlugBase(b.draft);
  const data=validateWebsiteDraft({...b.draft,slug:base});
  await verifyCategory(db,data);
  await verifyParent(db,data);
  id=crypto.randomUUID();
  // Atomic uniqueness check: parallel saves or identical titles never overwrite an existing activity.
  for(let attempt=1;attempt<=100;attempt++){
   const suffix=attempt===1?"":"-"+attempt;
   const slug=base.slice(0,90-suffix.length).replace(/-+$/g,"")+suffix;
   const write=await db.prepare("INSERT INTO website_activities(id,slug,draft_json,status,version) VALUES(?,?,?,'DRAFT',1) ON CONFLICT(slug) DO NOTHING").bind(id,slug,JSON.stringify({...data,slug})).run();
   if(write.meta?.changes===1)return {id,slug,version:1,status:"DRAFT"};
  }
  throw Error("URL otomatis belum tersedia. Ubah judul aktivitas lalu coba lagi.");
 }
 if(!idRE.test(id))throw Error("ID aktivitas tidak valid");
 const prev=await db.prepare("SELECT version,slug,draft_json FROM website_activities WHERE id=?").bind(id).first();
 if(!prev)throw Error("Aktivitas tidak ditemukan");
 if(!Number.isSafeInteger(b.expected_version)||prev.version!==b.expected_version)throw Error("Versi telah berubah; muat ulang editor");
 const previous=JSON.parse(prev.draft_json);
 const data=validateWebsiteDraft({...b.draft,slug:prev.slug});
 await verifyCategory(db,data);
  await verifyParent(db,data);
 if((previous.parent_activity||"")!==data.parent_activity)throw Error("Aktivitas induk tidak dapat diubah setelah dibuat");
 if(previous.category!==data.category&&!data.parent_activity) {
  const child=await db.prepare("SELECT id FROM website_activities WHERE json_extract(draft_json,'$.parent_activity')=? OR json_extract(published_json,'$.parent_activity')=? LIMIT 1").bind("activity:"+data.slug,"activity:"+data.slug).first();
  if(child)throw Error("Kategori induk tidak dapat diubah selama masih memiliki detail");
 }
 const write=await db.prepare("UPDATE website_activities SET draft_json=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=?").bind(JSON.stringify(data),id,prev.version).run();
 if(write.meta?.changes!==1)throw Error("Konflik penyimpanan. Muat ulang editor");
 return {id,slug:prev.slug,version:prev.version+1,status:"DRAFT_SAVED"};
}
export async function publishWebsiteActivity(db,id,body){
 if(!idRE.test(id)||body.owner_confirmed!==true)throw Error("Publikasi harus disetujui pemilik");
 const row=await db.prepare("SELECT version,draft_json FROM website_activities WHERE id=?").bind(id).first();
 if(!row)throw Error("Aktivitas tidak ditemukan");
 if(!Number.isSafeInteger(body.expected_version)||row.version!==body.expected_version)throw Error("Versi berubah. Muat ulang sebelum terbit");
 const draft=validateWebsiteDraft(JSON.parse(row.draft_json));
 await verifyCategory(db,draft);
 await verifyParent(db,draft);
 if((draft.price_amount!==null||draft.price_label_id||draft.price_label_en)&&!draft.price_verified)
  throw Error("Harga belum diverifikasi. Centang konfirmasi harga atau kosongkan harga sebelum terbit.");
 if(!draft.supplier_confirmed)throw Error("Konfirmasi cakupan layanan dan operator wajib sebelum terbit");
 if(!draft.media_id)throw Error("Pilih foto utama yang memiliki izin penggunaan sebelum terbit");
 const photo=await db.prepare("SELECT id FROM website_media WHERE id=?").bind(draft.media_id).first();
 if(!photo)throw Error("Foto utama tidak ditemukan");
 const snapshot=JSON.stringify(draft);
 const write=await db.prepare("UPDATE website_activities SET published_json=?,status='PUBLISHED',version=version+1,published_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=?").bind(snapshot,id,row.version).run();
 if(write.meta?.changes!==1)throw Error("Konflik penerbitan; muat ulang");
 await db.prepare("INSERT INTO website_activity_revisions(id,activity_id,version,snapshot_json) VALUES(?,?,?,?)").bind(crypto.randomUUID(),id,row.version+1,snapshot).run();
 return {id,status:"PUBLISHED",version:row.version+1,url:"/en/experiences/"+draft.slug};
}
export async function archiveWebsiteActivity(db,id,body){
 if(!idRE.test(id)||body.owner_confirmed!==true)throw Error("Arsip memerlukan konfirmasi pemilik");
 const write=await db.prepare("UPDATE website_activities SET status='ARCHIVED',version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=?").bind(id,body.expected_version).run();
 if(write.meta?.changes!==1)throw Error("Aktivitas tidak ditemukan atau versi berubah");
 return {id,status:"ARCHIVED"};
}
// A photo is protected if any public page slot, gallery spot, or saved activity draft/publication uses it.
const mediaUsageSQL=`SELECT media_id, COUNT(*) AS used FROM (
 SELECT media_id FROM website_photo_slots
 UNION ALL SELECT media_id FROM website_gallery_photo_slots
 UNION ALL SELECT json_extract(draft_json,'$.media_id') AS media_id FROM website_activities
 UNION ALL SELECT json_extract(published_json,'$.media_id') AS media_id FROM website_activities
) WHERE media_id IS NOT NULL AND media_id!='' GROUP BY media_id`;
// D1 permits at most five compound SELECT terms. Count article references separately.
const articleMediaUsageSQL=`SELECT media_id, COUNT(*) AS used FROM (
 SELECT draft_media_id AS media_id FROM seo_articles
 UNION ALL SELECT published_media_id FROM seo_articles
) WHERE media_id IS NOT NULL AND media_id!='' GROUP BY media_id`;
export async function listWebsiteMedia(db){
 const [media,usage,articleUsage]=await Promise.all([
  db.prepare("SELECT id,title,alt_id,alt_en,bytes,created_at FROM website_media ORDER BY created_at DESC LIMIT 200").all(),
  db.prepare(mediaUsageSQL).all(),
  db.prepare(articleMediaUsageSQL).all()
 ]);
 const used=new Map();
 for(const r of [...(usage.results||[]),...(articleUsage.results||[])])used.set(r.media_id,(used.get(r.media_id)||0)+(Number(r.used)||0));
 return {items:(media.results||[]).map(x=>({...x,url:"/photos/website/"+x.id,usage_count:used.get(x.id)||0}))};
}
export async function deleteWebsiteMedia(db,env,id,body){
 if(!idRE.test(id))return reject("Foto tidak ditemukan",404);
 if(body?.owner_confirmed!==true)return reject("Penghapusan memerlukan persetujuan pemilik",403);
 const photo=await db.prepare("SELECT id,title FROM website_media WHERE id=?").bind(id).first();
 if(!photo)return reject("Foto tidak ditemukan",404);
 // Use a single guarded DELETE to avoid races with photo assignments between a read and delete.
 const sql=`DELETE FROM website_media WHERE id=?
 AND NOT EXISTS (SELECT 1 FROM website_photo_slots WHERE media_id=?)
 AND NOT EXISTS (SELECT 1 FROM website_gallery_photo_slots WHERE media_id=?)
 AND NOT EXISTS (SELECT 1 FROM website_activities WHERE json_extract(draft_json,'$.media_id')=? OR json_extract(published_json,'$.media_id')=?)
 AND NOT EXISTS (SELECT 1 FROM seo_articles WHERE draft_media_id=? OR published_media_id=?)`;
 const write=await db.prepare(sql).bind(id,id,id,id,id,id,id).run();
 if(write.meta?.changes!==1)return reject("Foto masih digunakan di website atau draft aktivitas. Ganti foto di semua bagian terlebih dahulu.",409);
 // Metadata is already removed; an eventual KV cleanup failure must not resurrect a broken image reference.
 let storage_cleaned=true;
 try{await env.PHOTO_KV?.delete(mediaKey(id));}catch(_){storage_cleaned=false;}
 return jsonReply({id,deleted:true,storage_cleaned});
}
export async function storeWebsiteMedia(request,env,db){
 if(!env.PHOTO_KV)return reject("Penyimpanan foto Cloudflare tidak tersedia",503);
 if(Number(request.headers.get("content-length")||0)>1100000)return reject("Foto terlalu besar",413);
 if(!(request.headers.get("content-type")||"").startsWith("multipart/form-data;"))return reject("Gunakan formulir foto",415);
 const form=await request.formData();
 const file=form.get("file"),title=u16(form.get("title")),altId=u16(form.get("alt_id")),altEn=u16(form.get("alt_en"));
 if(form.get("rights_confirmed")!=="true")return reject("Konfirmasi hak foto wajib",403);
 if(!plain(title,120)||!plain(altId,180)||!plain(altEn,180))return reject("Judul dan alt text bahasa Indonesia/Inggris wajib diisi");
 if(!file||file.type!=="image/jpeg"||file.size>850000||file.size<10000)return reject("Unggah foto JPG 10–850 KB yang sudah dikompresi",422);
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(!binaryJpeg(bytes))return reject("Format berkas JPG tidak valid");
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))).map(x=>x.toString(16).padStart(2,"0")).join("");
 // A previously uploaded identical image is reusable: return it instead of rejecting an upload.
 const existing=await db.prepare("SELECT id,title,alt_id,alt_en FROM website_media WHERE digest=?").bind(digest).first();
 if(existing)return jsonReply({...existing,url:"/photos/website/"+existing.id,reused:true});
 const id=crypto.randomUUID();
 try{await env.PHOTO_KV.put(mediaKey(id),bytes.buffer);}catch(_){return reject("Gagal menyimpan foto",503);}
 try{
  await db.prepare("INSERT INTO website_media(id,title,alt_id,alt_en,digest,bytes,rights_confirmed) VALUES(?,?,?,?,?,?,1)").bind(id,title,altId,altEn,digest,bytes.length).run();
 }catch(_){
  try{await env.PHOTO_KV.delete(mediaKey(id));}catch(_){}
  const reused=await db.prepare("SELECT id,title,alt_id,alt_en FROM website_media WHERE digest=?").bind(digest).first();
  if(reused)return jsonReply({...reused,url:"/photos/website/"+reused.id,reused:true});
  return reject("Gagal mencatat foto. Periksa kembali",409);
 }
 return jsonReply({id,url:"/photos/website/"+id,title,alt_id:altId,alt_en:altEn},201);
}
export async function serveWebsiteMedia(request,env,db){
 if(request.method!=="GET"&&request.method!=="HEAD")return reject("Metode tidak diizinkan",405);
 const id=new URL(request.url).pathname.slice("/photos/website/".length);
 if(!idRE.test(id))return reject("Foto tidak ditemukan",404);
 if(!(await db.prepare("SELECT id FROM website_media WHERE id=?").bind(id).first()))return reject("Foto tidak ditemukan",404);
 const responsive=await readResponsivePhoto(request,env,id);if(responsive)return responsive;
 const raw=await env.PHOTO_KV?.get(mediaKey(id),"arrayBuffer");
 if(!raw||!binaryJpeg(new Uint8Array(raw)))return reject("Foto tidak tersedia",503);
 return new Response(request.method==="HEAD"?null:raw,{headers:{"content-type":"image/jpeg","content-length":String(raw.byteLength),"cache-control":"public,max-age=86400","x-content-type-options":"nosniff"}});
}
export async function getWebsiteSlots(db){
 const [legacy,gallery]=await Promise.all([
  db.prepare("SELECT slot,media_id,alt_id,alt_en FROM website_photo_slots").all(),
  db.prepare("SELECT slot,media_id,alt_id,alt_en FROM website_gallery_photo_slots").all()
 ]);
 return {items:[...(legacy.results||[]),...(gallery.results||[])].map(x=>({...x,url:"/photos/website/"+x.media_id}))};
}
export async function updateWebsiteSlot(db,b){
 if(b.owner_confirmed!==true||!validSlots.has(b.slot)||!idRE.test(u16(b.media_id)))throw Error("Slot atau foto tidak valid");
 const media=await db.prepare("SELECT id,alt_id,alt_en FROM website_media WHERE id=?").bind(b.media_id).first();
 if(!media)throw Error("Foto tidak ditemukan");
 const table=legacyPhotoSlots.has(b.slot)?"website_photo_slots":"website_gallery_photo_slots";
 await db.prepare("INSERT INTO "+table+"(slot,media_id,alt_id,alt_en) VALUES(?,?,?,?) ON CONFLICT(slot) DO UPDATE SET media_id=excluded.media_id,alt_id=excluded.alt_id,alt_en=excluded.alt_en,updated_at=CURRENT_TIMESTAMP").bind(b.slot,media.id,media.alt_id,media.alt_en).run();
 return {slot:b.slot,media_id:media.id,url:"/photos/website/"+media.id};
}



// Original decision-support copy, separate from owner-managed offers and prices.
const competitiveTourGuides={
 "snorkeling": {
  "title": [
   "Panduan memilih snorkeling Nusa Penida",
   "How to choose a Nusa Penida snorkeling tour"
  ],
  "sections": [
   [
    [
     "Sharing atau private?",
     "Shared boat or private snorkeling?"
    ],
    [
     "Sharing cocok untuk wisatawan yang ingin berbagi biaya per orang. Private cocok untuk grup yang menginginkan kapal khusus; minta harga per kapal, kapasitas dan daftar spot sebelum memilih.",
     "Choose a shared trip if you prefer a per-person fare. A private boat suits groups wanting their own charter; ask for the total boat price, capacity and proposed sites before choosing."
    ]
   ],
   [
    [
     "Manta Bay atau Manta Point?",
     "Manta Bay or Manta Point?"
    ],
    [
     "Kedua lokasi berbeda. Sekitar 2–3 jam untuk tiga spot dari pilihan yang tersedia; rute lebih jauh dapat berbeda. Minta konfirmasi spot yang benar-benar ditawarkan, bukan hanya nama paket. Operator dapat mengganti lokasi karena gelombang, arus atau visibilitas. Penampakan manta tidak dijamin; jangan mengejar atau menyentuh satwa laut.",
     "These are distinct sites. Allow approximately 2–3 hours for three selected sites; longer routes may vary. Ask which one the operator actually plans to visit rather than relying on a package name. Waves, currents and visibility can change the route. Manta sightings are not guaranteed; never chase or touch marine wildlife."
    ]
   ],
   [
    [
     "Persiapan dan biaya",
     "What to confirm before snorkeling"
    ],
    [
     "Sampaikan pengalaman berenang, jumlah tamu dan lokasi menginap. Pastikan titik kumpul, durasi, peralatan, pendamping, aturan keselamatan, biaya per orang atau kapal serta apakah transfer dan makan termasuk. Jadwalkan wisata darat pada hari lain.",
     "Share swimming ability, group size and accommodation location. Confirm meeting point, duration, equipment, supervision, safety arrangements, per-person or boat price, and whether transfers and meals are included. Plan land touring on another day."
    ]
   ]
  ],
  "links": [
   "island",
   "west",
   "east"
  ]
 },
 "west": {
  "title": [
   "Rencana wisata Nusa Penida Barat",
   "Planning your Nusa Penida West Tour"
  ],
  "sections": [
   [
    [
     "Contoh urutan perjalanan",
     "Suggested West Tour itinerary"
    ],
    [
     "Mulai dari titik jemput yang disepakati di pulau, lanjut ke panorama Kelingking, Broken Beach dan Angel’s Billabong, lalu Crystal Bay bila waktu dan akses memungkinkan. Estimasi 4–5 jam di pulau, di luar fast boat. Urutan ini ilustrasi, bukan jadwal tetap; utamakan waktu kembali ke pelabuhan bila mengejar kapal.",
     "Start at an agreed pickup point on the island, then consider Kelingking viewpoint, Broken Beach and Angel’s Billabong, followed by Crystal Bay if time and access permit. Allow approximately 4–5 hours on the island, excluding fast boat transfers. This is an illustrative route, not a fixed schedule; allow for your return boat if needed."
    ]
   ],
   [
    [
     "Untuk siapa rute Barat?",
     "Who is the West Tour for?"
    ],
    [
     "Rute Barat cocok untuk wisatawan yang ingin melihat tebing dan panorama ikonik. Akses turun ke pantai atau berenang bukan kewajiban; pilih titik pandang yang sesuai kemampuan dan kondisi keselamatan.",
     "Choose the West if iconic cliffs and coastal viewpoints are your priority. Beach descents or swimming are not required; choose accessible viewpoints suited to your mobility and safe conditions."
    ]
   ],
   [
    [
     "Apa yang perlu dipastikan?",
     "Private car tour: what to confirm"
    ],
    [
     "Konfirmasi titik jemput, kapasitas mobil, rute, waktu perjalanan dan biaya kendaraan. Minta rincian tiket kapal, makan siang, tiket masuk, parkir dan pengeluaran pribadi agar bisa membandingkan total biaya.",
     "Confirm pickup, vehicle seating, route, duration and vehicle cost. Ask for a breakdown of boat tickets, lunch, entrance fees, parking and personal expenses to compare total trip costs."
    ]
   ]
  ],
  "links": [
   "east",
   "island",
   "snorkeling"
  ]
 },
 "east": {
  "title": [
   "Rencana wisata Nusa Penida Timur",
   "Planning your Nusa Penida East Tour"
  ],
  "sections": [
   [
    [
     "Contoh urutan perjalanan",
     "Suggested East Tour itinerary"
    ],
    [
     "Setelah penjemputan yang disepakati, rencanakan Diamond Beach, Atuh Beach dan panorama Rumah Pohon sesuai akses dan waktu. Estimasi 4–5 jam di pulau, di luar fast boat. Konfirmasi urutan dengan operator; jangan menganggap semua titik wajib dikunjungi saat kondisi tidak aman.",
     "After an agreed pickup, plan Diamond Beach, Atuh Beach and the Rumah Pohon viewpoint according to access and available time. Allow approximately 4–5 hours on the island, excluding fast boat transfers. Confirm the sequence with the operator; no stop should be mandatory when conditions are unsafe."
    ]
   ],
   [
    [
     "Tangga, akses dan kenyamanan",
     "Steps, access and comfort"
    ],
    [
     "Sebagian akses pantai melibatkan tangga curam. Bila membawa anak, lansia atau memiliki keterbatasan mobilitas, minta alternatif panorama tanpa turun ke pantai. Periksa biaya atau antrean titik foto Rumah Pohon.",
     "Some beach access involves steep steps. If travelling with children, older guests or limited mobility, request viewpoint alternatives instead of descending. Ask about separate fees or queues at the Tree House photo point."
    ]
   ],
   [
    [
     "Rencanakan biaya dan penjemputan",
     "Plan pickup and total trip cost"
    ],
    [
     "Sampaikan alamat hotel atau pelabuhan, jumlah peserta dan waktu kapal kembali. Konfirmasi biaya mobil, tiket masuk, parkir, makan dan tiket fast boat sebelum membayar.",
     "Provide your hotel or harbour, group size and return boat time. Confirm car cost, entry fees, parking, meals and fast boat tickets before paying."
    ]
   ]
  ],
  "links": [
   "west",
   "island",
   "snorkeling"
  ]
 },
 "island": {
  "title": [
   "Pilih West atau East Tour Nusa Penida",
   "Nusa Penida West vs East: choosing your route"
  ],
  "sections": [
   [
    [
     "Bandingkan pengalaman",
     "Compare the two routes"
    ],
    [
     "Pilih Barat untuk panorama Kelingking dan formasi batu pesisir; pilih Timur untuk Diamond Beach, Atuh Beach dan Rumah Pohon. Bila ingin keduanya, pertimbangkan dua hari wisata darat agar waktu perjalanan tidak terlalu padat.",
     "Choose West for Kelingking and coastal rock formations; choose East for Diamond Beach, Atuh Beach and the Tree House viewpoint. If both appeal to you, consider two land-tour days rather than a rushed itinerary."
    ]
   ],
   [
    [
     "Private atau sharing?",
     "Private car or shared tour?"
    ],
    [
     "Private menggunakan kendaraan khusus grup Anda dengan harga yang dikonfirmasi berdasarkan kapasitas dan rute. Sharing bergantung ketersediaan operator. Bandingkan biaya total dan fasilitas, bukan hanya angka harga awal.",
     "A private car is reserved for your group, with the quote based on seating and route. Shared trips depend on operator availability. Compare total costs and inclusions rather than just the advertised starting rate."
    ]
   ],
   [
    [
     "Berangkat dari Bali atau sudah di pulau?",
     "Starting from Bali or already on Nusa Penida?"
    ],
    [
     "Jika dari Bali, periksa tiket fast boat dan waktu check-in serta sambungan kendaraan. Jika sudah menginap di Nusa Penida, sampaikan alamat hotel. Snorkeling dan wisata darat direncanakan pada hari berbeda.",
     "From Bali, check fast boat tickets, check-in time and onward car pickup. If already staying on Nusa Penida, share your hotel address. Snorkeling and land tours are planned on separate days."
    ]
   ]
  ],
  "links": [
   "west",
   "east",
   "snorkeling"
  ]
 },
 "nusa-lembongan-island-tour": {
  "title": [
   "Rencanakan island tour Nusa Lembongan",
   "Plan your Nusa Lembongan island tour"
  ],
  "sections": [
   [
    [
     "Contoh rute wisata",
     "Suggested island route"
    ],
    [
     "Rencanakan sekitar 3–4 jam di pulau, di luar fast boat, untuk Dream Beach, Devil’s Tears, Yellow Bridge dan area Mangrove Point di darat. Panorama Lembongan atau Mahagiri Beach dapat menjadi pilihan tambahan sesuai waktu, akses dan penawaran. Tur darat di Mangrove Point berbeda dengan snorkeling atau naik perahu mangrove.",
     "Allow approximately 3–4 hours on the island, excluding fast boat transfers, for Dream Beach, Devil’s Tears, Yellow Bridge and the onshore Mangrove Point area. Panorama Point or Mahagiri Beach may be additional options according to time, access and the quote. An onshore mangrove stop is different from snorkeling or a mangrove boat trip."
    ]
   ],
   [
    [
     "Penjemputan dan fasilitas",
     "Pickup and inclusions"
    ],
    [
     "Jika berangkat dari Sanur, konfirmasi kapal pergi-pulang dan titik jemput di Lembongan. Jika sudah menginap di pulau, berikan alamat hotel. Minta rincian biaya kendaraan, tiket masuk, makan dan aktivitas tambahan. Jaga jarak dari tepi tebing dan semburan ombak di Devil’s Tears.",
     "From Sanur, confirm return boat tickets and pickup on Lembongan. If staying on the island, provide your hotel. Ask about vehicle costs, admission, meals and extras. Keep away from cliff edges and wave surges at Devil’s Tears."
    ]
   ]
  ],
  "links": [
   "island",
   "snorkeling"
  ]
 },
 "boat-ticket": {
  "title": [
   "Panduan tiket fast boat Sanur, Lembongan dan Gili",
   "Fast boat tickets: Sanur, Lembongan and Gili Islands"
  ],
  "sections": [
   [
    [
     "Pilih rute dan arah perjalanan",
     "Choose your route and direction"
    ],
    [
     "Sampaikan apakah Anda memerlukan Sanur–Nusa Lembongan atau arah sebaliknya, atau koneksi Lembongan–Gili dan sebaliknya. Tentukan pulau Gili tujuan dan tanggal; rute langsung bergantung jadwal operator yang tersedia. Estimasi Sanur–Lembongan 30–45 menit, Lembongan–Gili dan sebaliknya sekitar 2–4 jam, bergantung pelabuhan dan persinggahan.",
     "Tell us whether you need Sanur to Nusa Lembongan or the reverse, or a connection between Lembongan and the Gili Islands. Specify the Gili island and date; direct routes depend on available operator schedules. Allow approximately 30–45 minutes for Sanur–Lembongan and 2–4 hours for Lembongan–Gili or the reverse, depending on ports and intermediate stops."
    ]
   ],
   [
    [
     "Bandingkan tiket sebelum membayar",
     "Compare tickets before payment"
    ],
    [
     "Konfirmasi pelabuhan, jam check-in, jadwal berangkat, jenis tiket sekali jalan atau pulang-pergi, bagasi, biaya transfer darat dan ketentuan perubahan jadwal. Jangan mengandalkan jadwal lama; keberangkatan dapat berubah karena kondisi laut atau operasional.",
     "Confirm harbour, check-in, departure schedule, one-way or return fare, luggage, land transfers and change terms. Do not rely on old timetables; sailings may change with sea conditions or operations."
    ]
   ]
  ],
  "links": [
   "island",
   "snorkeling"
  ]
 }
};
const competitiveRoutes={snorkeling:["/snorkeling.html","/en/tours/snorkeling","Snorkeling Nusa Penida","Nusa Penida snorkeling tour"],west:["/west-tour.html","/en/tours/west","Wisata Nusa Penida Barat","Nusa Penida West Tour"],east:["/east-tour.html","/en/tours/east","Wisata Nusa Penida Timur","Nusa Penida East Tour"],island:["/island-tour.html","/en/tours/island","Paket island tour Nusa Penida","Nusa Penida island tours"]};
export function renderCompetitiveGuide(key,lang="id",bilingual=false){
 const guide=Object.hasOwn(competitiveTourGuides,key)?competitiveTourGuides[key]:null;
 if(!guide)return "";
 const ix=lang==="en"?1:0;
 const words=pair=>bilingual?'<span data-npe-lang="id">'+escapeHTML(pair[0])+'</span><span data-npe-lang="en">'+escapeHTML(pair[1])+'</span>':escapeHTML(pair[ix]);
 const sections=guide.sections.map(([heading,body])=>"<h3>"+words(heading)+"</h3><p>"+words(body)+"</p>").join("");
 const links=guide.links.map(k=>{
  const r=competitiveRoutes[k];
  if(bilingual)return '<span data-npe-lang="id"><a class="textLink" href="'+r[0]+'">'+escapeHTML(r[2])+'</a></span><span data-npe-lang="en"><a class="textLink" href="'+r[1]+'">'+escapeHTML(r[3])+'</a></span>';
  return '<a class="textLink" href="'+r[ix]+'">'+escapeHTML(r[ix+2])+'</a>';
 }).join(" · ");
 return '<section class="panel" data-npe-competitive-guide="'+key+'"><h2>'+words(guide.title)+'</h2>'+sections+'<h3>'+words(["Bandingkan paket wisata terkait","Compare related island experiences"])+'</h3><p>'+links+'</p></section>';
}

const legacyTours={
 "/":{file:"index",key:"",title:"hero.title",summary:"hero.description"},
 "/snorkeling.html":{file:"snorkeling",key:"snorkeling",title:"snorkelingPage.title",summary:"snorkelingPage.lead"},
 "/island-tour.html":{file:"island-tour",key:"island",title:"islandPage.title",summary:"islandPage.lead"},
 "/west-tour.html":{file:"west-tour",key:"west",title:"westPage.title",summary:"westPage.lead"},
 "/east-tour.html":{file:"east-tour",key:"east",title:"eastPage.title",summary:"eastPage.lead"}
};
export function legacyTourRoute(path){
 const canonical=path==="/index.html"?"/":path==="/"||path.endsWith(".html")?path:path.replace(/\/+$/,"")+".html";
 return Object.hasOwn(legacyTours,canonical)?{...legacyTours[canonical],canonical}:null;
}
// Render owner-selected photographs in the first HTML response so the browser
// discovers the final LCP resource immediately instead of downloading two images.
// URLs must be same-origin CMS media; no raw user HTML or foreign URLs.
export function applyPublishedPhotoSlots(html,rows=[],lang="id"){
 const slots=new Map(rows.filter(row=>validSlots.has(row.slot)&&idRE.test(row.media_id)&&row.url==="/photos/website/"+row.media_id).map(row=>[row.slot,row]));
 const replace=tag=>{
  const slot=tag.match(/\bdata-npe-slot="([^"]+)"/)?.[1],row=slots.get(slot);
  if(!row)return tag;
  return tag.replace(/\bsrc="([^"]+)"/,(_all,original)=>'src="'+row.url+'" data-npe-original-src="'+escapeHTML(original)+'" data-npe-rendered-photo="true"')
   .replace(/\balt="[^"]*"/,()=> 'alt="'+escapeHTML(lang==="en"?row.alt_en:row.alt_id)+'"');
 };
 // Attribute owner photographs correctly before browser JS executes.
 const credit=lang==="en"?"Photo supplied to Nusa Penida Experiences; owner confirmed usage rights.":"Foto disediakan untuk Nusa Penida Experiences; pemilik mengonfirmasi hak penggunaan.";
 html=html.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi,figure=>{
  const updated=figure.replace(/<img\b[^>]*>/gi,replace);
  return updated.includes('data-npe-rendered-photo="true"')?updated.replace(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/i,()=>'<figcaption data-npe-owner-photo="true">'+credit+'</figcaption>'):updated;
 });
 // Do not re-rewrite photos already replaced inside figures.
 html=html.replace(/<img\b[^>]*>/gi,tag=>tag.includes('data-npe-rendered-photo="true"')?tag:replace(tag));
 return html;
}


function localizedGuestMarkup(body,locale){
 const other=locale==="en"?"id":"en";
 return body.replace(new RegExp('<(span|a)\\b[^>]*\\bdata-npe-lang="'+other+'"[^>]*>[\\s\\S]*?<\\/\\1>','gi'),"");
}
function renderPriceComparison(copy={},lang="id",activities=[]){
 const en=lang==="en",label=(k,fallback)=>Object.hasOwn(copy,k)?normalizePublicPriceLabel(copy[k],lang):fallback;
 const rows=[
 [en?"West Nusa Penida tour":"Wisata Nusa Penida Barat",label("price.west",en?"Rp 450.000/person":"Rp 450.000/orang"),"4–5 "+(en?"hours":"jam"),"Kelingking, Broken Beach, Angel’s Billabong, Crystal Bay",en?"/en/tours/west":"/west-tour.html"],
 [en?"East Nusa Penida tour":"Wisata Nusa Penida Timur",label("price.east",en?"Rp 450.000/person":"Rp 450.000/orang"),"4–5 "+(en?"hours":"jam"),"Diamond Beach, Atuh Beach, "+(en?"Tree House viewpoint":"Rumah Pohon"),en?"/en/tours/east":"/east-tour.html"],
 [en?"Nusa Penida 3-spot snorkeling":"Snorkeling Nusa Penida 3 spot",label("price.snorkeling",en?"Sharing Rp 350.000/person":"Sharing Rp 350.000/orang"),"2–3 "+(en?"hours":"jam"),en?"Three selected sites, subject to sea conditions":"Tiga spot pilihan, sesuai kondisi laut",en?"/en/tours/snorkeling":"/snorkeling.html"]
 ];
 for(const a of activities.filter(x=>!x.parent_activity&&["nusa-lembongan-island-tour","boat-ticket"].includes(x.slug))){
  rows.push([a["title_"+lang],activityPublicPrice(a,lang),a.slug==="boat-ticket"?(en?"By route":"Sesuai rute"):"3–4 "+(en?"hours":"jam"),a["summary_"+lang],"/"+lang+"/experiences/"+a.slug]);
 }
 return '<section class="npePriceCompare" aria-label="'+(en?"Compare tour options":"Bandingkan pilihan wisata")+'"><h2>'+(en?"Compare tours and starting prices":"Bandingkan paket dan harga wisata")+'</h2><div class="npePriceScroll"><table><thead><tr>'+ (en?["Experience","Price","Duration","Route / highlights"]:["Paket wisata","Harga","Durasi","Rute / sorotan"]).map(t=>"<th scope=\"col\">"+escapeHTML(t)+"</th>").join("")+'</tr></thead><tbody>'+rows.map(([name,price,duration,detail,path])=>'<tr><th scope="row"><a href="'+escapeHTML(path)+'">'+escapeHTML(name)+'</a></th><td class="npeComparePrice">'+escapeHTML(price||(en?"Ask for a quote":"Tanya harga"))+'</td><td>'+escapeHTML(duration)+'</td><td>'+escapeHTML(detail)+'</td></tr>').join("")+'</tbody></table></div><p class="price-disclaimer">'+(en?"Tour durations exclude the Bali crossing. Ask us to confirm pickup, inclusions, additional fees and the final price for your group before booking.":"Durasi tur tidak termasuk penyeberangan dari Bali. Kami bantu memastikan titik jemput, fasilitas, biaya tambahan dan harga akhir sesuai jumlah tamu sebelum Anda memesan.")+'</p></section>';
}

export function renderLegacyTourPage(html,page,origin,copy={},activities=[],verification="",photoSlots=[],articles=[]){
 const canonical=origin+page.canonical,alternate=origin+"/en/tours"+(page.key?"/"+page.key:"");
 const title=page.canonical==="/"? "Paket Wisata Nusa Penida & Snorkeling | NPE":typeof copy[page.title]==="string"&&copy[page.title].trim()?seoClip(copy[page.title],39)+" | Nusa Penida Experiences":null;
 const description=page.canonical==="/"? "Pilih wisata Nusa Penida Barat, Timur, snorkeling, tur Nusa Lembongan dan tiket fast boat. Bandingkan harga, rute, durasi dan pilihan tur privat atau gabungan.":typeof copy[page.summary]==="string"&&copy[page.summary].trim()?seoClip(copy[page.summary],160):null;
 const boundary=html.indexOf("</head>");if(boundary<0)throw Error("Invalid guest template");
 let head=html.slice(0,boundary),body=html.slice(boundary);
 const rewrite=(name,value,property=false)=>{
  const attr=property?"property":"name",re=new RegExp('<meta '+attr+'="'+name+'" content="[^"]*">','i');
  const tag='<meta '+attr+'="'+name+'" content="'+escapeHTML(value)+'">';
  head=re.test(head)?head.replace(re,()=>tag):head+tag;
 };
 head=head.replaceAll("https://nusapenidaexperiences.com",origin);
 head=head.replace(/<link rel="canonical" href="[^"]*">/i,()=>'<link rel="canonical" href="'+escapeHTML(canonical)+'">');
 head=head.replace(/<link rel="alternate" hreflang="id" href="[^"]*">/i,()=>'<link rel="alternate" hreflang="id" href="'+escapeHTML(canonical)+'">');
 head=head.replace(/<link rel="alternate" hreflang="en" href="[^"]*">/i,()=>'<link rel="alternate" hreflang="en" href="'+escapeHTML(alternate)+'">');
 rewrite("og:url",canonical,true);
 if(title){head=head.replace(/<title>[\s\S]*?<\/title>/i,()=>"<title>"+escapeHTML(title)+"</title>");rewrite("og:title",title,true);}
 if(description){rewrite("description",description);rewrite("og:description",description,true);}
 head=head.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/i,(all,open,json,close)=>{
  try{const graph=JSON.parse(json);for(const node of graph["@graph"]||[]){if(node["@type"]==="WebPage"){if(title)node.name=title;if(description)node.description=description;node.url=canonical;}}return open+JSON.stringify(graph).replace(/</g,"\\u003c")+close;}catch{return all;}
 });
 if(page.canonical==="/"&&/^[A-Za-z0-9_-]{20,200}$/.test(verification))rewrite("google-site-verification",verification);
 body=body.replace(/(<([a-z][\w:-]*)\b[^>]*\bdata-copy="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/gi,(all,open,tag,key,original,close)=>{
  if(!Object.hasOwn(copy,key)||typeof copy[key]!=="string")return all;
  return open.slice(0,-1)+' data-npe-default="'+original.replace(/"/g,"&quot;")+'">'+escapeHTML(copy[key])+close;
 });
 // The structured list is published as one bilingual version; retain all legacy fields until the owner saves it.
 if(page.canonical==="/"&&typeof copy[HERO_LIST_KEY]==="string"){
  try{
   const rows=validateHeroHighlights(copy[HERO_LIST_KEY]);
   const markup=rows.map(row=>'<span><b aria-hidden="true">'+escapeHTML(HERO_ICONS[row.icon])+'</b><span data-hero-label-id="'+escapeHTML(row.id)+'" data-hero-label-en="'+escapeHTML(row.en)+'">'+escapeHTML(row.id)+'</span></span>').join("");
   body=body.replace(/<div class="heroHighlights">[\s\S]*?<\/div>/,()=>'<div class="heroHighlights heroHighlightsCustom"'+(rows.length?"":" hidden")+'>'+markup+'</div>');
   body=body.replace('class="hero premiumHero"','class="hero premiumHero heroCustomLayout"');
  }catch{/* Invalid saved list never removes the original cover. */}
 }
 const related=activities.filter(a=>page.key?a.parent_activity==="static:"+page.key:!a.parent_activity);
 const links=related.filter(a=>slugRE.test(a.slug)&&!body.includes('href="/id/experiences/'+a.slug+'"')).map(a=>'<a class="textLink" href="/id/experiences/'+a.slug+'">'+escapeHTML(a.title_id)+'</a>');
 if(links.length)body=body.replace("</main>",()=>'<nav class="section" aria-label="Pengalaman wisata terkait"><h2>Jelajahi pengalaman lainnya</h2><p>'+links.join(" · ")+"</p></nav></main>");
 if(page.key)body=body.replace("</main>",()=>renderCompetitiveGuide(page.key,"id",true)+renderRelatedArticleLinks(articles,page.key,"id")+"</main>");
 if(page.canonical==="/")body=body.replace('<div id="npe-price-comparison"></div>',()=>renderPriceComparison(copy,"id",activities));
 body=localizedGuestMarkup(body,"id");
 body=body.replace(/(<nav\b[^>]*>)/i,(_,open)=>open+'<a class="languagePicker" href="'+escapeHTML(alternate)+'" hreflang="en">English</a>');
 const rendered=addResponsivePhotos(applyPublishedPhotoSlots(head+body,photoSlots,"id"),page.canonical==="/").replaceAll("website-content.js?v=3.36.0","website-content.js?v=3.36.0&rev=guest-seo3");
 // The preload points at the exact final image, not the template's original.
 if(page.canonical==="/"){
  const hero=rendered.match(/<img\b[^>]*data-npe-slot="hero"[^>]*>/i)?.[0]||"";
  const source=hero.match(/\ssrc="([^"]+)"/)?.[1];
  if(source&&/^\/photos\/(?:website\/[a-f0-9-]{36}|kelingking)$/.test(source)){
   const preloaded=rendered.replace(/(<link rel="stylesheet" href="\/styles\.css">)/i,()=>'<link rel="preload" as="image" href="'+source+'" fetchpriority="high" imagesrcset="'+hero.match(/\ssrcset="([^"]+)"/)?.[1]+'" imagesizes="'+hero.match(/\ssizes="([^"]+)"/)?.[1]+'"><link rel="stylesheet" href="/styles.css">');
   if(hero.includes('data-npe-rendered-photo="true"'))return preloaded.replace(/<small class="heroCredit">[\s\S]*?<\/small>/i,()=>'<small class="heroCredit">Foto disediakan untuk Nusa Penida Experiences; hak penggunaan dikonfirmasi.</small>');
   return preloaded;
  }
 }
 return rendered;
}

const englishTourPages={
 "":{id:"/",title:"Nusa Penida Tours & Snorkeling | Nusa Penida Experiences",h1:"Nusa Penida Tours & Snorkeling",summary:"Explore Nusa Penida’s cliffs and reefs, discover Nusa Lembongan and arrange fast boat tickets. Compare private and shared trips for your island escape.",description:"Start with Nusa Penida's dramatic West cliffs and East beaches, discover its underwater world or plan an additional Nusa Lembongan island visit. Boat transfers to Gili Islands are subject to current operator routes. Nusa Penida Experiences helps you compare options, confirm guest numbers and ask local partners about your travel date. All prices, departures, inclusions and routes are confirmed before booking.",photo:"kelingking",credit:"Shrigusti",source:"https://commons.wikimedia.org/wiki/File:Kelingking_Beach%2C_Nusa_Penida.jpg",highlights:["Choose a West or East Nusa Penida island tour","Explore snorkeling options near Manta Bay or Manta Point","Ask about Nusa Lembongan and fast boat tickets"],questions:[["How can I request a booking?","Share your preferred activity, date and group size. We confirm operator availability and the final quote before payment."],["Are boat tickets included?","Fast boat tickets are not automatically included in tour packages."],["Can I do snorkeling and an island tour on the same day?","These activities are planned on separate days for travel time and safety."]]},
 "west":{id:"/west-tour.html",title:"Nusa Penida West Tour | NPE",h1:"Nusa Penida West Tour",summary:"Explore Kelingking, Broken Beach, Angel’s Billabong and Crystal Bay on a 4–5 hour West Nusa Penida tour. Private or shared options are subject to availability.",description:"Start at an agreed pickup point on Nusa Penida and enjoy Kelingking viewpoint, Broken Beach and Angel’s Billabong, followed by Crystal Bay if time allows. Allow approximately 4–5 hours on the island, excluding the crossing from Bali. Stop order and number depend on road traffic, access, weather and safety. Choose safe viewpoints. Pickup, inclusions, admission, parking, meals, boat tickets and final price are confirmed before booking.",photo:"kelingking",credit:"Shrigusti",source:"https://commons.wikimedia.org/wiki/File:Kelingking_Beach%2C_Nusa_Penida.jpg",highlights:["Kelingking cliff viewpoint","Broken Beach natural rock arch","Angel's Billabong and Crystal Bay"],questions:[["Is swimming at Angel's Billabong included?","No swimming activity is guaranteed or recommended when waves and currents are unsafe."],["Are lunch and fast boat tickets included?","Not automatically. All confirmed inclusions and exclusions are stated in the quote."],["How many people fit in one car?","Up to seven guests only if verified vehicle seating and safe capacity allow it."]]},
 "east":{id:"/east-tour.html",title:"Nusa Penida East Tour | NPE",h1:"Nusa Penida East Tour",summary:"Discover Diamond Beach, Atuh Beach and the Tree House viewpoint on a 4–5 hour East Nusa Penida tour of striking cliffs and coastal scenery.",description:"From an agreed pickup point on Nusa Penida, explore Diamond Beach, Atuh Beach and the Tree House viewpoint. Allow approximately 4–5 hours on the island, excluding the crossing from Bali. Beach descents are optional; choose viewpoints suitable for your mobility. Stop order and number may change with access, traffic, weather and safety. Private or shared options, pickup, inclusions, admission, parking, meals, boat tickets and final price are confirmed before booking.",photo:"diamond-beach",credit:"Stryn",source:"https://commons.wikimedia.org/wiki/File:Diamond_Beach_in_Nusa_Penida%2C_Bali.jpg",highlights:["Diamond Beach cliff and ocean views","Atuh Beach sheltered cove","Rumah Pohon viewpoints"],questions:[["Can I always walk down to Diamond Beach?","No. The access is steep; visitors can enjoy viewpoints instead when descent is unsafe or unsuitable."],["Is this the same as a West Tour?","No. East and West are different routes, usually arranged separately."],["Are extra costs included?","Lunch, fast boat tickets and other charges are confirmed in your quote."]]},
 "snorkeling":{id:"/snorkeling.html",title:"Nusa Penida 3-Spot Snorkeling | NPE",h1:"Nusa Penida 3-Spot Snorkeling",summary:"Enjoy approximately 2–3 hours of Nusa Penida snorkeling at three selected sites, with colorful coral reefs, tropical fish and a chance to see manta rays.",description:"Three sites are planned from Manta Bay, Manta Point, Gamat Bay, Crystal Bay and Mangrove Point as listed on our website, depending on the package, boat route and sea conditions on the day. Shared trips have a maximum of 20 guests subject to verified boat capacity; private options are available for Manta Bay or Manta Point routes. Allow approximately 2–3 hours for the boat and snorkeling activity from the meeting point, excluding Bali transfers; longer routes may vary. The captain/operator may change or cancel stops for safety. Manta rays are wild animals; sightings are not guaranteed. Equipment, supervision, meeting point and price are confirmed before booking. Land tours take place on a separate day.",photo:"manta-bay",credit:"Sasuke shinozawa",source:"https://commons.wikimedia.org/wiki/File:Snorkeling-with-manta-penida.jpg",highlights:["Possible manta ray sightings, never guaranteed","Private or sharing options, subject to capacity","Sites chosen according to weather and safety"],questions:[["Will I definitely see manta rays?","No. Manta rays are wildlife, and sightings cannot be guaranteed."],["Can I snorkel at Manta Point in rough seas?","Operators may change or cancel exposed locations if currents or waves are unsafe."],["Can I combine snorkeling and an island tour in one day?","We plan these two activities on separate days."]]},
 "island":{id:"/island-tour.html",title:"Nusa Penida Island Tour: West or East | NPE",h1:"Nusa Penida Island Tour: West or East",summary:"Choose a 4–5 hour Nusa Penida island tour on the West or East route, from iconic Kelingking cliffs to the stunning Diamond Beach viewpoints.",description:"Choose one route: West (Kelingking, Broken Beach, Angel’s Billabong and Crystal Bay) or East (Diamond Beach, Atuh Beach and the Tree House). Allow approximately 4–5 hours per route on the island, excluding fast boat transfers. Stops depend on time, access, weather and safety. Private tours reserve a vehicle for your group; sharing depends on operator availability. Up to seven passengers only with verified vehicle capacity. Snorkeling and land touring take place on separate days. Pickup, inclusions, tickets, meals and final price are confirmed before booking.",photo:"diamond-beach",credit:"Stryn",source:"https://commons.wikimedia.org/wiki/File:Diamond_Beach_in_Nusa_Penida%2C_Bali.jpg",highlights:["West: cliffs, iconic rock arches and Crystal Bay","East: beaches, viewpoints and limestone scenery","Private or available sharing arrangements"],questions:[["How many guests are permitted in one car?","Up to seven, only where the vehicle has verified safe seating."],["Is lunch included?","Lunch and other additions depend on the confirmed quote, not automatically included."],["Can I book a private trip alone?","Yes, subject to a quote that covers fixed vehicle costs."]]}
};
export const englishTourKeys=Object.freeze(Object.keys(englishTourPages));
export function renderEnglishTourPage(key,origin,siteCopy={},activities=[],articles=[]){
 const fallback=englishTourPages[key];
 if(!fallback)return null;
 const page={...fallback};
 const cmsKeys={
  "":{summary:"hero.description",description:"hero.description"},
  west:{h1:"westPage.title",summary:"westPage.lead",description:"westPage.description"},
  east:{h1:"eastPage.title",summary:"eastPage.lead",description:"eastPage.description"},
  snorkeling:{h1:"snorkelingPage.title",summary:"snorkelingPage.lead",description:"snorkelingPage.description"},
  island:{h1:"islandPage.title",summary:"islandPage.lead",description:"islandPage.description"}
 };
 for(const [field,copyKey] of Object.entries(cmsKeys[key])){
  const value=siteCopy[copyKey];
  if(typeof value==="string"&&value.trim())page[field]=value.trim().slice(0,1200);
 }
 const route="/en/tours"+(key?"/"+key:"");
 const canonical=origin+route,indonesian=origin+page.id;
 const crumb=key?{ "@type":"BreadcrumbList","@id":canonical+"#breadcrumb",itemListElement:[{"@type":"ListItem",position:1,name:"Nusa Penida Experiences",item:origin+"/"},{"@type":"ListItem",position:2,name:page.h1,item:canonical}]}:null;
 const graph={"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":origin+"/#organization",name:"Nusa Penida Experiences",url:origin+"/",logo:origin+"/icon.svg"},{"@type":"WebPage",url:canonical,name:page.title,description:page.summary,inLanguage:"en",isPartOf:{"@type":"WebSite",url:origin+"/",name:"Nusa Penida Experiences"},...(crumb?{breadcrumb:{"@id":canonical+"#breadcrumb"}}:{})},...(crumb?[crumb]:[])]};
 const esc=escapeHTML;
 const whatsApp=encodeURIComponent("Hello Nusa Penida Experiences, I would like details about "+page.h1+". Please confirm the itinerary, date, availability, inclusions and price.");
 const nav=englishTourKeys.map(k=>'<a class="textLink" href="/en/tours'+(k?"/"+k:"")+'">'+esc(k?englishTourPages[k].h1:"All experiences")+"</a>").join(" · ");
 const rootLinks=activities.filter(a=>!a.parent_activity&&slugRE.test(a.slug)).map(a=>'<a class="textLink" href="/en/experiences/'+esc(a.slug)+'">'+esc(a.title_en)+'</a>').join(" · ");
 const childLinks=key?activities.filter(a=>a.parent_activity==="static:"+key&&slugRE.test(a.slug)).map(a=>'<a class="textLink" href="/en/experiences/'+esc(a.slug)+'">'+esc(a.title_en)+'</a>').join(" · "):"";
 const children=childLinks?'<nav class="panel" aria-label="Destinations on this tour"><h2>Explore the destinations</h2><p>'+childLinks+'</p></nav><section data-npe-detail-parent="static:'+esc(key)+'" hidden><div class="scene-grid"></div></section>':"";
 const lists=page.highlights.map(t=>"<li>"+esc(t)+"</li>").join("");
 const faq=page.questions.map(([q,a])=>'<details class="npeFaqItem"><summary>'+esc(q)+'</summary><p>'+esc(a)+"</p></details>").join("");
 const image=origin+"/photos/"+page.photo;
 const layout=`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow">
<title>${esc(page.title)}</title><meta name="description" content="${esc(page.summary)}">
<link rel="canonical" href="${esc(canonical)}"><link rel="alternate" hreflang="en" href="${esc(canonical)}"><link rel="alternate" hreflang="id" href="${esc(indonesian)}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.summary)}">
<meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(image)}"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/styles.css"><link rel="icon" type="image/svg+xml" href="/icon.svg">
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g,"\\u003c")}</script><script src="/photo-loader.js?v=5" defer></script><script src="/analytics.js?v=3.36.0" defer></script></head>
<body><header class="top"><a class="brand" href="/"><img class="brandLogo" src="/icon.svg" width="122" height="76" alt="Nusa Penida Experiences logo"><span>NUSA PENIDA <b>EXPERIENCES</b></span></a>
<nav><a href="/en/tours">All tours</a><a href="/en/articles">Travel guides</a><a href="${esc(page.id)}" hreflang="id">Bahasa Indonesia</a><a href="/#request">Contact</a></nav></header>
<main class="section"><section class="npeExperiencePage"><span class="eyebrow">ISLAND EXPERIENCES · BALI</span>
<h1>${esc(page.h1)}</h1><p class="regions-intro">${esc(page.summary)}</p>
<figure class="npe-price-cover"><img src="/photos/${page.photo}" alt="${esc(page.h1)} in Bali, Indonesia" width="1200" height="675" fetchpriority="high" decoding="async" style="width:100%;max-height:560px;object-fit:cover;border-radius:18px">
${key?(()=>{const pk="price."+key;const price=Object.hasOwn(siteCopy,pk)?normalizePublicPriceLabel(siteCopy[pk],"en"):key==="snorkeling"?"Sharing Rp 350.000/person":"Rp 450.000/person";return price?'<span class="price-preview">'+esc(price)+'</span>':"";})():""}<figcaption>Photo: <a href="${esc(page.source)}" rel="noopener noreferrer" target="_blank">${esc(page.credit)} / Wikimedia Commons</a> (Creative Commons)</figcaption></figure>
<div class="panel"><h2>Plan your experience</h2><p>${esc(page.description)}</p><h2>Highlights</h2><ul>${lists}</ul>
<p>Final routes, operator availability, capacity, pricing and inclusions are confirmed before payment. No departure or wildlife sighting is guaranteed.</p>
<a class="primary" data-whatsapp-chat href="https://wa.me/628561752525?text=${whatsApp}" rel="noopener noreferrer" target="_blank">Ask about this experience on WhatsApp</a></div>
${!key?renderPriceComparison(siteCopy,"en",activities):""}${children}${renderCompetitiveGuide(key,"en")}${renderRelatedArticleLinks(articles,key,"en")}
<section class="npeFaq"><h2>Frequently asked questions</h2><div class="npeFaqGrid">${faq}</div></section>
<nav class="panel"><h2>Explore other tours and islands</h2><p>${nav}</p>
${rootLinks?"<p>"+rootLinks+"</p>":""}<p><a href="/en/articles">Island travel guides</a></p></nav>
</section></main><footer>Nusa Penida Experiences · <a href="/privacy.html#google-api-data">Privacy and Google data use</a> · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a> · <a href="/cancellation.html">Cancellation policy</a></footer><script type="module" src="/website-content.js?v=3.36.0&rev=guest-seo3"></script></body></html>`;
 return addResponsivePhotos(layout,false);
}

export function renderExperiencePage(activity,locale,origin,related=[],articles=[]){
 const lang=locale==="id"?"id":"en";
 const isEN=lang==="en",p=isEN?"en":"id",title=activity["title_"+p],summary=activity["summary_"+p],desc=activity["description_"+p];
 const seoTitle=activity["seo_title_"+p]||title+" | Nusa Penida Experiences";
 const seoDesc=activity["seo_description_"+p]||summary;
 const displayPrice=activityPublicPrice(activity,lang);
 const coverSet=responsivePhotoSet(activity.photo_url||"");
 // The large experience cover is visible above the fold. Select a responsive variant in the initial HTML, not after JS runs.
 const coverResponsive=coverSet?' srcset="'+escapeHTML(coverSet)+'" sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1480px) calc(100vw - 64px), 1416px"':"";
 const root=origin+"/"+lang+"/experiences/"+activity.slug;
 const en=origin+"/en/experiences/"+activity.slug,id=origin+"/id/experiences/"+activity.slug;
 const message=encodeURIComponent((isEN?"Hello, I would like details about ":"Halo, saya ingin info tentang ")+title+".");
 const schema=JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":origin+"/#organization",name:"Nusa Penida Experiences",url:origin+"/",logo:origin+"/icon.svg"},{"@type":"WebPage",name:seoTitle,description:seoDesc,url:root,inLanguage:lang,primaryImageOfPage:activity.photo_url?origin+activity.photo_url:undefined,isPartOf:{"@type":"WebSite",name:"Nusa Penida Experiences",url:origin},breadcrumb:{"@id":root+"#breadcrumb"}},{"@type":"BreadcrumbList","@id":root+"#breadcrumb",itemListElement:[{"@type":"ListItem",position:1,name:"Nusa Penida Experiences",item:origin+"/"},{"@type":"ListItem",position:2,name:title,item:root}]}]}).replace(/</g,"\\u003c");
 // Provide a crawlable, localized route from every published destination back to its sale page.
 let parentLink="";
 if(activity.parent_activity?.startsWith("static:")){
  const key=activity.parent_activity.slice(7);
  if(Object.hasOwn(competitiveRoutes,key)){
   const route=competitiveRoutes[key];
   parentLink='<a class="textLink" data-npe-parent-tour href="'+route[isEN?1:0]+'">'+escapeHTML(route[isEN?3:2])+'</a>';
  }
 }else if(activity.parent_activity?.startsWith("activity:")){
  const parent=related.find(x=>!x.parent_activity&&"activity:"+x.slug===activity.parent_activity&&slugRE.test(x.slug));
  if(parent)parentLink='<a class="textLink" data-npe-parent-tour href="/'+lang+'/experiences/'+encodeURIComponent(parent.slug)+'">'+escapeHTML(parent["title_"+p])+'</a>';
 }
 const parentMarkup=parentLink?'<nav class="panel" aria-label="'+(isEN?"Related tour":"Paket wisata induk")+'"><h2>'+(isEN?"Visit this destination on a tour":"Kunjungi destinasi ini dalam paket wisata")+'</h2><p>'+parentLink+'</p><p>'+(isEN?"Confirm the itinerary and availability with our local partners before booking.":"Konfirmasi rute dan ketersediaan dengan mitra lokal sebelum memesan.")+'</p></nav>':"";
 const relatedLinks=related.filter(x=>x.slug!==activity.slug&&(x.parent_activity==="activity:"+activity.slug||(!activity.parent_activity&&!x.parent_activity)||(activity.parent_activity&&x.parent_activity===activity.parent_activity))).slice(0,16).map(x=>'<a class="textLink" href="/'+lang+'/experiences/'+encodeURIComponent(x.slug)+'">'+escapeHTML(x["title_"+p])+'</a>').join(" · ");
 const articleKey=activity.slug==="nusa-lembongan-island-tour"||activity.parent_activity==="activity:nusa-lembongan-island-tour"?"lembongan":activity.slug==="boat-ticket"?"boat":activity.parent_activity==="static:snorkeling"?"snorkeling":"";
 const articleMarkup=articleKey?renderRelatedArticleLinks(articles,articleKey,lang):"";
 const relatedMarkup=relatedLinks?'<nav class="panel" aria-label="'+(isEN?"Related experiences":"Pengalaman wisata terkait")+'"><h2>'+(isEN?"Explore more island experiences":"Jelajahi pengalaman wisata lainnya")+'</h2><p>'+relatedLinks+'</p></nav>':"";
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>'+escapeHTML(seoTitle)+'</title><meta name="description" content="'+escapeHTML(seoDesc)+'"><link rel="canonical" href="'+escapeHTML(root)+'"><link rel="alternate" hreflang="en" href="'+escapeHTML(en)+'"><link rel="alternate" hreflang="id" href="'+escapeHTML(id)+'"><meta property="og:type" content="website"><meta property="og:title" content="'+escapeHTML(seoTitle)+'"><meta property="og:description" content="'+escapeHTML(seoDesc)+'"><meta property="og:url" content="'+escapeHTML(root)+'"><meta property="og:image" content="'+escapeHTML(activity.photo_url?origin+activity.photo_url:origin+"/icon.svg")+'"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/styles.css"><link rel="icon" type="image/svg+xml" href="/icon.svg"><script type="application/ld+json">'+schema+'</script><script src="/photo-loader.js?v=5" defer></script><script src="/analytics.js?v=3.36.0" defer></script></head><body><header class="top"><a class="brand" href="/"><img class="brandLogo" src="/icon.svg" width="122" height="76" alt="Nusa Penida Experiences logo"><span>NUSA PENIDA <b>EXPERIENCES</b></span></a><nav><a href="'+(isEN?"/en/tours":"/#packages")+'">'+(isEN?"Experiences":"Paket Wisata")+'</a><a hreflang="'+(isEN?"id":"en")+'" href="'+escapeHTML(isEN?id:en)+'">'+(isEN?"Bahasa Indonesia":"English")+'</a><a href="/#request">'+(isEN?"Contact":"Kontak")+'</a></nav></header><main><section class="section npeExperiencePage"><span class="eyebrow">'+escapeHTML(activity.category.replaceAll("_"," "))+'</span><h1>'+escapeHTML(title)+'</h1><p class="regions-intro">'+escapeHTML(summary)+'</p><div class="npe-price-cover"><img src="'+escapeHTML(activity.photo_url)+'"'+coverResponsive+' alt="'+escapeHTML(title)+'" loading="eager" decoding="async" fetchpriority="high" width="1200" height="675" style="width:100%;max-height:560px;object-fit:cover;border-radius:18px">'+(displayPrice?'<span class="price-preview">'+escapeHTML(displayPrice)+'</span>':"")+'</div><div class="panel" style="margin-top:20px"><h2>'+(isEN?"About this experience":"Tentang pengalaman ini")+'</h2><p style="white-space:pre-line">'+escapeHTML(desc)+'</p><p>'+(isEN?"Availability, inclusions and final price are confirmed with our local operator before booking.":"Ketersediaan, fasilitas, dan harga akhir dikonfirmasi kepada operator sebelum pemesanan.")+'</p><a class="primary" data-whatsapp-chat href="https://wa.me/'+emailWhatsApp+'?text='+message+'" target="_blank" rel="noopener noreferrer">'+(isEN?"Ask on WhatsApp":"Tanya via WhatsApp")+'</a></div>'+(!activity.parent_activity?'<section data-npe-detail-parent="activity:'+escapeHTML(activity.slug)+'" hidden><h2 class="gallery-heading">'+(isEN?"Explore the destinations":"Jelajahi destinasi")+'</h2><div class="scene-grid"></div></section>':"")+'</section>'+(!activity.parent_activity&&related.some(x=>x.parent_activity==="activity:"+activity.slug)?'<p class="npeGalleryDisclaimer">'+(isEN?"Destination photos show available points of interest; not every location is included in every itinerary. Confirm your selected route with the operator.":"Galeri menampilkan pilihan destinasi; tidak semua lokasi otomatis termasuk dalam setiap paket. Pastikan itinerary dengan operator.")+'</p>':"")+parentMarkup+renderCompetitiveGuide(activity.slug,lang)+relatedMarkup+articleMarkup+'</main><footer>Nusa Penida Experiences · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a></footer><script type="module" src="/website-content.js?v=3.36.0&rev=guest-seo3"></script></body></html>';
}
export async function findPublishedExperience(db,slug){
 if(!slugRE.test(slug))return null;
 const row=await db.prepare("SELECT id,published_json,published_at FROM website_activities WHERE slug=? AND status='PUBLISHED' AND published_json IS NOT NULL").bind(slug).first();
 if(!row)return null;
 const a=publicValue(row);
 if(a.parent_activity&&!staticParents.has(a.parent_activity)){
  try{await verifyParent(db,a);}catch{return null;}
 }
 return a;
}
const xmlEsc=s=>escapeHTML(s).replace(/&#39;/g,"&apos;").replace(/&quot;/g,"&quot;");
export async function renderWebsiteSitemap(db,origin){
 const staticPaths=["/","/snorkeling.html","/island-tour.html","/west-tour.html","/east-tour.html"];
 const items=(await publicWebsiteActivities(db)).items;
 const englishPaths=["/en/tours","/en/tours/snorkeling","/en/tours/island","/en/tours/west","/en/tours/east"];
 const reciprocal=(p,en)=>["id","en"].map((lang,i)=>'<xhtml:link rel="alternate" hreflang="'+lang+'" href="'+xmlEsc(origin+(i===0?p:en))+'"/>').join("");
 const basic=staticPaths.map((p,i)=>"<url><loc>"+xmlEsc(origin+p)+"</loc>"+reciprocal(p,englishPaths[i])+"</url>");
 const englishUrls=englishPaths.map((p,i)=>"<url><loc>"+xmlEsc(origin+p)+"</loc>"+reciprocal(staticPaths[i],p)+"</url>");
 const dynamic=items.flatMap(i=>["en","id"].map(lang=>{
  const url=origin+"/"+lang+"/experiences/"+i.slug;
  const updated=typeof i.published_at==="string"&&/^\d{4}-\d{2}-\d{2}/.test(i.published_at)?"<lastmod>"+i.published_at.slice(0,10)+"</lastmod>":"";
  const langs=["en","id"].map(l=>'<xhtml:link rel="alternate" hreflang="'+l+'" href="'+xmlEsc(origin+"/"+l+"/experiences/"+i.slug)+'"/>').join("");
  return "<url><loc>"+xmlEsc(url)+"</loc>"+updated+langs+"</url>";
 }));
 return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+basic.concat(englishUrls,dynamic).join("")+"</urlset>";
}
