import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {validateKeyword,parseGscRows,ensureKeywordSeeds,saveKeyword,listKeywords,runKeywordResearch,keywordArticlePriorities,rankingOpportunities,bootstrapKeywordResearch,performanceRange,summarizePerformanceRows,collectKeywordPerformance,readKeywordPerformance,queryLanguage,plannerScope,parsePlannerRows,readKeywordPlanner,collectKeywordPlanner} from "../src/seo-keywords.mjs";
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
 sqlite.exec(readFileSync("database/migrations/0028_seo_keywords.sql","utf8"));sqlite.exec(readFileSync("database/migrations/0029_seo_performance.sql","utf8"));sqlite.exec(readFileSync("database/migrations/0030_seo_keyword_planner.sql","utf8"));
 const db={prepare(sql){const stmt=sqlite.prepare(sql);const wrap=args=>({first:async()=>stmt.get(...args),all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:stmt.run(...args).changes}})});return {...wrap([]),bind:(...args)=>wrap(args)}} ,async batch(stmts){for(const s of stmts)await s.run();}};
 try{
 await ensureKeywordSeeds(db);await ensureKeywordSeeds(db);let v=await listKeywords(db,{});assert.equal(v.plans.length,24);assert.equal(v.observations.length,0);assert.equal(v.gsc_configured,false);
 await saveKeyword(db,input);v=await listKeywords(db,{});const p=v.plans.find(x=>x.keyword===input.keyword);assert.ok(p);await saveKeyword(db,{...input,priority:3,expected_version:p.version},p.id);await assert.rejects(()=>saveKeyword(db,{...input,expected_version:p.version},p.id),/berubah/);
 sqlite.exec("INSERT INTO growth_discovery_runs VALUES('REDDIT_PUBLIC_RSS','FOUND',CURRENT_TIMESTAMP);INSERT INTO growth_opportunities VALUES('REDDIT_PUBLIC_RSS','Nusa Lembongan travel question',CURRENT_TIMESTAMP);");
 const r=await runKeywordResearch(db,{});assert.equal(r.gsc_status,"NOT_CONFIGURED");assert.equal(r.signal_status,"MEASURED");assert.equal((await runKeywordResearch(db,{}, {manual:true})).status,"RECENT");
 v=await listKeywords(db,{});assert.equal(v.latest.signals.counts.lembongan,1);assert.equal(v.observations.length,0);
 assert.ok((await keywordArticlePriorities(db))["lembongan-two-days"]);
 const seedRow=v.plans.find(x=>x.origin==="SEED");await saveKeyword(db,{...seedRow,keyword:"Renamed seed keyword",active:false,expected_version:seedRow.version},seedRow.id);v=await listKeywords(db,{});assert.equal(v.plans.length,25);assert.equal(v.plans.find(x=>x.id===seedRow.id).active,0);assert.ok(!v.plans.some(x=>x.keyword===seedRow.keyword));
 // Bootstrap uses the real existing D1 schema; malformed credentials fail safely.
 sqlite.exec("DELETE FROM seo_keyword_observations;DELETE FROM seo_keyword_runs;");
 const env={GSC_PROPERTY:"sc-domain:nusapenidaexperiences.com",GSC_SERVICE_ACCOUNT_JSON:"invalid-json"};
 const bad=await bootstrapKeywordResearch(db,env);assert.equal(bad.gsc_status,"ERROR");assert.equal(bad.gsc_error,"CONFIG");
 assert.equal((await listKeywords(db,env)).latest.signals.gsc_error,"CONFIG");
 assert.equal((await bootstrapKeywordResearch(db,env)).status,"SKIPPED");
 sqlite.exec("DELETE FROM seo_keyword_runs;");
 const pair=await crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
 const key=Buffer.from(await crypto.subtle.exportKey("pkcs8",pair.privateKey)).toString("base64");
 env.GSC_SERVICE_ACCOUNT_JSON=JSON.stringify({client_email:"unit@example.iam.gserviceaccount.com",private_key:"-----BEGIN PRIVATE KEY-----\n"+key+"\n-----END PRIVATE KEY-----"});
 const adsEnv={...env,GOOGLE_ADS_CUSTOMER_ID:"1234567890"};
 const blocked=await collectKeywordPlanner(db,adsEnv,{}, {request:()=>{throw Error("must not fetch")}});assert.equal(blocked.status,"APPROVAL_REQUIRED");
 assert.equal((await readKeywordPlanner(db,adsEnv)).configured,true);
 const plannerCalls=[];const result=await collectKeywordPlanner(db,{...adsEnv,GOOGLE_ADS_KEYWORD_RESEARCH_APPROVED:"true"},{market:"AU",locale:"en"},{manual:true,pause:async()=>{},request:async(url,opts)=>{plannerCalls.push(url);if(url.includes("oauth2.googleapis.com")){const payload=JSON.parse(Buffer.from(opts.body.get("assertion").split(".")[1],"base64url").toString());assert.equal(payload.scope,"https://www.googleapis.com/auth/adwords");return Response.json({access_token:"test"});}const b=JSON.parse(opts.body);assert.equal(b.language,"languageConstants/1000");assert.deepEqual(b.geoTargetConstants,["geoTargetConstants/2036"]);assert.equal(b.keywordPlanNetwork,"GOOGLE_SEARCH");const metric={avgMonthlySearches:"500",competition:"LOW",competitionIndex:"20",monthlySearchVolumes:[{year:"2026",month:"OCTOBER",monthlySearches:"400"}]};return Response.json({results:url.endsWith(":generateKeywordHistoricalMetrics")?[{text:b.keywords[0],keywordMetrics:metric}]:[{text:"nusa penida west island tour",keywordIdeaMetrics:metric}]});}});
 assert.equal(result.status,"DONE");assert.equal(plannerCalls.length,3);assert.equal(result.sections.historical.rows[0].avg_monthly_searches,500);assert.equal(result.sections.ideas.rows[0].monthly[0].searches,400);assert.equal((await readKeywordPlanner(db,{...adsEnv,GOOGLE_ADS_KEYWORD_RESEARCH_APPROVED:"true"},{market:"AU",locale:"en"})).status,"DONE");
 assert.equal((await collectKeywordPlanner(db,{...adsEnv,GOOGLE_ADS_KEYWORD_RESEARCH_APPROVED:"true"},{market:"AU",locale:"en"},{manual:true,request:()=>{throw Error("must not fetch")}})).cooldown,true);
 const calls=[];
 const success=await bootstrapKeywordResearch(db,env,{request:async(url,opts)=>{calls.push(url);if(url.includes("oauth2.googleapis.com"))return Response.json({access_token:"unit-test-token"});assert.equal(opts.headers.authorization,"Bearer unit-test-token");return Response.json({rows:[{keys:["nusa penida west tour","https://nusapenidaexperiences.com/en/tours/west"],clicks:1,impressions:10,position:12}]});}});
 assert.equal(success.gsc_status,"MEASURED");assert.equal(success.rows,1);assert.equal(calls.length,2);
 assert.equal((await listKeywords(db,env)).observations.length,1);assert.equal((await bootstrapKeywordResearch(db,env)).status,"SKIPPED");
 const now=Date.parse("2026-11-26T08:30:00Z"),reportCalls=[];
 const fresh=await collectKeywordPerformance(db,env,{preset:"24h"},{now,request:async(url,opts)=>{if(url.includes("oauth2.googleapis.com"))return Response.json({access_token:"unit-test-token"});const b=JSON.parse(opts.body);reportCalls.push(b);assert.equal(b.dataState,"hourly_all");const keys=["2026-11-26T00:00:00-08:00",...b.dimensions.slice(1).map(k=>k==="query"?"nusa penida west island tour":"https://nusapenidaexperiences.com/west-tour.html")];return Response.json({rows:[{keys,clicks:0,impressions:1,position:64}]});}});
 assert.equal(fresh.status,"DONE");assert.equal(reportCalls.length,4);assert.equal(fresh.sections.total.rows[0].position,64);assert.equal(fresh.sections.pairs.rows[0].language_hint,"en");assert.equal(fresh.sections.pairs.rows[0].page_language,"id");assert.equal((await readKeywordPerformance(db,{preset:"24h"},now)).status,"DONE");assert.equal((await collectKeywordPerformance(db,env,{preset:"24h"},{now,request:()=>{throw Error("must not fetch")}})).cooldown,true);
 assert.equal((await listKeywords(db,env)).observations.length,1,"fresh must not change final observations");
 const partial=await collectKeywordPerformance(db,env,{preset:"7d",mode:"fresh"},{now,request:async(url,opts)=>{if(url.includes("oauth2.googleapis.com"))return Response.json({access_token:"unit"});return JSON.parse(opts.body).dimensions.includes("page")?new Response("",{status:403}):Response.json({rows:[]});}});assert.equal(partial.status,"PARTIAL");assert.equal(partial.sections.total.status,"NO_ROWS");assert.equal(partial.sections.pages.error,"ACCESS");
 }finally{sqlite.close();}
});

