import { DoorOpen } from "lucide-react"
import { AppointmentStatusBadge } from "@/components/dashboard/AppointmentStatusBadge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { departmentNameById } from "@/data/mockData"
import type { AppointmentView } from "@/types"

interface TodaysPatientsListProps {
  appointments: AppointmentView[]
  onOpenVisit: (appointment: AppointmentView) => void
}

export function TodaysPatientsList({ appointments, onOpenVisit }: TodaysPatientsListProps) {
  if (appointments.length === 0) {
    return (
      <p className="py-14 text-center text-sm text-muted-foreground">
        لا توجد مواعيد لهذا الطبيب اليوم
      </p>
    )
  }

  return (
    <>
      {/* Mobile: stacked rows so the primary action stays reachable without horizontal table scrolling */}
      <ul className="space-y-2 sm:hidden">
        {appointments.map((a) => (
          <li key={a.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground">{a.patientName}</p>
              <AppointmentStatusBadge status={a.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {departmentNameById(a.departmentId)} · <span dir="ltr">{a.time}</span>
            </p>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onOpenVisit(a)}>
              <DoorOpen />
              فتح الزيارة
            </Button>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المريض</TableHead>
              <TableHead>الوقت</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-end">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium text-foreground">{a.patientName}</TableCell>
                <TableCell className="text-muted-foreground" dir="ltr">
                  <span className="block text-right">{a.time}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{departmentNameById(a.departmentId)}</TableCell>
                <TableCell>
                  <AppointmentStatusBadge status={a.status} />
                </TableCell>
                <TableCell className="text-end">
                  <Button variant="outline" size="sm" onClick={() => onOpenVisit(a)}>
                    <DoorOpen />
                    فتح الزيارة
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
