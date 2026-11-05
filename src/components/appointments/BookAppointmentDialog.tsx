import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { visitReasons } from "@/config/clinic"
import { departments, getDepartmentDuration } from "@/config/departments"
import { useClinicData } from "@/data/ClinicDataContext"
import { doctorsByDepartment } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import { todayISO } from "@/lib/date"
import { getAvailableSlots } from "@/lib/scheduling"
import { PatientCombobox } from "./PatientCombobox"
import type { AppointmentView } from "@/types"

interface BookAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPatientId?: string
  editingAppointment?: AppointmentView
}

function departmentIdForDoctor(doctorId: string): string {
  for (const dept of departments) {
    if (doctorsByDepartment(dept.id).some((d) => d.id === doctorId)) return dept.id
  }
  return departments[0]?.id ?? ""
}

export function BookAppointmentDialog({
  open,
  onOpenChange,
  initialPatientId,
  editingAppointment,
}: BookAppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <BookAppointmentBody
            onOpenChange={onOpenChange}
            initialPatientId={initialPatientId}
            editingAppointment={editingAppointment}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function BookAppointmentBody({
  onOpenChange,
  initialPatientId,
  editingAppointment,
}: {
  onOpenChange: (open: boolean) => void
  initialPatientId?: string
  editingAppointment?: AppointmentView
}) {
  const { patients, appointments, bookAppointment, rescheduleAppointment } = useClinicData()
  const { toast } = useToast()
  const isEditing = Boolean(editingAppointment)

  const [patientId, setPatientId] = useState<string | null>(
    editingAppointment?.patientId ?? initialPatientId ?? null
  )
  const [departmentId, setDepartmentId] = useState(() =>
    editingAppointment ? departmentIdForDoctor(editingAppointment.doctorId) : departments[0]?.id ?? ""
  )
  const [doctorId, setDoctorId] = useState(editingAppointment?.doctorId ?? "")
  const [date, setDate] = useState(editingAppointment?.date ?? todayISO())
  const [time, setTime] = useState(editingAppointment?.time ?? "")
  const [reason, setReason] = useState(editingAppointment?.reason ?? visitReasons[0] ?? "")
  const [notes, setNotes] = useState(editingAppointment?.notes ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const doctorOptions = useMemo(() => doctorsByDepartment(departmentId), [departmentId])
  const durationMinutes = getDepartmentDuration(departmentId)

  const availableSlots = useMemo(() => {
    if (!doctorId || !date) return []
    return getAvailableSlots({
      doctorId,
      date,
      durationMinutes,
      appointments,
      excludeAppointmentId: editingAppointment?.id,
    })
  }, [doctorId, date, durationMinutes, appointments, editingAppointment?.id])

  const selectedTime = availableSlots.includes(time) ? time : ""

  function handleDepartmentChange(next: string) {
    setDepartmentId(next)
    const stillValid = doctorsByDepartment(next).some((d) => d.id === doctorId)
    if (!stillValid) {
      setDoctorId("")
      setTime("")
    }
  }

  function handleSubmit() {
    if (submittingRef.current) return

    if (!patientId) return setError("الرجاء اختيار المريض")
    if (!doctorId) return setError("الرجاء اختيار الطبيب")
    if (!date) return setError("الرجاء اختيار التاريخ")
    if (!selectedTime) return setError("الرجاء اختيار وقت متاح")

    submittingRef.current = true
    setIsSubmitting(true)

    const result = isEditing
      ? rescheduleAppointment(editingAppointment!.id, {
          doctorId,
          date,
          time: selectedTime,
          durationMinutes,
        })
      : bookAppointment({
          patientId,
          doctorId,
          date,
          time: selectedTime,
          durationMinutes,
          reason,
          notes,
        })

    if (!result.ok) {
      setError(result.error)
      setIsSubmitting(false)
      submittingRef.current = false
      return
    }

    toast({
      title: isEditing ? "تمت إعادة جدولة الموعد" : "تم حجز الموعد بنجاح",
      description: isEditing ? "تم تحديث موعد المريض." : "سيظهر الموعد في جدول اليوم والملف الشخصي للمريض.",
    })
    onOpenChange(false)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "إعادة جدولة الموعد" : "حجز موعد جديد"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "اختر طبيباً وتاريخاً ووقتاً جديداً لهذا الموعد."
            : "اختر المريض والقسم والطبيب والوقت المناسب لحجز الموعد."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label>المريض</Label>
          <PatientCombobox
            patients={patients}
            value={patientId}
            onChange={setPatientId}
            disabled={isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>القسم</Label>
            <Select value={departmentId} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>الطبيب</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الطبيب" />
              </SelectTrigger>
              <SelectContent>
                {doctorOptions.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="appointment-date">التاريخ</Label>
            <Input
              id="appointment-date"
              type="date"
              dir="ltr"
              min={todayISO()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>الوقت المتاح</Label>
            <Select value={selectedTime} onValueChange={setTime} disabled={!doctorId || !date}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={!doctorId ? "اختر الطبيب أولاً" : "اختر الوقت"} />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.length === 0 ? (
                  <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                    لا توجد أوقات متاحة لهذا اليوم
                  </p>
                ) : (
                  availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      <span dir="ltr">{slot}</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isEditing && (
          <div className="space-y-1.5">
            <Label>سبب الزيارة</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر السبب" />
              </SelectTrigger>
              <SelectContent>
                {visitReasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!isEditing && (
          <div className="space-y-1.5">
            <Label htmlFor="appointment-notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="appointment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية حول الموعد"
              rows={2}
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          إلغاء
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isEditing ? "حفظ التعديل" : "تأكيد الحجز"}
        </Button>
      </DialogFooter>
    </>
  )
}