test("ranking opportunities use mapped measured nonbrand pairs and non-overlap comparison only",()=>{
 const plans=[{id:"quick",active:1,keyword:"west tour",normalized:"west tour",target_path:"/west",priority:2,intent:"BUY"},{id:"top",active:1,keyword:"east tour",normalized:"east tour",target_path:"/east",priority:1,intent:"BUY"},{id:"brand",active:1,keyword:"Nusa Penida Experiences",normalized:"nusa penida experiences",target_path:"/",priority:1,intent:"BUY"},{id:"wrong",active:1,keyword:"snorkel",normalized:"snorkel",target_path:"/snorkel",priority:1,intent:"BUY"}];
 const obs=[{normalized:"west tour",path:"/west",position:12.5,impressions:100,clicks:4},{normalized:"east tour",path:"/east",position:2.8,impressions:80,clicks:10},{normalized:"nusa penida experiences",path:"/",position:1,impressions:100,clicks:90},{normalized:"snorkel",path:"/other",position:2,impressions:20,clicks:5}];
 const r=rankingOpportunities(plans,obs,[{...obs[0],position:15.5,clicks:2}]);
 assert.equal(r.measured,2);assert.equal(r.top3,1);assert.equal(r.top10,1);assert.equal(r.quickWins,1);assert.equal(r.pairs[0].id,"quick");assert.equal(r.pairs[0].delta.position,3);assert.equal(r.pairs[1].delta,null);
 assert.equal(rankingOpportunities(plans,[]).measured,0);
});

