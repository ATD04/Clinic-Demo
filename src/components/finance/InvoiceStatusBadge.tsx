import { invoiceStatusConfig } from "@/lib/invoice-status"
import { cn } from "@/lib/utils"
import type { PaymentStatus } from "@/types"

export function InvoiceStatusBadge({ status }: { status: PaymentStatus }) {
  const config = invoiceStatusConfig[status]
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
