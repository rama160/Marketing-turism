import {calculate,aiSuggestion,PricingError} from "./pricing.mjs";
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const bad=(message,status=400)=>json({error:message},status);
const str=(x,n=160)=>String(x??"").trim().slice(0,n);
const number=(x,min=0,max=100000000)=>Number.isSafeInteger(Number(x))&&Number(x)>=min&&Number(x)<=max?Number(x):null;
const uuid=()=>crypto.randomUUID();
const dateOK=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+"T00:00:00Z"));
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
async function activeRate(db,operator,item){
 return db.prepare("SELECT r.* FROM rates r JOIN operators o ON o.id=r.operator_id WHERE r.operator_id=? AND r.item_id=? AND r.active=1 AND r.verified=1 AND o.status='VERIFIED' ORDER BY r.version DESC LIMIT 1").bind(operator,item).first();
}
async function makePrice(db,b){
 const a=str(b.activity_id,80),op=str(b.operator_id,80),n=number(b.guests,1,100);
 if(!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(a)||!n)throw Error("Aktivitas atau guest tidak valid");
 const base=await activeRate(db,op,a),extras=[];
 for(const item of ["LUNCH","BOAT_OUT","BOAT_RETURN"]){
  const q=number(b.extras?.[item]??0,0,n);
  if(q===null)throw Error("Jumlah tambahan tidak valid");
  if(q>0)extras.push({item,qty:q,rate:await activeRate(db,op,item)});
 }
 const cost=number(b.agency_costs??0),fee=number(b.payment_fee??0),sell=b.selling_price==null?null:number(b.selling_price,1);
 if(cost===null||fee===null||(b.selling_price!=null&&sell===null))throw Error("Biaya/harga tidak valid");
 const p=calculate({guests:n,base,extras,agencyCosts:cost,paymentFee:fee,sellingPrice:sell});
 return {...p,activity_id:a,operator_id:op,guests:n,recommendation:aiSuggestion(p,number(b.market_reference,1)||null)};
}
async function route(req,env){
 const u=new URL(req.url),path=u.pathname,method=req.method,db=env.DB;
 if(method==="OPTIONS")return new Response(null,{status:204,headers:{allow:"GET,POST,PATCH,DELETE"}});
 if(path==="/api/health")return json({status:db?"ok":"database_missing",version:"2.0.0",db:!!db,ai:!!env.AI});
 if(!db)return bad("D1 database belum aktif",503);
 if(path==="/api/public/catalog"&&method==="GET"){
  const rows=await db.prepare("SELECT id,title,category,description FROM activities ORDER BY category DESC,id").all();
  return json({items:rows.results,note:"Produk draft; harga dan jadwal final harus dikonfirmasi."});
 }
 if(path==="/api/public/leads"&&method==="POST"){
  if(env.PUBLIC_LEADS_ENABLED!=="true")return bad("Form guest belum diaktifkan pemilik",503);
  const b=await parse(req);
  if(b.website)return json({accepted:true});
  const name=str(b.name,100),contact=str(b.contact,100),activity=str(b.activity_id,80),n=number(b.guests,1,100),day=str(b.requested_date,10),message=str(b.message,800);
  if(name.length<2||contact.length<5||!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity)||!n||!dateOK(day)||day<new Date().toISOString().slice(0,10)||b.consent!==true)return bad("Data guest/tanggal/consent tidak lengkap");
  const ip=str(req.headers.get("cf-connecting-ip")||"unknown");
  const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ip+":"+(env.RATE_SALT||"tour")));
  const key=Array.from(new Uint8Array(hash)).slice(0,12).map(x=>x.toString(16).padStart(2,"0")).join("")+":"+new Date().toISOString().slice(0,10);
  const count=await db.prepare("SELECT amount FROM lead_limits WHERE id=?").bind(key).first();
  if((count?.amount||0)>=10)return bad("Batas permintaan harian tercapai",429);
  const leadId=uuid();
  await db.batch([
   db.prepare("INSERT INTO lead_limits(id,amount) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET amount=amount+1").bind(key),
   db.prepare("INSERT INTO leads(id,name,contact,activity_id,guests,requested_date,message,consent) VALUES(?,?,?,?,?,?,?,1)").bind(leadId,name,contact,activity,n,day,message)
  ]);
  return json({accepted:true,reference:leadId,message:"Permintaan tercatat; belum ada konfirmasi booking."},201);
 }
 if(!path.startsWith("/api/admin/"))return bad("Endpoint tidak ditemukan",404);
 if(!env.ADMIN_TOKEN||env.ADMIN_TOKEN.length<24)return bad("Set ADMIN_TOKEN secret terlebih dahulu",503);
 if(!(await owner(req,env)))return bad("Akses owner diperlukan",401);
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
   const b=await parse(req),op=str(b.operator_id,100),item=str(b.item_id,80),net=number(b.net,1),unit=str(b.unit,12),cap=b.capacity==null?null:number(b.capacity,1,30);
   const products=["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR","LUNCH","BOAT_OUT","BOAT_RETURN"];
   if(!products.includes(item)||net===null||(item==="ISLAND_TOUR_CAR"?(unit!=="car"||cap===null):unit!=="person"))return bad("Tarif, satuan, atau kapasitas tidak valid");
   const ownerOp=await db.prepare("SELECT status FROM operators WHERE id=?").bind(op).first();
   if(!ownerOp)return bad("Operator tidak ditemukan",404);
   const approved=b.verified===true&&ownerOp.status==="VERIFIED"?1:0;
   const prev=await db.prepare("SELECT COALESCE(MAX(version),0) n FROM rates WHERE operator_id=? AND item_id=?").bind(op,item).first();
   const id=uuid();
   await db.batch([
    db.prepare("UPDATE rates SET active=0 WHERE operator_id=? AND item_id=?").bind(op,item),
    db.prepare("INSERT INTO rates(id,operator_id,item_id,unit,net,capacity,verified,version) VALUES(?,?,?,?,?,?,?,?)").bind(id,op,item,unit,net,cap,approved,prev.n+1)
   ]);
   await audit(db,"rate",id,"NEW_VERSION",{operator:op,item,net,approved});
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
   if(!dateOK(b.requested_date)||b.requested_date<new Date().toISOString().slice(0,10))return bad("Tanggal wisata tidak valid");
   const quote=await makePrice(db,b);if(quote.sellingPrice===null)return bad("Harga jual harus disetujui owner");
   const id=uuid();
   await db.prepare("INSERT INTO quotes(id,lead_id,operator_id,activity_id,guests,requested_date,net,minimum,selling_price,snapshot) VALUES(?,?,?,?,?,?,?,?,?,?)").bind(id,b.lead_id||null,quote.operator_id,quote.activity_id,quote.guests,b.requested_date,quote.net,quote.minimum,quote.sellingPrice,JSON.stringify(quote)).run();
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
  if(method==="GET")return json({items:(await db.prepare("SELECT b.*,q.guests,q.activity_id,q.requested_date,q.selling_price FROM bookings b JOIN quotes q ON q.id=b.quote_id ORDER BY b.created_at DESC LIMIT 300").all()).results});
  if(method==="POST"){
   const b=await parse(req),q=await db.prepare("SELECT id FROM quotes WHERE id=? AND status='APPROVED'").bind(str(b.quote_id,100)).first();
   if(!q)return bad("Harga/jadwal belum disetujui operator dan owner");
   const id=uuid();await db.prepare("INSERT INTO bookings(id,quote_id) VALUES(?,?)").bind(id,q.id).run();await audit(db,"booking",id,"CREATE",{quote:q.id});return json({id,status:"AWAITING_PAYMENT"},201);
  }
 }
 const bm=path.match(/^\/api\/admin\/bookings\/([^/]+)\/(payment|handover)$/);
 if(bm&&method==="POST"){
  const b=await parse(req),booking=await db.prepare("SELECT * FROM bookings WHERE id=?").bind(bm[1]).first();
  if(!booking)return bad("Booking tidak ditemukan",404);
  if(bm[2]==="payment"){
   const ref=str(b.reference,120);
   if(booking.payment_status!=="UNPAID"||ref.length<5||b.owner_confirmed!==true)return bad("Harus verifikasi dana nyata; pembayaran belum dapat ditandai");
   await db.prepare("UPDATE bookings SET payment_status='PAID',status='PAID',reference=?,paid_at=CURRENT_TIMESTAMP WHERE id=?").bind(ref,bm[1]).run();
   await audit(db,"booking",bm[1],"PAYMENT_VERIFIED",{reference:ref});return json({status:"PAID"});
  }
  if(booking.payment_status!=="PAID"||booking.status!=="PAID"||b.operator_acknowledged!==true)return bad("Pembayaran lunas dan pengakuan operator wajib");
  await db.prepare("UPDATE bookings SET status='HANDED_OVER',handed_over_at=CURRENT_TIMESTAMP WHERE id=?").bind(bm[1]).run();
  await audit(db,"booking",bm[1],"HANDOVER");return json({status:"HANDED_OVER"});
 }
 if(path==="/api/admin/marketing/draft"&&method==="POST"){
  const b=await parse(req),activity=str(b.activity_id,80);
  if(!["SNORKELING_3_SPOTS","ISLAND_TOUR_CAR"].includes(activity))return bad("Aktivitas tidak valid");
  const title=activity==="SNORKELING_3_SPOTS"?"Snorkeling 3 Spot Nusa Penida":"Island Tour Nusa Penida";
  const output={title,caption:"Jelajahi Nusa Penida bersama mitra operator lokal. Hubungi kami untuk konfirmasi tanggal, fasilitas, ketersediaan dan harga yang sesuai jumlah peserta.",status:"DRAFT_REVIEW",generator:"template"};
  if(env.AI&&b.use_ai===true){
   try{const result=await env.AI.run("@cf/meta/llama-3.1-8b-instruct",{messages:[{role:"system",content:"Buat caption wisata singkat bahasa Indonesia. Jangan mengarang harga, spot, fasilitas, ketersediaan, asuransi atau klaim keselamatan. Draft butuh persetujuan."},{role:"user",content:"Buat konten promosi "+title}]});if(result?.response){output.caption=str(result.response,1300);output.generator="workers-ai"}}catch(_){}
  }
  return json(output);
 }
 return bad("Endpoint tidak ditemukan",404);
}
export default {async fetch(req,env){try{return await route(req,env)}catch(e){return bad(e instanceof SyntaxError?"JSON tidak valid":String(e.message||"Kesalahan"),e instanceof PricingError?422:400)}}};
