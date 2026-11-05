import {
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react"

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

export const navItems: NavItem[] = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/appointments", label: "المواعيد", icon: CalendarDays },
  { to: "/patients", label: "المرضى", icon: Users },
  { to: "/doctors", label: "غرفة الطبيب", icon: Stethoscope },
  { to: "/inventory", label: "المخزون", icon: Package },
  { to: "/finance", label: "الإدارة المالية", icon: Wallet },
  { to: "/communication", label: "التواصل الداخلي", icon: MessageSquare },
  { to: "/settings", label: "الإعدادات", icon: Settings },
]
