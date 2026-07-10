import Dexie, { type EntityTable } from 'dexie'
import type { Bill, PaySchedule } from './types'
import { fetchBillsFromSheets } from '../utils/googleSheets'

const db = new Dexie('PaymentReminderDB') as Dexie & {
  bills: EntityTable<Bill, 'id'>
  paySchedules: EntityTable<PaySchedule, 'owner'>
}

db.version(1).stores({
  bills: '++id, merchant, owner',
})

db.version(2).stores({
  bills: '++id, merchant, owner',
  paySchedules: '++id, &owner',
})

db.version(3).stores({
  bills: '++id, merchant, owner',
  paySchedules: '&owner',
})

db.version(4).stores({
  bills: '++id, merchant, owner',
  paySchedules: '&owner',
})

const DEFAULT_SCHEDULES: PaySchedule[] = [
  { owner: 'Tola', frequency: 'Fortnightly', dayOfWeek: 2, firstPayDate: '2026-07-07' },
  { owner: 'Tomi', frequency: 'TwiceMonthly', firstDay: 15, secondDay: -1 },
]

let seeding = false

export async function seedDatabase(): Promise<void> {
  if (seeding) return
  seeding = true

  try {
    const billCount = await db.bills.count()
    if (billCount === 0) {
      const bills = await fetchBillsFromSheets()
      if (bills.length > 0) {
        await db.bills.bulkAdd(bills)
      }
    }
  } catch (error) {
    console.error('Failed to seed bills from Google Sheets:', error)
  }

  try {
    const scheduleCount = await db.paySchedules.count()
    if (scheduleCount === 0) {
      await db.paySchedules.bulkAdd(DEFAULT_SCHEDULES)
    }
  } catch (error) {
    console.error('Failed to seed schedules:', error)
  }

  seeding = false
}

export async function refreshFromSheets(): Promise<void> {
  try {
    const existing = await db.bills.toArray()
    const iconMap = new Map<string, string>()
    for (const bill of existing) {
      if (bill.iconDataUri) {
        iconMap.set(`${bill.merchant}|${bill.owner}`, bill.iconDataUri)
      }
    }

    await db.bills.clear()
    const bills = await fetchBillsFromSheets()
    if (bills.length > 0) {
      await db.bills.bulkAdd(bills)
    }

    for (const bill of await db.bills.toArray()) {
      const key = `${bill.merchant}|${bill.owner}`
      const dataUri = iconMap.get(key)
      if (dataUri && !bill.iconDataUri) {
        await db.bills.update(bill.id!, { iconDataUri: dataUri })
      }
    }
  } catch (error) {
    console.error('Failed to refresh from Google Sheets:', error)
    throw error
  }
}

export default db
