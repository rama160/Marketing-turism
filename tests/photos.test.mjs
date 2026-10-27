import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const manifest=JSON.parse(readFileSync(new URL("../public/photos/manifest.json",import.meta.url),"utf8"));
const imageBytes=(slug)=>readFileSync(new URL("../public/photos/"+slug+".jpg",import.meta.url));
const read=(name)=>readFileSync(new URL("../public/"+name,import.meta.url),"utf8");
test("ten real destination photos have verified JPEG bytes and SHA-256",()=>{
 assert.equal(manifest.photos.length,10);
 const ids=new Set();
 for(const p of manifest.photos){
  assert.ok(!ids.has(p.slug));ids.add(p.slug);
  assert.match(p.slug,/^[a-z-]+$/);
  assert.ok(p.source.startsWith("https://commons.wikimedia.org/wiki/File:"));
  assert.ok(p.author&&p.license);
  const b=imageBytes(p.slug);
  assert.equal(b.length,p.bytes);
  assert.ok(b.length>10000&&b.length<900000);
  assert.equal(b[0],255);assert.equal(b[1],216);
  assert.equal(b.at(-2),255);assert.equal(b.at(-1),217);
  assert.equal(createHash("sha256").update(b).digest("hex"),p.sha256);
 }
});
test("HTML uses same-origin photo gateway and exact Commons author credit",()=>{
 for(const name of ["island-tour.html","west-tour.html","east-tour.html","snorkeling.html"]){
  const html=read(name);
  const matches=[...html.matchAll(/<img[^>]*src="\/photos\/([a-z-]+)(?:\?v=4)?"[^>]*>[\s\S]*?<figcaption>Foto: <a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
  assert.ok(matches.length>=2,"Missing photo credits on "+name);
  for(const [,id,url,credit] of matches){
   const p=manifest.photos.find(x=>x.slug===id);
   assert.ok(p,"Unknown photo "+id);
   assert.equal(url,p.source);
   assert.ok(credit.includes(p.author),"Photo credit mismatch "+id);
  }
 }
});
test("photo loader has direct static GitHub fallback, then truthful placeholder",()=>{
 const loader=read("photo-loader.js");
 assert.match(loader,/raw\.githubusercontent\.com/);assert.match(loader,/photoFallbackStage="asset"/);
 assert.match(loader,/photo-unavailable\.svg/);
 assert.match(loader,/localPhotoFailed/);
 assert.match(read("_headers"),/raw\.githubusercontent\.com/);
 assert.match(read("service-worker.js"),/public-v26/);
});

test("persistent KV photo copy works when both GitHub and Wikimedia are offline",async()=>{
 const {servePhoto}=await import("../src/photos.mjs");
 const input=imageBytes("kelingking");
 const saved=globalThis.fetch;
 const records=new Map(),kv={
  async get(key){return records.get(key)||null;},
  async put(key,value){records.set(key,value);}
 };
 try{
  globalThis.fetch=async()=>new Response(input,{status:200,headers:{"content-type":"image/jpeg"}});
  const request=new Request("https://tour.example/photos/kelingking");
  const initial=await servePhoto(request,{PHOTO_KV:kv});
  assert.equal(initial.status,200);
  assert.equal(initial.headers.get("x-photo-status"),"upstream-ok");
  assert.ok(records.has("v1/kelingking"));
  globalThis.fetch=async()=>{throw new Error("External images blocked");};
  const cached=await servePhoto(request,{PHOTO_KV:kv});
  assert.equal(cached.status,200);
  assert.equal(cached.headers.get("x-photo-status"),"kv-cache");
  const jpeg=new Uint8Array(await cached.arrayBuffer());
  assert.equal(jpeg.length,input.length);
  assert.equal(jpeg[0],255);
 }finally{globalThis.fetch=saved;}
});
test("Cloudflare bundled local photo takes precedence and does not consume KV",async()=>{
 const {servePhoto}=await import("../src/photos.mjs");
 const img=imageBytes("diamond-beach");let called=0;
 const env={
  ASSETS:{async fetch(req){called++;assert.match(req.url,/\/photos\/diamond-beach\.jpg$/);return new Response(img,{status:200,headers:{"content-type":"image/jpeg"}});}},
  PHOTO_KV:{async get(){throw new Error("Should not fetch KV after asset succeeds");}}
 };
 const res=await servePhoto(new Request("https://tour.example/photos/diamond-beach"),env);
 assert.equal(res.status,200);assert.equal(res.headers.get("x-photo-status"),"asset-local");assert.equal(called,1);
});
