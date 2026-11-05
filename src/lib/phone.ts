const LOCAL_PATTERN = /^07[789]\d{7}$/
const INTL_PATTERN = /^(?:\+962|00962)7[789]\d{7}$/

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s-]/g, "")
}

export function isValidJordanPhone(raw: string): boolean {
  const value = normalizePhone(raw)
  return LOCAL_PATTERN.test(value) || INTL_PATTERN.test(value)
}

export function formatPhoneDisplay(raw: string): string {
  const value = normalizePhone(raw)
  if (LOCAL_PATTERN.test(value)) {
    return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`
  }
  return value
}
