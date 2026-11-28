import {LAYOUT_PREFIX,readOrder,orderedKeys,activityKey} from "./content-order.mjs";
// Public-only CMS enhancements: no admin token, no operator rates and no guest personal data.
const el=(tag,klass,text)=>{const n=document.createElement(tag);if(klass)n.className=klass;if(text!==undefined)n.textContent=text;return n;};
let publicActivities=[],layoutCopy={};
function responsiveSource(img,url){
 if(!/^\/photos\/(?:website\/[0-9a-f]{8}-[0-9a-f-]{27,36}|[a-z-]+)$/.test(url))return;
 img.sizes=img.sizes||"(max-width: 700px) 100vw, 50vw";
 img.srcset=[240,480,800,1200].map(w=>url+"?npew="+w+" "+w+"w").join(", ");
}
const currentLanguage=()=>window.NusaLanguage?.language||document.documentElement.lang||"id";
function appendPublicPrice(cover,activity,lang){
 const label=activity.price_verified&&activity["price_label_"+lang];
 if(label)cover.appendChild(el("span","price-preview",label));
}
async function loadWebsitePhotos(){
 try{
  const response=await fetch("/api/public/website/slots",{cache:"no-store"});
  if(!response.ok)throw Error("photos");
  const photos=await response.json();
  const slots=new Map((photos.items||[]).map(x=>[x.slot,x]));
  window.__npeWebsiteSlots=slots;
  document.querySelectorAll("img[data-npe-slot]").forEach(img=>{
   const slot=slots.get(img.dataset.npeSlot);
   if(!slot)return;
   const alreadyRendered=img.getAttribute?.("src")===slot.url&&img.dataset.npeRenderedPhoto==="true";
   if(alreadyRendered){img.alt=currentLanguage()==="en"?slot.alt_en:slot.alt_id;return;}
   if(img.getAttribute?.("src")===slot.url&&img.naturalWidth>0)return;
   img.removeAttribute("data-photo-slug");
   // Prevent an earlier fallback attempt for the original image from leaking into the replacement.
   delete img.dataset.photoFallbackStage;
   delete img.dataset.localPhotoFailed;
   img.alt=currentLanguage()==="en"?slot.alt_en:slot.alt_id;
   responsiveSource(img,slot.url);
   img.src=slot.url;
   // Original Wikimedia attribution must not be displayed for a different owner-uploaded image.
   const caption=img.closest("figure")?.querySelector("figcaption");
   if(caption){caption.dataset.npeOwnerPhoto="true";caption.textContent=currentLanguage()==="en"
    ?"Photo supplied to Nusa Penida Experiences; owner confirmed usage rights."
    :"Foto disediakan untuk Nusa Penida Experiences; pemilik mengonfirmasi hak penggunaan.";} 
  });
  markHomepagePhotoCredits();
 }catch(_){/* Failed photo override must not prevent displaying published activities. */}
}
function markHomepagePhotoCredits(){
 const slots=window.__npeWebsiteSlots;
 if(!slots)return;
 const en=currentLanguage()==="en";
 document.querySelectorAll(".spot-showcase").forEach(card=>{
  if(!Array.from(card.querySelectorAll("img[data-npe-slot]")).some(img=>slots.has(img.dataset.npeSlot)))return;
  const credits=card.querySelector(".photo-credits");
  if(!credits)return;
  let note=credits.querySelector("[data-npe-credit-note]");
  if(!note){note=el("span","");note.setAttribute("data-npe-credit-note","");credits.appendChild(note);}
  note.textContent=en?" · Credits above refer to original images only; replacements are supplied to Nusa Penida Experiences.":" · Kredit di atas hanya untuk foto asli; foto pengganti disediakan untuk Nusa Penida Experiences.";
 });
}
async function loadWebsiteActivities(){
 try{
  const response=await fetch("/api/public/website/activities",{cache:"no-store"});
  if(!response.ok)throw Error("activities");
  const activities=await response.json();
  publicActivities=activities.items||[];
  try{const r=await fetch("/api/public/site-content?lang=id",{cache:"no-store"});if(r.ok)layoutCopy=(await r.json()).items||{};}catch(_){}
  drawPublicActivities();drawPublicDetails();applyPublicLayout();
 }catch(error){console.warn("NPE activities unavailable",error);}
}
function loadWebsitePublic(){return Promise.allSettled([loadWebsitePhotos(),loadWebsiteActivities()]);}
function drawPublicActivities(){
 const root=document.querySelector("#packages .cards");
 if(!root)return;
 root.querySelectorAll("[data-npe-dynamic-activity]").forEach(node=>node.remove());
 const lang=currentLanguage()==="en"?"en":"id";
 for(const activity of publicActivities){
  if(!activity.photo_url||activity.parent_activity)continue;
  const card=el("article","package ocean");card.setAttribute("data-npe-dynamic-activity",activity.id);
  const art=el("div","packageArt");
  const img=el("img","package-cover-image");img.loading="lazy";img.decoding="async";img.width=1200;img.height=675;responsiveSource(img,activity.photo_url);img.src=activity.photo_url;
  img.alt=activity["title_"+lang];art.appendChild(img);
  art.appendChild(el("span","",activity.category.replace(/^CUSTOM:/,"").replaceAll("_"," ")));
  const inner=el("div","packageInner");
  inner.appendChild(el("span","tag",lang==="en"?"Experience":"Aktivitas Wisata"));
  inner.appendChild(el("h3","",activity["title_"+lang]));
  inner.appendChild(el("p","",activity["summary_"+lang]));
  appendPublicPrice(art,activity,lang);
  const a=el("a","textLink",lang==="en"?"View experience →":"Lihat pengalaman →");
  a.href="/"+lang+"/experiences/"+encodeURIComponent(activity.slug);
  inner.appendChild(a);card.append(art,inner);root.appendChild(card);
 }
}
function drawPublicDetails(){
 const staticPaths={"/snorkeling":"static:snorkeling","/island-tour":"static:island","/west-tour":"static:west","/east-tour":"static:east"};
 const section=document.querySelector("[data-npe-detail-parent]");
 const path=location.pathname.replace(/\/+$/,"").replace(/\.html$/i,"");
 const parent=section?.dataset.npeDetailParent||staticPaths[path];
 const root=section?.matches(".scene-grid")?section:section?.querySelector(".scene-grid")||(parent?document.querySelector(".scene-grid"):null);
 if(!parent||!root)return;
 const lang=currentLanguage()==="en"?"en":"id";
 root.querySelectorAll("[data-npe-dynamic-detail]").forEach(n=>n.remove());
 const details=publicActivities.filter(a=>a.parent_activity===parent&&a.photo_url);
 // A static gallery always keeps its original destination cards visible.
 if(section&&!section.matches(".scene-grid"))section.hidden=!details.length;
 for(const a of details){
  const card=el("article","scene-card");card.dataset.npeDynamicDetail=a.id;
  const figure=el("figure","npe-price-cover"),img=el("img");img.loading="lazy";img.decoding="async";img.width=1200;img.height=675;img.alt=a["title_"+lang];responsiveSource(img,a.photo_url);img.src=a.photo_url;
  figure.append(img);appendPublicPrice(figure,a,lang);const body=el("div","scene-body");
  body.append(el("h2","",a["title_"+lang]),el("p","",a["summary_"+lang]),el("p","",a["description_"+lang]));
  const link=el("a","textLink",lang==="en"?"View details →":"Lihat detail →");link.href="/"+lang+"/experiences/"+encodeURIComponent(a.slug);body.append(link);card.append(figure,body);root.append(card);
 }
}
window.addEventListener("npe:language",()=>{
 const lang=currentLanguage()==="en"?"en":"id";
 document.querySelectorAll("img[data-npe-slot]").forEach(img=>{
  // Updated alt text and owner-upload credits follow the selected language.
  const row=window.__npeWebsiteSlots?.get(img.dataset.npeSlot);
  if(!row)return;
  img.alt=lang==="en"?row.alt_en:row.alt_id;
  const caption=img.closest("figure")?.querySelector("figcaption[data-npe-owner-photo]");
  if(caption)caption.textContent=lang==="en"
   ?"Photo supplied to Nusa Penida Experiences; owner confirmed usage rights."
   :"Foto disediakan untuk Nusa Penida Experiences; pemilik mengonfirmasi hak penggunaan.";
 });
 markHomepagePhotoCredits();drawPublicActivities();drawPublicDetails();applyPublicLayout();
});

