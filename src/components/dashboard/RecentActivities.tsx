import { CalendarPlus, ClipboardCheck, PackageX, Receipt, UserPlus } from "lucide-react"
import { formatRelativeArabic } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { ActivityItem, ActivityType } from "@/types"

const activityIconConfig: Record<ActivityType, { icon: typeof CalendarPlus; className: string }> = {
  appointment: { icon: CalendarPlus, className: "bg-sky-50 text-sky-700" },
  registration: { icon: UserPlus, className: "bg-secondary text-primary" },
  procedure: { icon: ClipboardCheck, className: "bg-emerald-50 text-emerald-700" },
  inventory: { icon: PackageX, className: "bg-amber-50 text-amber-700" },
  payment: { icon: Receipt, className: "bg-secondary text-primary" },
}

export function RecentActivities({ data }: { data: ActivityItem[] }) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">لا توجد أنشطة بعد</p>
  }

  return (
    <ul className="space-y-4">
      {data.map((activity) => {
        const config = activityIconConfig[activity.type]
        const Icon = config.icon
        return (
          <li key={activity.id} className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                config.className
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeArabic(activity.timestamp)}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
