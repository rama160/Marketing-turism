import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const code=readFileSync("public/analytics.js","utf8");
function fixture(initial=null,path="/"){
 const events={},scripts=[],buttons=[],store=new Map(initial?[["npe_analytics_choice_v1",initial]]:[]);
 const el=tag=>({tag,children:[],addEventListener(type,fn){this[type]=fn;},setAttribute(){},append(...nodes){this.children.push(...nodes);if(tag==="head")scripts.push(...nodes);},focus(){}});
 const document={head:el("head"),body:el("body"),documentElement:{lang:"en"},referrer:"https://www.google.com/search?q=private",cookie:"",createElement(tag){const a=el(tag);if(tag==="button")buttons.push(a);return a;},querySelector(){return null;},addEventListener(k,v){events[k]=v;}};
 const location=new URL("https://nusapenidaexperiences.com"+path+"?email=private%40example.com&utm_source=google");location.reload=()=>{};
 const window={matchMedia:()=>({matches:false})};
 vm.runInNewContext(code,{document,location,window,navigator:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},URL,Set,Date,Object});
 return {window,events,scripts,buttons,store};
}
test("GA4 loads only after affirmative consent and omits form and URL query data",()=>{
 const a=fixture();assert.equal(a.scripts.length,0);a.window.npeAnalytics.lead("PRIVATE_CONTACT");assert.equal(a.window.dataLayer,undefined);
 a.buttons[0].click();assert.equal(a.scripts.length,1);assert.match(a.scripts[0].src,/G-5232NFPSPV$/);
 a.window.npeAnalytics.lead("SNORKELING_3_SPOTS");
 a.events.click({target:{closest:()=>({href:"https://wa.me/628561752525?text=private"})}});
 const out=JSON.stringify(a.window.dataLayer);assert.match(out,/generate_lead/);assert.match(out,/whatsapp_click/);assert.doesNotMatch(out,/private|example\.com|wa\.me|email=/);
 a.buttons[1].click();assert.equal(a.window["ga-disable-G-5232NFPSPV"],true);
});
test("decline and dashboard do not load GA4",()=>{
 const a=fixture("no");assert.equal(a.scripts.length,0);
 const b=fixture("yes","/dashboard.html");assert.equal(b.scripts.length,0);assert.equal(b.window.npeAnalytics,undefined);
});