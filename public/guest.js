// Guest-only website code. No dashboard token, admin API routes or privileged UI.
// Recover an older owner-app shortcut that opens the home page in standalone mode.
// Ordinary browser visitors and explicit website previews remain on the public website.
(function recoverOwnerLaunch(){
 try{
  const standalone=window.matchMedia?.("(display-mode: standalone)")?.matches||navigator.standalone===true;
  const url=new URL(window.location.href);
  if(standalone&&url.pathname==="/"&&url.searchParams.get("view")!=="website"&&localStorage.getItem("npe-owner-workspace-visited")==="1")
   window.location.replace(new URL("/dashboard.html",url.origin).href);
 }catch(_){}
})();
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const say=(id,message,ok=false)=>{const el=$(id);if(!el)return;el.textContent=message;el.style.color=ok?"#167058":"#a24836"};
const variants={
 SNORKELING_3_SPOTS:{SHARING:[["STANDARD_3_SPOTS","Sharing 3 spot"]],PRIVATE:[["MANTA_BAY","Private 3 spot · Manta Bay"],["MANTA_POINT","Private 3 spot · Manta Point"]]},
 ISLAND_TOUR_CAR:{SHARING:[["WEST","Sharing · Wisata Barat"],["EAST","Sharing · Wisata Timur"]],PRIVATE:[["WEST","Private · Wisata Barat"],["EAST","Private · Wisata Timur"]]}
};
function updateGuestVariants(){
 const form=$("#leadForm"),item=form?.querySelector('[name=activity_id]')?.value,mode=form?.querySelector('[name=booking_mode]')?.value;
 const select=$("#leadVariant");
 if(!form||!select)return;
 const previous=select.value;
 const choices=variants[item]?.[mode]||[];
 select.innerHTML=choices.map(([value,label])=>'<option value="'+esc(value)+'">'+esc(label)+'</option>').join("");
 if(choices.some(([key])=>key===previous))select.value=previous;
 const guests=form.querySelector('[name=guests]'),max=item==="ISLAND_TOUR_CAR"?7:20;
 if(guests){guests.max=String(max);if(Number(guests.value)>max)guests.value=String(max);}
}
async function publicAPI(path,method="GET",body){
 const response=await fetch("/api/public/"+path,{method,headers:{accept:"application/json",...(body===undefined?{}:{"content-type":"application/json"})},body:body===undefined?undefined:JSON.stringify(body),credentials:"omit"});
 const value=await response.json().catch(()=>({error:"Layanan belum tersedia"}));
 if(!response.ok)throw Error(value.error||"Server "+response.status);
 return value;
}
// Delay the third-party challenge until the enquiry form is actually needed.
function prepareGuestChallenge(form){
 const widget=form.querySelector(".cf-turnstile");
 if(!widget)return {ensure:()=>{},reset:()=>{}};
 let pending=false,widgetId=null,observer=null;
 const message=(en,id)=>say("#leadFeedback",document.documentElement.lang==="en"?en:id);
 function ensure(){
  if(pending||widgetId!==null)return;
  observer?.disconnect();
  pending=true;
  const script=document.createElement("script");
  script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async=true;
  const failed=()=>{
   pending=false;script.remove();
   message("Verification could not load. Tap a form field to retry or contact us on WhatsApp.","Verifikasi tidak dapat dimuat. Sentuh kolom formulir untuk mencoba lagi atau hubungi WhatsApp.");
  };
  script.onerror=failed;
  script.onload=()=>{
   try{
    if(!window.turnstile?.render)throw Error("Verification unavailable");
    widgetId=window.turnstile.render(widget,{sitekey:widget.dataset.sitekey,action:widget.dataset.action,
     callback:()=>message("Verification complete. You can send your enquiry.","Verifikasi selesai. Anda dapat mengirim permintaan."),
     "expired-callback":()=>message("Verification expired. Please verify again.","Verifikasi kedaluwarsa. Silakan verifikasi kembali."),
     "error-callback":()=>message("Verification failed. Retry the challenge or contact us on WhatsApp.","Verifikasi gagal. Coba kembali atau hubungi WhatsApp.")});
    pending=false;
   }catch{failed();}
  };
  document.head.appendChild(script);
 }
 form.addEventListener("focusin",ensure);
 form.addEventListener("pointerdown",ensure);
 if("IntersectionObserver" in window){
  observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))ensure();},{rootMargin:"200px"});
  observer.observe(form);
 }
 return {ensure,reset:()=>{if(widgetId!==null)window.turnstile?.reset?.(widgetId);}};
}
function initPublicGuestForm(){
 const form=$("#leadForm");if(!form)return;
 const challenge=prepareGuestChallenge(form);
 form.addEventListener("change",event=>{if(["activity_id","booking_mode"].includes(event.target.name))updateGuestVariants()});
 updateGuestVariants();
 const witaDay=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 $("#leadDate").min=witaDay;
 form.elements.campaign_id.value=(new URL(location.href).searchParams.get("campaign")||"").slice(0,100);
 async function ready(){
  try{
   const response=await publicAPI("readiness");
   $("#leadSubmit").disabled=response.accepting_leads!==true;
   $("#publicBusinessContact").textContent=response.business_contact?
    "Kontak resmi usaha: "+response.business_contact:"Kontak resmi usaha belum dipublikasikan.";
   if(response.accepting_leads===true)say("#leadFeedback","Form siap menerima permintaan. Lengkapi verifikasi anti-bot.",true);
   else say("#leadFeedback","Penerimaan permintaan tamu belum tersedia; gunakan WhatsApp bisnis.");
  }catch{ $("#leadSubmit").disabled=true;say("#leadFeedback","Layanan belum siap menerima permintaan. Gunakan WhatsApp bisnis."); }
 }
 void ready();
 form.addEventListener("submit",async event=>{
  event.preventDefault();const submit=$("#leadSubmit");
  if(submit.disabled)return;
  const body=Object.fromEntries(new FormData(form));
  if(!body["cf-turnstile-response"]){challenge.ensure();say("#leadFeedback",document.documentElement.lang==="en"?"Please complete the anti-bot verification first.":"Lengkapi verifikasi anti-bot terlebih dahulu.");return;}
  body.guests=Number(body.guests);body.consent=form.elements.consent.checked;body.website=body.website||"";
  submit.disabled=true;
  try{
   const result=await publicAPI("leads","POST",body);
   try{window.npeAnalytics?.lead(body.activity_id);}catch(_){}
   say("#leadFeedback","Permintaan diterima. Nomor referensi: "+result.reference+" · belum merupakan konfirmasi booking.",true);
   form.reset();updateGuestVariants();
   challenge.reset();
  }catch(e){say("#leadFeedback",e.message+" — Silakan hubungi agen melalui WhatsApp resmi.");challenge.reset();}
  finally{submit.disabled=false;}
 });
}
initPublicGuestForm();
// The installed app uses manifest.start_url; guest pages never redirect or replace browser history.
// Public browsing does not install/precache the admin PWA on first visit.
// The dedicated dashboard owns its service worker registration.
