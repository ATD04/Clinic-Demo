import { DEFAULT_STAFF_ID, MANAGER_STAFF_ID, RECEPTION_STAFF_ID } from "@/config/staff"
import { serviceById } from "@/config/services"
import { addDays, todayISO } from "@/lib/date"
import type {
  ActivityItem,
  Appointment,
  InternalRequest,
  Invoice,
  InventoryMovement,
  MedicalItem,
  MedicalProcedure,
  Patient,
} from "@/types"

export interface SeedPatientInput {
  id: string
  name: string
  phone: string
  dateOfBirth: string
  gender: "male" | "female"
  registeredDaysAgo: number
}

const SEED_PATIENTS_INPUT: SeedPatientInput[] = [
  { id: "PT-1001", name: "رهف النابلسي", phone: "0791234567", dateOfBirth: "1996-03-14", gender: "female", registeredDaysAgo: 210 },
  { id: "PT-1002", name: "خالد المصري", phone: "0777654321", dateOfBirth: "1985-07-22", gender: "male", registeredDaysAgo: 340 },
  { id: "PT-1003", name: "مريم الحوراني", phone: "0788112233", dateOfBirth: "1990-11-05", gender: "female", registeredDaysAgo: 120 },
  { id: "PT-1004", name: "يوسف القرالة", phone: "0799887766", dateOfBirth: "1978-02-18", gender: "male", registeredDaysAgo: 95 },
  { id: "PT-1005", name: "نور الشوابكة", phone: "0791122334", dateOfBirth: "2018-05-30", gender: "female", registeredDaysAgo: 60 },
  { id: "PT-1006", name: "عبدالله الطراونة", phone: "0776543210", dateOfBirth: "1982-09-09", gender: "male", registeredDaysAgo: 400 },
  { id: "PT-1007", name: "هبة العزام", phone: "0789456123", dateOfBirth: "1993-12-01", gender: "female", registeredDaysAgo: 75 },
  { id: "PT-1008", name: "زيد بني هاني", phone: "0797788990", dateOfBirth: "1975-04-25", gender: "male", registeredDaysAgo: 500 },
  { id: "PT-1009", name: "لمى فريحات", phone: "0781239876", dateOfBirth: "1988-06-17", gender: "female", registeredDaysAgo: 30 },
  { id: "PT-1010", name: "سلطان العدوان", phone: "0795671234", dateOfBirth: "2015-01-10", gender: "male", registeredDaysAgo: 18 },
  { id: "PT-1011", name: "عبير الكايد", phone: "0776001122", dateOfBirth: "1991-08-08", gender: "female", registeredDaysAgo: 10 },
  { id: "PT-1012", name: "فراس حجازين", phone: "0788997766", dateOfBirth: "1980-10-03", gender: "male", registeredDaysAgo: 5 },
]

interface SeedAppointmentInput {
  id: string
  patientId: string
  doctorId: string
  dayOffset: number
  time: string
  durationMinutes: number
  reason: string
  status: Appointment["status"]
  createdMinutesAgo: number
}

