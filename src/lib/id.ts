export function generateSequentialId(prefix: string, existingIds: string[], start = 1001): string {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`)
  const numbers = existingIds
    .map((id) => {
      const match = id.match(pattern)
      return match ? Number(match[1]) : null
    })
    .filter((n): n is number => n !== null)

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : start
  return `${prefix}-${next}`
}
