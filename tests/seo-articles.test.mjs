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

test("article lifecycle keeps live snapshot isolated and prevents referenced cover deletion",async()=>{
 const {DatabaseSync}=await import("node:sqlite");
 const {readFileSync}=await import("node:fs");
 const {saveArticle,articleAction,publishedArticles}=await import("../src/seo-articles.mjs");
 const sqlite=new DatabaseSync(":memory:");
 sqlite.exec("PRAGMA foreign_keys=ON;CREATE TABLE website_media(id TEXT PRIMARY KEY)");
 sqlite.exec(readFileSync("database/migrations/0026_seo_articles.sql","utf8"));
 sqlite.prepare("INSERT INTO website_media(id) VALUES(?)").run(draft.media_id);
 const db={prepare(sql){const stmt=sqlite.prepare(sql);const wrap=args=>({first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:stmt.run(...args).changes}})});return {...wrap([]),bind:(...args)=>wrap(args)}}};
 try{
  const row=await saveArticle(db,draft);
  assert.equal((await publishedArticles(db)).length,0);
  assert.throws(()=>sqlite.prepare("DELETE FROM website_media WHERE id=?").run(draft.media_id));
  await assert.rejects(()=>articleAction(db,row.id,{expected_version:1},"publish"));
  await articleAction(db,row.id,{expected_version:1,owner_confirmed:true},"publish");
  assert.equal((await publishedArticles(db))[0].title_en,draft.title_en);
  const edited=await saveArticle(db,{...draft,title_en:"Changed travel guide",expected_version:2},row.id);
  assert.equal(edited.slug,row.slug);
  assert.equal((await publishedArticles(db))[0].title_en,draft.title_en);
  await assert.rejects(()=>articleAction(db,row.id,{expected_version:3,owner_confirmed:true},"delete"));
  await articleAction(db,row.id,{expected_version:3,owner_confirmed:true},"unpublish");
  assert.equal((await publishedArticles(db)).length,0);
  await articleAction(db,row.id,{expected_version:4,owner_confirmed:true},"delete");
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM seo_articles").get().n,0);
 }finally{sqlite.close();}
});
test("homepage CMS contains separately editable hero and all twelve thumbnail labels",async()=>{
 const {readFileSync}=await import("node:fs");
 const {CONTENT_FIELDS}=await import("../src/site-content.mjs");
 const html=readFileSync("public/index.html","utf8"),app=readFileSync("public/app.js","utf8");
 const keys=[...html.matchAll(/data-copy="(homeThumb\.[^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(keys).size,12);
 for(const k of [...keys,"hero.highlight1","hero.whatsapp","regions.west.cta"]){assert.ok(CONTENT_FIELDS.some(([key])=>key===k));assert.ok(app.includes('"'+k+'"'));}
});
