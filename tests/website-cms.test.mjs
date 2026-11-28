import test from "node:test";
import assert from "node:assert/strict";
import {validateWebsiteDraft,renderExperiencePage,renderWebsiteSitemap,renderEnglishTourPage,englishTourKeys,publishWebsiteActivity,legacyTourRoute,renderLegacyTourPage} from "../src/website-cms.mjs";
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
 assert.equal(price.price_label_en,"From Rp350.000/person");
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
 assert.match(defaults.id["hero.title"],/Paket Wisata/);
 assert.match(defaults.en["hero.title"],/Nusa Penida Tours/i);
 assert.match(defaults.id["snorkelingPage.title"],/Snorkeling/);
 assert.match(defaults.id["westSpot.kelingking.description"],/Tebing/i);
 assert.match(defaults.id["snorkelingSpot.mantaBay.description"],/manta/i);
 assert.match(defaults.en["price.snorkeling"],/Rp350\.000/);
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
   "cmsQuickPhotoMetaNote","cmsQuickPhotoRights",
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
  assert.ok(sql.split("UNION ALL").length<=5,"D1 compound SELECT limit");
  if(sql.includes("seo_articles")){assert.match(sql,/draft_media_id/);assert.match(sql,/published_media_id/);return {all:async()=>({results:[{media_id:id,used:2}]})};}
  assert.match(sql,/website_photo_slots/);
  assert.match(sql,/website_gallery_photo_slots/);
  assert.match(sql,/json_extract\(draft_json/);
  assert.match(sql,/json_extract\(published_json/);
  return {all:async()=>({results:[{media_id:id,used:3}]})};
 }};
 const r=await listWebsiteMedia(fake);
 assert.equal(r.items[0].usage_count,5);
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

