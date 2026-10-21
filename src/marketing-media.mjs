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
