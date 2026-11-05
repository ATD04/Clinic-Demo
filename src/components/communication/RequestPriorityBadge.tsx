import { requestPriorities } from "@/config/requests"
import { cn } from "@/lib/utils"
import type { RequestPriority } from "@/types"

export function RequestPriorityBadge({ priority }: { priority: RequestPriority }) {
  const config = requestPriorities.find((p) => p.id === priority)
  if (!config) return null
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
