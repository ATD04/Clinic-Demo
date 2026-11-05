import { useMemo, useState } from "react"
import { PatientVisitDialog } from "@/components/doctor-workspace/PatientVisitDialog"
import { TodaysPatientsList } from "@/components/doctor-workspace/TodaysPatientsList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClinicData } from "@/data/ClinicDataContext"
import { departmentNameById, doctorById, doctors } from "@/data/mockData"
import { todayISO } from "@/lib/date"
import type { AppointmentView } from "@/types"

export function DoctorsPage() {
  const { appointmentViews } = useClinicData()
  const today = todayISO()

  const todaysByDoctor = useMemo(() => {
    const map = new Map<string, AppointmentView[]>()
    for (const a of appointmentViews) {
      if (a.date !== today) continue
      const list = map.get(a.doctorId) ?? []
      list.push(a)
      map.set(a.doctorId, list)
    }
    return map
  }, [appointmentViews, today])

  const defaultDoctorId = useMemo(() => {
    const activeFirst = doctors.find((d) =>
      (todaysByDoctor.get(d.id) ?? []).some((a) => a.status === "arrived" || a.status === "in-progress")
    )
    if (activeFirst) return activeFirst.id

    const anyWithAppointments = doctors.find((d) =>
      (todaysByDoctor.get(d.id) ?? []).some((a) => a.status !== "cancelled")
    )
    return anyWithAppointments?.id ?? doctors[0]?.id ?? ""
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [selectedDoctorId, setSelectedDoctorId] = useState(defaultDoctorId)
  const [visitAppointmentId, setVisitAppointmentId] = useState<string | null>(null)
  const [visitOpen, setVisitOpen] = useState(false)

  const selectedDoctor = doctorById(selectedDoctorId)
  const todaysAppointments = (todaysByDoctor.get(selectedDoctorId) ?? []).sort((a, b) =>
    a.time.localeCompare(b.time)
  )

  // Always re-derived from live context data so in-dialog status changes (e.g. "Start Visit") are reflected immediately.
  const visitAppointment = visitAppointmentId
    ? (appointmentViews.find((a) => a.id === visitAppointmentId) ?? null)
    : null

  function handleOpenVisit(appointment: AppointmentView) {
    setVisitAppointmentId(appointment.id)
    setVisitOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">غرفة الطبيب</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مساحة عمل مبسطة لمتابعة مواعيد اليوم وتسجيل الإجراءات الطبية
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اختيار الطبيب</CardTitle>
          <CardDescription>تجربة توضيحية مؤقتة إلى حين تفعيل تسجيل الدخول الفعلي</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="اختر الطبيب" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name} — {departmentNameById(d.departmentId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مرضى اليوم{selectedDoctor ? ` — ${selectedDoctor.name}` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <TodaysPatientsList appointments={todaysAppointments} onOpenVisit={handleOpenVisit} />
        </CardContent>
      </Card>

      <PatientVisitDialog
        appointment={visitAppointment}
        doctorId={selectedDoctorId}
        open={visitOpen}
        onOpenChange={(open) => {
          setVisitOpen(open)
          if (!open) setVisitAppointmentId(null)
        }}
      />
    </div>
  )
}
