import test from "node:test";import assert from "node:assert/strict";
import {leadScore,salesDraft,normalizeMarketComparison} from "../src/sales.mjs";
const lead={name:"Made",contact:"628123456",consent:1,guests:4,activity_id:"ISLAND_TOUR_CAR",requested_date:"2026-10-20",message:"I need a private tour with pickup from Sanur.",status:"NEW"};
test("qualified detailed guest is hot",()=>assert.equal(leadScore(lead,"2026-10-16").stage,"HOT"));
test("anonymous lead without date stays cold",()=>assert.equal(leadScore({consent:0,guests:0},"2026-10-16").stage,"COLD"));
test("template never invents final prices",()=>{const text=salesDraft(lead);assert.match(text,/ketersediaan/);assert.doesNotMatch(text,/Rp[0-9]/);});
test("market per person scales to actual guest count",()=>assert.equal(normalizeMarketComparison({price:300000,unit:"person"},4),1200000));
test("group price only comparable at same group size",()=>assert.equal(normalizeMarketComparison({price:750000,unit:"group",group_size:2},4),null));
