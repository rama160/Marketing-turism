import test from "node:test";
import assert from "node:assert/strict";
import {buildRankReview} from "../src/seo-rank-agent.mjs";
const a="/en/experiences/nusa-lembongan-island-tour-devil-s-tear",b="/en/experiences/nusa-lembongan-island-tour-dream-beach",c="/en/experiences/boat-ticket",d="/id/experiences/boat-ticket";
const row=(query,path,position,impressions,language_hint=null)=>({query,path,position,impressions,clicks:0,language_hint});
const report=rows=>({range:{start:"2026-11-01",end:"2026-11-28"},sections:{pairs:{status:"MEASURED",rows}}});
const plan=(keyword,target_path,locale="en")=>({keyword,normalized:keyword,target_path,locale,intent:"PLAN",active:1});
test("fresh one impression is an early opportunity, wrong island and language do not become wins",()=>{
 const r=buildRankReview({paths:[a,b,c,d],plans:[plan("devil's tears nusa lembongan",a),plan("gili to nusa lembongan",c)],freshReport:report([row("devil's tears nusa lembongan",a,11,1),row("dream beach nusa penida",b,5,1),row("gili to nusa lembongan",d,41,2,"en")])});
 assert.equal(r.quick_wins,0);assert.equal(r.top10,0);assert.equal(r.pairs.find(x=>x.path===a).action,"EARLY_QUICK_WIN");assert.equal(r.pairs.find(x=>x.path===b).action,"CHECK_CANONICAL_INTENT");assert.equal(r.pairs.find(x=>x.path===d).expected_path,c);assert.equal(r.pages.find(x=>x.path===c).action,"NO_DATA");
});
test("final stable Top 10 protected and losses compared only with final evidence",()=>{
 const plans=[plan("devil's tears nusa lembongan",a),plan("dream beach nusa lembongan",b),plan("gili to nusa lembongan",c)];
 const r=buildRankReview({paths:[a,b,c],plans,finalReport:report([row(plans[0].keyword,a,12,40),row(plans[1].keyword,b,6,30),row(plans[2].keyword,c,18,32)]),freshReport:report([row(plans[0].keyword,a,2,1)]),previousRows:[row(plans[0].keyword,a,8,45)]});
 assert.equal(r.recover,1);assert.equal(r.top10,1);assert.equal(r.quick_wins,1);assert.equal(r.pairs.find(x=>x.path===a).position,12);
});
test("missing data and archived URLs are never treated as zero or falling rank",()=>{
 const r=buildRankReview({paths:[a],finalReport:report([row("unrelated",b,5,100)]),previousRows:[row("devil's tears nusa lembongan",a,7,40)]});
 assert.equal(r.coverage,1);assert.equal(r.pairs[0].action,"PRIOR_TOP10_NO_DATA");assert.equal(r.pairs[0].position,null);assert.equal(r.pairs[0].impressions,null);
});
