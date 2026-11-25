import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {marketingIntelligence,validateMarketingObservation} from "../src/marketing-intelligence.mjs";
import {weeklyDrafts} from "../src/sales.mjs";

test("independent campaign generator and scheduled workflow were removed",()=>{
 assert.throws(()=>readFileSync("scripts/organic-week.mjs"),/ENOENT/);
 assert.throws(()=>readFileSync(".github/workflows/organic-marketing.yml"),/ENOENT/);
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
