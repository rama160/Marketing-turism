import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=p=>readFileSync(new URL("../public/"+p,import.meta.url),"utf8");

test("guest tourism homepage does not expose agent dashboard links, forms or admin JS",()=>{
 const page=file("index.html"),guest=file("guest.js");
 for(const term of ["id=\"adminToggle\"","id=\"adminArea\"","id=\"adminContent\"","id=\"cmsPublish\"","id=\"tab-growth\"","id=\"adminToken\"","Dashboard agen","src=\"/app.js\""]){
  assert.ok(!page.includes(term),"Guest site accidentally exposed "+term);
 }
 assert.ok(!page.includes('id="leadForm"'));
 assert.ok(page.includes('id="reviewForm"'));
 assert.ok(page.includes('src="/guest.js"'));
 assert.ok(page.includes('src="/language.js"'));
 assert.ok(page.includes('data-action="customer_review"'));
 assert.match(guest,/publicAPI\("reviews","POST"/);
 assert.match(guest,/publicAPI\("readiness"\)/);
 assert.doesNotMatch(guest,/location\.replace\("\/dashboard\.html"\)/);
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
 assert.equal((page.match(/Lihat Website/g)||[]).length,1,"Dashboard must show exactly one website link");
 for(const group of ["home","sales","content","growth","analytics","settings"]){
  assert.ok(page.includes('data-workspace="'+group+'"'),"Workspace missing "+group);
 }
 assert.ok(page.includes('id="dashWorkspaces"'));
 assert.ok(page.includes('class="dashBottomNav"'));
 assert.ok(page.includes('id="dashPriorities"'));
 assert.ok(page.includes('id="tab-analytics"'));
 assert.ok(page.includes('id="dashAnalyticsStats"'));
 for(const name of ["growth","campaigns","whatsapp","operators","rates","quotes","market","marketing"]){
  assert.ok(script.includes(name+':["')||script.includes(name+':["'),"Missing compact subpage configuration for "+name);
 }
 assert.ok(page.includes('id="cmsWebsiteNav"')&&page.includes('data-cms-view="published"'),"Website has its own Published-first navigator");
 assert.ok(script.includes('split.classList.add("dashCompactSplit")'),"Required forms need compact split navigation");
 assert.ok(script.includes("container.appendChild(wrap)"),"Original form elements must be moved, not replaced");
 assert.ok(script.includes('wrappers.forEach((el,i)=>el.hidden=i!==index)'),"Only selected subpage should be visible");
 assert.ok(page.indexOf('class="dashBottomNav"')>page.indexOf('id="adminContent" hidden'),"Mobile workspace must be owner-only");
  assert.ok(page.includes('id="growthGroupsReload"'),"Saved groups reload control missing");
 assert.ok(page.includes('id="growthGroupCount"'),"Saved group count missing");
 assert.ok(script.includes('loadSavedFacebookGroups'),"Standalone saved group listing missing");
 assert.ok(script.includes('result.saved'),"Group write must require persistence confirmation");
 assert.ok(script.includes('const groups=await loadSavedFacebookGroups()'),"Group list must verify server state");
 assert.match(script,/function initCompactPanels/);
 assert.match(script,/loadDashboardAnalytics/);
 assert.match(script,/sessionStorage\.setItem\("npe-dashboard-pane:/);
 assert.ok(styles.includes(".dashCompactShortcuts"));
 assert.ok(styles.includes(".dashPaneNav"));
 assert.ok(page.includes('src="/app.js?v=3.36.0&amp;rev=seo006c-competitors1"'));
 assert.ok(!page.includes('id="leadForm"'));
 assert.ok(!page.includes('class="hero premiumHero"'));
 assert.match(script,/sessionStorage\.setItem\("npe-dashboard-tab",name\)/);
 assert.match(script,/api\("admin\/session\/login","POST"/);
 assert.match(script,/api\("admin\/session"\)/);
 assert.match(script,/api\("admin\/session\/logout","POST"/);
 assert.doesNotMatch(script,/sessionStorage\.setItem\("tourAdmin"/);
 assert.match(script,/sessionStorage\.removeItem\("tourAdmin"\)/);
 assert.doesNotMatch(script,/adminToggle|leadForm|publicReadiness|leadDate/);
 assert.match(styles,/@media\(max-width:900px\)/);
 assert.match(styles,/\.dashMobileToolbar/);
});

test("Android installed agent goes to dashboard; public service worker never caches admin or API data",()=>{
 const manifest=JSON.parse(file("manifest.webmanifest"));
 const sw=file("service-worker.js");
 assert.equal(manifest.start_url,"/dashboard.html");
 assert.equal(manifest.id,"/dashboard.html");assert.equal(manifest.scope,"/");assert.equal(manifest.shortcuts,undefined);
 assert.doesNotMatch(sw,/"\/manifest\.webmanifest"/);
 assert.ok(manifest.name.includes("Agent Dashboard"));
 assert.ok(sw.includes("/guest.js"));
 assert.ok(!sw.includes('"/app.js"'));
 assert.ok(!sw.includes('"/dashboard.html"'));
 assert.ok(!sw.includes('"/api/'));
 assert.ok(sw.includes("marketing-turism-public-v36"));
});

test("separating website does not change critical routes, operator prices, or manual approvals",()=>{
 const worker=readFileSync(new URL("../src/worker.mjs",import.meta.url),"utf8");
 assert.ok(worker.includes('version:"3.36.0"'));
 for(const route of ["/api/public/readiness","/api/public/leads","/api/admin/growth","/api/admin/whatsapp","/api/admin/quotes","/api/admin/bookings"]){
  assert.ok(worker.includes(route),"Lost route "+route);
 }
 assert.ok(worker.includes("ownerAuthorized(req,env,db)"));
 assert.ok(file("dashboard.html").includes("Keluar"));
 const publicPage=file("index.html");
 assert.ok(publicPage.includes("https://wa.me/628561752525"));
 assert.match(publicPage,/href="\/cancellation\.html"/);
 assert.match(publicPage,/Kebijakan pembatalan/i);
 assert.doesNotMatch(publicPage,/id="leadForm"/);
});

test("repository release identity and guest assets stay aligned with current production",()=>{
 const pkg=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
 const worker=readFileSync(new URL("../src/worker.mjs",import.meta.url),"utf8");
 const smoke=readFileSync(new URL("../scripts/smoke.mjs",import.meta.url),"utf8");
 const dashboard=file("dashboard.html");
 const sw=file("service-worker.js");
 assert.equal(pkg.version,"3.36.0");
 assert.ok(worker.includes('version:"'+pkg.version+'"'));
 assert.ok(smoke.includes('health.version!=="'+pkg.version+'"'));
 assert.ok(dashboard.includes('/app.js?v='+pkg.version+'&amp;rev=seo006c-competitors1"'));
 assert.ok(dashboard.includes('/dashboard.css?v='+pkg.version+'"'));
 assert.ok(dashboard.includes("NPE STUDIO"));
 assert.ok(dashboard.includes("v3.36"));
 assert.ok(sw.includes("marketing-turism-public-v36"));
 for(const fileName of ["index.html","snorkeling.html","island-tour.html","west-tour.html","east-tour.html"]){
  assert.ok(file(fileName).includes('website-content.js?v='+pkg.version),fileName+" uses stale CMS script");
 }
});

test("public guest script does not install the admin PWA",()=>{
 assert.doesNotMatch(file("guest.js"),/navigator\.serviceWorker\.register\(/);
 assert.match(file("app.js"),/navigator\.serviceWorker\.register\(/);
});
test("guest challenge loads on demand, renders once, and keeps the token gate",async()=>{
 const {runInNewContext}=await import("node:vm");
 const guest=file("guest.js"),page=file("index.html");
 assert.doesNotMatch(page,/<script[^>]*src="https:\/\/challenges\.cloudflare\.com\/turnstile/);
 const source=guest.slice(guest.indexOf("function prepareGuestChallenge("),guest.indexOf("const locale="));
 const listeners={},scripts=[],renders=[],resets=[];
 const widget={dataset:{sitekey:"site",action:"customer_review"}};
 const form={querySelector:()=>widget,addEventListener:(name,fn)=>listeners[name]=fn};
 const window={turnstile:{render:(el,options)=>{renders.push({el,options});return "widget-1";},reset:id=>resets.push(id)}};
 const challenge=runInNewContext(source+"\nprepareGuestChallenge(form)",{form,window,document:{documentElement:{lang:"en"},createElement:()=>({remove(){}}),head:{appendChild:s=>scripts.push(s)}},say(){}});
 assert.equal(scripts.length,0);
 listeners.focusin();listeners.pointerdown();assert.equal(scripts.length,1);
 assert.match(scripts[0].src,/render=explicit$/);
 scripts[0].onload();assert.equal(renders.length,1);assert.equal(renders[0].options.action,"customer_review");
 challenge.ensure();assert.equal(scripts.length,1);challenge.reset();assert.deepEqual(resets,["widget-1"]);
 assert.match(guest,/if\(!body\["cf-turnstile-response"\]\)\{challenge.ensure\(\);/);
 assert.ok(guest.indexOf('if(!body["cf-turnstile-response"])')<guest.indexOf('publicAPI("reviews","POST"'));
});

test("legacy installed owner launch recovers without redirecting public browser or explicit preview",async()=>{
 const {runInNewContext}=await import("node:vm");
 const guest=file("guest.js"),end=guest.indexOf("const $=");
 const source=guest.slice(0,end);
 function launch(standalone,visited,path){
  const redirects=[];
  runInNewContext(source,{URL,window:{matchMedia:()=>({matches:standalone}),location:{href:"https://example.com"+path,replace:u=>redirects.push(u)}},navigator:{},localStorage:{getItem:()=>visited?"1":null}});
  return redirects;
 }
 assert.deepEqual(launch(true,true,"/"),["https://example.com/dashboard.html"]);
 assert.deepEqual(launch(false,true,"/"),[]);
 assert.deepEqual(launch(true,false,"/"),[]);
 assert.deepEqual(launch(true,true,"/?view=website"),[]);
 assert.deepEqual(launch(true,true,"/snorkeling.html"),[]);
 assert.match(file("dashboard.html"),/href="\/\?view=website" target="_blank" rel="noopener noreferrer"/);
});
test("dashboard entry routes return direct private shell, not public homepage",async()=>{
 const {default:worker}=await import("../src/worker.mjs");
 const assets={fetch:async req=>new URL(req.url).pathname==="/__npe_templates/dashboard.txt"?new Response(file("dashboard.html")):new Response("unexpected",{status:404})};
 for(const path of ["/dashboard","/dashboard.html","/dashboard/"]){
  const r=await worker.fetch(new Request("https://nusapenidaexperiences.com"+path),{ASSETS:assets});
  assert.equal(r.status,200);assert.equal(r.headers.get("cache-control"),"no-store");assert.match(r.headers.get("x-robots-tag"),/noindex/);
  const html=await r.text();assert.match(html,/id="adminArea"/);assert.doesNotMatch(html,/id="leadForm"/);
 }
 const legacy=await worker.fetch(new Request("https://marketing-turism-agent.finchat-ai-gateway.workers.dev/dashboard.html"),{ASSETS:assets});
 assert.equal(legacy.status,301);assert.equal(legacy.headers.get("location"),"https://nusapenidaexperiences.com/dashboard.html");
});

test("Google branding disclosure is public, bilingual and linked from owner workspace without exposing admin access",()=>{
 const home=file("index.html"),privacy=file("privacy.html"),terms=file("terms.html"),dash=file("dashboard.html");
 assert.ok(home.includes('id="seo-agent-information"')&&home.includes('href="/privacy.html#google-api-data"')&&home.includes('href="/privacy.html"'));
 assert.ok(home.includes("NPE Studio (NPE SEO Agent)")&&home.includes("does not currently retrieve production data"));
 for(const term of ['id="google-api-data"',"webmasters.readonly","Cloudflare D1","90 hari","Workers AI","Limited Use","mailto:asriramavirgo98@gmail.com","Revocation stops future access","Ads data is not yet stored"])assert.ok(privacy.includes(term),term);
 assert.ok(terms.includes('id="seo-agent-terms"')&&terms.includes('href="/privacy.html#google-api-data"'));
 assert.ok(dash.includes('id="kwGoogleDataNotice"')&&dash.includes('href="/privacy.html#google-api-data"'));
 for(const page of [home,privacy,terms])assert.ok(!page.includes('href="/dashboard.html"'));
});

test("Google brand smoke assertions use already initialized live landing markup",()=>{
 const smoke=readFileSync(new URL("../scripts/smoke.mjs",import.meta.url),"utf8");
 const landing=smoke.indexOf('const landingMarkup=await get("/")');
 const check=smoke.split("\n").find(line=>line.includes('throw Error("Google brand public disclosures missing")'));
 assert.ok(landing>=0&&check&&smoke.indexOf(check)>landing);
 assert.ok(check.includes("!landingMarkup.includes")&&!check.includes("!home.includes"));
 assert.ok(check.includes("privacyTrust.includes")&&check.includes("termsTrust.includes"));
});
