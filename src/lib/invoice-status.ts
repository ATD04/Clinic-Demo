import type { PaymentStatus } from "@/types"

export const invoiceStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid: { label: "غير مدفوعة", className: "bg-amber-50 text-amber-700" },
  paid: { label: "مدفوعة", className: "bg-emerald-50 text-emerald-700" },
}
