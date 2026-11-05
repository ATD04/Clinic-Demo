import { CheckCircle2, Clock, Inbox, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { CreateRequestDialog } from "@/components/communication/CreateRequestDialog"
import { RequestDetailsDialog } from "@/components/communication/RequestDetailsDialog"
import { RequestFilters, type RequestFilterKey } from "@/components/communication/RequestFilters"
import { RequestListItem } from "@/components/communication/RequestListItem"
import { StaffIdentitySwitcher } from "@/components/communication/StaffIdentitySwitcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useClinicData } from "@/data/ClinicDataContext"

export function CommunicationPage() {
  const { internalRequestViews, currentStaffId } = useClinicData()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<RequestFilterKey>("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(() => searchParams.get("request"))

  const summary = useMemo(
    () => ({
      new: internalRequestViews.filter((r) => r.status === "new").length,
      inProgress: internalRequestViews.filter((r) => r.status === "in-progress").length,
      completed: internalRequestViews.filter((r) => r.status === "completed").length,
    }),
    [internalRequestViews]
  )

  const filtered = useMemo(() => {
    const q = search.trim()
    return internalRequestViews
      .filter((r) => {
        if (filter === "mine") return r.createdByStaffId === currentStaffId
        if (filter === "assigned") return r.assignedToStaffId === currentStaffId
        if (filter === "completed") return r.status === "completed"
        return true
      })
      .filter((r) => {
        if (!q) return true
        return (
          r.title.includes(q) ||
          r.createdByName.includes(q) ||
          r.assignedToName.includes(q) ||
          (r.patientName?.includes(q) ?? false)
        )
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [internalRequestViews, filter, search, currentStaffId])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">التواصل الداخلي</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تنسيق المهام والطلبات بين فريق العيادة ومتابعتها حتى الإنجاز
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StaffIdentitySwitcher />
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            طلب جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="طلبات جديدة" value={summary.new.toLocaleString("en-US")} icon={Inbox} />
        <KpiCard label="قيد التنفيذ" value={summary.inProgress.toLocaleString("en-US")} icon={Clock} />
        <KpiCard label="مكتملة" value={summary.completed.toLocaleString("en-US")} icon={CheckCircle2} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <RequestFilters search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} />

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">لا توجد طلبات مطابقة</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((r) => (
                <li key={r.id}>
                  <RequestListItem
                    request={r}
                    isUnread={r.assignedToStaffId === currentStaffId && !r.seenByStaffIds.includes(currentStaffId)}
                    onClick={() => setViewingRequestId(r.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CreateRequestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        currentStaffId={currentStaffId}
        onCreated={(id) => setViewingRequestId(id)}
      />

      <RequestDetailsDialog
        requestId={viewingRequestId}
        currentStaffId={currentStaffId}
        open={viewingRequestId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingRequestId(null)
        }}
      />
    </div>
  )
}
