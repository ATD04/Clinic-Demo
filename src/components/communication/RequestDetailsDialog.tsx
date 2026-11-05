import { Send } from "lucide-react"
import { useEffect, useState } from "react"
import { RequestPriorityBadge } from "./RequestPriorityBadge"
import { RequestStatusBadge } from "./RequestStatusBadge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { requestCategoryLabel } from "@/config/requests"
import { staffById } from "@/config/staff"
import { useClinicData } from "@/data/ClinicDataContext"
import { useToast } from "@/hooks/use-toast"
import { formatArabicDateShort, formatRelativeArabic, toClinicDateISO } from "@/lib/date"
import { requestStatusConfig, requestStatuses } from "@/lib/request-status"
import type { RequestStatus } from "@/types"

interface RequestDetailsDialogProps {
  requestId: string | null
  currentStaffId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestDetailsDialog({ requestId, currentStaffId, open, onOpenChange }: RequestDetailsDialogProps) {
  const { internalRequestViews, appointmentViews, addRequestMessage, updateRequestStatus, markRequestSeen } =
    useClinicData()
  const { toast } = useToast()
  const [reply, setReply] = useState("")

  useEffect(() => {
    if (open && requestId) {
      markRequestSeen(requestId, currentStaffId)
    }
  }, [open, requestId, currentStaffId, markRequestSeen])

  const request = internalRequestViews.find((r) => r.id === requestId)
  if (!request) return null

  const appointment = request.appointmentId
    ? appointmentViews.find((a) => a.id === request.appointmentId)
    : undefined

  const actorRole = staffById(currentStaffId)?.role
  const isOpenRequest = request.status !== "completed" && request.status !== "cancelled"
  const canAct =
    currentStaffId === request.assignedToStaffId ||
    currentStaffId === request.createdByStaffId ||
    actorRole === "manager"
  const canChangeStatus = currentStaffId === request.assignedToStaffId || actorRole === "manager"
  const canCancelOwn = currentStaffId === request.createdByStaffId && request.status === "new"

  function handleReply() {
    const text = reply.trim()
    if (!text || !request) return
    const result = addRequestMessage(request.id, currentStaffId, text)
    if (!result.ok) {
      toast({ title: "تعذر إرسال الرد", description: result.error, variant: "destructive" })
      return
    }
    setReply("")
  }

  function handleStatusChange(status: RequestStatus) {
    if (!request) return
    const result = updateRequestStatus(request.id, status, currentStaffId)
    if (!result.ok) {
      toast({ title: "تعذر تحديث الحالة", description: result.error, variant: "destructive" })
      return
    }
    toast({ title: "تم تحديث حالة الطلب", description: requestStatusConfig[status].label })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{request.title}</DialogTitle>
          <DialogDescription>
            {requestCategoryLabel(request.category)} · {formatArabicDateShort(toClinicDateISO(request.createdAt))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">من</span>
            <span className="font-medium text-foreground">{request.createdByName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">إلى</span>
            <span className="font-medium text-foreground">{request.assignedToName}</span>
          </div>
          {request.patientName && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">المريض</span>
              <span className="font-medium text-foreground">{request.patientName}</span>
            </div>
          )}
          {appointment && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الموعد المرتبط</span>
              <span className="font-medium text-foreground">
                {formatArabicDateShort(appointment.date)} · <span dir="ltr">{appointment.time}</span> ·{" "}
                {appointment.doctorName}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">الحالة</span>
            <div className="flex items-center gap-1.5">
              <RequestPriorityBadge priority={request.priority} />
              <RequestStatusBadge status={request.status} />
            </div>
          </div>
        </div>

        <p className="text-sm text-foreground">{request.description}</p>

        {isOpenRequest && (canChangeStatus || canCancelOwn) && (
          <div className="flex flex-wrap gap-1.5">
            {canChangeStatus &&
              requestStatuses
                .filter((s) => s !== "cancelled" && s !== request.status)
                .map((s) => (
                  <Button key={s} type="button" size="sm" variant="secondary" onClick={() => handleStatusChange(s)}>
                    {requestStatusConfig[s].label}
                  </Button>
                ))}
            {canCancelOwn && (
              <Button type="button" size="sm" variant="destructive" onClick={() => handleStatusChange("cancelled")}>
                إلغاء الطلب
              </Button>
            )}
          </div>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-sm font-semibold text-foreground">سجل الطلب</p>
          <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-muted-foreground">
            {request.activity.map((a) => (
              <li key={a.id}>
                {a.message} — {formatRelativeArabic(a.timestamp)}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-sm font-semibold text-foreground">المحادثة</p>
          {request.messages.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">لا توجد ردود بعد</p>
          ) : (
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {request.messages.map((m) => {
                const sender = staffById(m.staffId)
                return (
                  <li key={m.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{sender?.name ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeArabic(m.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-foreground">{m.text}</p>
                  </li>
                )
              })}
            </ul>
          )}

          {canAct && (
            <div className="flex items-end gap-2 pt-1">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="اكتب رداً..."
                rows={2}
                className="flex-1"
              />
              <Button type="button" size="icon" onClick={handleReply} aria-label="إرسال الرد">
                <Send />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
