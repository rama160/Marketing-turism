// Local Worker/D1 integration tests. No production data or credentials.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DatabaseSync} from "node:sqlite";
import worker from "../src/worker.mjs";
import {validCommonsCandidate,choosePhotoForReview,topicForCampaign} from "../src/photo-research.mjs";
import {extractPublicQuestions,extractOpenBusinesses,researchBuyerQuestions} from "../src/growth-engine.mjs";
import {extractBlueskyPosts,extractMetaPageComments,extractInstagramComments,extractYouTubeVideos,scanAdditionalNetworks} from "../src/growth-platforms.mjs";

function createD1() {
  const sqlite=new DatabaseSync(":memory:");
  for(const file of ["0001_init.sql","0002_operations.sql","0003_marketing.sql","0004_scheduling.sql","0005_public_readiness.sql","0006_brand_refund_policy.sql","0007_booking_modes.sql","0008_variants_and_supplier_net.sql","0009_site_content.sql","0010_whatsapp_inbox.sql","0011_marketing_learning.sql","0012_meta_autopilot.sql","0013_meta_diagnostics.sql","0014_campaign_reviews.sql","0015_approved_social_feedback.sql","0016_owner_photo_library.sql","0017_photo_research.sql","0018_growth_acquisition.sql","0019_growth_freshness.sql","0020_multichannel_growth.sql"])
    sqlite.exec(readFileSync(new URL("../database/migrations/"+file,import.meta.url),"utf8"));
  const db={
    prepare(sql){
      const bound={sql,args:[]};
      return {
        bind(...values){
          bound.args=values;
          return {
            first:async()=>sqlite.prepare(bound.sql).get(...bound.args)??null,
            all:async()=>({results:sqlite.prepare(bound.sql).all(...bound.args)}),
            run:async()=>{const result=sqlite.prepare(bound.sql).run(...bound.args);return {meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}};}
          };
        },
        first:async()=>sqlite.prepare(sql).get()??null,
        all:async()=>({results:sqlite.prepare(sql).all()}),
        run:async()=>{const result=sqlite.prepare(sql).run();return {meta:{changes:Number(result.changes)}};}
      };
    },
    async batch(statements){
      sqlite.exec("BEGIN");
      try{const results=[];for(const s of statements)results.push(await s.run());sqlite.exec("COMMIT");return results;}
      catch(e){sqlite.exec("ROLLBACK");throw e;}
    }
  };
  return {db,sqlite};
}
const TOKEN="local-testing-secret-never-used-in-production";
function fixture(){
 const {db,sqlite}=createD1();
 const env={DB:db,ADMIN_TOKEN:TOKEN,RATE_SALT:"test-salt",PUBLIC_LEADS_ENABLED:"false"};
 async function request(path,method="GET",body,authorized=true){
  const headers={};
  if(body!==undefined)headers["content-type"]="application/json";
  if(authorized)headers.authorization="Bearer "+TOKEN;
  const req=new Request("https://agent.invalid"+path,{method,headers,...(body===undefined?{}:{body:JSON.stringify(body)})});
  const res=await worker.fetch(req,env);
  const data=await res.json();
  return {httpStatus:res.status,...data};
 }
 return {request,db,sqlite,env};
}
function tomorrow(){const d=new Date();d.setUTCDate(d.getUTCDate()+4);return d.toISOString().slice(0,10);}
async function verifiedOperator(request,name){
 const r=await request("/api/admin/operators","POST",{name,contact:"62812345000"});
 assert.equal(r.httpStatus,201);
 const s=await request("/api/admin/operators/"+r.id+"/status","PATCH",{status:"VERIFIED"});
 assert.equal(s.httpStatus,200);return r.id;
}
async function rate(request,operator_id,item_id,net,unit="person",capacity=null){
 const r=await request("/api/admin/rates","POST",{operator_id,item_id,net,unit,capacity,verified:true});
 assert.equal(r.httpStatus,201);return r.id;
}
async function approvedQuote(request,b,selling_price){
 const q=await request("/api/admin/quotes","POST",{...b,selling_price});
 assert.equal(q.httpStatus,201,JSON.stringify(q));
 const a=await request("/api/admin/quotes/"+q.id+"/status","PATCH",{status:"OPERATOR_CONFIRMED"});
 assert.equal(a.httpStatus,200);
 const o=await request("/api/admin/quotes/"+q.id+"/status","PATCH",{status:"APPROVED"});
 assert.equal(o.httpStatus,200);
 return q.id;
}
test("all quote and booking components use verified historic partner prices, all steps guarded",async()=>{
 const {request,sqlite}=fixture();
 const tour=await verifiedOperator(request,"Verified Tour Operator");
 const lunch=await verifiedOperator(request,"Verified Lunch Provider");
 const boat=await verifiedOperator(request,"Verified Boat Provider");
 await rate(request,tour,"ISLAND_TOUR_CAR",600000,"car",6);
 await rate(request,lunch,"LUNCH",150000);
 await rate(request,boat,"BOAT_OUT",150000);
 const b={activity_id:"ISLAND_TOUR_CAR",operator_id:tour,guests:4,requested_date:tomorrow(),extras:{LUNCH:4,BOAT_OUT:4},extra_operators:{LUNCH:lunch,BOAT_OUT:boat},agency_costs:25000,payment_fee:5000};
 const preview=await request("/api/admin/quotes/preview","POST",b);
 assert.equal(preview.httpStatus,200,JSON.stringify(preview));
 assert.equal(preview.preview.net,1800000);
 assert.equal(preview.preview.minimum,1900000);
 const under=await request("/api/admin/quotes","POST",{...b,selling_price:1899999});
 assert.equal(under.httpStatus,422);
 const qid=await approvedQuote(request,b,1950000);
 // Supplier updates cannot rewrite previously approved prices.
 await rate(request,lunch,"LUNCH",200000);
 const booked=await request("/api/admin/bookings","POST",{quote_id:qid});
 assert.equal(booked.httpStatus,201,JSON.stringify(booked));
 assert.deepEqual(booked.operator_payables.map(x=>x.net_amount).sort((a,b)=>a-b),[600000,600000,600000]);
 assert.equal(sqlite.prepare("SELECT net FROM quotes WHERE id=?").get(qid).net,1800000);
 const forbidden=await request("/api/admin/bookings/"+booked.id+"/handover","POST",{operator_acknowledged:true});
 assert.equal(forbidden.httpStatus,400); // unpaid
 const paid=await request("/api/admin/bookings/"+booked.id+"/payment","POST",{owner_confirmed:true,reference:"BANK-DEPOSIT-123"});
 assert.equal(paid.httpStatus,200);
 const noManifest=await request("/api/admin/bookings/"+booked.id+"/handover","POST",{operator_acknowledged:true});
 assert.equal(noManifest.httpStatus,400);
 const manifest=await request("/api/admin/bookings/"+booked.id+"/manifest","POST",{guest_name:"Test Guest",guest_contact:"test@example.invalid",pickup:"Sanur",owner_confirmed:true});
 assert.equal(manifest.httpStatus,200);
 const handover=await request("/api/admin/bookings/"+booked.id+"/handover","POST",{operator_acknowledged:true});
 assert.equal(handover.httpStatus,200,JSON.stringify(handover));
 const finance=await request("/api/admin/finance");
 assert.equal(finance.payables.length,3);
 const settlement=await request("/api/admin/bookings/"+booked.id+"/payables/"+tour+"/pay","POST",{owner_confirmed:true,reference:"PAY-OP-11111"});
 assert.equal(settlement.httpStatus,200,JSON.stringify(settlement));
 const duplicate=await request("/api/admin/bookings/"+booked.id+"/payables/"+tour+"/pay","POST",{owner_confirmed:true,reference:"PAY-OP-11111"});
 assert.equal(duplicate.httpStatus,409);
 sqlite.close();
});
test("no unauthorized owner calls, no public leads without launch approval",async()=>{
 const {request,sqlite}=fixture();
 assert.equal((await request("/api/admin/operators","GET",undefined,false)).httpStatus,401);
 assert.equal((await request("/api/admin/finance","GET",undefined,false)).httpStatus,401);
 assert.equal((await request("/api/admin/analytics","GET",undefined,false)).httpStatus,401);
 assert.equal((await request("/api/public/leads","POST",{name:"Guest",consent:true},false)).httpStatus,503);
 assert.equal((await request("/api/health","GET",undefined,false )).version,JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8")).version);
 sqlite.close();
});
test("refund requires owner approval and actual external refund, no AI money movement",async()=>{
 const {request,sqlite}=fixture();
 const op=await verifiedOperator(request,"Snorkeling Verified");
 await rate(request,op,"SNORKELING_3_SPOTS",350000);
 const qid=await approvedQuote(request,{operator_id:op,activity_id:"SNORKELING_3_SPOTS",guests:1,requested_date:tomorrow()},480000);
 const booking=(await request("/api/admin/bookings","POST",{quote_id:qid})).id;
 assert.equal((await request("/api/admin/bookings/"+booking+"/payment","POST",{owner_confirmed:true,reference:"REAL-DEPOSIT-123"})).httpStatus,200);
 const nope=await request("/api/admin/bookings/"+booking+"/changes","POST",{change_type:"CANCEL",reason:"Guest changes mind"});
 assert.equal(nope.httpStatus,422);
 const change=await request("/api/admin/bookings/"+booking+"/changes","POST",{change_type:"REFUND",reason:"Weather cancelled activity",refund_amount:480000});
 assert.equal(change.httpStatus,201);
 assert.equal((await request("/api/admin/bookings/"+booking+"/changes/"+change.id,"PATCH",{status:"APPROVED"})).httpStatus,422);
 assert.equal((await request("/api/admin/bookings/"+booking+"/changes/"+change.id,"PATCH",{status:"APPROVED",owner_confirmed:true})).httpStatus,200);
 assert.equal((await request("/api/admin/bookings/"+booking+"/changes/"+change.id,"PATCH",{status:"EXECUTED",owner_confirmed:true})).httpStatus,422);
 assert.equal((await request("/api/admin/bookings/"+booking+"/changes/"+change.id,"PATCH",{status:"EXECUTED",owner_confirmed:true,external_reference:"BANK-REFUND-123"})).httpStatus,200);
 const b=sqlite.prepare("SELECT status,payment_status FROM bookings WHERE id=?").get(booking);
 assert.equal(b.status,"REFUNDED");assert.equal(b.payment_status,"REFUNDED");
 sqlite.close();
});
test("campaign status requires owner and external posting, marketplace is reference only",async()=>{
 const {request,sqlite}=fixture();
 const d=await request("/api/admin/campaigns","POST",{activity_id:"SNORKELING_3_SPOTS",platform:"Instagram",caption:"Ask for availability of snorkeling activities with local guides in Nusa Penida"});
 assert.equal(d.httpStatus,201);
 assert.equal((await request("/api/admin/campaigns/"+d.id+"/status","PATCH",{status:"PUBLISHED",owner_confirmed:true,public_url:"https://example.invalid/post"})).httpStatus,400);
 assert.equal((await request("/api/admin/campaigns/"+d.id+"/status","PATCH",{status:"APPROVED",owner_confirmed:true})).httpStatus,200);
 assert.equal((await request("/api/admin/campaigns/"+d.id+"/status","PATCH",{status:"PUBLISHED",owner_confirmed:true})).httpStatus,400);
 assert.equal((await request("/api/admin/campaigns/"+d.id+"/status","PATCH",{status:"PUBLISHED",owner_confirmed:true,public_url:"https://example.invalid/manual-post"})).httpStatus,200);
 const m=await request("/api/admin/market","POST",{platform:"Klook",activity_id:"SNORKELING_3_SPOTS",unit:"person",price:350000,observed_on:"2026-10-15",owner_confirmed:false});
 assert.equal(m.httpStatus,201,JSON.stringify(m));
 assert.equal((await request("/api/admin/market")).items[0].verified,0);
 sqlite.close();
});


test("reschedule can finish and handover after replacement date approval",async()=>{
 const {request,sqlite}=fixture(),operator=await verifiedOperator(request,"Verified Replacement Tour");
 await rate(request,operator,"ISLAND_TOUR_CAR",600000,"car",6);
 const qid=await approvedQuote(request,{operator_id:operator,activity_id:"ISLAND_TOUR_CAR",guests:2,requested_date:tomorrow()},740000);
 const booked=(await request("/api/admin/bookings","POST",{quote_id:qid})).id;
 const shifted=new Date();shifted.setUTCDate(shifted.getUTCDate()+9);
 const newDate=shifted.toISOString().slice(0,10);
 const change=await request("/api/admin/bookings/"+booked+"/changes","POST",{change_type:"RESCHEDULE",reason:"Guest needs different date",requested_date:newDate});
 assert.equal(change.httpStatus,201);
 // Owner may not mark payment while guest's requested date has not been resolved.
 assert.equal((await request("/api/admin/bookings/"+booked+"/payment","POST",{owner_confirmed:true,reference:"WAIT-RESCHEDULE-REF"})).httpStatus,409);
 const confirm=await request("/api/admin/bookings/"+booked+"/changes/"+change.id,"PATCH",{status:"APPROVED",operator_acknowledged:true});
 assert.equal(confirm.httpStatus,200,JSON.stringify(confirm));
 assert.equal(confirm.status,"EXECUTED");
 const list=await request("/api/admin/bookings");
 assert.equal(list.items.find(x=>x.id===booked).requested_date,newDate);
 assert.equal((await request("/api/admin/bookings/"+booked+"/payment","POST",{owner_confirmed:true,reference:"REAL-DEPOSIT-AFTER-SCHEDULE"})).httpStatus,200);
 assert.equal((await request("/api/admin/bookings/"+booked+"/manifest","POST",{guest_name:"Booking Guest",guest_contact:"test@example.invalid",owner_confirmed:true})).httpStatus,200);
 assert.equal((await request("/api/admin/bookings/"+booked+"/handover","POST",{operator_acknowledged:true})).httpStatus,200);
 sqlite.close();
});
test("invalid calendar dates are rejected, cannot create non-existent February date",async()=>{
 const {request,sqlite}=fixture();
 const lead=await request("/api/public/leads","POST",{name:"Guest Name",contact:"x@example.invalid",guests:2,requested_date:"2027-02-30",activity_id:"ISLAND_TOUR_CAR",consent:true},false);
 assert.equal(lead.httpStatus,503); // the public form still defaults off
 const op=await verifiedOperator(request,"Verified Island Supplier");
 await rate(request,op,"ISLAND_TOUR_CAR",600000,"car",6);
 const q=await request("/api/admin/quotes","POST",{operator_id:op,activity_id:"ISLAND_TOUR_CAR",guests:2,requested_date:"2027-02-30",selling_price:750000});
 assert.equal(q.httpStatus,400);
 sqlite.close();
});

test("marketing intelligence records only verified numeric metrics and learns transparent hour/platform ranking",async()=>{
 const {request,sqlite}=fixture();
 const noAuth=await request("/api/admin/marketing/intelligence","GET",undefined,false);
 assert.equal(noAuth.httpStatus,401);
 const cold=await request("/api/admin/marketing/intelligence");
 assert.equal(cold.httpStatus,200);
 assert.equal(cold.observation_count,0);
 assert.equal(cold.best_hours.Instagram.source,"INSUFFICIENT_DATA");
 assert.equal(cold.production.automatic_platform_publishing,false);
 assert.equal(cold.production.guest_leads,false);
 const today=new Date().toISOString().slice(0,10);
 const invalid=await request("/api/admin/marketing/observations","POST",
  {owner_verified:true,platform:"Facebook",activity_id:"ISLAND_TOUR_CAR",observed_on:today,impressions:-1});
 assert.equal(invalid.httpStatus,422);
 const noApproval=await request("/api/admin/marketing/observations","POST",
  {platform:"Instagram",activity_id:"SNORKELING_3_SPOTS",observed_on:today,impressions:1000});
 assert.equal(noApproval.httpStatus,403);
 const futureDate=new Date(Date.now()+86400000).toISOString().slice(0,10);
 const future=await request("/api/admin/marketing/observations","POST",{owner_verified:true,platform:"Instagram",activity_id:"SNORKELING_3_SPOTS",observed_on:futureDate,impressions:1000});
 assert.equal(future.httpStatus,422);
 for(let i=0;i<2;i++){
  const r=await request("/api/admin/marketing/observations","POST",{
   owner_verified:true,platform:"Instagram",activity_id:"SNORKELING_3_SPOTS",observed_on:today,
   published_hour:10,impressions:1500,reach:1100,reactions:150,comments:30,shares:20,saves:10,link_clicks:90,
   source:"UNTRUSTED",source_url:"https://example.org/post"
  });
  assert.equal(r.httpStatus,201);
  assert.equal(r.source,"OWNER_VERIFIED");
 }
 const intelligence=await request("/api/admin/marketing/intelligence");
 assert.equal(intelligence.observation_count,2);
 assert.equal(intelligence.best_hours.Instagram.hour,10);
 assert.equal(intelligence.best_hours.Instagram.source,"MEASURED");
 const winner=intelligence.strategies.find(s=>s.platform==="Instagram"&&s.activity_id==="SNORKELING_3_SPOTS");
 const untouched=intelligence.strategies.find(s=>s.platform==="Facebook"&&s.activity_id==="SNORKELING_3_SPOTS");
 assert.ok(winner.score>untouched.score);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_observations").get().n,2);
 const made=await request("/api/admin/marketing/prepare-week","POST",{owner_confirmed:true});
 assert.equal(made.httpStatus,200);
 assert.equal(made.observations_used,2);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_decisions").get().n,1);
 const decision=JSON.parse(sqlite.prepare("SELECT ranked_json FROM marketing_decisions").get().ranked_json);
 assert.ok(decision.some(x=>x.platform==="Instagram"&&x.recommended_hour===10));
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM campaign_drafts WHERE status='PUBLISHED'").get().n,0);
 sqlite.close();
});

test("weekly cron prepares seven multilingual channel-specific drafts once and never auto-publishes",async()=>{
 const {request,sqlite,env}=fixture();
 const unauth=await request("/api/admin/marketing/prepare-week","POST",{owner_confirmed:true},false);
 assert.equal(unauth.httpStatus,401);
 const denied=await request("/api/admin/marketing/prepare-week","POST",{owner_confirmed:false});
 assert.equal(denied.httpStatus,403);
 const made=await request("/api/admin/marketing/prepare-week","POST",{owner_confirmed:true});
 assert.equal(made.httpStatus,200);
 assert.equal(made.generated,7);
 assert.equal(made.status,"DRAFT_REVIEW");
 assert.equal(made.publication,"NONE");
 assert.equal(made.social_networks_connected,false);
 const drafts=sqlite.prepare("SELECT status,platform,caption FROM campaign_drafts").all();
 assert.equal(drafts.length,7);
 assert.ok(drafts.every(x=>x.status==="DRAFT"&&x.caption.startsWith("[REVIEW ")));
 assert.deepEqual([...new Set(drafts.map(x=>x.platform))].sort(),["Facebook","Instagram","TikTok"]);
 assert.ok(drafts.some(x=>x.caption.includes("· EN]"))&&drafts.some(x=>x.caption.includes("· ID]")));
 assert.ok(drafts.some(x=>x.caption.includes("Manta"))&&!drafts.some(x=>x.caption.includes("guaranteed manta")));
 const repeated=await request("/api/admin/marketing/prepare-week","POST",{owner_confirmed:true});
 assert.equal(repeated.generated,0);
 await worker.scheduled({cron:"0 1 * * 1"},env,{});
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM campaign_drafts").get().n,7);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM scheduled_runs").get().n,1);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM campaign_drafts WHERE status='PUBLISHED'").get().n,0);
 sqlite.close();
});


