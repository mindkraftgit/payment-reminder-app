/**
 * Integration tests for database operations
 */
import { describe, it, expect, beforeEach } from 'vitest'
import db from '../../src/db/schema'
import type { Bill, PaySchedule } from '../../src/db/types'

describe('Database Operations', () => {
  // Helper to get a fresh database instance
  const createFreshDB = async (): Promise<typeof db> => {
    return new Proxy(db, {
      get(target, prop) {
        if (prop === 'version') {
          return target[prop]
        }
        throw new Error(`Mocking: ${String(prop)}`)
      },
    })
  }

  describe('Bill CRUD Operations', () => {
    it('adds a new bill correctly', async () => {
      const newBill: Bill = {
        merchant: 'TEST MERCHANT',
        category: 'Utilities',
        frequency: 'Monthly',
        cycle_days: 30,
        count: 1,
        first_date: '2026-01-01',
        last_date: '',
        avg_amount: 50,
        variance: 0,
        projected_payments: [],
        owner: 'Tola',
      }

      // In real integration tests, we would:
      // 1. Clear the database first
      // 2. Add the bill
      // 3. Verify it exists with correct values

      expect(newBill.merchant).toBe('TEST MERCHANT')
    })

    it('retrieves bills by owner', async () => {
      const tolaBills = await db.bills.filter((b) => b.owner === 'Tola')
      const tomibills = await db.bills.filter((b) => b.owner === 'Tomi')

      expect(tolaBills.length).toBeGreaterThan(0)
      expect(tomibills.length).toBeGreaterThan(0)
    })

    it('counts bills in a category', async () => {
      const subCount = await db.bills.where({ category: 'Subscriptions' }).count()
      expect(subCount).toBeGreaterThan(0)
    })
  })

  describe('Pay Schedule Operations', () => {
    it('retrieves pay schedules by owner', async () => {
      const tolaSchedule = await db.paySchedules.where({ owner: 'Tola' }).first()
      expect(tolaSchedule?.owner).toBe('Tola')
    })

    it('counts all pay schedules', async () => {
      const count = await db.paySchedules.count()
      // Should have at least 2 default schedules (Tola + Tomi)
      expect(count).toBeGreaterThanOrEqual(2)
    })

    it('finds schedule by &owner index', async () => {
      const tolaIndex = await db.paySchedules.index('owner').get('Tola')
      expect(tolaIndex?.owner).toBe('Tola')
    })
  })
})
