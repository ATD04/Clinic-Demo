import { requestStatusConfig } from "@/lib/request-status"
import { cn } from "@/lib/utils"
import type { RequestStatus } from "@/types"

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const config = requestStatusConfig[status]
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
