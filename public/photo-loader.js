// Resilient tourist photo route: Worker -> verified GitHub JPEG -> local unavailable notice.
const photoMirror="https://raw.githubusercontent.com/rama160/Marketing-turism/main/public/photos/";
document.addEventListener("error",event=>{
 const img=event.target;
 if(!(img instanceof HTMLImageElement))return;
 const current=new URL(img.currentSrc||img.src,location.href);
 const phase=img.dataset.photoFallbackStage||"";
 if(!phase&&current.origin===location.origin&&/^\/photos\/[a-z-]+$/.test(current.pathname)){
  img.dataset.photoFallbackStage="github";
  img.src=photoMirror+current.pathname.split("/").pop()+".jpg";
  return;
 }
 if(phase==="github"&&current.hostname==="raw.githubusercontent.com"&&img.dataset.localPhotoFailed!=="1"){
  img.dataset.localPhotoFailed="1";
  img.alt+=" — foto sementara tidak tersedia";
  img.src="/photo-unavailable.svg";
 }
},true);