function sortPublicChildren(root,group,keyFor){
 if(!root)return;
 const cfg=readOrder(layoutCopy,group);
 // Preserve default markup/order when no owner configuration exists.
 if(!cfg.order.length&&!cfg.hidden.length)return;
 const nodes=[...root.children].filter(n=>keyFor(n));
 const map=new Map(nodes.map(n=>[keyFor(n),n]));
 for(const k of orderedKeys([...map.keys()],cfg)){const n=map.get(k);n.hidden=cfg.hidden.includes(k);root.append(n);}
}
function addPublicRegionCards(){
 const root=document.querySelector("#tour-regions .tour-showcase-grid");if(!root)return;
 root.querySelectorAll("[data-layout-added-region]").forEach(n=>n.remove());
 const cfg=readOrder(layoutCopy,"regions"),lang=currentLanguage()==="en"?"en":"id";
 for(const a of publicActivities.filter(x=>!x.parent_activity&&x.photo_url&&cfg.order.includes(activityKey(x.id))&&!cfg.hidden.includes(activityKey(x.id)))){
  const card=el("article","spot-showcase");card.dataset.layoutAddedRegion=a.id;
  const cover=el("div","spot-cover"),img=el("img","spot-cover-image");img.loading="lazy";img.decoding="async";img.width=1200;img.height=675;img.alt=a["title_"+lang];responsiveSource(img,a.photo_url);img.src=a.photo_url;
  const overlay=el("div","spot-overlay"),text=el("div");text.append(el("h3","",a["title_"+lang]),el("p","",a["summary_"+lang]));
  const link=el("a","spot-link",lang==="en"?"View tour ↗":"Lihat tur ↗");link.href="/"+lang+"/experiences/"+encodeURIComponent(a.slug);overlay.append(text,link);cover.append(img,overlay);
  appendPublicPrice(cover,a,lang);
  card.append(cover);
  const thumbs=el("div","spot-thumbs"),children=publicActivities.filter(x=>x.parent_activity==="activity:"+a.slug&&x.photo_url);
  const detailConfig=readOrder(layoutCopy,"detail:activity:"+a.slug),byKey=new Map(children.map(x=>[activityKey(x.id),x]));
  for(const key of orderedKeys([...byKey.keys()],detailConfig)){
   if(detailConfig.hidden.includes(key))continue;
   const child=byKey.get(key),item=el("a","destination-thumb");item.href="/"+lang+"/experiences/"+encodeURIComponent(child.slug);
   const thumb=el("img");thumb.loading="lazy";thumb.decoding="async";thumb.width=240;thumb.height=135;thumb.alt=child["title_"+lang];thumb.src=child.photo_url+"?npew=240";
   item.append(thumb,el("span","",child["title_"+lang]));thumbs.append(item);
  }
  if(thumbs.children.length)card.append(thumbs);
  card.append(el("small","regionOwnerCredit",lang==="en"?"Photos supplied to Nusa Penida Experiences; usage rights confirmed.":"Foto disediakan untuk Nusa Penida Experiences; hak penggunaan dikonfirmasi."));
  root.append(card);
 }
}
function addPublicThumbs(root,group){
 if(!root)return;
 root.querySelectorAll("[data-layout-added-thumb]").forEach(n=>n.remove());
 const cfg=readOrder(layoutCopy,group),lang=currentLanguage()==="en"?"en":"id";
 for(const a of publicActivities.filter(x=>x.parent_activity==="static:"+group.slice(6)&&x.photo_url&&cfg.order.includes(activityKey(x.id))&&!cfg.hidden.includes(activityKey(x.id)))){
  const item=el("a","destination-thumb");item.dataset.layoutAddedThumb=a.id;item.href="/"+lang+"/experiences/"+encodeURIComponent(a.slug);
  const img=el("img");img.loading="lazy";img.decoding="async";img.width=240;img.height=135;img.alt=a["title_"+lang];img.src=a.photo_url+"?npew=240";
  item.append(img,el("span","",a["title_"+lang]));root.append(item);
 }
}
function applyPublicLayout(){
 sortPublicChildren(document.querySelector("#packages .cards"),"packages",n=>n.dataset.npeDynamicActivity?activityKey(n.dataset.npeDynamicActivity):n.querySelector("img[data-npe-slot]")?.dataset.npeSlot);
 addPublicRegionCards();
 const regions=document.querySelector("#tour-regions .tour-showcase-grid");
 sortPublicChildren(regions,"regions",n=>n.dataset.layoutAddedRegion?activityKey(n.dataset.layoutAddedRegion):n.querySelector("img.spot-cover-image")?.dataset.npeSlot);
 for(const group of ["west","east","snorkeling"]){
  const root=regions?.querySelector("."+ (group==="snorkeling"?"sea":group)+"-showcase .spot-thumbs");if(!root)continue;
  // The repeated Atuh label gets its own stable identity, not a second photo file.
  for(const n of root.children){if(!n.dataset.layoutKey&&!n.dataset.layoutAddedThumb){const key=n.querySelector("img[data-npe-slot]")?.dataset.npeSlot;if(key)n.dataset.layoutKey=n.querySelector('[data-copy="homeThumb.east-atuh-beach-second.title"]')?"east-atuh-beach-second":key;}}
  addPublicThumbs(root,"thumb:"+group);
  sortPublicChildren(root,"thumb:"+group,n=>n.dataset.layoutAddedThumb?activityKey(n.dataset.layoutAddedThumb):n.dataset.layoutKey);
 }
 const staticPaths={"/snorkeling":"static:snorkeling","/island-tour":"static:island","/west-tour":"static:west","/east-tour":"static:east"};
 const section=document.querySelector("[data-npe-detail-parent]"),path=location.pathname.replace(/\/+$/,"").replace(/\.html$/i,"");
 const parent=section?.dataset.npeDetailParent||staticPaths[path];
 if(parent){const root=section?.matches(".scene-grid")?section:section?.querySelector(".scene-grid")||document.querySelector(".scene-grid");sortPublicChildren(root,"detail:"+parent,n=>n.dataset.npeDynamicDetail?activityKey(n.dataset.npeDynamicDetail):n.querySelector("img[data-npe-slot]")?.dataset.npeSlot);}
}
// Native document navigation remains intact. An in-page Back link is available on detail pages,
// including direct entries without a previous NPE page; never expose a dashboard link to guests.
function installPublicBack(){
 const ownerPreview=location.pathname==="/"&&new URL(location.href).searchParams.get("view")==="website";
 if(location.pathname==="/"&&!ownerPreview)return;
 const header=document.querySelector("header.top");if(!header||header.querySelector("[data-npe-back]"))return;
 const a=el("a","npeBackLink",currentLanguage()==="en"?"← Back":"← Kembali");
 a.dataset.npeBack="true";a.href="/";
 let previous=null;try{previous=new URL(document.referrer);}catch(_){}
 const same=previous?.origin===location.origin&&previous.href!==location.href;
 if(same)a.addEventListener("click",event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();history.back();});
 if(!ownerPreview||same)header.append(a);
}
installPublicBack();
window.addEventListener("npe:language",()=>{const a=document.querySelector("[data-npe-back]");if(a)a.textContent=currentLanguage()==="en"?"← Back":"← Kembali";});