test("independent Meta cron is disabled until owner supplies specific publishing authorization",async()=>{
 const {request,sqlite,env}=fixture();
 const today=new Date().toISOString().slice(0,10);
 const made=await request("/api/admin/marketing/prepare-week","POST",{owner_confirmed:true});
 assert.equal(made.httpStatus,200);
 const monday=new Date(today+"T00:00:00Z");monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);
 const expected=today===monday.toISOString().slice(0,10)?3:0;
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_publications").get().n,expected);
 const previous=sqlite.prepare("SELECT status FROM marketing_publications").all();
 assert.ok(previous.every(p=>p.status==="READY"));
 await worker.scheduled({cron:"0 2 * * *"},env,{});
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_publications WHERE status='ATTEMPTED'").get().n,0);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_publications WHERE status='POSTED'").get().n,0);
 sqlite.close();
});

test("independent Meta cron marks an ambiguous partial publish for review and never repeats it",async()=>{
 const {db,sqlite,env}=fixture();
 const today=new Date().toISOString().slice(0,10);
 const monday=new Date(today+"T00:00:00Z");monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);
 sqlite.prepare("INSERT INTO marketing_publications(id,week_start,intended_date,idea_index,status) VALUES(?,?,?,?,?)")
  .run("partial-publish-test",monday.toISOString().slice(0,10),today,0,"READY");
 Object.assign(env,{META_GRAPH_PUBLISH_ENABLED:"true",META_GRAPH_OWNER_APPROVED:"true",META_GRAPH_PUBLISH_START:"2026-01-01",
  META_GRAPH_PAGE_ID:"1375913638943340",META_GRAPH_IG_USER_ID:"17841490000123456",
  META_GRAPH_PAGE_TOKEN:"local-testing-meta-token-contains-no-real-secrets"});
 let attempts=0;
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{
  // Daily read-only connectivity checks are separate from outbound post attempts.
  if(options.method==="GET")
   return new Response(JSON.stringify({id:url.includes(env.META_GRAPH_PAGE_ID)?env.META_GRAPH_PAGE_ID:env.META_GRAPH_IG_USER_ID}),{status:200});
  attempts++;
  return new Response(JSON.stringify(attempts===1?{id:"12345678901234"}:{error:{message:"Meta error"}}),{
   status:attempts===1?200:403,headers:{"content-type":"application/json"}});
 };
 try{
  await worker.scheduled({cron:"0 2 * * *"},env,{});
  assert.equal(attempts,2);
  const status=sqlite.prepare("SELECT status,facebook_post_id,instagram_post_id FROM marketing_publications WHERE id=?").get("partial-publish-test");
  assert.equal(status.status,"REVIEW_REQUIRED");
  assert.equal(status.facebook_post_id,"12345678901234");
  assert.equal(status.instagram_post_id,null);
  await worker.scheduled({cron:"0 2 * * *"},env,{});
  assert.equal(attempts,2,"never retry a partially completed post");
 }finally{globalThis.fetch=originalFetch;sqlite.close();}
});

test("public readiness is fail-closed and business profile edits require owner token",async()=>{
 const {request,sqlite}=fixture();
 const before=await request("/api/public/readiness","GET",undefined,false);
 assert.equal(before.httpStatus,200);
 assert.equal(before.accepting_leads,false);
 assert.equal((await request("/api/admin/business","GET",undefined,false)).httpStatus,401);
 assert.equal((await request("/api/admin/business","PATCH",{legal_name:"Unapproved Business",public_contact:"test@example.invalid"},false)).httpStatus,401);
 const saved=await request("/api/admin/business","PATCH",{legal_name:"Example Business",public_contact:"test@example.invalid",privacy_approved:true,refund_policy_approved:true});
 assert.equal(saved.httpStatus,200);
 const still=await request("/api/public/readiness","GET",undefined,false);
 assert.equal(still.accepting_leads,false); // OFF unless secret and explicit Cloudflare flag
 sqlite.close();
});
test("turnstile protection refuses missing token even if readiness is fully configured",async()=>{
 const {request,env,sqlite}=fixture();
 sqlite.prepare("UPDATE business_profile SET legal_name='Test Business',public_contact='test@example.invalid',privacy_approved=1,refund_policy_approved=1").run();
 env.PUBLIC_LEADS_ENABLED="true";env.TURNSTILE_SECRET="fixture-not-real-secret";
 const unverified=await request("/api/public/leads","POST",{name:"Legal Guest",contact:"guest@example.invalid",activity_id:"SNORKELING_3_SPOTS",guests:2,requested_date:tomorrow(),consent:true},false);
 assert.equal(unverified.httpStatus,403,JSON.stringify(unverified));
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM leads").get().n,0);
 sqlite.close();
});

test("Turnstile accepts only genuine matching host/action, and stores one consented lead",async()=>{
 const {request,env,sqlite}=fixture();
 sqlite.prepare("UPDATE business_profile SET legal_name='Test Tourism Company',public_contact='test@example.invalid',privacy_approved=1,refund_policy_approved=1").run();
 env.PUBLIC_LEADS_ENABLED="true";env.TURNSTILE_SECRET="not-a-real-secret";
 const body={name:"Guest For Test",contact:"guest@example.invalid",activity_id:"SNORKELING_3_SPOTS",guests:2,requested_date:tomorrow(),booking_mode:"SHARING",variant_id:"STANDARD_3_SPOTS",message:"Please confirm snorkeling safety",consent:true,"cf-turnstile-response":"a-reasonably-long-turnstile-token"};
 const oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response(JSON.stringify({success:true,hostname:"unrelated.example",action:"lead_enquiry"}),{status:200,headers:{"content-type":"application/json"}});
  assert.equal((await request("/api/public/leads","POST",body,false)).httpStatus,403);
  globalThis.fetch=async()=>new Response(JSON.stringify({success:true,hostname:"agent.invalid",action:"other_form"}),{status:200,headers:{"content-type":"application/json"}});
  assert.equal((await request("/api/public/leads","POST",body,false)).httpStatus,403);
  globalThis.fetch=async()=>new Response(JSON.stringify({success:true,hostname:"agent.invalid",action:"lead_enquiry"}),{status:200,headers:{"content-type":"application/json"}});
  const good=await request("/api/public/leads","POST",body,false);
  assert.equal(good.httpStatus,201,JSON.stringify(good));
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM leads").get().n,1);
 }finally{globalThis.fetch=oldFetch;sqlite.close();}
});


