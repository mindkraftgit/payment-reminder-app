import type { PaySchedule } from '../db/types'

interface SettingsPanelProps {
  paySchedules: PaySchedule[]
  _onScheduleChange: (schedules: PaySchedule[]) => void
  authStatus: 'checking' | 'authenticated' | 'unauthenticated'
  onAuthenticate: () => void
}

export default function SettingsPanel({ paySchedules, authStatus, onAuthenticate }: SettingsPanelProps) {
  const handleAuthenticate = async () => {
    await onAuthenticate()
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-bold mb-3">Google Sheets Sync</h3>
        <div className="bg-surface-1 border border-surface-2 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Connection Status</span>
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
              onClick={handleAuthenticate}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Authenticate with Google Sheets
            </button>
          )}

          <div className="text-xs text-muted">
            Bills are synced from Google Sheets. Authenticate to enable automatic sync when adding or editing bills.
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold mb-3">Payday Schedules</h3>
        <div className="space-y-3">
          {paySchedules.map((schedule) => (
            <div key={schedule.owner} className="bg-surface-1 border border-surface-2 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{schedule.owner}</span>
                <span className="text-xs text-muted">{schedule.frequency}</span>
              </div>
              {schedule.frequency === 'Fortnightly' && (
                <div className="text-xs text-muted">
                  Day of week: {schedule.dayOfWeek != null ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.dayOfWeek] : '—'}
                </div>
              )}
              {schedule.frequency === 'TwiceMonthly' && (
                <div className="text-xs text-muted">
                  Days: {schedule.firstDay} and last day of month
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold mb-3">About</h3>
        <div className="bg-surface-1 border border-surface-2 rounded-xl p-4 text-xs text-muted space-y-1">
          <div>Payment Reminder App</div>
          <div>Syncs bill data from Google Sheets</div>
          <div>Local storage via IndexedDB</div>
        </div>
      </section>
    </div>
  )
}
