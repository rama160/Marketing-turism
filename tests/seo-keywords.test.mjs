import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {validateKeyword,parseGscRows,ensureKeywordSeeds,saveKeyword,listKeywords,runKeywordResearch,keywordArticlePriorities} from "../src/seo-keywords.mjs";
const input={keyword:"West Nusa Penida tour",locale:"en",cluster:"west",intent:"BUY",priority:1,target_path:"/en/tours/west"};
test("manual metrics require evidence and canonical localized target",()=>{
 assert.equal(validateKeyword(input,["/en/tours/west"]).manual.volume,null);
 assert.throws(()=>validateKeyword({...input,manual:{volume:300}},["/en/tours/west"]),/sumber/);
 assert.throws(()=>validateKeyword({...input,target_path:"/evil"},["/en/tours/west"]),/canonical/);
 assert.throws(()=>validateKeyword({...input,locale:"id"},["/en/tours/west"]),/Bahasa/);
 assert.equal(validateKeyword({...input,manual:{volume:0,source:"Keyword Planner",period:"12 months",country:"AU",device:"All",checked:"2026-11-26"}},["/en/tours/west"]).manual.volume,0);
});
test("GSC observations preserve actual query-page metrics and reject external/invalid rows",()=>{
 const paths=["/en/tours/west"],r={keys:["West Nusa Penida tour","https://nusapenidaexperiences.com/en/tours/west"],impressions:40,clicks:2,position:12.2};
 const rows=parseGscRows({rows:[r,r,{...r,keys:["test@example.com",r.keys[1]]},{...r,keys:[r.keys[0],"https://example.org/en/tours/west"]},{...r,impressions:0}]},paths);
 assert.equal(rows.length,1);assert.equal(rows[0].position,12.2);assert.equal(rows[0].impressions,40);
});
test("seed, owner version guard, automatic public signal snapshot and unconfigured GSC",async()=>{
 const sqlite=new DatabaseSync(":memory:");sqlite.exec("CREATE TABLE website_activities(slug TEXT,status TEXT,published_json TEXT);CREATE TABLE seo_articles(slug TEXT,published_json TEXT);CREATE TABLE growth_discovery_runs(source TEXT,result TEXT,created_at TEXT);CREATE TABLE growth_opportunities(source TEXT,headline TEXT,discovered_at TEXT);");
 sqlite.exec(readFileSync("database/migrations/0028_seo_keywords.sql","utf8"));
 const db={prepare(sql){const stmt=sqlite.prepare(sql);const wrap=args=>({first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:stmt.run(...args).changes}})});return {...wrap([]),bind:(...args)=>wrap(args)}} ,async batch(stmts){for(const s of stmts)await s.run();}};
 try{
 await ensureKeywordSeeds(db);await ensureKeywordSeeds(db);let v=await listKeywords(db,{});assert.equal(v.plans.length,24);assert.equal(v.observations.length,0);assert.equal(v.gsc_configured,false);
 await saveKeyword(db,input);v=await listKeywords(db,{});const p=v.plans.find(x=>x.keyword===input.keyword);assert.ok(p);await saveKeyword(db,{...input,priority:3,expected_version:p.version},p.id);await assert.rejects(()=>saveKeyword(db,{...input,expected_version:p.version},p.id),/berubah/);
 sqlite.exec("INSERT INTO growth_discovery_runs VALUES('REDDIT_PUBLIC_RSS','FOUND',CURRENT_TIMESTAMP);INSERT INTO growth_opportunities VALUES('REDDIT_PUBLIC_RSS','Nusa Lembongan travel question',CURRENT_TIMESTAMP);");
 const r=await runKeywordResearch(db,{});assert.equal(r.gsc_status,"NOT_CONFIGURED");assert.equal(r.signal_status,"MEASURED");assert.equal((await runKeywordResearch(db,{}, {manual:true})).status,"RECENT");
 v=await listKeywords(db,{});assert.equal(v.latest.signals.counts.lembongan,1);assert.equal(v.observations.length,0);
 assert.ok((await keywordArticlePriorities(db))["lembongan-two-days"]);
 }finally{sqlite.close();}
});
