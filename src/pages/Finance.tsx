import { AlertCircle, Receipt, Wallet } from "lucide-react"
import { useState } from "react"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { InvoiceDetailsDialog } from "@/components/finance/InvoiceDetailsDialog"
import { InvoiceTable } from "@/components/finance/InvoiceTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClinicData } from "@/data/ClinicDataContext"

export function FinancePage() {
  const { invoiceViews } = useClinicData()
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null)

  const totalInvoiced = invoiceViews.reduce((sum, i) => sum + i.amount, 0)
  const totalCollected = invoiceViews
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0)
  const outstanding = totalInvoiced - totalCollected

  const sortedInvoices = [...invoiceViews].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإدارة المالية</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          نظرة عامة على الفواتير والمدفوعات الناتجة عن إجراءات الأطباء
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="إجمالي الفواتير (د.أ)" value={totalInvoiced.toLocaleString("en-US")} icon={Receipt} />
        <KpiCard label="المبالغ المحصلة (د.أ)" value={totalCollected.toLocaleString("en-US")} icon={Wallet} />
        <KpiCard
          label="المبالغ المستحقة (د.أ)"
          value={outstanding.toLocaleString("en-US")}
          icon={AlertCircle}
          tone={outstanding > 0 ? "warning" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الفواتير</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable invoices={sortedInvoices} onView={setViewingInvoiceId} />
        </CardContent>
      </Card>

      <InvoiceDetailsDialog
        invoiceId={viewingInvoiceId}
        open={viewingInvoiceId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingInvoiceId(null)
        }}
      />
    </div>
  )
}
