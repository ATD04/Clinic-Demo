import { Globe } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AppointmentStatusBadge } from "@/components/dashboard/AppointmentStatusBadge"
import { departmentNameById } from "@/data/mockData"
import type { AppointmentView } from "@/types"
import { AppointmentActionsMenu } from "./AppointmentActionsMenu"

interface AppointmentsManagementTableProps {
  data: AppointmentView[]
  onViewPatient: (patientId: string) => void
  onReschedule: (appointment: AppointmentView) => void
}

export function AppointmentsManagementTable({
  data,
  onViewPatient,
  onReschedule,
}: AppointmentsManagementTableProps) {
  if (data.length === 0) {
    return (
      <p className="py-14 text-center text-sm text-muted-foreground">
        لا توجد مواعيد تطابق الفلاتر الحالية
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المريض</TableHead>
            <TableHead>الطبيب</TableHead>
            <TableHead>القسم</TableHead>
            <TableHead>الوقت</TableHead>
            <TableHead>سبب الزيارة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-end">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium text-foreground">
                <span className="inline-flex items-center gap-1.5">
                  {appointment.patientName}
                  {appointment.source === "portal" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>تم الحجز عبر بوابة المريض</TooltipContent>
                    </Tooltip>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{appointment.doctorName}</TableCell>
              <TableCell className="text-muted-foreground">
                {departmentNameById(appointment.departmentId)}
              </TableCell>
              <TableCell className="text-muted-foreground" dir="ltr">
                <span className="block text-right">{appointment.time}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{appointment.reason}</TableCell>
              <TableCell>
                <AppointmentStatusBadge status={appointment.status} />
              </TableCell>
              <TableCell className="text-end">
                <AppointmentActionsMenu
                  appointment={appointment}
                  onViewPatient={onViewPatient}
                  onReschedule={onReschedule}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
