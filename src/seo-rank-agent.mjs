// Rank monitoring is evidence-driven. No scraped rank, invented demand, or automatic content publication.
const dayMs=86400000;
const norm=s=>String(s??"").normalize("NFKC").toLowerCase().replace(/[’‘]/g,"'").trim().replace(/\s+/g," ");
const brand=q=>/\bnusa\s*penida\s*experiences\b|nusapenidaexperiences/i.test(q);
const good=r=>typeof r?.query==="string"&&typeof r?.path==="string"&&Number.isFinite(r.position)&&r.position>=1&&Number.isInteger(r.impressions)&&r.impressions>0&&Number.isInteger(r.clicks)&&r.clicks>=0&&r.clicks<=r.impressions;
const key=r=>norm(r.query)+"|"+r.path;
const lang=p=>p.startsWith("/en/")?"en":"id";
const matchLocation=(q,p)=>{
 if(/dream beach|devil.?s tears?/.test(q)&&/\bnusa penida\b/.test(q)&&!/\bnusa lembongan\b/.test(q)&&p.includes("nusa-lembongan-island-tour"))return false;
 return true;
};
const labels={
 PROTECT_TOP10:"Pertahankan URL dan intent; periksa ketersediaan, tautan, dan perubahan CTR sebelum mengedit.",
 RECOVER_TOP10:"Peringkat Top 10 periode sebelumnya melemah. Periksa indexing, relevansi, kompetitor dan perubahan konten; pulihkan berdasarkan bukti.",
 QUICK_WIN:"Tinjau hasil organik aktual; lengkapi informasi yang belum dijawab dan tautan relevan. Review sebelum publikasi.",
 EARLY_TOP10:"Sinyal awal Top 10; jangan mengganti judul atau URL hanya berdasarkan sampel kecil.",
 EARLY_QUICK_WIN:"Sinyal awal posisi 11–30; verifikasi intent dan kumpulkan data sebelum perubahan besar.",
 CHECK_CANONICAL_INTENT:"Periksa bahasa, lokasi dan URL target; jangan optimalkan kueri yang salah destinasi atau mengalihkan secara paksa.",
 REVIEW_UNMAPPED:"Verifikasi intent dan petakan ke satu URL canonical sebelum mengubah konten.",
 BUILD_RELEVANCE:"Perkuat jawaban terhadap intent, bukti lokal dan internal link; prioritaskan halaman transaksi yang relevan.",
 MONITOR_LOW_SAMPLE:"Data terlalu sedikit untuk keputusan ranking; pertahankan URL dan pantau.",
 PRIOR_TOP10_NO_DATA:"Top 10 historis tidak muncul pada sampel kini. Data bisa tidak lengkap; periksa GSC, jangan anggap posisi turun.",
 NO_DATA:"Belum ada pasangan query–URL terukur; cek indexing, pemetaan, dan manfaat halaman tanpa mengarang ranking."
};
const order={RECOVER_TOP10:0,PROTECT_TOP10:1,QUICK_WIN:2,EARLY_QUICK_WIN:3,EARLY_TOP10:4,CHECK_CANONICAL_INTENT:5,PRIOR_TOP10_NO_DATA:6,REVIEW_UNMAPPED:7,BUILD_RELEVANCE:8,MONITOR_LOW_SAMPLE:9,NO_DATA:10};
export function buildRankReview({paths=[],plans=[],finalReport=null,freshReport=null,previousRows=[],previousPeriod=null,indexRows=[],now=Date.now()}={}){
 const allowed=new Set(paths),plansByQuery=new Map(),plannedByPath=new Map();
 for(const p of plans){if(!p.active||!allowed.has(p.target_path))continue;const n=norm(p.normalized||p.keyword);if(!plansByQuery.has(n))plansByQuery.set(n,[]);plansByQuery.get(n).push(p);if(!plannedByPath.has(p.target_path))plannedByPath.set(p.target_path,[]);plannedByPath.get(p.target_path).push(p.keyword);}
 const section=r=>r?.sections?.pairs?.status==="MEASURED"&&Array.isArray(r.sections.pairs.rows)?r.sections.pairs.rows.filter(x=>good(x)&&allowed.has(x.path)&&!brand(x.query)):[];
 const previous=new Map(previousRows.filter(x=>good(x)&&allowed.has(x.path)&&!brand(x.query)).map(r=>[key(r),r]));
 const final=section(finalReport),fresh=section(freshReport);
 const both=new Map();
 for(const row of fresh)both.set(key(row),{row,mode:"FRESH"});
 for(const row of final)both.set(key(row),{row,mode:"FINAL"}); // Stable evidence always takes precedence for a matching pair.
 const pairs=[];
 for(const {row:r,mode} of both.values()){
  const q=norm(r.query),mapped=plansByQuery.get(q)||[],matching=mapped.find(p=>p.target_path===r.path),expected=mapped.find(p=>p.locale===(r.language_hint||lang(r.path)))||mapped[0];
  const prior=mode==="FINAL"?previous.get(key(r)):null,stable=mode==="FINAL"&&r.impressions>=30;
  const mismatch=!matchLocation(q,r.path)||(r.language_hint&&r.language_hint!==lang(r.path)&&expected&&expected.target_path!==r.path)||(!matching&&!!expected);
  let action=mismatch?"CHECK_CANONICAL_INTENT":!matching?"REVIEW_UNMAPPED":stable?(prior?.impressions>=30&&prior.position<=10&&r.position>10?"RECOVER_TOP10":r.position<=10?"PROTECT_TOP10":r.position<=30?"QUICK_WIN":"BUILD_RELEVANCE"):r.position<=10?"EARLY_TOP10":r.position<=30?"EARLY_QUICK_WIN":"MONITOR_LOW_SAMPLE";
  pairs.push({query:r.query,path:r.path,expected_path:expected?.target_path||null,position:r.position,impressions:r.impressions,clicks:r.clicks,ctr:r.clicks/r.impressions,mode,stable,action,recommendation:labels[action],intent:matching?.intent||expected?.intent||null,prior_position:prior?.position??null,prior_impressions:prior?.impressions??null});
 }
 if(finalReport?.sections?.pairs?.status==="MEASURED"){
  for(const [k,p] of previous)if(p.position<=10&&p.impressions>=30&&!final.some(r=>key(r)===k)){
   pairs.push({query:p.query,path:p.path,position:null,impressions:null,clicks:null,mode:"FINAL",stable:false,action:"PRIOR_TOP10_NO_DATA",recommendation:labels.PRIOR_TOP10_NO_DATA,prior_position:p.position,prior_impressions:p.impressions});
  }
 }
 pairs.sort((a,b)=>order[a.action]-order[b.action]||Number(b.intent==="BUY")-Number(a.intent==="BUY")||(b.impressions??0)-(a.impressions??0)||(a.position??999)-(b.position??999));
 const indexes=new Map(indexRows.map(x=>[x.url?.replace(/^https:\/\/nusapenidaexperiences\.com/,""),x.status]));
 const pages=paths.map(path=>{const signals=pairs.filter(p=>p.path===path),p=signals[0];return {path,indexing:indexes.get(path)||"UNCHECKED",target_keywords:(plannedByPath.get(path)||[]).slice(0,8),action:p?.action||"NO_DATA",recommendation:p?.recommendation||labels.NO_DATA,signals:signals.length};});
 pages.sort((a,b)=>order[a.action]-order[b.action]||a.path.localeCompare(b.path));
 return {checked_at:new Date(now).toISOString(),final_period:finalReport?.range||null,fresh_period:freshReport?.range||null,previous_period:previousPeriod,final_status:finalReport?.sections?.pairs?.status||"NOT_RUN",fresh_status:freshReport?.sections?.pairs?.status||"NOT_RUN",pages,pairs,coverage:pages.length,top10:pairs.filter(p=>p.action==="PROTECT_TOP10").length,quick_wins:pairs.filter(p=>p.action==="QUICK_WIN").length,recover:pairs.filter(p=>p.action==="RECOVER_TOP10").length,early:pairs.filter(p=>p.action.startsWith("EARLY_")).length};
}
export async function refreshRankReview(db,paths,now=Date.now()){
 const read=async key=>{const r=await db.prepare("SELECT status,report_json FROM seo_performance_reports WHERE cache_key=?").bind(key).first();if(!r||!["DONE","PARTIAL"].includes(r.status))return null;return JSON.parse(r.report_json);};
 const final=await read("28d:final"),fresh7=await read("7d:fresh"),fresh24=await read("24h");
 const fresh=fresh7?.sections?.pairs?.status==="MEASURED"&&Date.parse(fresh7.checked_at)>now-2*dayMs?fresh7:fresh24;
 const plans=(await db.prepare("SELECT keyword,normalized,locale,target_path,intent,active FROM seo_keyword_plans WHERE active=1").all()).results||[];
 const indexes=(await db.prepare("SELECT url,status FROM seo_indexing_checks").all()).results||[];
 let previousRows=[],previousPeriod=null;
 if(final?.range?.start&&final?.range?.end){
  const prev=await db.prepare("SELECT id,period_start,period_end FROM seo_keyword_runs WHERE state='DONE' AND gsc_status='MEASURED' AND period_end<? ORDER BY period_end DESC,created_at DESC LIMIT 1").bind(final.range.start).first();
  if(prev&&Date.parse(prev.period_end)-Date.parse(prev.period_start)===27*dayMs&&Date.parse(final.range.end)-Date.parse(final.range.start)===27*dayMs){
   previousRows=(await db.prepare("SELECT query,path,impressions,clicks,position FROM seo_keyword_observations WHERE run_id=?").bind(prev.id).all()).results||[];previousPeriod={start:prev.period_start,end:prev.period_end};
  }
 }
 const report=buildRankReview({paths,plans,finalReport:final,freshReport:fresh,previousRows,previousPeriod,indexRows:indexes,now});
 const day=new Date(now).toISOString().slice(0,10);
 await db.prepare("INSERT INTO seo_rank_reviews(day,checked_at,report_json) VALUES(?,?,?) ON CONFLICT(day) DO UPDATE SET checked_at=excluded.checked_at,report_json=excluded.report_json WHERE excluded.checked_at>=seo_rank_reviews.checked_at").bind(day,report.checked_at,JSON.stringify(report)).run();
 await db.prepare("DELETE FROM seo_rank_reviews WHERE day<?").bind(new Date(now-180*dayMs).toISOString().slice(0,10)).run();
 return report;
}
export async function readRankReview(db){
 try{const r=await db.prepare("SELECT report_json FROM seo_rank_reviews ORDER BY day DESC LIMIT 1").first();return r?JSON.parse(r.report_json):null;}catch{return null;}
}
