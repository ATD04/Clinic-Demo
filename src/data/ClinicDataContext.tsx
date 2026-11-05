import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { serviceById } from "@/config/services"
import { DEFAULT_STAFF_ID, staffById } from "@/config/staff"
import { doctorById } from "@/data/mockData"
import { createSeedData, createSeedInternalRequests } from "@/data/seed"
import { toAppointmentView, toInternalRequestView, toInvoiceView } from "@/lib/clinic-selectors"
import { isPastSlot, todayISO } from "@/lib/date"
import { generateSequentialId } from "@/lib/id"
import { computeAvailableStock, deductStock } from "@/lib/inventory"
import { isValidJordanPhone, normalizePhone } from "@/lib/phone"
import { requestStatusConfig } from "@/lib/request-status"
import { hasConflict } from "@/lib/scheduling"
import type {
  ActivityItem,
  Appointment,
  AppointmentStatus,
  AppointmentView,
  BookingSource,
  Gender,
  InternalRequest,
  InternalRequestView,
  Invoice,
  InventoryMovement,
  InvoiceView,
  MedicalItem,
  MedicalProcedure,
  Patient,
  ProcedureMaterialUsage,
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "@/types"

const STORAGE_KEY = "clinicflow-demo-data-v2"
const MAX_ACTIVITIES = 30

interface StoredData {
  patients: Patient[]
  appointments: Appointment[]
  activities: ActivityItem[]
  medicalItems: MedicalItem[]
  inventoryMovements: InventoryMovement[]
  procedures: MedicalProcedure[]
  invoices: Invoice[]
  internalRequests: InternalRequest[]
  currentStaffId: string
}

const REQUIRED_ARRAY_KEYS: (keyof StoredData)[] = [
  "patients",
  "appointments",
  "activities",
  "medicalItems",
  "inventoryMovements",
  "procedures",
  "invoices",
]

/**
 * `internalRequests`/`currentStaffId` were introduced after the `clinicflow-demo-data-v2` schema was
 * already in use, so older persisted data may not have them. Rather than treating their absence as
 * invalid (which would wipe a user's existing patients/appointments/etc. on next load), we backfill
 * sensible defaults onto otherwise-valid stored data. Shared by the initial load and by the cross-tab
 * `storage` listener below, since both need to turn a raw JSON string into a trusted StoredData.
 */
function parseStoredData(raw: string): StoredData | null {
  try {
    const parsed = JSON.parse(raw)
    const isValid = REQUIRED_ARRAY_KEYS.every((key) => Array.isArray(parsed?.[key]))
    if (!isValid) return null

    const internalRequests: InternalRequest[] = Array.isArray(parsed.internalRequests)
      ? parsed.internalRequests
      : createSeedInternalRequests(parsed.patients, parsed.appointments)
    const currentStaffId: string =
      typeof parsed.currentStaffId === "string" && staffById(parsed.currentStaffId)
        ? parsed.currentStaffId
        : DEFAULT_STAFF_ID

    return { ...parsed, internalRequests, currentStaffId } as StoredData
  } catch {
    return null
  }
}

function loadStoredData(): StoredData | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  return parseStoredData(raw)
}

export interface PatientFormInput {
  name: string
  phone: string
  dateOfBirth?: string
  gender?: Gender
  notes?: string
}

export interface BookAppointmentInput {
  patientId: string
  doctorId: string
  date: string
  time: string
  durationMinutes: number
  reason: string
  notes?: string
  source?: BookingSource
}

export interface RescheduleInput {
  doctorId: string
  date: string
  time: string
  durationMinutes: number
}

export interface ConfirmProcedureInput {
  appointmentId: string
  doctorId: string
  serviceId: string
  materials: ProcedureMaterialUsage[]
  notes?: string
}

export interface CreateRequestInput {
  title: string
  description: string
  category: RequestCategory
  priority: RequestPriority
  assignedToStaffId: string
  createdByStaffId: string
  patientId?: string
  appointmentId?: string
}

