// Local Worker/D1 integration tests. No production data or credentials.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DatabaseSync} from "node:sqlite";
import worker from "../src/worker.mjs";

function createD1() {
  const sqlite=new DatabaseSync(":memory:");
  for(const file of ["0001_init.sql","0002_operations.sql","0003_marketing.sql","0004_scheduling.sql","0005_public_readiness.sql","0006_brand_refund_policy.sql","0007_booking_modes.sql","0008_variants_and_supplier_net.sql","0009_site_content.sql","0010_whatsapp_inbox.sql","0011_marketing_learning.sql","0012_meta_autopilot.sql"])
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
 assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM marketing_publications").get().n,3);
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
 globalThis.fetch=async()=>{
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
