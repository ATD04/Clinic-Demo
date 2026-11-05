import type { RequestStatus } from "@/types"

export const requestStatusConfig: Record<RequestStatus, { label: string; className: string }> = {
  new: { label: "جديد", className: "bg-sky-50 text-sky-700" },
  "in-progress": { label: "قيد التنفيذ", className: "bg-teal-50 text-teal-700" },
  completed: { label: "مكتمل", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "ملغي", className: "bg-red-50 text-red-700" },
}

export const requestStatuses: RequestStatus[] = ["new", "in-progress", "completed", "cancelled"]
