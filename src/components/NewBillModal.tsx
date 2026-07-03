import { addYears, format } from 'date-fns'
import { useState, type FormEvent } from 'react'
import db from '../db/schema'
import type { Bill } from '../db/types'
import { extrapolatePayments } from '../hooks/useExtrapolate'

const CATEGORIES = [
  'Fixed Expenses', 'Subscriptions', 'Insurance and Loans', 'Utilities',
  'Internet & Mobile', 'Gym Membership', 'Health & Beauty', 'Health & Medical',
  'Transportation', 'Children & Education', 'Clothing', 'Credit & Loans',
]

const FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly', 'Daily', 'Custom']

const FREQUENCY_CYCLE: Record<string, number> = {
  Weekly: 7,
  Fortnightly: 14,
  Monthly: 30,
  Daily: 1,
}

function computeCount(firstDate: string, projectUntil: string, cycleDays: number): number {
  const start = new Date(firstDate)
  const end = new Date(projectUntil)
  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  return Math.max(1, Math.ceil(diffDays / cycleDays) + 1)
}

function defaultProjectUntil(firstDate: string): string {
  return format(addYears(new Date(firstDate), 1), 'yyyy-MM-dd')
}

interface NewBillModalProps {
  onClose: () => void
}

export default function NewBillModal({ onClose }: NewBillModalProps) {
  const [displayName, setDisplayName] = useState('')
  const [merchant, setMerchant] = useState('')
  const [owner, setOwner] = useState('Tola')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [frequency, setFrequency] = useState(FREQUENCIES[0])
  const [cycleDays, setCycleDays] = useState(7)
  const [firstDate, setFirstDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [projectUntil, setProjectUntil] = useState(defaultProjectUntil(format(new Date(), 'yyyy-MM-dd')))
  const [amount, setAmount] = useState(0)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!merchant.trim()) return
    setSaving(true)

    const count = computeCount(firstDate, projectUntil, cycleDays)
    const absAmount = Math.abs(amount)
    const { projected_payments, last_date } = extrapolatePayments(firstDate, cycleDays, count, absAmount)

    const bill: Bill = {
      displayName: displayName.trim() || undefined,
      merchant: merchant.trim(),
      owner,
      category,
      frequency,
      cycle_days: cycleDays,
      first_date: firstDate,
      last_date,
      count,
      avg_amount: absAmount,
      variance: 0,
      projected_payments,
    }

    await db.bills.add(bill)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-surface-1 rounded-t-2xl sm:rounded-2xl p-6 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-on-surface">New Bill</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-on-surface min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted font-medium">Display name (optional)</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Rent"
              className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px] [color-scheme:dark]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted font-medium">Merchant *</span>
            <input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="MERCHANT NAME"
              className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px] [color-scheme:dark]"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-xs text-muted font-medium">Owner</span>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px]"
              >
                <option value="Tomi">Tomi</option>
                <option value="Tola">Tola</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-xs text-muted font-medium">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px]"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div className="flex gap-3">
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-xs text-muted font-medium">Frequency</span>
              <select
                value={frequency}
                onChange={(e) => {
                  const f = e.target.value
                  setFrequency(f)
                  if (f !== 'Custom') setCycleDays(FREQUENCY_CYCLE[f])
                }}
                className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px]"
              >
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-xs text-muted font-medium">Cycle Days</span>
              <input
                type="number"
                min={1}
                value={cycleDays}
                onChange={(e) => setCycleDays(Number(e.target.value))}
                className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px] [color-scheme:dark]"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted font-medium">First Date</span>
            <input
              type="date"
              value={firstDate}
              onChange={(e) => setFirstDate(e.target.value)}
              className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px] [color-scheme:dark]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted font-medium">Project Until</span>
            <input
              type="date"
              value={projectUntil}
              onChange={(e) => setProjectUntil(e.target.value)}
              className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px] [color-scheme:dark]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted font-medium">Amount</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px] [color-scheme:dark]"
            />
          </label>

          <button
            type="submit"
            disabled={saving || !merchant.trim()}
            className="w-full bg-accent text-surface font-semibold rounded-lg py-3 min-h-[44px] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Bill'}
          </button>
        </form>
      </div>
    </div>
  )
}
