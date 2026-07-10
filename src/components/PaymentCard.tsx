import { format, parseISO, isSameDay } from 'date-fns'
import type { Bill, PaySchedule } from '../db/types'
import { prettyName, isInRedZone } from '../utils'
import CategoryIcon from './CategoryIcon'

interface PaymentCardProps {
  bill: Bill
  paymentDate: string
  amount: number
  onClick: () => void
  schedules?: PaySchedule[]
  showRedZone?: boolean
  roundPayments?: boolean
}

export default function PaymentCard({ bill, paymentDate, amount, onClick, schedules, showRedZone, roundPayments }: PaymentCardProps) {
  const dayName = format(parseISO(paymentDate), 'EEE')
  const formattedDate = `${dayName} ${format(parseISO(paymentDate), 'do MMMM yyyy')}`
  const isDueToday = isSameDay(parseISO(paymentDate), new Date())
  const inRedZone = showRedZone && schedules ? isInRedZone(paymentDate, schedules) : false

  return (
    <button
      onClick={onClick}
      className={`w-full border rounded-xl px-4 py-2.5 text-left transition-colors active:bg-surface-2 min-h-[44px] ${
        isDueToday
          ? 'bg-accent/8 border-accent/20 hover:bg-accent/12'
          : inRedZone
            ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
            : 'bg-surface-1 border-surface-2 hover:bg-surface-2'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <CategoryIcon category={bill.category} iconUrl={bill.iconUrl} iconDataUri={bill.iconDataUri} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-on-surface truncate flex-1 min-w-0">
              {bill.displayName || prettyName(bill.merchant)}
            </h3>
            <span className="text-accent whitespace-nowrap leading-none">
              <span className="text-sm align-top relative top-0.5">$</span>
              <span className="text-3xl font-light">{roundPayments ? Math.ceil(amount) : amount.toFixed(2)}</span>
            </span>
          </div>
          <div className="flex flex-col gap-0.5 text-xs">
            <div className="flex items-center gap-1.5 text-muted">
              <span>{bill.frequency}</span>
              <span className="text-muted/30">|</span>
              <span>{bill.owner}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <span className="font-medium text-on-surface/80">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
