// Weekly owner-review social content export from canonical src/sales.mjs.
// Creates a useful GitHub Actions artifact without any OAuth tokens or external publishing.
import {mkdirSync,writeFileSync} from "node:fs";
import {weeklyDrafts,marketingWeekStart} from "../src/sales.mjs";
const today=process.env.CAMPAIGN_DAY||new Date().toISOString().slice(0,10);
const week=marketingWeekStart(today),items=weeklyDrafts(week);
if(items.length!==7||items.some(x=>!/^(Instagram|Facebook|TikTok)$/.test(x.platform)))throw Error("Organic campaign schedule is incomplete");
const lines=[
 "# Nusa Penida Experiences — Rencana Konten Organik",
 "",
 "**Minggu mulai:** "+week+" (WITA)  ",
 "**Status:** DRAF • ditinjau pemilik sebelum diterbitkan  ",
 "**Tujuan:** inspirasi wisata, kunjungan website, dan pertanyaan calon wisatawan; bukan konfirmasi pemesanan atau penawaran mengikat.",
 "",
 "> Belum diposting secara otomatis ke Meta/TikTok. Foto/video harus dimiliki sendiri atau berlisensi; periksa kredit sebelum digunakan. Jangan menjanjikan manta, keselamatan, operator tersedia, diskon, atau biaya final.",
 ""
];
for(const [i,c] of items.entries()){
 lines.push("## "+(i+1)+". "+c.planned_date+" — "+c.platform+" ("+c.lang.toUpperCase()+")","","Aktivitas: "+(c.activity_id==="SNORKELING_3_SPOTS"?"Snorkeling":"Island Tour"),"","**Caption draf:**", "",c.caption,"","**Persiapan media:** pilih foto/video milik sendiri atau berlisensi dan periksa atribusi.","","**Review:** ☐ Harga dan fasilitas tidak mengikat ☐ Hak media valid ☐ CTA benar ☐ Disetujui pemilik","","---","");
}
mkdirSync("dist",{recursive:true});
writeFileSync("dist/organic-week.md",lines.join("\n"),"utf8");
console.log("Generated "+items.length+" owner-review drafts for week "+week+" → dist/organic-week.md. No social publication.");
