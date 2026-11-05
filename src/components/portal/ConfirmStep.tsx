import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { getDepartmentDuration } from "@/config/departments"
import { useClinicData } from "@/data/ClinicDataContext"
import { departmentNameById, doctorById } from "@/data/mockData"
import { formatArabicDate } from "@/lib/date"
import type { AppointmentView } from "@/types"
import { StepCard } from "./StepCard"
import { SummaryRow } from "./SummaryRow"

interface ConfirmStepProps {
  patientId: string
  departmentId: string
  doctorId: string
  date: string
  time: string
  onBack: () => void
  onConfirmed: (appointment: AppointmentView) => void
}

export function ConfirmStep({
  patientId,
  departmentId,
  doctorId,
  date,
  time,
  onBack,
  onConfirmed,
}: ConfirmStepProps) {
  const { patients, bookAppointment } = useClinicData()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const patient = patients.find((p) => p.id === patientId)
  const doctor = doctorById(doctorId)
  const durationMinutes = getDepartmentDuration(departmentId)

  if (!patient || !doctor) return null

  function handleConfirm() {
    if (submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)
    setError(null)

    const result = bookAppointment({
      patientId,
      doctorId,
      date,
      time,
      durationMinutes,
      reason: "حجز إلكتروني",
      source: "portal",
    })

    if (!result.ok) {
      setError(result.error)
      setIsSubmitting(false)
      submittingRef.current = false
      return
    }

    onConfirmed({
      ...result.appointment,
      patientName: patient!.name,
      doctorName: doctor!.name,
      departmentId,
    })
  }

  return (
    <StepCard title="تأكيد الحجز" description="يرجى مراجعة تفاصيل الموعد قبل التأكيد">
      <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
        <SummaryRow label="المريض" value={patient.name} />
        <SummaryRow label="القسم" value={departmentNameById(departmentId)} />
        <SummaryRow label="الطبيب" value={doctor.name} />
        <SummaryRow label="التاريخ" value={formatArabicDate(date)} />
        <SummaryRow label="الوقت" value={time} dir="ltr" />
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-5 flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          رجوع
        </Button>
        <Button type="button" className="flex-1" onClick={handleConfirm} disabled={isSubmitting}>
          تأكيد الحجز
        </Button>
      </div>
    </StepCard>
  )
}
