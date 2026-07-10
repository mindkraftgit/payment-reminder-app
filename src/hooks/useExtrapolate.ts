import { useMemo } from 'react'
import { addDays, format } from 'date-fns'
import type { Bill, ProjectedPayment } from '../db/types'

function extrapolatePayments(
  firstDate: string,
  cycleDays: number,
  count: number,
  avgAmount: number,
): ProjectedPayment[] {
  const payments: ProjectedPayment[] = []
  let d = new Date(firstDate)

  for (let i = 0; i < count; i++) {
    payments.push({ date: format(d, 'yyyy-MM-dd'), amount: avgAmount })
    d = addDays(d, cycleDays)
  }

  return payments
}

export function useExtrapolate(bills: Bill[], projectUntil: string): Bill[] {
  return useMemo(() => {
    return bills.map((bill) => {
      const cycleDays = bill.cycle_days || 30
      const count = bill.count || 0
      const avgAmount = bill.avg_amount || 0
      const projected_payments = extrapolatePayments(
        bill.first_date,
        cycleDays,
        count,
        avgAmount,
      )
      const last_date =
        projected_payments.length > 0
          ? projected_payments[projected_payments.length - 1].date
          : bill.last_date
      return { ...bill, projected_payments, last_date }
    })
  }, [bills, projectUntil])
}
