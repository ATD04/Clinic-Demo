import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatArabicDateShort, toClinicDateISO } from "@/lib/date"
import type { InvoiceView } from "@/types"
import { InvoiceStatusBadge } from "./InvoiceStatusBadge"

interface InvoiceTableProps {
  invoices: InvoiceView[]
  onView: (invoiceId: string) => void
}

export function InvoiceTable({ invoices, onView }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return <p className="py-14 text-center text-sm text-muted-foreground">لا توجد فواتير بعد</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الفاتورة</TableHead>
            <TableHead>المريض</TableHead>
            <TableHead>الخدمة</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead className="text-end">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="cursor-pointer" onClick={() => onView(invoice.id)}>
              <TableCell className="font-medium text-foreground">{invoice.invoiceNumber}</TableCell>
              <TableCell className="text-muted-foreground">{invoice.patientName}</TableCell>
              <TableCell className="text-muted-foreground">{invoice.serviceName}</TableCell>
              <TableCell className="text-muted-foreground">
                {invoice.amount.toLocaleString("en-US")} د.أ
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatArabicDateShort(toClinicDateISO(invoice.issuedAt))}
              </TableCell>
              <TableCell className="text-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView(invoice.id)
                  }}
                >
                  <Eye />
                  عرض
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
