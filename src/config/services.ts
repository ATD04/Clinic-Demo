// Demonstration service prices — the real price list will be confirmed with the client later.
export interface ServiceCatalogItem {
  id: string
  departmentId: string
  name: string
  price: number
}

export const serviceCatalog: ServiceCatalogItem[] = [
  { id: "svc-dental-1", departmentId: "dental", name: "تنظيف أسنان", price: 25 },
  { id: "svc-dental-2", departmentId: "dental", name: "حشوة أسنان", price: 40 },
  { id: "svc-dental-3", departmentId: "dental", name: "خلع سن", price: 35 },
  { id: "svc-derm-1", departmentId: "dermatology", name: "كشف جلدية", price: 20 },
  { id: "svc-derm-2", departmentId: "dermatology", name: "إزالة شامة", price: 30 },
  { id: "svc-obgyn-1", departmentId: "obgyn", name: "فحص نسائية", price: 25 },
  { id: "svc-obgyn-2", departmentId: "obgyn", name: "متابعة حمل", price: 30 },
  { id: "svc-ortho-1", departmentId: "orthopedics", name: "جبيرة عظام", price: 35 },
  { id: "svc-ortho-2", departmentId: "orthopedics", name: "حقنة مفصل", price: 45 },
  { id: "svc-peds-1", departmentId: "pediatrics", name: "كشف أطفال", price: 15 },
  { id: "svc-peds-2", departmentId: "pediatrics", name: "تطعيم", price: 20 },
]

export const servicesByDepartment = (departmentId: string) =>
  serviceCatalog.filter((s) => s.departmentId === departmentId)

export const serviceById = (id: string) => serviceCatalog.find((s) => s.id === id)
