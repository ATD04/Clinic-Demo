import { CalendarCheck, PackageSearch, Users, Wallet } from "lucide-react"
import { useMemo } from "react"
import { AppointmentsTable } from "@/components/dashboard/AppointmentsTable"
import { DepartmentPerformance } from "@/components/dashboard/DepartmentPerformance"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { RecentActivities } from "@/components/dashboard/RecentActivities"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BASELINE_PATIENT_COUNT } from "@/config/clinic"
import { departments } from "@/config/departments"
import { useClinicData } from "@/data/ClinicDataContext"
import { departmentStats, weeklyRevenue } from "@/data/mockData"
import { toClinicDateISO, todayISO } from "@/lib/date"
import { getStockStatus } from "@/lib/inventory"

export function Dashboard() {
  const { patients, appointmentViews, activities, medicalItems, invoices } = useClinicData()
  const today = todayISO()

  const todaysAppointments = useMemo(
    () =>
      appointmentViews
        .filter((a) => a.date === today)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointmentViews, today]
  )

  const activeTodaysAppointments = todaysAppointments.filter((a) => a.status !== "cancelled")

  const invoicesPaidToday = useMemo(
    () =>
      invoices.filter(
        (inv) => inv.status === "paid" && inv.paidAt && toClinicDateISO(inv.paidAt) === today
      ),
    [invoices, today]
  )

  const todaysRevenue = invoicesPaidToday.reduce((sum, inv) => sum + inv.amount, 0)

  const revenueChartData = useMemo(() => {
    const data = [...weeklyRevenue]
    data[data.length - 1] = { ...data[data.length - 1], amount: todaysRevenue }
    return data
  }, [todaysRevenue])

  const liveDepartmentStats = useMemo(
    () =>
      departments.map((dept) => {
        const mock = departmentStats.find((d) => d.departmentId === dept.id)
        const appointmentsToday = activeTodaysAppointments.filter(
          (a) => a.departmentId === dept.id
        ).length
        const paidToday = invoicesPaidToday
          .filter((inv) => inv.departmentId === dept.id)
          .reduce((sum, inv) => sum + inv.amount, 0)
        return {
          departmentId: dept.id,
          appointments: appointmentsToday,
          revenue: (mock?.revenue ?? 0) + paidToday,
          performance: mock?.performance ?? 0,
        }
      }),
    [activeTodaysAppointments, invoicesPaidToday]
  )

  const lowStockCount = useMemo(
    () => medicalItems.filter((item) => getStockStatus(item, today) !== "ok").length,
    [medicalItems, today]
  )

  const totalPatients = BASELINE_PATIENT_COUNT + patients.length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          نظرة عامة على أداء العيادة لهذا اليوم
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="مواعيد اليوم"
          value={String(activeTodaysAppointments.length)}
          icon={CalendarCheck}
          trend={{ direction: "up", value: "12% عن أمس" }}
        />
        <KpiCard
          label="إجمالي المرضى"
          value={totalPatients.toLocaleString("en-US")}
          icon={Users}
          trend={{ direction: "up", value: "8 مرضى جدد هذا الأسبوع" }}
        />
        <KpiCard
          label="إيرادات اليوم (د.أ)"
          value={todaysRevenue.toLocaleString("en-US")}
          icon={Wallet}
          trend={{ direction: "up", value: "6% عن أمس" }}
        />
        <KpiCard
          label="أصناف منخفضة المخزون"
          value={String(lowStockCount)}
          icon={PackageSearch}
          tone="warning"
          trend={{ direction: "down", value: "تحتاج إعادة طلب" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>نظرة عامة على الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أداء الأقسام</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentPerformance data={liveDepartmentStats} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>مواعيد اليوم</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentsTable data={todaysAppointments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأنشطة الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivities data={activities.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
