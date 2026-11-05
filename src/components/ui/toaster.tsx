import { CheckCircle2, XCircle } from "lucide-react"
import { Toast as ToastPrimitive } from "radix-ui"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastPrimitive.Provider swipeDirection="down" duration={4000}>
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          onOpenChange={(open) => {
            if (!open) dismiss(t.id)
          }}
          className={cn(
            "flex w-80 items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-lg",
            "data-open:animate-in data-open:slide-in-from-bottom-2 data-open:fade-in-0",
            "data-closed:animate-out data-closed:fade-out-0"
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
              t.variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"
            )}
          >
            {t.variant === "destructive" ? (
              <XCircle className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
          </div>
          <div className="flex-1 space-y-0.5">
            <ToastPrimitive.Title className="text-sm font-semibold text-foreground">
              {t.title}
            </ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="text-xs text-muted-foreground">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </div>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 left-1/2 z-[100] flex w-80 -translate-x-1/2 flex-col gap-2 outline-none" />
    </ToastPrimitive.Provider>
  )
}
