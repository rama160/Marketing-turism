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

test("related guide navigation is localized, bounded, escaped and excludes unpublished records",async()=>{
 const {renderRelatedArticleLinks}=await import("../src/seo-articles.mjs");
 const items=[{slug:"first",published_at:"2026-11-26",title_id:"Panduan <tag>",title_en:"Guide <tag>",links:["boat"]},{slug:"draft",title_id:"Draft",title_en:"Draft",links:["boat"]},{slug:"other",published_at:"2026-11-26",title_id:"Other",title_en:"Other",links:["west"]}];
 const html=renderRelatedArticleLinks(items,"boat","id");
 assert.match(html,/href="\/id\/articles\/first"/);assert.match(html,/Panduan &lt;tag&gt;/);
 assert.doesNotMatch(html,/\/draft|\/other|<tag>/);
 assert.match(renderRelatedArticleLinks(items,"boat","en"),/href="\/en\/articles\/first"/);
 assert.equal(renderRelatedArticleLinks(items,"east","en"),"");
});

test("legacy failed research can retry manually, diagnoses stages and locks after one successful draft",async()=>{
 const {DatabaseSync}=await import("node:sqlite");const {readFileSync}=await import("node:fs");const {generateResearchArticle,publishedArticles}=await import("../src/seo-articles.mjs");
 const sqlite=new DatabaseSync(":memory:");sqlite.exec("CREATE TABLE website_media(id TEXT PRIMARY KEY); CREATE TABLE website_activities(slug TEXT,status TEXT,published_json TEXT);CREATE TABLE growth_opportunities(headline TEXT,source TEXT,discovered_at TEXT);");
 sqlite.exec(readFileSync("database/migrations/0026_seo_articles.sql","utf8"));
 const db={prepare(sql){const stmt=sqlite.prepare(sql);const wrap=args=>({first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:stmt.run(...args).changes}})});return {...wrap([]),bind:(...args)=>wrap(args)}} ,async batch(stmts){sqlite.exec("BEGIN");try{for(const s of stmts)await s.run();sqlite.exec("COMMIT");}catch(e){sqlite.exec("ROLLBACK");throw e;}}};
 let calls=0,mode="invalid";
 const env={SEO_ARTICLE_DRAFTS_ENABLED:"true",AI:{run:async(model,config)=>{calls++;assert.equal(config.response_format.type,"json_object");return {response:mode==="invalid"?"not JSON":JSON.stringify({...draft,body_en:"Practical travel advice. ".repeat(40),body_id:"Saran perjalanan wisata. ".repeat(40)})}}}};
 const opts={now:Date.UTC(2026,10,26),request:async(url)=>{assert.equal(new URL(url).searchParams.get("exchars"),"1200");return {ok:true,json:async()=>({query:{pages:[{title:"Nusa Penida",extract:"Island background and factual geography for editorial research. ".repeat(3)}]}})};}};
 try{
  sqlite.prepare("INSERT INTO seo_research_runs(week,status,detail) VALUES(?,?,?)").run("2026-11-23","FAILED","Legacy error");
  assert.equal((await generateResearchArticle(db,env,opts)).status,"WEEK_LIMIT");
  assert.equal(calls,0);
  const failed=await generateResearchArticle(db,env,{...opts,manual:true});assert.equal(failed.status,"AI_FORMAT_ERROR");assert.match(failed.detail,/Percobaan 2\/3/);
  mode="valid";
  const result=await generateResearchArticle(db,env,{...opts,manual:true});assert.equal(result.status,"DRAFT_CREATED");assert.match(result.detail,/Percobaan 3\/3/);
  assert.equal((await generateResearchArticle(db,env,{...opts,manual:true})).status,"WEEK_LIMIT");assert.equal(calls,2);assert.equal((await publishedArticles(db)).length,0);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM seo_articles").get().n,1);
  sqlite.prepare("INSERT INTO seo_research_runs(week,status,detail) VALUES(?,?,?)").run("2026-11-30","SOURCE_UNAVAILABLE","Percobaan 3/3 · Test");
  assert.equal((await generateResearchArticle(db,env,{...opts,now:Date.UTC(2026,10,30),manual:true})).status,"WEEK_LIMIT");
  const recoveredSource=await generateResearchArticle(db,env,{...opts,now:Date.UTC(2026,11,7),request:async()=>({ok:true,json:async()=>({error:{code:"test"}})})});
  assert.equal(recoveredSource.status,"DRAFT_CREATED");assert.equal(calls,3);
  const saved=sqlite.prepare("SELECT draft_json FROM seo_articles WHERE id=?").get(recoveredSource.id);
  assert.equal(JSON.parse(saved.draft_json)._research.source_kind,"REVIEWED_REFERENCE");
  assert.equal((await publishedArticles(db)).length,0);
 }finally{sqlite.close();}
});

