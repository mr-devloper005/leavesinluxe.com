type ContractCheck = {
  name: string
  pass: boolean
  expected: string
  actual?: unknown
  hint: string
  file?: string
}

const formatActual = (actual: unknown) => {
  if (typeof actual === 'string') return actual || '(empty string)'
  if (actual === undefined) return 'undefined'
  if (actual === null) return 'null'
  try {
    return JSON.stringify(actual)
  } catch {
    return String(actual)
  }
}

export function assertContract(checks: ContractCheck[]) {
  const failures = checks.filter((check) => !check.pass)
  if (!failures.length) return

  const message = failures
    .map((failure, index) => {
      const fileLine = failure.file ? `\nFile: ${failure.file}` : ''
      return [
        `${index + 1}. ${failure.name}`,
        `Expected: ${failure.expected}`,
        `Actual: ${formatActual(failure.actual)}`,
        `Hint: ${failure.hint}${fileLine}`,
      ].join('\n')
    })
    .join('\n\n')

  throw new Error(`\nEditable contract failed. Fix the following issue(s):\n\n${message}\n`)
}

export function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

export function isHttpUrl(value: unknown) {
  return typeof value === 'string' && /^https?:\/\//.test(value)
}

export function isHexColor(value: unknown) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value)
}

export function isNonEmptyText(value: unknown) {
  if (isNonEmptyString(value)) return true
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString)
}
