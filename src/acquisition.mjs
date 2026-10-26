// Sales acquisition: fresh travel-intent search plans, opt-in community participation and click funnel.
// IMPORTANT: NO Facebook Groups API, profile scraping, group joining, bot commenting or unsolicited DMs.
const id=()=>crypto.randomUUID();
const todayWita=()=>new Date(Date.now()+8*3600000).toISOString().slice(0,10);
const validDay=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+"T00:00:00Z"));
const whitelist=new Set(["FLOATING","HERO","WEBSITE","CAMPAIGN_FACEBOOK","CAMPAIGN_INSTAGRAM","COMMUNITY","PARTNER"]);
const safeUrl=x=>{
 try{const url=new URL(String(x||"").trim());return url.protocol==="https:"&&url.href.length<=700&&
  !["localhost","127.0.0.1","0.0.0.0"].includes(url.hostname)&&
  !url.hostname.endsWith(".internal")?url.href:null}catch{return null}
};
const queries=[
 {segment:"BALI_ITINERARY",activity_id:"ISLAND_TOUR_CAR",title:"Bali itinerary + day trip",search:"Bali travel itinerary day trip Nusa Penida",draft:"Planning Nusa Penida from Bali? Before choosing East or West, check your fast boat arrival, road transfer time and the number of stops you can actually enjoy. Which date and how many travelers are you planning for?",tip:"Cari diskusi yang meminta saran itinerary. Jawab pertanyaannya secara konkret; hanya tawarkan bantuan wisata bila aturan grup mengizinkan."},
 {segment:"SNORKELING_PLANNERS",activity_id:"SNORKELING_3_SPOTS",title:"Snorkeling Manta dan keselamatan",search:"Nusa Penida manta snorkeling travel advice",draft:"If you are choosing snorkeling in Nusa Penida, ask your operator about sea conditions, safe boat capacity and which spots are suitable on your travel day. Manta sightings are wild and never guaranteed. Are you comparing sharing and private options?",tip:"Prioritaskan pertanyaan wisatawan yang meminta tips snorkeling. Jangan menjanjikan penampakan manta."},
 {segment:"BALI_FAMILY",activity_id:"ISLAND_TOUR_CAR",title:"Family trips dan private driver",search:"Bali families traveling Nusa Penida private driver",draft:"Planning Nusa Penida with family? The scenic roads can be slow, so a comfortable route matters more than collecting every photo spot. West and East are usually better planned as separate options. How many people are traveling?",tip:"Bantu orang yang menanyakan durasi, kendaraan, dan kenyamanan. Jangan menghubungi anggota grup secara pribadi tanpa permintaan mereka."},
 {segment:"BACKPACKER",activity_id:"ISLAND_TOUR_CAR",title:"Budget backpacker",search:"Bali backpackers Nusa Penida ferry tour",draft:"For a budget-friendly Nusa Penida visit, compare the round-trip fast boat, local transport and time needed between viewpoints before booking. Sharing and private arrangements have different tradeoffs. What date are you considering?",tip:"Tawarkan perbandingan yang jujur, bukan promosi massal. Jangan membuat klaim harga operator yang belum diverifikasi."},
 {segment:"COUPLES",activity_id:"ISLAND_TOUR_CAR",title:"Couples and honeymoon itineraries",search:"Bali honeymoon couples Nusa Penida travel",draft:"For couples planning a relaxed Nusa Penida day, choose a few memorable viewpoints instead of rushing across the island. Would you prefer the dramatic cliffs of the West or the beaches of the East?",tip:"Bagikan panduan itinerary; sampaikan layanan hanya bila diminta atau diizinkan oleh moderator."},
 {segment:"FIRST_TIME",activity_id:"SNORKELING_3_SPOTS",title:"First-time snorkelers",search:"Nusa Penida snorkeling beginners advice",draft:"First time snorkeling in Nusa Penida? It helps to ask about life jackets, supervision, current sea conditions and the operator's safety briefing. A suitable tour matters more than chasing a particular marine sighting.",tip:"Jawab FAQ keselamatan secara faktual, tanpa menjanjikan kondisi laut yang belum dicek."},
 {segment:"BALITRAVEL",activity_id:"ISLAND_TOUR_CAR",title:"Travel dates and itinerary",search:"Nusa Penida Bali itinerary travel group",draft:"A Nusa Penida itinerary works best when you know your travel date, group size and starting point. For a realistic route, tell us whether you prefer West or East and whether you have a fixed return boat time.",tip:"Cari pertanyaan wisatawan yang punya tanggal, grup, atau rencana yang jelas; jangan mengekstrak identitas atau nomor anggota."}
];
const partnerQueries=[
 {segment:"STAY_REFERRALS",channel:"PARTNER_SEARCH",search:"Nusa Penida boutique hotel guest tour referrals",draft:"Hello, we help guests explore Nusa Penida snorkeling and West/East island tour options with local operators. If you are open to a guest referral partnership, may we share a short itinerary guide and our contact details? Pricing and availability are confirmed before each booking.",tip:"Cari kontak bisnis resmi hotel/homestay; kirim proposal hanya melalui kanal yang mengizinkan inquiry kemitraan dan jangan berulang tanpa respons."},
 {segment:"BALI_HOSTS",channel:"PARTNER_SEARCH",search:"Sanur Bali guesthouse hotel Nusa Penida day trip partners",draft:"Hello, do your guests ask about Nusa Penida day trips? We can provide practical information on boat departure planning and optional West/East or snorkeling arrangements through local operators. Would your team like to review a collaboration proposal?",tip:"Hubungi kontak kerja sama bisnis yang dipublikasikan; jangan kumpulkan informasi pribadi tamu."},
 {segment:"TRAVEL_CREATORS",channel:"CREATOR_SEARCH",search:"Nusa Penida itinerary Bali travel creators",draft:"Hi, we create practical travel guides for Nusa Penida visitors. If your channel is open to transparent collaborations, would you like to discuss a helpful itinerary Q&A for your audience? No obligation and no fake reviews.",tip:"Cari kreator yang menyatakan terbuka untuk kolaborasi. Semua konten berbayar/berinsentif harus diberi disclosure yang sesuai."},
 {segment:"DIVE_PARTNERS",channel:"PARTNER_SEARCH",search:"Sanur Bali snorkel travel accommodation partner",draft:"Hello, we are building responsible snorkeling information for visitors to Nusa Penida. If you support guest referrals or information exchanges, would you be interested in discussing requirements and an ethical collaboration?",tip:"Cari mitra bisnis terkait wisata laut yang memiliki kanal kerja sama publik, bukan daftar nomor pribadi."}
];
function searchUrl(q,channel){
 return channel==="FACEBOOK_GROUP_SEARCH"?
  "https://www.facebook.com/search/groups/?q="+encodeURIComponent(q):
  channel==="CREATOR_SEARCH"?
  "https://www.google.com/search?q="+encodeURIComponent(q+" Instagram collaboration"):
  "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);
}
export function dailyAcquisitionIdeas(day){
 if(!validDay(day))throw Error("Tanggal akuisisi tidak valid");
 const ordinal=Math.floor(Date.parse(day+"T00:00:00Z")/86400000);
 const group=queries[((ordinal%queries.length)+queries.length)%queries.length];
 const partner=partnerQueries[((ordinal%partnerQueries.length)+partnerQueries.length)%partnerQueries.length];
 return [
  {intended_day:day,segment:group.segment,channel:"FACEBOOK_GROUP_SEARCH",activity_id:group.activity_id,
   search_query:group.search,discovery_url:searchUrl(group.search,"FACEBOOK_GROUP_SEARCH"),helpful_draft:group.draft,action_tip:group.tip},
  {intended_day:day,segment:partner.segment,channel:partner.channel,activity_id:partner.segment==="DIVE_PARTNERS"?"SNORKELING_3_SPOTS":"ISLAND_TOUR_CAR",
   search_query:partner.search,discovery_url:searchUrl(partner.search,partner.channel),helpful_draft:partner.draft,action_tip:partner.tip}
 ];
}
export async function prepareAcquisitionDay(db,day=todayWita(),source="DAILY_CRON"){
 const plan=dailyAcquisitionIdeas(day);
 const statements=plan.map(x=>db.prepare("INSERT INTO acquisition_tasks"+
  "(id,intended_day,segment,channel,activity_id,search_query,discovery_url,helpful_draft,action_tip) "+
  "VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(intended_day,channel) DO NOTHING")
  .bind(id(),x.intended_day,x.segment,x.channel,x.activity_id,x.search_query,x.discovery_url,x.helpful_draft,x.action_tip));
 const results=await db.batch(statements);
 const created=results.reduce((sum,r)=>sum+Number(r.meta?.changes||0),0);
 if(created)await db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
  .bind(id(),"acquisition",day,"RESEARCH_PLAN_CREATED",JSON.stringify({source,created,manual_approval_required:true,verified_targets:0})).run();
 return {day,created,status:"OWNER_REVIEW_REQUIRED",automated_group_joins:false,automated_messages:false};
}
export async function acquisitionDashboard(db,env){
 const [tasks,clicks,byDay,bookings,leadRows,queueRows]=await Promise.all([
  db.prepare("SELECT * FROM acquisition_tasks ORDER BY intended_day DESC,channel LIMIT 35").all(),
  db.prepare("SELECT source,SUM(clicks) AS clicks FROM acquisition_cta_clicks WHERE observed_on>=date('now','-30 days') GROUP BY source ORDER BY clicks DESC").all(),
  db.prepare("SELECT observed_on,SUM(clicks) AS clicks FROM acquisition_cta_clicks WHERE observed_on>=date('now','-14 days') GROUP BY observed_on ORDER BY observed_on DESC").all(),
  db.prepare("SELECT COUNT(*) AS n FROM bookings").first(),db.prepare("SELECT COUNT(*) AS n FROM leads").first(),
  db.prepare("SELECT COUNT(*) AS n FROM approved_social_queue WHERE status='POSTED'").first()
 ]);
 const sources=clicks.results;
 return {tasks:tasks.results,funnel:{whatsapp_clicks:sources.reduce((s,x)=>s+Number(x.clicks||0),0),
  sources,days:byDay.results,leads:leadRows?.n||0,bookings:bookings?.n||0,posted:queueRows?.n||0,
  note:"Klik WhatsApp hanyalah klik keluar ke aplikasi, bukan pesan yang terkirim atau lead terverifikasi."},
  readiness:{form_leads_enabled:env.PUBLIC_LEADS_ENABLED==="true",whatsapp_cloud_api_enabled:env.WA_SEND_ENABLED==="true",
   facebook_group_auto_join:false,facebook_group_auto_publish:false},
  disclosure:"Tautan Facebook Groups/Maps adalah pencarian kandidat, bukan grup/mitra yang sudah diverifikasi. Pemilik harus meninjau aturan komunitas dan memposting/bergabung secara manual."};
}
export async function updateAcquisitionTask(db,taskId,body){
 if(!/^[0-9a-f-]{36}$/i.test(taskId||""))throw Error("ID tugas tidak valid");
 const old=await db.prepare("SELECT * FROM acquisition_tasks WHERE id=?").bind(taskId).first();
 if(!old)throw Error("Tugas tidak ditemukan");
 if(body.owner_confirmed!==true)throw Error("Konfirmasi pemilik diperlukan");
 const status=String(body.status||"");
 if(!["OWNER_APPROVED","DONE_MANUAL","DISMISSED"].includes(status))throw Error("Status tugas tidak valid");
 if(old.status==="DONE_MANUAL"||old.status==="DISMISSED")throw Error("Tugas sudah selesai");
 if(status==="DONE_MANUAL"&&old.status!=="OWNER_APPROVED")throw Error("Setujui kontribusi terlebih dahulu");
 if(status==="OWNER_APPROVED"&&old.status!=="REVIEW")throw Error("Tugas harus masih menunggu persetujuan");
 const actualTarget=body.actual_target_url?safeUrl(body.actual_target_url):null;
 if(body.actual_target_url&&!actualTarget)throw Error("Tautan tujuan harus HTTPS valid");
 const published=body.published_url?safeUrl(body.published_url):null;
 if(body.published_url&&!published)throw Error("URL bukti harus HTTPS valid");
 const notes=String(body.notes||"").trim().slice(0,450);
 if(status==="OWNER_APPROVED"&&!actualTarget)throw Error("Masukkan URL grup/mitra yang benar-benar Anda temukan, bukan tautan hasil pencarian");
 if(status==="DONE_MANUAL"&&!published&&notes.length<8)throw Error("Masukkan URL kontribusi atau catatan aktivitas manual yang dilakukan");
 const changed=await db.prepare("UPDATE acquisition_tasks SET status=?,actual_target_url=?,published_url=?,notes=?,updated_at=CURRENT_TIMESTAMP "+
  "WHERE id=? AND status=?").bind(status,actualTarget||old.actual_target_url,published||old.published_url,notes||old.notes,taskId,old.status).run();
 if(changed.meta?.changes!==1)throw Error("Status sudah berubah, silakan muat ulang");
 await db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)")
  .bind(id(),"acquisition",taskId,status,JSON.stringify({manual_only:true,channel:old.channel,notes:notes.slice(0,80)})).run();
 return {id:taskId,status};
}
export async function recordWhatsAppClick(db,body){
 const source=String(body?.source||"");
 if(!whitelist.has(source))throw Error("Sumber klik tidak dikenal");
 const campaignId=String(body?.campaign_id||"");
 if(campaignId&&!/^[0-9a-f-]{36}$/i.test(campaignId))throw Error("ID kampanye tidak valid");
 const day=todayWita();
 await db.prepare("INSERT INTO acquisition_cta_clicks(observed_on,source,campaign_id,clicks) VALUES(?,?,?,1) "+
  "ON CONFLICT(observed_on,source,campaign_id) DO UPDATE SET clicks=clicks+1")
  .bind(day,source,campaignId).run();
 return {accepted:true,unique_visitors_measured:false};
}
export async function outboundWhatsApp(req,db){
 const u=new URL(req.url),channel=String(u.searchParams.get("source")||"");
 if(!whitelist.has(channel))return new Response("Sumber tidak valid",{status:400});
 const cid=String(u.searchParams.get("campaign")||"");
 if(cid&&!/^[0-9a-f-]{36}$/i.test(cid))return new Response("Kampanye tidak valid",{status:400});
 await recordWhatsAppClick(db,{source:channel,campaign_id:cid});
 const prefill=(/^(CAMPAIGN_)/.test(channel)?
   "Hello Nusa Penida Experiences, I saw your "+(channel==="CAMPAIGN_INSTAGRAM"?"Instagram":"Facebook")+" travel post. Please help me check tour options, dates and availability.":
   "Halo Nusa Penida Experiences, saya ingin menanyakan tanggal perjalanan, jumlah peserta dan pilihan tour.");
 const loc="https://wa.me/628561752525?text="+encodeURIComponent(prefill+(cid?" [ref:"+cid.slice(0,8)+"]":""));
 return new Response(null,{status:302,headers:{"location":loc,"cache-control":"no-store","referrer-policy":"no-referrer"}});
}
