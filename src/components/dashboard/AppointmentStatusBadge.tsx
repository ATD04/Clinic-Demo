import { statusConfig } from "@/lib/appointment-status"
import { cn } from "@/lib/utils"
import type { AppointmentStatus } from "@/types"

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const config = statusConfig[status]
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
