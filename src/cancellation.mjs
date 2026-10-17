// Canonical guest-cancellation quote. Preview is NOT settlement and never moves money.
export const CANCELLATION_POLICY_VERSION = "PENIVARA-CANCEL-2026-01";
export const CANCELLATION_TIERS = Object.freeze([
 {minDays:7, penaltyBps:2500, label:"H-7 atau lebih awal"},
 {minDays:3, penaltyBps:5000, label:"H-6 hingga H-3"},
 {minDays:1, penaltyBps:7500, label:"H-2 hingga H-1"},
 {minDays:0, penaltyBps:10000,label:"Hari H atau no-show"}
]);
export function cancellationPreview({sellingPrice, serviceDate, requestedOn, cause="GUEST", nonRecoverableSupplierIdr=null}){
 if(!Number.isSafeInteger(sellingPrice)||sellingPrice<1)throw Error("Harga booking invalid");
 const parse=x=>{
  if(typeof x!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(x)||Number.isNaN(Date.parse(x+"T00:00:00Z"))||new Date(x+"T00:00:00Z").toISOString().slice(0,10)!==x)throw Error("Tanggal invalid");
  return Date.parse(x+"T00:00:00Z");
 };
 const start=parse(serviceDate),today=parse(requestedOn);
 const days=Math.max(0,Math.ceil((start-today)/86400000));
 if(!["GUEST","OPERATOR_OR_SAFETY"].includes(cause))throw Error("Alasan pembatalan tidak valid");
 const tier=cause==="OPERATOR_OR_SAFETY"?{penaltyBps:0,label:"Operator batal/tidak aman: perlu review refund penuh"}:CANCELLATION_TIERS.find(t=>days>=t.minDays);
 const penaltyIdr=Math.floor((sellingPrice*tier.penaltyBps+5000)/10000);
 const refundIdr=sellingPrice-penaltyIdr;
 const nonRecoverable=nonRecoverableSupplierIdr===null?null:nonRecoverableSupplierIdr;
 if(nonRecoverable!==null&&(!Number.isSafeInteger(nonRecoverable)||nonRecoverable<0))throw Error("Biaya operator tak dapat dikembalikan invalid");
 const contributionAfterCosts=nonRecoverable===null?null:penaltyIdr-nonRecoverable;
 return {policyVersion:CANCELLATION_POLICY_VERSION,cause,daysBefore:days,label:tier.label,penaltyBps:tier.penaltyBps,penaltyIdr,refundIdr,nonRecoverableSupplierIdr:nonRecoverable,estimatedContributionAfterSupplier:contributionAfterCosts,needsOwnerReview:true,
 note:"Potongan hanya berlaku untuk pembatalan sukarela oleh guest setelah menyetujui ketentuan. Kewajiban supplier, biaya transaksi, kasus operator batal, dan hukum berlaku perlu peninjauan; ini bukan refund otomatis."};
}
