import Dexie, { type EntityTable } from 'dexie'
import type { Bill, PaySchedule } from './types'

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

const SEED_BILLS: Bill[] = [
  { merchant: 'RENT', category: 'Fixed Expenses', frequency: 'Weekly', cycle_days: 7, count: 0, first_date: '2026-01-09', last_date: '', avg_amount: 1050, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'MEMBERSHIP MSL CACI W174889', category: 'Health & Beauty', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-05', last_date: '', avg_amount: 256.04, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'POWERSHOP', category: 'Utilities', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-07', last_date: '', avg_amount: 225.88, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'PARTNERS LIFE', category: 'Insurance and Loans', frequency: 'Fortnightly', cycle_days: 14, count: 0, first_date: '2026-01-12', last_date: '', avg_amount: 195.03, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'SPARK NZ TRADING-TOMI', category: 'Internet & Mobile', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-05', last_date: '', avg_amount: 185.99, variance: 0, projected_payments: [], owner: 'Tomi' },
  { merchant: 'HIGH PERFORMANCE', category: 'Gym Membership', frequency: 'Fortnightly', cycle_days: 14, count: 0, first_date: '2026-01-07', last_date: '', avg_amount: 131.15, variance: 0, projected_payments: [], owner: 'Tomi' },
  { merchant: 'AA INSURANCE-TOLA', category: 'Insurance and Loans', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-31', last_date: '', avg_amount: 112.35, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'SPARK NZ TRADING-TOLA', category: 'Internet & Mobile', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-20', last_date: '', avg_amount: 102.13, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'AA INSURANCE-TOMI', category: 'Insurance and Loans', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-28', last_date: '', avg_amount: 83.66, variance: 0, projected_payments: [], owner: 'Tomi' },
  { merchant: 'SWIM LESSONS', category: 'Children & Education', frequency: 'Fortnightly', cycle_days: 14, count: 0, first_date: '2026-01-18', last_date: '', avg_amount: 81, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'Baycorp TFR TO Baycorp-860961', category: 'Insurance and Loans', frequency: 'Weekly', cycle_days: 7, count: 0, first_date: '2026-01-05', last_date: '', avg_amount: 50, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'Baycorp TFR TO Baycorp-881244', category: 'Insurance and Loans', frequency: 'Weekly', cycle_days: 7, count: 0, first_date: '2026-01-05', last_date: '', avg_amount: 50, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'APPLE.COM/BILL-CLAUDEANTROPIC', category: 'Subscriptions', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-02-22', last_date: '', avg_amount: 40, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'OPENAI CHATGPT', category: 'Subscriptions', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-04', last_date: '', avg_amount: 35, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'SPOTIFY', category: 'Subscriptions', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-19', last_date: '', avg_amount: 29.99, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'HIGH PERFORMANCE-TOLA', category: 'Gym Membership', frequency: 'Weekly', cycle_days: 7, count: 0, first_date: '2026-05-19', last_date: '', avg_amount: 26.15, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'MICROSOFT*MICROSOFT 365', category: 'Subscriptions', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-04-04', last_date: '', avg_amount: 23, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'GOOGLE YOUTUBEPREMIUM', category: 'Subscriptions', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-23', last_date: '', avg_amount: 22.99, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'RHODES PHYSIOTHERAPY', category: 'Health & Medical', frequency: 'Weekly', cycle_days: 7, count: 0, first_date: '2026-02-20', last_date: '', avg_amount: 20.4, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'APPLE.COM/BILL-READINGEGGS', category: 'Subscriptions', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-15', last_date: '', avg_amount: 19.99, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'APPLE.COM/BILL-ICLOUDSUBSCRIPTION', category: 'Subscriptions', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-31', last_date: '', avg_amount: 16.99, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'SECURE PARKING', category: 'Transportation', frequency: 'Daily', cycle_days: 1, count: 0, first_date: '2026-02-11', last_date: '', avg_amount: 16, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'AUCKLAND TRANSPORT', category: 'Transportation', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-27', last_date: '', avg_amount: 13.5, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'CRUNCHYROLL.COM', category: 'Subscriptions', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-16', last_date: '', avg_amount: 12.99, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'PARKMATE', category: 'Transportation', frequency: 'Weekly', cycle_days: 7, count: 0, first_date: '2026-03-22', last_date: '', avg_amount: 10, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'PLAYSTATION-PLUS', category: 'Subscriptions', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-02-04', last_date: '', avg_amount: 8.17, variance: 0, projected_payments: [], owner: 'Tomi' },
  { merchant: 'LIME & FLAMINGO', category: 'Clothing', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-01-29', last_date: '', avg_amount: 6.41, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: 'Afterpay', category: 'Credit & Loans', frequency: 'Weekly', cycle_days: 7, count: 0, first_date: '2026-05-10', last_date: '', avg_amount: 223, variance: 0, projected_payments: [], owner: 'Tola' },
  { merchant: '*ACC', category: 'Insurance and Loans', frequency: 'Monthly', cycle_days: 30, count: 0, first_date: '2026-07-11', last_date: '', avg_amount: 335, variance: 0, projected_payments: [], owner: 'Tola' },
]

const DEFAULT_SCHEDULES: PaySchedule[] = [
  { owner: 'Tola', frequency: 'Fortnightly', dayOfWeek: 2, firstPayDate: '2026-07-07' },
  { owner: 'Tomi', frequency: 'TwiceMonthly', firstDay: 15, secondDay: -1 },
]

let seeding = false

export async function seedDatabase(): Promise<void> {
  if (seeding) return
  seeding = true
  const billCount = await db.bills.count()
  if (billCount === 0) {
    await db.bills.bulkAdd(SEED_BILLS)
  }
  const scheduleCount = await db.paySchedules.count()
  if (scheduleCount === 0) {
    await db.paySchedules.bulkAdd(DEFAULT_SCHEDULES)
  }
  seeding = false
}

export default db
