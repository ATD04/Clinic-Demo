// Clinic-wide scheduling settings — adjust as the real clinic's hours are confirmed.
export const CLINIC_HOURS = {
  startMinutes: 9 * 60, // 09:00
  endMinutes: 17 * 60, // 17:00
}

export const SLOT_STEP_MINUTES = 30

// Represents patients already in the system beyond the ones listed individually in this demo.
export const BASELINE_PATIENT_COUNT = 1284

export const visitReasons = [
  "كشف أولي",
  "متابعة",
  "استشارة",
  "إجراء علاجي",
  "فحص دوري",
]
