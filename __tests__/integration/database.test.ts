/**
 * Integration tests for database operations
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import db from '../../src/db/schema'
import type { Bill, PaySchedule } from '../../src/db/types'

describe('Database Operations', () => {
  beforeAll(async () => {
    await db.bills.clear()
    await db.paySchedules.clear()

    const testBills: Bill[] = [
      {
        merchant: 'RENT', category: 'Fixed Expenses', frequency: 'Weekly',
        cycle_days: 7, count: 0, first_date: '2026-01-09', last_date: '',
        avg_amount: 1050, variance: 0, projected_payments: [], owner: 'Tola',
      },
      {
        merchant: 'SPOTIFY', category: 'Subscriptions', frequency: 'Monthly',
        cycle_days: 30, count: 0, first_date: '2026-01-10', last_date: '',
        avg_amount: 16.99, variance: 0, projected_payments: [], owner: 'Tola',
      },
      {
        merchant: 'CRUNCHYROLL', category: 'Subscriptions', frequency: 'Monthly',
        cycle_days: 30, count: 0, first_date: '2026-01-15', last_date: '',
        avg_amount: 9.99, variance: 0, projected_payments: [], owner: 'Tomi',
      },
    ]
    await db.bills.bulkAdd(testBills)

    const testSchedules: PaySchedule[] = [
      { owner: 'Tola', frequency: 'Fortnightly', dayOfWeek: 2, firstPayDate: '2026-07-07' },
      { owner: 'Tomi', frequency: 'TwiceMonthly', firstDay: 15, secondDay: -1 },
    ]
    await db.paySchedules.bulkAdd(testSchedules)
  })

  afterAll(async () => {
    await db.bills.clear()
    await db.paySchedules.clear()
  })

  describe('Bill CRUD Operations', () => {
    it('adds a new bill correctly', async () => {
      const count = await db.bills.count()
      expect(count).toBe(3)
    })

    it('retrieves bills by owner', async () => {
      const tolaBills = await db.bills.where({ owner: 'Tola' }).toArray()
      const tomibills = await db.bills.where({ owner: 'Tomi' }).toArray()

      expect(tolaBills.length).toBe(2)
      expect(tomibills.length).toBe(1)
    })

    it('counts bills in a category', async () => {
      const allBills = await db.bills.toArray()
      const subCount = allBills.filter((b) => b.category === 'Subscriptions').length
      expect(subCount).toBe(2)
    })
  })

  describe('Pay Schedule Operations', () => {
    it('retrieves pay schedules by owner', async () => {
      const tolaSchedule = await db.paySchedules.where({ owner: 'Tola' }).first()
      expect(tolaSchedule?.owner).toBe('Tola')
      expect(tolaSchedule?.frequency).toBe('Fortnightly')
    })

    it('counts all pay schedules', async () => {
      const count = await db.paySchedules.count()
      expect(count).toBe(2)
    })

    it('finds schedule by owner', async () => {
      const tolaSchedule = await db.paySchedules.where({ owner: 'Tola' }).first()
      expect(tolaSchedule?.owner).toBe('Tola')
    })
  })
})