const SEED_APPOINTMENTS_INPUT: SeedAppointmentInput[] = [
  // Today's schedule
  { id: "AP-1001", patientId: "PT-1001", doctorId: "d2", dayOffset: 0, time: "09:00", durationMinutes: 20, reason: "كشف أولي", status: "completed", createdMinutesAgo: 600 },
  { id: "AP-1002", patientId: "PT-1002", doctorId: "d1", dayOffset: 0, time: "09:30", durationMinutes: 30, reason: "فحص دوري", status: "completed", createdMinutesAgo: 540 },
  { id: "AP-1003", patientId: "PT-1003", doctorId: "d3", dayOffset: 0, time: "10:15", durationMinutes: 30, reason: "متابعة", status: "in-progress", createdMinutesAgo: 480 },
  { id: "AP-1004", patientId: "PT-1004", doctorId: "d4", dayOffset: 0, time: "10:45", durationMinutes: 30, reason: "استشارة", status: "in-progress", createdMinutesAgo: 420 },
  { id: "AP-1005", patientId: "PT-1005", doctorId: "d5", dayOffset: 0, time: "11:00", durationMinutes: 20, reason: "فحص دوري", status: "arrived", createdMinutesAgo: 360 },
  { id: "AP-1006", patientId: "PT-1006", doctorId: "d6", dayOffset: 0, time: "11:30", durationMinutes: 30, reason: "إجراء علاجي", status: "arrived", createdMinutesAgo: 300 },
  { id: "AP-1007", patientId: "PT-1007", doctorId: "d2", dayOffset: 0, time: "12:00", durationMinutes: 20, reason: "كشف أولي", status: "scheduled", createdMinutesAgo: 240 },
  { id: "AP-1008", patientId: "PT-1008", doctorId: "d4", dayOffset: 0, time: "13:15", durationMinutes: 30, reason: "متابعة", status: "scheduled", createdMinutesAgo: 180 },
  { id: "AP-1009", patientId: "PT-1009", doctorId: "d3", dayOffset: 0, time: "14:00", durationMinutes: 30, reason: "استشارة", status: "scheduled", createdMinutesAgo: 5 },
  { id: "AP-1010", patientId: "PT-1010", doctorId: "d5", dayOffset: 0, time: "14:30", durationMinutes: 20, reason: "فحص دوري", status: "cancelled", createdMinutesAgo: 120 },
  { id: "AP-1016", patientId: "PT-1004", doctorId: "d9", dayOffset: 0, time: "09:15", durationMinutes: 30, reason: "إجراء علاجي", status: "completed", createdMinutesAgo: 570 },
  { id: "AP-1017", patientId: "PT-1011", doctorId: "d10", dayOffset: 0, time: "09:45", durationMinutes: 20, reason: "كشف أولي", status: "completed", createdMinutesAgo: 550 },
  { id: "AP-1018", patientId: "PT-1012", doctorId: "d7", dayOffset: 0, time: "10:00", durationMinutes: 20, reason: "فحص دوري", status: "completed", createdMinutesAgo: 530 },
  // History (past)
  { id: "AP-1011", patientId: "PT-1001", doctorId: "d2", dayOffset: -14, time: "10:00", durationMinutes: 20, reason: "متابعة", status: "completed", createdMinutesAgo: 20200 },
  { id: "AP-1012", patientId: "PT-1002", doctorId: "d1", dayOffset: -30, time: "09:00", durationMinutes: 30, reason: "إجراء علاجي", status: "completed", createdMinutesAgo: 43200 },
  { id: "AP-1013", patientId: "PT-1009", doctorId: "d3", dayOffset: -5, time: "11:00", durationMinutes: 30, reason: "استشارة", status: "cancelled", createdMinutesAgo: 7200 },
  // Upcoming (not today)
  { id: "AP-1014", patientId: "PT-1002", doctorId: "d6", dayOffset: 6, time: "10:00", durationMinutes: 30, reason: "فحص دوري", status: "scheduled", createdMinutesAgo: 60 },
  { id: "AP-1015", patientId: "PT-1007", doctorId: "d7", dayOffset: 3, time: "09:30", durationMinutes: 20, reason: "متابعة", status: "scheduled", createdMinutesAgo: 90 },
]

interface SeedActivityInput {
  type: ActivityItem["type"]
  message: string
  minutesAgo: number
}

const SEED_ACTIVITIES_INPUT: SeedActivityInput[] = [
  { type: "appointment", message: "تم حجز موعد جديد لـ لمى فريحات مع د. لينا حداد", minutesAgo: 5 },
  { type: "registration", message: "تسجيل مريض جديد: سلطان العدوان", minutesAgo: 18 },
  { type: "procedure", message: "تم تسجيل إجراء \"تنظيف أسنان\" للمريض خالد المصري بواسطة د. أحمد الخطيب", minutesAgo: 32 },
  { type: "inventory", message: "تنبيه: كمية قفازات الفحص منخفضة في المخزون", minutesAgo: 60 },
  { type: "appointment", message: "إلغاء موعد سلطان العدوان في قسم طب الأطفال", minutesAgo: 120 },
]

interface SeedBatchInput {
  id: string
  batchNumber: string
  quantity: number
  receivedDaysAgo: number
  expirationDaysOffset?: number
}

interface SeedMedicalItemInput {
  id: string
  name: string
  category: string
  unit: string
  unitCost: number
  minStock: number
  batches: SeedBatchInput[]
}

