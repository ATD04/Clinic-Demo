export function SummaryRow({ label, value, dir }: { label: string; value: string; dir?: "ltr" | "rtl" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span dir={dir} className="font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}
