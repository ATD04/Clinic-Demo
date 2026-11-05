import { Construction, RotateCcw } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClinicData } from "@/data/ClinicDataContext"
import { useToast } from "@/hooks/use-toast"

export function SettingsPage() {
  const { resetDemoData } = useClinicData()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  function handleConfirm() {
    resetDemoData()
    setOpen(false)
    toast({
      title: "تمت إعادة تعيين بيانات العرض التجريبي",
      description: "تم استرجاع البيانات التجريبية الأصلية للمرضى والمواعيد.",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted-foreground">إعدادات النظام والعيادة وتفضيلات الحساب</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات العرض التجريبي</CardTitle>
          <CardDescription>
            إعادة تعيين كل المرضى والمواعيد المضافة أثناء التجربة والعودة إلى البيانات الأصلية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <RotateCcw />
                إعادة تعيين بيانات العرض التجريبي
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد إعادة التعيين</AlertDialogTitle>
                <AlertDialogDescription>
                  سيؤدي هذا إلى حذف جميع المرضى والمواعيد التي أضفتها خلال هذه التجربة، والعودة إلى
                  البيانات التجريبية الأصلية. لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm}>تأكيد الإعادة</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Construction className="size-7" />
          </div>
          <div className="max-w-sm space-y-1.5">
            <p className="font-semibold text-foreground">باقي إعدادات النظام قيد الإنشاء</p>
            <p className="text-sm text-muted-foreground">
              مثل بيانات العيادة، صلاحيات المستخدمين، وساعات العمل. ستتوفر في المراحل القادمة.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
