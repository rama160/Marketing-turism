// Build deployable public assets AND the read-only editing snapshot from the exact
// same checked-in pages / locale maps shown to guests. No database writes or duplicate copy.
import {mkdir,cp,writeFile,readFile} from "node:fs/promises";
import vm from "node:vm";

const pages=["index.html","snorkeling.html","island-tour.html","west-tour.html","east-tour.html"];
const source=await readFile("public/language.js","utf8");
const localeStart=source.indexOf("const englishHome ="),localeEnd=source.indexOf("const originalNodes=[];");
if(localeStart<0||localeEnd<=localeStart)throw Error("Guest translations moved: update editor snapshot extraction");
const locale=vm.runInNewContext(source.slice(localeStart,localeEnd)+"\n({englishHome,idDefaults,englishText})",
 Object.create(null),{timeout:800});
const decode=text=>text.replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&rsquo;/g,"’").replace(/&ndash;/g,"–");
const plain=html=>decode(html.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim());
const manifest={version:1,generated_by:"scripts/build.mjs",id:{},en:{},photos:{}};
await mkdir("public/__npe_templates",{recursive:true});
for(const page of pages){
 const html=await readFile("public/"+page,"utf8");
 await writeFile("public/__npe_templates/"+page.replace(/\.html$/, ".txt"),html);
 // All data-copy attributes are the canonical public-editable source nodes.
 for(const match of html.matchAll(/<([a-z][\w:-]*)\b[^>]*\bdata-copy="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi)){
  const key=match[2],id=plain(match[3]);
  if(key in manifest.id)continue;
  manifest.id[key]=id;
  manifest.en[key]=locale.englishHome[key]||locale.englishText[id]||id;
 }
 for(const m of html.matchAll(/<img\b[^>]*\bdata-npe-slot="([^"]+)"[^>]*>/gi)){
  const slot=m[1],tag=m[0],src=tag.match(/\bsrc="([^"]+)"/)?.[1],alt=tag.match(/\balt="([^"]+)"/)?.[1];
  if(!manifest.photos[slot]&&src?.startsWith("/photos/"))manifest.photos[slot]={url:src,alt:decode(alt||"")};
 }
}
if(!manifest.id["hero.title"]||!manifest.en["hero.title"]||
 !manifest.id["snorkelingPage.title"]||!manifest.photos.hero||
 !manifest.id["price.snorkeling"])throw Error("Editor snapshot not populated from live page source");
await writeFile("public/site-editor-defaults.json",JSON.stringify(manifest,null,2)+"\n");
await mkdir("dist",{recursive:true});
await cp("public","dist",{recursive:true,force:true});
await writeFile("dist/BUILD_INFO.txt","Marketing Tourism web build; requires Cloudflare Worker and D1 for persistent operations.\n");
console.log("Built dist/ with "+Object.keys(manifest.id).length+" published editing fields and "+Object.keys(manifest.photos).length+" photo slots.");
