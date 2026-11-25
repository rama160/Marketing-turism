import test from "node:test";
import assert from "node:assert/strict";
import {moveTo,orderedKeys,groupItems,validateOrder,readOrder} from "../public/content-order.mjs";
import {validateSiteEdit} from "../src/site-content.mjs";
import {readFileSync} from "node:fs";
test("move directly to any position, preserving intervening items",()=>{
 assert.deepEqual(moveTo(["a","b","c","d","e"],4,1),["a","e","b","c","d"]);
 assert.deepEqual(moveTo(["a","b","c","d"],0,3),["b","c","d","a"]);
});
test("layout keeps existing and newly published items, optional additions are explicit",()=>{
 const id="12345678-1234-4234-9234-123456789abc",key="activity:"+id;
 const list=groupItems("regions",[{id,media_id:id,title_id:"Boat"}]);
 assert.equal(list.find(x=>x.key===key).optional,true);
 const cfg=validateOrder("regions",{order:[key,"east"],hidden:["west"]});
 assert.deepEqual(orderedKeys(list.map(x=>x.key),cfg),[key,"east","west","snorkeling"]);
 assert.throws(()=>validateOrder("regions",{order:["bad"],hidden:[]}));
 assert.throws(()=>validateOrder("regions",{order:["east","east"],hidden:[]}));
 assert.deepEqual(readOrder({},"regions"),{order:[],hidden:[]});
 assert.equal(validateSiteEdit({key:"layout.order.regions",locale:"id",value:JSON.stringify(cfg),expected_version:0,owner_confirmed:true}).key,"layout.order.regions");
});
test("dashboard records real navigation and guest pages never replace history",()=>{
 const app=readFileSync("public/app.js","utf8"),guest=readFileSync("public/guest.js","utf8"),web=readFileSync("public/website-content.js","utf8");
 assert.match(app,/addEventListener\("popstate"/);
 assert.match(app,/"replaceState":"pushState"/);
 assert.match(app,/data-hero-position/);
 assert.match(app,/moveTo\(visible/);
 assert.doesNotMatch(guest,/location\.replace\("\/dashboard\.html"\)/);
 assert.match(web,/history\.back\(\)/);
 assert.match(web,/applyPublicLayout/);
});

test("article positions are independent of activity layout and cannot unpublish via ordering",()=>{
 const key="article:12345678-1234-4234-9234-123456789abc";
 assert.deepEqual(validateOrder("articles",{order:[key],hidden:[]}).order,[key]);
 assert.throws(()=>validateOrder("articles",{order:[key],hidden:[key]}));
 assert.throws(()=>validateOrder("regions",{order:[key],hidden:[]}));
});
