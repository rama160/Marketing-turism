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
 assert.match(sea,/Snorkeling Nusa Penida.*Manta Bay/);
 assert.match(island,/Island Tour/);
 assert.match(sea,/noindex, follow/);
 assert.match(island,/noindex, follow/);
 assert.match(home,/snorkeling\.html/);
 assert.match(home,/island-tour\.html/);
 assert.match(island,/maksim(?:um|al).*7|6–7/i);
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

test("tour guide distinguishes west/east, uses one full vehicle rather than expected seat fills",()=>{
 const island=read("island-tour.html"),west=read("west-tour.html"),east=read("east-tour.html");
 assert.match(island,/Wisata Barat/);assert.match(island,/Wisata Timur/);assert.match(island,/Rp700.000/);
 assert.match(island,/Rp600.000/);assert.match(island,/mobil penuh/);
 assert.match(west,/Kelingking/);assert.match(west,/Broken Beach/);assert.match(west,/Crystal Bay/);
 assert.match(east,/Diamond Beach/);assert.match(east,/Atuh Beach/);
 assert.doesNotMatch(island,/PENIVARA/);
});
test("all Wikimedia gallery photos credit actual photographers",()=>{
 for(const path of ["snorkeling.html","west-tour.html","east-tour.html"]){const html=read(path);
  const imageCount=(html.match(/<img /g)||[]).length,credits=(html.match(/Wikimedia Commons/g)||[]).length;
  assert.ok(imageCount>=3, path+" missing image gallery");assert.ok(credits>=imageCount,path+" attribution missing");
 }
});

test("official Nusa Penida Experiences branding is consistent across PWA",()=>{const home=read("index.html"),tour=read("island-tour.html"),icon=read("icon.svg");assert.match(home,/NUSA PENIDA/);assert.match(tour,/NUSA PENIDA/);assert.match(icon,/>NP</);assert.doesNotMatch(home,/PENIVARA/)});

test("gallery CSP allows only Wikimedia Commons and upload thumbnail hosts, plus local site assets",()=>{
 const policy=read("_headers");
 assert.match(policy,/img-src 'self' data: https:\/\/commons\.wikimedia\.org https:\/\/upload\.wikimedia\.org/);
 for(const page of ["index.html","island-tour.html","west-tour.html","east-tour.html","snorkeling.html"]){
  const content=read(page);
  const srcs=[...content.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(x=>x[1]);
  assert.ok(srcs.length>0, "Expected destination photos on "+page);
  for(const src of srcs)assert.match(src,/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
 }
});
