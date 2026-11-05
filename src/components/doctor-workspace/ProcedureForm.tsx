import { Plus, Trash2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { servicesByDepartment } from "@/config/services"
import { useClinicData } from "@/data/ClinicDataContext"
import { todayISO } from "@/lib/date"
import { computeAvailableStock } from "@/lib/inventory"
import type { AppointmentView, Invoice, MedicalProcedure } from "@/types"

interface MaterialRow {
  key: string
  itemId: string
  quantity: number
}

interface ProcedureFormProps {
  appointment: AppointmentView
  doctorId: string
  onCompleted: (procedure: MedicalProcedure, invoice: Invoice) => void
}

export function ProcedureForm({ appointment, doctorId, onCompleted }: ProcedureFormProps) {
  const { medicalItems, confirmProcedure } = useClinicData()
  const services = servicesByDepartment(appointment.departmentId)
  const today = todayISO()

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "")
  const [materials, setMaterials] = useState<MaterialRow[]>([{ key: "row-1", itemId: "", quantity: 1 }])
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const selectedService = services.find((s) => s.id === serviceId)
  const usedItemIds = new Set(materials.map((r) => r.itemId).filter(Boolean))

  const materialsCost = materials.reduce((sum, r) => {
    const item = medicalItems.find((i) => i.id === r.itemId)
    return item ? sum + item.unitCost * r.quantity : sum
  }, 0)

  function updateRow(key: string, patch: Partial<MaterialRow>) {
    setMaterials((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setMaterials((prev) => [...prev, { key: `row-${prev.length}-${Date.now()}`, itemId: "", quantity: 1 }])
  }

  function removeRow(key: string) {
    setMaterials((prev) => prev.filter((r) => r.key !== key))
  }

  function handleSubmit() {
    if (submittingRef.current) return
    if (!serviceId) {
      setError("الرجاء اختيار الإجراء أو الخدمة")
      return
    }

    const selectedMaterials = materials
      .filter((r) => r.itemId)
      .map((r) => ({ itemId: r.itemId, quantity: r.quantity }))

    for (const m of selectedMaterials) {
      if (m.quantity <= 0) {
        setError("الكمية يجب أن تكون أكبر من صفر")
        return
      }
      const item = medicalItems.find((i) => i.id === m.itemId)
      if (item) {
        const available = computeAvailableStock(item, today)
        if (available < m.quantity) {
          setError(`الكمية المتوفرة من "${item.name}" غير كافية (المتوفر: ${available})`)
          return
        }
      }
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setError(null)

    const result = confirmProcedure({
      appointmentId: appointment.id,
      doctorId,
      serviceId,
      materials: selectedMaterials,
      notes,
    })

    if (!result.ok) {
      setError(result.error)
      setIsSubmitting(false)
      submittingRef.current = false
      return
    }

    onCompleted(result.procedure, result.invoice)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>الإجراء / الخدمة</Label>
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="اختر الخدمة" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} — {s.price} د.أ
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>المواد الطبية المستهلكة</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus />
            إضافة مادة
          </Button>
        </div>

        <div className="space-y-2">
          {materials.map((row) => {
            const available = row.itemId
              ? computeAvailableStock(medicalItems.find((i) => i.id === row.itemId)!, today)
              : undefined
            return (
              <div key={row.key} className="flex items-center gap-2">
                <Select value={row.itemId} onValueChange={(v) => updateRow(row.key, { itemId: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر مادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicalItems
                      .filter((i) => i.id === row.itemId || !usedItemIds.has(i.id))
                      .map((i) => {
                        const avail = computeAvailableStock(i, today)
                        return (
                          <SelectItem key={i.id} value={i.id} disabled={avail <= 0}>
                            {i.name} (متوفر: {avail} {i.unit})
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  max={available}
                  value={row.quantity}
                  onChange={(e) => updateRow(row.key, { quantity: Number(e.target.value) || 1 })}
                  className="w-20 shrink-0"
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => removeRow(row.key)}
                  disabled={materials.length === 1}
                >
                  <Trash2 />
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="procedure-notes">ملاحظات سريرية (اختياري)</Label>
        <Textarea
          id="procedure-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="أي ملاحظات حول الإجراء"
          rows={2}
        />
      </div>

      <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
        <p className="font-semibold text-foreground">ملخص الإجراء</p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">الخدمة</span>
          <span className="font-medium text-foreground">
            {selectedService ? `${selectedService.name} — ${selectedService.price} د.أ` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>التكلفة الداخلية للمواد (لا تُحتسب على المريض)</span>
          <span>{materialsCost.toFixed(2)} د.أ</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="font-medium text-foreground">المبلغ المستحق على المريض</span>
          <span className="text-base font-bold text-foreground">{selectedService?.price ?? 0} د.أ</span>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="button" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
        تأكيد الإجراء
      </Button>
    </div>
  )
}
