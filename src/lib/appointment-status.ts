import type { AppointmentStatus } from "@/types"

export const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: "مجدول", className: "bg-sky-50 text-sky-700" },
  arrived: { label: "وصل", className: "bg-amber-50 text-amber-700" },
  "in-progress": { label: "قيد المعاينة", className: "bg-teal-50 text-teal-700" },
  completed: { label: "مكتمل", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "ملغي", className: "bg-red-50 text-red-700" },
}

export const appointmentStatuses: AppointmentStatus[] = [
  "scheduled",
  "arrived",
  "in-progress",
  "completed",
  "cancelled",
]
