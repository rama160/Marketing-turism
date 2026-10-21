// Nusa Penida Experiences independent weekly organic strategy (no ChatGPT/API required).
// Uses only verified aggregate measurements, never manufactured social impressions.
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {weeklyDrafts,marketingWeekStart} from "../src/sales.mjs";
import {marketingIntelligence,validateMarketingObservation} from "../src/marketing-intelligence.mjs";
import {marketingMediaForIdea} from "../src/marketing-media.mjs";

const today=process.env.CAMPAIGN_DAY||new Date().toISOString().slice(0,10);
const week=marketingWeekStart(today),items=weeklyDrafts(week);
if(items.length!==7||items.some(x=>!/^(Instagram|Facebook|TikTok)$/.test(x.platform)))throw Error("Organic calendar incomplete");
const source=JSON.parse(readFileSync(new URL("../data/marketing/observations.json",import.meta.url),"utf8"));
if(source.schema_version!==1||!Array.isArray(source.observations)||source.observations.length>1000)throw Error("Observation source invalid");
const observations=source.observations.map(o=>validateMarketingObservation(o,today));
const learning=marketingIntelligence(observations,items,today);
const candidates=learning.recommendations.map(r=>{
 const idea=items[r.index],photo=marketingMediaForIdea(r.index);
 return {...r,lang:idea.lang,caption:idea.caption.replace(/^\[REVIEW [^\]]+\] /,""),
  photo:photo};
});
const weekNo=Math.floor(Date.parse(week+"T00:00:00Z")/604800000);
// Weighted priority with deterministic rotation so no-data weeks still explore different photos.
const sorted=[...candidates].filter(c=>c.platform!=="TikTok").sort((a,b)=>
 b.priority-a.priority||(((a.index+weekNo)%7)-((b.index+weekNo)%7)));
const chosen=[],activities=new Set();
for(const candidate of sorted){
 if(chosen.length>=3)break;
 if(chosen.length===1&&activities.has(candidate.activity_id)&&sorted.some(x=>!activities.has(x.activity_id)&&!chosen.some(y=>y.index===x.index)))continue;
 chosen.push(candidate);activities.add(candidate.activity_id);
}
if(chosen.length!==3)throw Error("Insufficient safe organic topics");
const slots=["Monday","Wednesday","Friday"];
const publicationCandidates=chosen.map((c,i)=>({
 ...c,
 suggested_weekday:slots[i],
 suggested_hour_wita:learning.best_hours[c.platform].hour??(i===1?12:10),
 hour_basis:learning.best_hours[c.platform].source==="MEASURED"?"MEASURED":"EDITORIAL_FALLBACK",
 status:"OWNER_REVIEW_REQUIRED",platform_publication:"NOT_ATTEMPTED"
}));
const state={schema_version:1,week_start:week,generated_on:today,
 learning:{strategy_version:learning.strategy_version,observation_count:learning.observation_count,
  lookback_days:learning.lookback_days,best_hours:learning.best_hours,note:learning.note},
 posts:publicationCandidates,all_candidates:candidates,external_publishing:false,
 disclosures:["Planning is automated; Meta/Metricool posting is NOT performed by this script.","No customer data, paid ads, prices, payments, bookings, guaranteed sightings, or fabricated analytics."]};
mkdirSync("dist",{recursive:true});
writeFileSync("dist/organic-week.json",JSON.stringify(state,null,2)+"\n","utf8");
const md=[
 "# Nusa Penida Experiences — Marketing Agent Mandiri",
 "",
 "**Pekan:** "+week+" · **Generated:** "+today+" · **Zona:** WITA",
 "**Status:** draf organik otomatis, bukan publikasi otomatis ke Instagram/Facebook",
 "**Observasi terverifikasi:** "+learning.observation_count+" (maksimal 90 hari)",
 "",
 "> Pembelajaran terjadi dari data performa riil yang tersedia dalam data/marketing/observations.json. Tanpa metrik, semua jam hanyalah pilihan editorial awal, bukan klaim jam terbaik. Konten harus memakai materi berizin dan ditinjau sebelum diposting.",
 "",
 "## Tiga pilihan utama untuk pekan ini",
 ""
];
for(const [i,c] of publicationCandidates.entries()){
 md.push("### "+(i+1)+". "+c.suggested_weekday+" "+c.suggested_hour_wita+":00 WITA — "+c.platform+" ("+c.lang.toUpperCase()+")",
 "", "**Dasar strategi:** "+c.basis+" · skor "+c.strategy_score+" · sampel "+c.samples+" · jam "+c.hour_basis,
 "", "**Caption:**", "",c.caption,"",
 "**Foto:** "+c.photo.url,
 "**Kredit:** "+c.photo.credit+" / "+c.photo.license+" · "+c.photo.source,
 "**Status:** "+c.status+"; belum dipublikasikan",
 "", "---", "");
}
md.push("## Tujuh alternatif dan urutan berdasarkan data");
for(const c of candidates)md.push("- "+c.platform+" · "+c.activity_id+" · "+c.lang.toUpperCase()+" · skor "+c.strategy_score+" · "+c.basis);
md.push("","## Guardrail","- Tidak ada auto-DM, iklan berbayar, transaksi atau pemindahan uang.","- Jangan menjanjikan manta, cuaca aman, diskon, operator, jadwal atau ketersediaan yang belum terkonfirmasi.","- Status berhasil tayang harus berdasarkan hasil nyata masing-masing platform.");
writeFileSync("dist/organic-week.md",md.join("\n")+"\n","utf8");
console.log("Created 3 ranked owner-review suggestions and 7 alternatives for "+week+" using "+learning.observation_count+" verified observations. No publication.");
