// Public-only CMS enhancements: no admin token, no operator rates and no guest personal data.
const el=(tag,klass,text)=>{const n=document.createElement(tag);if(klass)n.className=klass;if(text!==undefined)n.textContent=text;return n;};
let publicActivities=[];
function responsiveSource(img,url){
 if(!/^\/photos\/(?:website\/[0-9a-f]{8}-[0-9a-f-]{27,36}|[a-z-]+)$/.test(url))return;
 img.sizes=img.sizes||"(max-width: 700px) 100vw, 50vw";
 img.srcset=[240,480,800,1200].map(w=>url+"?npew="+w+" "+w+"w").join(", ");
}
const currentLanguage=()=>window.NusaLanguage?.language||document.documentElement.lang||"id";
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
  drawPublicActivities();drawPublicDetails();
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
  if(activity.price_verified&&activity["price_label_"+lang])inner.appendChild(el("strong","",activity["price_label_"+lang]));
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
  const figure=el("figure"),img=el("img");img.loading="lazy";img.decoding="async";img.width=1200;img.height=675;img.alt=a["title_"+lang];responsiveSource(img,a.photo_url);img.src=a.photo_url;
  figure.append(img);const body=el("div","scene-body");
  body.append(el("h2","",a["title_"+lang]),el("p","",a["summary_"+lang]),el("p","",a["description_"+lang]));
  if(a.price_verified&&a["price_label_"+lang])body.append(el("strong","",a["price_label_"+lang]));
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
 markHomepagePhotoCredits();drawPublicActivities();drawPublicDetails();
});
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
