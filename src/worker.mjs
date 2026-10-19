import {calculate,aiSuggestion,PricingError} from "./pricing.mjs";
import {payablesForLines,validateChange,allowedChangeTransition,OperationsError} from "./operations.mjs";
import {leadScore,salesDraft,weeklyDrafts} from "./sales.mjs";
import {cancellationPreview,CANCELLATION_POLICY_VERSION} from "./cancellation.mjs";
import {servePhoto} from "./photos.mjs";
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const bad=(message,status=400)=>json({error:message},status);
const str=(x,n=160)=>String(x??"").trim().slice(0,n);
const number=(x,min=0,max=100000000)=>Number.isSafeInteger(Number(x))&&Number(x)>=min&&Number(x)<=max?Number(x):null;
const uuid=()=>crypto.randomUUID();
const experienceVariants={
 SNORKELING_3_SPOTS:{SHARING:["STANDARD_3_SPOTS"],PRIVATE:["MANTA_BAY","MANTA_POINT"]},
 ISLAND_TOUR_CAR:{SHARING:["WEST","EAST"],PRIVATE:["WEST","EAST"]}
};
const variantAllowed=(activity,mode,variant)=>mode==="LEGACY"?variant==="DEFAULT":variant==="DEFAULT"||!!experienceVariants[activity]?.[mode]?.includes(variant);

