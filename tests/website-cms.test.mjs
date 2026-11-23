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
 assert.throws(()=>validateWebsiteDraft({...draft,price_label_en:"From IDR 1",price_label_id:"Mulai Rp1"}),/Harga publik/);
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
