/**
 * Unit tests for extrapolatePayments
 */
import { describe, it, expect } from 'vitest'
import { extrapolatePayments } from '../../src/hooks/useExtrapolate'

// Helper to normalize dates (ignore timezone differences)
function formatDate(date: string): string {
  return date.replace('T', '').slice(0, 10)
}

describe('extrapolatePayments', () => {
  it('returns correct payments for weekly cycle', () => {
    const result = extrapolatePayments('2026-01-01', 7, 4, 50)

    expect(result.projected_payments.length).toBe(4)
    expect(formatDate(result.projected_payments[0].date)).toBe('2026-01-01')
    expect(formatDate(result.projected_payments[3].date)).toBe('2026-01-29')
    expect(result.projected_payments.every((p) => p.amount === 50)).toBe(true)
  })

  it('returns correct payments for monthly cycle', () => {
    const result = extrapolatePayments('2026-02-01', 30, 3, 100)

    expect(result.projected_payments.length).toBe(3)
    expect(formatDate(result.projected_payments[0].date)).toBe('2026-02-01')
    expect(formatDate(result.projected_payments[2].date)).toBe('2026-03-03')
  })

  it('returns correct payments for fortnightly cycle', () => {
    const result = extrapolatePayments('2026-04-15', 14, 2, 75)

    expect(result.projected_payments.length).toBe(2)
    expect(formatDate(result.projected_payments[1].date)).toBe('2026-05-01')
  })

  it('returns correct last_date', () => {
    const result = extrapolatePayments('2026-01-01', 7, 3, 50)

    expect(result.last_date).toBe('2026-01-29')
    expect(formatDate(result.last_date)).toBe('2026-01-29')
  })

  it('handles zero count', () => {
    const result = extrapolatePayments('2026-01-01', 7, 0, 50)

    expect(result.projected_payments.length).toBe(0)
    // last_date should be the first date when no payments exist
    expect(formatDate(result.last_date)).toBe('2026-01-01')
  })

  it('handles large cycle days', () => {
    const result = extrapolatePayments('2026-01-01', 365, 2, 1000)

    expect(result.projected_payments.length).toBe(2)
    // Should span almost a year
    const first = new Date(formatDate(result.projected_payments[0].date))
    const last = new Date(formatDate(result.projected_payments[1].date))
    const diffDays = Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBeCloseTo(365, -1) // Allow one day difference
  })
})
