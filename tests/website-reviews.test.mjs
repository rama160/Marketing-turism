import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {validateReview,createReview,listReviews,moderateReview,dailyReviewKey} from "../src/website-reviews.mjs";
const sample={name:"Guest",body:"A thoughtful and enjoyable trip.",service:"WEST",rating:3,completed:true,consent:true};
test("reviews require consent, completed trip, bounded plain text and no contact details",()=>{
 assert.equal(validateReview(sample).rating,3);
 for(const patch of [{consent:false},{completed:false},{rating:0},{rating:6},{body:"<script>alert(1)</script>"},{body:"Contact me at guest@example.com"},{body:"See https://example.com for details"},{website:"spam"}])assert.throws(()=>validateReview({...sample,...patch}));
});
test("review publishes immediately, owner hide/show controls public output, rate limit is atomic",async()=>{
 const sqlite=new DatabaseSync(":memory:");
 sqlite.exec(readFileSync("database/migrations/0027_website_reviews.sql","utf8"));
 const db={prepare(sql){const stmt=sqlite.prepare(sql);return {bind(...args){return {all:async()=>({results:stmt.all(...args)}),run:async()=>({meta:{changes:Number(stmt.run(...args).changes)}})};}}}};
 try{
 const key=await dailyReviewKey("test-secret","192.0.2.1","2026-11-26");
 assert.notEqual(key,await dailyReviewKey("test-secret","192.0.2.1","2026-11-27"));
 const first=await createReview(db,sample,key);
 assert.equal(first.visible,true);
 let list=await listReviews(db);assert.equal(list.items.length,1);assert.equal(list.items[0].rating,3);assert.equal(list.items[0].rate_key,undefined);
 await assert.rejects(()=>moderateReview(db,first.id,{visible:false,expected_version:1}));
 await moderateReview(db,first.id,{visible:false,expected_version:1,owner_confirmed:true});
 assert.equal((await listReviews(db)).items.length,0);
 assert.equal((await listReviews(db,{owner:true})).items[0].visible,0);
 await assert.rejects(()=>moderateReview(db,first.id,{visible:true,expected_version:1,owner_confirmed:true}));
 await moderateReview(db,first.id,{visible:true,expected_version:2,owner_confirmed:true});
 assert.equal((await listReviews(db)).items.length,1);
 assert.ok(await createReview(db,{...sample,rating:1},key));assert.ok(await createReview(db,{...sample,rating:5},key));assert.equal(await createReview(db,sample,key),null);
 assert.equal((await listReviews(db)).items.length,3);
 }finally{sqlite.close();}
});
