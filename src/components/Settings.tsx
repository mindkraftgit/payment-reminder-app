import { format } from 'date-fns'

const ACCENT_COLORS = [
  { name: 'Teal', value: '#06D6A0' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Red', value: '#EF4444' },
]

interface SettingsProps {
  hideDaily: boolean
  onToggleDaily: () => void
  accentColor: string
  onAccentColorChange: (color: string) => void
  isDark: boolean
  onToggleDark: () => void
  adjustWeekends: boolean
  onToggleWeekends: () => void
  showRedZone: boolean
  onToggleRedZone: () => void
  roundPayments: boolean
  onToggleRoundPayments: () => void
  onOpenPaydayEditor: () => void
  onRefreshBills: () => void
  isRefreshing: boolean
  authStatus: 'checking' | 'authenticated' | 'unauthenticated'
  onAuthenticate: () => void
  searchEndDate: Date
  onSearchEndDateChange: (date: Date) => void
  onClose: () => void
}

export default function Settings({ hideDaily, onToggleDaily, accentColor, onAccentColorChange, isDark, onToggleDark, adjustWeekends, onToggleWeekends, showRedZone, onToggleRedZone, roundPayments, onToggleRoundPayments, onOpenPaydayEditor, onRefreshBills, isRefreshing, authStatus, onAuthenticate, searchEndDate, onSearchEndDateChange, onClose }: SettingsProps) {
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="mx-auto w-full max-w-[calc(100vw-4rem)] bg-surface-1 rounded-3xl p-6 sm:p-8 my-5 sm:my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-on-surface">Settings</h2>
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

        <label className="flex items-center justify-between py-3">
          <span className="text-sm text-on-surface">Hide daily payments</span>
          <button
            onClick={onToggleDaily}
            className={`relative w-12 h-6 rounded-full transition-colors ${hideDaily ? 'bg-accent' : 'bg-surface-2'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${hideDaily ? 'translate-x-6' : ''}`} />
          </button>
        </label>

        <div className="py-3">
          <span className="text-sm text-on-surface">Accent color</span>
          <div className="flex gap-3 mt-3">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => onAccentColorChange(c.value)}
                className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                  accentColor === c.value ? 'ring-2 ring-offset-2 ring-offset-surface-1 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: c.value }}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between py-3">
          <span className="text-sm text-on-surface">Dark mode</span>
          <button
            onClick={onToggleDark}
            className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-accent' : 'bg-surface-2'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : ''}`} />
          </button>
        </label>

        <label className="flex items-center justify-between py-3">
          <span className="text-sm text-on-surface">Shift weekend payments to Monday</span>
          <button
            onClick={onToggleWeekends}
            className={`relative w-12 h-6 rounded-full transition-colors ${adjustWeekends ? 'bg-accent' : 'bg-surface-2'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${adjustWeekends ? 'translate-x-6' : ''}`} />
          </button>
        </label>

        <label className="flex items-center justify-between py-3">
          <span className="text-sm text-on-surface">Show red zone highlights</span>
          <button
            onClick={onToggleRedZone}
            className={`relative w-12 h-6 rounded-full transition-colors ${showRedZone ? 'bg-accent' : 'bg-surface-2'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${showRedZone ? 'translate-x-6' : ''}`} />
          </button>
        </label>

        <label className="flex items-center justify-between py-3">
          <span className="text-sm text-on-surface">Round payments up</span>
          <button
            onClick={onToggleRoundPayments}
            className={`relative w-12 h-6 rounded-full transition-colors ${roundPayments ? 'bg-accent' : 'bg-surface-2'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${roundPayments ? 'translate-x-6' : ''}`} />
          </button>
        </label>

        <div className="py-3">
          <span className="text-sm text-on-surface">Search end date</span>
          <p className="text-xs text-muted mt-1">When searching, show payments up to this date</p>
          <input
            type="date"
            value={format(searchEndDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              const d = new Date(e.target.value + 'T00:00:00')
              if (!isNaN(d.getTime())) onSearchEndDateChange(d)
            }}
            className="w-full mt-2 bg-surface-0 border border-surface-2 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <button
          onClick={onOpenPaydayEditor}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-surface-2 text-on-surface hover:bg-accent hover:text-white transition-colors mt-3 min-h-[44px] flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Payday Schedule
        </button>

        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface">Google Sheets Sync</span>
            {authStatus === 'authenticated' ? (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Connected
              </span>
            ) : authStatus === 'checking' ? (
              <span className="text-xs text-muted">Checking...</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Not connected
              </span>
            )}
          </div>

          {authStatus === 'unauthenticated' && (
            <button
              onClick={onAuthenticate}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Authenticate with Google Sheets
            </button>
          )}

          <button
            onClick={onRefreshBills}
            disabled={isRefreshing}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-colors min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh from Google Sheets'}
          </button>
        </div>
      </div>
    </div>
  )
}
