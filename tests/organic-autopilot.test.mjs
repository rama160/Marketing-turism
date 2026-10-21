import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {marketingIntelligence,validateMarketingObservation} from "../src/marketing-intelligence.mjs";
import {weeklyDrafts} from "../src/sales.mjs";

test("independent optimizer builds three licensed review-only posts without social credentials",()=>{
 const result=spawnSync(process.execPath,["scripts/organic-week.mjs"],{encoding:"utf8",env:{...process.env,CAMPAIGN_DAY:"2026-10-26"}});
 assert.equal(result.status,0,result.stderr);
 const d=JSON.parse(readFileSync("dist/organic-week.json","utf8"));
 assert.equal(d.week_start,"2026-10-26");
 assert.equal(d.posts.length,3);
 assert.equal(d.all_candidates.length,7);
 assert.equal(d.external_publishing,false);
 assert.equal(d.learning.observation_count,0);
 assert.equal(new Set(d.posts.map(x=>x.photo.slug)).size,3);
 assert.ok(d.posts.some(x=>x.activity_id==="ISLAND_TOUR_CAR"));
 assert.ok(d.posts.some(x=>x.activity_id==="SNORKELING_3_SPOTS"));
 for(const x of d.posts){
  assert.equal(x.status,"OWNER_REVIEW_REQUIRED");
  assert.equal(x.platform_publication,"NOT_ATTEMPTED");
  assert.equal(x.hour_basis,"EDITORIAL_FALLBACK");
  assert.match(x.photo.url,/^https:\/\/raw.githubusercontent.com\/rama160\/Marketing-turism\/main\/public\/photos\/[a-z-]+\.jpg$/);
  assert.match(x.photo.source,/^https:\/\/commons.wikimedia.org\//);
  assert.match(x.photo.license,/^CC BY-SA/);
  assert.doesNotMatch(x.caption,/^\[REVIEW/);
 }
});

test("marketing feedback really changes priority when a channel has strong evidence",()=>{
 const one={platform:"Facebook",activity_id:"SNORKELING_3_SPOTS",observed_on:"2026-10-20",
  published_hour:12,impressions:2000,reach:1500,reactions:200,comments:20,shares:20,saves:10,link_clicks:100,source:"OWNER_VERIFIED"};
 const observations=[validateMarketingObservation(one,"2026-10-21"),
  validateMarketingObservation({...one,observed_on:"2026-10-19"},"2026-10-21")];
 const plan=marketingIntelligence(observations,weeklyDrafts("2026-10-19"),"2026-10-21");
 assert.equal(plan.observation_count,2);
 assert.equal(plan.best_hours.Facebook.hour,12);
 const winning=plan.strategies.find(s=>s.platform==="Facebook"&&s.activity_id==="SNORKELING_3_SPOTS");
 const unevaluated=plan.strategies.find(s=>s.platform==="Instagram"&&s.activity_id==="SNORKELING_3_SPOTS");
 assert.ok(winning.score>unevaluated.score);
 assert.equal(unevaluated.basis,"BELUM_ADA_DATA");
});

test("no fake engagement: missing impressions cannot count likes",()=>{
 assert.throws(()=>validateMarketingObservation({
  platform:"Instagram",activity_id:"ISLAND_TOUR_CAR",observed_on:"2026-10-21",
  impressions:0,reactions:100,source:"OWNER_VERIFIED"
 },"2026-10-21"),/impressions/i);
});
