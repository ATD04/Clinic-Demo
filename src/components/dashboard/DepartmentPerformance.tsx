import { Progress } from "@/components/ui/progress"
import { departmentNameById } from "@/data/mockData"
import type { DepartmentStats } from "@/types"

interface DepartmentPerformanceProps {
  data: DepartmentStats[]
}

export function DepartmentPerformance({ data }: DepartmentPerformanceProps) {
  return (
    <div className="space-y-5">
      {data.map((dept) => (
        <div key={dept.departmentId} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">
              {departmentNameById(dept.departmentId)}
            </p>
            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              <span>{dept.appointments} موعد</span>
              <span className="font-medium text-foreground">
                {dept.revenue.toLocaleString("en-US")} د.أ
              </span>
            </div>
          </div>
          <Progress value={dept.performance} className="h-2" />
        </div>
      ))}
    </div>
  )
}
