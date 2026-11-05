import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useClinicData } from "@/data/ClinicDataContext"
import { formatArabicDateShort, formatRelativeArabic, todayISO } from "@/lib/date"
import { computeAvailableStock, getStockStatus, isBatchExpired } from "@/lib/inventory"
import { cn } from "@/lib/utils"
import { StockStatusBadge } from "./StockStatusBadge"

interface StockDetailsDialogProps {
  itemId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockDetailsDialog({ itemId, open, onOpenChange }: StockDetailsDialogProps) {
  const { medicalItems, inventoryMovements, procedures, patients } = useClinicData()
  const item = medicalItems.find((i) => i.id === itemId)

  if (!item) return null

  const today = todayISO()
  const available = computeAvailableStock(item, today)
  const status = getStockStatus(item, today)

  const movements = [...inventoryMovements]
    .filter((m) => m.itemId === item.id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 10)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.category}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">الكمية المتوفرة</p>
            <p className="font-semibold text-foreground">
              {available} {item.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">تكلفة الوحدة</p>
            <p className="font-semibold text-foreground">{item.unitCost.toFixed(2)} د.أ</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">الحد الأدنى</p>
            <p className="font-semibold text-foreground">
              {item.minStock} {item.unit}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">الحالة</p>
          <StockStatusBadge status={status} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">الدفعات</p>
          <ul className="space-y-1.5">
            {item.batches.map((batch) => {
              const expired = isBatchExpired(batch, today)
              return (
                <li
                  key={batch.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                    expired ? "border-red-200 bg-red-50/60" : "border-border"
                  )}
                >
                  <div>
                    <p className="font-medium text-foreground">دفعة {batch.batchNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {batch.quantity} {item.unit}
                      {batch.expirationDate && ` · ينتهي ${formatArabicDateShort(batch.expirationDate)}`}
                    </p>
                  </div>
                  {expired && <span className="text-xs font-medium text-destructive">منتهي الصلاحية</span>}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">آخر الحركات</p>
          {movements.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
              لا توجد حركات مخزون بعد
            </p>
          ) : (
            <ul className="max-h-48 space-y-1.5 overflow-y-auto">
              {movements.map((m) => {
                const procedure = procedures.find((p) => p.id === m.procedureId)
                const patient = procedure ? patients.find((p) => p.id === procedure.patientId) : null
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="text-foreground">
                        {patient ? `استهلاك ضمن إجراء للمريض ${patient.name}` : "حركة مخزون"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatRelativeArabic(m.timestamp)}</p>
                    </div>
                    <span className={cn("font-medium", m.quantityChange < 0 ? "text-destructive" : "text-primary")}>
                      {m.quantityChange > 0 ? "+" : ""}
                      {m.quantityChange} {item.unit}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
