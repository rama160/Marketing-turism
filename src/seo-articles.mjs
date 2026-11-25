import {readOrder,orderedKeys} from "../public/content-order.mjs";
import {addResponsivePhotos} from "./photos.mjs";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slugRE=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidRE=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const ARTICLE_LINKS={snorkeling:["/snorkeling.html","/en/tours/snorkeling","Snorkeling Nusa Penida","Nusa Penida snorkeling"],west:["/west-tour.html","/en/tours/west","Wisata Barat","West Tour"],east:["/east-tour.html","/en/tours/east","Wisata Timur","East Tour"],island:["/island-tour.html","/en/tours/island","Island Tour","Island tours"],packages:["/#packages","/#packages","Paket wisata & tiket kapal","Tours & boat tickets"]};
const clip=(s,n)=>s.length<=n?s:s.slice(0,n-1).replace(/\s+\S*$/,"").trim()+"…";
export function validateArticle(input){
 const out={};
 for(const lang of ["id","en"]){
  for(const [field,max,min] of [["title",140,3],["summary",500,10],["body",12000,30]]){
   const key=field+"_"+lang,v=String(input?.[key]??"").trim();
   if(v.length<min||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v))throw Error("Isi "+key+" ("+min+"–"+max+" karakter)");
   out[key]=v;
  }
  out["seo_title_"+lang]=clip(out["title_"+lang],60);
  out["seo_description_"+lang]=clip(out["summary_"+lang],160);
 }
 out.media_id=String(input?.media_id||"");
 if(out.media_id&&!uuidRE.test(out.media_id))throw Error("Foto tidak valid");
 out.links=Array.isArray(input?.links)?[...new Set(input.links.filter(x=>Object.hasOwn(ARTICLE_LINKS,x)))]:[];
 return out;
}
const unpack=row=>({...row,draft:JSON.parse(row.draft_json),published:row.published_json?JSON.parse(row.published_json):null});
export async function listArticles(db){
 const rows=await db.prepare("SELECT * FROM seo_articles ORDER BY updated_at DESC LIMIT 200").all();
 return {items:(rows.results||[]).map(unpack)};
}
export async function saveArticle(db,input,id=null){
 const draft=validateArticle(input);
 if(draft.media_id&&!await db.prepare("SELECT id FROM website_media WHERE id=?").bind(draft.media_id).first())throw Error("Foto Galeri NPE tidak ditemukan");
 if(!id){
  id=crypto.randomUUID();
  const slug=(draft.title_en.normalize("NFKD").replace(/\p{Mark}/gu,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,75).replace(/-$/,"")||"article")+"-"+id.slice(0,8);
  await db.prepare("INSERT INTO seo_articles(id,slug,draft_json,draft_media_id) VALUES(?,?,?,?)").bind(id,slug,JSON.stringify(draft),draft.media_id||null).run();
 }else{
  const r=await db.prepare("UPDATE seo_articles SET draft_json=?,draft_media_id=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=?").bind(JSON.stringify(draft),draft.media_id||null,id,input.expected_version).run();
  if(r.meta?.changes!==1)throw Error("Artikel berubah atau tidak ditemukan. Muat ulang.");
 }
 return unpack(await db.prepare("SELECT * FROM seo_articles WHERE id=?").bind(id).first());
}
export async function articleAction(db,id,input,action){
 if(input?.owner_confirmed!==true||!Number.isSafeInteger(input.expected_version))throw Error("Persetujuan pemilik dan versi diperlukan");
 let sql;
 if(action==="publish"){
  const current=await db.prepare("SELECT * FROM seo_articles WHERE id=? AND version=?").bind(id,input.expected_version).first();
  if(!current)throw Error("Artikel berubah. Muat ulang.");
  const draft=validateArticle(JSON.parse(current.draft_json));
  if(!draft.media_id)throw Error("Pilih foto cover dari Galeri NPE sebelum publikasi");
  sql="UPDATE seo_articles SET published_json=draft_json,published_media_id=draft_media_id,published_at=CURRENT_TIMESTAMP,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=?";
 }else if(action==="unpublish")sql="UPDATE seo_articles SET published_json=NULL,published_media_id=NULL,published_at=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=?";
 else if(action==="delete")sql="DELETE FROM seo_articles WHERE id=? AND version=? AND published_json IS NULL";
 else throw Error("Aksi tidak valid");
 const r=await db.prepare(sql).bind(id,input.expected_version).run();
 if(r.meta?.changes!==1)throw Error("Artikel berubah; untuk menghapus, tarik publikasi terlebih dahulu.");
 return {id,action};
}
export async function publishedArticles(db,slug=null){
 const statement=slug?db.prepare("SELECT id,slug,published_json,published_at FROM seo_articles WHERE slug=? AND published_json IS NOT NULL").bind(slug):db.prepare("SELECT id,slug,published_json,published_at FROM seo_articles WHERE published_json IS NOT NULL ORDER BY published_at DESC");
 const rows=await statement.all();
 const items=(rows.results||[]).filter(r=>slugRE.test(r.slug)&&r.published_json).map(r=>({id:r.id,slug:r.slug,published_at:r.published_at,...JSON.parse(r.published_json)}));
 if(slug||!items.length)return items;
 try{const saved=await db.prepare("SELECT value FROM site_content WHERE key=? AND locale=?").bind("layout.order.articles","id").first();const cfg=readOrder({"layout.order.articles":saved?.value},"articles"),map=new Map(items.map(x=>["article:"+x.id,x]));return orderedKeys([...map.keys()],cfg).map(k=>map.get(k));}catch{return items;}
}
export function articleSitemap(items,origin){
 const paths=["",...items.map(x=>"/"+x.slug)];
 return paths.flatMap(p=>["id","en"].map(lang=>'<url><loc>'+esc(origin+"/"+lang+"/articles"+p)+'</loc>'+["id","en"].map(l=>'<xhtml:link rel="alternate" hreflang="'+l+'" href="'+esc(origin+"/"+l+"/articles"+p)+'"/>').join("")+'</url>')).join("");
}
export function renderArticlePage(items,lang,origin,slug=null){
 const en=lang==="en",a=slug?items.find(x=>x.slug===slug):null;
 if(slug&&!a)return null;
 const root="/"+lang+"/articles",path=root+(slug?"/"+slug:""),url=origin+path;
 const heading=a?a["title_"+lang]:en?"Island travel guides":"Panduan wisata pulau";
 const description=a?a["seo_description_"+lang]:en?"Travel tips for Nusa Penida, Lembongan and the Gili Islands.":"Panduan perjalanan Nusa Penida, Lembongan dan Kepulauan Gili.";
 const image=a?.media_id?"/photos/website/"+a.media_id:null;
 const graph=a?{"@context":"https://schema.org","@type":"Article",headline:heading,description,image:image?origin+image:undefined,datePublished:a.published_at?.replace(" ","T")+"Z",mainEntityOfPage:url,author:{"@type":"Organization",name:"Nusa Penida Experiences"},publisher:{"@type":"Organization",name:"Nusa Penida Experiences"}}:null;
 const cover=image?'<figure><img class="seoArticleCover" src="'+esc(image)+'" alt="'+esc(heading)+'" width="1200" height="675" fetchpriority="high" decoding="async"><figcaption>'+ (en?"Photo supplied to Nusa Penida Experiences; usage rights confirmed.":"Foto disediakan untuk Nusa Penida Experiences; hak penggunaan dikonfirmasi.")+'</figcaption></figure>':"";
 const body=a?a["body_"+lang].split(/\n+/).filter(x=>x.trim()).map(line=>line.startsWith("## ")?"<h2>"+esc(line.slice(3))+"</h2>":"<p>"+esc(line)+"</p>").join(""):"";
 const ix=en?1:0;
 const links=a?(a.links||[]).filter(k=>Object.hasOwn(ARTICLE_LINKS,k)).map(k=>'<a class="textLink" href="'+ARTICLE_LINKS[k][ix]+'">'+esc(ARTICLE_LINKS[k][ix+2])+'</a>').join(" · "):"";
 const list=items.map(x=>'<article class="panel"><h2><a href="'+root+'/'+esc(x.slug)+'">'+esc(x["title_"+lang])+'</a></h2><p>'+esc(x["summary_"+lang])+'</p></article>').join("");
 const other=en?"id":"en";
 const html='<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(a?a["seo_title_"+lang]:heading)+' | NPE</title><meta name="description" content="'+esc(description)+'"><meta property="og:title" content="'+esc(heading)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:url" content="'+esc(url)+'">'+(image?'<meta property="og:image" content="'+esc(origin+image)+'">':"")+'<link rel="canonical" href="'+esc(url)+'">'+["id","en"].map(l=>'<link rel="alternate" hreflang="'+l+'" href="'+esc(origin+"/"+l+"/articles"+(slug?"/"+slug:""))+'">').join("")+'<link rel="icon" href="/icon.svg"><link rel="stylesheet" href="/styles.css">'+(graph?'<script type="application/ld+json">'+JSON.stringify(graph).replace(/</g,"\\u003c")+'</script>':"")+'</head><body><header class="top"><a class="brand" href="/"><img class="brandLogo" src="/icon.svg" alt="Nusa Penida Experiences" width="122" height="76"></a><nav><a href="'+root+'">'+(en?"Travel guides":"Artikel wisata")+'</a><a href="/'+other+'/articles'+(slug?"/"+slug:"")+'">'+(en?"Indonesia":"English")+'</a></nav></header><main class="section seoArticle"><p><a class="npeBackLink" href="'+(slug?root:"/")+'">'+(en?"← Back to guides":"← Kembali")+'</a></p><span class="eyebrow">NUSA PENIDA EXPERIENCES</span><h1>'+esc(heading)+'</h1>'+(a?'<p>'+esc(a["summary_"+lang])+'</p>'+cover+body+'<section class="panel"><h2>'+(en?"Explore related experiences":"Jelajahi paket terkait")+'</h2><p>'+links+'</p><a class="primary" data-whatsapp-chat href="https://wa.me/628561752525?text='+encodeURIComponent((en?"I would like information about ":"Saya ingin informasi tentang ")+heading)+'" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></section><p><a href="'+root+'">'+(en?"All guides":"Semua artikel")+'</a></p>':list||'<p>'+(en?"Travel guides are coming soon.":"Panduan wisata segera tersedia.")+'</p>')+'</main><footer><a href="/privacy.html">Privacy</a> · <a href="/">Nusa Penida Experiences</a></footer><script type="module" src="/analytics.js"></script></body></html>';
 return addResponsivePhotos(html,false);
}
