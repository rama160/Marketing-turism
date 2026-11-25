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
const allowed=new Set(CONTENT_FIELDS.map(([key])=>key));
export const SUPPORTED_LOCALES=["id","en"];
export function validateSiteEdit(b){
 const key=String(b?.key??""),locale=String(b?.locale??""),value=String(b?.value??"").trim();
 if(!allowed.has(key)||!SUPPORTED_LOCALES.includes(locale))throw Error("Field atau bahasa konten tidak valid");
 if((!key.startsWith("price.")&&value.length<2)||value.length>1200||/[<>\u0000-\u001f\u007f]/.test(value))throw Error("Konten harus teks biasa; harga boleh dikosongkan untuk tidak menampilkan harga.");
 if(b.owner_confirmed!==true)throw Error("Persetujuan admin untuk publikasi diperlukan");
 if(!Number.isSafeInteger(b.expected_version)||b.expected_version<0)throw Error("Versi konten tidak valid");
 return {key,locale,value,expectedVersion:b.expected_version};
}
export async function publicSiteContent(db,locale){
 const lang=SUPPORTED_LOCALES.includes(locale)?locale:"en";
 const rows=await db.prepare("SELECT key,value FROM site_content WHERE locale=?").bind(lang).all();
 return {locale:lang,items:Object.fromEntries(rows.results.filter(x=>allowed.has(x.key)).map(x=>[x.key,x.value]))};
}
export async function adminSiteContent(db){
 const rows=await db.prepare("SELECT key,locale,value,version,updated_at FROM site_content ORDER BY key,locale").all();
 return {fields:CONTENT_FIELDS,items:rows.results.filter(x=>allowed.has(x.key))};
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