test("published destination rendering works with clean URLs, .html, trailing slash and a failed photo endpoint",async()=>{
 const {readFileSync}=await import("node:fs");
 const {runInNewContext}=await import("node:vm");
 const code=readFileSync("public/website-content.js","utf8").replace(/^import .*content-order\.mjs";\n/m,"");
 const layoutModule=await import("../public/content-order.mjs");
 const item={id:"mangrove",slug:"snorkeling-mangrove-point",parent_activity:"static:snorkeling",title_id:"Mangrove Point",title_en:"Mangrove Point EN",summary_id:"Terumbu karang",description_id:"Ikan tropis",summary_en:"Corals",description_en:"Fish",photo_url:"/photos/website/example"};
 const makeNode=(tag)=>({tag,dataset:{},children:[],append(...nodes){this.children.push(...nodes)},appendChild(n){this.children.push(n)},matches(s){return tag==="grid"&&s===".scene-grid"},querySelectorAll(){return []},setAttribute(){}});
 for(const path of ["/snorkeling","/snorkeling.html","/snorkeling/","/snorkeling.html/"]){
  for(const marked of [true,false]){
   const grid=makeNode("grid"),listeners={};
   if(marked)grid.dataset.npeDetailParent="static:snorkeling";
   const document={documentElement:{lang:"id"},createElement:makeNode,querySelector(s){return s===".scene-grid"?grid:s==="[data-npe-detail-parent]"&&marked?grid:null},querySelectorAll(){return []}};
   const window={addEventListener(k,v){listeners[k]=v}};
   const fetch=async url=>url.endsWith("/slots")?{ok:false}:{ok:true,json:async()=>({items:[item]})};
   const context={...layoutModule,document,window,location:{pathname:path},fetch,console};
   await runInNewContext(code+"\nloadWebsitePublic()",context);
   assert.ok(grid.children.some(c=>c.dataset.npeDynamicDetail==="mangrove"),path+" "+marked);
   assert.notEqual(grid.hidden,true);
  }
 }
 for(const [page,kind] of [["snorkeling","snorkeling"],["island-tour","island"],["west-tour","west"],["east-tour","east"]]){
  assert.ok(readFileSync("public/"+page+".html","utf8").includes('data-npe-detail-parent="static:'+kind+'"'));
 }
});

test("photo metadata automatically derives from activity title or filename with bounded safe text",async()=>{
 const {readFileSync}=await import("node:fs");
 const {runInNewContext}=await import("node:vm");
 const js=readFileSync("public/app.js","utf8");
 const helper=js.slice(js.indexOf("function cmsPhotoMetadata("),js.indexOf("function beginCmsQuickPhoto("));
 const meta=runInNewContext(helper+'\ncmsPhotoMetadata({name:"IMG_1234.jpg"},"Mangrove Point","Mangrove Point")');
 assert.equal(meta.title,"Mangrove Point");
 assert.match(meta.altId,/Foto Mangrove Point/);
 assert.match(meta.altEn,/Photo of Mangrove Point/);
 const standalone=runInNewContext(helper+'\ncmsPhotoMetadata({name:"dream_beach.jpg"})');
 assert.equal(standalone.title,"dream beach");
 const bounded=runInNewContext(helper+'\ncmsPhotoMetadata({name:"a.jpg"},"<x>"+"a".repeat(200),"b".repeat(200))');
 assert.ok(bounded.title.length<=120&&bounded.altEn.length<=180);
 assert.doesNotMatch(bounded.title,/[<>]/);
});
test("activity photo picker uses shared dialog and never asks for duplicate descriptions or publishes prematurely",async()=>{
 const {readFileSync}=await import("node:fs");
 const html=readFileSync("public/dashboard.html","utf8"),js=readFileSync("public/app.js","utf8");
 assert.match(js,/\$\("#cmsChoosePhoto"\)\.onclick=\(\)=>beginCmsQuickPhoto\("__activity__"\)/);
 const upload=html.slice(html.indexOf('<form id="cmsMediaUpload"'),html.indexOf("</form>",html.indexOf('<form id="cmsMediaUpload"')));
 assert.doesNotMatch(upload,/name="(?:alt_id|alt_en)"/);
 assert.match(upload,/name="title"/);
 assert.match(upload,/name="rights_confirmed"/);
 const dialog=html.slice(html.indexOf('<dialog id="cmsQuickPhotoDialog"'),html.indexOf("</dialog>"));
 assert.doesNotMatch(dialog,/id="cmsQuickPhoto(?:Title|AltId|AltEn)"/);
 const flow=js.slice(js.indexOf("  if(isActivity){\n   // Only bind"),js.indexOf("  const slot=cmsQuickPhotoSlot;",js.indexOf("  if(isActivity){\n   // Only bind")));
 assert.match(flow,/cmsSet\("media_id",photo.id\)/);
 assert.match(flow,/refreshActivityPreview\(\)/);
 assert.match(flow,/return;/);
 assert.doesNotMatch(flow,/cmsForm\.reset|loadWebsiteCMS|cmsView|admin\/website\/slots|publishWebsiteActivity/);
});

test("every homepage tour cover and destination thumbnail uses its corresponding CMS photo slot",async()=>{
 const {readFileSync}=await import("node:fs");
 const html=readFileSync("public/index.html","utf8");
 const expected={west:["west","west-kelingking","west-broken-beach","west-angels-billabong","west-crystal-bay"],east:["east","east-diamond-beach","east-atuh-beach","east-tree-house","east-atuh-beach"],sea:["snorkeling","snorkeling-manta-bay","snorkeling-manta-point","snorkeling-gamat-bay","snorkeling-crystal-bay"]};
 for(const [group,slots] of Object.entries(expected)){
  const card=html.match(new RegExp('<article class="spot-showcase '+group+'-showcase">[\\s\\S]*?<\\/article>'))[0];
  const imgs=[...card.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
  assert.deepEqual(imgs.map(img=>img.match(/data-npe-slot="([^"]+)"/)?.[1]),slots);
 }
 assert.equal([...html.matchAll(/data-npe-slot="snorkeling"/g)].length,2);
 const js=readFileSync("public/app.js","utf8");
 assert.match(js,/"snorkeling": \[\s*"snorkeling",\s*"snorkeling-manta-bay"/);
 assert.match(js,/Cover Snorkeling \(Paket & 3 Spots\)/);
});
test("public photo replacement updates both snorkeling covers and distinct spot images",async()=>{
 const {readFileSync}=await import("node:fs");
 const {runInNewContext}=await import("node:vm");
 const js=readFileSync("public/website-content.js","utf8");
 const helper=js.slice(0,js.indexOf("async function loadWebsiteActivities")).replace(/^import .*content-order\.mjs";\n/m,"");
 const imgs=["snorkeling","snorkeling","snorkeling-manta-point","west-crystal-bay"].map(slot=>({dataset:{npeSlot:slot,photoFallbackStage:"github",localPhotoFailed:"1"},src:"old",alt:"old",removeAttribute(){},closest(){return null}}));
 const slots=[{slot:"snorkeling",url:"/photos/website/cover",alt_id:"Snorkeling",alt_en:"Snorkeling"},{slot:"snorkeling-manta-point",url:"/photos/website/manta",alt_id:"Manta Point",alt_en:"Manta Point"}];
 const context={document:{documentElement:{lang:"id"},querySelectorAll(s){return s==="img[data-npe-slot]"?imgs:[]}},window:{},fetch:async()=>({ok:true,json:async()=>({items:slots})})};
 await runInNewContext(helper+"\nloadWebsitePhotos()",context);
 assert.deepEqual(imgs.map(x=>x.src),["/photos/website/cover","/photos/website/cover","/photos/website/manta","old"]);
 assert.equal(imgs[0].dataset.photoFallbackStage,undefined);
 assert.equal(imgs[3].dataset.photoFallbackStage,"github");
});

test("standalone upload retains the form reference after awaiting upload",async()=>{
 const {readFileSync}=await import("node:fs");
 const {runInNewContext}=await import("node:vm");
 const js=readFileSync("public/app.js","utf8");
 const code=js.slice(js.indexOf('$("#cmsMediaUpload").onsubmit='),js.indexOf('$("#cmsPublishSlot").onclick='));
 let reset=false,selected="",message="";
 const button={disabled:false},form={querySelector:()=>button,reset(){reset=true;}};
 const nodes={"#cmsMediaUpload":{},"#cmsSlotMedia":{set value(v){selected=v;}}};
 const e={currentTarget:form,preventDefault(){}};
 const context={$:s=>nodes[s],FormData:class{get(k){return k==="file"?{name:"test.jpg"}:"My photo";}has(){return true;}},cmsPhotoMetadata:()=>({title:"My photo",altId:"Foto",altEn:"Photo"}),uploadCmsWebsitePhoto:async()=>{e.currentTarget=null;return {id:"saved"};},npeCmsMedia:[],drawWebsiteCMS(){},refreshNpeGallery:async()=>{},say:(_,v)=>{message=v;}};
 runInNewContext(code,context);
 await nodes["#cmsMediaUpload"].onsubmit(e);
 assert.ok(reset);
 assert.equal(selected,"saved");
 assert.match(message,/Foto tersimpan/);
 assert.equal(button.disabled,false);
});
test("manual website category persists independently and is usable in activity validation",async()=>{
 const {DatabaseSync}=await import("node:sqlite");
 const {readFileSync}=await import("node:fs");
 const {createWebsiteCategory,listWebsiteCategories}=await import("../src/website-cms.mjs");
 const sqlite=new DatabaseSync(":memory:");
 sqlite.exec(readFileSync("database/migrations/0024_website_gallery_slots.sql","utf8"));
 const db={prepare(sql){const st=sqlite.prepare(sql);return {bind(...args){return {run:async()=>st.run(...args),first:async()=>st.get(...args)}},all:async()=>({results:st.all()})}}};
 const category=await createWebsiteCategory(db,{name:"Diving"});
 assert.equal(category.category,"CUSTOM:Diving");
 assert.equal((await createWebsiteCategory(db,{name:"diving"})).category,category.category);
 assert.equal((await listWebsiteCategories(db)).items.length,1);
 assert.equal(validateWebsiteDraft({...draft,category:category.category}).category,category.category);
 assert.throws(()=>validateWebsiteDraft({...draft,category:"CUSTOM:<script>"}),/Kategori/);
 assert.throws(()=>validateWebsiteDraft({...draft,category:category.category,parent_activity:"static:snorkeling"}),/induk/);
 sqlite.close();
});
test("photo chooser shows only two sources, no photo descriptions and cache-safe dashboard assets",async()=>{
 const {readFileSync}=await import("node:fs");
 const html=readFileSync("public/dashboard.html","utf8"),js=readFileSync("public/app.js","utf8"),headers=readFileSync("public/_headers","utf8");
 assert.match(html,/id="cmsQuickGalleryPanel" hidden/);
 assert.match(html,/id="cmsQuickPhotoName"/);
 assert.match(html,/id="cmsActivityMedia" hidden/);
 assert.match(html,/id="cmsAddCategory"/);
 assert.match(js,/admin\/website\/categories/);
 assert.match(html,/src="\/app\.js\?v=3\.36\.0&amp;rev=seo006c-competitors1"/);
 assert.match(headers,/\/dashboard\.html\s+Cache-Control: no-store/);
});


test("original tourist pages expose safe factual structured data and useful crawlable tour links",async()=>{
 const {readFileSync}=await import("node:fs");
 const paths=["index.html","snorkeling.html","island-tour.html","west-tour.html","east-tour.html"];
 for(const path of paths){
  const html=readFileSync("public/"+path,"utf8");
  assert.match(html,/application\/ld\+json/);
  assert.match(html,/BreadcrumbList/);
  assert.match(html,/Organization/);
  assert.match(html,/og:image/);
  assert.match(html,/rel="canonical"/);
  assert.doesNotMatch(html,/"aggregateRating"|"reviewCount"/);
 }
 const home=readFileSync("public/index.html","utf8");
 assert.match(home,/href="\/id\/experiences\/boat-ticket"/);
 assert.match(home,/href="\/id\/experiences\/nusa-lembongan-island-tour"/);
});
test("published experience SEO has visible child links, image previews and structured breadcrumbs",()=>{
 const a={...draft,photo_url:"/photos/website/123"};
 const html=renderExperiencePage(a,"en","https://example.com",[a,{...a,slug:"child",parent_activity:"activity:"+a.slug,title_en:"Scenic Destination"}]);
 assert.match(html,/BreadcrumbList/);
 assert.match(html,/og:image/);
 assert.match(html,/href="\/en\/experiences\/child"/);
});

test("published parent gallery transparently distinguishes optional stops",()=>{
 const root={...draft,photo_url:"/photos/website/123"};
 const child={...root,slug:"extra-stop",parent_activity:"activity:"+root.slug,title_en:"Optional Photo Stop"};
 const en=renderExperiencePage(root,"en","https://example.com",[root,child]);
 const id=renderExperiencePage(root,"id","https://example.com",[root,child]);
 assert.match(en,/not every location is included/);
 assert.match(id,/tidak semua lokasi otomatis termasuk/);
});

test("English tour pages are indexable, reciprocal, truthful, and do not expose owner data",()=>{
 assert.deepEqual(englishTourKeys,["","west","east","snorkeling","island"]);
 const publishedCatalog=[{slug:"nusa-lembongan-island-tour",parent_activity:"",title_en:"Nusa Lembongan Island Tour"},{slug:"boat-ticket",parent_activity:"",title_en:"Fast Boat Tickets"}];
 for(const key of englishTourKeys){
  const html=renderEnglishTourPage(key,"https://example.com",{},publishedCatalog);
  assert.match(html,/<html lang="en">/);
  assert.match(html,/hreflang="id"/);
  assert.match(html,/hreflang="en"/);
  assert.match(html,/rel="canonical"/);
  assert.match(html,/application\/ld\+json/);
  assert.match(html,/npeFaqGrid/);
  assert.match(html,/Wikimedia Commons/);
  assert.match(html,/https:\/\/wa\.me\/628561752525/);
  assert.match(html,/Nusa Lembongan Island Tour/);
  assert.doesNotMatch(html,/Admin Token|booking database|"reviewCount"|"aggregateRating"/);
  assert.match(html,/href="\/en\/experiences\/nusa-lembongan-island-tour"/);
  assert.match(html,/href="\/en\/experiences\/boat-ticket"/);
  assert.equal(renderEnglishTourPage(key,"https://example.com",{},publishedCatalog),html);
 }
 assert.equal(renderEnglishTourPage("unknown","https://example.com"),null);
});
test("English tour sitemap links match exact Indonesian counterparts",async()=>{
 const db={prepare:()=>({all:async()=>({results:[]})})};
 const xml=await renderWebsiteSitemap(db,"https://example.com");
 for(const path of ["/en/tours","/en/tours/snorkeling","/en/tours/island","/en/tours/west","/en/tours/east"])assert.ok(xml.includes("https://example.com"+path),path);
 assert.match(xml,/hreflang="id"/);
 assert.match(xml,/hreflang="en"/);
});

test("English SEO tour SSR reflects owner-approved CMS copy without duplicating site data",()=>{
 const initial=renderEnglishTourPage("west","https://example.com");
 const updated=renderEnglishTourPage("west","https://example.com",{
  "westPage.title":"West Coast Adventures",
  "westPage.lead":"Beautiful cliffs with local guides.",
  "westPage.description":"The verified operator will confirm our scenic route."
 });
 assert.notEqual(initial,updated);
 assert.match(updated,/West Coast Adventures/);
 assert.match(updated,/Beautiful cliffs with local guides/);
 assert.match(updated,/The verified operator will confirm/);
 assert.match(updated,/Nusa Penida West Tour|West Nusa Penida Tour/);
 const unsafe=renderEnglishTourPage("east","https://example.com",{"eastPage.lead":"<script>alert(1)</script>"});
 assert.doesNotMatch(unsafe,/<script>alert\(1\)<\/script>/);
 assert.match(unsafe,/&lt;script&gt;/);
});

test("legacy CMS SSR retains original markup and escapes published text",async()=>{
 const {readFileSync}=await import("node:fs");
 const page=legacyTourRoute("/west-tour");
 assert.equal(page.canonical,"/west-tour.html");
 assert.equal(legacyTourRoute("/index.html").canonical,"/");
 assert.equal(legacyTourRoute("/dashboard.html"),null);
 const html=renderLegacyTourPage(readFileSync("public/west-tour.html","utf8"),page,"https://example.com",{"westPage.title":"Wisata Barat Baru","westPage.lead":"Lihat <script>alert(1)</script>"},[{slug:"new-stop",parent_activity:"static:west",title_id:"Spot Baru"}]);
 assert.match(html,/<title>Wisata Barat Baru \| Nusa Penida Experiences<\/title>/);
 assert.match(html,/data-npe-default="Wisata Nusa Penida Barat">Wisata Barat Baru/);
 assert.match(html,/Lihat &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.match(html,/https:\/\/example.com\/west-tour.html/);
 assert.match(html,/https:\/\/example.com\/en\/tours\/west/);
 assert.match(html,/href="\/id\/experiences\/new-stop"/);
 assert.match(html,/Wikimedia Commons/);
 assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
});
test("legacy route binds only generated non-HTML source and protects internal paths",async()=>{
 const {default:worker}=await import("../src/worker.mjs");
 const {readFileSync}=await import("node:fs");
 const env={ASSETS:{fetch:async req=>{
  assert.equal(new URL(req.url).pathname,"/__npe_templates/index.txt");
  return new Response(readFileSync("public/index.html","utf8"));
 }}};
 const res=await worker.fetch(new Request("https://example.com/"),env,{});
 assert.equal(res.status,200);
 const html=await res.text();assert.match(html,/data-action="customer_review"/);assert.doesNotMatch(html,/id="leadForm"/);
 const alias=await worker.fetch(new Request("https://example.com/west-tour?utm_source=facebook"),env,{});
 assert.equal(alias.status,301);
 assert.equal(alias.headers.get("location"),"https://example.com/west-tour.html?utm_source=facebook");
 assert.equal((await worker.fetch(new Request("https://example.com/__npe_templates/index.txt"),env,{})).status,404);
});
test("dynamic SEO pages have public WhatsApp tracking",()=>{
 for(const html of [renderEnglishTourPage("west","https://example.com"),renderExperiencePage({...draft,photo_url:"/photos/website/123"},"id","https://example.com")]){
  assert.match(html,/data-whatsapp-chat/);assert.match(html,/website-content\.js\?v=/);
 }
});

test("production migration permanently redirects public documents and preserves query strings without touching APIs",async()=>{
 const {default:worker}=await import("../src/worker.mjs");
 const old="https://marketing-turism-agent.finchat-ai-gateway.workers.dev";
 const canonical="https://nusapenidaexperiences.com";
 for(const host of [old,"https://www.nusapenidaexperiences.com","http://nusapenidaexperiences.com"]){
  for(const [from,to] of [["/","/"],["/index.html?utm_source=facebook","/?utm_source=facebook"],["/west-tour/","/west-tour.html"],["/en/tours/west/","/en/tours/west"],["/id/experiences/boat-ticket?campaign=123","/id/experiences/boat-ticket?campaign=123"],["/dashboard.html","/dashboard.html"],["/sitemap.xml","/sitemap.xml"]]){
   for(const method of ["GET","HEAD"]){
    const r=await worker.fetch(new Request(host+from,{method}),{},{});
    assert.equal(r.status,301,host+from);assert.equal(r.headers.get("location"),canonical+to);
   }
  }
 }
 const oldApi=await worker.fetch(new Request(old+"/api/health"),{},{});
 assert.equal(oldApi.status,200);assert.equal(oldApi.headers.get("location"),null);
 const denied=await worker.fetch(new Request(old+"/api/public/leads",{method:"POST",body:"{}"}),{},{});
 assert.notEqual(denied.status,301);
 const alias=await worker.fetch(new Request(canonical+"/en/tours/west/?utm_source=test"),{},{});
 assert.equal(alias.status,301);assert.equal(alias.headers.get("location"),canonical+"/en/tours/west?utm_source=test");
});
test("dashboard responses are explicitly excluded from indexing and caching",async()=>{
 const {default:worker}=await import("../src/worker.mjs");
 const r=await worker.fetch(new Request("https://nusapenidaexperiences.com/dashboard.html"),{ASSETS:{fetch:async()=>new Response("<html>dashboard</html>")}},{});
 assert.equal(r.status,200);assert.equal(r.headers.get("x-robots-tag"),"noindex, nofollow");assert.equal(r.headers.get("cache-control"),"no-store");
});

test("public GA4 is consistently included but not on admin",async()=>{const {readFileSync}=await import("node:fs");for(const name of ["index","snorkeling","island-tour","west-tour","east-tour","privacy","terms","cancellation"])assert.match(readFileSync("public/"+name+".html","utf8"),/analytics\.js\?v=3\.36\.0/);assert.doesNotMatch(readFileSync("public/dashboard.html","utf8"),/analytics\.js/);assert.match(renderEnglishTourPage("west","https://example.com"),/analytics\.js/);assert.match(renderExperiencePage({...draft,photo_url:"/photos/website/123"},"id","https://example.com"),/analytics\.js/);});

test("published CMS hero is in first HTML response and untrusted photo URLs are ignored",async()=>{
 const {applyPublishedPhotoSlots}=await import("../src/website-cms.mjs");
 const id="09380b3a-33a6-4429-adfd-703d2e213ab1",url="/photos/website/"+id;
 const original='<figure><img data-npe-slot="hero" src="/photos/kelingking" alt="Original" loading="eager" fetchpriority="high"><figcaption>Original credit</figcaption></figure><img data-npe-slot="west" src="/photos/broken-beach" alt="West">';
 const html=applyPublishedPhotoSlots(original,[{slot:"hero",media_id:id,url,alt_id:'Owner "photo"',alt_en:"Owner photo"},{slot:"west",media_id:id,url:"https://example.com/bad",alt_id:"bad"}]);
 assert.ok(html.includes('src="'+url+'" data-npe-original-src="/photos/kelingking"'));
 assert.match(html,/alt="Owner &quot;photo&quot;"/);
 assert.match(html,/fetchpriority="high"/);
 assert.match(html,/data-npe-owner-photo="true"/);
 assert.doesNotMatch(html,/Original credit|example\.com/);
 assert.match(html,/src="\/photos\/broken-beach"/);
});
test("LCP preload matches owner photo and hero credit is not misattributed",()=>{
 const media_id="09380b3a-33a6-4429-adfd-703d2e213ab1",url="/photos/website/"+media_id;
 const html='<html><head><link rel="stylesheet" href="/styles.css"></head><body><main><img data-npe-slot="hero" src="/photos/kelingking" alt="Kelingking" fetchpriority="high"><small class="heroCredit">Wikimedia Commons</small></main></body></html>';
 const result=renderLegacyTourPage(html,legacyTourRoute("/"),"https://example.com",{},[],"",[{slot:"hero",media_id,url,alt_id:"NPE",alt_en:"NPE"}]);
 assert.ok(result.includes('<link rel="preload" as="image" href="'+url+'" fetchpriority="high" imagesrcset="'));
 assert.ok(result.includes('src="'+url+'"'));assert.doesNotMatch(result,/Wikimedia Commons/);
});
test("website JPEG uses a bounded one-day browser cache and no longer uses a one-hour cache",async()=>{
 const {serveWebsiteMedia}=await import("../src/website-cms.mjs");
 const id="09380b3a-33a6-4429-adfd-703d2e213ab1";
 const bytes=new Uint8Array(12000);bytes.set([255,216,255],0);bytes.set([255,217],11998);
 const db={prepare(){return {bind(){return {first:async()=>({id})}}}}};
 const env={PHOTO_KV:{get:async()=>bytes.buffer}};
 const request=new Request("https://example.com/photos/website/"+id);
 const response=await serveWebsiteMedia(request,env,db);
 assert.equal(response.status,200);
 assert.equal(response.headers.get("cache-control"),"public,max-age=86400");
 assert.equal(response.headers.get("content-type"),"image/jpeg");
 assert.equal((await response.arrayBuffer()).byteLength,bytes.length);
 const missing=await serveWebsiteMedia(request,env,{prepare(){return {bind(){return {first:async()=>null}}}}});
 assert.equal(missing.status,404);
});
test("dynamic gallery image priority is set before source and honeypot has accessible name",async()=>{
 const {readFileSync}=await import("node:fs");
 const code=readFileSync("public/website-content.js","utf8");
 assert.match(code,/img\.loading="lazy";img\.decoding="async";img\.width=1200;img\.height=675;responsiveSource\(img,activity\.photo_url\);img\.src=activity\.photo_url/);
 assert.match(code,/img\.loading="lazy";img\.decoding="async";img\.width=1200;img\.height=675;img\.alt=a\["title_"\+lang\];responsiveSource\(img,a\.photo_url\);img\.src=a\.photo_url/);
 assert.match(readFileSync("public/index.html","utf8"),/<input name="website"[^>]*aria-label="[^"]+"/);
});
test("responsive sizes distinguish homepage thumbnails and hero, retain original fallback",async()=>{
 const {addResponsivePhotos,readResponsivePhoto}=await import("../src/photos.mjs");
 const html=addResponsivePhotos('<img data-npe-slot="hero" src="/photos/kelingking"><img data-npe-slot="west-atuh-beach" src="/photos/atuh-beach"><img src="https://example.com/x.jpg">',true);
 assert.match(html,/src="\/photos\/kelingking" srcset="\/photos\/kelingking\?npew=240 240w/);
 assert.match(html,/sizes="\(max-width: 700px\) 800px, 100vw"/);
 assert.match(html,/sizes="\(max-width: 700px\) 28vw, 140px"/);
 assert.match(html,/<img src="https:\/\/example.com\/x.jpg">/);
 const bytes=new Uint8Array(24);bytes.set([82,73,70,70],0);bytes.set([87,69,66,80],8);
 const env={ASSETS:{fetch:async req=>{assert.match(req.url,/kelingking-240\.webp$/);return new Response(bytes,{headers:{"content-type":"image/webp"}})}}};
 assert.equal((await readResponsivePhoto(new Request("https://example.com/photos/kelingking?npew=240"),env,"kelingking")).headers.get("content-type"),"image/webp");
 assert.equal(await readResponsivePhoto(new Request("https://example.com/photos/kelingking?npew=999"),env,"kelingking"),null);
});

test("public eyebrow text meets WCAG AA contrast on the audited light backgrounds",async()=>{
 const {readFileSync}=await import("node:fs");
 const css=readFileSync("public/styles.css","utf8");
 const color=css.match(/\.eyebrow\{[^}]*color:(#[0-9a-f]{6})/i)?.[1];
 const luminance=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
 assert.ok(color);
 for(const background of ["#f3f7fa","#e7f3f5","#ffffff"])assert.ok((luminance(background)+.05)/(luminance(color)+.05)>=4.5,background);
 assert.match(css,/\.premiumHero \.eyebrow\{color:#fff1cb/);
});
test("Cloudflare beacon CSP permission is confined to public documents",async()=>{
 const {default:worker}=await import("../src/worker.mjs");
 const policy="default-src 'self'; script-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; style-src 'self'; frame-ancestors 'none'";
 const env={ASSETS:{fetch:async()=>new Response("<html><head></head><body></body></html>",{headers:{"content-security-policy":policy,"content-type":"text/html"}})}};
 for(const path of ["/","/privacy.html"]){
  const r=await worker.fetch(new Request("https://nusapenidaexperiences.com"+path),env,{});
  assert.equal(r.status,200);
  const csp=r.headers.get("content-security-policy");
  assert.match(csp,/script-src [^;]*https:\/\/static\.cloudflareinsights\.com/);
  assert.match(csp,/connect-src [^;]*https:\/\/cloudflareinsights\.com/);
  assert.doesNotMatch(csp,/'unsafe-inline'|'unsafe-eval'/);
  assert.match(csp,/frame-ancestors 'none'/);
 }
 const dashboard=await worker.fetch(new Request("https://nusapenidaexperiences.com/dashboard.html"),env,{});
 assert.equal(dashboard.headers.get("content-security-policy"),policy);
});
test("competitive guides reuse existing canonical routes, localised links and truthful buying guidance",async()=>{
 const {renderCompetitiveGuide}=await import("../src/website-cms.mjs");
 const {readFileSync}=await import("node:fs");
 for(const key of ["snorkeling","west","east","island"]){
  const path={snorkeling:"snorkeling",west:"west-tour",east:"east-tour",island:"island-tour"}[key];
  const id=renderLegacyTourPage(readFileSync("public/"+path+".html","utf8"),legacyTourRoute("/"+path+".html"),"https://example.com");
  const en=renderEnglishTourPage(key,"https://example.com");
  for(const html of [id,en]){
   assert.equal(html.split('data-npe-competitive-guide="'+key+'"').length,2);
   assert.equal((html.match(/<link rel="canonical"/g)||[]).length,1);
   assert.doesNotMatch(html,/data-npe-competitive-guide="unknown"|aggregateRating/);
  }
  assert.doesNotMatch(id,/data-npe-lang="en"/);
  assert.match(en,/href="\/en\/tours\//);
 }
 assert.equal(renderCompetitiveGuide("constructor"),"");
 assert.equal(renderCompetitiveGuide("unknown"),"");
 assert.match(renderCompetitiveGuide("boat-ticket","en"),/one-way or return fare/);
 assert.match(renderCompetitiveGuide("nusa-lembongan-island-tour","id"),/Mangrove Point di darat/);
 assert.match(renderCompetitiveGuide("snorkeling","en"),/Manta sightings are not guaranteed/);
 assert.doesNotMatch(renderLegacyTourPage(readFileSync("public/index.html","utf8"),legacyTourRoute("/"),"https://example.com"),/data-npe-competitive-guide=/);
});

test("real SQLite media usage query obeys D1 compound SELECT limit and preserves all references",async()=>{
 const {DatabaseSync}=await import("node:sqlite");
 const {readFileSync}=await import("node:fs");
 const {listWebsiteMedia}=await import("../src/website-cms.mjs");
 const sqlite=new DatabaseSync(":memory:");
 sqlite.exec(readFileSync("database/migrations/0023_website_cms.sql","utf8"));
 sqlite.exec(readFileSync("database/migrations/0024_website_gallery_slots.sql","utf8"));
 sqlite.exec(readFileSync("database/migrations/0026_seo_articles.sql","utf8"));
 const id="12345678-1234-4234-9234-123456789abc",free="87654321-4321-4321-9321-cba987654321";
 const add=sqlite.prepare("INSERT INTO website_media(id,title,alt_id,alt_en,digest,bytes) VALUES(?,?,?,?,?,?)");
 add.run(id,"Busy","ID","EN","busy",10000);add.run(free,"Free","ID","EN","free",10000);
 sqlite.prepare("INSERT INTO website_photo_slots(slot,media_id,alt_id,alt_en) VALUES(?,?,?,?)").run("hero",id,"ID","EN");
 sqlite.prepare("INSERT INTO website_gallery_photo_slots(slot,media_id,alt_id,alt_en) VALUES(?,?,?,?)").run("west-kelingking",id,"ID","EN");
 const snapshot=JSON.stringify({media_id:id});
 sqlite.prepare("INSERT INTO website_activities(id,slug,draft_json,published_json) VALUES(?,?,?,?)").run("a","a",snapshot,snapshot);
 sqlite.prepare("INSERT INTO seo_articles(id,slug,draft_json,published_json,draft_media_id,published_media_id) VALUES(?,?,?,?,?,?)").run("b","b",snapshot,snapshot,id,id);
 const db={prepare(sql){assert.ok(sql.split(/UNION ALL/i).length<=5);const st=sqlite.prepare(sql);return {all:async()=>({results:st.all()})}}};
 try{const {items}=await listWebsiteMedia(db);assert.equal(items.find(x=>x.id===id).usage_count,6);assert.equal(items.find(x=>x.id===free).usage_count,0);}finally{sqlite.close();}
});
test("CMS independently retains live slots when other requests fail",async()=>{
 const {readFileSync}=await import("node:fs");
 const source=readFileSync("public/app.js","utf8");
 const loader=source.slice(source.indexOf("async function loadWebsiteCMS()"),source.indexOf('$("#cmsAddActivity").onclick'));
 assert.match(loader,/Promise\.allSettled/);
 assert.match(loader,/if\(slots.status==="fulfilled"/);
 assert.match(loader,/if\(media.status==="fulfilled"/);
 assert.match(source,/function cmsCurrentPhoto\(slot\)\{\s*if\(!cmsSlotsLoaded\)return null/);
});

test("owner can publish a bilingual ordered cover list, including fast boat and an empty list",async()=>{
 const {validateSiteEdit,validateHeroHighlights}=await import("../src/site-content.mjs");
 const {readFileSync}=await import("node:fs");
 const base=readFileSync("public/index.html","utf8"),page=legacyTourRoute("/");
 const rows=[{icon:"boat",id:"Tiket Fast Boat",en:"Fast Boat Tickets"},{icon:"tour",id:"Wisata pulau",en:"Island Tour"}];
 const value=JSON.stringify(rows);
 assert.deepEqual(validateHeroHighlights(value),rows);
 assert.equal(validateSiteEdit({key:"hero.highlights",locale:"id",value,expected_version:0,owner_confirmed:true}).value,value);
 assert.throws(()=>validateSiteEdit({key:"hero.highlights",locale:"en",value,expected_version:0,owner_confirmed:true}));
 assert.throws(()=>validateHeroHighlights(JSON.stringify([{icon:"boat",id:"<script>",en:"Boat"}])));
 assert.throws(()=>validateHeroHighlights(JSON.stringify(Array(9).fill(rows[0]))));
 const rendered=renderLegacyTourPage(base,page,"https://example.com",{"hero.highlights":value});
 assert.match(rendered,/data-hero-label-en="Fast Boat Tickets"/);
 assert.match(rendered,/heroCustomLayout/);
 assert.ok(rendered.indexOf("Tiket Fast Boat")<rendered.indexOf("Wisata pulau"));
 assert.match(renderLegacyTourPage(base,page,"https://example.com",{"hero.highlights":"[]"}),/heroHighlightsCustom" hidden/);
 assert.match(renderLegacyTourPage(base,page,"https://example.com"),/data-copy="hero.highlight4"/);
});


test("published destination pages link to their actual parent tour in each language",()=>{
 const origin="https://example.com",parent={...draft,slug:"lembongan",parent_activity:"",title_id:"Wisata Lembongan",title_en:"Lembongan Tour",photo_url:"/photos/website/123"};
 const child={...parent,slug:"dream-beach",parent_activity:"activity:lembongan",title_id:"Dream Beach",title_en:"Dream Beach"};
 for(const lang of ["en","id"]){
  const html=renderExperiencePage(child,lang,origin,[parent,child]);
  assert.ok(html.includes('data-npe-parent-tour href="/'+lang+'/experiences/lembongan"'));
  assert.doesNotMatch(renderExperiencePage(child,lang,origin,[child]),/data-npe-parent-tour/);
  const staticChild={...child,slug:"mangrove",parent_activity:"static:snorkeling"};
  assert.ok(renderExperiencePage(staticChild,lang,origin,[staticChild]).includes('data-npe-parent-tour href="'+(lang==="en"?"/en/tours/snorkeling":"/snorkeling.html")+'"'));
 }
});

test("published experience cover selects WebP variants from initial HTML and retains JPEG fallback",()=>{
 const photo="/photos/website/"+draft.media_id;
 for(const lang of ["id","en"]){
  const html=renderExperiencePage({...draft,photo_url:photo},lang,"https://example.com");
  const cover=html.match(/<img[^>]+fetchpriority="high"[^>]*>/)?.[0];
  assert.ok(cover);
  assert.ok(cover.includes('src="'+photo+'"'));
  for(const width of [240,480,800,1200])assert.ok(cover.includes(photo+"?npew="+width+" "+width+"w"));
  assert.match(cover,/sizes="\(max-width: 700px\) calc\(100vw - 32px\)/);
  assert.match(cover,/loading="eager"/);
  assert.match(cover,/width="1200" height="675"/);
 }
 const missing=renderExperiencePage({...draft,photo_url:"/photos/website/invalid"},"en","https://example.com");
 assert.doesNotMatch(missing,/srcset=/);
});

test("sales copy includes owner-confirmed land durations and conditional three-spot snorkeling",async()=>{
 const {readFileSync}=await import("node:fs");
 for(const key of ["west","east","island","snorkeling"]){
  const html=renderEnglishTourPage(key,"https://example.com");
  assert.match(html,key==="snorkeling"?/2–3 hours/:/4–5 hour/);
  const id=readFileSync("public/"+(key==="snorkeling"?key:key+"-tour")+".html","utf8");
  assert.match(id,key==="snorkeling"?/2–3 jam/:/4–5 jam/);
  if(key==="snorkeling"){assert.match(html,/Mangrove Point/);assert.match(html,/wild animals; sightings are not guaranteed/);assert.match(id,/satwa liar; penampakannya tidak dijamin/);}
 }
});

test("English tours expose published destination and root links in initial HTML",()=>{
 const items=[{slug:"snorkeling-mangrove-point",parent_activity:"static:snorkeling",title_en:"Mangrove Point <test>"},{slug:"nusa-lembongan-island-tour",parent_activity:"",title_en:"Lembongan Tour"},{slug:"boat-ticket",parent_activity:"",title_en:"Boat Tickets"},{slug:"unrelated-west",parent_activity:"static:west",title_en:"West destination"}];
 const html=renderEnglishTourPage("snorkeling","https://example.com",{},items);
 assert.match(html,/href="\/en\/experiences\/snorkeling-mangrove-point"/);
 assert.match(html,/Mangrove Point &lt;test&gt;/);
 assert.doesNotMatch(html,/href="\/en\/experiences\/unrelated-west"/);
 for(const slug of ["boat-ticket","nusa-lembongan-island-tour"])assert.ok(html.includes('href="/en/experiences/'+slug+'"'));
 assert.doesNotMatch(renderEnglishTourPage("snorkeling","https://example.com"),/href="\/en\/experiences\/boat-ticket"/);
});
test("published guides are linked back only from matching sales pages in each language",async()=>{
 const {readFileSync}=await import("node:fs");
 const article={slug:"guide-lembongan",published_at:"2026-11-26",title_en:"Lembongan guide",title_id:"Panduan Lembongan",links:["lembongan","west"]};
 const root={...draft,photo_url:"/photos/website/"+draft.media_id};
 for(const lang of ["en","id"])assert.ok(renderExperiencePage(root,lang,"https://example.com",[],[article]).includes('href="/'+lang+'/articles/guide-lembongan"'));
 assert.match(renderEnglishTourPage("west","https://example.com",{},[],[article]),/href="\/en\/articles\/guide-lembongan"/);
 assert.doesNotMatch(renderEnglishTourPage("east","https://example.com",{},[],[article]),/guide-lembongan/);
 const html=renderLegacyTourPage(readFileSync("public/west-tour.html","utf8"),legacyTourRoute("/west-tour.html"),"https://example.com",{},[],"",[],[article]);
 assert.match(html,/href="\/id\/articles\/guide-lembongan"/);
});

test("trust copy matches manual enquiry flow and preserves draft cancellation policy",async()=>{
 const {readFileSync}=await import("node:fs");
 const read=p=>readFileSync("public/"+p,"utf8");
 const privacy=read("privacy.html"),terms=read("terms.html"),home=read("index.html"),guest=read("guest.js");
 assert.doesNotMatch(privacy,/formulir penerimaan guest dinonaktifkan/);
 assert.match(privacy,/bukan formulir pemesanan website/);
 assert.match(privacy,/Rincian periode retensi/);
 assert.match(terms,/tidak ada konfirmasi booking atau pembayaran otomatis/);
 assert.match(terms,/bukan ketentuan final yang otomatis berlaku/);
 assert.match(read("cancellation.html"),/DRAF · BELUM DISETUJUI/);
 for(const service of ["Nusa Lembongan Island Tour","Fast Boat Tickets"])assert.ok(home.includes('data-whatsapp-package="'+service+'"'));
 assert.doesNotMatch(home,/id="leadForm"/);
 assert.match(home,/id="reviewForm"/);
 assert.match(guest,/\[r\.business_name,r\.business_contact\]/);
});

test("public prices use Rp and full rupiah without changing approved numbers or reviving blank prices",async()=>{
 const {formatRupiah,normalizePublicPriceLabel}=await import("../src/site-content.mjs");
 const {activityPublicPrice}=await import("../src/website-cms.mjs");
 const {readFileSync}=await import("node:fs");
 assert.equal(normalizePublicPriceLabel("350.000 / orang","id"),"Rp350.000/orang");
 assert.equal(normalizePublicPriceLabel("450.000 / orang","en",{fallback:true}),"Rp450.000/person");
 assert.equal(normalizePublicPriceLabel("From IDR 250/person","en"),"From Rp250/person");
 assert.equal(normalizePublicPriceLabel("","en",{fallback:true}),"");
 assert.equal(normalizePublicPriceLabel("Ask for quote","id",{fallback:true}),"");
 assert.equal(formatRupiah(450,"PERSON",true,"id"),"Mulai Rp450/orang");
 assert.equal(formatRupiah(250000,"TICKET",false,"en"),"Rp250.000/ticket");
 assert.equal(activityPublicPrice({price_verified:false,price_amount:350000,price_unit:"PERSON"},"id"),"");
 const a={...draft,slug:"new-priced-detail",photo_url:"/photos/website/example",price_verified:true,price_amount:450000,price_unit:"PERSON",price_from:true};
 for(const lang of ["id","en"]){
  const html=renderExperiencePage(a,lang,"https://example.com");
  assert.match(html,/<div class="npe-price-cover"><img[^>]*><span class="price-preview">(?:Mulai|From) Rp450\.000\/(?:orang|person)<\/span><\/div>/);
  assert.doesNotMatch(html,/<p><strong>(?:Mulai|From) Rp450/);
  assert.doesNotMatch(renderExperiencePage({...a,price_verified:false},lang,"https://example.com"),/class="price-preview"/);
 }
 const client=readFileSync("public/website-content.js","utf8");
 assert.match(client,/appendPublicPrice\(art,activity,lang\)/);
 assert.match(client,/appendPublicPrice\(figure,a,lang\)/);
 assert.match(client,/appendPublicPrice\(cover,a,lang\)/);
});

test("SEO audit: localized home, current price table and unknown price",async()=>{
 const {readFileSync}=await import("node:fs"),base=readFileSync("public/index.html","utf8");
 const html=renderLegacyTourPage(base,legacyTourRoute("/"),"https://example.com",{"price.west":"450.000 / orang","price.east":"","price.snorkeling":"350.000 / orang"});
 assert.match(html,/Paket Wisata Nusa Penida/);assert.doesNotMatch(html,/data-npe-lang="en"/);
 assert.match(html,/npePriceCompare/);assert.match(html,/Rp450\.000\/orang/);assert.match(html,/Tanya harga/);
 assert.match(html,/hreflang="en"/);assert.doesNotMatch(html,/Integrasi Google Ads API \/ Keyword Planner direncanakan/);
 const en=renderEnglishTourPage("","https://example.com",{"price.west":"Rp450.000/person"});
 assert.match(en,/Nusa Penida Tours &amp; Snorkeling/);assert.match(en,/Rp450\.000\/person/);assert.match(en,/Compare tours and starting prices/);
});
