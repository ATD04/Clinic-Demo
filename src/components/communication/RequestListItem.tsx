import { RequestPriorityBadge } from "./RequestPriorityBadge"
import { RequestStatusBadge } from "./RequestStatusBadge"
import { requestCategoryLabel } from "@/config/requests"
import { formatRelativeArabic } from "@/lib/date"
import type { InternalRequestView } from "@/types"

interface RequestListItemProps {
  request: InternalRequestView
  isUnread: boolean
  onClick: () => void
}

export function RequestListItem({ request, isUnread, onClick }: RequestListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-start transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {isUnread && <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />}
          <p className="truncate font-semibold text-foreground">{request.title}</p>
          {request.priority === "important" && <RequestPriorityBadge priority={request.priority} />}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {requestCategoryLabel(request.category)} · من {request.createdByName} إلى {request.assignedToName}
          {request.patientName && <> · المريض: {request.patientName}</>}
        </p>
        <p className="text-xs text-muted-foreground">{formatRelativeArabic(request.updatedAt)}</p>
      </div>
      <RequestStatusBadge status={request.status} />
    </button>
  )
}
