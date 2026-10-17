import test from "node:test";import assert from "node:assert/strict";import {calculate,aiSuggestion,PricingError} from "../src/pricing.mjs";
const r=(id,net,unit,cap)=>({id,net,unit,capacity:cap,verified:1,active:1});
test("single snorkeling minimum 450k",()=>assert.equal(calculate({guests:1,base:r("s",350000,"person")}).minimum,450000));
test("4 guests snorkeling group markup per BOOKING",()=>assert.equal(calculate({guests:4,base:r("s",350000,"person")}).minimum,1500000));
test("tour 4 lunch and return boat costs",()=>{const x=calculate({guests:4,base:r("t",600000,"car",6),extras:[{item:"LUNCH",qty:4,rate:r("l",150000,"person")},{item:"BOAT_OUT",qty:4,rate:r("o",150000,"person")},{item:"BOAT_RETURN",qty:4,rate:r("b",150000,"person")}]});assert.equal(x.net,2400000);assert.equal(x.minimum,2500000)});
test("7 passengers require confirmed 7 seats",()=>{assert.throws(()=>calculate({guests:7,base:r("t",600000,"car",6)}),PricingError);assert.equal(calculate({guests:7,base:r("t",600000,"car",7)}).minimum,700000)});
test("reject unverified provider rate",()=>assert.throws(()=>calculate({guests:1,base:{...r("s",350000,"person"),verified:0}}),PricingError));
test("no invented return boat price",()=>assert.throws(()=>calculate({guests:1,base:r("t",600000,"car",6),extras:[{item:"BOAT_RETURN",qty:1,rate:null}]}),PricingError));
test("agency costs raise floor",()=>assert.equal(calculate({guests:1,base:r("s",350000,"person"),agencyCosts:120000,paymentFee:10000,minProfit:20000}).minimum,500000));
test("AI market price cannot undercut floor",()=>assert.equal(aiSuggestion(calculate({guests:1,base:r("s",350000,"person")}),313500),450000));
test("seller cannot sell at loss",()=>assert.throws(()=>calculate({guests:1,base:r("s",350000,"person"),sellingPrice:449999}),PricingError));
test("contribution accounting",()=>assert.equal(calculate({guests:1,base:r("s",350000,"person"),agencyCosts:20000,sellingPrice:500000}).contribution,130000));

test("private 1-pax island still covers full exclusive vehicle and all agency costs",()=>{
 const base={...r("vehicle",600000,"car",7),item_id:"ISLAND_TOUR_CAR",booking_mode:"PRIVATE"};
 const q=calculate({guests:1,base,bookingMode:"PRIVATE",agencyCosts:45000,paymentFee:5000});
 assert.equal(q.minimum,750000);assert.equal(q.minimumPerGuest,750000);
 assert.throws(()=>calculate({guests:1,base,bookingMode:"PRIVATE",agencyCosts:45000,paymentFee:5000,sellingPrice:749999}),PricingError);
});
test("sharing must be per guest with guaranteed terms and confirmed capacity",()=>{
 const r1={...r("tour",170000,"person",6),item_id:"ISLAND_TOUR_CAR",booking_mode:"SHARING",sharing_guaranteed:1};
 assert.equal(calculate({guests:1,base:r1,bookingMode:"SHARING"}).minimum,270000);
 assert.throws(()=>calculate({guests:1,base:{...r1,sharing_guaranteed:0},bookingMode:"SHARING"}),PricingError);
 assert.throws(()=>calculate({guests:7,base:r1,bookingMode:"SHARING"}),PricingError);
});
test("private snorkeling has real per-booking exclusive boat fee even with one guest",()=>{
 const boat={...r("snork",350000,"person",8),item_id:"SNORKELING_3_SPOTS",booking_mode:"PRIVATE",private_fixed_net:900000};
 const q=calculate({guests:1,base:boat,bookingMode:"PRIVATE",agencyCosts:15000,paymentFee:5000});
 assert.equal(q.net,1250000);assert.equal(q.minimum,1370000);
 assert.equal(q.lines.find(x=>x.kind==="PRIVATE_EXCLUSIVE_FIXED").unit_net,900000);
 assert.throws(()=>calculate({guests:1,base:{...boat,private_fixed_net:0},bookingMode:"PRIVATE"}),PricingError);
});
test("private mode quote cannot accidentally use sharing operator rate",()=>{
 const base={...r("snork",350000,"person",8),item_id:"SNORKELING_3_SPOTS",booking_mode:"SHARING",sharing_guaranteed:1};
 assert.throws(()=>calculate({guests:1,base,bookingMode:"PRIVATE"}),PricingError);
});
