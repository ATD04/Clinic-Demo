import { staffNameById } from "@/config/staff"
import { doctorById } from "@/data/mockData"
import type {
  Appointment,
  AppointmentView,
  InternalRequest,
  InternalRequestView,
  Invoice,
  InvoiceView,
  Patient,
} from "@/types"

export function toAppointmentView(appointment: Appointment, patients: Patient[]): AppointmentView {
  const patient = patients.find((p) => p.id === appointment.patientId)
  const doctor = doctorById(appointment.doctorId)
  return {
    ...appointment,
    patientName: patient?.name ?? "مريض غير معروف",
    doctorName: doctor?.name ?? "—",
    departmentId: doctor?.departmentId ?? "",
  }
}

export function toInvoiceView(invoice: Invoice, patients: Patient[]): InvoiceView {
  const patient = patients.find((p) => p.id === invoice.patientId)
  const doctor = doctorById(invoice.doctorId)
  return {
    ...invoice,
    patientName: patient?.name ?? "مريض غير معروف",
    doctorName: doctor?.name ?? "—",
  }
}

export function toInternalRequestView(request: InternalRequest, patients: Patient[]): InternalRequestView {
  const patient = request.patientId ? patients.find((p) => p.id === request.patientId) : undefined
  return {
    ...request,
    createdByName: staffNameById(request.createdByStaffId),
    assignedToName: staffNameById(request.assignedToStaffId),
    patientName: patient?.name,
  }
}

export interface LastVisitInfo {
  date: string
  isUpcoming: boolean
}

export function getLastVisitInfo(
  patientId: string,
  appointments: AppointmentView[],
  today: string
): LastVisitInfo | null {
  const mine = appointments.filter((a) => a.patientId === patientId && a.status !== "cancelled")

  const past = mine.filter((a) => a.date < today).sort((a, b) => b.date.localeCompare(a.date))
  if (past.length > 0) return { date: past[0].date, isUpcoming: false }

  const upcoming = mine.filter((a) => a.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  if (upcoming.length > 0) return { date: upcoming[0].date, isUpcoming: true }

  return null
}
