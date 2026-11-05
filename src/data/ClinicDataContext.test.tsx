import { act, render } from "@testing-library/react"
import { useEffect } from "react"
import { beforeEach, describe, expect, it } from "vitest"
import { MANAGER_STAFF_ID, RECEPTION_STAFF_ID } from "@/config/staff"
import { ClinicDataProvider, useClinicData } from "./ClinicDataContext"

type Api = ReturnType<typeof useClinicData>

function setup() {
  let api: Api | null = null
  render(
    <ClinicDataProvider>
      <Harness onReady={(a) => { api = a }} />
    </ClinicDataProvider>
  )
  return () => {
    if (!api) throw new Error("api not ready")
    return api
  }
}

function Harness({ onReady }: { onReady: (api: Api) => void }) {
  const api = useClinicData()
  useEffect(() => {
    onReady(api)
  })
  return null
}

beforeEach(() => {
  localStorage.clear()
})

describe("ClinicDataContext — concurrent synchronous operations", () => {
  it("TEST A: two patients created synchronously both exist", () => {
    const getApi = setup()

    let resultA!: ReturnType<Api["addPatient"]>
    let resultB!: ReturnType<Api["addPatient"]>
    act(() => {
      resultA = getApi().addPatient({ name: "مريض أ", phone: "0791111111" })
      resultB = getApi().addPatient({ name: "مريض ب", phone: "0792222222" })
    })

    expect(resultA.ok).toBe(true)
    expect(resultB.ok).toBe(true)
    const api = getApi()
    expect(api.patients.some((p) => p.name === "مريض أ")).toBe(true)
    expect(api.patients.some((p) => p.name === "مريض ب")).toBe(true)
  })

  it("TEST B: two bookings for the same doctor/time in the same cycle — only one succeeds", () => {
    const getApi = setup()
    const api0 = getApi()
    const doctorId = api0.appointments[0].doctorId
    const patientId = api0.patients[0].id
    const date = "2099-01-10"
    const time = "10:00"

    let resultA!: ReturnType<Api["bookAppointment"]>
    let resultB!: ReturnType<Api["bookAppointment"]>
    act(() => {
      resultA = getApi().bookAppointment({
        patientId,
        doctorId,
        date,
        time,
        durationMinutes: 30,
        reason: "test",
      })
      resultB = getApi().bookAppointment({
        patientId,
        doctorId,
        date,
        time,
        durationMinutes: 30,
        reason: "test",
      })
    })

    const successes = [resultA, resultB].filter((r) => r.ok)
    expect(successes.length).toBe(1)

    const api = getApi()
    const matching = api.appointments.filter(
      (a) => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== "cancelled"
    )
    expect(matching.length).toBe(1)
  })

  it("TEST C: confirming the same procedure twice synchronously yields exactly one of each record", () => {
    const getApi = setup()
    const api0 = getApi()
    const appointment = api0.appointments.find((a) => a.status === "in-progress")!
    const item = api0.medicalItems[0]

    let resultA!: ReturnType<Api["confirmProcedure"]>
    let resultB!: ReturnType<Api["confirmProcedure"]>
    act(() => {
      resultA = getApi().confirmProcedure({
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        serviceId: api0.patients.length > 0 ? firstServiceFor(appointment.doctorId, getApi()) : "",
        materials: [{ itemId: item.id, quantity: 1 }],
      })
      resultB = getApi().confirmProcedure({
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        serviceId: firstServiceFor(appointment.doctorId, getApi()),
        materials: [{ itemId: item.id, quantity: 1 }],
      })
    })

    const successes = [resultA, resultB].filter((r) => r.ok)
    expect(successes.length).toBe(1)

    const api = getApi()
    const procedures = api.procedures.filter((p) => p.appointmentId === appointment.id)
    expect(procedures.length).toBe(1)

    const invoices = api.invoices.filter((inv) => inv.appointmentId === appointment.id)
    expect(invoices.length).toBe(1)

    const movements = api.inventoryMovements.filter((m) => m.appointmentId === appointment.id)
    expect(movements.length).toBe(1)

    const updatedItem = api.medicalItems.find((i) => i.id === item.id)!
    const before = computeTotalQuantity(item)
    const after = computeTotalQuantity(updatedItem)
    expect(before - after).toBe(1)
  })

  it("TEST D: two different valid procedures confirmed synchronously are both preserved", () => {
    const getApi = setup()
    const api0 = getApi()
    const inProgress = api0.appointments.filter((a) => a.status === "in-progress")
    expect(inProgress.length).toBeGreaterThanOrEqual(2)
    const [appt1, appt2] = inProgress
    const item = api0.medicalItems.find((i) => i.name.includes("حقن"))!

    let resultA!: ReturnType<Api["confirmProcedure"]>
    let resultB!: ReturnType<Api["confirmProcedure"]>
    act(() => {
      resultA = getApi().confirmProcedure({
        appointmentId: appt1.id,
        doctorId: appt1.doctorId,
        serviceId: firstServiceFor(appt1.doctorId, getApi()),
        materials: [{ itemId: item.id, quantity: 1 }],
      })
      resultB = getApi().confirmProcedure({
        appointmentId: appt2.id,
        doctorId: appt2.doctorId,
        serviceId: firstServiceFor(appt2.doctorId, getApi()),
        materials: [{ itemId: item.id, quantity: 1 }],
      })
    })

    expect(resultA.ok).toBe(true)
    expect(resultB.ok).toBe(true)

    const api = getApi()
    expect(api.procedures.some((p) => p.appointmentId === appt1.id)).toBe(true)
    expect(api.procedures.some((p) => p.appointmentId === appt2.id)).toBe(true)

    const updatedItem = api.medicalItems.find((i) => i.id === item.id)!
    const before = computeTotalQuantity(item)
    const after = computeTotalQuantity(updatedItem)
    expect(before - after).toBe(2)
  })

  it("TEST E: paying two different invoices synchronously preserves both payments and totals", () => {
    const getApi = setup()
    const api0 = getApi()
    const unpaid = api0.invoices.filter((inv) => inv.status === "unpaid")
    expect(unpaid.length).toBeGreaterThanOrEqual(2)
    const [inv1, inv2] = unpaid
    const totalBefore = api0.invoices.reduce((sum, i) => sum + i.amount, 0)
    const paidBefore = api0.invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0)

    let resultA!: ReturnType<Api["markInvoicePaid"]>
    let resultB!: ReturnType<Api["markInvoicePaid"]>
    act(() => {
      resultA = getApi().markInvoicePaid(inv1.id)
      resultB = getApi().markInvoicePaid(inv2.id)
    })

    expect(resultA.ok).toBe(true)
    expect(resultB.ok).toBe(true)

    const api = getApi()
    expect(api.invoices.find((i) => i.id === inv1.id)?.status).toBe("paid")
    expect(api.invoices.find((i) => i.id === inv2.id)?.status).toBe("paid")

    const totalAfter = api.invoices.reduce((sum, i) => sum + i.amount, 0)
    const paidAfter = api.invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0)
    expect(totalAfter).toBe(totalBefore)
    expect(paidAfter).toBe(paidBefore + inv1.amount + inv2.amount)
  })

  it("TEST F: state persisted to localStorage reflects all synchronous changes (simulated refresh)", () => {
    const getApi = setup()

    act(() => {
      getApi().addPatient({ name: "مريض جـ", phone: "0793333333" })
      getApi().addPatient({ name: "مريض د", phone: "0794444444" })
    })

    const raw = localStorage.getItem("clinicflow-demo-data-v2")
    expect(raw).toBeTruthy()
    const persisted = JSON.parse(raw!)
    expect(persisted.patients.some((p: { name: string }) => p.name === "مريض جـ")).toBe(true)
    expect(persisted.patients.some((p: { name: string }) => p.name === "مريض د")).toBe(true)
  })
})