test("GSC period and independent hourly aggregation preserve scope and weighted position",()=>{
 const now=Date.parse("2026-11-26T08:30:00Z"),range=performanceRange({preset:"24h"},now);
 assert.equal(range.start,"2026-11-25");assert.equal(range.end,"2026-11-26");
 assert.equal(performanceRange({preset:"28d",mode:"final"},now).start,"2026-10-27");
 assert.throws(()=>performanceRange({preset:"custom",start:"2026-01-01",end:"2026-11-26"},now),/Custom/);
 assert.equal(queryLanguage("nusa penida west island tour"),"en");assert.equal(queryLanguage("tour nusa penida barat"),"id");assert.equal(queryLanguage("nusa penida"),null);
 const data={rows:[{keys:["2026-11-25T23:00:00-08:00"],clicks:0,impressions:1,position:64},{keys:["2026-11-26T00:00:00-08:00"],clicks:1,impressions:3,position:4},{keys:["2026-11-24T00:00:00-08:00"],clicks:0,impressions:99,position:1}]};
 const result=summarizePerformanceRows(data,"total",range,[]);
 assert.equal(result.rows[0].impressions,4);assert.equal(result.rows[0].position,19);assert.equal(result.rows[0].ctr,.25);assert.equal(result.outside,1);
 assert.equal(summarizePerformanceRows({rows:[]},"total",range,[]).status,"NO_ROWS");
});

test("planner missing data stays null, close variants remain grouped, manual ranges need evidence",()=>{
 assert.throws(()=>plannerScope({market:"invalid"}),/Pasar/);
 const result=parsePlannerRows({results:[{text:"nusa penida west tour",closeVariants:["west nusa penida tour"],keywordMetrics:{monthlySearchVolumes:[{year:"2026",month:"OCTOBER"}]}},{text:"unrelated keyword",keywordMetrics:{avgMonthlySearches:"900"}}]},"historical",["west nusa penida tour"]);
 assert.equal(result.rows.length,1);assert.equal(result.rows[0].avg_monthly_searches,null);assert.equal(result.rows[0].monthly[0].searches,null);assert.equal(result.status,"METRICS_UNAVAILABLE");
 assert.throws(()=>validateKeyword({...input,manual:{volume_min:10,volume_max:100}},["/en/tours/west"]),/sumber/);
 assert.throws(()=>validateKeyword({...input,manual:{volume_min:100,volume_max:10}},["/en/tours/west"]),/rentang/);
 const m=validateKeyword({...input,manual:{volume_min:10,volume_max:100,source:"Google Keyword Planner export",period:"12 months",country:"Global",device:"All",checked:"2026-11-26"}},["/en/tours/west"]).manual;
 assert.equal(m.volume,null);assert.equal(m.volume_max,100);
});
