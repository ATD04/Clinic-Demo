import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { departmentNameById, doctorsByDepartment } from "@/data/mockData"
import { StepCard } from "./StepCard"

interface DoctorStepProps {
  departmentId: string
  onSelect: (doctorId: string) => void
  onBack: () => void
}

export function DoctorStep({ departmentId, onSelect, onBack }: DoctorStepProps) {
  const doctors = doctorsByDepartment(departmentId)

  return (
    <StepCard title="اختر الطبيب" description={`الأطباء المتاحون في قسم ${departmentNameById(departmentId)}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        {doctors.map((doctor) => (
          <button
            key={doctor.id}
            type="button"
            onClick={() => onSelect(doctor.id)}
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 text-start transition-colors hover:border-primary/50 hover:bg-secondary/50"
          >
            <Avatar size="lg">
              <AvatarFallback className="bg-secondary font-semibold text-primary">
                {doctor.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{doctor.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {departmentNameById(doctor.departmentId)}
              </p>
            </div>
          </button>
        ))}
      </div>
      <Button type="button" variant="ghost" className="mt-5" onClick={onBack}>
        رجوع
      </Button>
    </StepCard>
  )
}
