// Public-only GA4, basic consent mode. No tag/network until affirmative consent.
(()=>{
 "use strict";
 const ID="G-5232NFPSPV",KEY="npe_analytics_choice_v1",path=location.pathname;
 if(location.hostname!=="nusapenidaexperiences.com"||!(/^\/(?:$|(?:index|snorkeling|island-tour|west-tour|east-tour|privacy|terms|cancellation)(?:\.html)?\/?$|en\/tours(?:\/(?:west|east|island|snorkeling))?\/?$|(?:en|id)\/experiences\/[a-z0-9-]+\/?$)/.test(path)))return;
 if((window.matchMedia?.("(display-mode: standalone)")?.matches||navigator.standalone===true)&&path==="/"&&new URL(location.href).searchParams.get("view")!=="website")return;
 let choice=null,started=false;
 try{choice=localStorage.getItem(KEY)}catch(_){}
 const en=()=>document.documentElement.lang==="en";
 const say=(id,eng)=>en()?eng:id;
 const safeReferrer=()=>{try{return document.referrer?new URL(document.referrer).origin+"/":""}catch(_){return ""}};
 const pageLocation=location.origin+path;
 const sources=new Set(["google","bing","facebook","instagram","meta","whatsapp","tiktok","reddit","youtube","newsletter","direct"]);
 const query=new URL(location.href).searchParams;
 const source=String(query.get("utm_source")||"").toLowerCase();
 const medium=String(query.get("utm_medium")||"").toLowerCase();
 const media=new Set(["organic","social","paid_social","cpc","referral","email","qr","none"]);
 const gtag=function(){window.dataLayer.push(arguments)};
 function start(){
  if(started||choice!=="yes")return;
  started=true;
  window["ga-disable-"+ID]=false;
  window.dataLayer=window.dataLayer||[];
  window.gtag=gtag;
  gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
  gtag("consent","update",{analytics_storage:"granted",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
  gtag("js",new Date());
  gtag("config",ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:pageLocation,page_referrer:safeReferrer(),cookie_expires:15552000,cookie_update:false,...(sources.has(source)?{campaign_source:source}:{}),...(media.has(medium)?{campaign_medium:medium}:{})});
  const script=document.createElement("script");script.async=true;script.src="https://www.googletagmanager.com/gtag/js?id="+ID;document.head.append(script);
  gtag("event","page_view",{page_location:pageLocation,page_referrer:safeReferrer(),send_to:ID});
 }
 function event(name,params={}){
  if(choice!=="yes"||!started)return;
  gtag("event",name,{...params,page_location:pageLocation,send_to:ID});
 }
 window.npeAnalytics=Object.freeze({lead(activity){
  const allowed=["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"];
  event("generate_lead",allowed.includes(activity)?{activity_type:activity}:{});
 }});
 document.addEventListener("click",e=>{
  const a=e.target?.closest?.("a");
  if(a&&/^https:\/\/(?:wa\.me\/628561752525|api\.whatsapp\.com\/send)(?:[/?]|$)/.test(a.href))event("whatsapp_click");
 },{capture:true});
 function clearCookies(){
  for(const cookie of document.cookie.split(";")){
   const name=cookie.trim().split("=")[0];
   if(/^_ga(?:_|$)/.test(name))for(const suffix of ["","; domain="+location.hostname,"; domain=."+location.hostname])document.cookie=name+"=; Max-Age=0; path=/; Secure; SameSite=Lax"+suffix;
  }
 }
 function choose(value){
  const wasStarted=started;choice=value;
  try{localStorage.setItem(KEY,value)}catch(_){}
  notice.hidden=true;
  if(value==="yes"){start();return;}
  window["ga-disable-"+ID]=true;
  clearCookies();
  if(wasStarted)location.reload();
 }
 const notice=document.createElement("section");
 notice.className="npeAnalyticsNotice";notice.setAttribute("aria-label","Analytics privacy / Privasi analitik");
 const info=document.createElement("p");info.textContent=say("Izinkan analitik opsional untuk membantu kami meningkatkan website? Anda tetap dapat menggunakan layanan jika menolak.","Allow optional analytics to help improve our website? All services remain available if you decline.");
 const yes=document.createElement("button");yes.type="button";yes.textContent=say("Izinkan","Allow");yes.addEventListener("click",()=>choose("yes"));
 const no=document.createElement("button");no.type="button";no.textContent=say("Tolak","Decline");no.addEventListener("click",()=>choose("no"));
 const privacy=document.createElement("a");privacy.href="/privacy.html";privacy.textContent=say("Privasi","Privacy");
 notice.append(info,yes,no,privacy);notice.hidden=choice==="yes"||choice==="no";document.body.append(notice);
 const settings=document.createElement("button");settings.type="button";settings.className="npeAnalyticsSettings";settings.textContent=say("Pengaturan analitik","Analytics preferences");settings.addEventListener("click",()=>{notice.hidden=false;yes.focus()});
 (document.querySelector("footer")||document.body).append(settings);
 start();
})();