loadWebsitePublic();
// Returning from the dashboard via browser history must refresh published details too.
window.addEventListener("pageshow",event=>{if(event.persisted)void loadWebsitePublic();});

// Consent-free aggregate button analytics. Records only source/page counts after a real click.
// Never stores visitor IP, cookies, user messages, phone, or identity and never blocks WhatsApp.
document.addEventListener?.("click",event=>{
 const anchor=event.target?.closest?.("a[data-whatsapp-chat]");
 if(!anchor||!/^https:\/\/wa\.me\/628561752525(?:[/?]|$)/.test(anchor.href))return;
 const params=new URL(location.href).searchParams;
 const slug=v=>String(v??"").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,32);
 const source=slug(params.get("utm_source")||params.get("source")||"direct")||"direct";
 const landing=slug(location.pathname==="/"
  ?"homepage":location.pathname.replace(/^\//,"").replace(/\.html$/,"").replace(/\//g,"_").replace(/-/g,"_"))||"homepage";
 const payload=JSON.stringify({kind:"WHATSAPP",source,landing});
 try{
  const bytes=new Blob([payload],{type:"application/json"});
  if(navigator.sendBeacon?.("/api/public/intent",bytes))return;
  fetch("/api/public/intent",{method:"POST",headers:{"content-type":"application/json"},
   body:payload,keepalive:true,credentials:"omit"}).catch(()=>{});
 }catch(_){}
},{capture:true});

// Accessible photo viewer; delegation also handles CMS destinations added after page load.
function installDestinationViewer(){
 if(typeof HTMLDialogElement==="undefined"||!document.body)return;
 const selector=".scene-card img,.destination-thumb img,.packageArt img,.spot-cover img,.npeExperiencePage figure img,.npe-price-cover img";
 const dialog=el("dialog","npePhotoViewer"),photo=el("img","npeViewerImage"),close=el("button","npeViewerClose","×"),caption=el("p","npeViewerCaption");
 close.type="button";dialog.setAttribute("aria-modal","true");caption.id="npe-photo-caption";dialog.setAttribute("aria-describedby",caption.id);dialog.append(photo,caption,close);document.body.append(dialog);
 let trigger=null;
 const decorate=()=>{const en=currentLanguage()==="en";dialog.setAttribute("aria-label",en?"Destination photo":"Foto destinasi");close.setAttribute("aria-label",en?"Close photo":"Tutup foto");for(const img of document.querySelectorAll(selector)){img.tabIndex=0;img.setAttribute("role","button");img.setAttribute("aria-label",(en?"View photo: ":"Lihat foto: ")+(img.alt||""));img.classList.add("npeZoomable");}};
 const open=img=>{if(dialog.open)return;let url;try{url=new URL(img.getAttribute("src")||img.currentSrc,location.origin);}catch{return;}if(url.origin!==location.origin||!url.pathname.startsWith("/photos/"))return;trigger=img;url.searchParams.delete("npew");photo.src=url.href;photo.alt=img.alt;caption.textContent=img.alt;dialog.showModal();close.focus();};
 close.onclick=()=>dialog.close();dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener("close",()=>{photo.removeAttribute("src");caption.textContent="";if(trigger?.isConnected)trigger.focus({preventScroll:true});trigger=null;});
 document.addEventListener("click",e=>{const img=e.target.closest?.(selector);if(!img)return;e.preventDefault();open(img);});
 document.addEventListener("keydown",e=>{const img=e.target.closest?.(selector);if(img&&(e.key==="Enter"||e.key===" ")){e.preventDefault();open(img);}});
 decorate();new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});window.addEventListener("npe:language",decorate);
}
installDestinationViewer();
