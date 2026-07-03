import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/schema'
import type { Bill } from '../db/types'

export function useBills(): Bill[] {
  return useLiveQuery(() => db.bills.toArray()) ?? []
}