export type PatientResult = { ok: true; patient: Patient } | { ok: false; error: string }
export type AppointmentResult = { ok: true; appointment: Appointment } | { ok: false; error: string }
export type ProcedureResult =
  | { ok: true; procedure: MedicalProcedure; invoice: Invoice }
  | { ok: false; error: string }
export type PaymentResult = { ok: true; invoice: Invoice } | { ok: false; error: string }
export type RequestResult = { ok: true; request: InternalRequest } | { ok: false; error: string }

interface ClinicDataValue {
  patients: Patient[]
  appointments: Appointment[]
  appointmentViews: AppointmentView[]
  activities: ActivityItem[]
  medicalItems: MedicalItem[]
  inventoryMovements: InventoryMovement[]
  procedures: MedicalProcedure[]
  invoices: Invoice[]
  invoiceViews: InvoiceView[]
  internalRequests: InternalRequest[]
  internalRequestViews: InternalRequestView[]
  currentStaffId: string
  addPatient: (input: PatientFormInput) => PatientResult
  updatePatient: (id: string, input: PatientFormInput) => PatientResult
  bookAppointment: (input: BookAppointmentInput) => AppointmentResult
  rescheduleAppointment: (id: string, input: RescheduleInput) => AppointmentResult
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void
  cancelAppointment: (id: string) => void
  confirmProcedure: (input: ConfirmProcedureInput) => ProcedureResult
  markInvoicePaid: (invoiceId: string) => PaymentResult
  createRequest: (input: CreateRequestInput) => RequestResult
  addRequestMessage: (requestId: string, staffId: string, text: string) => RequestResult
  updateRequestStatus: (requestId: string, status: RequestStatus, staffId: string) => RequestResult
  markRequestSeen: (requestId: string, staffId: string) => void
  setCurrentStaffId: (staffId: string) => void
  resetDemoData: () => void
}

const ClinicDataContext = createContext<ClinicDataValue | null>(null)

