import test from "node:test";
import assert from "node:assert/strict";
import {validateWebsiteDraft,renderExperiencePage,renderWebsiteSitemap,publishWebsiteActivity} from "../src/website-cms.mjs";
const draft={
 slug:"nusa-lembongan-island-tour",category:"ISLAND_TOUR",
 title_en:"Nusa Lembongan Island Tour",title_id:"Tur Pulau Nusa Lembongan",
 summary_en:"Explore the coast with local guidance.",summary_id:"Jelajahi pesisir bersama pemandu lokal.",
 description_en:"Discover the beautiful coastal viewpoints; operator schedules are confirmed before booking.",
 description_id:"Temukan pemandangan pesisir yang indah; jadwal operator dikonfirmasi sebelum booking.",
 media_id:"12345678-1234-4234-9234-123456789abc",supplier_confirmed:true,
 price_label_en:"",price_label_id:"",price_verified:false
};
test("draft validates bilingual content and preserves pricing limits",()=>{
 assert.equal(validateWebsiteDraft(draft).slug,draft.slug);
 assert.throws(()=>validateWebsiteDraft({...draft,slug:"../admin"}),/Slug/);
 assert.throws(()=>validateWebsiteDraft({...draft,title_en:"<script>alert(1)</script>"}),/title_en/);
 assert.equal(validateWebsiteDraft({...draft,price_label_en:"From IDR 1",price_label_id:"Mulai Rp1"}).price_verified,false);
 assert.equal(validateWebsiteDraft(draft).price_amount,null,"empty price must be accepted");
 assert.equal(validateWebsiteDraft({...draft,price_amount:""}).price_amount,null);
 const price=validateWebsiteDraft({...draft,price_amount:"350000",price_unit:"PERSON",price_from:true,price_verified:true});
 assert.equal(price.price_amount,350000);
 assert.equal(price.price_label_id,"Mulai Rp350.000/orang");
 assert.equal(price.price_label_en,"From IDR 350.000/person");
 const unverified=validateWebsiteDraft({...draft,price_amount:"350000",price_verified:false});
 assert.equal(unverified.price_verified,false,"unverified price can be saved in a draft");
 assert.throws(()=>validateWebsiteDraft({...draft,price_amount:"0"}),/Harga jual/);
 assert.throws(()=>validateWebsiteDraft({...draft,price_amount:"1000.5"}),/Harga jual/);
 assert.throws(()=>validateWebsiteDraft({...draft,price_unit:"BAD"}),/Satuan harga/);
 assert.equal(validateWebsiteDraft({...draft,price_label_en:"From IDR 400,000",price_label_id:"Mulai Rp400.000",price_verified:true}).price_verified,true);
});
test("HTML output escapes injected content and exposes bilingual canonical URLs",()=>{
 const a={...draft,slug:"lembongan-island",photo_url:"/photos/website/"+draft.media_id};
 const html=renderExperiencePage(a,"en","https://example.com");
 assert.match(html,/<html lang="en">/);
 assert.match(html,/rel="canonical" href="https:\/\/example.com\/en\/experiences\/lembongan-island"/);
 assert.match(html,/hreflang="id"/);
 assert.match(html,/https:\/\/wa.me\/628561752525/);
 assert.doesNotMatch(html,/Admin Token|booking database/i);
});
test("sitemap includes existing pages plus published bilingual activity URLs only",async()=>{
 const fake={prepare:()=>({all:async()=>({results:[{id:"x",published_json:JSON.stringify(draft),published_at:"2026-11-24"}]})})};
 const xml=await renderWebsiteSitemap(fake,"https://example.com");
 assert.match(xml,/\/en\/experiences\/nusa-lembongan-island-tour/);
 assert.match(xml,/\/id\/experiences\/nusa-lembongan-island-tour/);
 assert.match(xml,/\/snorkeling.html/);
 assert.doesNotMatch(xml,/\/dashboard.html/);
});
test("publish refuses unconfirmed suppliers before any database mutation",async()=>{
 const fake={prepare:()=>({bind:()=>({first:async()=>({version:1,draft_json:JSON.stringify({...draft,supplier_confirmed:false})})})})};
 await assert.rejects(()=>publishWebsiteActivity(fake,draft.media_id,{owner_confirmed:true,expected_version:1}),/operator/);
});

