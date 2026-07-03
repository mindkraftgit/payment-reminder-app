import { addDays, format, isSaturday, isSunday, parseISO } from 'date-fns'
import type { ProjectedPayment, PaySchedule } from './db/types'

const INITIALISMS = new Set([
  'AA', 'AI', 'API', 'BI', 'CD', 'CPU', 'GPS', 'HD', 'HDMI',
  'ID', 'IP', 'MSL', 'NZ', 'PC', 'TV', 'TFR', 'UI', 'USB', 'WWW',
])

const OWNER_NAMES = ['TOLA', 'TOMI']

function stripOwnerSuffix(raw: string): string {
  const upper = raw.toUpperCase()
  for (const owner of OWNER_NAMES) {
    if (upper.endsWith(`-${owner}`)) {
      return raw.slice(0, -(owner.length + 1)).trim()
    }
  }
  return raw
}

function formatAppleEntry(name: string): string {
  const applePrefix = /^Apple\s+/i
  if (!applePrefix.test(name)) return name
  const rest = name.replace(applePrefix, '')
  return `${rest} - Apple`
}

export function prettyName(raw: string): string {
  let name = raw

  if (name.includes('/BILL-')) {
    const parts = name.split('/BILL-')
    name = parts[0] + ' ' + parts.slice(1).join(' ')
  }

  name = stripOwnerSuffix(name)

  if (/^Baycorp\s+TFR\s+TO\s+Baycorp/i.test(name)) {
    name = name.replace(/^Baycorp\s+TFR\s+TO\s+Baycorp/i, 'Baycorp')
  }

  name = name
    .replace(/\*/g, ' ')
    .replace(/(\b\w+)\s+\1\b/g, '$1')
    .replace(/-(\d{4,})/g, ' ($1)')
    .replace(/\s+/g, ' ')
    .trim()

  name = name.replace(/\b[A-Z][A-Z.]+[A-Z]?\b/g, (word) => {
    const clean = word.replace(/\./g, '')
    if (INITIALISMS.has(clean)) return clean
    if (/^[A-Z]+\.(COM|NET|ORG)$/i.test(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  name = name
    .replace(/^Apple\.com /, 'Apple ')
    .replace(/^Crunchyroll\.com$/, 'Crunchyroll')

  name = formatAppleEntry(name)

  return name
}

export function getValidatedPayments(
  firstDate: string,
  cycleDays: number,
  avgAmount: number,
  adjustWeekends?: boolean,
): ProjectedPayment[] {
  const payments: ProjectedPayment[] = []
  const start = new Date(firstDate)
  const amount = Math.abs(avgAmount)
  const horizon = new Date()
  horizon.setFullYear(horizon.getFullYear() + 5)

  let d = new Date(start)
  while (d <= horizon) {
    payments.push({ date: format(d, 'yyyy-MM-dd'), amount })
    d = addDays(d, cycleDays)
  }

  if (adjustWeekends) {
    return payments.map((p) => {
      const dt = new Date(p.date + 'T00:00:00')
      if (isSaturday(dt) || isSunday(dt)) {
        let next = dt
        while (isSaturday(next) || isSunday(next)) {
          next = addDays(next, 1)
        }
        return { ...p, date: format(next, 'yyyy-MM-dd') }
      }
      return p
    })
  }

  return payments
}

function nearestWeekday(date: Date): Date {
  const d = new Date(date)
  if (isSaturday(d)) d.setDate(d.getDate() - 1)
  else if (isSunday(d)) d.setDate(d.getDate() + 1)
  return d
}

function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0)
}

function getNextFortnightlyPayday(from: Date, anchor: Date): Date {
  const target = new Date(anchor)
  while (target <= from) {
    target.setDate(target.getDate() + 14)
  }
  return target
}

function getLastFortnightlyPayday(from: Date, anchor: Date): Date {
  const target = new Date(anchor)
  while (true) {
    const next = new Date(target)
    next.setDate(next.getDate() + 14)
    if (next > from) return target
    target.setDate(target.getDate() + 14)
  }
}

function getNextTwiceMonthlyPayday(from: Date, firstDay: number, secondDay: number): Date {
  const y = from.getFullYear()
  const m = from.getMonth()

  const candidates: Date[] = []

  const day1 = new Date(y, m, firstDay)
  candidates.push(nearestWeekday(day1))

  const last = getLastDayOfMonth(y, m + 1)
  const day2 = secondDay === -1 ? last : new Date(y, m, secondDay)
  candidates.push(nearestWeekday(day2))

  const day1next = new Date(y, m + 1, firstDay)
  candidates.push(nearestWeekday(day1next))

  const lastNext = getLastDayOfMonth(y, m + 2)
  const day2next = secondDay === -1 ? lastNext : new Date(y, m + 1, secondDay)
  candidates.push(nearestWeekday(day2next))

  const future = candidates.filter((c) => c > from)
  future.sort((a, b) => a.getTime() - b.getTime())
  return future[0]
}

function getLastTwiceMonthlyPayday(from: Date, firstDay: number, secondDay: number): Date {
  const y = from.getFullYear()
  const m = from.getMonth()

  const candidates: Date[] = []

  const lastMonth = getLastDayOfMonth(y, m)
  const day2prev = secondDay === -1 ? lastMonth : new Date(y, m - 1, secondDay)
  candidates.push(nearestWeekday(day2prev))

  const day1 = new Date(y, m - 1, firstDay)
  candidates.push(nearestWeekday(day1))

  const day1current = new Date(y, m, firstDay)
  candidates.push(nearestWeekday(day1current))

  const currentLast = getLastDayOfMonth(y, m + 1)
  const day2current = secondDay === -1 ? currentLast : new Date(y, m, secondDay)
  candidates.push(nearestWeekday(day2current))

  const past = candidates.filter((c) => c <= from)
  past.sort((a, b) => b.getTime() - a.getTime())
  return past[0]
}

export function getNextPayday(fromDate: string, schedule: PaySchedule): string | null {
  const from = parseISO(fromDate)
  if (schedule.frequency === 'Fortnightly') {
    if (schedule.dayOfWeek === undefined || !schedule.firstPayDate) return null
    const next = getNextFortnightlyPayday(from, parseISO(schedule.firstPayDate))
    return format(next, 'yyyy-MM-dd')
  }
  if (schedule.frequency === 'TwiceMonthly' || schedule.frequency === 'Monthly') {
    const next = getNextTwiceMonthlyPayday(from, schedule.firstDay ?? 15, schedule.secondDay ?? -1)
    return format(next, 'yyyy-MM-dd')
  }
  return null
}

function getLastPayday(fromDate: string, schedule: PaySchedule): string | null {
  const from = parseISO(fromDate)
  if (schedule.frequency === 'Fortnightly') {
    if (schedule.dayOfWeek === undefined || !schedule.firstPayDate) return null
    const last = getLastFortnightlyPayday(from, parseISO(schedule.firstPayDate))
    return format(last, 'yyyy-MM-dd')
  }
  if (schedule.frequency === 'TwiceMonthly' || schedule.frequency === 'Monthly') {
    const last = getLastTwiceMonthlyPayday(from, schedule.firstDay ?? 15, schedule.secondDay ?? -1)
    return format(last, 'yyyy-MM-dd')
  }
  return null
}

export function isInRedZone(paymentDate: string, schedules: PaySchedule[]): boolean {
  const tolaSchedule = schedules.find((s) => s.owner === 'Tola')
  const tomiSchedule = schedules.find((s) => s.owner === 'Tomi')
  if (!tolaSchedule || !tomiSchedule) return false

  const tolaLast = getLastPayday(paymentDate, tolaSchedule)
  if (!tolaLast) return false

  const tomiNext = getNextPayday(tolaLast, tomiSchedule)
  if (!tomiNext) return false

  return parseISO(paymentDate) < parseISO(tomiNext)
}
