import { CalendarPlus, Globe, Pencil } from "lucide-react"
import { useState } from "react"
import { BookAppointmentDialog } from "@/components/appointments/BookAppointmentDialog"
import { AppointmentStatusBadge } from "@/components/dashboard/AppointmentStatusBadge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useClinicData } from "@/data/ClinicDataContext"
import { departmentNameById } from "@/data/mockData"
import { formatArabicDateShort, todayISO } from "@/lib/date"
import { formatPhoneDisplay } from "@/lib/phone"
import type { AppointmentView } from "@/types"
import { PatientFormDialog } from "./PatientFormDialog"

interface PatientProfileDialogProps {
  patientId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
}

function calcAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null
  const [y, m, d] = dateOfBirth.split("-").map(Number)
  const today = new Date()
  let age = today.getFullYear() - y
  const hadBirthday = today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d)
  if (!hadBirthday) age -= 1
  return age
}

function AppointmentList({
  appointments,
  emptyLabel,
}: {
  appointments: AppointmentView[]
  emptyLabel: string
}) {
  if (appointments.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className="max-h-40 space-y-2 overflow-y-auto">
      {appointments.map((a) => (
        <li
          key={a.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
              {a.doctorName}
              {a.source === "portal" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>تم الحجز عبر بوابة المريض</TooltipContent>
                </Tooltip>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {departmentNameById(a.departmentId)} · {formatArabicDateShort(a.date)} ·{" "}
              <span dir="ltr">{a.time}</span>
            </p>
          </div>
          <AppointmentStatusBadge status={a.status} />
        </li>
      ))}
    </ul>
  )
}

export function PatientProfileDialog({ patientId, open, onOpenChange }: PatientProfileDialogProps) {
  const { patients, appointmentViews } = useClinicData()
  const [editOpen, setEditOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)

  const patient = patients.find((p) => p.id === patientId)

  if (!patient) return null

  const today = todayISO()
  const myAppointments = appointmentViews.filter((a) => a.patientId === patient.id)
  const upcoming = myAppointments
    .filter((a) => a.date >= today)
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)))
  const history = myAppointments
    .filter((a) => a.date < today)
    .sort((a, b) => (b.date === a.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)))

  const age = calcAge(patient.dateOfBirth)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="sr-only">ملف المريض</DialogTitle>
            <DialogDescription className="sr-only">تفاصيل المريض والمواعيد</DialogDescription>
          </DialogHeader>

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                  {initials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-bold text-foreground">{patient.name}</p>
                <p className="text-xs text-muted-foreground">{patient.id}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil />
              تعديل
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">رقم الهاتف</p>
              <p dir="ltr" className="font-medium text-foreground">
                {formatPhoneDisplay(patient.phone)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">العمر</p>
              <p className="font-medium text-foreground">{age !== null ? `${age} سنة` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الجنس</p>
              <p className="font-medium text-foreground">
                {patient.gender === "male" ? "ذكر" : patient.gender === "female" ? "أنثى" : "—"}
              </p>
            </div>
            {patient.notes && (
              <div className="col-span-2 sm:col-span-3">
                <p className="text-xs text-muted-foreground">ملاحظات</p>
                <p className="font-medium text-foreground">{patient.notes}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">المواعيد القادمة</p>
            <Button size="sm" variant="secondary" onClick={() => setBookOpen(true)}>
              <CalendarPlus />
              حجز موعد
            </Button>
          </div>
          <AppointmentList appointments={upcoming} emptyLabel="لا توجد مواعيد قادمة" />

          <p className="text-sm font-semibold text-foreground">سجل المواعيد</p>
          <AppointmentList appointments={history} emptyLabel="لا يوجد سجل مواعيد سابقة" />
        </DialogContent>
      </Dialog>

      <PatientFormDialog open={editOpen} onOpenChange={setEditOpen} editingPatient={patient} />
      <BookAppointmentDialog open={bookOpen} onOpenChange={setBookOpen} initialPatientId={patient.id} />
    </>
  )
}
