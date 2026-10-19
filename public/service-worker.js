// Static public assets only. Never cache API/guest/admin data or payment responses.
const CACHE="marketing-turism-public-v11";
const URLS=["/","/index.html","/styles.css","/app.js","/language.js","/manifest.webmanifest","/icon.svg","/photo-loader.js","/photo-unavailable.svg","/privacy.html","/terms.html","/cancellation.html","/snorkeling.html","/island-tour.html","/robots.txt","/sitemap.xml","/west-tour.html","/east-tour.html"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(URLS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=="GET"||url.origin!==self.location.origin||!URLS.includes(url.pathname))return;
 event.respondWith(fetch(req).then(async response=>{if(response.ok){const cache=await caches.open(CACHE);await cache.put(req,response.clone());}return response;}).catch(async()=>await caches.match(req)||Response.error()));
});