describe("ClinicDataContext — internal communication (Phase 5)", () => {
  it("TEST G: two requests created synchronously both exist with unique ids", () => {
    const getApi = setup()

    let resultA!: ReturnType<Api["createRequest"]>
    let resultB!: ReturnType<Api["createRequest"]>
    act(() => {
      resultA = getApi().createRequest({
        title: "طلب أ",
        description: "وصف الطلب أ",
        category: "administrative",
        priority: "normal",
        assignedToStaffId: RECEPTION_STAFF_ID,
        createdByStaffId: "staff-d1",
      })
      resultB = getApi().createRequest({
        title: "طلب ب",
        description: "وصف الطلب ب",
        category: "administrative",
        priority: "normal",
        assignedToStaffId: MANAGER_STAFF_ID,
        createdByStaffId: "staff-d2",
      })
    })

    expect(resultA.ok).toBe(true)
    expect(resultB.ok).toBe(true)
    if (!resultA.ok || !resultB.ok) throw new Error("unexpected failure")
    expect(resultA.request.id).not.toBe(resultB.request.id)

    const api = getApi()
    expect(api.internalRequests.some((r) => r.title === "طلب أ")).toBe(true)
    expect(api.internalRequests.some((r) => r.title === "طلب ب")).toBe(true)
  })

  it("TEST H: a status update and a message reply on the same request synchronously are both preserved", () => {
    const getApi = setup()

    let created!: ReturnType<Api["createRequest"]>
    act(() => {
      created = getApi().createRequest({
        title: "طلب للمتابعة",
        description: "وصف",
        category: "patient-followup",
        priority: "normal",
        assignedToStaffId: RECEPTION_STAFF_ID,
        createdByStaffId: "staff-d1",
      })
    })
    if (!created.ok) throw new Error("setup failed")
    const requestId = created.request.id

    let statusResult!: ReturnType<Api["updateRequestStatus"]>
    let messageResult!: ReturnType<Api["addRequestMessage"]>
    act(() => {
      statusResult = getApi().updateRequestStatus(requestId, "in-progress", RECEPTION_STAFF_ID)
      messageResult = getApi().addRequestMessage(requestId, RECEPTION_STAFF_ID, "تم استلام الطلب")
    })

    expect(statusResult.ok).toBe(true)
    expect(messageResult.ok).toBe(true)

    const api = getApi()
    const request = api.internalRequests.find((r) => r.id === requestId)!
    expect(request.status).toBe("in-progress")
    expect(request.messages.some((m) => m.text === "تم استلام الطلب")).toBe(true)
  })

  it("TEST I: duplicate status update to the same status synchronously is rejected, not double-logged", () => {
    const getApi = setup()

    let created!: ReturnType<Api["createRequest"]>
    act(() => {
      created = getApi().createRequest({
        title: "طلب آخر",
        description: "وصف",
        category: "administrative",
        priority: "normal",
        assignedToStaffId: RECEPTION_STAFF_ID,
        createdByStaffId: "staff-d1",
      })
    })
    if (!created.ok) throw new Error("setup failed")
    const requestId = created.request.id

    let resultA!: ReturnType<Api["updateRequestStatus"]>
    let resultB!: ReturnType<Api["updateRequestStatus"]>
    act(() => {
      resultA = getApi().updateRequestStatus(requestId, "in-progress", RECEPTION_STAFF_ID)
      resultB = getApi().updateRequestStatus(requestId, "in-progress", RECEPTION_STAFF_ID)
    })

    const successes = [resultA, resultB].filter((r) => r.ok)
    expect(successes.length).toBe(1)

    const api = getApi()
    const request = api.internalRequests.find((r) => r.id === requestId)!
    expect(request.status).toBe("in-progress")
    const statusChangeEntries = request.activity.filter((a) => a.message.includes("قيد التنفيذ"))
    expect(statusChangeEntries.length).toBe(1)
  })

  it("TEST J: created requests and replies persist to localStorage (simulated refresh)", () => {
    const getApi = setup()

    act(() => {
      const created = getApi().createRequest({
        title: "طلب محفوظ",
        description: "وصف",
        category: "supplies",
        priority: "important",
        assignedToStaffId: RECEPTION_STAFF_ID,
        createdByStaffId: "staff-d1",
      })
      if (created.ok) {
        getApi().addRequestMessage(created.request.id, RECEPTION_STAFF_ID, "رد محفوظ")
      }
    })

    const raw = localStorage.getItem("clinicflow-demo-data-v2")
    expect(raw).toBeTruthy()
    const persisted = JSON.parse(raw!)
    const saved = persisted.internalRequests.find((r: { title: string }) => r.title === "طلب محفوظ")
    expect(saved).toBeTruthy()
    expect(saved.messages.some((m: { text: string }) => m.text === "رد محفوظ")).toBe(true)
  })
})

function firstServiceFor(doctorId: string, api: Api): string {
  const doctorDeptMap: Record<string, string> = {
    d1: "svc-dental-1",
    d2: "svc-derm-1",
    d3: "svc-obgyn-1",
    d4: "svc-ortho-1",
    d5: "svc-peds-1",
    d6: "svc-dental-1",
    d7: "svc-derm-1",
    d8: "svc-obgyn-1",
    d9: "svc-ortho-1",
    d10: "svc-peds-1",
  }
  void api
  return doctorDeptMap[doctorId] ?? "svc-dental-1"
}

function computeTotalQuantity(item: { batches: { quantity: number }[] }): number {
  return item.batches.reduce((sum, b) => sum + b.quantity, 0)
}
