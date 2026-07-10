import { useState, useMemo, useEffect, useRef } from 'react'
import { parseISO, isValid } from 'date-fns'
import type { Bill } from '../db/types'
import db, { refreshFromSheets } from '../db/schema'
import { authenticate, isAuthenticated, updateBillInSheets, deleteBillFromSheets, uploadImageToDrive } from '../utils/googleSheets'

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

interface BillEditorProps {
  bill: Bill
  onClose: () => void
  projectUntil?: string
}

function computeCount(firstDate: string, projectUntil: string, cycleDays: number): number {
  if (!firstDate || !projectUntil || cycleDays <= 0) return 0
  const start = isValid(parseISO(firstDate)) ? parseISO(firstDate) : undefined
  const end = isValid(parseISO(projectUntil)) ? parseISO(projectUntil) : undefined
  if (!start || !end) return 0
  const diff = Math.max(0, end.getTime() - start.getTime())
  return Math.ceil(diff / (cycleDays * 86400000))
}

export default function BillEditor({ bill, onClose, projectUntil }: BillEditorProps) {
  const [merchant, setMerchant] = useState(bill.merchant)
  const [category, setCategory] = useState<Category | ''>(bill.category as Category | '')
  const [frequency, setFrequency] = useState(bill.frequency)
  const [cycleDays, setCycleDays] = useState(bill.cycle_days)
  const [firstDate, setFirstDate] = useState(bill.first_date)
  const [avgAmount, setAvgAmount] = useState(bill.avg_amount)
  const [owner, setOwner] = useState(bill.owner)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [displayName, setDisplayName] = useState(bill.displayName || '')
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [syncMessage, setSyncMessage] = useState('')
  const [useExactDate, setUseExactDate] = useState(bill.cycle_days === -1 && bill.exact_date != null)
  const [exactDate, setExactDate] = useState(bill.exact_date ?? 1)
  const [iconUrl, setIconUrl] = useState(bill.iconUrl || '')
  const [iconDataUri, setIconDataUri] = useState(bill.iconDataUri || '')
  const [uploading, setUploading] = useState(false)
  const driveUrlRef = useRef('')

  const count = useMemo(
    () => computeCount(firstDate, projectUntil || '', cycleDays),
    [firstDate, projectUntil, cycleDays],
  )

  const projectedTotal = count * avgAmount

  useEffect(() => {
    if (count > 0 && projectedTotal > 0) {
      const msg = `${count} payments · $${projectedTotal.toFixed(2)} total`
      setSyncMessage(msg)
    }
  }, [count, projectedTotal])

  async function handleSave() {
    setSaving(true)
    setSyncStatus('syncing')

    const updated: Bill = {
      ...bill,
      merchant,
      category: category || 'Other',
      frequency,
      cycle_days: cycleDays,
      count,
      first_date: firstDate,
      avg_amount: avgAmount,
      owner,
      displayName: displayName || undefined,
      exact_date: useExactDate ? exactDate : undefined,
      iconUrl: driveUrlRef.current || iconUrl || undefined,
      iconDataUri: iconDataUri || undefined,
    }

    try {
      await db.bills.put(updated)

      if (isAuthenticated()) {
        if (bill.sheetRow) {
          await updateBillInSheets({ ...updated, sheetRow: bill.sheetRow })
          setSyncStatus('success')
          setSyncMessage('Synced to Google Sheets')
        } else {
          setSyncStatus('success')
          setSyncMessage('Saved locally (new bill, sync on next refresh)')
        }
      } else {
        setSyncStatus('success')
        setSyncMessage('Saved locally')
      }
    } catch (error) {
      console.error('Failed to save bill:', error)
      setSyncStatus('error')
      setSyncMessage('Failed to save')
    }

    setSaving(false)
    onClose()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${bill.merchant}"? This cannot be undone.`)) return

    setDeleting(true)
    setSyncStatus('syncing')

    try {
      await db.bills.delete(bill.id!)

      if (isAuthenticated() && bill.sheetRow) {
        await deleteBillFromSheets(bill.sheetRow)
        await refreshFromSheets()
        setSyncStatus('success')
        setSyncMessage('Deleted and synced')
      } else {
        setSyncStatus('success')
        setSyncMessage('Deleted locally')
      }
    } catch (error) {
      console.error('Failed to delete bill:', error)
      setSyncStatus('error')
      setSyncMessage('Failed to delete')
    }

    setDeleting(false)
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
          <h2 className="text-lg font-bold">Edit Bill</h2>
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
            onClick={handleDelete}
            disabled={deleting || saving}
            className="flex-1 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 font-medium min-h-[44px] hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving || deleting}
            className="flex-[2] bg-accent rounded-xl px-4 py-3 text-sm font-bold min-h-[44px] hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
