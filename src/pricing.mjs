// Deterministic pricing; AI cannot overrule commercial or safety policy.
export class PricingError extends Error {}
const check=(x,label,min=0)=>{if(!Number.isSafeInteger(x)||x<min)throw new PricingError(label+" tidak valid");return x};
export function calculate({guests,base,extras=[],agencyCosts=0,paymentFee=0,sellingPrice=null,minProfit=1}) {
  check(guests,"Jumlah guest",1);
  if(!base||base.verified!==1||base.active!==1)throw new PricingError("Tarif net operator belum terverifikasi");
  if(!["person","car"].includes(base.unit))throw new PricingError("Satuan tarif invalid");
  if(base.unit==="car"&&(!Number.isInteger(base.capacity)||guests>base.capacity))throw new PricingError("Kapasitas kendaraan belum sesuai");
  let net=check(base.net,"Net operator",1)*(base.unit==="person"?guests:1);
  const lines=[{kind:"base",rate_id:base.id,qty:base.unit==="person"?guests:1,unit_net:base.net}];
  for(const extra of extras){
    if(!extra.rate||extra.rate.active!==1||extra.rate.verified!==1||extra.rate.unit!=="person")throw new PricingError("Tarif tambahan belum terverifikasi: "+extra.item);
    check(extra.qty,"Jumlah tambahan",1);
    if(extra.qty>guests)throw new PricingError("Jumlah tambahan lebih dari guest");
    const subtotal=check(extra.rate.net,"Net tambahan",1)*extra.qty;
    net+=subtotal;lines.push({kind:extra.item,rate_id:extra.rate.id,qty:extra.qty,unit_net:extra.rate.net});
  }
  check(agencyCosts,"Biaya agen");check(paymentFee,"Biaya pembayaran");check(minProfit,"Margin kontribusi",1);
  const minimum=Math.max(net+100000,net+agencyCosts+paymentFee+minProfit);
  if(sellingPrice!==null&&(check(sellingPrice,"Harga jual",1)<minimum))throw new PricingError("Harga jual di bawah batas aman Rp"+minimum);
  return {net,minimum,lines,sellingPrice,contribution:sellingPrice===null?null:sellingPrice-net-agencyCosts-paymentFee,agencyCosts,paymentFee,currency:"IDR"};
}
export function aiSuggestion(result,marketPrice=null) {
 if(marketPrice!=null)check(marketPrice,"Harga referensi",1);
 return Math.ceil(Math.max(result.minimum,marketPrice||0)/10000)*10000;
}
