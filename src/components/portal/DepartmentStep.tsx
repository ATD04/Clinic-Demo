import { Baby, Bone, Smile, Sparkles, Venus } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { departments } from "@/config/departments"
import { cn } from "@/lib/utils"
import { StepCard } from "./StepCard"

const departmentIcons: Record<string, LucideIcon> = {
  dental: Smile,
  dermatology: Sparkles,
  obgyn: Venus,
  orthopedics: Bone,
  pediatrics: Baby,
}

interface DepartmentStepProps {
  onSelect: (departmentId: string) => void
  onBack: () => void
}

export function DepartmentStep({ onSelect, onBack }: DepartmentStepProps) {
  return (
    <StepCard title="اختر القسم الطبي" description="اختر القسم المناسب لحالتك">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {departments.map((dept) => {
          const Icon = departmentIcons[dept.id] ?? Smile
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => onSelect(dept.id)}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border border-border bg-white p-4 text-center transition-colors",
                "hover:border-primary/50 hover:bg-secondary/50"
              )}
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="size-6" />
              </div>
              <span className="text-sm font-medium text-foreground">{dept.name}</span>
            </button>
          )
        })}
      </div>
      <Button type="button" variant="ghost" className="mt-5" onClick={onBack}>
        رجوع
      </Button>
    </StepCard>
  )
}
