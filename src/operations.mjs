// Deterministic booking rules; no LLM can call money movement.
export class OperationsError extends Error {}
export function payablesForLines(lines, rateOwners, expectedNet) {
 if (!Array.isArray(lines) || !lines.length) throw new OperationsError("Item penawaran tidak ada");
 const totals = new Map();
 let sum = 0;
 for (const line of lines) {
  const owner = rateOwners[line.rate_id];
  const qty = Number(line.qty), unit = Number(line.unit_net);
  if (!owner || !Number.isSafeInteger(qty) || qty < 1 || !Number.isSafeInteger(unit) || unit < 1) throw new OperationsError("Tarif historis/penyedia tidak tersedia");
  const amount = qty * unit;
  if (!Number.isSafeInteger(amount)) throw new OperationsError("Nilai tagihan tidak aman");
  totals.set(owner,(totals.get(owner)||0)+amount);
  sum += amount;
 }
 if (sum !== expectedNet) throw new OperationsError("Total utang operator tidak cocok dengan snapshot");
 return [...totals.entries()].map(([operator_id,net_amount])=>({operator_id,net_amount}));
}
export function validateChange(change, booking, sellingPrice) {
 if (!["RESCHEDULE","CANCEL","REFUND"].includes(change.change_type)) throw new OperationsError("Jenis perubahan tidak sah");
 if (!change.reason || change.reason.trim().length < 5) throw new OperationsError("Alasan minimal 5 karakter");
 if (booking.status === "HANDED_OVER" || booking.status === "REFUNDED" || booking.status === "CANCELLED") throw new OperationsError("Booking sudah ditutup/diserahkan");
 if (change.change_type === "REFUND") {
  if (booking.payment_status !== "PAID") throw new OperationsError("Belum ada pembayaran untuk dikembalikan");
  if (change.refund_amount !== sellingPrice) throw new OperationsError("MVP hanya mendukung pencatatan full refund; refund sebagian butuh perhitungan tersendiri");
 }
 if (change.change_type === "CANCEL" && booking.payment_status === "PAID") throw new OperationsError("Booking lunas wajib melalui workflow refund");
 if (change.change_type === "RESCHEDULE") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(change.requested_date||"") || Number.isNaN(Date.parse(change.requested_date+"T00:00:00Z"))) throw new OperationsError("Tanggal pengganti tidak valid");
  if (change.requested_date < new Date().toISOString().slice(0,10)) throw new OperationsError("Tanggal baru sudah berlalu");
 }
 return true;
}
export function allowedChangeTransition(change, next, b) {
 if (change.status === "REQUESTED" && ["APPROVED","REJECTED"].includes(next)) {
  if (next === "APPROVED" && change.change_type === "RESCHEDULE" && b.operator_acknowledged !== true) throw new OperationsError("Operator wajib menyetujui tanggal baru");
  if (next === "APPROVED" && change.change_type === "REFUND" && b.owner_confirmed !== true) throw new OperationsError("Persetujuan refund wajib");
  return true;
 }
 if (change.status === "APPROVED" && next === "EXECUTED" && change.change_type === "REFUND") {
  if (b.owner_confirmed !== true || String(b.external_reference||"").trim().length < 5) throw new OperationsError("Bukti refund melalui bank/provider wajib diverifikasi oleh pemilik");
  return true;
 }
 throw new OperationsError("Perubahan status tidak valid");
}