test("publish may omit price but refuses an unverified sale price",async()=>{
 const id="12345678-1234-4234-9234-123456789abc";
 let mutations=0;
 const makeFake=data=>({prepare:sql=>({
  bind:()=>({
   first:async()=>sql.startsWith("SELECT version")?{version:1,draft_json:JSON.stringify(data)}:{id:data.media_id},
   run:async()=>{mutations++;return {meta:{changes:1}}}
  })
 })});
 await assert.rejects(()=>publishWebsiteActivity(makeFake({...draft,price_amount:"350000",price_verified:false}),id,{owner_confirmed:true,expected_version:1}),/Harga belum diverifikasi/);
 assert.equal(mutations,0,"rejected price never mutates published data");
 const emptyPrice=await publishWebsiteActivity(makeFake({...draft,price_amount:"",price_label_en:"",price_label_id:"",price_verified:false}),id,{owner_confirmed:true,expected_version:1});
 assert.equal(emptyPrice.status,"PUBLISHED");
});
test("legacy published page allows clearing only the price, not titles",async()=>{
 const {validateSiteEdit}=await import("../src/site-content.mjs");
 assert.equal(validateSiteEdit({key:"price.snorkeling",locale:"en",value:"",expected_version:1,owner_confirmed:true}).value,"");
 assert.throws(()=>validateSiteEdit({key:"hero.title",locale:"en",value:"",expected_version:1,owner_confirmed:true}),/Konten/);
});
test("owner website dashboard includes the published list and a visibly editable optional price",async()=>{
 const {readFileSync}=await import("node:fs");
 const {resolve}=await import("node:path");
 const html=readFileSync(resolve("public/dashboard.html"),"utf8");
 const controller=readFileSync(resolve("public/app.js"),"utf8");
 assert.match(html,/data-cms-view="published"/);
 assert.match(html,/id="cmsPublishedList"/);
 assert.match(html,/id="cmsDraftList"/);
 assert.match(html,/name="price_amount" type="number"/);
 assert.match(html,/id="cmsClearPrice"/);
 assert.match(html,/data-cms-page="snorkeling"/);
 assert.match(controller,/function editWebsiteActivity/);
 assert.match(controller,/cmsSaveDraft/);
 assert.doesNotMatch(html,/ADMIN_TOKEN_VALUE/);
});


