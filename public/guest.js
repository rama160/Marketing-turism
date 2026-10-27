// Guest-only website code. No dashboard token, admin routes or privileged UI.
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
function initPublicGuestForm(){
 const form=$("#leadForm");if(!form)return;
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
  body.guests=Number(body.guests);body.consent=form.elements.consent.checked;body.website=body.website||"";
  submit.disabled=true;
  try{
   const result=await publicAPI("leads","POST",body);
   say("#leadFeedback","Permintaan diterima. Nomor referensi: "+result.reference+" · belum merupakan konfirmasi booking.",true);
   form.reset();updateGuestVariants();
   window.turnstile?.reset?.();
  }catch(e){say("#leadFeedback",e.message+" — Silakan hubungi agen melalui WhatsApp resmi.");window.turnstile?.reset?.();}
  finally{submit.disabled=false;}
 });
}
initPublicGuestForm();
// Existing agent PWA installations previously used "/" as their start_url;
// bring standalone owners straight to the dedicated dashboard without changing ordinary guest browsing.
if(window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone===true){
 location.replace("/dashboard.html");
}
if("serviceWorker" in navigator)navigator.serviceWorker.register("/service-worker.js").catch(()=>{});
