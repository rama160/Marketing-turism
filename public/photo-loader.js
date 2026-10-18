// Progressive photo recovery without inline scripts (compatible with strict Content Security Policy).
document.addEventListener("error", event => {
 const image=event.target;
 if(!(image instanceof HTMLImageElement) || image.dataset.localPhotoFailed==="1")return;
 const url=new URL(image.currentSrc||image.src,location.href);
 if(url.origin!==location.origin || !url.pathname.startsWith("/photos/"))return;
 image.dataset.localPhotoFailed="1";
 image.alt += " — foto sementara tidak tersedia";
 image.src="/photo-unavailable.svg";
},true);
