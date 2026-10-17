import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const read=file=>readFileSync(new URL("../public/"+file,import.meta.url),"utf8");
test("Turnstile script is permitted by static deployment CSP",()=>{
 const headers=read("_headers");assert.match(headers,/script-src 'self' https:\/\/challenges\.cloudflare\.com/);
 assert.match(headers,/frame-src https:\/\/challenges\.cloudflare\.com/);
});
test("offline shell caches only public resources, not private data",()=>{
 const worker=read("service-worker.js");assert.match(worker,/req\.method!=="GET"/);assert.match(worker,/URLS\.includes\(url\.pathname\)/);
 assert.doesNotMatch(worker,/\/api\/admin\/|\/api\/public\/leads|sessionStorage|ADMIN_TOKEN/);
});
test("PWA install icon exists and manifest links to SVG",()=>{
 const manifest=JSON.parse(read("manifest.webmanifest"));
 assert.equal(manifest.icons[0].src,"/icon.svg");assert.match(read("icon.svg"),/<svg/);
 assert.match(read("app.js"),/serviceWorker\.register/);
});


test("separate public activity pages retain guarded marketing disclosures",()=>{
 const sea=read("snorkeling.html"),island=read("island-tour.html"),home=read("index.html");
 assert.match(sea,/Snorkeling 3 Spot/);
 assert.match(island,/Island Tour/);
 assert.match(sea,/noindex, follow/);
 assert.match(island,/noindex, follow/);
 assert.match(home,/snorkeling\.html/);
 assert.match(home,/island-tour\.html/);
 assert.match(island,/6–7/);
 assert.match(sea,/konfirmasi/);
});
test("public marketing resources never promise unattended booking",()=>{
 const robots=read("robots.txt"),site=read("sitemap.xml"),home=read("index.html");
 assert.match(robots,/Disallow: \/api\//);
 assert.match(site,/snorkeling\.html/);
 assert.match(site,/island-tour\.html/);
 assert.match(home,/noindex, follow/);
 assert.doesNotMatch(home,/BANK_ACCOUNT_NUMBER|api_key|secret_key/);
});
