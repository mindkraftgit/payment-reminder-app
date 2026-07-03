import { format, parseISO, isSameDay } from 'date-fns'
import type { Bill, PaySchedule } from '../db/types'
import { prettyName, isInRedZone } from '../utils'

interface PaymentCardProps {
  bill: Bill
  paymentDate: string
  amount: number
  onClick: () => void
  schedules?: PaySchedule[]
  showRedZone?: boolean
}

function FrequencyIcon({ freq }: { freq: string }) {
  if (freq === 'Weekly') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  }
  if (freq === 'Fortnightly') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="12" y1="14" x2="12" y2="18" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function PaymentCard({ bill, paymentDate, amount, onClick, schedules, showRedZone }: PaymentCardProps) {
  const dayName = format(parseISO(paymentDate), 'EEE').toUpperCase()
  const formattedDate = `${dayName} / ${format(parseISO(paymentDate), 'do MMMM yyyy')}`
  const isDueToday = isSameDay(parseISO(paymentDate), new Date())
  const inRedZone = showRedZone && schedules ? isInRedZone(paymentDate, schedules) : false

  return (
    <button
      onClick={onClick}
      className={`w-full border rounded-xl p-4 text-left transition-colors active:bg-surface-2 min-h-[44px] ${
        isDueToday
          ? 'bg-accent/8 border-accent/20 hover:bg-accent/12'
          : inRedZone
            ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
            : 'bg-surface-1 border-surface-2 hover:bg-surface-2'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-on-surface truncate flex-1 min-w-0">
          {bill.displayName || prettyName(bill.merchant)}
        </h3>
        <span className="text-base font-bold text-accent whitespace-nowrap">
          ${amount.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted flex-wrap">
        <span className="font-medium text-on-surface/80">{formattedDate}</span>
        <span className="text-muted/30">|</span>
        <span className="flex items-center gap-1">
          <FrequencyIcon freq={bill.frequency} />
          {bill.frequency}
        </span>
        <span className="text-muted/30">|</span>
        <span>{bill.category}</span>
        <span className="text-muted/30">|</span>
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {bill.owner}
        </span>
      </div>
    </button>
  )
}