test("research sources fail over to REST, then reviewed tourism reference with honest provenance",async()=>{
 const {collectArticleSource}=await import("../src/seo-articles.mjs");
 const calls=[];
 const rest=await collectArticleSource("Nusa Lembongan",async url=>{
  calls.push(url);
  if(calls.length===1)throw Error("network unavailable");
  return {ok:true,json:async()=>({title:"Nusa Lembongan",extract:"Stable geography from a live response. ".repeat(4)})};
 });
 assert.equal(rest.kind,"WIKIMEDIA_REST");assert.equal(calls.length,2);assert.equal(rest.failures.length,1);
 const fallback=await collectArticleSource("Nusa Lembongan",async()=>{throw Error("network unavailable");});
 assert.equal(fallback.kind,"REVIEWED_REFERENCE");assert.equal(fallback.checked,"2026-11-26");assert.match(fallback.url,/www\.indonesia\.travel/);assert.equal(fallback.failures.length,2);
 assert.equal(await collectArticleSource("Unknown location",async()=>{throw Error("offline");}),null);
});

test("plain text repair preserves content and rejects insufficient or unsafe output",async()=>{
 const {articlePlainText}=await import("../src/seo-articles.mjs");
 const body="Rencanakan kunjungan sesuai kondisi dan konfirmasi pengaturan bersama operator. ".repeat(14);
 const result=articlePlainText("## Panduan dua hari\n\nRingkasan perjalanan yang membantu tamu merencanakan wisata.\n\n### Hari pertama\n\n"+body,"id");
 assert.equal(result.fields.title_id,"Panduan dua hari");
 assert.match(result.fields.body_id,/## Hari pertama/);
 assert.ok(result.fields.body_id.length>500);
 assert.ok(articlePlainText("Title\nSummary\nToo short","en").error);
 assert.ok(articlePlainText("Title\nA summary with enough detail for travelers.\n"+body+" https://example.com","en").error);
});
test("exhausted invalid draft gets one versioned recovery with single-language text repair",async()=>{
 const {DatabaseSync}=await import("node:sqlite");const {readFileSync}=await import("node:fs");const {generateResearchArticle,publishedArticles}=await import("../src/seo-articles.mjs");
 const sqlite=new DatabaseSync(":memory:");sqlite.exec("CREATE TABLE website_media(id TEXT PRIMARY KEY); CREATE TABLE website_activities(slug TEXT,status TEXT,published_json TEXT);CREATE TABLE growth_opportunities(headline TEXT,source TEXT,discovered_at TEXT);");
 sqlite.exec(readFileSync("database/migrations/0026_seo_articles.sql","utf8"));
 const db={prepare(sql){const stmt=sqlite.prepare(sql);const wrap=args=>({first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:stmt.run(...args).changes}})});return {...wrap([]),bind:(...args)=>wrap(args)}} ,async batch(stmts){sqlite.exec("BEGIN");try{for(const s of stmts)await s.run();sqlite.exec("COMMIT");}catch(e){sqlite.exec("ROLLBACK");throw e;}}};
 let calls=0;
 const long="Practical travel advice that confirms arrangements with the operator. ".repeat(15);
 const env={SEO_ARTICLE_DRAFTS_ENABLED:"true",AI:{run:async(model,config)=>{calls++;if(config.response_format)return {response:{...draft,body_id:"Terlalu pendek",body_en:long}};assert.match(config.messages[0].content,/Indonesian/);return {response:"## Panduan perjalanan\n\nRencanakan perjalanan sesuai kondisi dan konfirmasi pengaturan.\n\n## Rute\n"+"Pertimbangkan pilihan perjalanan yang sesuai dengan waktu dan kondisi. ".repeat(15)};}}};
 const opts={now:Date.UTC(2026,10,26),request:async()=>({ok:true,json:async()=>({query:{pages:[{title:"Nusa Penida",extract:"Stable island geography and coastal scenery. ".repeat(4)}]}})})};
 try{
  sqlite.prepare("INSERT INTO seo_research_runs(week,status,detail) VALUES(?,?,?)").run("2026-11-23","INVALID_DRAFT","Percobaan 3/3 · Isi draft bilingual tidak memenuhi validasi.");
  assert.equal((await generateResearchArticle(db,env,opts)).status,"WEEK_LIMIT");assert.equal(calls,0);
  const result=await generateResearchArticle(db,env,{...opts,manual:true});
  assert.equal(result.status,"DRAFT_CREATED");assert.equal(calls,2);assert.match(result.detail,/Pemulihan format v2/);
  const record=JSON.parse(sqlite.prepare("SELECT draft_json FROM seo_articles WHERE id=?").get(result.id).draft_json);
  assert.equal(record._research.format_repairs[0].language,"id");assert.equal(record._review,"DRAFT");assert.equal((await publishedArticles(db)).length,0);
  assert.equal((await generateResearchArticle(db,env,{...opts,manual:true})).status,"WEEK_LIMIT");
  sqlite.prepare("INSERT INTO seo_research_runs(week,status,detail) VALUES(?,?,?)").run("2026-11-30","INVALID_DRAFT","Percobaan 3/3 · Pemulihan format v2 · failed");
  assert.equal((await generateResearchArticle(db,env,{...opts,now:Date.UTC(2026,10,30),manual:true})).status,"WEEK_LIMIT");assert.equal(calls,2);
 }finally{sqlite.close();}
});
