import { useState, useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import Layout from './components/Layout'
import OwnerFilter from './components/OwnerFilter'
import DateRangePicker from './components/DateRangePicker'
import Settings from './components/Settings'
import TotalBar from './components/TotalBar'
import PaymentList from './components/PaymentList'
import BillEditor from './components/BillEditor'
import NewBillModal from './components/NewBillModal'
import PaydayEditor from './components/PaydayEditor'
import { useBills } from './hooks/useBills'
import { useDateRange } from './hooks/useDateRange'
import { seedDatabase } from './db/schema'
import db from './db/schema'
import type { Bill } from './db/types'

const ACCENT_COLORS = ['#06D6A0', '#3B82F6', '#8B5CF6', '#F97316']

export default function App() {
  const [seeded, setSeeded] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState('All')
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [hideDaily, setHideDaily] = useState(true)
  const [showNewBill, setShowNewBill] = useState(false)
  const [dateFilterApplied, setDateFilterApplied] = useState(false)
  const [showRedZone, setShowRedZone] = useState(() => {
    return localStorage.getItem('showRedZone') !== 'false'
  })
  const [adjustWeekends, setAdjustWeekends] = useState(() => {
    return localStorage.getItem('adjustWeekends') === 'true'
  })
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('isDark')
    return saved !== null ? saved === 'true' : true
  })
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('accentColor')
    return saved && ACCENT_COLORS.includes(saved) ? saved : '#06D6A0'
  })
  const bills = useBills()
  const [showPaydayEditor, setShowPaydayEditor] = useState(false)
  const schedules = useLiveQuery(() => db.paySchedules.toArray()) ?? []
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange()

  useEffect(() => {
    if (!seeded) {
      seedDatabase().then(() => setSeeded(true))
    }
  }, [seeded])

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', accentColor)
    localStorage.setItem('accentColor', accentColor)
  }, [accentColor])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('isDark', String(isDark))
  }, [isDark])

  useEffect(() => {
    localStorage.setItem('showRedZone', String(showRedZone))
  }, [showRedZone])

  useEffect(() => {
    localStorage.setItem('adjustWeekends', String(adjustWeekends))
  }, [adjustWeekends])

  const owners = useMemo(() => {
    const set = new Set(bills.map((b) => b.owner))
    return Array.from(set).sort()
  }, [bills])

  const filtered = useMemo(() => {
    let list = bills
    if (selectedOwner !== 'All') {
      list = list.filter((b) => b.owner === selectedOwner)
    }
    if (hideDaily) {
      list = list.filter((b) => b.frequency !== 'Daily')
    }
    return list
  }, [bills, selectedOwner, hideDaily])

  return (
    <Layout
      onSettings={() => setShowSettings(true)}
      onAddBill={() => setShowNewBill(true)}
      filterSlot={
        <OwnerFilter owners={owners} selected={selectedOwner} onChange={setSelectedOwner} />
      }
    >
      <button
        onClick={() => setShowDateFilter(true)}
        className="w-full bg-surface-1 border border-surface-2 rounded-lg py-2.5 mb-4 text-sm text-muted font-medium min-h-[44px] hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        Filter by date
      </button>

      {dateFilterApplied && (
        <TotalBar
          bills={filtered}
          startDate={startDate}
          endDate={endDate}
          onClose={() => setDateFilterApplied(false)}
          adjustWeekends={adjustWeekends}
        />
      )}

      <PaymentList
        bills={filtered}
        startDate={startDate}
        endDate={endDate}
        onEditBill={setEditingBill}
        hidePast={!dateFilterApplied}
        adjustWeekends={adjustWeekends}
        schedules={schedules}
        showRedZone={showRedZone}
      />

      {showDateFilter && (
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onClose={() => {
            setShowDateFilter(false)
            setDateFilterApplied(true)
          }}
        />
      )}

      {showSettings && (
        <Settings
          hideDaily={hideDaily}
          onToggleDaily={() => setHideDaily((v) => !v)}
          accentColor={accentColor}
          onAccentColorChange={setAccentColor}
          isDark={isDark}
          onToggleDark={() => setIsDark((v) => !v)}
          adjustWeekends={adjustWeekends}
          onToggleWeekends={() => setAdjustWeekends((v) => !v)}
          showRedZone={showRedZone}
          onToggleRedZone={() => setShowRedZone((v) => !v)}
          onOpenPaydayEditor={() => {
            setShowSettings(false)
            setShowPaydayEditor(true)
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPaydayEditor && (
        <PaydayEditor onClose={() => setShowPaydayEditor(false)} />
      )}

      {editingBill && (
        <BillEditor bill={editingBill} onClose={() => setEditingBill(null)} />
      )}

      {showNewBill && (
        <NewBillModal onClose={() => setShowNewBill(false)} />
      )}
    </Layout>
  )
}