function buildActivity(activities: ActivityItem[], type: ActivityItem["type"], message: string): ActivityItem {
  return {
    id: generateSequentialId("ACT", activities.map((a) => a.id)),
    type,
    message,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Every action below reads `stateRef.current` — a plain mutable object that is updated
 * synchronously, in the same tick, the instant an action commits — rather than the `data` React
 * state variable captured in a render's closure.
 *
 * This matters because React does not guarantee that two `setState` calls made back-to-back
 * (e.g. two different actions invoked before React has re-rendered) see each other's result: a
 * plain-value `setState(next)` call does not chain off a previous pending `setState(next)` call the
 * way a functional updater would, so the second call can silently discard the first's change (a
 * "lost update"). Reading and writing through `stateRef` sidesteps this entirely: each action always
 * computes its next state from the truly latest committed data, synchronously, regardless of
 * whether React has re-rendered yet. `setData` is still called on every commit purely to trigger a
 * re-render for consumers — it is never read back as a source of truth.
 *
 * No action uses a `setState(prev => ...)` updater, so there is no risk of side effects (ID
 * generation, activity messages, Date.now() reads) running inside one — every computation happens
 * once, as a plain synchronous function body, with a single, unambiguous return value.
 */
export function ClinicDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoredData>(() => loadStoredData() ?? createSeedData())
  const stateRef = useRef<StoredData>(data)

  function commit(next: StoredData) {
    stateRef.current = next
    setData(next)
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  /**
   * The patient portal is opened in a separate browser tab, which runs its own, independent
   * instance of this provider. Without this, a booking made in that tab would only appear here
   * after a manual refresh. The native `storage` event fires only in *other* same-origin tabs when
   * `localStorage` changes — never in the tab that performed the write — so there is no feedback
   * loop. Adopting the incoming snapshot through the same `commit`-style assignment keeps a single
   * source of truth: `stateRef.current` is updated synchronously, and every local action still reads
   * from it, so an action started right after a cross-tab update still sees the merged-in data.
   *
   * This is last-write-wins across tabs, not a real multi-user transaction log — adequate for a
   * single presenter driving one tab at a time in a local demo, not a substitute for a backend.
   */
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || event.newValue === null) return
      const next = parseStoredData(event.newValue)
      if (!next) return
      stateRef.current = next
      setData(next)
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const addPatient = useCallback((input: PatientFormInput): PatientResult => {
    const current = stateRef.current
    const name = input.name.trim()
    if (!name) return { ok: false, error: "الرجاء إدخال اسم المريض" }
    if (!isValidJordanPhone(input.phone)) {
      return { ok: false, error: "رقم الهاتف غير صالح، يرجى إدخال رقم أردني صحيح" }
    }
    const phone = normalizePhone(input.phone)

    const duplicate = current.patients.find((p) => normalizePhone(p.phone) === phone)
    if (duplicate) {
      return { ok: false, error: `يوجد مريض مسجل بنفس رقم الهاتف: ${duplicate.name}` }
    }

    const patient: Patient = {
      id: generateSequentialId("PT", current.patients.map((p) => p.id)),
      name,
      phone,
      dateOfBirth: input.dateOfBirth || undefined,
      gender: input.gender,
      notes: input.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    const activity = buildActivity(current.activities, "registration", `تسجيل مريض جديد: ${patient.name}`)

    commit({
      ...current,
      patients: [patient, ...current.patients],
      activities: [activity, ...current.activities].slice(0, MAX_ACTIVITIES),
    })

    return { ok: true, patient }
  }, [])

  const updatePatient = useCallback((id: string, input: PatientFormInput): PatientResult => {
    const current = stateRef.current
    const name = input.name.trim()
    if (!name) return { ok: false, error: "الرجاء إدخال اسم المريض" }
    if (!isValidJordanPhone(input.phone)) {
      return { ok: false, error: "رقم الهاتف غير صالح، يرجى إدخال رقم أردني صحيح" }
    }
    const phone = normalizePhone(input.phone)

    const duplicate = current.patients.find((p) => p.id !== id && normalizePhone(p.phone) === phone)
    if (duplicate) {
      return { ok: false, error: `يوجد مريض مسجل بنفس رقم الهاتف: ${duplicate.name}` }
    }

    const existing = current.patients.find((p) => p.id === id)
    if (!existing) return { ok: false, error: "تعذر العثور على المريض" }

    const updated: Patient = {
      ...existing,
      name,
      phone,
      dateOfBirth: input.dateOfBirth || undefined,
      gender: input.gender,
      notes: input.notes?.trim() || undefined,
    }

    commit({ ...current, patients: current.patients.map((p) => (p.id === id ? updated : p)) })

    return { ok: true, patient: updated }
  }, [])

  const bookAppointment = useCallback((input: BookAppointmentInput): AppointmentResult => {
    const current = stateRef.current
    const doctor = doctorById(input.doctorId)
    if (!doctor) return { ok: false, error: "الرجاء اختيار الطبيب" }
    if (!input.date || !input.time) return { ok: false, error: "الرجاء اختيار التاريخ والوقت" }
    if (isPastSlot(input.date, input.time)) {
      return { ok: false, error: "لا يمكن حجز موعد في وقت سابق" }
    }

    const patient = current.patients.find((p) => p.id === input.patientId)
    if (!patient) return { ok: false, error: "الرجاء اختيار المريض" }

    if (
      hasConflict({
        doctorId: input.doctorId,
        date: input.date,
        time: input.time,
        durationMinutes: input.durationMinutes,
        appointments: current.appointments,
      })
    ) {
      return { ok: false, error: "هذا الموعد غير متاح، الطبيب لديه حجز آخر في نفس الوقت" }
    }

    const source: BookingSource = input.source ?? "reception"
    const appointment: Appointment = {
      id: generateSequentialId("AP", current.appointments.map((a) => a.id)),
      patientId: input.patientId,
      doctorId: input.doctorId,
      date: input.date,
      time: input.time,
      durationMinutes: input.durationMinutes,
      reason: input.reason,
      notes: input.notes?.trim() || undefined,
      status: "scheduled",
      source,
      createdAt: new Date().toISOString(),
    }
    const activity = buildActivity(
      current.activities,
      "appointment",
      source === "portal"
        ? `تم حجز موعد جديد عبر بوابة المريض لـ ${patient.name} مع ${doctor.name}`
        : `تم حجز موعد جديد لـ ${patient.name} مع ${doctor.name}`
    )

    commit({
      ...current,
      appointments: [appointment, ...current.appointments],
      activities: [activity, ...current.activities].slice(0, MAX_ACTIVITIES),
    })

    return { ok: true, appointment }
  }, [])

  const rescheduleAppointment = useCallback((id: string, input: RescheduleInput): AppointmentResult => {
    const current = stateRef.current
    const doctor = doctorById(input.doctorId)
    if (!doctor) return { ok: false, error: "الرجاء اختيار الطبيب" }
    if (isPastSlot(input.date, input.time)) {
      return { ok: false, error: "لا يمكن جدولة موعد في وقت سابق" }
    }

    const existing = current.appointments.find((a) => a.id === id)
    if (!existing) return { ok: false, error: "تعذر العثور على الموعد" }

    if (
      hasConflict({
        doctorId: input.doctorId,
        date: input.date,
        time: input.time,
        durationMinutes: input.durationMinutes,
        appointments: current.appointments,
        excludeAppointmentId: id,
      })
    ) {
      return { ok: false, error: "هذا الموعد غير متاح، الطبيب لديه حجز آخر في نفس الوقت" }
    }

    const updated: Appointment = {
      ...existing,
      doctorId: input.doctorId,
      date: input.date,
      time: input.time,
      durationMinutes: input.durationMinutes,
      status: "scheduled",
    }
    const patient = current.patients.find((p) => p.id === existing.patientId)
    const activity = buildActivity(
      current.activities,
      "appointment",
      `تمت إعادة جدولة موعد ${patient?.name ?? ""} مع ${doctor.name}`
    )

    commit({
      ...current,
      appointments: current.appointments.map((a) => (a.id === id ? updated : a)),
      activities: [activity, ...current.activities].slice(0, MAX_ACTIVITIES),
    })

    return { ok: true, appointment: updated }
  }, [])

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    const current = stateRef.current
    const existing = current.appointments.find((a) => a.id === id)
    if (!existing || existing.status === status) return

    const patient = current.patients.find((p) => p.id === existing.patientId)
    const doctor = doctorById(existing.doctorId)

    let activity: ActivityItem | null = null
    if (status === "cancelled") {
      activity = buildActivity(current.activities, "appointment", `إلغاء موعد ${patient?.name ?? ""}`)
    } else if (status === "completed") {
      activity = buildActivity(
        current.activities,
        "procedure",
        `اكتمال موعد ${patient?.name ?? ""} مع ${doctor?.name ?? ""}`
      )
    }

    commit({
      ...current,
      appointments: current.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
      activities: activity ? [activity, ...current.activities].slice(0, MAX_ACTIVITIES) : current.activities,
    })
  }, [])

  const cancelAppointment = useCallback(
    (id: string) => updateAppointmentStatus(id, "cancelled"),
    [updateAppointmentStatus]
  )

  const confirmProcedure = useCallback((input: ConfirmProcedureInput): ProcedureResult => {
    const current = stateRef.current
    const appointment = current.appointments.find((a) => a.id === input.appointmentId)
    if (!appointment) return { ok: false, error: "تعذر العثور على الموعد" }
    if (appointment.doctorId !== input.doctorId) {
      return { ok: false, error: "هذا الموعد غير مخصص لهذا الطبيب" }
    }
    if (appointment.status === "cancelled") {
      return { ok: false, error: "لا يمكن تسجيل إجراء لموعد ملغى" }
    }
    if (current.procedures.some((p) => p.appointmentId === input.appointmentId)) {
      return { ok: false, error: "تم تسجيل إجراء لهذا الموعد مسبقاً" }
    }

    const doctor = doctorById(input.doctorId)
    const service = serviceById(input.serviceId)
    if (!doctor || !service) return { ok: false, error: "بيانات الإجراء غير مكتملة" }

    const itemIds = input.materials.map((m) => m.itemId)
    if (new Set(itemIds).size !== itemIds.length) {
      return { ok: false, error: "تم اختيار نفس الصنف أكثر من مرة" }
    }
    for (const m of input.materials) {
      if (m.quantity <= 0) return { ok: false, error: "الكمية يجب أن تكون أكبر من صفر" }
    }

    const today = todayISO()
    let materialsCost = 0
    for (const m of input.materials) {
      const item = current.medicalItems.find((i) => i.id === m.itemId)
      if (!item) return { ok: false, error: "أحد الأصناف المختارة غير موجود" }
      const available = computeAvailableStock(item, today)
      if (available < m.quantity) {
        return {
          ok: false,
          error: `الكمية المتوفرة من "${item.name}" غير كافية (المتوفر: ${available})`,
        }
      }
      materialsCost += item.unitCost * m.quantity
    }

    // All validations passed — compute the full transaction and commit it in one write.
    const procedureId = generateSequentialId("PR", current.procedures.map((p) => p.id))
    const invoiceId = generateSequentialId("INV", current.invoices.map((i) => i.id))
    const nowIso = new Date().toISOString()

    const updatedItems = current.medicalItems.map((item) => {
      const usage = input.materials.find((m) => m.itemId === item.id)
      return usage ? deductStock(item, usage.quantity, today) : item
    })

    const movementIdPool = current.inventoryMovements.map((mv) => mv.id)
    const movements: InventoryMovement[] = input.materials.map((m) => {
      const movementId = generateSequentialId("MV", movementIdPool)
      movementIdPool.push(movementId)
      return {
        id: movementId,
        itemId: m.itemId,
        quantityChange: -m.quantity,
        type: "consumption",
        procedureId,
        appointmentId: appointment.id,
        timestamp: nowIso,
      }
    })

    const procedure: MedicalProcedure = {
      id: procedureId,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: input.doctorId,
      departmentId: doctor.departmentId,
      serviceId: service.id,
      materials: input.materials,
      notes: input.notes?.trim() || undefined,
      materialsCost: Math.round(materialsCost * 100) / 100,
      billedAmount: service.price,
      createdAt: nowIso,
    }

    const invoice: Invoice = {
      id: invoiceId,
      invoiceNumber: invoiceId,
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      doctorId: input.doctorId,
      departmentId: doctor.departmentId,
      procedureId,
      serviceName: service.name,
      amount: service.price,
      status: "unpaid",
      issuedAt: nowIso,
    }

    const patient = current.patients.find((p) => p.id === appointment.patientId)
    const activity = buildActivity(
      current.activities,
      "procedure",
      `تم تسجيل إجراء "${service.name}" للمريض ${patient?.name ?? ""} بواسطة ${doctor.name}`
    )

    commit({
      ...current,
      appointments: current.appointments.map((a) =>
        a.id === appointment.id ? { ...a, status: "completed" as const } : a
      ),
      procedures: [procedure, ...current.procedures],
      invoices: [invoice, ...current.invoices],
      inventoryMovements: [...movements, ...current.inventoryMovements],
      medicalItems: updatedItems,
      activities: [activity, ...current.activities].slice(0, MAX_ACTIVITIES),
    })

    return { ok: true, procedure, invoice }
  }, [])

  const markInvoicePaid = useCallback((invoiceId: string): PaymentResult => {
    const current = stateRef.current
    const invoice = current.invoices.find((i) => i.id === invoiceId)
    if (!invoice) return { ok: false, error: "تعذر العثور على الفاتورة" }
    if (invoice.status === "paid") return { ok: false, error: "تم دفع هذه الفاتورة مسبقاً" }

    const paidAt = new Date().toISOString()
    const updatedInvoice: Invoice = { ...invoice, status: "paid", paidAt }
    const patient = current.patients.find((p) => p.id === invoice.patientId)
    const activity = buildActivity(
      current.activities,
      "payment",
      `تم تسجيل دفعة بقيمة ${invoice.amount.toLocaleString("en-US")} د.أ للمريض ${patient?.name ?? ""}`
    )

    commit({
      ...current,
      invoices: current.invoices.map((i) => (i.id === invoiceId ? updatedInvoice : i)),
      activities: [activity, ...current.activities].slice(0, MAX_ACTIVITIES),
    })

    return { ok: true, invoice: updatedInvoice }
  }, [])

  const createRequest = useCallback((input: CreateRequestInput): RequestResult => {
    const current = stateRef.current
    const title = input.title.trim()
    if (!title) return { ok: false, error: "الرجاء إدخال عنوان الطلب" }
    const description = input.description.trim()
    if (!description) return { ok: false, error: "الرجاء إدخال وصف الطلب" }

    const creator = staffById(input.createdByStaffId)
    if (!creator) return { ok: false, error: "تعذر تحديد منشئ الطلب" }
    const assignee = staffById(input.assignedToStaffId)
    if (!assignee) return { ok: false, error: "الرجاء اختيار الموظف أو القسم المسؤول" }

    if (input.patientId && !current.patients.some((p) => p.id === input.patientId)) {
      return { ok: false, error: "تعذر العثور على المريض المحدد" }
    }
    if (input.appointmentId) {
      const appointment = current.appointments.find((a) => a.id === input.appointmentId)
      if (!appointment) return { ok: false, error: "تعذر العثور على الموعد المحدد" }
      if (input.patientId && appointment.patientId !== input.patientId) {
        return { ok: false, error: "الموعد المحدد لا يخص هذا المريض" }
      }
    }

    const nowIso = new Date().toISOString()
    const request: InternalRequest = {
      id: generateSequentialId("REQ", current.internalRequests.map((r) => r.id)),
      title,
      description,
      category: input.category,
      priority: input.priority,
      status: "new",
      createdByStaffId: input.createdByStaffId,
      assignedToStaffId: input.assignedToStaffId,
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      messages: [],
      activity: [
        {
          id: generateSequentialId(
            "RACT",
            current.internalRequests.flatMap((r) => r.activity.map((a) => a.id))
          ),
          message: `تم إنشاء الطلب بواسطة ${creator.name} وإسناده إلى ${assignee.name}`,
          timestamp: nowIso,
        },
      ],
      seenByStaffIds: [input.createdByStaffId],
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    commit({ ...current, internalRequests: [request, ...current.internalRequests] })
    return { ok: true, request }
  }, [])

  const addRequestMessage = useCallback((requestId: string, staffId: string, text: string): RequestResult => {
    const current = stateRef.current
    const request = current.internalRequests.find((r) => r.id === requestId)
    if (!request) return { ok: false, error: "تعذر العثور على الطلب" }
    const sender = staffById(staffId)
    if (!sender) return { ok: false, error: "تعذر تحديد المرسل" }
    const trimmed = text.trim()
    if (!trimmed) return { ok: false, error: "الرجاء كتابة نص الرسالة" }

    const nowIso = new Date().toISOString()
    const message = {
      id: generateSequentialId("MSG", current.internalRequests.flatMap((r) => r.messages.map((m) => m.id))),
      staffId,
      text: trimmed,
      timestamp: nowIso,
    }
    const activityEntry = {
      id: generateSequentialId(
        "RACT",
        current.internalRequests.flatMap((r) => r.activity.map((a) => a.id))
      ),
      message: `رد جديد من ${sender.name}`,
      timestamp: nowIso,
    }

    const updated: InternalRequest = {
      ...request,
      messages: [...request.messages, message],
      activity: [...request.activity, activityEntry],
      seenByStaffIds: request.seenByStaffIds.includes(staffId)
        ? request.seenByStaffIds
        : [...request.seenByStaffIds, staffId],
      updatedAt: nowIso,
    }

    commit({
      ...current,
      internalRequests: current.internalRequests.map((r) => (r.id === requestId ? updated : r)),
    })
    return { ok: true, request: updated }
  }, [])

  const updateRequestStatus = useCallback(
    (requestId: string, status: RequestStatus, staffId: string): RequestResult => {
      const current = stateRef.current
      const request = current.internalRequests.find((r) => r.id === requestId)
      if (!request) return { ok: false, error: "تعذر العثور على الطلب" }
      if (request.status === status) return { ok: false, error: "الطلب بهذه الحالة مسبقاً" }
      const actor = staffById(staffId)
      if (!actor) return { ok: false, error: "تعذر تحديد المستخدم" }

      const nowIso = new Date().toISOString()
      const activityEntry = {
        id: generateSequentialId(
          "RACT",
          current.internalRequests.flatMap((r) => r.activity.map((a) => a.id))
        ),
        message: `تم تغيير الحالة إلى "${requestStatusConfig[status].label}" بواسطة ${actor.name}`,
        timestamp: nowIso,
      }

      const updated: InternalRequest = {
        ...request,
        status,
        activity: [...request.activity, activityEntry],
        updatedAt: nowIso,
      }

      commit({
        ...current,
        internalRequests: current.internalRequests.map((r) => (r.id === requestId ? updated : r)),
      })
      return { ok: true, request: updated }
    },
    []
  )

  const markRequestSeen = useCallback((requestId: string, staffId: string) => {
    const current = stateRef.current
    const request = current.internalRequests.find((r) => r.id === requestId)
    if (!request || request.seenByStaffIds.includes(staffId)) return

    commit({
      ...current,
      internalRequests: current.internalRequests.map((r) =>
        r.id === requestId ? { ...r, seenByStaffIds: [...r.seenByStaffIds, staffId] } : r
      ),
    })
  }, [])

  const setCurrentStaffId = useCallback((staffId: string) => {
    const current = stateRef.current
    if (current.currentStaffId === staffId || !staffById(staffId)) return
    commit({ ...current, currentStaffId: staffId })
  }, [])

  const resetDemoData = useCallback(() => {
    commit(createSeedData())
  }, [])

  const appointmentViews = useMemo(
    () => data.appointments.map((a) => toAppointmentView(a, data.patients)),
    [data.appointments, data.patients]
  )

  const invoiceViews = useMemo(
    () => data.invoices.map((i) => toInvoiceView(i, data.patients)),
    [data.invoices, data.patients]
  )

  const internalRequestViews = useMemo(
    () => data.internalRequests.map((r) => toInternalRequestView(r, data.patients)),
    [data.internalRequests, data.patients]
  )

  const value = useMemo<ClinicDataValue>(
    () => ({
      patients: data.patients,
      appointments: data.appointments,
      appointmentViews,
      activities: data.activities,
      medicalItems: data.medicalItems,
      inventoryMovements: data.inventoryMovements,
      procedures: data.procedures,
      invoices: data.invoices,
      invoiceViews,
      internalRequests: data.internalRequests,
      internalRequestViews,
      currentStaffId: data.currentStaffId,
      addPatient,
      updatePatient,
      bookAppointment,
      rescheduleAppointment,
      updateAppointmentStatus,
      cancelAppointment,
      confirmProcedure,
      markInvoicePaid,
      createRequest,
      addRequestMessage,
      updateRequestStatus,
      markRequestSeen,
      setCurrentStaffId,
      resetDemoData,
    }),
    [
      data.patients,
      data.appointments,
      data.activities,
      data.medicalItems,
      data.inventoryMovements,
      data.procedures,
      data.invoices,
      data.internalRequests,
      data.currentStaffId,
      appointmentViews,
      invoiceViews,
      internalRequestViews,
      addPatient,
      updatePatient,
      bookAppointment,
      rescheduleAppointment,
      updateAppointmentStatus,
      cancelAppointment,
      confirmProcedure,
      markInvoicePaid,
      createRequest,
      addRequestMessage,
      updateRequestStatus,
      markRequestSeen,
      setCurrentStaffId,
      resetDemoData,
    ]
  )

  return <ClinicDataContext.Provider value={value}>{children}</ClinicDataContext.Provider>
}

export function useClinicData() {
  const ctx = useContext(ClinicDataContext)
  if (!ctx) throw new Error("useClinicData must be used within ClinicDataProvider")
  return ctx
}
