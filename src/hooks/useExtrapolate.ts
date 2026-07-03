import { addDays, format } from 'date-fns'
import type { ProjectedPayment } from '../db/types'

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

  return {
    projected_payments: payments,
    last_date: payments.length > 0 ? payments[payments.length - 1].date : firstDate,
  }
}
