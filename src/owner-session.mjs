// Persistent, revocable owner sessions. Never store ADMIN_TOKEN in browser storage/cookies.
const COOKIE="__Secure-npe_owner_session";
const SECONDS=365*24*60*60;
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
const sha=async s=>hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
const sameTime=(a,b)=>{if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0;};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...headers}});
const isSafeOrigin=req=>{
 const url=new URL(req.url);
 if(url.protocol!=="https:" && url.hostname!=="localhost" && url.hostname!=="agent.invalid")return false;
 const origin=req.headers.get("origin");
 if(origin&&origin!==url.origin)return false;
 const site=req.headers.get("sec-fetch-site");
 if(site&&site!=="same-origin"&&site!=="none")return false;
 return true;
};
const isWriteSafe=req=>{
 if(["GET","HEAD"].includes(req.method))return true;
 if(!isSafeOrigin(req))return false;
 // Reject drive-by form submits and cross-site cookie requests; browser fetch sends Origin on JSON POST/PATCH.
 const origin=req.headers.get("origin"),site=req.headers.get("sec-fetch-site");
 return origin===new URL(req.url).origin || site==="same-origin";
};
const rawCookie=req=>{
 const value=req.headers.get("cookie")||"";
 const matches=value.split(";").map(x=>x.trim()).filter(x=>x.startsWith(COOKIE+"="));
 if(matches.length!==1)return null;
 const opaque=matches[0].slice(COOKIE.length+1);
 return /^[a-f0-9]{64}$/.test(opaque)?opaque:null;
};
const setCookie=opaque=>COOKIE+"="+opaque+"; Path=/api/admin; Max-Age="+SECONDS+"; HttpOnly; Secure; SameSite=Strict";
const clearCookie=()=>COOKIE+"=; Path=/api/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict";
export async function verifyOwnerToken(candidate,expected){
 if(typeof expected!=="string"||expected.length<24||typeof candidate!=="string"||candidate.length<24)return false;
 return sameTime(await sha(candidate),await sha(expected));
}
async function readCookieSession(req,env,db){
 const opaque=rawCookie(req);
 if(!opaque||!db||typeof env.ADMIN_TOKEN!=="string"||env.ADMIN_TOKEN.length<24)return null;
 const hash=await sha(opaque),now=Math.floor(Date.now()/1000);
 const row=await db.prepare("SELECT credential_digest,expires_at FROM owner_sessions WHERE session_hash=? AND revoked_at IS NULL AND expires_at>?")
  .bind(hash,now).first();
 if(!row||!sameTime(row.credential_digest,await sha(env.ADMIN_TOKEN)))return null;
 return {hash,opaque,now,expires:row.expires_at};
}
export async function ownerAuthorized(req,env,db){
 const authorization=req.headers.get("authorization")||"";
 if(authorization)return /^Bearer\s+\S+$/i.test(authorization) &&
  verifyOwnerToken(authorization.replace(/^Bearer\s+/i,""),env.ADMIN_TOKEN);
 if(!isWriteSafe(req))return false;
 return Boolean(await readCookieSession(req,env,db));
}
export async function ownerLogin(req,env,db){
 if(!isSafeOrigin(req)||req.method!=="POST")return json({error:"Asal permintaan tidak diizinkan"},403);
 if(!/application\/json/i.test(req.headers.get("content-type")||""))return json({error:"Gunakan JSON"},415);
 let body;try{const raw=await req.text();if(raw.length>1024)throw Error("Too large");body=JSON.parse(raw);}catch{return json({error:"Permintaan tidak valid"},400);}
 if(!await verifyOwnerToken(body?.token,env.ADMIN_TOKEN))return json({error:"Admin token tidak valid"},401);
 const id=hex(crypto.getRandomValues(new Uint8Array(32))),hash=await sha(id),now=Math.floor(Date.now()/1000),expires=now+SECONDS;
 await db.prepare("INSERT INTO owner_sessions(session_hash,credential_digest,created_at,last_seen_at,expires_at) VALUES(?,?,?,?,?)")
  .bind(hash,await sha(env.ADMIN_TOKEN),now,now,expires).run();
 // Unrelated old/expired sessions can be purged; active devices remain signed in.
 await db.prepare("DELETE FROM owner_sessions WHERE expires_at<? OR (revoked_at IS NOT NULL AND revoked_at<?)")
  .bind(now-86400,now-30*86400).run();
 return json({authenticated:true},200,{"set-cookie":setCookie(id)});
}
export async function ownerSession(req,env,db){
 if(req.method!=="GET")return json({error:"Metode tidak didukung"},405);
 const session=await readCookieSession(req,env,db);
 if(!session)return json({authenticated:false},401,{"set-cookie":clearCookie()});
 const expiry=session.now+SECONDS;
 await db.prepare("UPDATE owner_sessions SET last_seen_at=?,expires_at=? WHERE session_hash=? AND revoked_at IS NULL")
  .bind(session.now,expiry,session.hash).run();
 return json({authenticated:true},200,{"set-cookie":setCookie(session.opaque)});
}
export async function ownerLogout(req,db){
 if(req.method!=="POST"||!isWriteSafe(req))return json({error:"Asal permintaan tidak diizinkan"},403);
 const opaque=rawCookie(req);
 if(opaque)await db.prepare("UPDATE owner_sessions SET revoked_at=? WHERE session_hash=? AND revoked_at IS NULL")
  .bind(Math.floor(Date.now()/1000),await sha(opaque)).run();
 return json({logged_out:true},200,{"set-cookie":clearCookie()});
}