const SEED_MEDICAL_ITEMS_INPUT: SeedMedicalItemInput[] = [
  {
    id: "med-syringe",
    name: "حقن معقمة",
    category: "مستلزمات الحقن",
    unit: "قطعة",
    unitCost: 0.15,
    minStock: 40,
    batches: [{ id: "B-SY-1", batchNumber: "SY-2601", quantity: 118, receivedDaysAgo: 60 }],
  },
  {
    id: "med-gloves",
    name: "قفازات فحص طبية",
    category: "مستلزمات الوقاية",
    unit: "زوج",
    unitCost: 0.08,
    minStock: 30,
    batches: [{ id: "B-GL-1", batchNumber: "GL-2588", quantity: 12, receivedDaysAgo: 40 }],
  },
  {
    id: "med-gauze",
    name: "شاش طبي معقم",
    category: "مستلزمات التضميد",
    unit: "لفة",
    unitCost: 0.5,
    minStock: 25,
    batches: [{ id: "B-GZ-1", batchNumber: "GZ-2572", quantity: 58, receivedDaysAgo: 50 }],
  },
  {
    id: "med-saline",
    name: "محلول ملحي",
    category: "محاليل وريدية",
    unit: "عبوة",
    unitCost: 1.2,
    minStock: 20,
    batches: [
      { id: "B-SL-1", batchNumber: "SL-2605", quantity: 18, receivedDaysAgo: 20, expirationDaysOffset: 150 },
    ],
  },
  {
    id: "med-masks",
    name: "كمامات طبية",
    category: "مستلزمات الوقاية",
    unit: "قطعة",
    unitCost: 0.1,
    minStock: 50,
    batches: [{ id: "B-MK-1", batchNumber: "MK-2579", quantity: 82, receivedDaysAgo: 45 }],
  },
  {
    id: "med-anesthesia",
    name: "مواد تخدير موضعي",
    category: "أدوية وتخدير",
    unit: "عبوة",
    unitCost: 3.5,
    minStock: 15,
    batches: [
      { id: "B-AN-1", batchNumber: "AN-2510", quantity: 6, receivedDaysAgo: 200, expirationDaysOffset: -20 },
      { id: "B-AN-2", batchNumber: "AN-2602", quantity: 9, receivedDaysAgo: 15, expirationDaysOffset: 180 },
    ],
  },
]

interface SeedProcedureInput {
  id: string
  invoiceId: string
  movementId: string
  appointmentId: string
  patientId: string
  doctorId: string
  departmentId: string
  serviceId: string
  materials: { itemId: string; quantity: number }[]
  paid: boolean
  dayOffset: number
  minutesAgo?: number
}

const SEED_PROCEDURES_INPUT: SeedProcedureInput[] = [
  {
    id: "PR-1001",
    invoiceId: "INV-1001",
    movementId: "MV-1001",
    appointmentId: "AP-1001",
    patientId: "PT-1001",
    doctorId: "d2",
    departmentId: "dermatology",
    serviceId: "svc-derm-1",
    materials: [{ itemId: "med-gloves", quantity: 1 }],
    paid: true,
    dayOffset: 0,
    minutesAgo: 90,
  },
  {
    id: "PR-1002",
    invoiceId: "INV-1002",
    movementId: "MV-1002",
    appointmentId: "AP-1002",
    patientId: "PT-1002",
    doctorId: "d1",
    departmentId: "dental",
    serviceId: "svc-dental-1",
    materials: [{ itemId: "med-gauze", quantity: 2 }],
    paid: false,
    dayOffset: 0,
    minutesAgo: 60,
  },
  {
    id: "PR-1016",
    invoiceId: "INV-1016",
    movementId: "MV-1016",
    appointmentId: "AP-1016",
    patientId: "PT-1004",
    doctorId: "d9",
    departmentId: "orthopedics",
    serviceId: "svc-ortho-1",
    materials: [{ itemId: "med-gauze", quantity: 1 }],
    paid: true,
    dayOffset: 0,
    minutesAgo: 75,
  },
  {
    id: "PR-1017",
    invoiceId: "INV-1017",
    movementId: "MV-1017",
    appointmentId: "AP-1017",
    patientId: "PT-1011",
    doctorId: "d10",
    departmentId: "pediatrics",
    serviceId: "svc-peds-1",
    materials: [{ itemId: "med-masks", quantity: 1 }],
    paid: false,
    dayOffset: 0,
    minutesAgo: 55,
  },
  {
    id: "PR-1018",
    invoiceId: "INV-1018",
    movementId: "MV-1018",
    appointmentId: "AP-1018",
    patientId: "PT-1012",
    doctorId: "d7",
    departmentId: "dermatology",
    serviceId: "svc-derm-1",
    materials: [{ itemId: "med-gloves", quantity: 1 }],
    paid: true,
    dayOffset: 0,
    minutesAgo: 45,
  },
  {
    id: "PR-1011",
    invoiceId: "INV-1011",
    movementId: "MV-1011",
    appointmentId: "AP-1011",
    patientId: "PT-1001",
    doctorId: "d2",
    departmentId: "dermatology",
    serviceId: "svc-derm-1",
    materials: [{ itemId: "med-masks", quantity: 1 }],
    paid: true,
    dayOffset: -14,
  },
  {
    id: "PR-1012",
    invoiceId: "INV-1012",
    movementId: "MV-1012",
    appointmentId: "AP-1012",
    patientId: "PT-1002",
    doctorId: "d1",
    departmentId: "dental",
    serviceId: "svc-dental-2",
    materials: [{ itemId: "med-syringe", quantity: 1 }],
    paid: true,
    dayOffset: -30,
  },
]

