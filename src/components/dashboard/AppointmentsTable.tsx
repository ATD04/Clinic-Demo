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
import { AppointmentStatusBadge } from "./AppointmentStatusBadge"

interface AppointmentsTableProps {
  data: AppointmentView[]
}

export function AppointmentsTable({ data }: AppointmentsTableProps) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">لا توجد مواعيد لهذا اليوم</p>
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
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium text-foreground">
                {appointment.patientName}
              </TableCell>
              <TableCell className="text-muted-foreground">{appointment.doctorName}</TableCell>
              <TableCell className="text-muted-foreground">
                {departmentNameById(appointment.departmentId)}
              </TableCell>
              <TableCell className="text-muted-foreground" dir="ltr">
                <span className="block text-right">{appointment.time}</span>
              </TableCell>
              <TableCell>
                <AppointmentStatusBadge status={appointment.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
