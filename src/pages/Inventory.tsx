import { AlertTriangle, Boxes, PackageX } from "lucide-react"
import { useMemo, useState } from "react"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { InventoryTable } from "@/components/inventory/InventoryTable"
import { StockDetailsDialog } from "@/components/inventory/StockDetailsDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClinicData } from "@/data/ClinicDataContext"
import { todayISO } from "@/lib/date"
import { getStockStatus } from "@/lib/inventory"

export function InventoryPage() {
  const { medicalItems } = useClinicData()
  const [viewingItemId, setViewingItemId] = useState<string | null>(null)
  const today = todayISO()

  const { lowCount, outCount } = useMemo(() => {
    let low = 0
    let out = 0
    for (const item of medicalItems) {
      const status = getStockStatus(item, today)
      if (status === "low") low += 1
      if (status === "out") out += 1
    }
    return { lowCount: low, outCount: out }
  }, [medicalItems, today])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">المخزون</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          متابعة المستلزمات الطبية ومستويات المخزون
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="أصناف المخزون" value={String(medicalItems.length)} icon={Boxes} />
        <KpiCard
          label="أصناف منخفضة المخزون"
          value={String(lowCount)}
          icon={AlertTriangle}
          tone="warning"
        />
        <KpiCard label="أصناف نفذت من المخزون" value={String(outCount)} icon={PackageX} tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستلزمات الطبية</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryTable items={medicalItems} onViewItem={setViewingItemId} />
        </CardContent>
      </Card>

      <StockDetailsDialog
        itemId={viewingItemId}
        open={viewingItemId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingItemId(null)
        }}
      />
    </div>
  )
}
