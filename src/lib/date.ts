const CLINIC_TIME_ZONE = "Asia/Amman"

function pluralAr(n: number, singular: string, dual: string, plural: string) {
  if (n === 1) return singular
  if (n === 2) return dual
  return plural
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** A Date whose local getters (hours/minutes/day) reflect Amman wall-clock time for the given instant, regardless of the host timezone. */
export function getClinicNow(instant: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(instant)

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)

  return new Date(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") === 24 ? 0 : get("hour"),
    get("minute"),
    get("second")
  )
}

export function todayISO(): string {
  return formatDateISO(getClinicNow())
}

/** Converts any ISO timestamp (e.g. a stored `createdAt`/`paidAt`) to its Amman-local calendar date. */
export function toClinicDateISO(isoTimestamp: string): string {
  return formatDateISO(getClinicNow(new Date(isoTimestamp)))
}

export function addDays(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number)
  const date = new Date(y, m - 1, d + days, 12)
  return formatDateISO(date)
}

export function nowMinutes(): number {
  const now = getClinicNow()
  return now.getHours() * 60 + now.getMinutes()
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function isPastSlot(date: string, time: string): boolean {
  const today = todayISO()
  if (date < today) return true
  if (date > today) return false
  return timeToMinutes(time) < nowMinutes()
}

export function formatArabicDate(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number)
  const date = new Date(y, m - 1, d, 12)
  return new Intl.DateTimeFormat("ar-JO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    numberingSystem: "latn",
  }).format(date)
}

export function formatArabicDateShort(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number)
  const date = new Date(y, m - 1, d, 12)
  return new Intl.DateTimeFormat("ar-JO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    numberingSystem: "latn",
  }).format(date)
}

export function formatRelativeArabic(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const diffMin = Math.max(0, Math.round(diffMs / 60000))

  if (diffMin < 1) return "الآن"
  if (diffMin < 60) return `قبل ${diffMin} ${pluralAr(diffMin, "دقيقة", "دقيقتين", "دقائق")}`

  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `قبل ${diffHour} ${pluralAr(diffHour, "ساعة", "ساعتين", "ساعات")}`

  const diffDay = Math.round(diffHour / 24)
  return `قبل ${diffDay} ${pluralAr(diffDay, "يوم", "يومين", "أيام")}`
}
