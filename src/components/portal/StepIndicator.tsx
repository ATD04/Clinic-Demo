import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PortalFlowStep } from "@/pages/PatientPortal"

const STEPS: { key: PortalFlowStep; label: string }[] = [
  { key: "register", label: "التسجيل" },
  { key: "department", label: "القسم" },
  { key: "doctor", label: "الطبيب" },
  { key: "schedule", label: "الموعد" },
  { key: "confirm", label: "التأكيد" },
]

export function StepIndicator({ current }: { current: PortalFlowStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current)

  return (
    <div className="mx-auto mb-8 flex w-full max-w-lg items-center">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex flex-1 items-center last:flex-initial">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < currentIndex
                  ? "bg-primary text-primary-foreground"
                  : i === currentIndex
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i < currentIndex ? <Check className="size-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-[11px] whitespace-nowrap",
                i <= currentIndex ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("mx-1.5 h-0.5 flex-1 rounded", i < currentIndex ? "bg-primary" : "bg-muted")} />
          )}
        </div>
      ))}
    </div>
  )
}
