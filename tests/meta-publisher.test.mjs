import test from "node:test";
import assert from "node:assert/strict";
import {metaPublicationConfig,metaConnectionStatus,checkMetaReadAccess,publishMetaTourism,postGraph} from "../src/meta-publisher.mjs";

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

test("production Cloudflare Meta names are recognized, while publication stays OFF without opt-in",()=>{
 const production={META_PAGE_ID:"1375913638943340",META_IG_USER_ID:"17841473759990847",
  META_PAGE_ACCESS_TOKEN:"fake-page-token-never-production-1234",
  META_APP_SECRET:"fake-app-secret-never-production",META_APP_ACCESS_TOKEN:"fake-app-access-token"};
 const day="2026-10-21";
 const closed=metaConnectionStatus(production,day);
 assert.equal(closed.ids_valid,true);
 assert.equal(closed.tokens_present,true);
 assert.equal(closed.publishing_enabled,false);
 assert.equal(closed.graph_api_verified,false);
 assert.equal(metaPublicationConfig(production,day),null);
 assert.equal(JSON.stringify(closed).includes(production.META_PAGE_ACCESS_TOKEN),false);
 const optIn={...production,META_GRAPH_PUBLISH_ENABLED:"true",META_GRAPH_OWNER_APPROVED:"true",
  META_GRAPH_PUBLISH_START:"2026-10-21"};
 const configured=metaPublicationConfig(optIn,day);
 assert.equal(configured.pageId,production.META_PAGE_ID);
 assert.equal(configured.igId,production.META_IG_USER_ID);
 assert.equal(configured.pageToken,production.META_PAGE_ACCESS_TOKEN);
 assert.equal(configured.igToken,production.META_PAGE_ACCESS_TOKEN);
 assert.equal(metaPublicationConfig({...optIn,META_GRAPH_PUBLISH_START:"2026-02-30"},day),null);
 assert.equal(metaPublicationConfig({...optIn,META_GRAPH_PUBLISH_START:"2026-10-22"},day),null);
});
test("owner Meta read probes are GET-only and never reveal credentials or API response bodies",async()=>{
 const token="fake-page-token-only-for-test-123456789";
 const prod={META_PAGE_ID:"1375913638943340",META_IG_USER_ID:"17841473759990847",
  META_PAGE_ACCESS_TOKEN:token};
 const seen=[];
 const mock=async(url,options)=>{
  seen.push({url,method:options.method,authorization:options.headers.authorization});
  return new Response(JSON.stringify({id:prod.META_PAGE_ID,access_token:"THIS_MUST_NOT_ESCAPE"}),{status:seen.length===1?200:403});
 };
 const output=await checkMetaReadAccess(prod,mock);
 assert.deepEqual(output,{configured:true,page:{ok:true,status:200},instagram:{ok:false,status:403}});
 assert.equal(seen.length,2);
 assert.ok(seen.every(x=>x.method==="GET"&&x.authorization==="Bearer "+token));
 assert.ok(seen.every(x=>!x.url.includes(token)));
 assert.ok(!JSON.stringify(output).includes(token));
 assert.ok(!JSON.stringify(output).includes("THIS_MUST_NOT_ESCAPE"));
 const skipped=await checkMetaReadAccess({},()=>{throw Error("must not call");});
 assert.equal(skipped.configured,false);
});

test("Meta read identity rejects wrong ID and malformed success response",async()=>{
 const env={META_PAGE_ID:"1375913638943340",META_IG_USER_ID:"17841473759990847",
  META_PAGE_ACCESS_TOKEN:"fake-graph-read-token-for-tests-1234"};
 let i=0;
 const result=await checkMetaReadAccess(env,async()=>{
  i++;
  return new Response(i===1?JSON.stringify({id:"wrong-id"}):"not-json",
   {status:200,headers:{"content-type":"application/json"}});
 });
 assert.deepEqual(result,{configured:true,page:{ok:false,status:200},instagram:{ok:false,status:null}});
});
test("Meta read checks accept a separately provisioned Instagram token",async()=>{
 const env={META_PAGE_ID:"1375913638943340",META_IG_USER_ID:"17841473759990847",
  META_PAGE_ACCESS_TOKEN:"fake-graph-page-token-for-tests-1234",
  META_IG_ACCESS_TOKEN:"fake-graph-instagram-token-for-tests-1234"};
 const auth=[];
 const result=await checkMetaReadAccess(env,async(url,options)=>{
  auth.push(options.headers.authorization);
  return new Response(JSON.stringify({id:url.includes(env.META_PAGE_ID)?env.META_PAGE_ID:env.META_IG_USER_ID}),
   {status:200,headers:{"content-type":"application/json"}});
 });
 assert.ok(result.page.ok&&result.instagram.ok);
 assert.deepEqual(auth,["Bearer "+env.META_PAGE_ACCESS_TOKEN,"Bearer "+env.META_IG_ACCESS_TOKEN]);
});
