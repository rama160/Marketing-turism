// Download verified Creative Commons destination photos into this repository.
// Run via dedicated workflow; never scrape travel sites or upload unlicensed stock images.
import {createHash} from "node:crypto";
import {mkdir,writeFile} from "node:fs/promises";
const photos=[
 ["kelingking","Kelingking Beach, Nusa Penida.jpg","Shrigusti","CC BY-SA 4.0"],
 ["broken-beach","Broken Beach Nusa Penida.jpg","I Ketut Arnaya","CC BY-SA 4.0"],
 ["angels-billabong","Angel Billabong, Nusa Penida.jpg","Haryanti","CC BY-SA 4.0"],
 ["crystal-bay","Crystal Bay, Nusa Penida 2017-08-20 (9).jpg","Magul","CC BY-SA 4.0"],
 ["diamond-beach","Diamond Beach in Nusa Penida, Bali.jpg","Stryn","CC BY-SA 4.0"],
 ["atuh-beach","Atuh Beach, Nusa Penida Bali.jpg","Hendrojkson","CC BY-SA 4.0"],
 ["tree-house","Amazing Tree House at Nusa Penida.jpg","Dini Rosyadah Tridya","CC BY-SA 4.0"],
 ["manta-bay","Snorkeling-with-manta-penida.jpg","Sasuke shinozawa","CC BY-SA 4.0"],
 ["manta-point","19-Indonesia-Bali Nusa-Penida Manta-Point 14 (Manta Ray)-APiazza.JPG","Andrepiazza","CC BY-SA 3.0"],
 ["gamat-bay","Penida-snorkeling.jpg","Sasuke shinozawa","CC BY-SA 4.0"]
];
const host="https://upload.wikimedia.org/wikipedia/commons/";
await mkdir("public/photos",{recursive:true});
async function load(url){
 const r=await fetch(url,{redirect:"follow",headers:{"user-agent":"NusaPenidaExperiencesPhotoArchiver/1.0 (https://github.com/rama160/Marketing-turism; legal Creative Commons attribution)","accept":"image/jpeg,image/*"}});
 if(!r.ok)throw Error("HTTP "+r.status);
 const type=r.headers.get("content-type")||"";
 if(!type.startsWith("image/"))throw Error("Not image "+type);
 const bytes=Buffer.from(await r.arrayBuffer());
 if(bytes.length<5000||bytes.length>12582912||bytes[0]!==0xff||bytes[1]!==0xd8||bytes.at(-2)!==0xff||bytes.at(-1)!==0xd9)throw Error("Invalid JPEG ("+bytes.length+" bytes)");
 return bytes;
}
async function getPhoto(filename){
 const normalized=filename.replaceAll(" ","_"),hash=createHash("md5").update(normalized).digest("hex"),enc=encodeURIComponent(normalized);
 const root=host+hash[0]+"/"+hash.slice(0,2)+"/"+enc;
 const thumb=host+"thumb/"+hash[0]+"/"+hash.slice(0,2)+"/"+enc+"/";
 const candidates=[thumb+"640px-"+enc,thumb+"480px-"+enc,root];
 const errors=[];
 for(const src of candidates){
  try{return {src,bytes:await load(src)};}
  catch(e){errors.push(src.slice(0,110)+" "+e.message);await new Promise(r=>setTimeout(r,750));}
 }
 throw Error(filename+" FAILED\n"+errors.join("\n"));
}
const manifest=[];
for(const [slug,filename,author,license] of photos){
 const {src,bytes}=await getPhoto(filename);
 const outfile="public/photos/"+slug+".jpg";
 await writeFile(outfile,bytes);
 manifest.push({slug,filename,author,license,source:"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(filename.replaceAll(" ","_")),sha256:createHash("sha256").update(bytes).digest("hex"),bytes:bytes.length});
 console.log("VERIFIED "+slug+": "+bytes.length+" bytes from "+new URL(src).host);
}
await writeFile("public/photos/manifest.json",JSON.stringify({photos:manifest,note:"Gallery files copied from Wikimedia Commons with attribution; not all photos show exactly the named location (Gamat Bay illustrative). Check source links and license before reuse."},null,2)+"\n");
console.log("SUCCESS: "+manifest.length+" real JPEGs checked into static assets.");
