import { Eye, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useClinicData } from "@/data/ClinicDataContext"
import { getLastVisitInfo } from "@/lib/clinic-selectors"
import { formatArabicDateShort, todayISO } from "@/lib/date"
import { formatPhoneDisplay } from "@/lib/phone"
import type { Patient } from "@/types"

const PAGE_SIZE = 8

interface PatientsTableProps {
  patients: Patient[]
  onView: (patientId: string) => void
}

export function PatientsTable({ patients, onView }: PatientsTableProps) {
  const { appointmentViews } = useClinicData()
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const today = todayISO()

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return patients
    return patients.filter(
      (p) => p.name.includes(q) || p.phone.includes(q) || p.id.toLowerCase().includes(q.toLowerCase())
    )
  }, [patients, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleQueryChange(value: string) {
    setQuery(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="ابحث بالاسم أو المعرف أو رقم الهاتف"
          className="ps-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-14 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المريض</TableHead>
                  <TableHead>المعرف</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>آخر زيارة / موعد</TableHead>
                  <TableHead className="text-end">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((patient) => {
                  const lastVisit = getLastVisitInfo(patient.id, appointmentViews, today)
                  return (
                    <TableRow key={patient.id} className="cursor-pointer" onClick={() => onView(patient.id)}>
                      <TableCell className="font-medium text-foreground">{patient.name}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.id}</TableCell>
                      <TableCell className="text-muted-foreground" dir="ltr">
                        <span className="block text-right">{formatPhoneDisplay(patient.phone)}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lastVisit
                          ? `${formatArabicDateShort(lastVisit.date)}${lastVisit.isUpcoming ? " (قادم)" : ""}`
                          : "لا يوجد"}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onView(patient.id)
                          }}
                        >
                          <Eye />
                          عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                عرض {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} من{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>
                  السابق
                </Button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
