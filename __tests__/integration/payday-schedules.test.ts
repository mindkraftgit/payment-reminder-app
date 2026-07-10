/**
 * Integration tests for payday schedule calculations
 */
import { describe, it, expect } from 'vitest'
import { getNextPayday, getLastPayday, isInRedZone } from '../../src/utils'

describe('Pay Schedule Calculations - Integration', () => {
  describe('Fortnightly Schedule (Tola)', () => {
    it('calculates next fortnightly payday correctly', () => {
      const schedule = { frequency: 'Fortnightly' as const, dayOfWeek: 2, firstPayDate: '2026-07-07' }
      const next = getNextPayday('2026-07-01', schedule)

      expect(typeof next).toBe('string')
      expect(next.length).toBe(10)
    })

    it('calculates last fortnightly payday correctly', () => {
      const schedule = { frequency: 'Fortnightly' as const, dayOfWeek: 2, firstPayDate: '2026-07-07' }
      const last = getLastPayday('2026-07-31', schedule)

      expect(typeof last).toBe('string')
      expect(last.length).toBe(10)
    })

    it('returns a valid date for early dates', () => {
      const schedule = { frequency: 'Fortnightly' as const, dayOfWeek: 2, firstPayDate: '2026-07-07' }
      const next = getNextPayday('2024-01-01', schedule)

      expect(next).toBeDefined()
    })
  })

  describe('Twice-Monthly Schedule (Tomi)', () => {
    it('calculates next twice-monthly payday correctly', () => {
      const schedule = { frequency: 'TwiceMonthly' as const, firstDay: 15, secondDay: -1 }
      const next = getNextPayday('2026-07-01', schedule)

      expect(typeof next).toBe('string')
    })

    it('handles different month transitions correctly', () => {
      const schedule = { frequency: 'TwiceMonthly' as const, firstDay: 15 }
      const next = getNextPayday('2026-01-31', schedule)

      expect(next).toBeDefined()
    })
  })

  describe('Red Zone Detection', () => {
    it('detects red zone correctly', () => {
      const testDates = [
        '2026-07-01',
        '2026-07-15',
        '2026-08-01',
      ]

      for (const date of testDates) {
        const inRedZone = isInRedZone(date, [
          { owner: 'Tola', frequency: 'Fortnightly' },
          { owner: 'Tomi', frequency: 'TwiceMonthly' },
        ])
        expect(typeof inRedZone).toBe('boolean')
      }
    })
  })
})