test("sharing island tour: verified cost-per-passenger contract, 1 guest allowed, no vacant-seat debt",async()=>{
 const {request,sqlite}=fixture(),op=await verifiedOperator(request,"Operator sharing guaranteed");
 const rate=await request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",unit:"person",net:185000,capacity:6,sharing_guaranteed:true,verified:true});
 assert.equal(rate.httpStatus,201,JSON.stringify(rate));
 const quote=await request("/api/admin/quotes/preview","POST",{operator_id:op,activity_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",guests:1,requested_date:tomorrow(),agency_costs:10000});
 assert.equal(quote.httpStatus,200,JSON.stringify(quote));
 assert.equal(quote.preview.net,185000);
 assert.equal(quote.preview.minimum,295000);
 assert.equal(quote.preview.minimumPerGuest,295000);
 const qid=await approvedQuote(request,{operator_id:op,activity_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",guests:1,requested_date:tomorrow(),agency_costs:10000},295000);
 const b=await request("/api/admin/bookings","POST",{quote_id:qid});
 assert.equal(b.httpStatus,201,JSON.stringify(b));
 assert.equal(b.operator_payables[0].net_amount,185000);
 assert.equal(sqlite.prepare("SELECT booking_mode FROM quotes WHERE id=?").get(qid).booking_mode,"SHARING");
 sqlite.close();
});
test("sharing rejects per-person rate without genuine operator no-empty-seat guarantee",async()=>{
 const {request,sqlite}=fixture(),op=await verifiedOperator(request,"Operator unguaranteed");
 const r=await request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",unit:"person",net:200000,capacity:6,sharing_guaranteed:false,verified:true});
 assert.notEqual(r.httpStatus,201);
 assert.equal((await request("/api/admin/quotes/preview","POST",{operator_id:op,activity_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",guests:1,requested_date:tomorrow()})).httpStatus,422);
 sqlite.close();
});
test("private island car quotes 1 guest full car without needing other guests",async()=>{
 const {request,sqlite}=fixture(),op=await verifiedOperator(request,"Operator private vehicle");
 const rr=await request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"PRIVATE",unit:"car",net:600000,capacity:7,verified:true});
 assert.equal(rr.httpStatus,201,JSON.stringify(rr));
 const p=await request("/api/admin/quotes/preview","POST",{operator_id:op,activity_id:"ISLAND_TOUR_CAR",booking_mode:"PRIVATE",guests:1,requested_date:tomorrow(),agency_costs:12000,payment_fee:8000});
 assert.equal(p.httpStatus,200,JSON.stringify(p));
 assert.equal(p.preview.net,600000);
 assert.equal(p.preview.minimum,720000);
 assert.equal(p.preview.minimumPerGuest,720000);
 sqlite.close();
});
test("private snorkeling requires actual exclusive group cost and includes it in supplier payable",async()=>{
 const {request,sqlite}=fixture(),op=await verifiedOperator(request,"Snorkeling boat exclusive");
 const missing=await request("/api/admin/rates","POST",{operator_id:op,item_id:"SNORKELING_3_SPOTS",booking_mode:"PRIVATE",unit:"person",net:350000,capacity:8,verified:true});
 assert.notEqual(missing.httpStatus,201);
 const rate=await request("/api/admin/rates","POST",{operator_id:op,item_id:"SNORKELING_3_SPOTS",booking_mode:"PRIVATE",unit:"person",net:350000,capacity:8,private_fixed_net:950000,verified:true});
 assert.equal(rate.httpStatus,201,JSON.stringify(rate));
 const p=await request("/api/admin/quotes/preview","POST",{operator_id:op,activity_id:"SNORKELING_3_SPOTS",booking_mode:"PRIVATE",guests:1,requested_date:tomorrow(),agency_costs:10000});
 assert.equal(p.httpStatus,200,JSON.stringify(p));
 assert.equal(p.preview.net,1300000);
 assert.equal(p.preview.minimum,1410000);
 const id=await approvedQuote(request,{operator_id:op,activity_id:"SNORKELING_3_SPOTS",booking_mode:"PRIVATE",guests:1,requested_date:tomorrow(),agency_costs:10000},1410000);
 const booking=await request("/api/admin/bookings","POST",{quote_id:id});
 assert.equal(booking.httpStatus,201,JSON.stringify(booking));
 assert.equal(booking.operator_payables[0].net_amount,1300000);
 sqlite.close();
});
test("shared and private operator tariff versioning cannot deactivate each other",async()=>{
 const {request,sqlite}=fixture(),op=await verifiedOperator(request,"Tour both modes");
 const a=await request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",unit:"person",net:180000,capacity:6,sharing_guaranteed:true,verified:true});
 const b=await request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"PRIVATE",unit:"car",net:600000,capacity:6,verified:true});
 assert.equal(a.httpStatus,201);assert.equal(b.httpStatus,201);
 const rows=sqlite.prepare("SELECT booking_mode,active FROM rates WHERE operator_id=? AND item_id='ISLAND_TOUR_CAR' AND booking_mode!='LEGACY'").all(op);
 assert.equal(rows.length,2);assert.ok(rows.every(x=>x.active===1));
 const c=await request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",unit:"person",net:210000,capacity:6,sharing_guaranteed:true,verified:true});
 assert.equal(c.httpStatus,201);
 assert.equal(sqlite.prepare("SELECT active FROM rates WHERE id=?").get(a.id).active,0);
 assert.equal(sqlite.prepare("SELECT active FROM rates WHERE id=?").get(b.id).active,1);
 sqlite.close();
});

test("vehicle rate never permits more than 7 passengers even if owner enters 30",async()=>{
 const {request,sqlite}=fixture(),op=await verifiedOperator(request,"Strict Safe Capacity Operator");
 const invalid=await request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"PRIVATE",unit:"car",net:600000,capacity:8,verified:true});
 assert.equal(invalid.httpStatus,400);
 const allowed=await request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"PRIVATE",unit:"car",net:600000,capacity:7,verified:true});
 assert.equal(allowed.httpStatus,201);
 sqlite.close();
});


