// Cloudflare same-origin -> bundled static asset -> owner-controlled GitHub archive -> clear placeholder.
// A failed image is never left as a blank box. Never fetches secrets, API booking or guest data.
const photoMirror="https://raw.githubusercontent.com/rama160/Marketing-turism/main/public/photos/";
document.addEventListener("error",event=>{
 const img=event.target;
 if(!(img instanceof HTMLImageElement))return;
 const current=new URL(img.currentSrc||img.src,location.href);
 const phase=img.dataset.photoFallbackStage||"";
 if(/^\/photos\/(?:owner|research)\/[0-9a-f-]{36}$/.test(current.pathname)){
  if(img.dataset.localPhotoFailed!=="1"){
   img.dataset.localPhotoFailed="1";
   img.alt+=" — foto sementara tidak tersedia";
   img.src="/photo-unavailable.svg";
  }
  return;
 }
 const parts=current.pathname.match(/^\/photos\/([a-z-]+)(?:\.jpg)?$/);
 const slug=parts?.[1]||img.dataset.photoSlug;
 if(!slug||!/^[a-z-]+$/.test(slug))return;
 img.dataset.photoSlug=slug;
 if(!phase&&current.origin===location.origin){
  img.dataset.photoFallbackStage="asset";
  img.src="/photos/"+slug+".jpg?v=4";
  return;
 }
 if(phase==="asset"){
  img.dataset.photoFallbackStage="github";
  img.src=photoMirror+slug+".jpg";
  return;
 }
 if(phase==="github"&&img.dataset.localPhotoFailed!=="1"){
  img.dataset.localPhotoFailed="1";
  img.alt+=" — foto sementara tidak tersedia";
  img.src="/photo-unavailable.svg?v=4";
 }
},true);
