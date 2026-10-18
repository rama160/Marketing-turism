// Deterministic pricing; AI cannot overrule commercial or safety policy.
export class PricingError extends Error {}
const check=(x,label,min=0)=>{if(!Number.isSafeInteger(x)||x<min)throw new PricingError(label+" tidak valid");return x};
export function calculate({guests,base,extras=[],agencyCosts=0,paymentFee=0,sellingPrice=null,minProfit=1,bookingMode="LEGACY",variantId="DEFAULT"}) {
  check(guests,"Jumlah guest",1);
  if(!base||base.verified!==1||base.active!==1)throw new PricingError("Tarif net operator belum terverifikasi");
  if(!["person","car"].includes(base.unit))throw new PricingError("Satuan tarif invalid");
  if(base.unit==="car"&&(!Number.isInteger(base.capacity)||guests>base.capacity))throw new PricingError("Kapasitas kendaraan belum sesuai");
  if(!["LEGACY","SHARING","PRIVATE"].includes(bookingMode))throw new PricingError("Pilihan Sharing/Private tidak valid");
  const scheme=base.pricing_scheme||"STANDARD";
  if(bookingMode!=="LEGACY"){
    if(base.booking_mode!==bookingMode||base.variant_id!==variantId)throw new PricingError("Tarif operator untuk varian dan mode yang dipilih belum tersedia");
    if(!Number.isSafeInteger(base.capacity)||base.capacity<1||guests>base.capacity)throw new PricingError("Kapasitas kendaraan atau kapal belum terverifikasi");
    if(base.item_id==="ISLAND_TOUR_CAR"){
      if(base.unit!=="car"||scheme!=="FIXED_VEHICLE")throw new PricingError("Tour Sharing/Private membutuhkan biaya satu mobil penuh per booking");
      if(base.capacity>7)throw new PricingError("Batas tour maksimal 7 guest");
    }else if(base.item_id==="SNORKELING_3_SPOTS"){
      if(base.unit!=="person")throw new PricingError("Unit snorkeling tidak sesuai");
      if(bookingMode==="SHARING"&&(scheme!=="STANDARD"||base.sharing_guaranteed!==1||base.capacity>20))throw new PricingError("Snorkeling sharing butuh tarif per guest terjamin dan maksimal 20 guest");
      if(bookingMode==="PRIVATE"&&scheme!=="FIXED_PACKAGE"&&(scheme!=="STANDARD"||base.private_fixed_net<=0))throw new PricingError("Private snorkeling memerlukan net eksklusif paket yang telah diverifikasi");
    }else throw new PricingError("Aktivitas tidak dikenal");
  }
  let net,lines;
  if(bookingMode==="PRIVATE"&&base.item_id==="SNORKELING_3_SPOTS"&&scheme==="FIXED_PACKAGE"){
    net=check(base.net,"Net paket Private",1);
    lines=[{kind:"PRIVATE_ALL_IN_PACKAGE",rate_id:base.id,qty:1,unit_net:base.net}];
  }else{
    net=check(base.net,"Net operator",1)*(base.unit==="person"?guests:1);
    lines=[{kind:base.item_id==="ISLAND_TOUR_CAR"&&bookingMode!=="LEGACY"?"FULL_VEHICLE_COST":"base",rate_id:base.id,qty:base.unit==="person"?guests:1,unit_net:base.net}];
    if(bookingMode==="PRIVATE"&&base.item_id==="SNORKELING_3_SPOTS"){
      net+=check(base.private_fixed_net,"Biaya kapal Private",1);
      lines.push({kind:"PRIVATE_EXCLUSIVE_FIXED",rate_id:base.id,qty:1,unit_net:base.private_fixed_net});
    }
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
  return {bookingMode,variantId,pricingScheme:scheme,net,minimum,minimumPerGuest:Math.ceil(minimum/guests),lines,sellingPrice,contribution:sellingPrice===null?null:sellingPrice-net-agencyCosts-paymentFee,agencyCosts,paymentFee,currency:"IDR"};
}
export function aiSuggestion(result,marketPrice=null) {
 if(marketPrice!=null)check(marketPrice,"Harga referensi",1);
 return Math.ceil(Math.max(result.minimum,marketPrice||0)/10000)*10000;
}
