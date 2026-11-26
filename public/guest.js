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
async function publicAPI(path,method="GET",body){
 const response=await fetch("/api/public/"+path,{method,headers:{accept:"application/json",...(body===undefined?{}:{"content-type":"application/json"})},body:body===undefined?undefined:JSON.stringify(body),credentials:"omit",cache:"no-store"});
 const value=await response.json().catch(()=>({error:"Layanan belum tersedia"}));
 if(!response.ok)throw Error(value.error||"Server "+response.status);
 return value;
}
// Delay the third-party challenge until the enquiry form is actually needed.
function prepareGuestChallenge(form){
 const widget=form.querySelector(".cf-turnstile");
 if(!widget)return {ensure:()=>{},reset:()=>{}};
 let pending=false,widgetId=null,observer=null;
 const message=(en,id)=>say("#reviewFeedback",document.documentElement.lang==="en"?en:id);
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
     callback:()=>message("Verification complete. You can submit your review.","Verifikasi selesai. Anda dapat mengirim ulasan."),
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
const locale=()=>document.documentElement.lang==="en"?"en":"id";
const tr=(id,en)=>locale()==="en"?en:id;
const labels={WEST:"Nusa Penida West Tour",EAST:"Nusa Penida East Tour",SNORKELING:"Snorkeling 3 Spots",LEMBONGAN:"Nusa Lembongan Island Tour",FAST_BOAT:"Fast Boat Tickets",OTHER:"Other / Lainnya"};
let reviewOffset=0,reviewLoading=false,reviewItems=[],reviewError=false;
function drawReviews(){
 const list=$("#reviewList");if(!list)return;
 list.replaceChildren();
 for(const row of reviewItems){
  const card=document.createElement("article");card.className="panel npeReviewCard";
  const name=document.createElement("strong");name.textContent=row.name;
  const stars=document.createElement("p");stars.className="npeReviewStars";stars.textContent="★".repeat(row.rating)+"☆".repeat(5-row.rating)+" "+row.rating+"/5";
  const label=document.createElement("small");label.textContent=(labels[row.service]||"")+" · "+String(row.created_at||"").slice(0,10);
  const body=document.createElement("p");body.textContent=row.body;
  card.append(name,stars,label,body);list.append(card);
 }
 $("#reviewListStatus").textContent=reviewError?tr("Ulasan belum dapat dimuat.","Reviews could not be loaded."):reviewItems.length?"":tr("Belum ada ulasan yang ditampilkan.","No reviews displayed yet.");
}
async function loadReviews(reset=true){
 if(reviewLoading)return;reviewLoading=true;
 try{
  const result=await publicAPI("reviews?offset="+(reset?0:reviewOffset));
  reviewItems=reset?result.items:reviewItems.concat(result.items);reviewOffset=result.next_offset;reviewError=false;
  $("#reviewMore").hidden=reviewOffset===null;
 }catch{reviewError=true;if(reset)reviewItems=[];}
 finally{reviewLoading=false;drawReviews();}
}
function initPublicReviewForm(){
 const form=$("#reviewForm");if(!form)return;
 const challenge=prepareGuestChallenge(form);
 $("#reviewMore").onclick=()=>void loadReviews(false);
 window.addEventListener("npe:language",drawReviews);
 window.addEventListener("pageshow",()=>void loadReviews());
 void loadReviews();
 const contact=$("#publicBusinessContact");
 if(contact)void publicAPI("readiness").then(r=>{contact.textContent=[r.business_name,r.business_contact].filter(Boolean).join(" · ");}).catch(()=>{});
 form.addEventListener("submit",async event=>{
  event.preventDefault();const submit=$("#reviewSubmit");
  if(submit.disabled)return;
  const body=Object.fromEntries(new FormData(form));
  if(!body["cf-turnstile-response"]){challenge.ensure();say("#reviewFeedback",tr("Lengkapi verifikasi anti-bot terlebih dahulu.","Please complete anti-bot verification first."));return;}
  body.rating=Number(body.rating);body.consent=form.elements.consent.checked;body.completed=form.elements.completed.checked;
  submit.disabled=true;
  try{
   await publicAPI("reviews","POST",body);
   form.reset();challenge.reset();await loadReviews();
   say("#reviewFeedback",tr("Terima kasih! Ulasan Anda telah diterbitkan.","Thank you! Your review has been published."),true);
  }catch(e){say("#reviewFeedback",e.message);challenge.reset();}
  finally{submit.disabled=false;}
 });
}
initPublicReviewForm();
// Public browsing does not register the owner dashboard service worker.
