import { useMemo, useState } from 'react'
import { startOfWeek, format, startOfToday } from 'date-fns'
import type { Bill, PaySchedule, ProjectedPayment } from '../db/types'
import { getValidatedPayments } from '../utils'
import PaymentCard from './PaymentCard'

interface PaymentListProps {
  bills: Bill[]
  startDate: Date
  endDate: Date
  onEditBill: (bill: Bill) => void
  hidePast?: boolean
  adjustWeekends?: boolean
  schedules?: PaySchedule[]
  showRedZone?: boolean
}

interface FlatPayment {
  bill: Bill
  payment: ProjectedPayment
}

function isInRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  return d >= start && d <= end
}

const WEEKS_PER_PAGE = 2

export default function PaymentList({ bills, startDate, endDate, onEditBill, hidePast, adjustWeekends, schedules, showRedZone }: PaymentListProps) {
  const [visibleWeeks, setVisibleWeeks] = useState(WEEKS_PER_PAGE)

  const weeks = useMemo(() => {
    const today = hidePast ? startOfToday() : new Date(0)
    const effectiveStart = today > startDate ? today : startDate

    const seen = new Set<string>()
    const flat: FlatPayment[] = []
    for (const bill of bills) {
      const payments = getValidatedPayments(
        bill.first_date,
        bill.cycle_days,
        bill.avg_amount,
        adjustWeekends,
        bill.exact_date,
      )
      for (const p of payments) {
        const key = `${bill.merchant}|${bill.owner}|${p.date}`
        if (seen.has(key)) continue
        seen.add(key)
        if (isInRange(p.date, effectiveStart, endDate)) {
          flat.push({ bill, payment: p })
        }
      }
    }

    flat.sort((a, b) => a.payment.date.localeCompare(b.payment.date))

    const weekMap = new Map<string, FlatPayment[]>()
    for (const item of flat) {
      const d = new Date(item.payment.date + 'T00:00:00')
      const weekStart = startOfWeek(d, { weekStartsOn: 1 })
      const key = weekStart.getTime().toString()
      if (!weekMap.has(key)) weekMap.set(key, [])
      weekMap.get(key)!.push(item)
    }

    return Array.from(weekMap.entries())
      .map(([key, items]) => ({ weekStart: new Date(Number(key)), items }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
  }, [bills, startDate, endDate, hidePast, adjustWeekends])

  const visible = weeks.slice(0, visibleWeeks)
  const hasMore = visibleWeeks < weeks.length

  if (weeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <p className="text-sm font-medium">No payments in this period</p>
        <p className="text-xs mt-1">Try adjusting the date range or owner filter</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {visible.map(({ weekStart, items }) => (
        <div key={weekStart.getTime()}>
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Week of {format(weekStart, 'MMM d, yyyy')}
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <PaymentCard
                key={`${item.bill.id}-${item.payment.date}`}
                bill={item.bill}
                paymentDate={item.payment.date}
                amount={item.payment.amount}
                onClick={() => onEditBill(item.bill)}
                schedules={schedules}
                showRedZone={showRedZone}
              />
            ))}
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          onClick={() => setVisibleWeeks((v) => v + WEEKS_PER_PAGE)}
          className="w-full bg-surface-1 border border-surface-2 rounded-xl py-3 text-sm text-accent font-medium min-h-[44px] hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          More
        </button>
      )}
    </div>
  )
}
