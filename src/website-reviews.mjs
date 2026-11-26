// Self-submitted public testimonials, not verified bookings.
const services=new Set(["WEST","EAST","SNORKELING","LEMBONGAN","FAST_BOAT","OTHER"]);
const contactLike=/https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d .()-]{7,}\d/i;
export function validateReview(b){
 const name=typeof b?.name==="string"?b.name.trim():"",body=typeof b?.body==="string"?b.body.trim():"",service=b?.service,rating=Number(b?.rating);
 if(name.length<2||name.length>60||body.length<10||body.length>800||/[<>\u0000-\u001f\u007f]/.test(name)||/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(body)||contactLike.test(name+" "+body)||!services.has(service)||!Number.isInteger(rating)||rating<1||rating>5||b.consent!==true||b.completed!==true||b.website)throw Error("Invalid review: use a first name or alias, 10–800 characters, no contact details or links, and confirm your completed trip and publication consent.");
 return {name,body,service,rating};
}
export async function listReviews(db,{owner=false,offset=0}={}){
 const start=Number.isSafeInteger(offset)&&offset>=0?Math.min(offset,10000):0,limit=owner?30:12;
 const rows=(await db.prepare("SELECT id,name,body,service,rating,created_at"+(owner?",visible,version":"")+" FROM website_reviews "+(owner?"":"WHERE visible=1 ")+"ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?").bind(limit+1,start).all()).results||[];
 return {items:rows.slice(0,limit),next_offset:rows.length>limit?start+limit:null};
}
export async function createReview(db,b,key){
 const v=validateReview(b),id=crypto.randomUUID();
 const result=await db.prepare("INSERT INTO website_reviews(id,name,body,service,rating,rate_key) SELECT ?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM website_reviews WHERE rate_key=?)<3").bind(id,v.name,v.body,v.service,v.rating,key,key).run();
 return result.meta?.changes===1?{id,visible:true}:null;
}
export async function moderateReview(db,id,b){
 if(!/^[0-9a-f-]{36}$/.test(id)||b?.owner_confirmed!==true||typeof b.visible!=="boolean"||!Number.isSafeInteger(b.expected_version))throw Error("Invalid visibility request");
 const r=await db.prepare("UPDATE website_reviews SET visible=?,version=version+1 WHERE id=? AND version=?").bind(b.visible?1:0,id,b.expected_version).run();
 if(r.meta?.changes!==1)throw Error("Review changed; reload before moderating.");
 return {id,visible:b.visible};
}
export async function dailyReviewKey(secret,ip,day=new Date().toISOString().slice(0,10)){
 const enc=new TextEncoder(),key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const hash=await crypto.subtle.sign("HMAC",key,enc.encode("website-review:"+day+":"+ip));
 return day+":"+Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
