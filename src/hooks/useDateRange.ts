import { useState } from 'react'
import { startOfWeek, addWeeks } from 'date-fns'

export function useDateRange() {
  const today = new Date()
  const defaultStart = startOfWeek(today, { weekStartsOn: 1 })
  const defaultEnd = addWeeks(defaultStart, 4)

  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)

  return { startDate, endDate, setStartDate, setEndDate }
}
