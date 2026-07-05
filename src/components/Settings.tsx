const ACCENT_COLORS = [
  { name: 'Teal', value: '#06D6A0' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
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
  onOpenPaydayEditor: () => void
  onClose: () => void
}

export default function Settings({ hideDaily, onToggleDaily, accentColor, onAccentColorChange, isDark, onToggleDark, adjustWeekends, onToggleWeekends, showRedZone, onToggleRedZone, onOpenPaydayEditor, onClose }: SettingsProps) {
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
      </div>
    </div>
  )
}
