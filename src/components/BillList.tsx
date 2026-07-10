import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import type { Bill } from '../db/types'
import { prettyName } from '../utils'

interface BillListProps {
  bills: Bill[]
  onEdit: (bill: Bill) => void
  projectUntil: string
}

export default function BillList({ bills, onEdit }: BillListProps) {
  const sortedBills = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return [...bills]
      .map((bill) => {
        const nextPayment = bill.projected_payments.find((p) => p.date >= today)
        return { bill, nextPayment }
      })
      .sort((a, b) => {
        if (!a.nextPayment) return 1
        if (!b.nextPayment) return -1
        return a.nextPayment.date.localeCompare(b.nextPayment.date)
      })
  }, [bills])

  if (sortedBills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <p className="text-sm font-medium">No bills found</p>
        <p className="text-xs mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sortedBills.map(({ bill, nextPayment }) => (
        <div
          key={bill.id}
          onClick={() => onEdit(bill)}
          className="bg-surface-1 border border-surface-2 rounded-xl p-4 cursor-pointer hover:bg-surface-2 transition-colors active:bg-surface-2 min-h-[44px]"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-on-surface truncate">
                {bill.displayName || prettyName(bill.merchant)}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted">
                <span>{bill.frequency}</span>
                <span className="text-muted/30">|</span>
                <span>{bill.category}</span>
                <span className="text-muted/30">|</span>
                <span>{bill.owner}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              {nextPayment && (
                <div className="text-sm font-bold text-accent">
                  ${nextPayment.amount.toFixed(2)}
                </div>
              )}
              {nextPayment && (
                <div className="text-xs text-muted mt-0.5">
                  {format(parseISO(nextPayment.date), 'EEE, MMM d')}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
