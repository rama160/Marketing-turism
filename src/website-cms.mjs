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
  const topic=title&&context&&!title.toLowerCase().includes(context.toLowerCase())?title+" – "+context:title;
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
  throw Error("Harga jual harus berupa rupiah bulat antara Rp1 dan Rp1.000.000.000");
 data.price_unit=u16(input.price_unit)||"PERSON";
 if(!["PERSON","CAR","GROUP","TICKET"].includes(data.price_unit))throw Error("Satuan harga tidak valid");
 data.price_from=input.price_from!==false;
 data.price_label_id=u16(input.price_label_id);
 data.price_label_en=u16(input.price_label_en);
 const hasLabel=!!(data.price_label_id||data.price_label_en);
 if(hasLabel&&(!plain(data.price_label_id,120)||!plain(data.price_label_en,120)))
  throw Error("Label harga harus lengkap dalam bahasa Indonesia dan Inggris");
 if(data.price_amount!==null){
  const formatted=new Intl.NumberFormat("id-ID").format(data.price_amount);
  const idUnit={PERSON:"orang",CAR:"mobil",GROUP:"grup",TICKET:"tiket"}[data.price_unit];
  const enUnit={PERSON:"person",CAR:"car",GROUP:"group",TICKET:"ticket"}[data.price_unit];
  // Numeric price is authoritative: labels are generated so the amount cannot contradict the display.
  data.price_label_id=(data.price_from?"Mulai ":"")+"Rp"+formatted+"/"+idUnit;
  data.price_label_en=(data.price_from?"From ":"")+"IDR "+formatted+"/"+enUnit;
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
function publicValue(row){
 const a=JSON.parse(row.published_json);
 return {id:row.id,...a,photo_url:a.media_id?"/photos/website/"+a.media_id:null,published_at:row.published_at};
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
export async function listWebsiteMedia(db){
 const [media,usage]=await Promise.all([
  db.prepare("SELECT id,title,alt_id,alt_en,bytes,created_at FROM website_media ORDER BY created_at DESC LIMIT 200").all(),
  db.prepare(mediaUsageSQL).all()
 ]);
 const used=new Map((usage.results||[]).map(r=>[r.media_id,Number(r.used)||0]));
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
 AND NOT EXISTS (SELECT 1 FROM website_activities WHERE json_extract(draft_json,'$.media_id')=? OR json_extract(published_json,'$.media_id')=?)`;
 const write=await db.prepare(sql).bind(id,id,id,id,id).run();
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
 const raw=await env.PHOTO_KV?.get(mediaKey(id),"arrayBuffer");
 if(!raw||!binaryJpeg(new Uint8Array(raw)))return reject("Foto tidak tersedia",503);
 return new Response(request.method==="HEAD"?null:raw,{headers:{"content-type":"image/jpeg","content-length":String(raw.byteLength),"cache-control":"public,max-age=3600","x-content-type-options":"nosniff"}});
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

// The five original tour pages remain the single editorial/design source.
// Enrich their HTML at request time so crawlers see live published CMS metadata
// and clickable links before any client-side JavaScript runs.
export function renderLegacySEOPage(html,path,origin,content={},activities=[]){
 const configs={
  "/":{key:"hero.title",lead:"hero.description",title:"Nusa Penida Tours, Snorkeling & Lembongan | Nusa Penida Experiences",desc:"Explore Nusa Penida West and East tours, snorkeling, Nusa Lembongan experiences and fast boat ticket booking. Contact our local team for availability."},
  "/index.html":{key:"hero.title",lead:"hero.description",title:"Nusa Penida Tours, Snorkeling & Lembongan | Nusa Penida Experiences",desc:"Explore Nusa Penida West and East tours, snorkeling, Nusa Lembongan experiences and fast boat ticket booking. Contact our local team for availability."},
  "/snorkeling.html":{key:"snorkelingPage.title",lead:"snorkelingPage.lead",title:"Nusa Penida Snorkeling Tours | Manta Bay & Manta Point",desc:"Discover Nusa Penida snorkeling at Manta Bay, Manta Point, Crystal Bay and colorful reefs. Ask about private and sharing options and sea conditions."},
  "/island-tour.html":{key:"islandPage.title",lead:"islandPage.lead",title:"Nusa Penida Island Tour | West & East Island Trips",desc:"Explore West and East Nusa Penida on island tour trips featuring Kelingking, Broken Beach, Diamond Beach, Atuh Beach and other scenic viewpoints."},
  "/west-tour.html":{key:"westPage.title",lead:"westPage.lead",title:"Nusa Penida West Tour | Kelingking & Broken Beach",desc:"Discover Kelingking Beach, Broken Beach, Angel's Billabong and Crystal Bay on a West Nusa Penida tour. Enquire about schedules and available trips."},
  "/east-tour.html":{key:"eastPage.title",lead:"eastPage.lead",title:"Nusa Penida East Tour | Diamond Beach & Atuh Beach",desc:"Visit Diamond Beach, Atuh Beach and Rumah Pohon on a scenic East Nusa Penida island tour. Enquire about routes, dates and availability."}
 };
 const page=configs[path];if(!page||typeof html!=="string")return html;
 const canonical=origin+(path==="/index.html"?"/":path);
 const textOf=k=>typeof content[k]==="string"?content[k].trim():"";
 const h1=textOf(page.key),lead=textOf(page.lead);
 const seoTitle=(h1&&path!=="/"&&path!=="/index.html"?h1+" | Nusa Penida Experiences":page.title).slice(0,125);
 const seoDesc=(lead||page.desc).slice(0,175);
 const image=origin+(path==="/east-tour.html"?"/photos/diamond-beach":path==="/snorkeling.html"?"/photos/manta-bay":"/photos/kelingking");
 let output=html.replace(/<title>[\s\S]*?<\/title>/i,"<title>"+escapeHTML(seoTitle)+"</title>");
 function upsert(pattern,tag){output=pattern.test(output)?output.replace(pattern,tag):output.replace("</head>",tag+"</head>");}
 upsert(/<meta name="description" content="[^"]*">/i,'<meta name="description" content="'+escapeHTML(seoDesc)+'">');
 upsert(/<link rel="canonical" href="[^"]*">/i,'<link rel="canonical" href="'+escapeHTML(canonical)+'">');
 upsert(/<meta property="og:title" content="[^"]*">/i,'<meta property="og:title" content="'+escapeHTML(seoTitle)+'">');
 upsert(/<meta property="og:description" content="[^"]*">/i,'<meta property="og:description" content="'+escapeHTML(seoDesc)+'">');
 upsert(/<meta property="og:url" content="[^"]*">/i,'<meta property="og:url" content="'+escapeHTML(canonical)+'">');
 upsert(/<meta property="og:image" content="[^"]*">/i,'<meta property="og:image" content="'+escapeHTML(image)+'">');
 const graph={"@context":"https://schema.org","@graph":[
  {"@type":"Organization","@id":origin+"/#organization",name:"Nusa Penida Experiences",url:origin+"/",logo:origin+"/icon.svg"},
  {"@type":"WebPage",url:canonical,name:seoTitle,description:seoDesc,inLanguage:"id",isPartOf:{"@type":"WebSite",name:"Nusa Penida Experiences",url:origin+"/"},breadcrumb:{"@id":canonical+"#breadcrumb"}},
  {"@type":"BreadcrumbList","@id":canonical+"#breadcrumb",itemListElement:[
   {"@type":"ListItem",position:1,name:"Nusa Penida Experiences",item:origin+"/"},
   ...(path==="/"||path==="/index.html"?[]:[{"@type":"ListItem",position:2,name:seoTitle,item:canonical}])
  ]}
 ]};
 output=output.replace("</head>",'<meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">'+JSON.stringify(graph).replace(/</g,"\\u003c")+"</script></head>");
 if(h1&&path!=="/"&&path!=="/index.html"){
  const matcher=new RegExp('(<h1[^>]*data-copy="'+page.key.replaceAll(".","\\.")+'"[^>]*>)[\\s\\S]*?(<\\/h1>)',"i");
  output=output.replace(matcher,(_,a,b)=>a+escapeHTML(h1)+b);
 }
 const pool=path==="/snorkeling.html"?activities.filter(a=>a.parent_activity==="static:snorkeling"):
  path==="/west-tour.html"?activities.filter(a=>a.parent_activity==="static:west"):
  path==="/east-tour.html"?activities.filter(a=>a.parent_activity==="static:east"):
  path==="/island-tour.html"?activities.filter(a=>a.parent_activity==="static:island"):
  activities.filter(a=>!a.parent_activity);
 const links=pool.filter(a=>a.slug&&a.title_id).slice(0,24).map(a=>'<a class="textLink" href="/id/experiences/'+encodeURIComponent(a.slug)+'">'+escapeHTML(a.title_id)+'</a>').join(" · ");
 if(links)output=output.replace("</main>",'<nav class="section" aria-label="Paket dan destinasi wisata"><h2>Jelajahi pengalaman wisata lainnya</h2><p>'+links+'</p></nav></main>');
 return output;
}

export function renderExperiencePage(activity,locale,origin,related=[]){
 const lang=locale==="id"?"id":"en";
 const isEN=lang==="en",p=isEN?"en":"id",title=activity["title_"+p],summary=activity["summary_"+p],desc=activity["description_"+p];
 const seoTitle=activity["seo_title_"+p]||title+" | Nusa Penida Experiences";
 const seoDesc=activity["seo_description_"+p]||summary;
 const root=origin+"/"+lang+"/experiences/"+activity.slug;
 const en=origin+"/en/experiences/"+activity.slug,id=origin+"/id/experiences/"+activity.slug;
 const message=encodeURIComponent((isEN?"Hello, I would like details about ":"Halo, saya ingin info tentang ")+title+".");
 const schema=JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":origin+"/#organization",name:"Nusa Penida Experiences",url:origin+"/",logo:origin+"/icon.svg"},{"@type":"WebPage",name:seoTitle,description:seoDesc,url:root,inLanguage:lang,primaryImageOfPage:activity.photo_url?origin+activity.photo_url:undefined,isPartOf:{"@type":"WebSite",name:"Nusa Penida Experiences",url:origin},breadcrumb:{"@id":root+"#breadcrumb"}},{"@type":"BreadcrumbList","@id":root+"#breadcrumb",itemListElement:[{"@type":"ListItem",position:1,name:"Nusa Penida Experiences",item:origin+"/"},{"@type":"ListItem",position:2,name:title,item:root}]}]}).replace(/</g,"\\u003c");
 const relatedLinks=related.filter(x=>x.slug!==activity.slug&&(x.parent_activity==="activity:"+activity.slug||(!activity.parent_activity&&!x.parent_activity))).slice(0,16).map(x=>'<a class="textLink" href="/'+lang+'/experiences/'+encodeURIComponent(x.slug)+'">'+escapeHTML(x["title_"+p])+'</a>').join(" · ");
 const relatedMarkup=relatedLinks?'<nav class="panel" aria-label="'+(isEN?"Related experiences":"Pengalaman wisata terkait")+'"><h2>'+(isEN?"Explore more island experiences":"Jelajahi pengalaman wisata lainnya")+'</h2><p>'+relatedLinks+'</p></nav>':"";
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><title>'+escapeHTML(seoTitle)+'</title><meta name="description" content="'+escapeHTML(seoDesc)+'"><link rel="canonical" href="'+escapeHTML(root)+'"><link rel="alternate" hreflang="en" href="'+escapeHTML(en)+'"><link rel="alternate" hreflang="id" href="'+escapeHTML(id)+'"><meta property="og:type" content="website"><meta property="og:title" content="'+escapeHTML(seoTitle)+'"><meta property="og:description" content="'+escapeHTML(seoDesc)+'"><meta property="og:url" content="'+escapeHTML(root)+'"><meta property="og:image" content="'+escapeHTML(activity.photo_url?origin+activity.photo_url:origin+"/icon.svg")+'"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/styles.css"><script type="application/ld+json">'+schema+'</script></head><body><header class="top"><a class="brand" href="/"><span>NUSA PENIDA <b>EXPERIENCES</b></span></a><nav><a href="/#packages">'+(isEN?"Experiences":"Paket Wisata")+'</a><a href="/#request">'+(isEN?"Contact":"Kontak")+'</a></nav></header><main><section class="section npeExperiencePage"><span class="eyebrow">'+escapeHTML(activity.category.replaceAll("_"," "))+'</span><h1>'+escapeHTML(title)+'</h1><p class="regions-intro">'+escapeHTML(summary)+'</p><img src="'+escapeHTML(activity.photo_url)+'" alt="'+escapeHTML(title)+'" loading="eager" decoding="async" fetchpriority="high" width="1200" height="675" style="width:100%;max-height:560px;object-fit:cover;border-radius:18px"><div class="panel" style="margin-top:20px"><h2>'+(isEN?"About this experience":"Tentang pengalaman ini")+'</h2><p style="white-space:pre-line">'+escapeHTML(desc)+'</p>'+(activity.price_verified&&activity["price_label_"+p]?'<p><strong>'+escapeHTML(activity["price_label_"+p])+'</strong></p>':"")+'<p>'+(isEN?"Availability, inclusions and final price are confirmed with our local operator before booking.":"Ketersediaan, fasilitas, dan harga akhir dikonfirmasi kepada operator sebelum pemesanan.")+'</p><a class="primary" href="https://wa.me/'+emailWhatsApp+'?text='+message+'" target="_blank" rel="noopener noreferrer">'+(isEN?"Ask on WhatsApp":"Tanya via WhatsApp")+'</a></div>'+(!activity.parent_activity?'<section data-npe-detail-parent="activity:'+escapeHTML(activity.slug)+'" hidden><h2 class="gallery-heading">'+(isEN?"Explore the destinations":"Jelajahi destinasi")+'</h2><div class="scene-grid"></div></section>':"")+'</section>'+relatedMarkup+'</main><footer>Nusa Penida Experiences · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a></footer><script type="module" src="/website-content.js?v=3.31.0"></script></body></html>';
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
 const basic=staticPaths.map(p=>"<url><loc>"+xmlEsc(origin+p)+"</loc></url>");
 const dynamic=items.flatMap(i=>["en","id"].map(lang=>{
  const url=origin+"/"+lang+"/experiences/"+i.slug;
  const updated=typeof i.published_at==="string"&&/^\\d{4}-\\d{2}-\\d{2}/.test(i.published_at)?"<lastmod>"+i.published_at.slice(0,10)+"</lastmod>":"";
  const langs=["en","id"].map(l=>'<xhtml:link rel="alternate" hreflang="'+l+'" href="'+xmlEsc(origin+"/"+l+"/experiences/"+i.slug)+'"/>').join("");
  return "<url><loc>"+xmlEsc(url)+"</loc>"+updated+langs+"</url>";
 }));
 return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+basic.concat(dynamic).join("")+"</urlset>";
}
