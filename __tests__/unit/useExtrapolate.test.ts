/**
 * Unit tests for extrapolatePayments
 */
import { describe, it, expect } from 'vitest'
import { extrapolatePayments } from '../../src/hooks/useExtrapolate'

function formatDate(date: string): string {
  return date.replace('T', '').slice(0, 10)
}

describe('extrapolatePayments', () => {
  it('returns correct payments for weekly cycle', () => {
    const result = extrapolatePayments('2026-01-01', 7, 4, 50)

    expect(result.projected_payments.length).toBe(4)
    expect(result.projected_payments[0].date).toBe('2026-01-01')
    expect(result.projected_payments[1].date).toBe('2026-01-08')
    expect(result.projected_payments[2].date).toBe('2026-01-15')
    expect(result.projected_payments[3].date).toBe('2026-01-22')
    expect(result.projected_payments.every((p) => p.amount === 50)).toBe(true)
  })

  it('returns correct payments for monthly cycle', () => {
    const result = extrapolatePayments('2026-02-01', 30, 3, 100)

    expect(result.projected_payments.length).toBe(3)
    expect(result.projected_payments[0].date).toBe('2026-02-01')
    expect(result.projected_payments[1].date).toBe('2026-03-03')
    expect(result.projected_payments[2].date).toBe('2026-04-02')
  })

  it('returns correct payments for fortnightly cycle', () => {
    const result = extrapolatePayments('2026-04-15', 14, 2, 75)

    expect(result.projected_payments.length).toBe(2)
    expect(result.projected_payments[0].date).toBe('2026-04-15')
    expect(result.projected_payments[1].date).toBe('2026-04-29')
  })

  it('returns correct last_date', () => {
    const result = extrapolatePayments('2026-01-01', 7, 3, 50)

    expect(result.last_date).toBe('2026-01-15')
  })

  it('handles zero count', () => {
    const result = extrapolatePayments('2026-01-01', 7, 0, 50)

    expect(result.projected_payments.length).toBe(0)
    expect(result.last_date).toBe('2026-01-01')
  })

  it('handles large cycle days', () => {
    const result = extrapolatePayments('2026-01-01', 365, 2, 1000)

    expect(result.projected_payments.length).toBe(2)
    expect(result.projected_payments[0].date).toBe('2026-01-01')
    expect(result.projected_payments[1].date).toBe('2027-01-01')
  })
})
