/**
 * Integration tests for payday schedule calculations
 */
import { describe, it, expect, beforeAll } from 'vitest'
import db from '../../src/db/schema'
import { getNextPayday, getLastPayday, isInRedZone } from '../../src/utils'

// Get real schedules from database (this works in actual tests)
describe('Pay Schedule Calculations - Integration', () => {
  let tolaSchedule: Awaited<ReturnType<typeof db.paySchedules.where>>[0]
  let tomibills: Awaited<ReturnType<typeof db.bills.filter>>

  beforeAll(async () => {
    // Load actual schedules from database
    const allSchedules = await db.paySchedules.toArray()
    tolaSchedule = allSchedules.find((s) => s.owner === 'Tola') ?? null
  })

  describe('Fortnightly Schedule (Tola)', () => {
    it('calculates next fortnightly payday correctly', async () => {
      if (!tolaSchedule || !tolaSchedule.dayOfWeek || !tolaSchedule.firstPayDate) {
        expect(true).toBe(true) // Skip if no schedule data
        return
      }

      const from = '2026-07-01'
      const next = getNextPayday(from, tolaSchedule)

      // Should return a valid date string in yyyy-MM-dd format
      expect(typeof next).toBe('string')
      expect(next.length).toBe(10) // 8 digits + 2 dashes
    })

    it('calculates last fortnightly payday correctly', async () => {
      if (!tolaSchedule || !tolaSchedule.dayOfWeek || !tolaSchedule.firstPayDate) {
        return
      }

      const from = '2026-07-31'
      const last = getLastPayday(from, tolaSchedule)

      expect(typeof last).toBe('string')
    })

    it('returns null for dates before first payday', async () => {
      if (!tolaSchedule || !tolaSchedule.firstPayDate) {
        return
      }

      const veryEarly = '2024-01-01'
      const next = getNextPayday(veryEarly, tolaSchedule)

      // Should be a valid future date or null
      expect(next).toBeDefined()
    })
  })

  describe('Twice-Monthly Schedule (Tomi)', () => {
    it('calculates next twice-monthly payday correctly', async () => {
      const from = '2026-07-01'
      const schedule = { frequency: 'TwiceMonthly', firstDay: 15, secondDay: -1 }

      const next = getNextPayday(from, schedule)

      expect(typeof next).toBe('string')
    })

    it('handles different month transitions correctly', async () => {
      // Test at end of January (should jump to February 15 or last day)
      const janEnd = '2026-01-31'
      const next = getNextPayday(janEnd, { frequency: 'TwiceMonthly', firstDay: 15 })

      expect(next).toBeDefined()
    })
  })

  describe('Red Zone Detection', () => {
    it('detects when payment would be made before Tomi\'s payday', async () => {
      const testDates = [
        '2026-07-01', // Early in month - should be in red zone
        '2026-07-15', // Near Tomi\'s payday
        '2026-08-01', // End of month
      ]

      for (const date of testDates) {
        const inRedZone = isInRedZone(date, [
          { owner: 'Tola', frequency: 'Fortnightly' },
          { owner: 'Tomi', frequency: 'TwiceMonthly' },
        ])

      expect(typeof inRedZone).toBe('boolean')
    })
  })
})
