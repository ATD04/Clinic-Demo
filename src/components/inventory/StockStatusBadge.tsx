import { stockStatusConfig } from "@/lib/inventory"
import type { StockStatus } from "@/lib/inventory"
import { cn } from "@/lib/utils"

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const config = stockStatusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
