import { CheckCircle2, ClipboardList, PackageMinus, Receipt } from "lucide-react"
import { useState } from "react"
import { AppointmentStatusBadge } from "@/components/dashboard/AppointmentStatusBadge"
import { InvoiceStatusBadge } from "@/components/finance/InvoiceStatusBadge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { serviceById } from "@/config/services"
import { useClinicData } from "@/data/ClinicDataContext"
import { departmentNameById } from "@/data/mockData"
import { formatArabicDate } from "@/lib/date"
import type { AppointmentView, Invoice, MedicalItem, MedicalProcedure } from "@/types"
import { ProcedureForm } from "./ProcedureForm"

interface PatientVisitDialogProps {
  appointment: AppointmentView | null
  doctorId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientVisitDialog({ appointment, doctorId, open, onOpenChange }: PatientVisitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {open && appointment && (
          <VisitBody appointment={appointment} doctorId={doctorId} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function VisitBody({
  appointment,
  doctorId,
  onClose,
}: {
  appointment: AppointmentView
  doctorId: string
  onClose: () => void
}) {
  const { patients, updateAppointmentStatus, procedures, invoices, medicalItems } = useClinicData()
  const [justCompleted, setJustCompleted] = useState<{ procedure: MedicalProcedure; invoice: Invoice } | null>(
    null
  )

  const patient = patients.find((p) => p.id === appointment.patientId)
  if (!patient) return null

  const existingProcedure = procedures.find((p) => p.appointmentId === appointment.id)
  const existingInvoice = existingProcedure
    ? invoices.find((i) => i.procedureId === existingProcedure.id)
    : undefined

  return (
    <>
      <DialogHeader>
        <DialogTitle>زيارة المريض</DialogTitle>
        <DialogDescription>
          {formatArabicDate(appointment.date)} · <span dir="ltr">{appointment.time}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">المريض</p>
          <p className="font-medium text-foreground">{patient.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">الطبيب</p>
          <p className="font-medium text-foreground">{appointment.doctorName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">القسم</p>
          <p className="font-medium text-foreground">{departmentNameById(appointment.departmentId)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">سبب الزيارة</p>
          <p className="font-medium text-foreground">{appointment.reason}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">حالة الموعد</span>
        <AppointmentStatusBadge status={justCompleted ? "completed" : appointment.status} />
      </div>

      {justCompleted ? (
        <ProcedureSuccessSummary
          procedure={justCompleted.procedure}
          invoice={justCompleted.invoice}
          medicalItems={medicalItems}
          onClose={onClose}
        />
      ) : appointment.status === "cancelled" ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          تم إلغاء هذا الموعد
        </p>
      ) : appointment.status === "completed" && existingProcedure && existingInvoice ? (
        <ExistingProcedureSummary
          procedure={existingProcedure}
          invoice={existingInvoice}
          medicalItems={medicalItems}
        />
      ) : appointment.status === "scheduled" ? (
        <div className="space-y-3 rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">لم يصل المريض إلى العيادة بعد</p>
          <Button type="button" variant="outline" onClick={() => updateAppointmentStatus(appointment.id, "arrived")}>
            تسجيل وصول المريض
          </Button>
        </div>
      ) : appointment.status === "arrived" ? (
        <div className="space-y-3 rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">المريض بانتظار بدء الكشف</p>
          <Button type="button" onClick={() => updateAppointmentStatus(appointment.id, "in-progress")}>
            بدء الزيارة
          </Button>
        </div>
      ) : appointment.status === "in-progress" ? (
        <ProcedureForm
          appointment={appointment}
          doctorId={doctorId}
          onCompleted={(procedure, invoice) => setJustCompleted({ procedure, invoice })}
        />
      ) : null}
    </>
  )
}

function ProcedureSuccessSummary({
  procedure,
  invoice,
  medicalItems,
  onClose,
}: {
  procedure: MedicalProcedure
  invoice: Invoice
  medicalItems: MedicalItem[]
  onClose: () => void
}) {
  const service = serviceById(procedure.serviceId)

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <CheckCircle2 className="size-7" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">تم تسجيل الإجراء بنجاح</p>
        <p className="mt-1 text-sm text-muted-foreground">
          تم تحديث سجل المريض والمخزون والفواتير تلقائياً
        </p>
      </div>

      <div className="space-y-2.5 rounded-lg bg-muted/50 p-3 text-start text-sm">
        <div className="flex items-start gap-2">
          <ClipboardList className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            تم تسجيل إجراء: <strong className="text-foreground">{service?.name}</strong>
          </span>
        </div>
        {procedure.materials.length > 0 && (
          <div className="flex items-start gap-2">
            <PackageMinus className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              تم خصم من المخزون:{" "}
              <strong className="text-foreground">
                {procedure.materials
                  .map((m) => {
                    const item = medicalItems.find((i) => i.id === m.itemId)
                    return `${item?.name ?? m.itemId} (${m.quantity} ${item?.unit ?? ""})`
                  })
                  .join("، ")}
              </strong>
            </span>
          </div>
        )}
        <div className="flex items-start gap-2">
          <Receipt className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            تم إصدار الفاتورة {invoice.invoiceNumber} بمبلغ{" "}
            <strong className="text-foreground">{invoice.amount.toLocaleString("en-US")} د.أ</strong>
          </span>
        </div>
      </div>

      <Button type="button" className="w-full" onClick={onClose}>
        إغلاق
      </Button>
    </div>
  )
}

function ExistingProcedureSummary({
  procedure,
  invoice,
  medicalItems,
}: {
  procedure: MedicalProcedure
  invoice: Invoice
  medicalItems: MedicalItem[]
}) {
  const service = serviceById(procedure.serviceId)

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">الإجراء المسجل</p>
      <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">الخدمة</span>
          <span className="font-medium text-foreground">{service?.name}</span>
        </div>
        {procedure.materials.length > 0 && (
          <div>
            <p className="text-muted-foreground">المواد المستهلكة</p>
            <ul className="mt-1 space-y-1">
              {procedure.materials.map((m) => {
                const item = medicalItems.find((i) => i.id === m.itemId)
                return (
                  <li key={m.itemId} className="flex items-center justify-between">
                    <span className="text-foreground">{item?.name ?? m.itemId}</span>
                    <span dir="ltr" className="text-muted-foreground">
                      {m.quantity} {item?.unit ?? ""}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        {procedure.notes && (
          <div>
            <p className="text-muted-foreground">ملاحظات</p>
            <p className="text-foreground">{procedure.notes}</p>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-muted-foreground">الفاتورة {invoice.invoiceNumber}</span>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
      </div>
    </div>
  )
}
