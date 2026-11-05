import { departments } from "@/config/departments"
import type { DepartmentStats, DoctorRecord, RevenuePoint } from "@/types"

export const doctors: DoctorRecord[] = [
  { id: "d1", name: "د. أحمد الخطيب", departmentId: "dental", initials: "أخ" },
  { id: "d6", name: "د. محمد السعدي", departmentId: "dental", initials: "مس" },
  { id: "d2", name: "د. سارة العبدالله", departmentId: "dermatology", initials: "سع" },
  { id: "d7", name: "د. رنا قاسم", departmentId: "dermatology", initials: "رق" },
  { id: "d3", name: "د. لينا حداد", departmentId: "obgyn", initials: "له" },
  { id: "d8", name: "د. ديما شاهين", departmentId: "obgyn", initials: "دش" },
  { id: "d4", name: "د. عمر الزعبي", departmentId: "orthopedics", initials: "عز" },
  { id: "d9", name: "د. باسل الحوراني", departmentId: "orthopedics", initials: "بح" },
  { id: "d5", name: "د. ريم النمر", departmentId: "pediatrics", initials: "رن" },
  { id: "d10", name: "د. وائل المجالي", departmentId: "pediatrics", initials: "وم" },
]

export const weeklyRevenue: RevenuePoint[] = [
  { label: "السبت", amount: 1280 },
  { label: "الأحد", amount: 1450 },
  { label: "الإثنين", amount: 1120 },
  { label: "الثلاثاء", amount: 1690 },
  { label: "الأربعاء", amount: 1540 },
  { label: "الخميس", amount: 1830 },
  { label: "اليوم", amount: 1690 },
]

export const departmentStats: DepartmentStats[] = [
  { departmentId: "dental", appointments: 18, revenue: 2140, performance: 86 },
  { departmentId: "dermatology", appointments: 14, revenue: 1860, performance: 78 },
  { departmentId: "obgyn", appointments: 11, revenue: 1520, performance: 72 },
  { departmentId: "orthopedics", appointments: 9, revenue: 1310, performance: 64 },
  { departmentId: "pediatrics", appointments: 16, revenue: 1080, performance: 81 },
]

export const departmentNameById = (id: string) =>
  departments.find((d) => d.id === id)?.name ?? id

export const doctorNameById = (id: string) =>
  doctors.find((d) => d.id === id)?.name ?? id

export const doctorsByDepartment = (departmentId: string) =>
  doctors.filter((d) => d.departmentId === departmentId)

export const doctorById = (id: string) => doctors.find((d) => d.id === id)