test("initial owner rate references exist, remain unverified without partner",async()=>{
 const {request,sqlite}=fixture();
 const rows=sqlite.prepare("SELECT id,net,capacity,verified,variant_id,pricing_scheme FROM rates WHERE id LIKE 'INITIAL_%' ORDER BY id").all();
 assert.equal(rows.length,7);
 const map=Object.fromEntries(rows.map(x=>[x.id,x]));
 assert.equal(map.INITIAL_SNORK_SHARING_200.net,200000);assert.equal(map.INITIAL_SNORK_SHARING_200.capacity,20);
 assert.equal(map.INITIAL_SNORK_PRIVATE_MANTA_BAY.net,1500000);
 assert.equal(map.INITIAL_SNORK_PRIVATE_MANTA_POINT.net,2800000);
 assert.equal(map.INITIAL_TOUR_EAST_SHARING.net,600000);
 assert.ok(rows.every(x=>x.verified===0));
 const cat=await request("/api/public/catalog","GET",undefined,false);
 assert.deepEqual(cat.variants.ISLAND_TOUR_CAR.SHARING,["WEST","EAST"]);
 sqlite.close();
});
test("private Manta Bay and Point pricing is one full package regardless of guests",async()=>{
 const {request,sqlite}=fixture(),op=await verifiedOperator(request,"Verified Manta Boat Operator");
 for(const [variant,net] of [["MANTA_BAY",1500000],["MANTA_POINT",2800000]]){
  const rate=await request("/api/admin/rates","POST",{operator_id:op,item_id:"SNORKELING_3_SPOTS",booking_mode:"PRIVATE",variant_id:variant,pricing_scheme:"FIXED_PACKAGE",unit:"person",net,capacity:8,verified:true});
  assert.equal(rate.httpStatus,201,JSON.stringify(rate));
  const p=await request("/api/admin/quotes/preview","POST",{operator_id:op,activity_id:"SNORKELING_3_SPOTS",booking_mode:"PRIVATE",variant_id:variant,guests:3,requested_date:tomorrow(),agency_costs:20000});
  assert.equal(p.httpStatus,200,JSON.stringify(p));
  assert.equal(p.preview.net,net);
  assert.equal(p.preview.minimum,net+120000);
  assert.equal(p.preview.lines.length,1);
  assert.equal(p.preview.lines[0].qty,1);
 }
 sqlite.close();
});
test("shared tour east safely charges entire vehicle net for 1 guest, sharing does not assume 7",async()=>{
 const {request,sqlite}=fixture(),op=await verifiedOperator(request,"Verified East driver");
 const rate=await request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",variant_id:"EAST",pricing_scheme:"FIXED_VEHICLE",unit:"car",net:600000,capacity:7,verified:true});
 assert.equal(rate.httpStatus,201,JSON.stringify(rate));
 for(const [guests,minimum] of [[1,700000],[2,700000],[7,700000]]){
  const p=await request("/api/admin/quotes/preview","POST",{operator_id:op,activity_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",variant_id:"EAST",guests,requested_date:tomorrow()});
  assert.equal(p.httpStatus,200,JSON.stringify(p));
  assert.equal(p.preview.minimum,minimum);
  assert.equal(p.preview.minimumPerGuest,Math.ceil(minimum/guests));
 }
 const tooMany=await request("/api/admin/quotes/preview","POST",{operator_id:op,activity_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",variant_id:"EAST",guests:8,requested_date:tomorrow()});
 assert.equal(tooMany.httpStatus,422);
 sqlite.close();
});
test("west and east rates are independently versioned",async()=>{
 const {request,sqlite}=fixture(),op=await verifiedOperator(request,"Verified Island driver");
 const mk=v=>request("/api/admin/rates","POST",{operator_id:op,item_id:"ISLAND_TOUR_CAR",booking_mode:"PRIVATE",variant_id:v,pricing_scheme:"FIXED_VEHICLE",unit:"car",net:600000,capacity:7,verified:true});
 const west=await mk("WEST"),east=await mk("EAST");assert.equal(west.httpStatus,201);assert.equal(east.httpStatus,201);
 assert.equal((await mk("WEST")).httpStatus,201);
 assert.equal(sqlite.prepare("SELECT active FROM rates WHERE id=?").get(west.id).active,0);
 assert.equal(sqlite.prepare("SELECT active FROM rates WHERE id=?").get(east.id).active,1);
 sqlite.close();
});

test("site content CMS: public read, owner-only writes, versioned audit, and injection rejection",async()=>{
 const {request,sqlite}=fixture();
 const initial=await request("/api/public/site-content?lang=en","GET",undefined,false);
 assert.equal(initial.httpStatus,200);
 assert.deepEqual(initial.items,{});
 assert.equal((await request("/api/admin/site-content","GET",undefined,false)).httpStatus,401);
 assert.equal((await request("/api/admin/site-content","POST",{key:"hero.title",locale:"en",value:"Explore safely",expected_version:0,owner_confirmed:true},false)).httpStatus,401);
 assert.equal((await request("/api/admin/site-content","POST",{key:"hero.title",locale:"en",value:"<script>alert(1)</script>",expected_version:0,owner_confirmed:true})).httpStatus,400);
 assert.equal((await request("/api/admin/site-content","POST",{key:"tour.pricing",locale:"en",value:"Discount everything",expected_version:0,owner_confirmed:true})).httpStatus,400);
 assert.equal((await request("/api/admin/site-content","POST",{key:"hero.title",locale:"fr",value:"Bonjour",expected_version:0,owner_confirmed:true})).httpStatus,400);
 assert.equal((await request("/api/admin/site-content","POST",{key:"hero.title",locale:"en",value:"Explore safely",expected_version:0})).httpStatus,400);
 const first=await request("/api/admin/site-content","POST",{key:"hero.title",locale:"en",value:"Explore safely",expected_version:0,owner_confirmed:true});
 assert.equal(first.httpStatus,200,JSON.stringify(first));
 assert.equal(first.version,1);
 const publicEnglish=await request("/api/public/site-content?lang=en","GET",undefined,false);
 assert.equal(publicEnglish.items["hero.title"],"Explore safely");
 assert.deepEqual((await request("/api/public/site-content?lang=id","GET",undefined,false)).items,{});
 const stale=await request("/api/admin/site-content","POST",{key:"hero.title",locale:"en",value:"Stale update",expected_version:0,owner_confirmed:true});
 assert.equal(stale.httpStatus,409);
 const next=await request("/api/admin/site-content","POST",{key:"hero.title",locale:"en",value:"Discover Penida",expected_version:1,owner_confirmed:true});
 assert.equal(next.httpStatus,200);
 assert.equal(next.version,2);
 assert.equal((await request("/api/admin/site-content","GET")).items.length,1);
 assert.equal(sqlite.prepare("SELECT count(*) c FROM site_content_revisions").get().c,2);
 assert.equal(sqlite.prepare("SELECT count(*) c FROM audit_log WHERE entity='site_content'").get().c,2);
 sqlite.close();
});

test("public photo price labels are owner-editable but never permit anonymous edits",async()=>{
 const {request,sqlite}=fixture();
 const anonymous=await request("/api/admin/site-content","POST",{key:"price.snorkeling",locale:"id",value:"Sharing Rp350.000/orang",expected_version:0,owner_confirmed:true},false);
 assert.equal(anonymous.httpStatus,401);
 for(const [key,locale,value] of [
  ["price.snorkeling","id","Sharing Rp350.000/orang"],
  ["price.snorkeling","en","Sharing Rp350,000/person"],
  ["price.west","id","Mulai Rp800.000/mobil"],
  ["price.east","id","Mulai Rp800.000/mobil"],
  ["price.island","id","Mulai Rp800.000/mobil"]]){
  const saved=await request("/api/admin/site-content","POST",{key,locale,value,expected_version:0,owner_confirmed:true});
  assert.equal(saved.httpStatus,200,JSON.stringify(saved));
 }
 const id=await request("/api/public/site-content?lang=id","GET",undefined,false);
 const en=await request("/api/public/site-content?lang=en","GET",undefined,false);
 assert.equal(id.items["price.snorkeling"],"Sharing Rp350.000/orang");
 assert.equal(id.items["price.island"],"Mulai Rp800.000/mobil");
 assert.equal(en.items["price.snorkeling"],"Sharing Rp350,000/person");
 assert.equal(en.items["price.island"],undefined);
 const fields=await request("/api/admin/site-content");
 assert.ok(fields.fields.some(([key])=>key==="price.west"));
 const stale=await request("/api/admin/site-content","POST",{key:"price.snorkeling",locale:"id",value:"Rp10.000/orang",expected_version:0,owner_confirmed:true});
 assert.equal(stale.httpStatus,409);
 assert.equal(sqlite.prepare("SELECT count(*) c FROM site_content_revisions").get().c,5);
 sqlite.close();
});

test("WhatsApp Cloud API connection is disabled by default and inbox requires owner",async()=>{
 const {request,sqlite,env,db}=fixture();
 const info=await request("/api/admin/whatsapp");
 assert.equal(info.httpStatus,200);
 assert.equal(info.connection.webhook_ready,false);
 assert.equal(info.connection.sending_enabled,false);
 assert.deepEqual(info.threads,[]);
 assert.equal((await request("/api/admin/whatsapp","GET",undefined,false)).httpStatus,401);
 assert.equal((await request("/api/admin/whatsapp/thread?phone=628561752525","GET",undefined,false)).httpStatus,401);
 assert.equal((await request("/api/admin/whatsapp/send","POST",{phone:"628561752525",message:"Hi",owner_confirmed:true},false)).httpStatus,401);
 assert.equal((await request("/api/admin/whatsapp/send","POST",{phone:"628561752525",message:"Hi",owner_confirmed:true})).httpStatus,503);
 const noCfg=await worker.fetch(new Request("https://agent.invalid/api/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=123&hub.verify_token=foo"),env);
 assert.equal(noCfg.status,503);
 const noSig=await worker.fetch(new Request("https://agent.invalid/api/webhooks/whatsapp",{method:"POST",body:"{}"}),env);
 assert.equal(noSig.status,503);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM wa_inbox_messages").get().n,0);
 sqlite.close();
});
test("Meta GET webhook challenge needs only verify token, while signed POST remains disabled without App Secret",async()=>{
 const {sqlite,env}=fixture();
 env.WA_WEBHOOK_ENABLED="true";
 env.WA_VERIFY_TOKEN="a-long-distinct-test-only-verification-token";
 delete env.WA_APP_SECRET;
 delete env.WA_PHONE_NUMBER_ID;
 const base="https://agent.invalid/api/webhooks/whatsapp";
 const wrong=await worker.fetch(new Request(base+"?hub.mode=subscribe&hub.verify_token=incorrect&hub.challenge=98765"),env);
 assert.equal(wrong.status,403);
 const good=await worker.fetch(new Request(base+"?hub.mode=subscribe&hub.verify_token="+encodeURIComponent(env.WA_VERIFY_TOKEN)+"&hub.challenge=98765"),env);
 assert.equal(good.status,200);
 assert.equal(await good.text(),"98765");
 const incoming=await worker.fetch(new Request(base,{method:"POST",body:"{}"}),env);
 assert.equal(incoming.status,503,"inbound POST stays fail-closed without signing secret and verified phone ID");
 env.WA_VERIFY_TOKEN="short";
 const tooShort=await worker.fetch(new Request(base+"?hub.mode=subscribe&hub.verify_token=short&hub.challenge=99"),env);
 assert.equal(tooShort.status,503);
 assert.match(await tooShort.text(),/minimal 24 karakter/);
 sqlite.close();
});
test("WhatsApp Meta verification, HMAC signing, deduplication, review-only drafting and 24h restriction",async()=>{
 const {request,sqlite,env,db}=fixture();
 Object.assign(env,{
  WA_WEBHOOK_ENABLED:"true",
  WA_APP_SECRET:"unit-test-app-secret-very-long-only-local",
  WA_VERIFY_TOKEN:"unit-test-verify-secret-very-long-only-local",
  WA_PHONE_NUMBER_ID:"112233445566",
  WA_SEND_ENABLED:"false"
 });
 const callback="https://agent.invalid/api/webhooks/whatsapp";
 const bad=await worker.fetch(new Request(callback+"?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=123"),env);
 assert.equal(bad.status,403);
 const ok=await worker.fetch(new Request(callback+"?hub.mode=subscribe&hub.verify_token="+env.WA_VERIFY_TOKEN+"&hub.challenge=54321"),env);
 assert.equal(ok.status,200);assert.equal(await ok.text(),"54321");
 const now=Math.floor(Date.now()/1000);
 const payload=JSON.stringify({object:"whatsapp_business_account",entry:[{changes:[{field:"messages",value:{
  metadata:{phone_number_id:env.WA_PHONE_NUMBER_ID},
  contacts:[{wa_id:"6281212345678",profile:{name:"Test Guest"}}],
  messages:[{id:"wamid.unit.test.message.001",from:"6281212345678",timestamp:String(now),type:"text",text:{body:"Hello! How much for snorkeling next week?"}}]
 }}]}]});
 const unsigned=await worker.fetch(new Request(callback,{method:"POST",body:payload}),env);
 assert.equal(unsigned.status,403);
 const signedBad=await worker.fetch(new Request(callback,{method:"POST",headers:{"x-hub-signature-256":"sha256="+"a".repeat(64)},body:payload}),env);
 assert.equal(signedBad.status,403);
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(env.WA_APP_SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const sig=Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(payload)))).map(v=>v.toString(16).padStart(2,"0")).join("");
 async function sendWebhook(text){const res=await worker.fetch(new Request(callback,{method:"POST",headers:{"x-hub-signature-256":"sha256="+sig},body:text}),env);return {status:res.status,body:await res.json()};}
 const good=await sendWebhook(payload);
 assert.equal(good.status,200);assert.equal(good.body.stored,1);
 const retry=await sendWebhook(payload);
 assert.equal(retry.body.stored,0);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM wa_inbox_messages").get().n,1);
 assert.equal((await request("/api/admin/whatsapp")).threads[0].phone,"6281212345678");
 const messages=await request("/api/admin/whatsapp/thread?phone=6281212345678");
 assert.equal(messages.messages.length,1);
 assert.equal(messages.messages[0].body,"Hello! How much for snorkeling next week?");
 const draft=await request("/api/admin/whatsapp/draft","POST",{phone:"6281212345678",language:"en",use_ai:false});
 assert.equal(draft.httpStatus,200);assert.equal(draft.status,"DRAFT_REVIEW");assert.equal(draft.automatic_send,false);
 assert.match(draft.reply,/350,000/);
 assert.equal((await request("/api/admin/whatsapp/send","POST",{phone:"6281212345678",message:"Test message",owner_confirmed:true,client_nonce:crypto.randomUUID()})).httpStatus,503);
 env.WA_SEND_ENABLED="true";env.WA_ACCESS_TOKEN="unit-test-only-access-token-is-not-real-placeholder";
 sqlite.prepare("UPDATE wa_inbox_messages SET received_at=?").run(now-48*3600);
 const blocked=await request("/api/admin/whatsapp/send","POST",{phone:"6281212345678",message:"Test message",owner_confirmed:true,client_nonce:crypto.randomUUID()});
 assert.equal(blocked.httpStatus,409);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM wa_outbox_requests").get().n,0);
 sqlite.close();
});

test("Meta diagnostic endpoint is owner-only and does not mistake stored secrets for a live Graph connection",async()=>{
 const {request,env,sqlite}=fixture();
 Object.assign(env,{META_PAGE_ID:"1375913638943340",META_IG_USER_ID:"17841473759990847",
  META_PAGE_ACCESS_TOKEN:"test-only-meta-token-over-24-characters"});
 const denied=await request("/api/admin/marketing/meta/status","GET",undefined,false);
 assert.equal(denied.httpStatus,401);
 const status=await request("/api/admin/marketing/meta/status");
 assert.equal(status.httpStatus,200);
 assert.equal(status.ids_valid,true);
 assert.equal(status.tokens_present,true);
 assert.equal(status.publishing_enabled,false);
 assert.equal(status.graph_api_verified,false);
 assert.equal(JSON.stringify(status).includes(env.META_PAGE_ACCESS_TOKEN),false);
 const existing=await request("/api/admin/marketing/publications");
 assert.equal(existing.independent_meta_publishing_enabled,false);
 const intel=await request("/api/admin/marketing/intelligence");
 assert.equal(intel.production.meta_graph,"CREDENTIALS_PRESENT_NOT_VERIFIED");
 sqlite.close();
});

test("scheduled Meta diagnostics record real read status without exposing credentials",async()=>{
 const {request,sqlite,env}=fixture();
 env.META_PAGE_ID="1375913638943340";
 env.META_IG_USER_ID="17841473759990847";
 env.META_PAGE_ACCESS_TOKEN="local-placeholder-page-access-token-12345";
 const secret=env.META_PAGE_ACCESS_TOKEN;
 const originalFetch=globalThis.fetch,seen=[];
 try{
  globalThis.fetch=async(url,options)=>{
   seen.push({url,method:options.method,auth:options.headers.authorization});
   return new Response(JSON.stringify({id:url.includes(env.META_PAGE_ID)?env.META_PAGE_ID:env.META_IG_USER_ID,
    access_token:"MUST_NOT_LEAK"}),{status:200,headers:{"content-type":"application/json"}});
  };
  assert.equal((await request("/api/admin/marketing/meta/status","GET",undefined,false)).httpStatus,401);
  assert.equal((await request("/api/admin/marketing/meta/diagnostics","POST",{},false)).httpStatus,401);
  assert.equal((await request("/api/admin/marketing/meta/status")).latest,null);
  await worker.scheduled({cron:"0 2 * * *"},env,{});
  assert.equal(seen.length,2);
  assert.ok(seen.every(x=>x.method==="GET"&&x.auth==="Bearer "+secret&&!x.url.includes(secret)));
  const result=await request("/api/admin/marketing/meta/status");
  assert.equal(result.graph_api_verified,true);
  assert.equal(result.latest.result,"READ_OK");
  assert.equal(result.latest.source,"DAILY_CRON");
  assert.equal(result.latest.page.status,200);
  assert.equal(result.history.length,1);
  assert.ok(!JSON.stringify(result).includes(secret));
  assert.ok(!JSON.stringify(result).includes("MUST_NOT_LEAK"));
  const repeated=await request("/api/admin/marketing/meta/diagnostics","POST",{});
  assert.equal(repeated.status,"RECENT_RESULT");
  assert.equal(seen.length,2);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM meta_connection_checks").get().n,1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_publications WHERE status='POSTED'").get().n,0);
  sqlite.prepare("UPDATE meta_connection_checks SET checked_at='2000-01-01 00:00:00'").run();
  globalThis.fetch=async(url,options)=>{
   seen.push({url,method:options.method});
   return new Response(JSON.stringify({error:{message:"UNTRUSTED_SECRET"}}),{status:403});
  };
  const failed=await request("/api/admin/marketing/meta/diagnostics","POST",{});
  assert.equal(failed.status,"CHECKED");
  assert.equal(failed.latest.result,"READ_FAILED");
  assert.equal(failed.latest.page.status,403);
  assert.equal(seen.length,4);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM meta_connection_checks").get().n,1);
  assert.ok(!JSON.stringify(failed).includes("UNTRUSTED_SECRET"));
 }finally{globalThis.fetch=originalFetch;sqlite.close();}
});
test("unconfigured internal diagnostics do not call Meta or enable publishing",async()=>{
 const {request,sqlite,env}=fixture();
 const originalFetch=globalThis.fetch;
 try{
  globalThis.fetch=()=>{throw Error("No Graph calls expected");};
  await worker.scheduled({cron:"0 2 * * *"},env,{});
  const report=await request("/api/admin/marketing/meta/status");
  assert.equal(report.latest.result,"INCOMPLETE");
  assert.equal(report.latest.page.status,null);
  assert.equal(report.graph_api_verified,false);
  assert.equal(report.publishing_enabled,false);
 }finally{globalThis.fetch=originalFetch;sqlite.close();}
});

