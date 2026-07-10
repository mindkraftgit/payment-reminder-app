import { useMemo } from 'react'
import { addDays, format } from 'date-fns'
import type { Bill, ProjectedPayment } from '../db/types'

export function extrapolatePayments(
  firstDate: string,
  cycleDays: number,
  count: number,
  avgAmount: number,
): { projected_payments: ProjectedPayment[]; last_date: string } {
  const payments: ProjectedPayment[] = []
  let d = new Date(firstDate)

  for (let i = 0; i < count; i++) {
    payments.push({ date: format(d, 'yyyy-MM-dd'), amount: avgAmount })
    d = addDays(d, cycleDays)
  }

  const last_date =
    payments.length > 0
      ? payments[payments.length - 1].date
      : firstDate

  return { projected_payments: payments, last_date }
}

export function useExtrapolate(bills: Bill[], projectUntil: string): Bill[] {
  return useMemo(() => {
    return bills.map((bill) => {
      const cycleDays = bill.cycle_days || 30
      const count = bill.count || 0
      const avgAmount = bill.avg_amount || 0
      const { projected_payments, last_date } = extrapolatePayments(
        bill.first_date,
        cycleDays,
        count,
        avgAmount,
      )
      return { ...bill, projected_payments, last_date }
    })
  }, [bills, projectUntil])
}
