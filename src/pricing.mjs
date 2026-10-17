// Deterministic pricing; AI cannot overrule commercial or safety policy.
export class PricingError extends Error {}
const check=(x,label,min=0)=>{if(!Number.isSafeInteger(x)||x<min)throw new PricingError(label+" tidak valid");return x};
export function calculate({guests,base,extras=[],agencyCosts=0,paymentFee=0,sellingPrice=null,minProfit=1,bookingMode="LEGACY"}) {
  check(guests,"Jumlah guest",1);
  if(!base||base.verified!==1||base.active!==1)throw new PricingError("Tarif net operator belum terverifikasi");
  if(!["person","car"].includes(base.unit))throw new PricingError("Satuan tarif invalid");
  if(base.unit==="car"&&(!Number.isInteger(base.capacity)||guests>base.capacity))throw new PricingError("Kapasitas kendaraan belum sesuai");
  if(!["LEGACY","SHARING","PRIVATE"].includes(bookingMode))throw new PricingError("Pilihan Sharing/Private tidak valid");
  if(bookingMode!=="LEGACY"){
    if(base.booking_mode!==bookingMode)throw new PricingError("Tarif operator untuk mode "+bookingMode+" belum diverifikasi");
    if(!Number.isSafeInteger(base.capacity)||base.capacity<1||guests>base.capacity)throw new PricingError("Kapasitas grup atau kapal belum disetujui operator");
    if(bookingMode==="SHARING"&&(base.unit!=="person"||base.sharing_guaranteed!==1))throw new PricingError("Sharing hanya boleh memakai tarif per orang yang dijamin operator, tanpa risiko kursi kosong");
    if(bookingMode==="PRIVATE"&&base.item_id==="SNORKELING_3_SPOTS"&&(base.unit!=="person"||!Number.isSafeInteger(base.private_fixed_net)||base.private_fixed_net<=0))
      throw new PricingError("Snorkeling Private memerlukan biaya eksklusif kapal yang dikonfirmasi operator");
    if(bookingMode==="PRIVATE"&&base.item_id==="ISLAND_TOUR_CAR"&&base.unit!=="car")throw new PricingError("Island tour Private harus menghitung biaya satu mobil eksklusif");
  }
  let net=check(base.net,"Net operator",1)*(base.unit==="person"?guests:1);
  const lines=[{kind:"base",rate_id:base.id,qty:base.unit==="person"?guests:1,unit_net:base.net}];
  if(bookingMode==="PRIVATE"&&base.item_id==="SNORKELING_3_SPOTS"){
    net+=check(base.private_fixed_net,"Biaya kapal Private",1);
    lines.push({kind:"PRIVATE_EXCLUSIVE_FIXED",rate_id:base.id,qty:1,unit_net:base.private_fixed_net});
  }
  for(const extra of extras){
    if(!extra.rate||extra.rate.active!==1||extra.rate.verified!==1||extra.rate.unit!=="person")throw new PricingError("Tarif tambahan belum terverifikasi: "+extra.item);
    check(extra.qty,"Jumlah tambahan",1);
    if(extra.qty>guests)throw new PricingError("Jumlah tambahan lebih dari guest");
    const subtotal=check(extra.rate.net,"Net tambahan",1)*extra.qty;
    net+=subtotal;lines.push({kind:extra.item,rate_id:extra.rate.id,qty:extra.qty,unit_net:extra.rate.net});
  }
  check(agencyCosts,"Biaya agen");check(paymentFee,"Biaya pembayaran");check(minProfit,"Margin kontribusi",1);
  // Legacy quotations retain their historical rule. New modes guarantee contribution >= Rp100,000 after declared costs.
  const minimum=bookingMode==="LEGACY"
    ?Math.max(net+100000,net+agencyCosts+paymentFee+minProfit)
    :net+agencyCosts+paymentFee+Math.max(100000,minProfit);
  check(net,"Total net",1);check(minimum,"Harga minimum",1);
  if(sellingPrice!==null&&(check(sellingPrice,"Harga jual",1)<minimum))throw new PricingError("Harga jual di bawah batas aman Rp"+minimum);
  return {bookingMode,net,minimum,minimumPerGuest:Math.ceil(minimum/guests),lines,sellingPrice,contribution:sellingPrice===null?null:sellingPrice-net-agencyCosts-paymentFee,agencyCosts,paymentFee,currency:"IDR"};
}
export function aiSuggestion(result,marketPrice=null) {
 if(marketPrice!=null)check(marketPrice,"Harga referensi",1);
 return Math.ceil(Math.max(result.minimum,marketPrice||0)/10000)*10000;
}
