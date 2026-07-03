import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/schema'
import type { PaySchedule } from '../db/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FREQUENCIES: PaySchedule['frequency'][] = ['Fortnightly', 'TwiceMonthly']

interface PaydayEditorProps {
  onClose: () => void
}

export default function PaydayEditor({ onClose }: PaydayEditorProps) {
  const schedules = useLiveQuery(() => db.paySchedules.toArray()) ?? []
  const [saving, setSaving] = useState(false)
  const [scheduleStates, setScheduleStates] = useState<Record<string, PaySchedule>>({})

  // Initialize schedule states
  useEffect(() => {
    if (Object.keys(scheduleStates).length > 0) return
    
    const owners = ['Tola', 'Tomi'] as const;
    const initialStates: Record<string, PaySchedule> = {}
    
    owners.forEach((owner) => {
      const existing = schedules.find((s) => s.owner === owner)
      if (existing) {
        // Ensure all required fields are present for TwiceMonthly
        if (existing.frequency === 'TwiceMonthly') {
          initialStates[owner] = {
            ...existing,
            firstDay: existing.firstDay ?? 15,
            secondDay: existing.secondDay ?? -1,
          }
        } else {
          initialStates[owner] = existing
        }
      } else {
        initialStates[owner] = {
          owner,
          frequency: 'Fortnightly',
          dayOfWeek: 2,
          firstPayDate: formatDefaultAnchor(owner),
          firstDay: 15,
          secondDay: -1,
        }
      }
    })
    setScheduleStates(initialStates)
  }, [schedules, scheduleStates])

  function formatDefaultAnchor(owner: string): string {
    return owner === 'Tola' ? '2026-07-07' : '2026-07-15'
  }

  // Update a schedule state
  const updateScheduleState = (owner: string, updates: Partial<PaySchedule>) => {
    setScheduleStates(prev => ({
      ...prev,
      [owner]: {
        ...prev[owner],
        ...updates
      }
    }))
  }

  // Save all schedules
  const handleSaveAll = async () => {
    if (saving) return
    
    setSaving(true)
    
    try {
      // Save both schedules
      await Promise.all(
        Object.values(scheduleStates).map(schedule => 
          db.paySchedules.put(schedule)
        )
      )
      
      // Close the editor after successful save
      onClose()
    } catch (error) {
      console.error('Failed to save schedules:', error)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-surface-1 rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-on-surface">Payday Schedule</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-on-surface min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {['Tola', 'Tomi'].map((owner) => {
          const schedule = scheduleStates[owner]
          if (!schedule) return null
          
          return (
            <ScheduleForm
              key={owner}
              schedule={schedule}
              onUpdate={(updates) => updateScheduleState(owner, updates)}
            />
          )
        })}
        
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-accent text-white disabled:opacity-40 min-h-[44px] transition-opacity mt-4"
        >
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>
    </div>
  )
}

interface ScheduleFormProps {
  schedule: PaySchedule
  onUpdate: (updates: Partial<PaySchedule>) => void
}

function ScheduleForm({ schedule, onUpdate }: ScheduleFormProps) {
  const [frequency, setFrequency] = useState(schedule.frequency)
  const [dayOfWeek, setDayOfWeek] = useState(schedule.dayOfWeek ?? 2)
  const [firstPayDate, setFirstPayDate] = useState(schedule.firstPayDate ?? '')
  const [firstDay, setFirstDay] = useState(schedule.firstDay ?? 15)
  const [secondDay, setSecondDay] = useState(schedule.secondDay === -1 ? '' : String(schedule.secondDay))

  // Update parent component when state changes
  const updateParent = () => {
    const updates: Partial<PaySchedule> = {
      frequency,
      dayOfWeek: frequency === 'Fortnightly' ? dayOfWeek : undefined,
      firstPayDate: frequency === 'Fortnightly' ? firstPayDate : undefined,
      firstDay: frequency === 'TwiceMonthly' ? firstDay : undefined,
      secondDay: frequency === 'TwiceMonthly' ? (secondDay === '' ? -1 : Number(secondDay)) : undefined,
    }
    onUpdate(updates)
  }

  // Update parent when any state changes
  const handleFrequencyChange = (newFrequency: PaySchedule['frequency']) => {
    setFrequency(newFrequency)
    updateParent()
  }

  const handleDayOfWeekChange = (dayIndex: number) => {
    setDayOfWeek(dayIndex)
    updateParent()
  }

  const handleFirstPayDateChange = (value: string) => {
    setFirstPayDate(value)
    updateParent()
  }

  const handleFirstDayChange = (value: number) => {
    setFirstDay(value)
    updateParent()
  }

  const handleSecondDayChange = (value: string) => {
    setSecondDay(value)
    updateParent()
  }

  return (
    <div className="mb-6 last:mb-0 pb-6 border-b border-surface-2 last:border-b-0">
      <h3 className="text-sm font-semibold text-on-surface mb-3">{schedule.owner}</h3>

      <label className="block text-xs text-muted mb-1">Frequency</label>
      <div className="flex gap-2 mb-3">
        {FREQUENCIES.map((f) => (
          <button
            key={f}
            onClick={() => handleFrequencyChange(f)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              frequency === f
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-muted hover:text-on-surface'
            }`}
          >
            {f === 'Fortnightly' ? 'Fortnightly' : 'Twice Monthly'}
          </button>
        ))}
      </div>

      {frequency === 'Fortnightly' && (
        <>
          <label className="block text-xs text-muted mb-1">Payday</label>
          <div className="flex gap-2 mb-3">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => handleDayOfWeekChange(i)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
                  dayOfWeek === i
                    ? 'bg-accent text-white'
                    : 'bg-surface-2 text-muted hover:text-on-surface'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <label className="block text-xs text-muted mb-1">Reference pay date</label>
          <input
            type="date"
            value={firstPayDate}
            onChange={(e) => handleFirstPayDateChange(e.target.value)}
            className="w-full bg-surface-2 text-on-surface rounded-lg px-3 py-2.5 text-sm border border-surface-2 focus:outline-none focus:border-accent mb-3"
          />
        </>
      )}

      {frequency === 'TwiceMonthly' && (
        <>
          <label className="block text-xs text-muted mb-1">First payday (day of month)</label>
          <input
            type="number"
            min={1}
            max={28}
            value={firstDay}
            onChange={(e) => handleFirstDayChange(Number(e.target.value))}
            className="w-full bg-surface-2 text-on-surface rounded-lg px-3 py-2.5 text-sm border border-surface-2 focus:outline-none focus:border-accent mb-3"
          />

          <label className="block text-xs text-muted mb-1">Second payday (day of month)</label>
          <input
            type="number"
            min={1}
            max={28}
            value={secondDay}
            onChange={(e) => handleSecondDayChange(e.target.value)}
            className="w-full bg-surface-2 text-on-surface rounded-lg px-3 py-2.5 text-sm border border-surface-2 focus:outline-none focus:border-accent mb-3"
          />
        </>
      )}
    </div>
  )
}