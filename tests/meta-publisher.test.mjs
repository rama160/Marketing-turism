import test from "node:test";
import assert from "node:assert/strict";
import {metaPublicationConfig,publishMetaTourism,postGraph} from "../src/meta-publisher.mjs";

const env={META_GRAPH_PUBLISH_ENABLED:"true",META_GRAPH_OWNER_APPROVED:"true",
 META_GRAPH_PUBLISH_START:"2026-01-01",META_GRAPH_PAGE_ID:"1375913638943340",
 META_GRAPH_IG_USER_ID:"17841490000123456",
 META_GRAPH_PAGE_TOKEN:"test-only-token-at-least-twenty-four-characters"};

test("direct Meta path stays OFF without deliberate owner opt-in and correct credentials",()=>{
 assert.equal(metaPublicationConfig({},"2026-10-21"),null);
 assert.equal(metaPublicationConfig({...env,META_GRAPH_OWNER_APPROVED:"false"},"2026-10-21"),null);
 assert.equal(metaPublicationConfig({...env,META_GRAPH_PUBLISH_START:"2027-01-01"},"2026-10-21"),null);
 assert.equal(metaPublicationConfig({...env,META_GRAPH_IG_USER_ID:"bad-id"},"2026-10-21"),null);
 assert.ok(metaPublicationConfig(env,"2026-10-21"));
});
test("Graph adapter uses authorised Pages/Instagram photo APIs with original licence credit",async()=>{
 const calls=[],recorded=[];
 const request=async(url,options)=>{
  calls.push({url,method:options.method,auth:options.headers.authorization,body:options.body});
  return new Response(JSON.stringify({id:String(12345678901+calls.length)}),{status:200,headers:{"content-type":"application/json"}});
 };
 const published=await publishMetaTourism("2026-10-19",0,env,async(type,id)=>recorded.push({type,id}),request);
 assert.deepEqual(recorded.map(x=>x.type),["facebook","container","instagram"]);
 assert.equal(calls.length,3);
 assert.ok(calls[0].url.endsWith("/"+env.META_GRAPH_PAGE_ID+"/photos"));
 assert.ok(calls[1].url.endsWith("/"+env.META_GRAPH_IG_USER_ID+"/media"));
 assert.ok(calls[2].url.endsWith("/"+env.META_GRAPH_IG_USER_ID+"/media_publish"));
 assert.match(calls[0].body,/copyright|Photo%3A/);
 assert.ok(calls[1].body.includes("image_url="));
 assert.equal(calls[0].method,"POST");
 assert.equal(calls[0].auth,"Bearer "+env.META_GRAPH_PAGE_TOKEN);
 assert.ok(!calls[0].url.includes(env.META_GRAPH_PAGE_TOKEN));
 assert.equal(published.facebookId,recorded[0].id);
});
test("Meta failures never initiate more API requests after an error",async()=>{
 let count=0;const recorded=[];
 const request=async()=>{
  count++;
  return new Response(JSON.stringify(count===1?{id:"12345678901"}:{error:{message:"Authorization expired"}}),
    {status:count===1?200:403,headers:{"content-type":"application/json"}});
 };
 await assert.rejects(()=>publishMetaTourism("2026-10-19",1,env,async(type,id)=>recorded.push([type,id]),request),/rejected/);
 assert.equal(count,2);
 assert.equal(recorded.length,1);
});
test("Graph adapter rejects unapproved endpoints",async()=>{
 await assert.rejects(()=>postGraph("/me/accounts",{},"secret",()=>{throw Error("should not call");}),/Disallowed/);
});
