import { Activity, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { ConfirmStep } from "@/components/portal/ConfirmStep"
import { DepartmentStep } from "@/components/portal/DepartmentStep"
import { DoctorStep } from "@/components/portal/DoctorStep"
import { RegisterStep } from "@/components/portal/RegisterStep"
import { ScheduleStep } from "@/components/portal/ScheduleStep"
import { StepIndicator } from "@/components/portal/StepIndicator"
import { SummaryRow } from "@/components/portal/SummaryRow"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { departmentNameById } from "@/data/mockData"
import { formatArabicDate, todayISO } from "@/lib/date"
import type { AppointmentView } from "@/types"

export type PortalFlowStep = "register" | "department" | "doctor" | "schedule" | "confirm"
type PortalStep = "landing" | PortalFlowStep | "success"

function PortalHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="size-5" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">ClinicFlow</p>
            <p className="text-xs text-muted-foreground">بوابة حجز المواعيد الإلكترونية</p>
          </div>
        </div>
        <Link to="/" className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
          عرض النظام الداخلي
        </Link>
      </div>
    </header>
  )
}

function LandingSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Activity className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">مرحباً بك في ClinicFlow</h1>
        <p className="text-muted-foreground">
          احجز موعدك مع أطبائنا بخطوات بسيطة وسريعة، في أي وقت يناسبك.
        </p>
      </div>
      <Button size="lg" onClick={onStart}>
        احجز موعدك الآن
      </Button>
    </div>
  )
}

function SuccessSection({
  appointment,
  onHome,
  onBookAnother,
}: {
  appointment: AppointmentView
  onHome: () => void
  onBookAnother: () => void
}) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <CheckCircle2 className="size-7" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">تم حجز موعدك بنجاح</p>
          <p className="mt-1 text-sm text-muted-foreground">سنكون بانتظارك في الموعد المحدد</p>
        </div>
        <div className="w-full space-y-2 rounded-lg bg-muted/50 p-4 text-start text-sm">
          <SummaryRow label="رقم المرجع" value={appointment.id} dir="ltr" />
          <SummaryRow label="الطبيب" value={appointment.doctorName} />
          <SummaryRow label="القسم" value={departmentNameById(appointment.departmentId)} />
          <SummaryRow label="التاريخ" value={formatArabicDate(appointment.date)} />
          <SummaryRow label="الوقت" value={appointment.time} dir="ltr" />
        </div>
        <div className="flex w-full gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onHome}>
            العودة للرئيسية
          </Button>
          <Button type="button" className="flex-1" onClick={onBookAnother}>
            حجز موعد آخر
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PatientPortal() {
  const [step, setStep] = useState<PortalStep>("landing")
  const [patientId, setPatientId] = useState<string | null>(null)
  const [departmentId, setDepartmentId] = useState<string | null>(null)
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState<string | null>(null)
  const [bookedAppointment, setBookedAppointment] = useState<AppointmentView | null>(null)

  function resetAll() {
    setStep("landing")
    setPatientId(null)
    setDepartmentId(null)
    setDoctorId(null)
    setDate(todayISO())
    setTime(null)
    setBookedAppointment(null)
  }

  function bookAnother() {
    setStep("department")
    setDepartmentId(null)
    setDoctorId(null)
    setDate(todayISO())
    setTime(null)
    setBookedAppointment(null)
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PortalHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {step === "landing" && <LandingSection onStart={() => setStep("register")} />}

        {step !== "landing" && step !== "success" && <StepIndicator current={step} />}

        {step === "register" && <RegisterStep onNext={(id) => { setPatientId(id); setStep("department") }} />}

        {step === "department" && (
          <DepartmentStep
            onSelect={(id) => {
              setDepartmentId(id)
              setDoctorId(null)
              setStep("doctor")
            }}
            onBack={() => setStep("register")}
          />
        )}

        {step === "doctor" && departmentId && (
          <DoctorStep
            departmentId={departmentId}
            onSelect={(id) => {
              setDoctorId(id)
              setStep("schedule")
            }}
            onBack={() => setStep("department")}
          />
        )}

        {step === "schedule" && doctorId && departmentId && (
          <ScheduleStep
            doctorId={doctorId}
            departmentId={departmentId}
            date={date}
            onDateChange={setDate}
            onSelectTime={(selectedTime) => {
              setTime(selectedTime)
              setStep("confirm")
            }}
            onBack={() => setStep("doctor")}
          />
        )}

        {step === "confirm" && patientId && departmentId && doctorId && time && (
          <ConfirmStep
            patientId={patientId}
            departmentId={departmentId}
            doctorId={doctorId}
            date={date}
            time={time}
            onBack={() => setStep("schedule")}
            onConfirmed={(appointment) => {
              setBookedAppointment(appointment)
              setStep("success")
            }}
          />
        )}

        {step === "success" && bookedAppointment && (
          <SuccessSection appointment={bookedAppointment} onHome={resetAll} onBookAnother={bookAnother} />
        )}
      </main>
    </div>
  )
}
