import test from "node:test";
import assert from "node:assert/strict";
import {indexingInventory,indexVerdict,dueIndexing} from "../src/seo-indexing.mjs";
const base="https://nusapenidaexperiences.com";
test("inventory automatically includes canonical bilingual activity and article routes only",()=>{
 const paths=["/","/id/articles","/en/articles","/id/articles/new-story","/en/articles/new-story","/id/experiences/new-tour","/en/experiences/new-tour","/dashboard.html","/id/articles/new-story?preview=1"];
 const xml=paths.map(p=>"<loc>"+base+p+"</loc>").join("")+"<loc>https://other.test/id/articles/new-story</loc><loc>"+base+"/id/articles/new-story</loc>";
 const a=indexingInventory(xml);
 assert.equal(a.length,7);
 assert.equal(a.filter(x=>x.kind==="ARTICLE").length,2);
 assert.equal(a.filter(x=>x.kind==="ACTIVITY").length,2);
 assert.equal(a.filter(x=>x.language==="en").length,3);
});
test("index status is based on Google's verdict, not sitemap presence",()=>{
 const url=base+"/id/articles/new-story";
 assert.equal(indexVerdict({indexStatusResult:{verdict:"PASS",googleCanonical:url}},url).status,"INDEXED");
 assert.equal(indexVerdict({indexStatusResult:{verdict:"PASS",googleCanonical:base+"/"}},url).status,"ALTERNATE");
 assert.equal(indexVerdict({indexStatusResult:{verdict:"NEUTRAL"}},url).status,"NOT_INDEXED");
 assert.equal(indexVerdict({indexStatusResult:{verdict:"VERDICT_UNSPECIFIED"}},url).status,"UNKNOWN");
 assert.equal(indexVerdict({},url).status,"UNKNOWN");
 assert.equal(indexVerdict({indexStatusResult:{verdict:"PASS"},inspectionResultLink:"https://evil.test/"},url).inspect_link,null);
});
test("new pages first, bounded batches, previously indexed pages rechecked daily",()=>{
 const now=Date.parse("2026-11-28T08:00:00Z"),a=[{url:"old",status:"INDEXED",checked_at:"2026-11-27T07:00:00Z"},{url:"new",status:"UNCHECKED"},{url:"recent",status:"INDEXED",checked_at:"2026-11-28T07:00:00Z"},{url:"pending",status:"NOT_INDEXED",checked_at:"2026-11-28T00:00:00Z"}];
 assert.deepEqual(dueIndexing(a,now,2).map(x=>x.url),["new","old"]);
 assert.deepEqual(dueIndexing(a,now,8).map(x=>x.url),["new","old","pending"]);
});
