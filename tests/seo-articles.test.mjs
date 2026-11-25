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
  await assert.rejects(()=>articleAction(db,row.id,{expected_version:1,owner_confirmed:true},"publish"),/Setujui/);
  await articleAction(db,row.id,{expected_version:1,owner_confirmed:true},"approve");
  assert.equal((await publishedArticles(db)).length,0);
  await articleAction(db,row.id,{expected_version:2,owner_confirmed:true},"publish");
  assert.equal((await publishedArticles(db))[0].title_en,draft.title_en);
  const edited=await saveArticle(db,{...draft,title_en:"Changed travel guide",expected_version:3},row.id);
  assert.equal(edited.slug,row.slug);
  assert.equal((await publishedArticles(db))[0].title_en,draft.title_en);
  await assert.rejects(()=>articleAction(db,row.id,{expected_version:4,owner_confirmed:true},"publish"),/Setujui/);
  await articleAction(db,row.id,{expected_version:4,owner_confirmed:true},"reject");
  assert.equal((await publishedArticles(db))[0].title_en,draft.title_en);
  await assert.rejects(()=>articleAction(db,row.id,{expected_version:5,owner_confirmed:true},"delete"));
  await articleAction(db,row.id,{expected_version:5,owner_confirmed:true},"unpublish");
  assert.equal((await publishedArticles(db)).length,0);
  await articleAction(db,row.id,{expected_version:6,owner_confirmed:true},"delete");
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM seo_articles").get().n,0);
  const second=await saveArticle(db,draft);
  await articleAction(db,second.id,{expected_version:1,owner_confirmed:true},"approve");
  await articleAction(db,second.id,{expected_version:2,owner_confirmed:true},"publish");
  await assert.rejects(()=>articleAction(db,second.id,{expected_version:3,owner_confirmed:true},"delete"));
  await assert.rejects(()=>articleAction(db,second.id,{expected_version:2,owner_confirmed:true,confirm_published_delete:true},"delete"));
  await articleAction(db,second.id,{expected_version:3,owner_confirmed:true,confirm_published_delete:true},"delete");
  assert.equal((await publishedArticles(db,second.slug)).length,0);
  assert.doesNotMatch(articleSitemap(await publishedArticles(db),"https://example.com"),new RegExp(second.slug));
  assert.equal(renderArticlePage(await publishedArticles(db),"id","https://example.com",second.slug),null);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM website_media").get().n,1);
 }finally{sqlite.close();}
});
test("homepage CMS contains separately editable hero and all twelve thumbnail labels",async()=>{
 const {readFileSync}=await import("node:fs");
 const {CONTENT_FIELDS}=await import("../src/site-content.mjs");
 const html=readFileSync("public/index.html","utf8"),app=readFileSync("public/app.js","utf8");
 const keys=[...html.matchAll(/data-copy="(homeThumb\.[^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(keys).size,12);
 for(const k of [...keys,"hero.whatsapp","regions.west.cta"]){assert.ok(CONTENT_FIELDS.some(([key])=>key===k));assert.ok(app.includes('"'+k+'"'));}
 assert.match(app,/cmsEffectiveValue\("hero\.highlight"\+\(i\+1\)/);
 assert.match(app,/cmsHeroListSave/);
 assert.ok(CONTENT_FIELDS.some(([key])=>key==="hero.highlight1"));
});

test("weekly independent research makes a private draft only, with real evidence and no duplicate run",async()=>{
 const {DatabaseSync}=await import("node:sqlite");const {readFileSync}=await import("node:fs");const {generateResearchArticle,publishedArticles,listArticles}=await import("../src/seo-articles.mjs");
 const sqlite=new DatabaseSync(":memory:");sqlite.exec("CREATE TABLE website_media(id TEXT PRIMARY KEY); CREATE TABLE website_activities(slug TEXT,status TEXT,published_json TEXT);CREATE TABLE growth_opportunities(headline TEXT,source TEXT,discovered_at TEXT);");
 sqlite.exec(readFileSync("database/migrations/0026_seo_articles.sql","utf8"));
 const db={prepare(sql){const stmt=sqlite.prepare(sql);const wrap=args=>({first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:stmt.run(...args).changes}})});return {...wrap([]),bind:(...args)=>wrap(args)}} ,async batch(stmts){for(const s of stmts)await s.run();}};
 let calls=0;const env={SEO_ARTICLE_DRAFTS_ENABLED:"true",AI:{run:async()=>{calls++;return {response:JSON.stringify({...draft,body_en:"Practical travel advice. ".repeat(40),body_id:"Saran perjalanan wisata. ".repeat(40)})}}}};
 const options={now:Date.UTC(2026,10,26),request:async()=>({ok:true,json:async()=>({query:{pages:[{title:"Nusa Penida",extract:"Island background and factual geography for editorial research. ".repeat(3)}]}})})};
 try{
  assert.equal((await generateResearchArticle(db,env,options)).status,"DRAFT_CREATED");
  assert.equal((await publishedArticles(db)).length,0);const items=(await listArticles(db)).items;
  assert.equal(items.length,1);assert.equal(items[0].review_state,"DRAFT");assert.ok(items[0].research.sources.length);assert.equal(items[0].draft.media_id,"");
  assert.equal((await generateResearchArticle(db,env,options)).status,"WEEK_LIMIT");assert.equal(calls,1);
 }finally{sqlite.close();}
});

test("article editor uses device file only and quality-prioritized browser compression",async()=>{
 const {readFileSync}=await import("node:fs");const vm=await import("node:vm");
 const html=readFileSync("public/dashboard.html","utf8"),app=readFileSync("public/app.js","utf8");
 assert.match(html,/<input type="hidden" name="media_id" id="seoMedia">/);
 assert.match(html,/id="seoCoverFile" type="file"/);
 assert.doesNotMatch(html,/<select name="media_id" id="seoMedia"/);
 assert.match(app,/confirm_published_delete:action==="delete"/);
 const from=app.indexOf("async function compressOwnerPhoto("),to=app.indexOf('$("#ownerPhotoForm").onsubmit',from);
 let closed=0,calls=[];
 const canvas={getContext:()=>({fillRect(){},drawImage(){}}),toBlob(cb,type,q){calls.push({width:this.width,height:this.height,q});cb({size:q>=0.86?350000:250000});}};
 const compress=vm.runInNewContext(app.slice(from,to)+"\ncompressOwnerPhoto",{createImageBitmap:async()=>({width:4000,height:3000,close(){closed++;}}),document:{createElement:()=>canvas},Promise,Math});
 const result=await compress({size:3000000},"article");
 assert.equal(result.size,250000);assert.deepEqual(calls.map(x=>x.q),[0.9,0.86,0.82]);assert.equal(calls[0].width,1600);assert.equal(calls[0].height,1200);assert.equal(closed,1);
});
