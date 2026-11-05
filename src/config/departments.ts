// Department names are not final — update this list once the client confirms branding.
export interface DepartmentConfig {
  id: string
  name: string
  defaultDurationMinutes: number
}

export const departments: DepartmentConfig[] = [
  { id: "dental", name: "طب الأسنان", defaultDurationMinutes: 30 },
  { id: "dermatology", name: "الجلدية والتجميل", defaultDurationMinutes: 20 },
  { id: "obgyn", name: "النسائية والتوليد", defaultDurationMinutes: 30 },
  { id: "orthopedics", name: "العظام والمفاصل", defaultDurationMinutes: 30 },
  { id: "pediatrics", name: "طب الأطفال", defaultDurationMinutes: 20 },
]

export const getDepartmentDuration = (departmentId: string) =>
  departments.find((d) => d.id === departmentId)?.defaultDurationMinutes ?? 30
