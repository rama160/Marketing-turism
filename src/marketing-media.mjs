// Canonical marketing reuse of vetted gallery photographs and their legal credits.
// Asset metadata remains owned by public/photos/manifest.json, never copied into captions.
import photoManifest from "../public/photos/manifest.json" with {type:"json"};
const photoSlugs=Object.freeze(["kelingking","manta-bay","diamond-beach","broken-beach","manta-point","crystal-bay","gamat-bay"]);
const gallery=new Map(photoManifest.photos.map(p=>[p.slug,p]));
export function marketingMediaForIdea(index){
 if(!Number.isInteger(index)||index<0||index>=photoSlugs.length)throw Error("Unsupported campaign image");
 const slug=photoSlugs[index],photo=gallery.get(slug);
 if(!photo||!/^CC BY-SA (3\.0|4\.0)$/.test(photo.license)||!photo.author||!photo.source.startsWith("https://commons.wikimedia.org/wiki/File:"))throw Error("Unverified photo licence");
 return {
  slug, url:"https://raw.githubusercontent.com/rama160/Marketing-turism/main/public/photos/"+slug+".jpg",
  credit:photo.author, license:photo.license, source:photo.source,
  license_url:"https://creativecommons.org/licenses/by-sa/"+photo.license.slice(-3)+"/"
 };
}

const campaignSlugs=Object.freeze({
 SNORKELING_3_SPOTS:["manta-bay","manta-point","gamat-bay"],
 ISLAND_TOUR_CAR:["kelingking","diamond-beach","broken-beach","crystal-bay","atuh-beach","tree-house"]
});
export function campaignPhotoBySlug(slug){
 const photo=gallery.get(slug);
 if(!photo||!Object.values(campaignSlugs).some(slugs=>slugs.includes(slug))||
  !/^CC BY-SA (3\\.0|4\\.0)$/.test(photo.license)||!photo.author||
  !photo.source.startsWith("https://commons.wikimedia.org/wiki/File:"))throw Error("Invalid licensed campaign image");
 return {slug,url:"/photos/"+slug,credit:photo.author,license:photo.license,
  source:photo.source,alt:photo.filename.replace(/\\.jpg$/i,""),is_illustrative:slug==="gamat-bay"};
}
// Reuse canonical vetted gallery assets; a rejected revision always changes image.
export function campaignPhotoForDraft(activity,caption,previousSlug=null,round=0){
 const options=campaignSlugs[activity];
 if(!options)throw Error("Unknown campaign activity");
 let preferred=options[0];
 const text=String(caption||"").toLowerCase();
 if(activity==="ISLAND_TOUR_CAR"){
  if(/diamond|atuh|timur|east/.test(text))preferred="diamond-beach";
  else if(/broken/.test(text))preferred="broken-beach";
  else if(/crystal/.test(text))preferred="crystal-bay";
 }else if(/manta point/.test(text))preferred="manta-point";
 const start=options.indexOf(preferred);
 let slug=options[(start+round)%options.length];
 if(slug===previousSlug)slug=options[(options.indexOf(slug)+1)%options.length];
 return campaignPhotoBySlug(slug);
}