test("daily Cron recovers a missing week, keeps outdated content in history and never queues past dates",async()=>{
 const {request,sqlite,env}=fixture();
 const today=new Date().toISOString().slice(0,10);
 const monday=new Date(today+"T00:00:00Z");
 monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);
 const week=monday.toISOString().slice(0,10);
 // Historical draf remains present, but it does not replace current weekly review.
 sqlite.prepare("INSERT INTO campaign_drafts(id,activity_id,platform,caption,status,created_at) VALUES(?,?,?,?,?,?)").run(
  "historic-test","SNORKELING_3_SPOTS","Website","[AUTO 2026-10-18] Previously created historical draft text, do not erase it","DRAFT","2026-10-18 01:00:00");
 await worker.scheduled({cron:"0 2 * * *"},env,{});
 const ledger=sqlite.prepare("SELECT id FROM scheduled_runs WHERE id=?").get("campaign-week-"+week);
 assert.ok(ledger,"missed weekly schedule recovered by existing daily Cron");
 const drafts=sqlite.prepare("SELECT caption,status FROM campaign_drafts WHERE id!='historic-test'").all();
 assert.equal(drafts.length,7);
 assert.ok(drafts.every(x=>x.status==="DRAFT"));
 const dates=drafts.map(x=>/\[REVIEW (\d{4}-\d{2}-\d{2})/.exec(x.caption)?.[1]);
 assert.ok(dates.every(Boolean));
 assert.ok(dates.every(x=>x>=today),"never show past review dates during recovery");
 const queue=sqlite.prepare("SELECT intended_date FROM marketing_publications").all();
 if(today!==week)assert.equal(queue.length,0,"late recovery does not schedule stale direct social posts");
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_decisions").get().n,1);
 await worker.scheduled({cron:"0 2 * * *"},env,{});
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM campaign_drafts WHERE id!='historic-test'").get().n,7,"daily recovery is idempotent");
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM scheduled_runs").get().n,1);
 sqlite.close();
});

test("owner can see vetted campaign photo and full preview, reject, and immediately review a different replacement",async()=>{
 const {request,sqlite,env}=fixture();
 const created=await request("/api/admin/campaigns","POST",{activity_id:"SNORKELING_3_SPOTS",platform:"Instagram",
  caption:"Temukan aktivitas snorkeling Nusa Penida dan tanya operator tentang kondisi laut serta rute. #NusaPenida"});
 assert.equal(created.httpStatus,201);
 assert.equal((await request("/api/admin/campaigns","GET",undefined,false)).httpStatus,401);
 const before=await request("/api/admin/campaigns");
 const original=before.items.find(x=>x.id===created.id);
 assert.equal(original.status,"DRAFT");
 assert.match(original.preview_photo.url,/^\/photos\//);
 assert.match(original.preview_photo.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.match(original.preview_photo.license,/^CC BY-SA /);
 assert.equal((await request("/api/admin/campaigns/"+created.id+"/status","PATCH",
  {status:"REJECTED",owner_confirmed:true,reason:"Foto kurang menarik"},false)).httpStatus,401);
 assert.equal((await request("/api/admin/campaigns/"+created.id+"/status","PATCH",
  {status:"REJECTED",owner_confirmed:true,reason:"  "})).httpStatus,422);
 const reject=await request("/api/admin/campaigns/"+created.id+"/status","PATCH",
  {status:"REJECTED",owner_confirmed:true,reason:"Foto kurang menarik"});
 assert.equal(reject.status,"REJECTED");
 assert.equal(reject.replacement_status,"DRAFT");
 assert.ok(reject.replacement_id);
 assert.notEqual(reject.preview_photo.slug,original.preview_photo.slug);
 assert.equal(sqlite.prepare("SELECT COUNT(*) count FROM campaign_drafts").get().count,2);
 assert.equal(sqlite.prepare("SELECT COUNT(*) count FROM audit_log WHERE action='REJECTED_REGENERATED'").get().count,1);
 const after=await request("/api/admin/campaigns");
 const previous=after.items.find(x=>x.id===created.id);
 const replacement=after.items.find(x=>x.id===reject.replacement_id);
 assert.equal(previous.status,"REJECTED");
 assert.equal(previous.rejection_reason,"Foto kurang menarik");
 assert.equal(previous.replacement_id,reject.replacement_id);
 assert.equal(replacement.status,"DRAFT");
 assert.equal(replacement.revision,1);
 assert.notEqual(replacement.caption,original.caption);
 assert.notEqual(replacement.preview_photo.slug,original.preview_photo.slug);
 assert.equal((await request("/api/admin/campaigns/"+created.id+"/status","PATCH",
  {status:"REJECTED",owner_confirmed:true,reason:"Sekali lagi"})).httpStatus,409);
 assert.equal((await request("/api/admin/campaigns/"+created.id+"/status","PATCH",
  {status:"APPROVED",owner_confirmed:true})).httpStatus,409);
 assert.equal(sqlite.prepare("SELECT COUNT(*) count FROM campaign_drafts").get().count,2);
 const approved=await request("/api/admin/campaigns/"+replacement.id+"/status","PATCH",
  {status:"APPROVED",owner_confirmed:true});
 assert.equal(approved.status,"APPROVED");
 const checked=(await request("/api/admin/campaigns")).items.find(x=>x.id===replacement.id);
 assert.equal(checked.status,"APPROVED");
 assert.equal(checked.preview_photo.slug,replacement.preview_photo.slug);
 assert.equal(sqlite.prepare("SELECT COUNT(*) count FROM marketing_publications WHERE status='POSTED'").get().count,0);
 sqlite.close();
});
test("owner can reject successive replacements while preserving both originals and feedback",async()=>{
 const {request,sqlite,env}=fixture();
 const first=await request("/api/admin/campaigns","POST",{activity_id:"ISLAND_TOUR_CAR",platform:"Facebook",
  caption:"Jelajahi West Nusa Penida bersama operator lokal dan rencanakan perjalanan berdasarkan tanggal Anda."});
 const r1=await request("/api/admin/campaigns/"+first.id+"/status","PATCH",
  {status:"REJECTED",reason:"Ganti gambar",owner_confirmed:true});
 const r2=await request("/api/admin/campaigns/"+r1.replacement_id+"/status","PATCH",
  {status:"REJECTED",reason:"Ganti gaya caption",owner_confirmed:true});
 assert.equal(r2.status,"REJECTED");
 assert.notEqual(r2.replacement_id,r1.replacement_id);
 const items=(await request("/api/admin/campaigns")).items;
 assert.equal(items.filter(x=>x.status==="REJECTED").length,2);
 assert.equal(items.filter(x=>x.status==="DRAFT").length,1);
 assert.equal(items.find(x=>x.id===r2.replacement_id).revision,2);
 assert.equal(sqlite.prepare("SELECT COUNT(*) count FROM campaign_drafts").get().count,3);
 assert.equal(sqlite.prepare("SELECT COUNT(*) count FROM audit_log WHERE action='REJECTED_REGENERATED'").get().count,2);
 sqlite.close();
});
test("failed Workers AI regeneration falls back to safe editorial draft without auto posting",async()=>{
 const {request,sqlite,env}=fixture();
 env.AI={run:async()=>{throw Error("AI quota exhausted")}};
 const created=await request("/api/admin/campaigns","POST",{activity_id:"ISLAND_TOUR_CAR",platform:"Instagram",
  caption:"Jelajahi pesona Nusa Penida Barat serta pemandangan laut yang memikat. Tanyakan pilihan rute."});
 const r=await request("/api/admin/campaigns/"+created.id+"/status","PATCH",
  {status:"REJECTED",owner_confirmed:true,reason:"Buat lebih estetik"});
 assert.equal(r.status,"REJECTED");
 assert.equal(r.generator,"SAFE_EDITORIAL_FALLBACK");
 assert.equal((await request("/api/admin/campaigns")).items.find(x=>x.id===r.replacement_id).status,"DRAFT");
 assert.equal(sqlite.prepare("SELECT COUNT(*) count FROM marketing_publications WHERE status='POSTED'").get().count,0);
 sqlite.close();
});

test("owner approves a frozen draft and receives a safe channel-specific schedule, never a legacy scheduled idea",async()=>{
 const {request,sqlite,env}=fixture();
 env.META_APPROVED_AUTOPOST_ENABLED="true";
 env.META_EXTERNAL_POST_DATES="2026-10-26,2026-10-28,2026-10-30";
 const created=await request("/api/admin/campaigns","POST",{platform:"Website",activity_id:"ISLAND_TOUR_CAR",
  caption:"Jelajahi Nusa Penida Barat, termasuk Kelingking Beach dan pemandangan tebingnya. Cek tanggal dan operator lokal."});
 assert.equal(created.httpStatus,201);
 const denied=await request("/api/admin/campaigns/"+created.id+"/status","PATCH",{
  status:"APPROVED",auto_publish:true,platforms:["Facebook","Instagram"],owner_confirmed:true},false);
 assert.equal(denied.httpStatus,401);
 const result=await request("/api/admin/campaigns/"+created.id+"/status","PATCH",{
  status:"APPROVED",auto_publish:true,platforms:["Facebook","Instagram"],owner_confirmed:true});
 assert.equal(result.httpStatus,200);
 assert.equal(result.status,"APPROVED");
 assert.equal(result.post_mode,"SCHEDULED_AUTO");
 assert.equal(result.queue.length,2);
 assert.ok(result.queue.every(x=>x.scheduled_wita.includes(":00")));
 assert.ok(result.queue.every(x=>!["2026-10-26","2026-10-28","2026-10-30"].some(block=>x.scheduled_wita.startsWith(block))));
 const queued=sqlite.prepare("SELECT * FROM approved_social_queue ORDER BY platform").all();
 assert.equal(queued.length,2);
 assert.ok(queued.every(x=>x.campaign_id===created.id&&x.status==="QUEUED"));
 assert.ok(queued.every(x=>x.caption_snapshot.includes("Jelajahi Nusa Penida Barat")&&!x.caption_snapshot.includes("[REVIEW")));
 assert.ok(queued.every(x=>x.caption_snapshot.includes("Photo: ")&&x.image_url.endsWith(".jpg")));
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_publications WHERE status='POSTED'").get().n,0);
 const duplicate=await request("/api/admin/campaigns/"+created.id+"/status","PATCH",{
  status:"APPROVED",auto_publish:true,platforms:["Facebook"],owner_confirmed:true});
 assert.equal(duplicate.httpStatus,400);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_queue").get().n,2);
 assert.equal((await request("/api/admin/marketing/approved-queue","GET",undefined,false)).httpStatus,401);
 const dashboard=await request("/api/admin/marketing/approved-queue");
 assert.equal(dashboard.posts.length,2);
 assert.equal(dashboard.enabled,true);
 const cancel=await request("/api/admin/marketing/approved-queue/"+dashboard.posts[0].id+"/cancel","POST",{owner_confirmed:true});
 assert.equal(cancel.status,"CANCELLED");
 assert.equal((await request("/api/admin/marketing/approved-queue/"+dashboard.posts[0].id+"/cancel","POST",{owner_confirmed:true})).httpStatus,409);
 sqlite.close();
});
test("read-only diagnostics gate remote posting, IG container finishes separately and no Graph POST repeats",async()=>{
 const {request,sqlite,env}=fixture();
 env.META_APPROVED_AUTOPOST_ENABLED="true";
 env.META_PAGE_ID="1375913638943340";
 env.META_IG_USER_ID="17841473759990847";
 env.META_PAGE_ACCESS_TOKEN="test-only-graph-token-long-enough-to-use";
 const created=await request("/api/admin/campaigns","POST",{activity_id:"SNORKELING_3_SPOTS",platform:"Instagram",
  caption:"Tanyakan paket snorkeling Nusa Penida yang cocok untuk Anda, serta kondisi laut dan operator setempat."});
 const app=await request("/api/admin/campaigns/"+created.id+"/status","PATCH",{
  status:"APPROVED",auto_publish:true,platforms:["Instagram","Facebook"],owner_confirmed:true});
 assert.equal(app.status,"APPROVED");
 sqlite.prepare("UPDATE approved_social_queue SET scheduled_at=datetime('now','-1 hour')").run();
 const original=globalThis.fetch,posts=[];
 try{
  globalThis.fetch=async(u,o)=>{
   if(o.method!=="GET")posts.push(u);
   if(u.includes("/media_publish"))return new Response(JSON.stringify({id:"333333333333"}),{status:200});
   if(u.includes("/media"))return new Response(JSON.stringify({id:"222222222222"}),{status:200});
   if(u.includes("/photos"))return new Response(JSON.stringify({id:"111111111111"}),{status:200});
   if(u.includes("?fields=id,status_code"))return new Response(JSON.stringify({id:"222222222222",status_code:"FINISHED"}),{status:200});
   return new Response("{}",{status:404});
  };
  await worker.scheduled({cron:"0 * * * *"},env,{});
  assert.equal(posts.length,0,"stale or missing Meta diagnostics must pause posting");
  sqlite.prepare("INSERT INTO meta_connection_checks(day,source,configured,page_ok,instagram_ok,page_http_status,instagram_http_status,result) VALUES(date('now'),'DAILY_CRON',1,1,1,200,200,'READ_OK')").run();
  await worker.scheduled({cron:"0 * * * *"},env,{});
  assert.equal(posts.length,2);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_queue WHERE status='POSTED'").get().n,1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_queue WHERE status='AWAITING_CONTAINER'").get().n,1);
  await worker.scheduled({cron:"0 * * * *"},env,{});
  assert.equal(posts.length,3);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_queue WHERE status='POSTED'").get().n,2);
  await worker.scheduled({cron:"0 * * * *"},env,{});
  assert.equal(posts.length,3,"published posts are not sent again");
 }finally{globalThis.fetch=original;sqlite.close();}
});
test("verified Graph insights create a measured successor DRAFT and strategy without fabricated clicks",async()=>{
 const {request,sqlite,env}=fixture();
 env.META_APPROVED_AUTOPOST_ENABLED="true";
 env.META_PAGE_ID="1375913638943340";
 env.META_IG_USER_ID="17841473759990847";
 env.META_PAGE_ACCESS_TOKEN="long-test-token-only-abcdef-abcdef";
 const created=await request("/api/admin/campaigns","POST",{activity_id:"ISLAND_TOUR_CAR",platform:"Instagram",
  caption:"Nikmati rute wisata Nusa Penida Timur, lihat pemandangan Diamond Beach, lalu tanyakan operator lokal untuk tanggal Anda."});
 await request("/api/admin/campaigns/"+created.id+"/status","PATCH",
  {status:"APPROVED",auto_publish:true,platforms:["Instagram"],owner_confirmed:true});
 sqlite.prepare("UPDATE approved_social_queue SET status='POSTED',meta_post_id='333333333333',published_at=datetime('now','-23 hours')").run();
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async(url,options)=>{
   if(url.includes("/insights?metric=views,reach,saved,shares"))
    return new Response(JSON.stringify({data:[
     {name:"views",values:[{value:540}]},{name:"reach",values:[{value:400}]},
     {name:"saved",values:[{value:13}]},{name:"shares",values:[{value:8}]}]}),{status:200});
   if(url.includes("?fields=id,like_count,comments_count"))
    return new Response(JSON.stringify({id:"333333333333",like_count:39,comments_count:5}),{status:200});
   return new Response("{}",{status:403});
  };
  await worker.scheduled({cron:"0 * * * *"},env,{});
  const metrics=sqlite.prepare("SELECT * FROM approved_social_metrics").all();
  assert.equal(metrics.length,1);
  assert.equal(metrics[0].views,540);
  assert.equal(metrics[0].reactions,39);
  assert.equal(metrics[0].link_clicks,null,"unknown clicks cannot be invented");
  assert.equal(metrics[0].data_status,"VERIFIED");
  const feedback=sqlite.prepare("SELECT * FROM approved_social_learning").all();
  assert.equal(feedback.length,1);
  const successor=sqlite.prepare("SELECT * FROM campaign_drafts WHERE id=?").get(feedback[0].new_campaign_id);
  assert.equal(successor.status,"DRAFT");
  assert.match(successor.caption,/REVIEW/);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_decisions").get().n,1);
  const intel=await request("/api/admin/marketing/intelligence");
  assert.ok(intel.observation_count>=1);
  await worker.scheduled({cron:"0 * * * *"},env,{});
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_learning").get().n,1);
 }finally{globalThis.fetch=original;sqlite.close();}
});
test("unknown or removed Meta insights must not create invented observations or improved drafts",async()=>{
 const {request,sqlite,env}=fixture();
 env.META_APPROVED_AUTOPOST_ENABLED="true";
 env.META_PAGE_ID="1375913638943340";
 env.META_PAGE_ACCESS_TOKEN="long-test-token-only-abcdef-abcdef";
 const created=await request("/api/admin/campaigns","POST",{activity_id:"ISLAND_TOUR_CAR",platform:"Facebook",
  caption:"Temukan pemandangan Broken Beach Nusa Penida dan konsultasikan tanggal dengan pemandu lokal."});
 await request("/api/admin/campaigns/"+created.id+"/status","PATCH",
  {status:"APPROVED",auto_publish:true,platforms:["Facebook"],owner_confirmed:true});
 sqlite.prepare("UPDATE approved_social_queue SET status='POSTED',meta_post_id='1234567890123',published_at=datetime('now','-23 hours')").run();
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async(url,opts)=>{
   if(url.includes("?fields=id,likes.summary(true)"))
    return new Response(JSON.stringify({id:"1234567890123",likes:{summary:{total_count:4}},comments:{summary:{total_count:2}}}),{status:200});
   return new Response("{}",{status:400});
  };
  await worker.scheduled({cron:"0 * * * *"},env,{});
  const metrics=sqlite.prepare("SELECT views,data_status,reactions FROM approved_social_metrics").get();
  assert.equal(metrics.views,null);
  assert.equal(metrics.data_status,"PARTIAL");
  assert.equal(metrics.reactions,4);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_learning").get().n,0);
  assert.equal((await request("/api/admin/marketing/intelligence")).observation_count,0);
 }finally{globalThis.fetch=original;sqlite.close();}
});

