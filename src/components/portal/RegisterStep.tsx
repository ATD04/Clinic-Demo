import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClinicData } from "@/data/ClinicDataContext"
import { useToast } from "@/hooks/use-toast"
import { todayISO } from "@/lib/date"
import { isValidJordanPhone } from "@/lib/phone"
import { cn } from "@/lib/utils"
import type { Gender } from "@/types"
import { StepCard } from "./StepCard"

// A small, clearly-labeled subset of demo patients — the public portal must not expose the full list.
const DEMO_PATIENT_IDS = ["PT-1001", "PT-1003", "PT-1009"]

interface RegisterStepProps {
  onNext: (patientId: string) => void
}

export function RegisterStep({ onNext }: RegisterStepProps) {
  const { patients, addPatient } = useClinicData()
  const { toast } = useToast()
  const [mode, setMode] = useState<"new" | "demo">("new")
  const [form, setForm] = useState({ name: "", phone: "", dateOfBirth: "", gender: "" as Gender | "" })
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const demoPatients = patients.filter((p) => DEMO_PATIENT_IDS.includes(p.id))

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

    const result = addPatient({
      name: form.name,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
    })

    if (!result.ok) {
      setSubmitError(result.error)
      setIsSubmitting(false)
      submittingRef.current = false
      return
    }

    toast({ title: "تم إنشاء ملفك بنجاح", description: result.patient.name })
    onNext(result.patient.id)
  }

  return (
    <StepCard
      title="بيانات المريض"
      description="أدخل بياناتك لإتمام الحجز، أو اختر مريضاً تجريبياً للمعاينة السريعة"
    >
      <div className="mb-5 inline-flex rounded-lg bg-muted p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("new")}
          className={cn(
            "rounded-md px-3 py-1.5 font-medium transition-colors",
            mode === "new" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          مريض جديد
        </button>
        <button
          type="button"
          onClick={() => setMode("demo")}
          className={cn(
            "rounded-md px-3 py-1.5 font-medium transition-colors",
            mode === "demo" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          مريض تجريبي حالي
        </button>
      </div>

      {mode === "new" ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="portal-name">الاسم الكامل *</Label>
            <Input
              id="portal-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="مثال: محمد أحمد العلي"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="portal-phone">رقم الهاتف *</Label>
            <Input
              id="portal-phone"
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
              <Label htmlFor="portal-dob">تاريخ الميلاد</Label>
              <Input
                id="portal-dob"
                type="date"
                dir="ltr"
                max={todayISO()}
                value={form.dateOfBirth}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الجنس (اختياري)</Label>
              <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v as Gender }))}>
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

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <Button type="button" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            متابعة
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            اختر مريضاً تجريبياً لتجربة الحجز بسرعة دون تعبئة النموذج
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {demoPatients.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onNext(p.id)}
                className="rounded-lg border border-border bg-white p-3 text-center text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </StepCard>
  )
}