function minutesAgoToISO(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function daysAgoToISO(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60_000).toISOString()
}

/**
 * Builds realistic demo requests from whatever patients/appointments currently exist. Indexing into
 * the live arrays (rather than hardcoding patient/appointment ids) keeps this safe to reuse both for
 * a fresh seed and for backfilling internalRequests into older persisted data during migration, where
 * the exact seed ids may no longer match what the user has in storage.
 */
export function createSeedInternalRequests(patients: Patient[], appointments: Appointment[]): InternalRequest[] {
  const patientA = patients[2]?.id
  const appointmentA = appointments.find((a) => a.patientId === patientA)?.id
  const patientB = patients[0]?.id
  const patientC = patients[8]?.id

  const requests: InternalRequest[] = [
    {
      id: "REQ-1001",
      title: "تنسيق إعادة جدولة موعد",
      description: "الرجاء التواصل مع المريضة لإعادة جدولة الموعد إلى الأسبوع القادم بسبب تعارض في جدول الطبيبة.",
      category: "appointment-coordination",
      priority: "important",
      status: "in-progress",
      createdByStaffId: "staff-d3",
      assignedToStaffId: RECEPTION_STAFF_ID,
      patientId: patientA,
      appointmentId: appointmentA,
      messages: [
        {
          id: "MSG-1001",
          staffId: RECEPTION_STAFF_ID,
          text: "تم استلام الطلب، وسيتم التواصل مع المريضة اليوم لتحديد موعد بديل.",
          timestamp: minutesAgoToISO(180),
        },
      ],
      activity: [
        { id: "RACT-1001", message: "تم إنشاء الطلب بواسطة د. لينا حداد وإسناده إلى سارة عودة", timestamp: minutesAgoToISO(240) },
        { id: "RACT-1002", message: 'تم تغيير الحالة إلى "قيد التنفيذ" بواسطة سارة عودة', timestamp: minutesAgoToISO(182) },
      ],
      seenByStaffIds: ["staff-d3", RECEPTION_STAFF_ID],
      createdAt: minutesAgoToISO(240),
      updatedAt: minutesAgoToISO(180),
    },
    {
      id: "REQ-1002",
      title: "تجهيز مستلزمات حقن إضافية",
      description: "الكمية المتبقية من الحقن المعقمة منخفضة نسبياً، الرجاء التأكد من تجهيز كمية إضافية قبل نهاية الأسبوع.",
      category: "supplies",
      priority: "important",
      status: "new",
      createdByStaffId: "staff-d1",
      assignedToStaffId: RECEPTION_STAFF_ID,
      messages: [],
      activity: [
        { id: "RACT-1003", message: "تم إنشاء الطلب بواسطة د. أحمد الخطيب وإسناده إلى سارة عودة", timestamp: minutesAgoToISO(90) },
      ],
      seenByStaffIds: ["staff-d1"],
      createdAt: minutesAgoToISO(90),
      updatedAt: minutesAgoToISO(90),
    },
    {
      id: "REQ-1003",
      title: "متابعة حالة المريضة بعد الإجراء",
      description: "الرجاء الاتصال بالمريضة للاطمئنان على حالتها بعد الإجراء والاستفسار عن وجود أي أعراض جانبية.",
      category: "patient-followup",
      priority: "normal",
      status: "completed",
      createdByStaffId: "staff-d2",
      assignedToStaffId: RECEPTION_STAFF_ID,
      patientId: patientB,
      messages: [
        {
          id: "MSG-1002",
          staffId: RECEPTION_STAFF_ID,
          text: "تم الاتصال بالمريضة، حالتها جيدة ولا توجد أعراض تستدعي القلق.",
          timestamp: minutesAgoToISO(1200),
        },
      ],
      activity: [
        { id: "RACT-1004", message: "تم إنشاء الطلب بواسطة د. سارة العبدالله وإسناده إلى سارة عودة", timestamp: minutesAgoToISO(1400) },
        { id: "RACT-1005", message: 'تم تغيير الحالة إلى "مكتمل" بواسطة سارة عودة', timestamp: minutesAgoToISO(1195) },
      ],
      seenByStaffIds: ["staff-d2", RECEPTION_STAFF_ID],
      createdAt: minutesAgoToISO(1400),
      updatedAt: minutesAgoToISO(1195),
    },
    {
      id: "REQ-1004",
      title: "طلب إجازة يوم الخميس القادم",
      description: "أرجو الموافقة على إجازة يوم واحد يوم الخميس القادم لظرف عائلي طارئ.",
      category: "administrative",
      priority: "normal",
      status: "new",
      createdByStaffId: "staff-d5",
      assignedToStaffId: MANAGER_STAFF_ID,
      messages: [],
      activity: [
        { id: "RACT-1006", message: "تم إنشاء الطلب بواسطة د. ريم النمر وإسناده إلى عبدالله السالم", timestamp: minutesAgoToISO(600) },
      ],
      seenByStaffIds: ["staff-d5"],
      createdAt: minutesAgoToISO(600),
      updatedAt: minutesAgoToISO(600),
    },
    {
      id: "REQ-1005",
      title: "تأكيد حضور مريض لجلسة علاج طبيعي",
      description: "الرجاء تأكيد حضور المريض لجلسة العلاج الطبيعي المجدولة غداً.",
      category: "appointment-coordination",
      priority: "normal",
      status: "cancelled",
      createdByStaffId: RECEPTION_STAFF_ID,
      assignedToStaffId: "staff-d4",
      patientId: patientC,
      messages: [
        {
          id: "MSG-1003",
          staffId: RECEPTION_STAFF_ID,
          text: "تم إلغاء الطلب، المريض أجّل الجلسة من تلقاء نفسه.",
          timestamp: minutesAgoToISO(2800),
        },
      ],
      activity: [
        { id: "RACT-1007", message: "تم إنشاء الطلب بواسطة سارة عودة وإسناده إلى د. عمر الزعبي", timestamp: minutesAgoToISO(2900) },
        { id: "RACT-1008", message: 'تم تغيير الحالة إلى "ملغي" بواسطة سارة عودة', timestamp: minutesAgoToISO(2800) },
      ],
      seenByStaffIds: [RECEPTION_STAFF_ID, "staff-d4"],
      createdAt: minutesAgoToISO(2900),
      updatedAt: minutesAgoToISO(2800),
    },
    {
      id: "REQ-1006",
      title: "تجهيز غرفة الفحص الثانية لعيادة الجلدية",
      description: "الرجاء التأكد من تجهيز غرفة الفحص الثانية بالمستلزمات اللازمة قبل بدء الدوام.",
      category: "supplies",
      priority: "normal",
      status: "completed",
      createdByStaffId: MANAGER_STAFF_ID,
      assignedToStaffId: RECEPTION_STAFF_ID,
      messages: [
        { id: "MSG-1004", staffId: RECEPTION_STAFF_ID, text: "تم التجهيز الساعة 9 صباحاً.", timestamp: minutesAgoToISO(4300) },
      ],
      activity: [
        { id: "RACT-1009", message: "تم إنشاء الطلب بواسطة عبدالله السالم وإسناده إلى سارة عودة", timestamp: minutesAgoToISO(4400) },
        { id: "RACT-1010", message: 'تم تغيير الحالة إلى "مكتمل" بواسطة سارة عودة', timestamp: minutesAgoToISO(4295) },
      ],
      seenByStaffIds: [MANAGER_STAFF_ID, RECEPTION_STAFF_ID],
      createdAt: minutesAgoToISO(4400),
      updatedAt: minutesAgoToISO(4295),
    },
  ]

  return requests
}

