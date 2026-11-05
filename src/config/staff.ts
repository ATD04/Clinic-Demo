import { doctors } from "@/data/mockData"
import type { StaffMember, StaffRole } from "@/types"

export const RECEPTION_STAFF_ID = "staff-reception-1"
export const MANAGER_STAFF_ID = "staff-manager-1"
export const DEFAULT_STAFF_ID = "staff-d1"

export const staffMembers: StaffMember[] = [
  ...doctors.map((d) => ({ id: `staff-${d.id}`, name: d.name, role: "doctor" as const, departmentId: d.departmentId })),
  { id: RECEPTION_STAFF_ID, name: "سارة عودة", role: "receptionist" },
  { id: MANAGER_STAFF_ID, name: "عبدالله السالم", role: "manager" },
]

export const staffById = (id: string) => staffMembers.find((s) => s.id === id)

export const staffNameById = (id: string) => staffById(id)?.name ?? "—"

export const roleLabels: Record<StaffRole, string> = {
  doctor: "طبيب",
  receptionist: "موظف استقبال",
  manager: "مدير العيادة",
}
