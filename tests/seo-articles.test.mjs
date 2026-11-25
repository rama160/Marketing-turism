import test from "node:test";
import assert from "node:assert/strict";
import {validateArticle,renderArticlePage,articleSitemap} from "../src/seo-articles.mjs";
const draft={title_id:"Panduan Nusa Penida",title_en:"Nusa Penida travel guide",summary_id:"Ringkasan perjalanan wisata yang lengkap",summary_en:"A useful island travel summary",body_id:"## Rute\nIsi artikel cukup panjang untuk validasi.",body_en:"## Route\nA useful article with enough detail. <script>alert(1)</script>",links:["west","__proto__","https://evil.example"],media_id:"09380b3a-33a6-4429-adfd-703d2e213ab1"};
test("bilingual articles generate metadata, escape text and allow only known tour links",()=>{
 const a={...validateArticle(draft),slug:"guide",published_at:"2026-11-25 00:00:00"};
 assert.deepEqual(a.links,["west"]);
 const html=renderArticlePage([a],"en","https://example.com","guide");
 assert.match(html,/href="https:\/\/example.com\/id\/articles\/guide"/);
 assert.match(html,/href="\/en\/tours\/west"/);
 assert.match(html,/&lt;script&gt;alert/);
 assert.doesNotMatch(html,/<script>alert|evil\.example/);
 assert.match(html,/srcset=/);
 assert.match(html,/<h2>Route<\/h2>/);
 assert.equal(renderArticlePage([],"en","https://example.com","missing"),null);
 assert.match(articleSitemap([a],"https://example.com"),/\/id\/articles\/guide/);
 assert.throws(()=>validateArticle({...draft,body_en:""}));
});
