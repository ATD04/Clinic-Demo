import { CLINIC_HOURS, SLOT_STEP_MINUTES } from "@/config/clinic"
import type { Appointment } from "@/types"
import { isPastSlot, minutesToTime, timeToMinutes } from "./date"

interface ConflictParams {
  doctorId: string
  date: string
  time: string
  durationMinutes: number
  appointments: Appointment[]
  excludeAppointmentId?: string
}

export function hasConflict({
  doctorId,
  date,
  time,
  durationMinutes,
  appointments,
  excludeAppointmentId,
}: ConflictParams): boolean {
  const start = timeToMinutes(time)
  const end = start + durationMinutes

  return appointments.some((appt) => {
    if (appt.id === excludeAppointmentId) return false
    if (appt.doctorId !== doctorId) return false
    if (appt.date !== date) return false
    if (appt.status === "cancelled") return false

    const apptStart = timeToMinutes(appt.time)
    const apptEnd = apptStart + appt.durationMinutes
    return start < apptEnd && apptStart < end
  })
}

interface AvailableSlotsParams {
  doctorId: string
  date: string
  durationMinutes: number
  appointments: Appointment[]
  excludeAppointmentId?: string
}

export function getAvailableSlots({
  doctorId,
  date,
  durationMinutes,
  appointments,
  excludeAppointmentId,
}: AvailableSlotsParams): string[] {
  const slots: string[] = []

  for (
    let start = CLINIC_HOURS.startMinutes;
    start + durationMinutes <= CLINIC_HOURS.endMinutes;
    start += SLOT_STEP_MINUTES
  ) {
    const time = minutesToTime(start)
    if (isPastSlot(date, time)) continue
    if (hasConflict({ doctorId, date, time, durationMinutes, appointments, excludeAppointmentId })) continue
    slots.push(time)
  }

  return slots
}
