import { useRef, useState } from "react"
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useClinicData } from "@/data/ClinicDataContext"
import { useToast } from "@/hooks/use-toast"
import { todayISO } from "@/lib/date"
import { isValidJordanPhone } from "@/lib/phone"
import type { Gender, Patient } from "@/types"

interface PatientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPatient?: Patient
  onSaved?: (patient: Patient) => void
}

const emptyForm = {
  name: "",
  phone: "",
  dateOfBirth: "",
  gender: "" as Gender | "",
  notes: "",
}

export function PatientFormDialog({
  open,
  onOpenChange,
  editingPatient,
  onSaved,
}: PatientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <PatientFormBody
            editingPatient={editingPatient}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PatientFormBody({
  editingPatient,
  onOpenChange,
  onSaved,
}: {
  editingPatient?: Patient
  onOpenChange: (open: boolean) => void
  onSaved?: (patient: Patient) => void
}) {
  const { addPatient, updatePatient } = useClinicData()
  const { toast } = useToast()
  const isEditing = Boolean(editingPatient)

  const [form, setForm] = useState(() =>
    editingPatient
      ? {
          name: editingPatient.name,
          phone: editingPatient.phone,
          dateOfBirth: editingPatient.dateOfBirth ?? "",
          gender: editingPatient.gender ?? ("" as Gender | ""),
          notes: editingPatient.notes ?? "",
        }
      : emptyForm
  )
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  function handleSubmit() {
    if (submittingRef.current) return

    const nextErrors: { name?: string; phone?: string } = {}
    if (!form.name.trim()) nextErrors.name = "الاسم مطلوب"
    if (!form.phone.trim()) {
      nextErrors.phone = "رقم الهاتف مطلوب"
    } else if (!isValidJordanPhone(form.phone)) {
      nextErrors.phone = "رقم هاتف غير صالح، مثال: 0791234567"
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setSubmitError(null)

    const input = {
      name: form.name,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
      notes: form.notes || undefined,
    }

    const result = isEditing ? updatePatient(editingPatient!.id, input) : addPatient(input)

    if (!result.ok) {
      setSubmitError(result.error)
      setIsSubmitting(false)
      submittingRef.current = false
      return
    }

    toast({
      title: isEditing ? "تم تحديث بيانات المريض" : "تم تسجيل المريض بنجاح",
      description: `${result.patient.name} — ${result.patient.id}`,
    })
    onOpenChange(false)
    onSaved?.(result.patient)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "تعديل بيانات المريض" : "إضافة مريض جديد"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "قم بتحديث البيانات ثم احفظ التغييرات." : "أدخل بيانات المريض لتسجيله في النظام."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="patient-name">الاسم الكامل *</Label>
          <Input
            id="patient-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="مثال: محمد أحمد العلي"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="patient-phone">رقم الهاتف *</Label>
          <Input
            id="patient-phone"
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="07XXXXXXXX"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="patient-dob">تاريخ الميلاد</Label>
            <Input
              id="patient-dob"
              type="date"
              dir="ltr"
              max={todayISO()}
              value={form.dateOfBirth}
              onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>الجنس</Label>
            <Select
              value={form.gender}
              onValueChange={(v) => setForm((f) => ({ ...f, gender: v as Gender }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الجنس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ذكر</SelectItem>
                <SelectItem value="female">أنثى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="patient-notes">ملاحظات (اختياري)</Label>
          <Textarea
            id="patient-notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="أي معلومات إضافية عن المريض"
            rows={2}
          />
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          إلغاء
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isEditing ? "حفظ التغييرات" : "إضافة المريض"}
        </Button>
      </DialogFooter>
    </>
  )
}
