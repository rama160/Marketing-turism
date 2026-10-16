// Local Worker/D1 integration tests. No production data or credentials.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DatabaseSync} from "node:sqlite";
import worker from "../src/worker.mjs";

function createD1() {
  const sqlite=new DatabaseSync(":memory:");
  for(const file of ["0001_init.sql","0002_operations.sql","0003_marketing.sql","0004_scheduling.sql","0005_public_readiness.sql"])
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
 assert.equal((await request("/api/health","GET",undefined,false)).version,"2.5.0");
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

test("weekly scheduled run creates only two drafts, once, with no automatic publication",async()=>{
 const {db,sqlite,env}=fixture();
 await worker.scheduled({cron:"0 1 * * 1"},env,{});
 let drafts=sqlite.prepare("SELECT status,platform,caption FROM campaign_drafts ORDER BY activity_id").all();
 assert.equal(drafts.length,2);
 assert.ok(drafts.every(x=>x.status==="DRAFT"&&x.platform==="Website"&&x.caption.startsWith("[AUTO ")));
 await worker.scheduled({cron:"0 1 * * 1"},env,{});
 assert.equal(sqlite.prepare("SELECT COUNT(*) as n FROM campaign_drafts").get().n,2);
 assert.equal(sqlite.prepare("SELECT COUNT(*) as n FROM scheduled_runs").get().n,1);
 sqlite.close();
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
