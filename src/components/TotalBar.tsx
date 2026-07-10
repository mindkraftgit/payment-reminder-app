import { useMemo } from 'react'
import type { Bill } from '../db/types'
import { getValidatedPayments } from '../utils'

interface TotalBarProps {
  bills: Bill[]
  startDate: Date
  endDate: Date
  onClose: () => void
  adjustWeekends?: boolean
}

function isInRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  return d >= start && d <= end
}

export default function TotalBar({ bills, startDate, endDate, onClose, adjustWeekends }: TotalBarProps) {
  const total = useMemo(() => {
    let sum = 0
    for (const bill of bills) {
      const payments = getValidatedPayments(
        bill.first_date,
        bill.cycle_days,
        bill.avg_amount,
        adjustWeekends,
        bill.exact_date,
      )
      for (const p of payments) {
        if (isInRange(p.date, startDate, endDate)) {
          sum += p.amount
        }
      }
    }
    return sum
  }, [bills, startDate, endDate, adjustWeekends])

  return (
    <div className="bg-surface-1 border border-surface-2 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
      <span className="text-sm text-muted font-medium flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        Total for period
      </span>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-accent">${total.toFixed(2)}</span>
        <button
          onClick={onClose}
          className="text-muted hover:text-on-surface min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close total"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
