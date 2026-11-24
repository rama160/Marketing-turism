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