const dateOK=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+"T00:00:00Z"))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
async function parse(req){const raw=await req.text();if(raw.length>12000)throw Error("Request terlalu besar");return JSON.parse(raw);}
async function owner(req,env){
 const expected=env.ADMIN_TOKEN||"";
 if(expected.length<24)return false;
 const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 const [a,b]=await Promise.all([crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)),crypto.subtle.digest("SHA-256",new TextEncoder().encode(expected))]);
 let d=0;const x=new Uint8Array(a),y=new Uint8Array(b);for(let i=0;i<x.length;i++)d|=x[i]^y[i];return d===0&&token.length===expected.length;
}
async function audit(db,kind,key,action,detail={}){
 await db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)").bind(uuid(),kind,key,action,JSON.stringify(detail)).run();
}
async function activeRate(db,operator,item,bookingMode="LEGACY",variantId="DEFAULT"){
 return db.prepare("SELECT r.* FROM rates r JOIN operators o ON o.id=r.operator_id WHERE r.operator_id=? AND r.item_id=? AND r.booking_mode=? AND r.variant_id=? AND r.active=1 AND r.verified=1 AND o.status='VERIFIED' ORDER BY r.version DESC LIMIT 1").bind(operator,item,bookingMode,variantId).first();
}
async function makePrice(db,b){
 const a=str(b.activity_id,80),op=str(b.operator_id,80),n=number(b.guests,1,100),mode=str(b.booking_mode,16)||"LEGACY",variant=str(b.variant_id,40)||"DEFAULT";
 if(!["LEGACY","SHARING","PRIVATE"].includes(mode)||!variantAllowed(a,mode,variant))throw new PricingError("Jenis paket/rute belum dipilih dengan benar");
 if(!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(a)||!n)throw Error("Aktivitas atau guest tidak valid");
 const base=await activeRate(db,op,a,mode,variant),extras=[];
 for(const item of ["LUNCH","BOAT_OUT","BOAT_RETURN"]){
  const q=number(b.extras?.[item]??0,0,n);
  if(q===null)throw Error("Jumlah tambahan tidak valid");
  if(q>0){const extraOperator=str(b.extra_operators?.[item]||op,100);extras.push({item,qty:q,rate:await activeRate(db,extraOperator,item)});}
 }
 const cost=number(b.agency_costs??0),fee=number(b.payment_fee??0),sell=b.selling_price==null?null:number(b.selling_price,1);
 if(cost===null||fee===null||(b.selling_price!=null&&sell===null))throw Error("Biaya/harga tidak valid");
 const p=calculate({guests:n,base,extras,agencyCosts:cost,paymentFee:fee,sellingPrice:sell,bookingMode:mode,variantId:variant});
 return {...p,activity_id:a,operator_id:op,guests:n,booking_mode:mode,variant_id:variant,recommendation:aiSuggestion(p,number(b.market_reference,1)||null),fulfillment:mode==="SHARING"?"OPERATOR_PER_PERSON_GUARANTEE_REQUIRED":mode==="PRIVATE"?"EXCLUSIVE_OPERATOR_AVAILABILITY_REQUIRED":"LEGACY_QUOTE"};
}
async function route(req,env,ctx){
 const u=new URL(req.url),path=u.pathname,method=req.method,db=env.DB;
 if(path.startsWith("/photos/"))return servePhoto(req,env,ctx);
 if(method==="OPTIONS")return new Response(null,{status:204,headers:{allow:"GET,POST,PATCH,DELETE"}});
 if(path==="/api/health")return json({status:db?"ok":"database_missing",version:"3.0.4",db:!!db,ai:!!env.AI});
 if(!db)return bad("D1 database belum aktif",503);
 if(path==="/api/public/cancellation-policy"&&method==="GET")return json({version:CANCELLATION_POLICY_VERSION,tiers:[{days:"H-7+",forfeit_percent:25},{days:"H-6 s.d. H-3",forfeit_percent:50},{days:"H-2 s.d. H-1",forfeit_percent:75},{days:"Hari H/no-show",forfeit_percent:100}],status:"DRAFT_REQUIRES_BUSINESS_REVIEW",special_cases:"Pembatalan operator/tidak aman ditinjau terpisah untuk perlindungan guest."});
 if(path==="/api/public/catalog"&&method==="GET"){
  const rows=await db.prepare("SELECT id,title,category,description FROM activities ORDER BY category DESC,id").all();
  return json({items:rows.results,variants:experienceVariants,modes:[{id:"SHARING",description:"Bisa digabung dengan guest lain; operator menjamin tarif per peserta tanpa minimal kuota yang dibebankan ke agen."},{id:"PRIVATE",description:"Perjalanan eksklusif mulai satu guest, selama biaya tetap, tambahan dan margin aman terpenuhi."}],note:"Snorkeling dan island tour tidak dilaksanakan pada hari yang sama. Harga dan jadwal final harus dikonfirmasi."});
 }
 if(path==="/api/public/readiness"&&method==="GET"){
  const info=await db.prepare("SELECT legal_name,public_contact,privacy_approved,refund_policy_approved,trade_brand FROM business_profile WHERE id=1").first();
  const live=env.PUBLIC_LEADS_ENABLED==="true"&&!!env.TURNSTILE_SECRET&&!!info?.legal_name&&!!info?.public_contact&&info.privacy_approved===1&&info.refund_policy_approved===1;
  return json({accepting_leads:!!live,business_name:info?.legal_name||"",trade_brand:info?.trade_brand||"Penivara Experiences",payment_methods:{bank_transfer:"manual_only",qris:"NOT_CONFIGURED"},business_contact:info?.public_contact||"",privacy_page:"/privacy.html",terms_page:"/terms.html",turnstile_required:true});
 }
 if(path==="/api/public/leads"&&method==="POST"){
  const info=await db.prepare("SELECT legal_name,public_contact,privacy_approved,refund_policy_approved,trade_brand FROM business_profile WHERE id=1").first();
  if(env.PUBLIC_LEADS_ENABLED!=="true"||!env.TURNSTILE_SECRET||!info?.legal_name||!info?.public_contact||info.privacy_approved!==1||info.refund_policy_approved!==1)return bad("Form guest belum siap menerima data; hubungi kontak resmi agen",503);
  const b=await parse(req);
  if(b.website)return json({accepted:true});
  const token=str(b["cf-turnstile-response"],2048);
  if(!token||token.length<12)return bad("Verifikasi anti-bot diperlukan",403);
  try{
   const form=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token,remoteip:req.headers.get("cf-connecting-ip")||""});
   const verified=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:form,signal:AbortSignal.timeout(8000)});
   if(!verified.ok)return bad("Verifikasi anti-bot sementara tidak tersedia",503);
   const v=await verified.json();
   if(v.success!==true||v.hostname!==u.hostname||v.action!=="lead_enquiry")return bad("Verifikasi anti-bot tidak sah",403);
  }catch(_){return bad("Verifikasi anti-bot sementara tidak tersedia",503);}
  const name=str(b.name,100),contact=str(b.contact,100),activity=str(b.activity_id,80),mode=str(b.booking_mode,16),variant=str(b.variant_id,40),n=number(b.guests,1,100),day=str(b.requested_date,10),message=str(b.message,800);
  if(name.length<2||contact.length<5||n>(activity==="ISLAND_TOUR_CAR"?7:20)||!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity)||!["SHARING","PRIVATE"].includes(mode)||!variantAllowed(activity,mode,variant)||!n||!dateOK(day)||day<new Date().toISOString().slice(0,10)||b.consent!==true)return bad("Data guest/tanggal/consent tidak lengkap");
  const ip=str(req.headers.get("cf-connecting-ip")||"unknown");
  const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip+":"+(env.RATE_SALT||"tour")));
  const key=Array.from(new Uint8Array(hash)).slice(0,12).map(x=>x.toString(16).padStart(2,"0")).join("")+":"+new Date().toISOString().slice(0,10);
  const count=await db.prepare("SELECT amount FROM lead_limits WHERE id=?").bind(key).first();
  if((count?.amount||0)>=10)return bad("Batas permintaan harian tercapai",429);
  const leadId=uuid();
  const statements=[
   db.prepare("INSERT INTO lead_limits(id,amount) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET amount=amount+1").bind(key),
   db.prepare("INSERT INTO leads(id,name,contact,activity_id,guests,requested_date,message,consent,booking_mode,variant_id) VALUES(?,?,?,?,?,?,?,1,?,?)").bind(leadId,name,contact,activity,n,day,message,mode,variant)
  ];
  const campaignId=str(b.campaign_id,100);
  if(campaignId){const campaign=await db.prepare("SELECT id FROM campaign_drafts WHERE id=? AND status='PUBLISHED'").bind(campaignId).first();if(campaign)statements.push(db.prepare("INSERT INTO lead_attribution(lead_id,campaign_id) VALUES(?,?)").bind(leadId,campaign.id));}
  await db.batch(statements);
  return json({accepted:true,reference:leadId,message:"Permintaan tercatat; belum ada konfirmasi booking."},201);
 }
 if(!path.startsWith("/api/admin/"))return bad("Endpoint tidak ditemukan",404);
 if(!env.ADMIN_TOKEN||env.ADMIN_TOKEN.length<24)return bad("Set ADMIN_TOKEN secret terlebih dahulu",503);
 if(!(await owner(req,env)))return bad("Akses owner diperlukan",401);
 if(path==="/api/admin/business"){
  if(method==="GET"){
   const info=await db.prepare("SELECT * FROM business_profile WHERE id=1").first();
   return json({business:info});
  }
  if(method==="PATCH"){
   const b=await parse(req),name=str(b.legal_name,150),contact=str(b.public_contact,150),brand=str(b.trade_brand,150)||"Penivara Experiences";
   if(name.length<3||contact.length<5)return bad("Identitas bisnis dan kontak resmi wajib diisi");
   if(!/^([+0-9][0-9 -]{6,}|[^@\s]+@[^@\s]+\.[^@\s]+)$/.test(contact))return bad("Kontak harus berupa telepon atau email resmi");
   const privacy=b.privacy_approved===true?1:0,refund=b.refund_policy_approved===true?1:0;
   await db.prepare("UPDATE business_profile SET legal_name=?,public_contact=?,privacy_approved=?,refund_policy_approved=?,trade_brand=?,updated_at=CURRENT_TIMESTAMP WHERE id=1").bind(name,contact,privacy,refund,brand).run();
   await audit(db,"business","1","PROFILE_UPDATED",{privacy,refund});
   return json({updated:true,acceptance_requires_cloudflare_flag:true});
  }
 }
 if(path==="/api/admin/summary"&&method==="GET"){
  const table=["operators","leads","quotes","bookings"],values=await Promise.all(table.map(t=>db.prepare("SELECT COUNT(*) n FROM "+t).first()));
  return json(Object.fromEntries(table.map((t,i)=>[t,values[i].n])));
 }
 if(path==="/api/admin/operators"){
  if(method==="GET")return json({items:(await db.prepare("SELECT * FROM operators ORDER BY created_at DESC").all()).results});
  if(method==="POST"){
   const b=await parse(req),name=str(b.name,120),contact=str(b.contact,100),notes=str(b.notes,500);
   if(name.length<3)return bad("Nama operator minimal 3 karakter");
   const id=uuid();await db.prepare("INSERT INTO operators(id,name,contact,notes) VALUES(?,?,?,?)").bind(id,name,contact,notes).run();
   await audit(db,"operator",id,"CREATE",{name});return json({id,status:"DRAFT"},201);
  }
 }
 const opMatch=path.match(/^\/api\/admin\/operators\/([^/]+)\/status$/);
 if(opMatch&&method==="PATCH"){
  const b=await parse(req),status=str(b.status,20);
  if(!["DRAFT","VERIFIED","INACTIVE"].includes(status))return bad("Status tidak valid");
  const old=await db.prepare("SELECT id FROM operators WHERE id=?").bind(opMatch[1]).first();
  if(!old)return bad("Operator tidak ditemukan",404);
  await db.prepare("UPDATE operators SET status=? WHERE id=?").bind(status,old.id).run();
  await audit(db,"operator",old.id,"STATUS",{status});return json({id:old.id,status});
 }
 if(path==="/api/admin/rates"){
  if(method==="GET")return json({items:(await db.prepare("SELECT r.*,o.name operator_name,a.title item_title FROM rates r JOIN operators o ON o.id=r.operator_id JOIN activities a ON a.id=r.item_id ORDER BY r.created_at DESC,r.version DESC").all()).results});
  if(method==="POST"){
   const b=await parse(req),op=str(b.operator_id,100),item=str(b.item_id,80),net=number(b.net,1),unit=str(b.unit,12),cap=b.capacity==null?null:number(b.capacity,1,30),mode=str(b.booking_mode,16)||"LEGACY",variant=str(b.variant_id,40)||"DEFAULT",scheme=str(b.pricing_scheme,24)||"STANDARD",fixed=number(b.private_fixed_net??0,0),guaranteed=b.sharing_guaranteed===true?1:0;
   const products=["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR","LUNCH","BOAT_OUT","BOAT_RETURN"];
   if(!products.includes(item)||net===null||fixed===null||!["LEGACY","SHARING","PRIVATE"].includes(mode)||!["STANDARD","FIXED_PACKAGE","FIXED_VEHICLE"].includes(scheme))return bad("Tarif/mode belum valid");
   if(!["LUNCH","BOAT_OUT","BOAT_RETURN"].includes(item)&&!variantAllowed(item,mode,variant))return bad("Rute/varian tidak sesuai paket");
   if(["LUNCH","BOAT_OUT","BOAT_RETURN"].includes(item)&&variant!=="DEFAULT")return bad("Add-on harus memakai varian DEFAULT");
   if(item==="ISLAND_TOUR_CAR"&&cap!==null&&cap>7)return bad("Kapasitas maksimum aman island tour adalah 7 guest");
   const isExperience=["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(item);
   if(!isExperience&&mode!=="LEGACY")return bad("Lunch dan fast boat ditarifkan per orang, bukan sebagai mode pengalaman");
   if(isExperience&&mode!=="LEGACY"){
    if(cap===null&&b.verified===true)return bad("Kapasitas kendaraan/kapal wajib dikonfirmasi operator sebelum verifikasi tarif");
    if(item==="ISLAND_TOUR_CAR"&&variant==="DEFAULT"){
      if(mode==="SHARING"&&(unit!=="person"||scheme!=="STANDARD"||guaranteed!==1||fixed!==0||cap>7))return bad("Tarif sharing lama perlu jaminan operator");
      if(mode==="PRIVATE"&&(unit!=="car"||scheme!=="STANDARD"||fixed!==0||cap>7))return bad("Tarif private mobil lama tidak valid");
    }else if(item==="ISLAND_TOUR_CAR"&&variant!=="DEFAULT"){
      if(unit!=="car"||scheme!=="FIXED_VEHICLE"||cap>7||fixed!==0||guaranteed!==0)return bad("Tour Barat/Timur Sharing maupun Private harus memakai biaya SATU mobil penuh, maksimal 7 guest");
    }else if(mode==="SHARING"){
      if(unit!=="person"||scheme!=="STANDARD"||guaranteed!==1||fixed!==0||(item==="SNORKELING_3_SPOTS"?cap>20:cap>7))return bad("Snorkeling Sharing harus dijamin operator per orang, maksimal 20");
    }else if(mode==="PRIVATE"){
      if(unit!=="person"||(variant==="DEFAULT"?scheme!=="STANDARD"||fixed<1:scheme!=="FIXED_PACKAGE"||fixed!==0)||guaranteed!==0)return bad("Snorkeling Private harga paket all-in satu booking, bukan per guest");
    }
   }else if(item==="ISLAND_TOUR_CAR"?(unit!=="car"||cap===null):unit!=="person")return bad("Satuan/kapasitas tarif lama tidak valid");
   const ownerOp=await db.prepare("SELECT status FROM operators WHERE id=?").bind(op).first();
   if(!ownerOp)return bad("Operator tidak ditemukan",404);
   const approved=b.verified===true&&ownerOp.status==="VERIFIED"?1:0;
   const prev=await db.prepare("SELECT COALESCE(MAX(version),0) n FROM rates WHERE operator_id=? AND item_id=? AND booking_mode=? AND variant_id=?").bind(op,item,mode,variant).first();
   const id=uuid();
   await db.batch([
    db.prepare("UPDATE rates SET active=0 WHERE operator_id=? AND item_id=? AND booking_mode=? AND variant_id=?").bind(op,item,mode,variant),
    db.prepare("INSERT INTO rates(id,operator_id,item_id,unit,net,capacity,verified,version,booking_mode,private_fixed_net,sharing_guaranteed,variant_id,pricing_scheme) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,op,item,unit,net,cap,approved,prev.n+1,mode,fixed,guaranteed,variant,scheme)
   ]);
   await audit(db,"rate",id,"NEW_VERSION",{operator:op,item,net,booking_mode:mode,variant_id:variant,pricing_scheme:scheme,private_fixed_net:fixed,sharing_guaranteed:guaranteed,approved});
   return json({id,version:prev.n+1,verified:!!approved},201);
  }
 }
 if(path==="/api/admin/leads"&&method==="GET")return json({items:(await db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 300").all()).results});
 const lm=path.match(/^\/api\/admin\/leads\/([^/]+)$/);
 if(lm&&method==="PATCH"){
  const b=await parse(req),status=str(b.status,24);
  if(!["NEW","QUALIFIED","CONTACTED","CLOSED","LOST"].includes(status))return bad("Status lead tidak valid");
  await db.prepare("UPDATE leads SET status=? WHERE id=?").bind(status,lm[1]).run();await audit(db,"lead",lm[1],"STATUS",{status});return json({id:lm[1],status});
 }
 if(path==="/api/admin/quotes/preview"&&method==="POST")return json({preview:await makePrice(db,await parse(req)),binding:false});
 if(path==="/api/admin/quotes"){
  if(method==="GET")return json({items:(await db.prepare("SELECT q.*,o.name operator_name FROM quotes q JOIN operators o ON o.id=q.operator_id ORDER BY q.created_at DESC LIMIT 300").all()).results});
  if(method==="POST"){
   const b=await parse(req);
   if(env.PUBLIC_LEADS_ENABLED==="true"&&b.terms_accepted!==true)return bad("Guest wajib menyetujui ketentuan yang diberikan sebelum penawaran disimpan",422);
   if(!dateOK(b.requested_date)||b.requested_date<new Date().toISOString().slice(0,10))return bad("Tanggal wisata tidak valid");
   const quote=await makePrice(db,b);if(quote.sellingPrice===null)return bad("Harga jual harus disetujui owner");
   const id=uuid();
   await db.prepare("INSERT INTO quotes(id,lead_id,operator_id,activity_id,guests,requested_date,net,minimum,selling_price,snapshot,booking_mode,variant_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,b.lead_id||null,quote.operator_id,quote.activity_id,quote.guests,b.requested_date,quote.net,quote.minimum,quote.sellingPrice,JSON.stringify({...quote,cancellation_policy_version:CANCELLATION_POLICY_VERSION,guest_terms_acknowledged:b.terms_accepted===true,payment_method:"BANK_TRANSFER_MANUAL",qris_available:false}),quote.booking_mode,quote.variant_id).run();
   await audit(db,"quote",id,"CREATE",{status:"DRAFT"});return json({id,quote,status:"DRAFT"},201);
  }
 }
 const qm=path.match(/^\/api\/admin\/quotes\/([^/]+)\/status$/);
 if(qm&&method==="PATCH"){
  const b=await parse(req),status=str(b.status,40);
  const q=await db.prepare("SELECT status FROM quotes WHERE id=?").bind(qm[1]).first();
  if(!q)return bad("Quote tidak ada",404);
  const transitions={DRAFT:["OPERATOR_CONFIRMED","CANCELLED"],OPERATOR_CONFIRMED:["APPROVED","CANCELLED"],APPROVED:["CANCELLED"],CANCELLED:[]};
  if(!transitions[q.status]?.includes(status))return bad("Transisi status tidak diizinkan");
  await db.prepare("UPDATE quotes SET status=? WHERE id=?").bind(status,qm[1]).run();await audit(db,"quote",qm[1],"STATUS",{from:q.status,to:status});return json({id:qm[1],status});
 }
 if(path==="/api/admin/bookings"){
  if(method==="GET")return json({items:(await db.prepare("SELECT b.*,q.guests,q.activity_id,COALESCE(s.service_date,q.requested_date) requested_date,q.selling_price,m.guest_name,m.guest_contact,m.pickup,m.special_notes,m.confirmed manifest_confirmed FROM bookings b JOIN quotes q ON q.id=b.quote_id LEFT JOIN booking_schedule s ON s.booking_id=b.id LEFT JOIN booking_manifest m ON m.booking_id=b.id ORDER BY b.created_at DESC LIMIT 300").all()).results});
  if(method==="POST"){
   const b=await parse(req),q=await db.prepare("SELECT * FROM quotes WHERE id=? AND status='APPROVED'").bind(str(b.quote_id,100)).first();
   if(!q)return bad("Harga/jadwal belum disetujui operator dan owner");
   let snapshot;
   try{snapshot=JSON.parse(q.snapshot)}catch{return bad("Snapshot quote tidak valid",409)}
   const ids=[...new Set((snapshot.lines||[]).map(l=>l.rate_id))];
   if(!ids.length)return bad("Penawaran belum memiliki item tarif");
   const owners={};
   for(const rateId of ids){const r=await db.prepare("SELECT operator_id FROM rates WHERE id=?").bind(rateId).first();if(!r)return bad("Tarif historis tidak ada",409);owners[rateId]=r.operator_id;}
   const payables=payablesForLines(snapshot.lines,owners,q.net);
   const id=uuid(),statements=[db.prepare("INSERT INTO bookings(id,quote_id) VALUES(?,?)").bind(id,q.id)];
   for(const p of payables)statements.push(db.prepare("INSERT INTO booking_payables(booking_id,operator_id,net_amount) VALUES(?,?,?)").bind(id,p.operator_id,p.net_amount));
   if(q.lead_id){
    const lead=await db.prepare("SELECT name,contact FROM leads WHERE id=?").bind(q.lead_id).first();
    if(lead)statements.push(db.prepare("INSERT INTO booking_manifest(booking_id,guest_name,guest_contact) VALUES(?,?,?)").bind(id,lead.name,lead.contact));
   }
   statements.push(db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)").bind(uuid(),"booking",id,"CREATE",JSON.stringify({quote:q.id,providers:payables.length})));
   await db.batch(statements);
   return json({id,status:"AWAITING_PAYMENT",operator_payables:payables},201);
  }
 }
 const bm=path.match(/^\/api\/admin\/bookings\/([^/]+)\/(payment|handover)$/);
 if(bm&&method==="POST"){
  const b=await parse(req),booking=await db.prepare("SELECT * FROM bookings WHERE id=?").bind(bm[1]).first();
  if(!booking)return bad("Booking tidak ditemukan",404);
  if(bm[2]==="payment"){
   const ref=str(b.reference,120);
   if(booking.payment_status!=="UNPAID"||booking.status!=="AWAITING_PAYMENT"||ref.length<5||b.owner_confirmed!==true)return bad("Harus verifikasi dana nyata; pembayaran belum dapat ditandai");
   const activeChange=await db.prepare("SELECT COUNT(*) n FROM booking_changes WHERE booking_id=? AND status='REQUESTED'").bind(bm[1]).first();
   if(activeChange?.n)return bad("Selesaikan perubahan booking sebelum menerima pembayaran",409);
   const paymentResult=await db.prepare("UPDATE bookings SET payment_status='PAID',status='PAID',reference=?,paid_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='UNPAID' AND status='AWAITING_PAYMENT'").bind(ref,bm[1]).run();
   if(paymentResult.meta?.changes!==1)return bad("Pembayaran sudah diproses oleh permintaan lain",409);
   await audit(db,"booking",bm[1],"PAYMENT_VERIFIED",{reference:ref});return json({status:"PAID"});
  }
  if(booking.payment_status!=="PAID"||booking.status!=="PAID"||b.operator_acknowledged!==true)return bad("Pembayaran lunas dan pengakuan operator wajib");
  const manifest=await db.prepare("SELECT confirmed FROM booking_manifest WHERE booking_id=?").bind(bm[1]).first();
  if(manifest?.confirmed!==1)return bad("Manifest guest belum dikonfirmasi pemilik");
  const pending=await db.prepare("SELECT COUNT(*) n FROM booking_changes WHERE booking_id=? AND status IN ('REQUESTED','APPROVED')").bind(bm[1]).first();
  if(pending?.n)return bad("Masih ada permintaan perubahan/refund yang belum selesai");
  const result=await db.prepare("UPDATE bookings SET status='HANDED_OVER',handed_over_at=CURRENT_TIMESTAMP WHERE id=? AND status='PAID' AND payment_status='PAID'").bind(bm[1]).run();
  if(result.meta?.changes!==1)return bad("Booking sudah ditangani oleh permintaan lain",409);
  await audit(db,"booking",bm[1],"HANDOVER");return json({status:"HANDED_OVER"});
 }

 if(path==="/api/admin/finance" && method==="GET"){
  const [payables,changes]=await Promise.all([
    db.prepare("SELECT p.*,o.name operator_name,q.activity_id,q.requested_date,q.selling_price FROM booking_payables p JOIN operators o ON o.id=p.operator_id JOIN bookings b ON b.id=p.booking_id JOIN quotes q ON q.id=b.quote_id ORDER BY p.created_at DESC LIMIT 400").all(),
    db.prepare("SELECT c.*,q.activity_id FROM booking_changes c JOIN bookings b ON b.id=c.booking_id JOIN quotes q ON q.id=b.quote_id ORDER BY c.created_at DESC LIMIT 400").all()
  ]);
  return json({payables:payables.results,changes:changes.results});
 }
 const manifestMatch=path.match(/^\/api\/admin\/bookings\/([^/]+)\/manifest$/);
 if(manifestMatch&&method==="POST"){
  const booking=await db.prepare("SELECT id,status FROM bookings WHERE id=?").bind(manifestMatch[1]).first();
  if(!booking)return bad("Booking tidak ditemukan",404);
  if(["HANDED_OVER","REFUNDED","CANCELLED"].includes(booking.status))return bad("Manifest booking sudah terkunci",409);
  const b=await parse(req),name=str(b.guest_name,120),contact=str(b.guest_contact,160),pickup=str(b.pickup,300),notes=str(b.special_notes,500);
  if(name.length<2||contact.length<5||b.owner_confirmed!==true)return bad("Identitas guest dan konfirmasi pemilik wajib");
  await db.prepare("INSERT INTO booking_manifest(booking_id,guest_name,guest_contact,pickup,special_notes,confirmed) VALUES(?,?,?,?,?,1) ON CONFLICT(booking_id) DO UPDATE SET guest_name=excluded.guest_name,guest_contact=excluded.guest_contact,pickup=excluded.pickup,special_notes=excluded.special_notes,confirmed=1,updated_at=CURRENT_TIMESTAMP").bind(booking.id,name,contact,pickup,notes).run();
  await audit(db,"manifest",booking.id,"OWNER_CONFIRMED",{pickup,has_contact:true});
  return json({id:booking.id,manifest_confirmed:true});
 }
 const payMatch=path.match(/^\/api\/admin\/bookings\/([^/]+)\/payables\/([^/]+)\/pay$/);
 if(payMatch && method==="POST"){
  const b=await parse(req),reference=str(b.reference,120);
  if(b.owner_confirmed!==true||reference.length<5)return bad("Referensi transfer dan verifikasi pemilik wajib");
  const booking=await db.prepare("SELECT payment_status,status FROM bookings WHERE id=?").bind(payMatch[1]).first();
  if(!booking||booking.payment_status!=="PAID"||["REFUNDED","REFUND_PENDING","CANCELLED"].includes(booking.status))return bad("Pembayaran guest belum beres atau refund masih berlangsung",409);
  const pending=await db.prepare("SELECT COUNT(*) n FROM booking_changes WHERE booking_id=? AND status IN ('REQUESTED','APPROVED') AND change_type IN ('CANCEL','REFUND')").bind(payMatch[1]).first();
  if(pending?.n)return bad("Ada permintaan pembatalan/refund aktif");
  const result=await db.prepare("UPDATE booking_payables SET status='PAID',reference=?,paid_at=CURRENT_TIMESTAMP WHERE booking_id=? AND operator_id=? AND status='DUE'").bind(reference,payMatch[1],payMatch[2]).run();
  if(result.meta?.changes!==1)return bad("Tagihan operator tidak ada/sudah dibayar",409);
  await audit(db,"payable",payMatch[1],"PAID",{operator_id:payMatch[2],reference});
  return json({booking_id:payMatch[1],operator_id:payMatch[2],status:"PAID"});
 }
 const cancelPreview=path.match(/^\/api\/admin\/bookings\/([^/]+)\/cancellation-preview$/);
 if(cancelPreview&&method==="POST"){
  const booking=await db.prepare("SELECT b.*,q.selling_price,COALESCE(s.service_date,q.requested_date) service_date FROM bookings b JOIN quotes q ON q.id=b.quote_id LEFT JOIN booking_schedule s ON s.booking_id=b.id WHERE b.id=?").bind(cancelPreview[1]).first();
  if(!booking)return bad("Booking tidak ditemukan",404);
  const payload=await parse(req),cause=str(payload.cause,32)||"GUEST";
  const costs=await db.prepare("SELECT SUM(net_amount) n FROM booking_payables WHERE booking_id=? AND status='PAID'").bind(booking.id).first();
  return json({preview:cancellationPreview({sellingPrice:booking.selling_price,serviceDate:booking.service_date,requestedOn:new Date().toISOString().slice(0,10),cause,nonRecoverableSupplierIdr:costs?.n??0}),notice:"Beban supplier lain dan hukum berlaku harus diperiksa pemilik."});
 }
 const changeCreate=path.match(/^\/api\/admin\/bookings\/([^/]+)\/changes$/);
 if(changeCreate && method==="POST"){
  const booking=await db.prepare("SELECT b.*,q.selling_price FROM bookings b JOIN quotes q ON q.id=b.quote_id WHERE b.id=?").bind(changeCreate[1]).first();
  if(!booking)return bad("Booking tidak ditemukan",404);
  const p=await db.prepare("SELECT COUNT(*) n FROM booking_changes WHERE booking_id=? AND status IN ('REQUESTED','APPROVED')").bind(booking.id).first();
  if(p?.n)return bad("Ada permintaan perubahan aktif",409);
  const b=await parse(req),data={change_type:str(b.change_type,16),reason:str(b.reason,500),requested_date:str(b.requested_date,10),refund_amount:number(b.refund_amount??0)};
  let policy=null;
  if(data.change_type==="REFUND"){
   const schedule=await db.prepare("SELECT COALESCE(s.service_date,q.requested_date) day FROM bookings bo JOIN quotes q ON q.id=bo.quote_id LEFT JOIN booking_schedule s ON s.booking_id=bo.id WHERE bo.id=?").bind(booking.id).first();
   const paid=await db.prepare("SELECT SUM(net_amount) n FROM booking_payables WHERE booking_id=? AND status='PAID'").bind(booking.id).first();
   policy=cancellationPreview({sellingPrice:booking.selling_price,serviceDate:schedule.day,requestedOn:new Date().toISOString().slice(0,10),cause:str(b.cancellation_cause,32)||(/\b(weather|cuaca|unsafe|operator cancelled)\b/i.test(data.reason)?"OPERATOR_OR_SAFETY":"GUEST"),nonRecoverableSupplierIdr:paid?.n??0});
  }
  validateChange(data,booking,booking.selling_price,policy?.refundIdr);
  const cid=uuid();
  await db.prepare("INSERT INTO booking_changes(id,booking_id,change_type,requested_date,refund_amount,reason,penalty_amount,cancellation_policy_version,cancellation_cause) VALUES(?,?,?,?,?,?,?,?,?)").bind(cid,booking.id,data.change_type,data.change_type==="RESCHEDULE"?data.requested_date:null,data.change_type==="REFUND"?data.refund_amount:0,data.reason,policy?.penaltyIdr||0,policy?.policyVersion||null,policy?.cause||null).run();
  await audit(db,"change",cid,"REQUESTED",{booking_id:booking.id,type:data.change_type});
  return json({id:cid,status:"REQUESTED"},201);
 }
 const changeMatch=path.match(/^\/api\/admin\/bookings\/([^/]+)\/changes\/([^/]+)$/);
 if(changeMatch && method==="PATCH"){
  const b=await parse(req),next=str(b.status,18),c=await db.prepare("SELECT * FROM booking_changes WHERE id=? AND booking_id=?").bind(changeMatch[2],changeMatch[1]).first();
  if(!c)return bad("Permintaan perubahan tidak ditemukan",404);
  if(next==="APPROVED"&&c.change_type==="REFUND"&&c.cancellation_cause==="GUEST"&&b.supplier_exposure_reviewed!==true)return bad("Owner wajib memeriksa biaya dan kewajiban operator sebelum menyetujui refund",422);
  allowedChangeTransition(c,next,b);
  // An approved reschedule has already changed booking_schedule, so it is executed immediately.
  // Leaving it APPROVED would permanently prevent handover.
  const applied=next==="APPROVED"&&c.change_type==="RESCHEDULE"?"EXECUTED":next;
  const stmts=[db.prepare("UPDATE booking_changes SET status=?,updated_at=CURRENT_TIMESTAMP,external_reference=? WHERE id=? AND status=?").bind(applied,next==="EXECUTED"?str(b.external_reference,120):null,c.id,c.status)];
  if(next==="APPROVED"){
   if(c.change_type==="RESCHEDULE"){
    stmts.push(db.prepare("INSERT INTO booking_schedule(booking_id,service_date,change_id) VALUES(?,?,?) ON CONFLICT(booking_id) DO UPDATE SET service_date=excluded.service_date,change_id=excluded.change_id,changed_at=CURRENT_TIMESTAMP").bind(c.booking_id,c.requested_date,c.id));
   }
   if(c.change_type==="CANCEL")stmts.push(db.prepare("UPDATE bookings SET status='CANCELLED' WHERE id=? AND payment_status='UNPAID'").bind(c.booking_id));
   if(c.change_type==="REFUND"){
    stmts.push(db.prepare("UPDATE bookings SET status='REFUND_PENDING' WHERE id=? AND payment_status='PAID'").bind(c.booking_id));
    stmts.push(db.prepare("UPDATE booking_payables SET status='ON_HOLD' WHERE booking_id=? AND status='DUE'").bind(c.booking_id));
   }
  }
  if(next==="EXECUTED"){
   if(c.refund_amount===0)stmts.push(db.prepare("UPDATE bookings SET status='CANCELLED' WHERE id=? AND status='REFUND_PENDING'").bind(c.booking_id));
   else stmts.push(db.prepare("UPDATE bookings SET status='REFUNDED',payment_status='REFUNDED' WHERE id=? AND status='REFUND_PENDING'").bind(c.booking_id));
  }
  stmts.push(db.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)").bind(uuid(),"change",c.id,applied,JSON.stringify({booking_id:c.booking_id,external_reference:next==="EXECUTED"?str(b.external_reference,120):null})));
  await db.batch(stmts);
  return json({id:c.id,status:applied});
 }

 if(path==="/api/admin/market"){
  if(method==="GET")return json({items:(await db.prepare("SELECT * FROM market_price_refs ORDER BY observed_on DESC,created_at DESC LIMIT 200").all()).results});
  if(method==="POST"){
   const b=await parse(req),platform=str(b.platform,100),activity=str(b.activity_id,80),url=str(b.source_url,500),price=number(b.price,1,100000000),unit=str(b.unit,12),size=b.group_size==null?null:number(b.group_size,1,100),observed=str(b.observed_on,10),inclusions=str(b.inclusions,600);
   if(platform.length<2||!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity)||!price||!["person","group"].includes(unit)||(unit==="group"&&!size)||!dateOK(observed)||observed>new Date().toISOString().slice(0,10))return bad("Data referensi pasar tidak valid");
   if(url&&!url.startsWith("https://"))return bad("Sumber harga harus alamat HTTPS");
   const id=uuid();await db.prepare("INSERT INTO market_price_refs(id,activity_id,platform,source_url,unit,group_size,price,inclusions,observed_on,verified) VALUES(?,?,?,?,?,?,?,?,?,?)").bind(id,activity,platform,url,unit,size,price,inclusions,observed,b.owner_confirmed===true?1:0).run();
   await audit(db,"market_reference",id,"RECORDED",{platform,activity,price,verified:b.owner_confirmed===true});
   return json({id,status:"REFERENCE_ONLY"},201);
  }
 }
 if(path==="/api/admin/campaigns"){
  if(method==="GET")return json({items:(await db.prepare("SELECT * FROM campaign_drafts ORDER BY created_at DESC LIMIT 200").all()).results});
  if(method==="POST"){
   const b=await parse(req),activity=str(b.activity_id,80),platform=str(b.platform,50),caption=str(b.caption,2500);
   if(!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity)||!["Instagram","Facebook","TikTok","Website","WhatsApp Status","WhatsApp Business","Google Business Profile","YouTube Shorts","Telegram","Tripadvisor","GetYourGuide (mitra)","Klook (mitra)"].includes(platform)||caption.length<20)return bad("Konten kampanye tidak lengkap");
   const id=uuid();await db.prepare("INSERT INTO campaign_drafts(id,activity_id,platform,caption) VALUES(?,?,?,?)").bind(id,activity,platform,caption).run();
   await audit(db,"campaign",id,"DRAFT_CREATED",{platform,activity});return json({id,status:"DRAFT"},201);
  }
 }
 const cm=path.match(/^\/api\/admin\/campaigns\/([^/]+)\/status$/);
 if(cm&&method==="PATCH"){
  const b=await parse(req),status=str(b.status,16),old=await db.prepare("SELECT status FROM campaign_drafts WHERE id=?").bind(cm[1]).first();
  if(!old)return bad("Kampanye tidak ditemukan",404);
  if(!((old.status==="DRAFT"&&status==="APPROVED")||(old.status==="APPROVED"&&status==="PUBLISHED")))return bad("Status kampanye tidak valid");
  if(b.owner_confirmed!==true)return bad("Persetujuan pemilik wajib");
  const posted=str(b.public_url,500);
  if(status==="PUBLISHED"&&!posted.startsWith("https://"))return bad("URL unggahan nyata dibutuhkan. Aplikasi tidak posting otomatis");
  await db.prepare("UPDATE campaign_drafts SET status=?,public_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,status==="PUBLISHED"?posted:null,cm[1]).run();
  await audit(db,"campaign",cm[1],status,{url:posted||null});return json({id:cm[1],status});
 }
 const sm=path.match(/^\/api\/admin\/leads\/([^/]+)\/assistant$/);
 if(sm&&method==="POST"){
  const lead=await db.prepare("SELECT * FROM leads WHERE id=?").bind(sm[1]).first();
  if(!lead)return bad("Lead tidak ditemukan",404);
  const b=await parse(req),result={lead_id:lead.id,...leadScore(lead),reply:salesDraft(lead),status:"DRAFT_REVIEW",generator:"template"};
  if(env.AI&&b.use_ai===true){
   try{
    const gen=await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast",{messages:[
     {role:"system",content:"Anda AI sales wisata Nusa Penida. Buat draf jawaban singkat. Jangan mengarang atau memastikan harga, spot snorkeling, fasilitas, ketersediaan, keselamatan, cuaca, maupun pembayaran. Draf selalu perlu persetujuan pemilik."},
     {role:"user",content:"Produk "+lead.activity_id+", peserta "+lead.guests+", tanggal "+lead.requested_date+", pesan "+str(lead.message,400)+". Tanpa mengirim kontak pribadi ke model."}
    ]});
    if(gen?.response){result.reply=str(gen.response,1400);result.generator="workers-ai";}
   }catch(_){}
  }
  return json(result);
 }
 if(path==="/api/admin/analytics"&&method==="GET"){
  const [l,q,b,c]=await Promise.all(["leads","quotes","bookings","campaign_drafts"].map(t=>db.prepare("SELECT status,COUNT(*) n FROM "+t+" GROUP BY status").all()));
  return json({leads:l.results,quotes:q.results,bookings:b.results,campaigns:c.results,note:"Jumlah views/klik marketplace belum tersedia dan tidak dipalsukan"});
 }
 if(path==="/api/admin/marketing/draft"&&method==="POST"){
  const b=await parse(req),activity=str(b.activity_id,80);
  if(!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity))return bad("Aktivitas tidak valid");
  const title=activity==="SNORKELING_3_SPOTS"?"Snorkeling 3 Spot Nusa Penida":"Island Tour Nusa Penida";
  const output={title,caption:"Jelajahi Nusa Penida bersama mitra operator lokal. Hubungi kami untuk konfirmasi tanggal, fasilitas, ketersediaan dan harga yang sesuai jumlah peserta.",status:"DRAFT_REVIEW",generator:"template"};
  if(env.AI&&b.use_ai===true){
   try{const result=await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast",{messages:[{role:"system",content:"Buat caption wisata singkat bahasa Indonesia. Jangan mengarang harga, spot, fasilitas, ketersediaan, asuransi atau klaim keselamatan. Draft butuh persetujuan."},{role:"user",content:"Buat konten promosi "+title}]});if(result?.response){output.caption=str(result.response,1300);output.generator="workers-ai"}}catch(_){}
  }
  return json(output);
 }
 return bad("Endpoint tidak ditemukan",404);
}
export default {
 async fetch(req,env,ctx){try{return await route(req,env,ctx)}catch(e){return bad(e instanceof SyntaxError?"JSON tidak valid":String(e.message||"Kesalahan"),e instanceof PricingError||e instanceof OperationsError?422:400)}},
 async scheduled(event,env){
  // Only creates reviewable content drafts. No external posting, guest messaging, or advertising spend.
  if(event.cron!=="0 1 * * 1"||!env.DB)return;
  const day=new Date().toISOString().slice(0,10),runId="campaign-week-"+day;
  const existing=await env.DB.prepare("SELECT id FROM scheduled_runs WHERE id=?").bind(runId).first();
  if(existing)return;
  const drafts=weeklyDrafts(day);
  const statements=[env.DB.prepare("INSERT INTO scheduled_runs(id,kind) VALUES(?,?)").bind(runId,"WEEKLY_MARKETING_DRAFTS")];
  for(const item of drafts)statements.push(env.DB.prepare("INSERT INTO campaign_drafts(id,activity_id,platform,caption,status) VALUES(?,?,?,?,?)").bind(uuid(),item.activity_id,item.platform,item.caption,"DRAFT"));
  statements.push(env.DB.prepare("INSERT INTO audit_log(id,entity,entity_id,action,detail) VALUES(?,?,?,?,?)").bind(uuid(),"scheduled_run",runId,"DRAFTS_CREATED",JSON.stringify({count:drafts.length})));
  await env.DB.batch(statements);
 }
};
