export type AppointmentStatus = "scheduled" | "arrived" | "in-progress" | "completed" | "cancelled"

export type BookingSource = "reception" | "portal"

export type Gender = "male" | "female"

export interface Patient {
  id: string
  name: string
  phone: string
  dateOfBirth?: string
  gender?: Gender
  notes?: string
  createdAt: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  durationMinutes: number
  reason: string
  notes?: string
  status: AppointmentStatus
  source: BookingSource
  createdAt: string
}

export interface AppointmentView extends Appointment {
  patientName: string
  doctorName: string
  departmentId: string
}

export interface DoctorRecord {
  id: string
  name: string
  departmentId: string
  initials: string
}

export interface RevenuePoint {
  label: string
  amount: number
}

export interface DepartmentStats {
  departmentId: string
  appointments: number
  revenue: number
  performance: number
}

export type ActivityType = "appointment" | "registration" | "procedure" | "inventory" | "payment"

export interface ActivityItem {
  id: string
  type: ActivityType
  message: string
  timestamp: string
}

export interface InventoryBatch {
  id: string
  batchNumber: string
  quantity: number
  receivedDate: string
  expirationDate?: string
}

export interface MedicalItem {
  id: string
  name: string
  category: string
  unit: string
  unitCost: number
  minStock: number
  batches: InventoryBatch[]
}

export type InventoryMovementType = "consumption"

export interface InventoryMovement {
  id: string
  itemId: string
  quantityChange: number
  type: InventoryMovementType
  procedureId?: string
  appointmentId?: string
  timestamp: string
}

export interface ProcedureMaterialUsage {
  itemId: string
  quantity: number
}

export interface MedicalProcedure {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  departmentId: string
  serviceId: string
  materials: ProcedureMaterialUsage[]
  notes?: string
  materialsCost: number
  billedAmount: number
  createdAt: string
}

export type PaymentStatus = "unpaid" | "paid"

export interface Invoice {
  id: string
  invoiceNumber: string
  patientId: string
  appointmentId: string
  doctorId: string
  departmentId: string
  procedureId: string
  serviceName: string
  amount: number
  status: PaymentStatus
  issuedAt: string
  paidAt?: string
}

export interface InvoiceView extends Invoice {
  patientName: string
  doctorName: string
}

export type StaffRole = "doctor" | "receptionist" | "manager"

export interface StaffMember {
  id: string
  name: string
  role: StaffRole
  departmentId?: string
}

export type RequestStatus = "new" | "in-progress" | "completed" | "cancelled"

export type RequestPriority = "normal" | "important"

export type RequestCategory =
  | "patient-followup"
  | "appointment-coordination"
  | "supplies"
  | "administrative"

export interface RequestMessage {
  id: string
  staffId: string
  text: string
  timestamp: string
}

export interface RequestActivity {
  id: string
  message: string
  timestamp: string
}

export interface InternalRequest {
  id: string
  title: string
  description: string
  category: RequestCategory
  priority: RequestPriority
  status: RequestStatus
  createdByStaffId: string
  assignedToStaffId: string
  patientId?: string
  appointmentId?: string
  messages: RequestMessage[]
  activity: RequestActivity[]
  seenByStaffIds: string[]
  createdAt: string
  updatedAt: string
}

export interface InternalRequestView extends InternalRequest {
  createdByName: string
  assignedToName: string
  patientName?: string
}
