import { Plus } from "lucide-react"
import { useState } from "react"
import { PatientFormDialog } from "@/components/patients/PatientFormDialog"
import { PatientProfileDialog } from "@/components/patients/PatientProfileDialog"
import { PatientsTable } from "@/components/patients/PatientsTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClinicData } from "@/data/ClinicDataContext"

export function PatientsPage() {
  const { patients } = useClinicData()
  const [addOpen, setAddOpen] = useState(false)
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null)

  const sortedPatients = [...patients].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المرضى</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تسجيل المرضى الجدد ومتابعة بياناتهم ومواعيدهم
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus />
          إضافة مريض
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المرضى</CardTitle>
          <CardDescription>{patients.length.toLocaleString("en-US")} مريض مسجل في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientsTable patients={sortedPatients} onView={setViewingPatientId} />
        </CardContent>
      </Card>

      <PatientFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <PatientProfileDialog
        patientId={viewingPatientId}
        open={viewingPatientId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingPatientId(null)
        }}
      />
    </div>
  )
}