test("pre-existing owner APPROVED campaign can be explicitly scheduled exactly once, without backfilling all approved drafts",async()=>{
 const {request,sqlite,env}=fixture();
 env.META_APPROVED_AUTOPOST_ENABLED="true";
 const created=await request("/api/admin/campaigns","POST",{platform:"Instagram",activity_id:"ISLAND_TOUR_CAR",
  caption:"Explore the landscapes of Nusa Penida with a local operator; ask our agent for practical travel options."});
 const oldApproval=await request("/api/admin/campaigns/"+created.id+"/status","PATCH",{status:"APPROVED",owner_confirmed:true});
 assert.equal(oldApproval.status,"APPROVED");
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_queue").get().n,0,"old approval is not silently backfilled");
 const unauth=await request("/api/admin/campaigns/"+created.id+"/schedule","POST",{owner_confirmed:true,auto_publish:true,platforms:["Instagram"]},false);
 assert.equal(unauth.httpStatus,401);
 const withoutConsent=await request("/api/admin/campaigns/"+created.id+"/schedule","POST",{owner_confirmed:false,auto_publish:true,platforms:["Instagram"]});
 assert.equal(withoutConsent.httpStatus,403);
 const scheduled=await request("/api/admin/campaigns/"+created.id+"/schedule","POST",{owner_confirmed:true,auto_publish:true,platforms:["Instagram"]});
 assert.equal(scheduled.httpStatus,200);
 assert.equal(scheduled.post_mode,"SCHEDULED_AUTO");
 assert.equal(scheduled.queue.length,1);
 assert.equal(sqlite.prepare("SELECT status FROM campaign_drafts WHERE id=?").get(created.id).status,"APPROVED");
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_queue").get().n,1);
 const duplicate=await request("/api/admin/campaigns/"+created.id+"/schedule","POST",{owner_confirmed:true,auto_publish:true,platforms:["Facebook"]});
 assert.equal(duplicate.httpStatus,409);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_queue").get().n,1);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM audit_log WHERE action='APPROVED_SCHEDULED'").get().n,1);
 sqlite.close();
});
test("old APPROVED campaigns already recorded as published or rejected cannot be auto-scheduled",async()=>{
 const {request,sqlite,env}=fixture();
 env.META_APPROVED_AUTOPOST_ENABLED="true";
 const created=await request("/api/admin/campaigns","POST",{platform:"Facebook",activity_id:"SNORKELING_3_SPOTS",
  caption:"Nusa Penida offers snorkeling options with local operators; ask about routes and sea conditions first."});
 await request("/api/admin/campaigns/"+created.id+"/status","PATCH",{status:"APPROVED",owner_confirmed:true});
 await request("/api/admin/campaigns/"+created.id+"/status","PATCH",{status:"PUBLISHED",owner_confirmed:true,public_url:"https://facebook.com/example-post"});
 const refused=await request("/api/admin/campaigns/"+created.id+"/schedule","POST",{owner_confirmed:true,auto_publish:true,platforms:["Facebook"]});
 assert.equal(refused.httpStatus,409);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_queue").get().n,0);
 sqlite.close();
});

test("owner Add Foto uploads compressed JPEG to existing PHOTO_KV and makes a safe public URL",async()=>{
 const {request,db,sqlite,env}=fixture();
 const storage=new Map();
 env.PHOTO_KV={
  async put(k,v){storage.set(k,v instanceof ArrayBuffer?v.slice(0):v)},
  async get(k){return storage.get(k)||null},
  async delete(k){storage.delete(k)}
 };
 const bytes=new Uint8Array(16000);bytes[0]=255;bytes[1]=216;bytes[2]=255;bytes[3]=224;bytes[15998]=255;bytes[15999]=217;
 const upload=async(authorised=true,title="Kelingking dari HP",rights=true)=>{
  const form=new FormData();
  form.append("file",new Blob([bytes],{type:"image/jpeg"}),"photo.jpg");
  form.append("title",title);
  form.append("activity_id","ISLAND_TOUR_CAR");
  if(rights)form.append("rights_confirmed","true");
  const req=new Request("https://agent.invalid/api/admin/photos",{method:"POST",
   headers:authorised?{authorization:"Bearer "+TOKEN}:{},body:form});
  const response=await worker.fetch(req,env);
  return {status:response.status,body:await response.json()};
 };
 const noOwner=await upload(false);assert.equal(noOwner.status,401);
 assert.equal(storage.size,0);
 const noRights=await upload(true,"Kelingking",false);assert.equal(noRights.status,403);
 assert.equal(storage.size,0);
 const created=await upload();assert.equal(created.status,201,JSON.stringify(created.body));
 assert.equal(created.body.status,"STORED");
 assert.match(created.body.photo.url,/^\/photos\/owner\/[0-9a-f-]+$/);
 assert.equal(storage.size,1);
 const duplicate=await upload();assert.equal(duplicate.status,409);
 assert.equal(storage.size,1);
 const denied=await request("/api/admin/photos","GET",undefined,false);assert.equal(denied.httpStatus,401);
 const list=await request("/api/admin/photos");
 assert.equal(list.items.length,1);
 assert.equal(list.items[0].title,"Kelingking dari HP");
 const publicRequest=new Request("https://agent.invalid"+created.body.photo.url);
 const picture=await worker.fetch(publicRequest,env);
 assert.equal(picture.status,200);
 assert.equal(picture.headers.get("content-type"),"image/jpeg");
 assert.equal((await picture.arrayBuffer()).byteLength,16000);
 const missing=await worker.fetch(new Request("https://agent.invalid/photos/owner/f0000000-aaaa-bbbb-cccc-111111111111"),env);
 assert.equal(missing.status,404);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM owner_photo_library").get().n,1);
 sqlite.close();
});
test("user-picked photo is frozen into approved Meta queue; mismatched/rejected/approved changes are refused",async()=>{
 const {request,db,sqlite,env}=fixture();
 env.META_APPROVED_AUTOPOST_ENABLED="true";
 const storage=new Map();
 env.PHOTO_KV={
  put:async(k,v)=>{storage.set(k,v)},
  get:async(k)=>storage.get(k)||null,
  delete:async(k)=>storage.delete(k)
 };
 const bytes=new Uint8Array(16000);bytes.set([255,216,255,224],0);bytes.set([255,217],15998);
 const form=new FormData();form.append("file",new Blob([bytes],{type:"image/jpeg"}),"owner.jpg");
 form.append("title","Original East Nusa Penida");form.append("activity_id","ISLAND_TOUR_CAR");
 form.append("rights_confirmed","true");
 const r=await worker.fetch(new Request("https://agent.invalid/api/admin/photos",
  {method:"POST",headers:{authorization:"Bearer "+TOKEN},body:form}),env);
 const photo=(await r.json()).photo;assert.equal(r.status,201);
 const camp=await request("/api/admin/campaigns","POST",{activity_id:"ISLAND_TOUR_CAR",platform:"Instagram",
  caption:"Explore Diamond Beach and the seaside cliffs of Nusa Penida with the help of local guides."});
 const invalid=await request("/api/admin/campaigns/"+camp.id+"/photo","POST",{photo_id:photo.photo_id,owner_confirmed:true},false);
 assert.equal(invalid.httpStatus,401);
 const selected=await request("/api/admin/campaigns/"+camp.id+"/photo","POST",{photo_id:photo.photo_id,owner_confirmed:true});
 assert.equal(selected.httpStatus,200,JSON.stringify(selected));
 const preview=(await request("/api/admin/campaigns")).items.find(x=>x.id===camp.id);
 assert.equal(preview.preview_photo.owner_supplied,true);
 assert.equal(preview.preview_photo.url,photo.url);
 const approval=await request("/api/admin/campaigns/"+camp.id+"/status","PATCH",
  {status:"APPROVED",owner_confirmed:true,auto_publish:true,platforms:["Instagram","Facebook"]});
 assert.equal(approval.httpStatus,200,JSON.stringify(approval));
 const queued=sqlite.prepare("SELECT * FROM approved_social_queue WHERE campaign_id=?").all(camp.id);
 assert.equal(queued.length,2);
 assert.equal(queued[0].photo_slug,"owner-"+photo.photo_id);
 assert.equal(queued[0].image_url,"https://marketing-turism-agent.finchat-ai-gateway.workers.dev"+photo.url);
 assert.match(queued[0].caption_snapshot,/owner-supplied image/);
 const changed=await request("/api/admin/campaigns/"+camp.id+"/photo","POST",{photo_id:photo.photo_id,owner_confirmed:true});
 assert.equal(changed.httpStatus,422);
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM approved_social_queue WHERE campaign_id=?").get(camp.id).n,2);
 const other=await request("/api/admin/campaigns","POST",{activity_id:"SNORKELING_3_SPOTS",platform:"Facebook",
  caption:"See the underwater world of Nusa Penida, where manta rays can sometimes be spotted."});
 const categoryError=await request("/api/admin/campaigns/"+other.id+"/photo","POST",{photo_id:photo.photo_id,owner_confirmed:true});
 assert.equal(categoryError.httpStatus,422);
 sqlite.close();
});

