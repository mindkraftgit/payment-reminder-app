import { useState, useMemo, useRef } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import type { Bill } from '../db/types'
import db from '../db/schema'
import { isAuthenticated, addBillToSheets, authenticate, uploadImageToDrive } from '../utils/googleSheets'

const CATEGORIES = [
  'Fixed Expenses',
  'Utilities',
  'Internet & Mobile',
  'Insurance and Loans',
  'Health & Medical',
  'Health & Beauty',
  'Gym Membership',
  'Children & Education',
  'Transportation',
  'Subscriptions',
  'Credit & Loans',
  'Clothing',
  'Food & Dining',
  'Entertainment',
  'Savings & Investments',
  'Other',
] as const

type Category = (typeof CATEGORIES)[number]

interface NewBillModalProps {
  projectUntil?: string
  onClose: () => void
}

export default function NewBillModal({ projectUntil, onClose }: NewBillModalProps) {
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [frequency, setFrequency] = useState('Monthly')
  const [cycleDays, setCycleDays] = useState(30)
  const [firstDate, setFirstDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [avgAmount, setAvgAmount] = useState(0)
  const [owner, setOwner] = useState('Tola')
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [syncMessage, setSyncMessage] = useState('')
  const [useExactDate, setUseExactDate] = useState(false)
  const [exactDate, setExactDate] = useState(1)
  const [iconUrl, setIconUrl] = useState('')
  const [iconDataUri, setIconDataUri] = useState('')
  const [uploading, setUploading] = useState(false)
  const driveUrlRef = useRef('')

  const count = useMemo(() => {
    if (useExactDate) {
      if (!firstDate || !projectUntil || !exactDate) return 0
      const start = new Date(firstDate)
      const end = new Date(projectUntil)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
      let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      if (end.getDate() >= exactDate) months++
      return Math.max(0, months)
    }
    if (!firstDate || !projectUntil || cycleDays <= 0) return 0
    const start = isValid(parseISO(firstDate)) ? parseISO(firstDate) : undefined
    const end = isValid(parseISO(projectUntil)) ? parseISO(projectUntil) : undefined
    if (!start || !end) return 0
    const diff = Math.max(0, end.getTime() - start.getTime())
    return Math.ceil(diff / (cycleDays * 86400000))
  }, [firstDate, projectUntil, cycleDays, exactDate, useExactDate])

  const projectedTotal = count * avgAmount

  async function handleSave() {
    if (!merchant.trim()) {
      setSyncStatus('error')
      setSyncMessage('Merchant name is required')
      return
    }

    setSaving(true)
    setSyncStatus('syncing')

    const newBill: Bill = {
      merchant: merchant.trim(),
      category: category || 'Other',
      frequency,
      cycle_days: cycleDays,
      count,
      first_date: firstDate,
      last_date: '',
      avg_amount: avgAmount,
      variance: 0,
      projected_payments: [],
      owner,
      displayName: displayName.trim() || undefined,
      exact_date: useExactDate ? exactDate : undefined,
      iconUrl: driveUrlRef.current || iconUrl || undefined,
      iconDataUri: iconDataUri || undefined,
    }

    try {
      const id = await db.bills.add(newBill)
      newBill.id = id

      if (isAuthenticated()) {
        const row = await addBillToSheets(newBill)
        if (row) {
          newBill.sheetRow = row
          await db.bills.update(id, { sheetRow: row })
          setSyncStatus('success')
          setSyncMessage('Added and synced to Google Sheets')
        } else {
          setSyncStatus('success')
          setSyncMessage('Added locally (sync on next refresh)')
        }
      } else {
        setSyncStatus('success')
        setSyncMessage('Added locally')
      }
    } catch (error) {
      console.error('Failed to add bill:', error)
      setSyncStatus('error')
      setSyncMessage('Failed to add bill')
    }

    setSaving(false)
    onClose()
  }

  async function handleAuthenticate() {
    const success = await authenticate()
    if (success) {
      setSyncStatus('success')
      setSyncMessage('Authenticated with Google Sheets')
    } else {
      setSyncStatus('error')
      setSyncMessage('Authentication failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-1 rounded-t-2xl sm:rounded-2xl border border-surface-2 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-2 shrink-0">
          <h2 className="text-lg font-bold">Add New Bill</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-on-surface h-10 w-10 flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Merchant Name</label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., Netflix, Electricity"
              className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Display Name (optional)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Leave blank to auto-generate"
              className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Custom Icon (optional)</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center shrink-0 overflow-hidden">
                {iconDataUri ? (
                  <img src={iconDataUri} alt="Icon" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2 text-sm min-h-[40px] focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <label className="block">
                  <span className={`text-xs cursor-pointer transition-colors ${uploading ? 'text-muted' : 'text-muted hover:text-on-surface'}`}>
                    {uploading ? 'Uploading...' : 'Or upload a file...'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploading(true)
                      const reader = new FileReader()
                      reader.onload = (ev) => setIconDataUri(ev.target?.result as string)
                      reader.readAsDataURL(file)
                      if (isAuthenticated()) {
                        const url = await uploadImageToDrive(file, merchant || 'unknown', owner)
                        if (url) driveUrlRef.current = url
                      }
                      setUploading(false)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
              {(iconDataUri || iconUrl) && (
                <button
                  onClick={() => { setIconDataUri(''); setIconUrl(''); driveUrlRef.current = '' }}
                  className="text-muted hover:text-on-surface min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Remove icon"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="">Select...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Owner</label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="Tola">Tola</option>
                <option value="Tomi">Tomi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => {
                  setFrequency(e.target.value)
                  if (!useExactDate) {
                    const days: Record<string, number> = { Daily: 1, Weekly: 7, Fortnightly: 14, Monthly: 30, Quarterly: 90, Yearly: 365 }
                    setCycleDays(days[e.target.value] || cycleDays)
                  }
                }}
                className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Fortnightly">Fortnightly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            {!useExactDate && (
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Cycle (days)</label>
                <input
                  type="number"
                  value={cycleDays}
                  onChange={(e) => setCycleDays(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            )}
            {useExactDate && (
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Day of month</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={exactDate}
                  onChange={(e) => setExactDate(Math.min(28, Math.max(1, Number(e.target.value))))}
                  className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            )}
          </div>

          <label className="flex items-center justify-between py-2">
            <span className="text-xs font-medium text-muted">Use exact day of month</span>
            <button
              type="button"
              onClick={() => {
                const next = !useExactDate
                setUseExactDate(next)
                if (next) {
                  setCycleDays(-1)
                } else {
                  const days: Record<string, number> = { Daily: 1, Weekly: 7, Fortnightly: 14, Monthly: 30, Quarterly: 90, Yearly: 365 }
                  setCycleDays(days[frequency] || 30)
                }
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${useExactDate ? 'bg-accent' : 'bg-surface-2'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${useExactDate ? 'translate-x-6' : ''}`} />
            </button>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">First Payment Date</label>
              <input
                type="date"
                value={firstDate}
                onChange={(e) => setFirstDate(e.target.value)}
                className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Avg Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={avgAmount}
                onChange={(e) => setAvgAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          {count > 0 && projectedTotal > 0 && (
            <div className="bg-surface-0 border border-surface-2 rounded-lg p-3">
              <div className="text-xs text-muted">
                {count} payments · ${projectedTotal.toFixed(2)} total
              </div>
            </div>
          )}

          {syncStatus !== 'idle' && (
            <div className={`text-xs px-3 py-2 rounded-lg ${
              syncStatus === 'success' ? 'bg-green-500/10 text-green-400' :
              syncStatus === 'error' ? 'bg-red-500/10 text-red-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              {syncMessage}
            </div>
          )}

          {!isAuthenticated() && (
            <button
              onClick={handleAuthenticate}
              className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2.5 text-sm text-blue-400 min-h-[44px] hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Authenticate with Google Sheets
            </button>
          )}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-surface-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || !merchant.trim()}
            className="flex-1 bg-accent rounded-xl px-4 py-3 text-sm font-bold min-h-[44px] hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Bill'}
          </button>
        </div>
      </div>
    </div>
  )
}
