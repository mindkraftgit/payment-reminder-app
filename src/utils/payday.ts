import { format, parseISO, differenceInDays } from 'date-fns'
import type { PaySchedule } from '../db/types'
import { getNextPayday, getLastPayday as _getLastPayday } from '../utils'

function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function calculateNextPayday(schedule: PaySchedule): string | null {
  return getNextPayday(todayString(), schedule)
}

export function calculateLastPayday(schedule: PaySchedule): string | null {
  return _getLastPayday(todayString(), schedule)
}

export function isRedZone(schedule: PaySchedule): { isRed: boolean; daysUntil: number } {
  const next = calculateNextPayday(schedule)
  if (!next) return { isRed: false, daysUntil: 0 }

  const days = differenceInDays(parseISO(next), parseISO(todayString()))
  return { isRed: days <= 3, daysUntil: days }
}
