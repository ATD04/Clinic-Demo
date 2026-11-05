import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { todayISO } from "@/lib/date"
import { computeAvailableStock, getStockStatus } from "@/lib/inventory"
import type { MedicalItem } from "@/types"
import { StockStatusBadge } from "./StockStatusBadge"

interface InventoryTableProps {
  items: MedicalItem[]
  onViewItem: (itemId: string) => void
}

export function InventoryTable({ items, onViewItem }: InventoryTableProps) {
  const today = todayISO()

  if (items.length === 0) {
    return <p className="py-14 text-center text-sm text-muted-foreground">لا توجد أصناف في المخزون</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الصنف</TableHead>
            <TableHead>الفئة</TableHead>
            <TableHead>الكمية المتوفرة</TableHead>
            <TableHead>الحد الأدنى</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-end">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const available = computeAvailableStock(item, today)
            const status = getStockStatus(item, today)
            return (
              <TableRow key={item.id} className="cursor-pointer" onClick={() => onViewItem(item.id)}>
                <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.category}</TableCell>
                <TableCell className="text-muted-foreground">
                  {available} {item.unit}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.minStock} {item.unit}
                </TableCell>
                <TableCell>
                  <StockStatusBadge status={status} />
                </TableCell>
                <TableCell className="text-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewItem(item.id)
                    }}
                  >
                    <Eye />
                    عرض
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
