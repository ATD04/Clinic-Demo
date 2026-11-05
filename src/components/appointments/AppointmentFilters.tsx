import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { departments } from "@/config/departments"
import { appointmentStatuses, statusConfig } from "@/lib/appointment-status"
import type { DoctorRecord } from "@/types"

interface AppointmentFiltersProps {
  date: string
  onDateChange: (date: string) => void
  departmentId: string
  onDepartmentChange: (id: string) => void
  doctorId: string
  onDoctorChange: (id: string) => void
  status: string
  onStatusChange: (status: string) => void
  doctorOptions: DoctorRecord[]
}

export function AppointmentFilters({
  date,
  onDateChange,
  departmentId,
  onDepartmentChange,
  doctorId,
  onDoctorChange,
  status,
  onStatusChange,
  doctorOptions,
}: AppointmentFiltersProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Input type="date" dir="ltr" value={date} onChange={(e) => onDateChange(e.target.value)} />

      <Select value={departmentId} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="كل الأقسام" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الأقسام</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={doctorId} onValueChange={onDoctorChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="كل الأطباء" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الأطباء</SelectItem>
          {doctorOptions.map((doctor) => (
            <SelectItem key={doctor.id} value={doctor.id}>
              {doctor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="كل الحالات" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الحالات</SelectItem>
          {appointmentStatuses.map((s) => (
            <SelectItem key={s} value={s}>
              {statusConfig[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
