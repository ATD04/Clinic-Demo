import type { RequestCategory, RequestPriority } from "@/types"

export const requestCategories: { id: RequestCategory; label: string }[] = [
  { id: "patient-followup", label: "متابعة مريض" },
  { id: "appointment-coordination", label: "تنسيق موعد" },
  { id: "supplies", label: "تجهيز مستلزمات" },
  { id: "administrative", label: "مهمة إدارية" },
]

export const requestCategoryLabel = (id: RequestCategory) =>
  requestCategories.find((c) => c.id === id)?.label ?? id

export const requestPriorities: { id: RequestPriority; label: string; className: string }[] = [
  { id: "normal", label: "عادي", className: "bg-slate-100 text-slate-600" },
  { id: "important", label: "مهم", className: "bg-orange-50 text-orange-700" },
]
