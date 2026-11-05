import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters"
import { AppointmentsManagementTable } from "@/components/appointments/AppointmentsManagementTable"
import { BookAppointmentDialog } from "@/components/appointments/BookAppointmentDialog"
import { PatientProfileDialog } from "@/components/patients/PatientProfileDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClinicData } from "@/data/ClinicDataContext"
import { doctors } from "@/data/mockData"
import { todayISO } from "@/lib/date"
import type { AppointmentView } from "@/types"

export function AppointmentsPage() {
  const { appointmentViews } = useClinicData()
  const [date, setDate] = useState(todayISO())
  const [departmentId, setDepartmentId] = useState("all")
  const [doctorId, setDoctorId] = useState("all")
  const [status, setStatus] = useState("all")
  const [bookOpen, setBookOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentView | null>(null)
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null)

  const doctorOptions = useMemo(
    () => (departmentId === "all" ? doctors : doctors.filter((d) => d.departmentId === departmentId)),
    [departmentId]
  )

  function handleDepartmentChange(next: string) {
    setDepartmentId(next)
    const doctorStillValid = doctors.some(
      (d) => d.id === doctorId && (next === "all" || d.departmentId === next)
    )
    if (!doctorStillValid) setDoctorId("all")
  }

  const filtered = useMemo(() => {
    return appointmentViews
      .filter((a) => a.date === date)
      .filter((a) => departmentId === "all" || a.departmentId === departmentId)
      .filter((a) => doctorId === "all" || a.doctorId === doctorId)
      .filter((a) => status === "all" || a.status === status)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [appointmentViews, date, departmentId, doctorId, status])

  function handleBookNew() {
    setEditingAppointment(null)
    setBookOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المواعيد</h1>
          <p className="mt-1 text-sm text-muted-foreground">جدولة ومتابعة مواعيد المرضى اليومية</p>
        </div>
        <Button onClick={handleBookNew}>
          <Plus />
          حجز موعد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentFilters
            date={date}
            onDateChange={setDate}
            departmentId={departmentId}
            onDepartmentChange={handleDepartmentChange}
            doctorId={doctorId}
            onDoctorChange={setDoctorId}
            status={status}
            onStatusChange={setStatus}
            doctorOptions={doctorOptions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>جدول المواعيد</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentsManagementTable
            data={filtered}
            onViewPatient={setViewingPatientId}
            onReschedule={setEditingAppointment}
          />
        </CardContent>
      </Card>

      <BookAppointmentDialog
        open={bookOpen || editingAppointment !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBookOpen(false)
            setEditingAppointment(null)
          }
        }}
        editingAppointment={editingAppointment ?? undefined}
      />

      <PatientProfileDialog
        patientId={viewingPatientId}
        open={viewingPatientId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingPatientId(null)
        }}
      />
    </div>
  )
}
