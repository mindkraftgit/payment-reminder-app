export interface ProjectedPayment {
  date: string
  amount: number
}

export interface Bill {
  id?: number
  merchant: string
  category: string
  frequency: string
  cycle_days: number
  count: number
  first_date: string
  last_date: string
  avg_amount: number
  variance: number
  projected_payments: ProjectedPayment[]
  owner: string
  displayName?: string
  sheetRow?: number
  exact_date?: number
  iconUrl?: string
  iconDataUri?: string
}

export interface PaySchedule {
  owner: string
  frequency: 'Fortnightly' | 'TwiceMonthly'
  dayOfWeek?: number
  firstPayDate?: string
  firstDay?: number
  secondDay?: number
}
