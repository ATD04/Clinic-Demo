import { useMemo, useRef, useState } from "react"
import { PatientCombobox } from "@/components/appointments/PatientCombobox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { requestCategories, requestPriorities } from "@/config/requests"
import { staffMembers } from "@/config/staff"
import { useClinicData } from "@/data/ClinicDataContext"
import { doctorById } from "@/data/mockData"
import { useToast } from "@/hooks/use-toast"
import { formatArabicDateShort } from "@/lib/date"
import type { RequestCategory, RequestPriority } from "@/types"

interface CreateRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStaffId: string
  onCreated?: (requestId: string) => void
}

export function CreateRequestDialog({ open, onOpenChange, currentStaffId, onCreated }: CreateRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <CreateRequestBody onOpenChange={onOpenChange} currentStaffId={currentStaffId} onCreated={onCreated} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CreateRequestBody({
  onOpenChange,
  currentStaffId,
  onCreated,
}: {
  onOpenChange: (open: boolean) => void
  currentStaffId: string
  onCreated?: (requestId: string) => void
}) {
  const { patients, appointments, createRequest } = useClinicData()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [assignedToStaffId, setAssignedToStaffId] = useState("")
  const [category, setCategory] = useState<RequestCategory>(requestCategories[0].id)
  const [priority, setPriority] = useState<RequestPriority>("normal")
  const [patientId, setPatientId] = useState<string | null>(null)
  const [appointmentId, setAppointmentId] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const assignableStaff = useMemo(() => staffMembers.filter((s) => s.id !== currentStaffId), [currentStaffId])

  const compatibleAppointments = useMemo(
    () => (patientId ? appointments.filter((a) => a.patientId === patientId) : []),
    [appointments, patientId]
  )

  function handlePatientChange(id: string) {
    setPatientId(id)
    setAppointmentId("")
  }

  function handleSubmit() {
    if (submittingRef.current) return

    if (!title.trim()) return setError("الرجاء إدخال عنوان الطلب")
    if (!assignedToStaffId) return setError("الرجاء اختيار الموظف أو القسم المسؤول")
    if (!description.trim()) return setError("الرجاء إدخال وصف الطلب")

    submittingRef.current = true
    setIsSubmitting(true)
    setError(null)

    const result = createRequest({
      title,
      description,
      category,
      priority,
      assignedToStaffId,
      createdByStaffId: currentStaffId,
      patientId: patientId ?? undefined,
      appointmentId: appointmentId || undefined,
    })

    if (!result.ok) {
      setError(result.error)
      setIsSubmitting(false)
      submittingRef.current = false
      return
    }

    toast({ title: "تم إرسال الطلب بنجاح", description: `${result.request.title} — ${result.request.id}` })
    onOpenChange(false)
    onCreated?.(result.request.id)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>طلب جديد</DialogTitle>
        <DialogDescription>أرسل طلباً أو مهمة إلى زميل أو قسم آخر في العيادة.</DialogDescription>
      </DialogHeader>

      <div className="grid max-h-[65vh] gap-4 overflow-y-auto pe-1">
        <div className="space-y-1.5">
          <Label htmlFor="request-title">عنوان الطلب *</Label>
          <Input
            id="request-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: حجز موعد متابعة للمريض"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>إسناد إلى *</Label>
            <Select value={assignedToStaffId} onValueChange={setAssignedToStaffId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الموظف أو القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>الأطباء</SelectLabel>
                  {assignableStaff
                    .filter((s) => s.role === "doctor")
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>الإدارة والاستقبال</SelectLabel>
                  {assignableStaff
                    .filter((s) => s.role !== "doctor")
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>التصنيف</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as RequestCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {requestCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>المريض (اختياري)</Label>
            <PatientCombobox patients={patients} value={patientId} onChange={handlePatientChange} />
          </div>
          <div className="space-y-1.5">
            <Label>الموعد المرتبط (اختياري)</Label>
            <Select value={appointmentId} onValueChange={setAppointmentId} disabled={!patientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={!patientId ? "اختر مريضاً أولاً" : "بدون موعد"} />
              </SelectTrigger>
              <SelectContent>
                {compatibleAppointments.length === 0 ? (
                  <p className="px-2 py-3 text-center text-xs text-muted-foreground">لا توجد مواعيد لهذا المريض</p>
                ) : (
                  compatibleAppointments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {formatArabicDateShort(a.date)} · {a.time} · {doctorById(a.doctorId)?.name ?? ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>الأولوية</Label>
          <div className="flex gap-2">
            {requestPriorities.map((p) => (
              <Button
                key={p.id}
                type="button"
                size="sm"
                variant={priority === p.id ? "default" : "outline"}
                onClick={() => setPriority(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="request-description">الوصف *</Label>
          <Textarea
            id="request-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="تفاصيل الطلب أو المهمة المطلوبة"
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          إلغاء
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          إرسال الطلب
        </Button>
      </DialogFooter>
    </>
  )
}
