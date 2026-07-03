import { format } from 'date-fns'

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onStartChange: (d: Date) => void
  onEndChange: (d: Date) => void
  onClose: () => void
}

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, onClose }: DateRangePickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-surface-1 rounded-t-2xl sm:rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-on-surface">Filter by Date</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-on-surface min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted font-medium">From</span>
            <input
              type="date"
              value={format(startDate, 'yyyy-MM-dd')}
              onChange={(e) => onStartChange(new Date(e.target.value + 'T00:00:00'))}
              className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px] [color-scheme:dark]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted font-medium">To</span>
            <input
              type="date"
              value={format(endDate, 'yyyy-MM-dd')}
              onChange={(e) => onEndChange(new Date(e.target.value + 'T00:00:00'))}
              className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-on-surface text-sm min-h-[44px] [color-scheme:dark]"
            />
          </label>
          <button
            onClick={onClose}
            className="w-full bg-accent text-surface font-semibold rounded-lg py-3 min-h-[44px] transition-opacity hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
