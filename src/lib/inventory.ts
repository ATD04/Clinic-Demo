import type { InventoryBatch, MedicalItem } from "@/types"

export function isBatchExpired(batch: InventoryBatch, today: string): boolean {
  return Boolean(batch.expirationDate && batch.expirationDate < today)
}

export function availableBatchQuantity(batch: InventoryBatch, today: string): number {
  return isBatchExpired(batch, today) ? 0 : batch.quantity
}

export function computeAvailableStock(item: MedicalItem, today: string): number {
  return item.batches.reduce((sum, b) => sum + availableBatchQuantity(b, today), 0)
}

export type StockStatus = "ok" | "low" | "out"

export const stockStatusConfig: Record<StockStatus, { label: string; className: string }> = {
  ok: { label: "متوفر", className: "bg-emerald-50 text-emerald-700" },
  low: { label: "مخزون منخفض", className: "bg-amber-50 text-amber-700" },
  out: { label: "نفذ من المخزون", className: "bg-red-50 text-red-700" },
}

export function getStockStatus(item: MedicalItem, today: string): StockStatus {
  const available = computeAvailableStock(item, today)
  if (available <= 0) return "out"
  if (available < item.minStock) return "low"
  return "ok"
}

/** Deducts quantity from the earliest-expiring non-expired batches first (FEFO). Assumes sufficient stock was already validated. */
export function deductStock(item: MedicalItem, quantity: number, today: string): MedicalItem {
  let remaining = quantity
  const batches = item.batches.map((b) => ({ ...b }))

  const orderedIds = batches
    .filter((b) => availableBatchQuantity(b, today) > 0)
    .sort((a, b) => (a.expirationDate ?? "9999-12-31").localeCompare(b.expirationDate ?? "9999-12-31"))
    .map((b) => b.id)

  for (const batchId of orderedIds) {
    if (remaining <= 0) break
    const batch = batches.find((b) => b.id === batchId)!
    const take = Math.min(batch.quantity, remaining)
    batch.quantity -= take
    remaining -= take
  }

  return { ...item, batches }
}
