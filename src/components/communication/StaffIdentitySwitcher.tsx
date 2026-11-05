import { User } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { roleLabels, staffMembers } from "@/config/staff"
import { useClinicData } from "@/data/ClinicDataContext"

export function StaffIdentitySwitcher() {
  const { currentStaffId, setCurrentStaffId } = useClinicData()
  const doctorStaff = staffMembers.filter((s) => s.role === "doctor")
  const otherStaff = staffMembers.filter((s) => s.role !== "doctor")

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 ps-3 pe-1.5 py-1.5">
      <User className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-[11px] font-medium text-muted-foreground">تجربة توضيحية — الهوية الحالية</span>
        <Select value={currentStaffId} onValueChange={setCurrentStaffId}>
          <SelectTrigger size="sm" className="h-6 border-none bg-transparent p-0 font-semibold shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectLabel>الأطباء</SelectLabel>
              {doctorStaff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>الإدارة والاستقبال</SelectLabel>
              {otherStaff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} — {roleLabels[s.role]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
