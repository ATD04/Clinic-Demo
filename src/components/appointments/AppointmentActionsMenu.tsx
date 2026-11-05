import { CalendarClock, MoreHorizontal, User, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useClinicData } from "@/data/ClinicDataContext"
import { useToast } from "@/hooks/use-toast"
import { appointmentStatuses, statusConfig } from "@/lib/appointment-status"
import type { AppointmentView } from "@/types"

interface AppointmentActionsMenuProps {
  appointment: AppointmentView
  onViewPatient: (patientId: string) => void
  onReschedule: (appointment: AppointmentView) => void
}

export function AppointmentActionsMenu({
  appointment,
  onViewPatient,
  onReschedule,
}: AppointmentActionsMenuProps) {
  const { updateAppointmentStatus, cancelAppointment } = useClinicData()
  const { toast } = useToast()

  const isLocked = appointment.status === "cancelled" || appointment.status === "completed"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="خيارات الموعد">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>إجراءات الموعد</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onViewPatient(appointment.patientId)}>
          <User />
          عرض ملف المريض
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>تحديث الحالة</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {appointmentStatuses.map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={status === appointment.status}
                onClick={() => {
                  updateAppointmentStatus(appointment.id, status)
                  toast({ title: "تم تحديث حالة الموعد", description: statusConfig[status].label })
                }}
              >
                {statusConfig[status].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled={isLocked} onClick={() => onReschedule(appointment)}>
          <CalendarClock />
          إعادة جدولة
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={isLocked}
          onClick={() => {
            cancelAppointment(appointment.id)
            toast({ title: "تم إلغاء الموعد", description: "أصبح الوقت متاحاً للحجز مجدداً." })
          }}
        >
          <XCircle />
          إلغاء الموعد
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