test("Commons auto research accepts verified commercial-use metadata only, not unlicensed or mismatched destinations",()=>{
 const page={title:"File:Kelingking Beach Nusa Penida South Bali.jpg",imageinfo:[{
  mime:"image/jpeg",thumburl:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/photo.jpg",
  extmetadata:{Artist:{value:"<b>Alice Photographer</b>"},LicenseShortName:{value:"CC BY-SA 4.0"},
    LicenseUrl:{value:"https://creativecommons.org/licenses/by-sa/4.0/"}}}]};
 assert.equal(topicForCampaign("ISLAND_TOUR_CAR","Kelingking Beach is stunning"),"kelingking");
 assert.equal(topicForCampaign("SNORKELING_3_SPOTS","Respect wild manta rays"),"manta");
 assert.equal(validCommonsCandidate(page,"kelingking").license,"CC BY-SA 4.0");
 assert.equal(validCommonsCandidate(page,"kelingking").author,"Alice Photographer");
 assert.equal(validCommonsCandidate(page,"manta"),null);
 assert.equal(validCommonsCandidate({...page,title:"File:Paris Eiffel Tower.jpg"},"kelingking"),null);
 assert.equal(validCommonsCandidate({...page,imageinfo:[{...page.imageinfo[0],
  extmetadata:{...page.imageinfo[0].extmetadata,LicenseShortName:{value:"CC BY-NC 4.0"}}}]},"kelingking"),null);
 assert.equal(validCommonsCandidate({...page,imageinfo:[{...page.imageinfo[0],thumburl:"https://evil.invalid/remote.jpg"}]},"kelingking"),null);
 assert.equal(validCommonsCandidate({...page,imageinfo:[{...page.imageinfo[0],
  extmetadata:{...page.imageinfo[0].extmetadata,Artist:{value:""}}}]},"kelingking"),null);
});
test("automatic research downloads an attributed photo into existing PHOTO_KV and freezes it into next owner-reviewed draft",async()=>{
 const {request,db,env,sqlite}=fixture();
 env.META_APPROVED_AUTOPOST_ENABLED="true";
 const storage=new Map();
 env.PHOTO_KV={get:async k=>storage.get(k)||null,put:async(k,v)=>storage.set(k,v),delete:async k=>storage.delete(k)};
 const blob=new Uint8Array(18000);
 blob.set([255,216,255,224],0);blob.set([255,217],17998);
 const candidate={title:"File:Kelingking Beach Nusa Penida aerial.jpg",imageinfo:[{
  mime:"image/jpeg",url:"https://upload.wikimedia.org/wikipedia/commons/a/ab/aerial.jpg",
  thumburl:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/aerial.jpg",
  extmetadata:{Artist:{value:"Alice"},LicenseShortName:{value:"CC BY 4.0"},LicenseUrl:{value:"https://creativecommons.org/licenses/by/4.0/"}}}]};
 const get=async url=>{
  if(String(url).includes("/w/api.php"))return new Response(JSON.stringify({query:{pages:[
   {...candidate,imageinfo:[{...candidate.imageinfo[0],extmetadata:{...candidate.imageinfo[0].extmetadata,
    LicenseShortName:{value:"CC BY-NC 4.0"}}}]},candidate]}}),{status:200,headers:{"content-type":"application/json"}});
  return new Response(blob,{status:200,headers:{"content-type":"image/jpeg","content-length":String(blob.length)}});
 };
 const first=await choosePhotoForReview(db,env,"ISLAND_TOUR_CAR","Kelingking Beach Nusa Penida",{
  discover:true,request:get});
 assert.equal(first.origin,"LICENSED_RESEARCH",JSON.stringify(first));
 assert.ok(first.slug.startsWith("research-"));
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM researched_photo_library").get().n,1);
 assert.equal(storage.size,1);
 assert.equal(sqlite.prepare("SELECT license FROM researched_photo_library").get().license,"CC BY 4.0");
 const original=globalThis.fetch;
 try{
  globalThis.fetch=get;
  const campaign=await request("/api/admin/campaigns","POST",{activity_id:"ISLAND_TOUR_CAR",platform:"Facebook",
   caption:"Nusa Penida Kelingking Beach has distinctive dramatic coastline. Ask our team about accessible routes and weather."});
  const photo=await request("/api/admin/campaigns/"+campaign.id+"/research-photo","POST",{owner_confirmed:true});
  assert.equal(photo.httpStatus,200);
  assert.equal(photo.status,"PHOTO_SELECTED_FOR_REVIEW");
  assert.equal(photo.photo.research_discovered,true);
  assert.match(photo.photo.source,/commons\.wikimedia\.org/);
  const peek=(await request("/api/admin/campaigns")).items.find(c=>c.id===campaign.id);
  assert.equal(peek.preview_photo.research_discovered,true);
  const picture=await worker.fetch(new Request("https://agent.invalid"+peek.preview_photo.url),env);
  assert.equal(picture.status,200);
  assert.equal((await picture.arrayBuffer()).byteLength,blob.length);
  const approval=await request("/api/admin/campaigns/"+campaign.id+"/status","PATCH",
    {owner_confirmed:true,auto_publish:true,status:"APPROVED",platforms:["Facebook"]});
  assert.equal(approval.httpStatus,200,JSON.stringify(approval));
  const queued=sqlite.prepare("SELECT photo_slug,image_url,caption_snapshot FROM approved_social_queue WHERE campaign_id=?").get(campaign.id);
  assert.ok(queued.photo_slug.startsWith("research-"));
  assert.match(queued.image_url,/\/photos\/research\//);
  assert.match(queued.caption_snapshot,/Alice/);
  assert.match(queued.caption_snapshot,/License: https:\/\/creativecommons.org\/licenses\/by\/4.0\//);
  const edit=await request("/api/admin/campaigns/"+campaign.id+"/research-photo","POST",{owner_confirmed:true});
  assert.equal(edit.httpStatus,409);
 }finally{globalThis.fetch=original;sqlite.close();}
});
test("research source outages keep draft workflow functional and never fabricate licensed photo",async()=>{
 const {db,env,sqlite}=fixture();
 env.PHOTO_KV={get:async()=>null,put:async()=>{},delete:async()=>{}};
 const noNetwork=async()=>new Response("blocked",{status:503});
 const choice=await choosePhotoForReview(db,env,"ISLAND_TOUR_CAR","Diamond Beach Nusa Penida",{
  discover:true,request:noNetwork});
 assert.equal(choice.slug,null);
 assert.equal(choice.origin,"FALLBACK_VETTED_GALLERY");
 assert.equal(choice.search_status,"EXTERNAL_UNAVAILABLE");
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM researched_photo_library").get().n,0);
 const outcome=sqlite.prepare("SELECT outcome FROM photo_research_runs").get();
 assert.equal(outcome.outcome,"EXTERNAL_UNAVAILABLE");
 sqlite.close();
});

test("weekly automatic topic research creates owner-review DRAFT with sourced media and no unapproved posts",async()=>{
 const {db,sqlite,env,request}=fixture();
 env.PHOTO_KV={value:new Map(),get(k){return this.value.get(k)||null},
  put(k,v){this.value.set(k,v);return Promise.resolve()},delete(k){this.value.delete(k);return Promise.resolve()}};
 const jpeg=new Uint8Array(22000);jpeg.set([255,216,255,224],0);jpeg.set([255,217],21998);
 const sourceFetch=async url=>{
  if(String(url).includes("/w/api.php")){
   const search=new URL(url).searchParams.get("gsrsearch");
   const name=/manta/i.test(search)?"Manta Nusa Penida snorkeling":
    /snorkeling/i.test(search)?"Snorkeling Nusa Penida":
    /diamond/i.test(search)?"Diamond Beach Nusa Penida":"Kelingking Beach Nusa Penida";
   const page={title:"File:"+name+".jpg",imageinfo:[{mime:"image/jpeg",
    thumburl:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/automatic.jpg",
    extmetadata:{Artist:{value:"Penida photo author"},LicenseShortName:{value:"CC BY 4.0"},
     LicenseUrl:{value:"https://creativecommons.org/licenses/by/4.0/"}}}]};
   return new Response(JSON.stringify({query:{pages:[page]}}),{status:200,headers:{"content-type":"application/json"}});
  }
  return new Response(jpeg,{status:200,headers:{"content-type":"image/jpeg"}});
 };
 const oldFetch=globalThis.fetch;globalThis.fetch=sourceFetch;
 try{
  const result=await request("/api/admin/marketing/prepare-week","POST",{owner_confirmed:true});
  assert.equal(result.httpStatus,200,JSON.stringify(result));
  assert.equal(result.generated,7);
  const drafts=sqlite.prepare("SELECT COUNT(*) n FROM campaign_drafts WHERE status='DRAFT'").get().n;
  assert.equal(drafts,7);
  const sourced=sqlite.prepare("SELECT COUNT(*) n FROM campaign_review_records WHERE media_slug LIKE 'research-%'").get().n;
  assert.ok(sourced>=1,"weekly prep must attach Commons media to at least one draft before approval");
  const onlyDraft=sqlite.prepare("SELECT status FROM campaign_drafts").all().every(x=>x.status==="DRAFT");
  assert.equal(onlyDraft,true);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM approved_social_queue").get().n,0,"not posted/queued until owner approval");
  const source=sqlite.prepare("SELECT source_url,license,author FROM researched_photo_library LIMIT 1").get();
  assert.match(source.source_url,/commons\.wikimedia\.org/);assert.equal(source.license,"CC BY 4.0");
  const repeated=await request("/api/admin/marketing/prepare-week","POST",{owner_confirmed:true});
  assert.equal(repeated.generated,0);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM campaign_drafts").get().n,7);
 }finally{globalThis.fetch=oldFetch;sqlite.close();}
});

test("growth acquisition extracts only public travel questions and real mapped business names, no member identities",()=>{
 const feed='<feed><entry><published>'+new Date().toISOString()+'</published><title>Any tips for snorkeling around Nusa Penida and Bali itinerary?</title>'+
  '<link href="https://www.reddit.com/r/bali/comments/abc123/visiting_penida/"/></entry>'+
  '<entry><title>Cheap crypto followers for sale?</title><link href="https://www.reddit.com/r/bali/comments/bad12/"/></entry>'+
  '<entry><title>Penida tours</title><link href="https://evil.invalid/private"/></entry></feed>';
 const questions=extractPublicQuestions(feed);
 assert.equal(questions.length,1);
 assert.equal(questions[0].source,"REDDIT_PUBLIC_RSS");
 assert.match(questions[0].headline,/snorkeling/);
 assert.match(questions[0].suggested_reply,/Nusa Penida Experiences/);
 assert.match(questions[0].suggested_reply,/No unsolicited DM/);
 const partners=extractOpenBusinesses({elements:[
  {type:"node",id:123456,tags:{name:"Penida Guest House",tourism:"guest_house"}},
  {type:"way",id:2222,tags:{name:"Penida Hostel",tourism:"hostel"}},
  {type:"node",id:987,tags:{name:"Someone Private",tourism:"residential"}}
 ]});
 assert.equal(partners.length,2);
 assert.equal(partners[0].source,"OSM_PUBLIC_BUSINESSES");
 assert.equal(partners[0].source_url,"https://www.openstreetmap.org/node/123456");
 assert.doesNotMatch(JSON.stringify(partners),/profile_id|telephone|contact:phone/);
});

test("freshness guard rejects one-month-old honeymoons, missing dates and expired tomorrow trips",()=>{
 const now=Date.parse("2026-10-27T04:00:00Z"); // 12:00 WITA, 27 Oct
 const entry=(id,date,body="")=>'<entry>'+ (date?'<published>'+date+'</published>':"")+
  '<title>Nusa Penida day trip tomorrow? Any advice?</title>'+
  '<content type="html">'+body+'</content>'+
  '<link href="https://www.reddit.com/r/bali/comments/'+id+'/trip/"/></entry>';
 const feed='<feed>'+
  entry("old001","2026-09-27T03:00:00Z","We leave tomorrow")+
  entry("expired1","2026-10-25T12:00:00Z","We plan Nusa Penida tomorrow")+
  entry("unknown1",null,"We leave tomorrow")+
  entry("fresh01","2026-10-27T03:00:00Z","We are going tomorrow")+
  entry("fresh02","2026-10-26T12:00:00Z","We travel next week")+
 '</feed>';
 const r=extractPublicQuestions(feed,"REDDIT_PUBLIC_RSS",now);
 assert.equal(r.length,2);
 assert.ok(r.every(x=>x.published_at&&x.expires_at&&x.age_hours>=0));
 assert.ok(r.every(x=>!x.source_url.includes("old001")&&!x.source_url.includes("expired1")));
 assert.ok(r[0].score>=r[1].score);
});
test("old Reddit records without verified publication timestamps do not surface as new leads",async()=>{
 const {db,sqlite}=createD1();
 await db.prepare("INSERT INTO growth_opportunities(id,source,source_url,headline,theme,score,suggested_reply) VALUES(?,'REDDIT_PUBLIC_RSS',? ,?,'GENERAL',90,?)")
  .bind("00000000-0000-4000-8000-000000000001","https://www.reddit.com/r/bali/comments/old123/trip/","Nusa Penida advice for tomorrow?","This is a previously discovered public post without a verified published date.").run();
 const overview=(await import("../src/growth-engine.mjs")).growthOverview;
 const data=await overview(db);
 assert.equal(data.opportunities.length,0);
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM growth_opportunities").get().n,1); // audit history preserved
 sqlite.close();
});
test("daily growth research discovers public prospects but cannot auto-send or create guest leads",async()=>{
 const {request,db,sqlite,env}=fixture();
 const rss='<feed><entry><published>'+new Date().toISOString()+'</published><title>How to plan Nusa Penida snorkeling for friends?</title>'+
 '<link href="https://www.reddit.com/r/bali/comments/qwe123/itinerary/"/></entry></feed>';
 const finder=async url=>{
  if(String(url).includes("reddit.com"))return new Response(rss,{status:200,headers:{"content-type":"application/atom+xml"}});
  if(String(url).includes("overpass-api.de"))return new Response(JSON.stringify({elements:[
   {type:"node",id:99124567,tags:{tourism:"hotel",name:"Penida View Hotel"}}
  ]}),{status:200,headers:{"content-type":"application/json"}});
  throw Error("Unexpected external data request");
 };
 const scan=await researchBuyerQuestions(db,env,finder);
 assert.equal(scan.status,"FOUND",JSON.stringify(scan));
 assert.equal(scan.discovered,2);
 const again=await researchBuyerQuestions(db,env,finder);
 assert.equal(again.status,"RECENTLY_SCANNED");
 const limited=await request("/api/admin/growth","GET",undefined,false);
 assert.equal(limited.httpStatus,401);
 const detail=await request("/api/admin/growth");
 assert.equal(detail.opportunities.length,2);
 assert.ok(detail.opportunities.some(x=>x.source==="REDDIT_PUBLIC_RSS"&&x.published_at&&x.expires_at));
 assert.equal(detail.leads,0);
 assert.equal(detail.bookings,0);
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM leads").get().n,0);
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM growth_discovery_runs WHERE source IN ('REDDIT_PUBLIC_RSS','OSM_PUBLIC_BUSINESSES')").get().n,2);
 const unauth=await request("/api/admin/growth/opportunities/"+detail.opportunities[0].id+"/status","PATCH",
  {owner_confirmed:true,status:"CONTACTED"},false);
 assert.equal(unauth.httpStatus,401);
 const owner=await request("/api/admin/growth/opportunities/"+detail.opportunities[0].id+"/status","PATCH",
  {owner_confirmed:true,status:"SHORTLISTED"});
 assert.equal(owner.httpStatus,200);
 assert.equal(owner.status,"SHORTLISTED");
 const denied=await request("/api/admin/growth/opportunities/"+detail.opportunities[0].id+"/status","PATCH",
  {owner_confirmed:false,status:"CONTACTED"});
 assert.equal(denied.httpStatus,403);
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM wa_outbox_requests").get().n,0);
 sqlite.close();
});
test("new public APIs enforce freshness and do not record author identities or stale travel questions",()=>{
 const now=Date.parse("2026-10-27T04:00:00Z"),published="2026-10-27T03:00:00Z",old="2026-09-27T03:00:00Z";
 const did="did:plc:abcdefgh1234567";
 const bluesky={posts:[
  {uri:"at://"+did+"/app.bsky.feed.post/3abc123",author:{did,handle:"private-like-handle.invalid"},
   record:{text:"Nusa Penida trip tomorrow? Any snorkel advice?",createdAt:published}},
  {uri:"at://"+did+"/app.bsky.feed.post/3old123",author:{did},
   record:{text:"Nusa Penida trip tomorrow? Any tips?",createdAt:old}}]};
 const bs=extractBlueskyPosts(bluesky,now);assert.equal(bs.length,1);
 assert.equal(bs[0].source,"BLUESKY_PUBLIC");
 assert.ok(!JSON.stringify(bs).includes("private-like-handle"));
 const fb=extractMetaPageComments({data:[{id:"123456_778899",comments:{data:[
  {id:"123456_789",message:"Nusa Penida day trip tomorrow? Any tips?",created_time:published,from:{name:"NEVER_STORE"}},
  {id:"123456_790",message:"Nusa Penida tomorrow? Advice?",created_time:old}
 ]}}]},now);
 assert.equal(fb.length,1);assert.equal(fb[0].source,"FACEBOOK_PAGE_COMMENTS");
 assert.ok(!JSON.stringify(fb).includes("NEVER_STORE"));
 const ig=extractInstagramComments({data:[{id:"123456",permalink:"https://www.instagram.com/p/xyz123/",
  comments:{data:[{id:"987654",text:"Nusa Penida snorkeling tomorrow? Any advice?",timestamp:published,username:"DO_NOT_SAVE"}]}}]},now);
 assert.equal(ig.length,1);assert.ok(!JSON.stringify(ig).includes("DO_NOT_SAVE"));
 assert.match(ig[0].source_url,/instagram.com/);
 const videos=extractYouTubeVideos({items:[{id:{videoId:"AbCdEfGh123"},
  snippet:{title:"Nusa Penida: is a day trip worth it?",publishedAt:published}}]},now);
 assert.equal(videos.length,1);assert.ok(videos[0].score<=65);
 assert.match(videos[0].suggested_reply,/NOT|not treat/i);
});

test("Bluesky, Facebook Page, Instagram business and optional YouTube feed single owner-review queue",async()=>{
 const {db,sqlite,request,env}=fixture();
 const now=new Date().toISOString(),did="did:plc:abcdefgh1234567";
 env.META_PAGE_ID="1234567890";
 env.META_IG_USER_ID="9876543210";
 env.META_PAGE_ACCESS_TOKEN="test-meta-page-access-token-1234567890";
 env.GROWTH_META_RESEARCH_ENABLED="true";
 env.GROWTH_YOUTUBE_RESEARCH_ENABLED="true";
 env.YOUTUBE_DATA_API_KEY="test-youtube-key-abcdefghijklmnopqrstuvwxyz";
 const caller=async(url,options)=>{
  url=String(url);
  if(url.startsWith("https://public.api.bsky.app/"))return new Response(JSON.stringify({posts:[{
   uri:"at://"+did+"/app.bsky.feed.post/3abc123",author:{did},record:{text:"Nusa Penida tomorrow? How to plan day trip?",createdAt:now}
  }]}),{status:200,headers:{"content-type":"application/json"}});
  if(url.includes("/1234567890/posts"))return new Response(JSON.stringify({data:[{id:"1234567890_123456",comments:{data:[{
   id:"987654_123456",message:"Nusa Penida island tour tomorrow? Any advice?",created_time:now
  }]}}]}),{status:200});
  if(url.includes("/9876543210/media"))return new Response(JSON.stringify({data:[{
   id:"1234567",permalink:"https://www.instagram.com/p/xyz/",comments:{data:[{
    id:"5678999",text:"Nusa Penida snorkel tomorrow? Recommend a safe boat?",timestamp:now
   }]}}]}),{status:200});
  if(url.startsWith("https://www.googleapis.com/youtube/"))return new Response(JSON.stringify({items:[{id:{videoId:"AbCdEfGh123"},snippet:{
   title:"Nusa Penida trip? How to plan a day itinerary?",publishedAt:now
  }}]}),{status:200});
  throw Error("unexpected external endpoint");
 };
 const statuses=await scanAdditionalNetworks(db,env,caller);
 assert.equal(statuses.filter(x=>x.status==="FOUND").length,4);
 const overview=await request("/api/admin/growth");
 assert.equal(overview.opportunities.length,4);
 assert.equal(overview.bookings,0);assert.equal(overview.leads,0);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM growth_network_opportunities").get().n,4);
 const fb=overview.opportunities.find(x=>x.source==="FACEBOOK_PAGE_COMMENTS");
 assert.ok(fb&&fb.published_at&&fb.expires_at);
 const action=await request("/api/admin/growth/opportunities/"+fb.id+"/status","PATCH",{owner_confirmed:true,status:"SHORTLISTED"});
 assert.equal(action.httpStatus,200);
 const noAction=await request("/api/admin/growth/opportunities/"+fb.id+"/status","PATCH",{owner_confirmed:false,status:"CONTACTED"});
 assert.equal(noAction.httpStatus,403);
 const repeat=await scanAdditionalNetworks(db,env,caller);
 assert.equal(repeat.length,0);
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM wa_outbox_requests").get().n,0);
 sqlite.close();
});

test("non-configured Meta and YouTube do not fabricate access, while public source errors are reported",async()=>{
 const {db,sqlite}=createD1();
 const caller=async()=>new Response("denied",{status:403});
 const results=await scanAdditionalNetworks(db,{},caller);
 assert.equal(results.find(x=>x.source==="BLUESKY_PUBLIC").status,"SOURCE_UNAVAILABLE");
 for(const source of ["FACEBOOK_PAGE_COMMENTS","INSTAGRAM_MEDIA_COMMENTS","YOUTUBE_PUBLIC_VIDEO"])
  assert.equal(results.find(x=>x.source===source).status,"NOT_CONFIGURED");
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM growth_network_opportunities").get().n,0);
 sqlite.close();
});
test("public click-to-chat measures aggregate intent only, never a guest lead or guaranteed message",async()=>{
 const {sqlite,env,request}=fixture();
 const payload={kind:"WHATSAPP",source:"facebook",landing:"snorkeling",phone:"SHOULD_NOT_BE_STORED"};
 async function ping(origin,body=payload){
  const res=await worker.fetch(new Request("https://agent.invalid/api/public/intent",{
   method:"POST",headers:{"content-type":"application/json","origin":origin},body:JSON.stringify(body)}),env);
  return {status:res.status,data:await res.json()};
 }
 assert.equal((await ping("https://attacker.invalid")).status,403);
 assert.equal((await ping("https://agent.invalid",{kind:"OTHER"})).status,400);
 assert.equal((await ping("https://agent.invalid")).status,202);
 assert.equal((await ping("https://agent.invalid")).status,202);
 const rows=sqlite.prepare("SELECT day,kind,source,landing,count FROM growth_click_daily").all();
 assert.equal(rows.length,1);
 assert.equal(rows[0].count,2);
 assert.equal(rows[0].source,"facebook");
 assert.equal(rows[0].landing,"snorkeling");
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM leads").get().n,0);
 assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM bookings").get().n,0);
 const growth=await request("/api/admin/growth");
 assert.equal(growth.click_count_30d,2);
 assert.equal(growth.leads,0);
 sqlite.close();
});
test("existing published Meta post with verified zero views generates new owner-review growth draft instead of stalling",async()=>{
 const {request,sqlite,env}=fixture();
 env.META_APPROVED_AUTOPOST_ENABLED="true";
 env.META_PAGE_ID="1375913638943340";
 env.META_PAGE_ACCESS_TOKEN="long-test-token-only-abcdef-abcdef";
 const campaign=await request("/api/admin/campaigns","POST",{activity_id:"ISLAND_TOUR_CAR",
  platform:"Facebook",caption:"Explore Nusa Penida West cliffs and ask about local travel options."});
 assert.equal(campaign.httpStatus,201);
 const approval=await request("/api/admin/campaigns/"+campaign.id+"/status","PATCH",
  {status:"APPROVED",auto_publish:true,platforms:["Facebook"],owner_confirmed:true});
 assert.equal(approval.httpStatus,200);
 sqlite.prepare("UPDATE approved_social_queue SET status='POSTED',meta_post_id='1234567890123',published_at=datetime('now','-24 hours')").run();
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async url=>{
   if(String(url).includes("post_media_view"))return new Response(JSON.stringify({data:[{name:"post_media_view",values:[{value:0}]}]}),{status:200});
   if(String(url).includes("likes.summary"))return new Response(JSON.stringify({id:"1234567890123",likes:{summary:{total_count:0}},comments:{summary:{total_count:0}}}),{status:200});
   return new Response("{}",{status:403});
  };
  await worker.scheduled({cron:"0 * * * *"},env,{});
  const stats=sqlite.prepare("SELECT views,data_status FROM approved_social_metrics").get();
  assert.equal(stats.views,0);
  assert.equal(stats.data_status,"VERIFIED");
  const learning=sqlite.prepare("SELECT * FROM approved_social_learning").all();
  assert.equal(learning.length,1);
  assert.equal(learning[0].source_views,0);
  const next=sqlite.prepare("SELECT status,caption FROM campaign_drafts WHERE id=?").get(learning[0].new_campaign_id);
  assert.equal(next.status,"DRAFT");
  assert.match(next.caption,/tanggal|peserta|date|group size/i);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM approved_social_queue").get().n,1,"new draft not automatically approved");
 }finally{globalThis.fetch=original;sqlite.close();}
});