export interface SeedData {
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

export function createSeedData(): SeedData {
  const today = todayISO()

  const patients: Patient[] = SEED_PATIENTS_INPUT.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    createdAt: daysAgoToISO(p.registeredDaysAgo),
  }))

  const appointments: Appointment[] = SEED_APPOINTMENTS_INPUT.map((a) => ({
    id: a.id,
    patientId: a.patientId,
    doctorId: a.doctorId,
    date: addDays(today, a.dayOffset),
    time: a.time,
    durationMinutes: a.durationMinutes,
    reason: a.reason,
    status: a.status,
    source: "reception" as const,
    createdAt: minutesAgoToISO(a.createdMinutesAgo),
  }))

  const activities: ActivityItem[] = SEED_ACTIVITIES_INPUT.map((a, i) => ({
    id: `ACT-${1001 + i}`,
    type: a.type,
    message: a.message,
    timestamp: minutesAgoToISO(a.minutesAgo),
  }))

  const medicalItems: MedicalItem[] = SEED_MEDICAL_ITEMS_INPUT.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit,
    unitCost: item.unitCost,
    minStock: item.minStock,
    batches: item.batches.map((b) => ({
      id: b.id,
      batchNumber: b.batchNumber,
      quantity: b.quantity,
      receivedDate: addDays(today, -b.receivedDaysAgo),
      expirationDate: b.expirationDaysOffset !== undefined ? addDays(today, b.expirationDaysOffset) : undefined,
    })),
  }))

  const itemCost = (itemId: string) => medicalItems.find((i) => i.id === itemId)?.unitCost ?? 0

  const procedures: MedicalProcedure[] = []
  const invoices: Invoice[] = []
  const inventoryMovements: InventoryMovement[] = []

  for (const p of SEED_PROCEDURES_INPUT) {
    const service = serviceById(p.serviceId)
    if (!service) continue

    const materialsCost = p.materials.reduce((sum, m) => sum + itemCost(m.itemId) * m.quantity, 0)
    const timestamp = p.minutesAgo !== undefined ? minutesAgoToISO(p.minutesAgo) : daysAgoToISO(-p.dayOffset)

    procedures.push({
      id: p.id,
      appointmentId: p.appointmentId,
      patientId: p.patientId,
      doctorId: p.doctorId,
      departmentId: p.departmentId,
      serviceId: p.serviceId,
      materials: p.materials,
      materialsCost: Math.round(materialsCost * 100) / 100,
      billedAmount: service.price,
      createdAt: timestamp,
    })

    invoices.push({
      id: p.invoiceId,
      invoiceNumber: p.invoiceId,
      patientId: p.patientId,
      appointmentId: p.appointmentId,
      doctorId: p.doctorId,
      departmentId: p.departmentId,
      procedureId: p.id,
      serviceName: service.name,
      amount: service.price,
      status: p.paid ? "paid" : "unpaid",
      issuedAt: timestamp,
      paidAt: p.paid ? timestamp : undefined,
    })

    p.materials.forEach((m, index) => {
      inventoryMovements.push({
        id: index === 0 ? p.movementId : `${p.movementId}-${index}`,
        itemId: m.itemId,
        quantityChange: -m.quantity,
        type: "consumption",
        procedureId: p.id,
        appointmentId: p.appointmentId,
        timestamp,
      })
    })
  }

  const internalRequests = createSeedInternalRequests(patients, appointments)

  return {
    patients,
    appointments,
    activities,
    medicalItems,
    inventoryMovements,
    procedures,
    invoices,
    internalRequests,
    currentStaffId: DEFAULT_STAFF_ID,
  }
}
