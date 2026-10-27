import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=p=>readFileSync(new URL("../public/"+p,import.meta.url),"utf8");

test("guest tourism homepage does not expose agent dashboard links, forms or admin JS",()=>{
 const page=file("index.html"),guest=file("guest.js");
 for(const term of ["id=\"adminToggle\"","id=\"adminArea\"","id=\"adminContent\"","id=\"cmsPublish\"","id=\"tab-growth\"","id=\"adminToken\"","Dashboard agen","src=\"/app.js\""]){
  assert.ok(!page.includes(term),"Guest site accidentally exposed "+term);
 }
 assert.ok(page.includes('id="leadForm"'));
 assert.ok(page.includes('src="/guest.js"'));
 assert.ok(page.includes('src="/language.js"'));
 assert.ok(page.includes('data-action="lead_enquiry"'));
 assert.match(guest,/publicAPI\("leads","POST"/);
 assert.match(guest,/publicAPI\("readiness"\)/);
 assert.match(guest,/location\.replace\("\/dashboard\.html"\)/);
 assert.match(guest,/searchParams\.get\("view"\)!=="website"/);
 assert.doesNotMatch(guest,/ADMIN_TOKEN|tourAdmin|\/api\/admin\/|admin\/growth/);
});

test("owner dashboard loads directly, without embedded guest form; all major operational modules remain",()=>{
 const page=file("dashboard.html"),script=file("app.js"),styles=file("dashboard.css");
 assert.match(page,/<meta name="robots" content="noindex, nofollow">/);
 assert.ok(page.includes('id="adminArea"'));
 assert.ok(!page.includes('id="adminArea" hidden'));
 assert.ok(page.includes('id="unlockPanel"'));
 assert.ok(page.includes('id="adminContent" hidden'));
 for(const tab of ["summary","business","operators","rates","leads","quotes","bookings","finance","website","marketing","growth","campaigns","market","whatsapp"]){
  assert.ok(page.includes('data-tab="'+tab+'"'),"Missing nav "+tab);
  assert.ok(page.includes('id="tab-'+tab+'"'),"Missing section "+tab);
 }
 for(const id of ["growthGroupForm","growthGroupQuestionForm","cmsPublish","waSendApproved","quickSave","dashMenuToggle","dashNavigation","dashCurrentPage"]){
  assert.ok(page.includes('id="'+id+'"'),"Missing UI "+id);
 }
 assert.ok(page.includes('href="/?view=website"'));
 assert.ok(page.includes('Lihat Website'));
 assert.ok(page.includes('src="/app.js"'));
 assert.ok(!page.includes('id="leadForm"'));
 assert.ok(!page.includes('class="hero premiumHero"'));
 assert.match(script,/sessionStorage\.setItem\("npe-dashboard-tab",name\)/);
 assert.match(script,/sessionStorage\.setItem\("tourAdmin",token\)/);
 assert.match(script,/sessionStorage\.removeItem\("tourAdmin"\)/);
 assert.doesNotMatch(script,/adminToggle|leadForm|publicReadiness|leadDate/);
 assert.match(styles,/@media\(max-width:900px\)/);
 assert.match(styles,/\.dashMobileToolbar/);
});

test("Android installed agent goes to dashboard; public service worker never caches admin or API data",()=>{
 const manifest=JSON.parse(file("manifest.webmanifest"));
 const sw=file("service-worker.js");
 assert.equal(manifest.start_url,"/dashboard.html");
 assert.ok(manifest.name.includes("Agent Dashboard"));
 assert.ok(sw.includes("/guest.js"));
 assert.ok(!sw.includes('"/app.js"'));
 assert.ok(!sw.includes('"/dashboard.html"'));
 assert.ok(!sw.includes('"/api/'));
 assert.ok(sw.includes("marketing-turism-public-v26"));
});

test("separating website does not change critical routes, operator prices, or manual approvals",()=>{
 const worker=readFileSync(new URL("../src/worker.mjs",import.meta.url),"utf8");
 assert.ok(worker.includes('version:"3.15.0"'));
 for(const route of ["/api/public/readiness","/api/public/leads","/api/admin/growth","/api/admin/whatsapp","/api/admin/quotes","/api/admin/bookings"]){
  assert.ok(worker.includes(route),"Lost route "+route);
 }
 assert.ok(worker.includes("owner(req,env)"));
 assert.ok(file("dashboard.html").includes("Keluar"));
 const publicPage=file("index.html");
 assert.ok(publicPage.includes("https://wa.me/628561752525"));
 assert.ok(publicPage.includes("Kebijakan Pembatalan"));
});
