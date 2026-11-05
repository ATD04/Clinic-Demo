import { Check, ChevronsUpDown, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatPhoneDisplay } from "@/lib/phone"
import type { Patient } from "@/types"

interface PatientComboboxProps {
  patients: Patient[]
  value: string | null
  onChange: (patientId: string) => void
  disabled?: boolean
}

export function PatientCombobox({ patients, value, onChange, disabled }: PatientComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = patients.find((p) => p.id === value)

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return patients
    return patients.filter(
      (p) => p.name.includes(q) || p.phone.includes(q) || p.id.toLowerCase().includes(q.toLowerCase())
    )
  }, [patients, query])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? selected.name : "اختر مريض"}
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو رقم الهاتف أو المعرف"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">لا توجد نتائج</p>
          ) : (
            filtered.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => {
                  onChange(patient.id)
                  setOpen(false)
                  setQuery("")
                }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-muted"
              >
                <span className="flex flex-col">
                  <span className="font-medium text-foreground">{patient.name}</span>
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    {formatPhoneDisplay(patient.phone)}
                  </span>
                </span>
                {patient.id === value && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
