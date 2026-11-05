import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDepartmentDuration } from "@/config/departments"
import { useClinicData } from "@/data/ClinicDataContext"
import { departmentNameById, doctorById } from "@/data/mockData"
import { todayISO } from "@/lib/date"
import { getAvailableSlots } from "@/lib/scheduling"
import { StepCard } from "./StepCard"

interface ScheduleStepProps {
  doctorId: string
  departmentId: string
  date: string
  onDateChange: (date: string) => void
  onSelectTime: (time: string) => void
  onBack: () => void
}

export function ScheduleStep({
  doctorId,
  departmentId,
  date,
  onDateChange,
  onSelectTime,
  onBack,
}: ScheduleStepProps) {
  const { appointments } = useClinicData()
  const doctor = doctorById(doctorId)
  const durationMinutes = getDepartmentDuration(departmentId)

  const availableSlots = useMemo(
    () => getAvailableSlots({ doctorId, date, durationMinutes, appointments }),
    [doctorId, date, durationMinutes, appointments]
  )

  return (
    <StepCard
      title="اختر الموعد المناسب"
      description={doctor ? `الحجز مع ${doctor.name} — ${departmentNameById(departmentId)}` : undefined}
    >
      <div className="space-y-1.5">
        <Label htmlFor="portal-date">التاريخ</Label>
        <Input
          id="portal-date"
          type="date"
          dir="ltr"
          min={todayISO()}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <Label>الأوقات المتاحة</Label>
        {availableSlots.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            لا توجد أوقات متاحة في هذا اليوم، جرّب تاريخاً آخر
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                dir="ltr"
                onClick={() => onSelectTime(slot)}
                className="rounded-lg border border-border bg-white py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary"
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button type="button" variant="ghost" className="mt-5" onClick={onBack}>
        رجوع
      </Button>
    </StepCard>
  )
}
