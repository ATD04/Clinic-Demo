import { Bell, Menu } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useClinicData } from "@/data/ClinicDataContext"
import { SidebarContent } from "./Sidebar"

const todayLabel = new Intl.DateTimeFormat("ar-JO", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  numberingSystem: "latn",
}).format(new Date())

export function Topbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const navigate = useNavigate()
  const { internalRequestViews, currentStaffId } = useClinicData()

  const unreadRequests = useMemo(
    () =>
      internalRequestViews
        .filter((r) => r.assignedToStaffId === currentStaffId && !r.seenByStaffIds.includes(currentStaffId))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [internalRequestViews, currentStaffId]
  )

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="فتح القائمة"
      >
        <Menu className="size-5" />
      </Button>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
          <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center gap-3">
        <p className="hidden text-sm text-muted-foreground sm:block">{todayLabel}</p>
        <Badge variant="secondary">بيانات تجريبية</Badge>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="الإشعارات">
            <Bell className="size-5" />
            {unreadRequests.length > 0 && (
              <span className="absolute end-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-white">
                {unreadRequests.length > 9 ? "9+" : unreadRequests.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>طلبات بانتظارك</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {unreadRequests.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">لا توجد إشعارات جديدة</p>
          ) : (
            unreadRequests.slice(0, 5).map((r) => (
              <DropdownMenuItem key={r.id} onClick={() => navigate(`/communication?request=${r.id}`)}>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{r.title}</span>
                  <span className="text-xs text-muted-foreground">من {r.createdByName}</span>
                </div>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/communication")}>عرض كل الطلبات</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                عس
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">عبدالله السالم</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <p className="font-medium">عبدالله السالم</p>
            <p className="text-xs font-normal text-muted-foreground">مدير العيادة</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
          <DropdownMenuItem>الإعدادات</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">تسجيل الخروج</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
