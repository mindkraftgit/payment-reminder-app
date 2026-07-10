import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import type { Bill } from '../db/types'
import { prettyName } from '../utils'

interface PaydaySummaryProps {
  tolaNextPayday: string | null
  tomiNextPayday: string | null
  tolaRedZone: { isRed: boolean; daysUntil: number }
  tomiRedZone: { isRed: boolean; daysUntil: number }
  tolaBills: Bill[]
  tomiBills: Bill[]
}

function formatPayday(dateStr: string | null): string {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'EEE, MMM d, yyyy')
}

function OwnerSection({
  owner,
  nextPayday,
  redZone,
  bills,
}: {
  owner: string
  nextPayday: string | null
  redZone: { isRed: boolean; daysUntil: number }
  bills: Bill[]
}) {
  const upcomingBills = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return bills
      .flatMap((bill) =>
        bill.projected_payments
          .filter((p) => p.date >= today)
          .map((p) => ({ bill, payment: p })),
      )
      .sort((a, b) => a.payment.date.localeCompare(b.payment.date))
      .slice(0, 5)
  }, [bills])

  return (
    <div className="bg-surface-1 border border-surface-2 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-2">
        <h3 className="text-sm font-bold">{owner}</h3>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div>
          <div className="text-xs text-muted mb-0.5">Next Payday</div>
          <div className="text-sm font-semibold text-on-surface">
            {formatPayday(nextPayday)}
          </div>
        </div>

        {redZone.isRed && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
            <span className="text-xs font-medium text-amber-400">
              Red Zone — {redZone.daysUntil} day{redZone.daysUntil !== 1 ? 's' : ''} until next payday
            </span>
          </div>
        )}

        {upcomingBills.length > 0 && (
          <div>
            <div className="text-xs text-muted mb-2">Upcoming Bills</div>
            <div className="space-y-1.5">
                {upcomingBills.map(({ bill, payment }) => (
                <div
                  key={`${bill.id}-${payment.date}`}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-on-surface truncate">
                    {bill.displayName || prettyName(bill.merchant)}
                  </span>
                  <span className="text-muted ml-2 shrink-0">
                    {format(parseISO(payment.date), 'MMM d')} · ${payment.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaydaySummary({
  tolaNextPayday,
  tomiNextPayday,
  tolaRedZone,
  tomiRedZone,
  tolaBills,
  tomiBills,
}: PaydaySummaryProps) {
  return (
    <div className="space-y-4">
      <OwnerSection
        owner="Tola"
        nextPayday={tolaNextPayday}
        redZone={tolaRedZone}
        bills={tolaBills}
      />
      <OwnerSection
        owner="Tomi"
        nextPayday={tomiNextPayday}
        redZone={tomiRedZone}
        bills={tomiBills}
      />
    </div>
  )
}
