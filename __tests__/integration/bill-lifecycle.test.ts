/**
 * Integration tests for full bill lifecycle
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import db from '../../src/db/schema'
import type { Bill } from '../../src/db/types'

const createTestBill = (): Bill => ({
  merchant: 'TEST BILL',
  category: 'Subscriptions',
  frequency: 'Monthly',
  cycle_days: 30,
  count: 1,
  first_date: '2026-07-05',
  last_date: '',
  avg_amount: 9.99,
  variance: 0,
  projected_payments: [],
  owner: 'Tola',
  displayName: 'Test Subscription',
})

describe('Bill Lifecycle - Full CRUD', () => {
  beforeAll(async () => {
    await db.bills.clear()
  })

  afterAll(async () => {
    await db.bills.clear()
  })

  describe('Add Bill', () => {
    it('can add a new bill with all required fields', async () => {
      const bill = createTestBill()
      const id = await db.bills.add(bill)
      expect(id).toBeDefined()

      const saved = await db.bills.get(id)
      expect(saved?.merchant).toBe('TEST BILL')
      expect(saved?.owner).toBe('Tola')
    })
  })

  describe('Edit Bill', () => {
    it('can update merchant name', async () => {
      const bill = createTestBill()
      const id = await db.bills.add(bill)
      await db.bills.update(id!, { merchant: 'UPDATED BILL' })

      const updated = await db.bills.get(id!)
      expect(updated?.merchant).toBe('UPDATED BILL')
    })

    it('can update owner', async () => {
      const bill = createTestBill()
      const id = await db.bills.add(bill)
      await db.bills.update(id!, { owner: 'Tomi' })

      const updated = await db.bills.get(id!)
      expect(updated?.owner).toBe('Tomi')
    })

    it('can update category', async () => {
      const bill = createTestBill()
      const id = await db.bills.add(bill)
      await db.bills.update(id!, { category: 'Utilities' })

      const updated = await db.bills.get(id!)
      expect(updated?.category).toBe('Utilities')
    })
  })

  describe('Delete Bill', () => {
    it('can delete a bill after edit sequence', async () => {
      const bill = createTestBill()
      const id = await db.bills.add(bill)
      await db.bills.delete(id!)

      const deleted = await db.bills.get(id!)
      expect(deleted).toBeUndefined()
    })
  })

  describe('Edit Sequence - Complete Flow', () => {
    it('can add -> edit -> update -> save bill', async () => {
      const bill = createTestBill()
      const id = await db.bills.add(bill)

      await db.bills.update(id!, { merchant: 'RENAMED', avg_amount: 19.99 })

      const saved = await db.bills.get(id!)
      expect(saved?.merchant).toBe('RENAMED')
      expect(saved?.avg_amount).toBe(19.99)
    })

    it('can handle multiple edits on same bill', async () => {
      const bill = createTestBill()
      const id = await db.bills.add(bill)

      for (let i = 0; i < 5; i++) {
        await db.bills.update(id!, { avg_amount: i * 10 })
      }

      const final = await db.bills.get(id!)
      expect(final?.avg_amount).toBe(40)
    })
  })
})
