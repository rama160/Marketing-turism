// Recover failed CMS images, without replacing saved originals or mislabeling another destination.
const photoMirror="https://raw.githubusercontent.com/rama160/Marketing-turism/main/public/photos/";
function recoverPhoto(img){
 if(!(img instanceof HTMLImageElement))return;
 const current=new URL(img.currentSrc||img.src,location.href);
 const phase=img.dataset.photoFallbackStage||"";
 if(/^\/photos\/(?:website|owner|research)\/[0-9a-f-]{36}$/.test(current.pathname)){
  if(phase!=="retry"){
   img.dataset.photoFallbackStage="retry";
   const retry=new URL(current);retry.searchParams.set("retry","1");img.src=retry.href;return;
  }
  if(img.dataset.localPhotoFailed!=="1"){
   img.dataset.localPhotoFailed="1";
   img.alt+=" — "+(document.documentElement.lang==="en"?"photo temporarily unavailable":"foto sementara tidak tersedia");
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
  img.src="/photos/"+slug+".jpg?v=5";return;
 }
 if(phase==="asset"){
  img.dataset.photoFallbackStage="github";img.src=photoMirror+slug+".jpg";return;
 }
 if(phase==="github"&&img.dataset.localPhotoFailed!=="1"){
  img.dataset.localPhotoFailed="1";img.alt+=" — "+(document.documentElement.lang==="en"?"photo temporarily unavailable":"foto sementara tidak tersedia");img.src="/photo-unavailable.svg?v=5";
 }
}
document.addEventListener("error",event=>recoverPhoto(event.target),true);
// A fast failed request can precede a deferred listener, so check completed broken images once.
for(const img of document.images)if(img.complete&&img.naturalWidth===0&&img.getAttribute("src"))recoverPhoto(img);
