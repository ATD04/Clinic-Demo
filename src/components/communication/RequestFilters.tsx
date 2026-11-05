import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type RequestFilterKey = "all" | "mine" | "assigned" | "completed"

const FILTERS: { key: RequestFilterKey; label: string }[] = [
  { key: "all", label: "كل الطلبات" },
  { key: "mine", label: "طلباتي" },
  { key: "assigned", label: "المسندة إليّ" },
  { key: "completed", label: "المكتملة" },
]

interface RequestFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filter: RequestFilterKey
  onFilterChange: (filter: RequestFilterKey) => void
}

export function RequestFilters({ search, onSearchChange, filter, onFilterChange }: RequestFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث بعنوان الطلب أو اسم المريض"
          className="ps-8"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            type="button"
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            onClick={() => onFilterChange(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
