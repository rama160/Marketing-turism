import {LAYOUT_PREFIX,validGroup,validateOrder} from "../public/content-order.mjs";
// Canonical server-side allowlist and persistence for the public homepage editor.
export const CONTENT_FIELDS=Object.freeze([
 ["hero.whatsapp","Beranda · Tombol WhatsApp"],
 ["hero.highlight1","Beranda · Keunggulan 1"],
 ["hero.highlight2","Beranda · Keunggulan 2"],
 ["hero.highlight3","Beranda · Keunggulan 3"],
 ["hero.highlight4","Beranda · Keunggulan 4"],
 ["regions.west.cta","Beranda · Tombol West Tour"],
 ["regions.east.cta","Beranda · Tombol East Tour"],
 ["regions.sea.cta","Beranda · Tombol Snorkeling"],
 ["homeThumb.west-kelingking.title","Thumbnail Beranda · Kelingking"],
 ["homeThumb.west-broken-beach.title","Thumbnail Beranda · Broken Beach"],
 ["homeThumb.west-angels-billabong.title","Thumbnail Beranda · Angel’s Billabong"],
 ["homeThumb.west-crystal-bay.title","Thumbnail Beranda · Crystal Bay"],
 ["homeThumb.east-diamond-beach.title","Thumbnail Beranda · Diamond Beach"],
 ["homeThumb.east-atuh-beach.title","Thumbnail Beranda · Atuh Beach"],
 ["homeThumb.east-tree-house.title","Thumbnail Beranda · Tree House"],
 ["homeThumb.east-atuh-beach-second.title","Thumbnail Beranda · Pantai Atuh"],
 ["homeThumb.snorkeling-manta-bay.title","Thumbnail Beranda · Manta Bay"],
 ["homeThumb.snorkeling-manta-point.title","Thumbnail Beranda · Manta Point"],
 ["homeThumb.snorkeling-gamat-bay.title","Thumbnail Beranda · Gamat Bay"],
 ["homeThumb.snorkeling-crystal-bay.title","Thumbnail Beranda · Crystal Bay"],
 ["price.snorkeling","Foto · harga Snorkeling Sharing (per orang)"],
 ["price.island","Foto · harga Island Tour (per mobil)"],
 ["price.west","Foto · harga wisata Barat (per mobil)"],
 ["price.east","Foto · harga wisata Timur (per mobil)"],
 ["hero.eyebrow","Hero · label"],["hero.title","Hero · judul"],["hero.subtitle","Hero · subjudul"],["hero.description","Hero · deskripsi"],["hero.cta","Hero · tombol"],
 ["packages.eyebrow","Paket · label"],["packages.title","Paket · judul"],["packages.description","Paket · deskripsi"],
 ["snorkeling.title","Kartu · judul snorkeling"],["snorkeling.description","Kartu · deskripsi snorkeling"],
 ["island.title","Kartu · judul island tour"],["island.description","Kartu · deskripsi island tour"],
 ["regions.eyebrow","Destinasi · label"],["regions.title","Destinasi · judul"],["regions.description","Destinasi · deskripsi"],
 ["west.title","Destinasi · Barat"],["west.description","Destinasi · deskripsi Barat"],
 ["east.title","Destinasi · Timur"],["east.description","Destinasi · deskripsi Timur"],
 ["snorkelingPage.eyebrow","Halaman Snorkeling · label"],["snorkelingPage.title","Halaman Snorkeling · judul"],["snorkelingPage.lead","Halaman Snorkeling · ringkasan"],["snorkelingPage.description","Halaman Snorkeling · ketentuan"],
 ["islandPage.eyebrow","Halaman Island Tour · label"],["islandPage.title","Halaman Island Tour · judul"],["islandPage.lead","Halaman Island Tour · ringkasan"],["islandPage.description","Halaman Island Tour · ketentuan"],
 ["westPage.eyebrow","Halaman Barat · label"],["westPage.title","Halaman Barat · judul"],["westPage.lead","Halaman Barat · ringkasan"],["westPage.description","Halaman Barat · ketentuan"],
 ["eastPage.eyebrow","Halaman Timur · label"],["eastPage.title","Halaman Timur · judul"],["eastPage.lead","Halaman Timur · ringkasan"],["eastPage.description","Halaman Timur · ketentuan"],
 ["sea.title","Kartu Snorkeling · judul tambahan"],
 ["sea.description","Kartu Snorkeling · deskripsi tambahan"],
 ["whatsapp.eyebrow","WhatsApp · label"],
 ["whatsapp.heading","WhatsApp · judul"],
 ["whatsapp.description","WhatsApp · deskripsi"],
 ["whatsapp.disclaimer","WhatsApp · catatan"],
 ["snorkelingSpot.mantaBay.title","Galeri snorkelingSpot · mantaBay judul"],
 ["snorkelingSpot.mantaBay.description","Galeri snorkelingSpot · mantaBay deskripsi"],
 ["snorkelingSpot.mantaPoint.title","Galeri snorkelingSpot · mantaPoint judul"],
 ["snorkelingSpot.mantaPoint.description","Galeri snorkelingSpot · mantaPoint deskripsi"],
 ["snorkelingSpot.crystalBay.title","Galeri snorkelingSpot · crystalBay judul"],
 ["snorkelingSpot.crystalBay.description","Galeri snorkelingSpot · crystalBay deskripsi"],
 ["snorkelingSpot.gamatBay.title","Galeri snorkelingSpot · gamatBay judul"],
 ["snorkelingSpot.gamatBay.description","Galeri snorkelingSpot · gamatBay deskripsi"],
 ["islandSpot.west.title","Galeri islandSpot · west judul"],
 ["islandSpot.west.description","Galeri islandSpot · west deskripsi"],
 ["islandSpot.east.title","Galeri islandSpot · east judul"],
 ["islandSpot.east.description","Galeri islandSpot · east deskripsi"],
 ["westSpot.kelingking.title","Galeri westSpot · kelingking judul"],
 ["westSpot.kelingking.description","Galeri westSpot · kelingking deskripsi"],
 ["westSpot.brokenBeach.title","Galeri westSpot · brokenBeach judul"],
 ["westSpot.brokenBeach.description","Galeri westSpot · brokenBeach deskripsi"],
 ["westSpot.angelsBillabong.title","Galeri westSpot · angelsBillabong judul"],
 ["westSpot.angelsBillabong.description","Galeri westSpot · angelsBillabong deskripsi"],
 ["westSpot.crystalBay.title","Galeri westSpot · crystalBay judul"],
 ["westSpot.crystalBay.description","Galeri westSpot · crystalBay deskripsi"],
 ["eastSpot.diamondBeach.title","Galeri eastSpot · diamondBeach judul"],
 ["eastSpot.diamondBeach.description","Galeri eastSpot · diamondBeach deskripsi"],
 ["eastSpot.atuhBeach.title","Galeri eastSpot · atuhBeach judul"],
 ["eastSpot.atuhBeach.description","Galeri eastSpot · atuhBeach deskripsi"],
 ["eastSpot.treeHouse.title","Galeri eastSpot · treeHouse judul"],
 ["eastSpot.treeHouse.description","Galeri eastSpot · treeHouse deskripsi"],
 ["contact.eyebrow","Kontak · label"],["contact.title","Kontak · judul"],["contact.description","Kontak · deskripsi"],["contact.notice","Kontak · pemberitahuan"]
]);
export const HERO_LIST_KEY="hero.highlights";
export const HERO_ICONS=Object.freeze({tour:"✦",snorkel:"〰",private:"◈",local:"♡",boat:"⛴",beach:"☀",check:"✓"});
export function validateHeroHighlights(value){
 const rows=JSON.parse(value);
 if(!Array.isArray(rows)||rows.length>8)throw Error("Maksimal 8 layanan pada cover");
 return rows.map(row=>{
  if(!row||!Object.hasOwn(HERO_ICONS,row.icon))throw Error("Ikon layanan tidak valid");
  const clean={icon:row.icon};
  for(const lang of ["id","en"]){
   const v=typeof row[lang]==="string"?row[lang].trim():"";
   if(v.length<2||v.length>60||/[<>\u0000-\u001f\u007f]/.test(v))throw Error("Nama layanan ID dan EN wajib 2–60 karakter");
   clean[lang]=v;
  }
  return clean;
 });
}
const allowed=new Set([...CONTENT_FIELDS.map(([key])=>key),HERO_LIST_KEY]);
const isAllowed=key=>allowed.has(key)||(key.startsWith(LAYOUT_PREFIX)&&validGroup(key.slice(LAYOUT_PREFIX.length)));
export const SUPPORTED_LOCALES=["id","en"];
// Display only: whole rupiah, consistent grouping, no conversion or thousands multiplier.
const priceUnits={id:{PERSON:"orang",CAR:"mobil",GROUP:"grup",TICKET:"tiket"},en:{PERSON:"person",CAR:"car",GROUP:"group",TICKET:"ticket"}};
export function formatRupiah(amount,unit="PERSON",from=false,locale="id"){
 if(!Number.isSafeInteger(amount)||amount<1||amount>1000000000||!Object.hasOwn(priceUnits.id,unit))return "";
 const lang=locale==="en"?"en":"id";
 return (from?(lang==="en"?"From ":"Mulai "):"")+"Rp "+new Intl.NumberFormat("id-ID").format(amount)+"/"+priceUnits[lang][unit];
}
export function normalizePublicPriceLabel(value,locale="id",{fallback=false}={}){
 const raw=String(value??"").trim();if(!raw)return "";
 const match=raw.match(/^(?:(Sharing|Private|Mulai(?:\s+dari)?|From)\s+)?(?:(?:Rp\.?|IDR)\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+)(?:\s*\/\s*(orang|person|mobil|car|grup|group|tiket|ticket))?$/i);
 if(!match)return fallback?"":raw.replace(/\b(?:IDR|Rp\.?)\s*(\d{1,3}(?:[.,]\d{3})+|\d+)/gi,(_,n)=>"Rp "+new Intl.NumberFormat("id-ID").format(Number(n.replace(/[.,]/g,""))));
 const number=Number(match[2].replace(/[.,]/g,""));if(!Number.isSafeInteger(number)||number<1||number>1000000000)return fallback?"":raw;
 const lang=locale==="en"?"en":"id",unit=Object.keys(priceUnits.id).find(k=>[priceUnits.id[k],priceUnits.en[k]].includes(String(match[3]||"").toLowerCase()));
 const prefix=String(match[1]||"").toLowerCase(),from=/^(mulai|from)/.test(prefix);
 const name=prefix==="sharing"?"Sharing ":prefix==="private"?"Private ":from?(lang==="en"?"From ":"Mulai "):"";
 return name+"Rp "+new Intl.NumberFormat("id-ID").format(number)+(unit?"/"+priceUnits[lang][unit]:"");
}
export function validateSiteEdit(b){
 const key=String(b?.key??""),locale=String(b?.locale??""),value=String(b?.value??"").trim();
 if((!allowed.has(key)&&!(key.startsWith(LAYOUT_PREFIX)&&validGroup(key.slice(LAYOUT_PREFIX.length))))||!SUPPORTED_LOCALES.includes(locale))throw Error("Field atau bahasa konten tidak valid");
 if(key.startsWith(LAYOUT_PREFIX)){if(locale!=="id"||value.length>10500)throw Error("Susunan disimpan bersama kedua bahasa");validateOrder(key.slice(LAYOUT_PREFIX.length),value);}
 else if(key===HERO_LIST_KEY){if(locale!=="id"||value.length>3000)throw Error("Daftar layanan harus disimpan bersama kedua bahasa");validateHeroHighlights(value);}
 else if((!key.startsWith("price.")&&value.length<2)||value.length>1200||/[<>\u0000-\u001f\u007f]/.test(value))throw Error("Konten harus teks biasa; harga boleh dikosongkan untuk tidak menampilkan harga.");
 if(b.owner_confirmed!==true)throw Error("Persetujuan admin untuk publikasi diperlukan");
 if(!Number.isSafeInteger(b.expected_version)||b.expected_version<0)throw Error("Versi konten tidak valid");
 return {key,locale,value:key.startsWith("price.")?normalizePublicPriceLabel(value,locale):value,expectedVersion:b.expected_version};
}
export async function publicSiteContent(db,locale){
 const lang=SUPPORTED_LOCALES.includes(locale)?locale:"en";
 const rows=await db.prepare("SELECT key,value FROM site_content WHERE locale=?").bind(lang).all();
 const items=Object.fromEntries(rows.results.filter(x=>isAllowed(x.key)).map(x=>[x.key,x.key.startsWith("price.")?normalizePublicPriceLabel(x.value,lang):x.value]));
 // Missing translation follows the published amount, never stale template price; explicit blank stays blank.
 const priceKeys=CONTENT_FIELDS.map(([key])=>key).filter(key=>key.startsWith("price."));
 if(priceKeys.some(key=>!Object.hasOwn(items,key))){
  const other=await db.prepare("SELECT key,value FROM site_content WHERE locale=? AND key LIKE 'price.%'").bind(lang==="en"?"id":"en").all();
  for(const row of other.results)if(priceKeys.includes(row.key)&&!Object.hasOwn(items,row.key))items[row.key]=normalizePublicPriceLabel(row.value,lang,{fallback:true});
 }
 return {locale:lang,items};
}
export async function adminSiteContent(db){
 const rows=await db.prepare("SELECT key,locale,value,version,updated_at FROM site_content ORDER BY key,locale").all();
 return {fields:CONTENT_FIELDS,items:rows.results.filter(x=>isAllowed(x.key))};
}
export async function publishSiteContent(db,body){
 const b=validateSiteEdit(body);
 const current=await db.prepare("SELECT version FROM site_content WHERE key=? AND locale=?").bind(b.key,b.locale).first();
 if((current?.version||0)!==b.expectedVersion)return {conflict:true};
 const version=b.expectedVersion+1;
 const result=await db.prepare("INSERT INTO site_content(key,locale,value,version) VALUES(?,?,?,?) ON CONFLICT(key,locale) DO UPDATE SET value=excluded.value,version=excluded.version,updated_at=CURRENT_TIMESTAMP WHERE site_content.version=excluded.version-1").bind(b.key,b.locale,b.value,version).run();
 if(result.meta?.changes!==1)return {conflict:true};
 await db.prepare("INSERT INTO site_content_revisions(id,key,locale,value,version) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(),b.key,b.locale,b.value,version).run();
 return {key:b.key,locale:b.locale,value:b.value,version};
}