test("published editor snapshot is populated from the real public pages and translations",async()=>{
 const {execFileSync}=await import("node:child_process");
 const {readFileSync}=await import("node:fs");
 execFileSync(process.execPath,["scripts/build.mjs"],{stdio:"pipe"});
 const defaults=JSON.parse(readFileSync("public/site-editor-defaults.json","utf8"));
 assert.match(defaults.id["hero.title"],/Liburan/);
 assert.match(defaults.en["hero.title"],/Unforgettable/i);
 assert.match(defaults.id["snorkelingPage.title"],/Snorkeling/);
 assert.match(defaults.id["westSpot.kelingking.description"],/Tebing/i);
 assert.match(defaults.id["snorkelingSpot.mantaBay.description"],/manta/i);
 assert.match(defaults.en["price.snorkeling"],/Rp350,000/);
 assert.equal(Object.keys(defaults.photos).length,18);
 assert.match(defaults.photos["west-kelingking"].url,/^\/photos\//);
 assert.match(defaults.photos["hero"].url,/^\/photos\//);
 assert.ok(Object.keys(defaults.id).length>=65,"all existing public text including galleries should appear");
});
test("published content source uses existing pages, protected draft data is never inserted",async()=>{
 const {readFileSync}=await import("node:fs");
 const page=readFileSync("public/dashboard.html","utf8");
 const js=readFileSync("public/app.js","utf8");
 const worker=readFileSync("src/site-content.mjs","utf8");
 const builder=readFileSync("scripts/build.mjs","utf8");
 assert.match(page,/id="cmsLegacyPublished"/);
 assert.match(page,/id="cmsPageFields"/);
 assert.match(page,/id="cmsPagePhotos"/);
 assert.match(js,/async function loadCmsPublishedSnapshot/);
 assert.match(js,/cmsEffectiveValue\(key,lang\)/);
 assert.match(js,/function drawPublishedPageCards/);
 assert.match(js,/function filterCmsPageFields/);
 assert.match(js,/function renderCmsPagePhotos/);
 assert.match(builder,/public\/site-editor-defaults\.json/);
 assert.match(worker,/westSpot\.kelingking\.description/);
 assert.doesNotMatch(builder,/admin\/session|ADMIN_TOKEN|booking_id|operator_net/);
});
test("each destination's gallery photo uses an isolated slot while the five homepage slots remain",async()=>{
 const {getWebsiteSlots,updateWebsiteSlot}=await import("../src/website-cms.mjs");
 const id="12345678-1234-4234-9234-123456789abc";
 const queries=[];
 const fake={
  prepare(sql){queries.push(sql);
   return {bind(...args){return {first:async()=>({id,alt_id:"Pantai",alt_en:"Beach"}),run:async()=>({meta:{changes:1}})}} ,
    all:async()=>({results:sql.includes("website_gallery_photo_slots")?[{slot:"west-broken-beach",media_id:id,alt_id:"Pantai",alt_en:"Beach"}]:[]})};
  }
 };
 const slots=await getWebsiteSlots(fake);
 assert.equal(slots.items.length,1);
 assert.equal(slots.items[0].slot,"west-broken-beach");
 await updateWebsiteSlot(fake,{slot:"west-broken-beach",media_id:id,owner_confirmed:true});
 assert.ok(queries.some(x=>x.startsWith("INSERT INTO website_gallery_photo_slots(")));
 await updateWebsiteSlot(fake,{slot:"hero",media_id:id,owner_confirmed:true});
 assert.ok(queries.some(x=>x.startsWith("INSERT INTO website_photo_slots(")));
 await assert.rejects(()=>updateWebsiteSlot(fake,{slot:"not-a-real-photo-slot",media_id:id,owner_confirmed:true}),/valid/);
});

test("owner photo replacement updates gallery credit rather than misattributing original Commons photographer",async()=>{
 const {readFileSync}=await import("node:fs");
 const client=readFileSync("public/website-content.js","utf8");
 assert.match(client,/data-npe-owner-photo/);
 assert.match(client,/caption\.textContent/);
 assert.match(client,/owner confirmed usage rights/);
});

test("ganti foto offers saved NPE photos or phone gallery in the same dialog",async()=>{
 const {readFileSync}=await import("node:fs");
 const html=readFileSync("public/dashboard.html","utf8");
 const js=readFileSync("public/app.js","utf8");
 const css=readFileSync("public/dashboard.css","utf8");
 for(const id of ["cmsQuickPhotoFile","cmsQuickPhotoDialog","cmsQuickPhotoPreview",
   "cmsQuickPhotoTitle","cmsQuickPhotoAltId","cmsQuickPhotoAltEn","cmsQuickPhotoRights",
   "cmsQuickPhotoSave","cmsQuickPhotoCancel"]){
  assert.ok(html.includes('id="'+id+'"'),id+" direct picker control absent");
 }
 assert.match(html,/id="cmsQuickPhotoFile" type="file" accept="image\/\*"/);
 assert.match(html,/aria-labelledby="cmsQuickPhotoHeading"/);
 assert.match(css,/\.npeQuickPhotoDialog::backdrop/);
 assert.match(js,/beginCmsQuickPhoto\(b\.dataset\.cmsEditPhoto\)/);
 assert.match(js,/beginCmsQuickPhoto\(b\.dataset\.cmsQuickPhoto\)/);
 assert.match(js,/beginCmsQuickPhoto\(slot\);\s*\};\s*\$\("#cmsPageSave"\)/);
 assert.match(js,/picker\.click\(\); \/\/ native file picker called directly by user gesture/);
 assert.match(js,/quickPhotoDialog\.showModal\(\)/);
 assert.match(js,/async function uploadCmsWebsitePhoto\(/);
 assert.match(js,/if\(!cmsQuickPhotoMediaId\)/);
 assert.match(js,/await api\("admin\/website\/slots","POST",\{slot,media_id:cmsQuickPhotoMediaId,owner_confirmed:true\}\)/);
 // Changing a photo must not run the full page content loader, which would erase unsaved copy edits.
 const directFlow=js.slice(js.indexOf('$("#cmsQuickPhotoSave").onclick'),js.indexOf('function cmsCurrentPhoto('));
 assert.doesNotMatch(directFlow,/loadWebsiteCMS\(\)|renderCmsPageFields\(\)|cmsView\("media"\)/);
 assert.match(directFlow,/drawPublishedPageCards\(\)/);
 assert.match(directFlow,/renderCmsPagePhotos\(\)/);
});
test("photo publishing is opt-in and does not navigate or change bookings",async()=>{
 const {readFileSync}=await import("node:fs");
 const js=readFileSync("public/app.js","utf8");
 const directFlow=js.slice(js.indexOf('$("#cmsQuickPhotoSave").onclick'),js.indexOf("function cmsCurrentPhoto("));
 assert.match(directFlow,/if\(cmsQuickPhotoSource&&!\$\("#cmsQuickPhotoRights"\)\.checked\)/);
 assert.match(directFlow,/owner_confirmed:true/);
 assert.match(js,/form\.append\("rights_confirmed","true"\)/);
 assert.doesNotMatch(directFlow,/admin\/bookings|admin\/rates|window\.location|location\.href/);
});

test("NPE Gallery displays saved photos and allows picking a stored photo or phone image",async()=>{
 const {readFileSync}=await import("node:fs");
 const html=readFileSync("public/dashboard.html","utf8");
 const script=readFileSync("public/app.js","utf8");
 assert.match(html,/id="cmsOpenGallery"/);
 assert.match(html,/id="cmsGalleryStatus"/);
 assert.match(html,/id="cmsGallerySearch"/);
 assert.match(html,/id="cmsQuickPhotoGallery"/);
 assert.match(html,/id="cmsQuickPickExisting"/);
 assert.match(html,/id="cmsQuickPickPhone"/);
 assert.match(html,/id="cmsQuickPhotoReuseNote"/);
 assert.match(script,/function drawCmsQuickGallery/);
 assert.match(script,/data-quick-existing/);
 assert.match(script,/cmsQuickPhotoMediaId=m\.id/);
 assert.match(script,/picker\.click\(\); \/\/ native file picker called directly by user gesture/);
 assert.match(script,/async function refreshNpeGallery/);
 assert.match(script,/if\(name==="media"\)void refreshNpeGallery\(\)/);
});
test("photo gallery deletion is confirmed and disabled for photos in use",async()=>{
 const {readFileSync}=await import("node:fs");
 const script=readFileSync("public/app.js","utf8");
 assert.match(script,/m\.usage_count>0\?'disabled/);
 assert.match(script,/async function deleteNpeMedia/);
 assert.match(script,/window\.confirm\("Hapus foto/);
 assert.match(script,/admin\/website\/media\/"\+id,"DELETE",\{owner_confirmed:true\}/);
 const server=readFileSync("src/worker.mjs","utf8");
 assert.match(server,/if\(method!=="DELETE"\)return bad/);
 assert.match(server,/await deleteWebsiteMedia\(db,env,websiteMediaDelete\[1\],await parse\(req\)\)/);
});
test("website media usage counts include both page slots and all activity drafts and publications",async()=>{
 const {listWebsiteMedia}=await import("../src/website-cms.mjs");
 const id="12345678-1234-4234-9234-123456789abc",free="87654321-4321-4321-9321-cba987654321";
 const fake={prepare(sql){
  if(sql.includes("SELECT id,title,alt_id"))return {all:async()=>({results:[
    {id,title:"Busy",alt_id:"A",alt_en:"A",bytes:10000,created_at:"2026-11-24"},
    {id:free,title:"Free",alt_id:"B",alt_en:"B",bytes:10000,created_at:"2026-11-24"}
   ]})};
  assert.match(sql,/website_photo_slots/);
  assert.match(sql,/website_gallery_photo_slots/);
  assert.match(sql,/json_extract\(draft_json/);
  assert.match(sql,/json_extract\(published_json/);
  return {all:async()=>({results:[{media_id:id,used:3}]})};
 }};
 const r=await listWebsiteMedia(fake);
 assert.equal(r.items[0].usage_count,3);
 assert.equal(r.items[1].usage_count,0);
});
test("owner deletion rejects references and requires explicit confirmation",async()=>{
 const {deleteWebsiteMedia}=await import("../src/website-cms.mjs");
 const id="12345678-1234-4234-9234-123456789abc";
 let changes=0,kvDeleted=0,executedSQL="";
 const fake={prepare(sql){
  if(sql.startsWith("SELECT id,title FROM website_media"))return {bind:()=>({first:async()=>({id,title:"Busy"})})};
  if(sql.startsWith("DELETE FROM website_media")){executedSQL=sql;return {bind:()=>({run:async()=>({meta:{changes}})})};}
  throw Error("Unexpected SQL");
 }};
 const env={PHOTO_KV:{delete:async()=>{kvDeleted++;}}};
 const withoutConsent=await deleteWebsiteMedia(fake,env,id,{owner_confirmed:false});
 assert.equal(withoutConsent.status,403);
 const inUse=await deleteWebsiteMedia(fake,env,id,{owner_confirmed:true});
 assert.equal(inUse.status,409);
 assert.equal(kvDeleted,0);
 assert.match(executedSQL,/NOT EXISTS \(SELECT 1 FROM website_photo_slots/);
 assert.match(executedSQL,/NOT EXISTS \(SELECT 1 FROM website_gallery_photo_slots/);
 assert.match(executedSQL,/json_extract\(draft_json/);
 assert.match(executedSQL,/json_extract\(published_json/);
 changes=1;
 const removed=await deleteWebsiteMedia(fake,env,id,{owner_confirmed:true});
 assert.equal(removed.status,200);
 assert.equal((await removed.json()).deleted,true);
 assert.equal(kvDeleted,1);
});
test("identical website photo upload returns existing image instead of throwing 409",async()=>{
 const {storeWebsiteMedia}=await import("../src/website-cms.mjs");
 const b=new Uint8Array(12000);b.set([255,216,255],0);b.set([255,217],11998);
 const form=new FormData();
 form.append("file",new Blob([b],{type:"image/jpeg"}),"same.jpg");
 form.append("title","Same photo");
 form.append("alt_id","Foto sama");form.append("alt_en","Same photo");
 form.append("rights_confirmed","true");
 const id="12345678-1234-4234-9234-123456789abc";
 const fake={prepare(sql){assert.match(sql,/WHERE digest/);return {bind:()=>({first:async()=>({id,title:"Existing",alt_id:"Existing ID",alt_en:"Existing EN"})})};}};
 let uploaded=false;
 const req=new Request("https://example.com/api/admin/website/media",{method:"POST",body:form});
 const out=await storeWebsiteMedia(req,{PHOTO_KV:{put:async()=>{uploaded=true;}}},fake);
 assert.equal(out.status,200);
 const reply=await out.json();
 assert.equal(reply.id,id);
 assert.equal(reply.reused,true);
 assert.equal(uploaded,false);
});

test("activity details support each existing tour and dynamic published parents",()=>{
 for(const [parent,category] of [["static:snorkeling","SNORKELING"],["static:island","ISLAND_TOUR"],["static:west","ISLAND_TOUR"],["static:east","ISLAND_TOUR"],["activity:lembongan","ISLAND_TOUR"]])assert.equal(validateWebsiteDraft({...draft,parent_activity:parent,category}).parent_activity,parent);
 assert.throws(()=>validateWebsiteDraft({...draft,parent_activity:"static:snorkeling"}),/induk/);
 assert.throws(()=>validateWebsiteDraft({...draft,parent_activity:"activity:"+draft.slug}),/induk/);
 assert.throws(()=>validateWebsiteDraft({...draft,parent_activity:"unknown"}),/induk/);
});
test("details do not leak from archived dynamic parents",async()=>{
 const {publicWebsiteActivities}=await import("../src/website-cms.mjs");
 const rows=[{id:"1",published_json:JSON.stringify({...draft,slug:"mangrove-point",category:"SNORKELING",parent_activity:"static:snorkeling"})},{id:"2",published_json:JSON.stringify({...draft,slug:"hidden-detail",parent_activity:"activity:archived-parent"})}];
 const fake={prepare:()=>({all:async()=>({results:rows})})};
 assert.deepEqual((await publicWebsiteActivities(fake)).items.map(x=>x.slug),["mangrove-point"]);
});

test("URL generated by server from parent context and English title, with safe normalization",async()=>{
 const {websiteSlugBase}=await import("../src/website-cms.mjs");
 assert.equal(websiteSlugBase({...draft,title_en:"Mangrove Point",parent_activity:"static:snorkeling"}),"snorkeling-mangrove-point");
 assert.equal(websiteSlugBase({...draft,parent_activity:""}),"nusa-lembongan-island-tour");
 assert.equal(websiteSlugBase({...draft,title_en:"Dream Beach",parent_activity:"activity:nusa-lembongan-island-tour"}),"nusa-lembongan-island-tour-dream-beach");
 assert.equal(websiteSlugBase({...draft,title_en:"Angel’s Billabong & Café",parent_activity:"static:west"}),"west-angel-s-billabong-cafe");
 assert.ok(websiteSlugBase({...draft,title_en:"a".repeat(150),parent_activity:"activity:"+"b".repeat(90)}).length<=90);
});
test("new activity allocates unique automatic URL without slug input; editing preserves it",async()=>{
 const {saveWebsiteActivity}=await import("../src/website-cms.mjs");
 const rows=new Map([["snorkeling-mangrove-point",{id:"existing"}]]);
 const db={prepare:sql=>({bind:(...args)=>({
  run:async()=>{
   if(sql.startsWith("INSERT")){
    const [id,slug,json]=args;
    if(rows.has(slug))return {meta:{changes:0}};
    rows.set(slug,{id,slug,draft_json:json,version:1});return {meta:{changes:1}};
   }
   const [json,id]=args;
   const row=[...rows.values()].find(x=>x.id===id);
   row.draft_json=json;row.version++;return {meta:{changes:1}};
  },
  first:async()=>[...rows.values()].find(x=>x.id===args[0])||null
 })})};
 const data={...draft,slug:undefined,title_en:"Mangrove Point",title_id:"Mangrove Point",category:"SNORKELING",parent_activity:"static:snorkeling"};
 const result=await saveWebsiteActivity(db,{draft:data});
 assert.equal(result.slug,"snorkeling-mangrove-point-2");
 const edit=await saveWebsiteActivity(db,{draft:{...data,title_en:"New name",slug:"forged-url"},expected_version:1},result.id);
 assert.equal(edit.slug,result.slug);
 assert.equal(JSON.parse(rows.get(result.slug).draft_json).slug,result.slug);
});
test("dashboard has no editable URL field and captures parent from clicked action",async()=>{
 const {readFileSync}=await import("node:fs");
 const html=readFileSync("public/dashboard.html","utf8"),js=readFileSync("public/app.js","utf8");
 assert.doesNotMatch(html,/<input[^>]+name="slug"/);
 assert.doesNotMatch(js,/cmsField\("slug"\)/);
 assert.match(js,/resetWebsiteForm\(\);cmsParentOptions\(parent\);cmsSyncParent\(\)/);
});

test("activity descriptions allow pasted paragraphs, tabs and CRLF, reject HTML and unsafe controls",()=>{
 const content="Mangrove Point menyuguhkan terumbu karang.\r\n\r\nNikmati ikan tropis dan arus laut.\tIkuti pemandu.";
 const result=validateWebsiteDraft({...draft,description_id:content,description_en:"First paragraph.\n\nSecond paragraph.",summary_id:"Baris pertama.\nBaris kedua."});
 assert.equal(result.description_id,content.replace(/\r\n/g,"\n"));
 assert.equal(result.description_en,"First paragraph.\n\nSecond paragraph.");
 assert.throws(()=>validateWebsiteDraft({...draft,description_id:"<script>alert(1)</script>"}),/description_id/);
 assert.throws(()=>validateWebsiteDraft({...draft,description_id:"Valid\u0000 invalid"}),/description_id/);
 assert.throws(()=>validateWebsiteDraft({...draft,description_id:"x".repeat(3001)}),/description_id/);
});
test("SEO automatically uses localized content and activity context, with manual override",async()=>{
 const {suggestWebsiteSEO}=await import("../src/website-cms.mjs");
 const input={...draft,slug:"snorkeling-mangrove-point",category:"SNORKELING",parent_activity:"static:snorkeling",title_id:"Mangrove Point",title_en:"Mangrove Point",summary_en:"Explore colorful coral gardens.",summary_id:"Jelajahi terumbu karang berwarna.",description_en:"See tropical fish and coral in Nusa Lembongan.",description_id:"Lihat ikan tropis dan karang di Nusa Lembongan."};
 const result=validateWebsiteDraft(input);
 assert.equal(result.seo_mode,"AUTO");
 assert.match(result.seo_title_en,/Mangrove Point – Snorkeling/);
 assert.match(result.seo_description_id,/terumbu karang/);
 assert.match(result.seo_description_en,/coral gardens/);
 assert.ok(result.seo_title_en.length<=65);
 assert.ok(result.seo_description_id.length<=160);
 assert.equal(result.seo_title_en,suggestWebsiteSEO(input).seo_title_en);
 assert.equal(validateWebsiteDraft({...input,seo_mode:"MANUAL",seo_title_en:"Custom title"}).seo_title_en,"Custom title");
 assert.equal(validateWebsiteDraft({...input,seo_mode:"AUTO",seo_title_en:"Stale title"}).seo_title_en,result.seo_title_en);
 assert.throws(()=>validateWebsiteDraft({...input,seo_mode:"MANUAL",seo_title_en:"<script>"}),/seo_title_en/);
});
