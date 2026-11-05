import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useClinicData } from "@/data/ClinicDataContext"
import { departmentNameById } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import { formatArabicDateShort, toClinicDateISO } from "@/lib/date"
import { InvoiceStatusBadge } from "./InvoiceStatusBadge"

interface InvoiceDetailsDialogProps {
  invoiceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceDetailsDialog({ invoiceId, open, onOpenChange }: InvoiceDetailsDialogProps) {
  const { invoiceViews, procedures, medicalItems, markInvoicePaid } = useClinicData()
  const { toast } = useToast()

  const invoice = invoiceViews.find((i) => i.id === invoiceId)
  if (!invoice) return null

  const procedure = procedures.find((p) => p.id === invoice.procedureId)

  function handleMarkPaid() {
    const result = markInvoicePaid(invoice!.id)
    if (!result.ok) {
      toast({ title: "تعذر تسجيل الدفعة", description: result.error, variant: "destructive" })
      return
    }
    toast({
      title: "تم تسجيل الدفعة بنجاح",
      description: `${invoice!.amount.toLocaleString("en-US")} د.أ — ${invoice!.patientName}`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>فاتورة {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>{formatArabicDateShort(toClinicDateISO(invoice.issuedAt))}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">المريض</span>
            <span className="font-medium text-foreground">{invoice.patientName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">الطبيب</span>
            <span className="font-medium text-foreground">{invoice.doctorName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">القسم</span>
            <span className="font-medium text-foreground">{departmentNameById(invoice.departmentId)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">الخدمة</span>
            <span className="font-medium text-foreground">{invoice.serviceName}</span>
          </div>
        </div>

        {procedure && procedure.materials.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">المواد المستهلكة</p>
            <ul className="space-y-1">
              {procedure.materials.map((m) => {
                const item = medicalItems.find((i) => i.id === m.itemId)
                return (
                  <li key={m.itemId} className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{item?.name ?? m.itemId}</span>
                    <span dir="ltr">
                      {m.quantity} {item?.unit ?? ""}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold text-foreground">المبلغ المستحق</span>
          <span className="text-lg font-bold text-foreground">{invoice.amount.toLocaleString("en-US")} د.أ</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">حالة الدفع</span>
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        {invoice.status === "paid" && invoice.paidAt && (
          <p className="text-xs text-muted-foreground">
            تم الدفع بتاريخ {formatArabicDateShort(toClinicDateISO(invoice.paidAt))}
          </p>
        )}

        {invoice.status === "unpaid" && (
          <Button type="button" onClick={handleMarkPaid}>
            <CheckCircle2 />
            تسجيل الدفع
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
