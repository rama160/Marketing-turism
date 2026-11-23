// Public-only CMS enhancements: no admin token, no operator rates and no guest personal data.
const el=(tag,klass,text)=>{const n=document.createElement(tag);if(klass)n.className=klass;if(text!==undefined)n.textContent=text;return n;};
let publicActivities=[];
const currentLanguage=()=>window.NusaLanguage?.language||document.documentElement.lang||"id";
async function loadWebsitePublic(){
 try{
  const [photos,activities]=await Promise.all([
   fetch("/api/public/website/slots",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("photos");return r.json()}),
   fetch("/api/public/website/activities",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("activities");return r.json()})
  ]);
  const slots=new Map((photos.items||[]).map(x=>[x.slot,x]));
  document.querySelectorAll("img[data-npe-slot]").forEach(img=>{
   const slot=slots.get(img.dataset.npeSlot);
   if(!slot)return;
   img.src=slot.url;
   img.alt=currentLanguage()==="en"?slot.alt_en:slot.alt_id;
   img.removeAttribute("data-photo-slug");
  });
  publicActivities=activities.items||[];
  drawPublicActivities();
 }catch(_){/* Existing hand-authored pages remain completely usable. */}
}
function drawPublicActivities(){
 const root=document.querySelector("#packages .cards");
 if(!root)return;
 root.querySelectorAll("[data-npe-dynamic-activity]").forEach(node=>node.remove());
 const lang=currentLanguage()==="en"?"en":"id";
 for(const activity of publicActivities){
  if(!activity.photo_url)continue;
  const card=el("article","package ocean");card.setAttribute("data-npe-dynamic-activity",activity.id);
  const art=el("div","packageArt");
  const img=el("img","package-cover-image");img.src=activity.photo_url;img.loading="lazy";img.decoding="async";
  img.alt=activity["title_"+lang];art.appendChild(img);
  art.appendChild(el("span","",activity.category.replaceAll("_"," ")));
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
window.addEventListener("npe:language",()=>{
 const lang=currentLanguage()==="en"?"en":"id";
 document.querySelectorAll("img[data-npe-slot]").forEach(img=>{
  // Updates existing selected image alt text in the new language without fetching API again.
  const row=window.__npeWebsiteSlots?.get(img.dataset.npeSlot);
  if(row)img.alt=lang==="en"?row.alt_en:row.alt_id;
 });
 drawPublicActivities();
});
loadWebsitePublic();
