import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  onSettings: () => void
  onAddBill: () => void
  filterSlot?: ReactNode
  onRefresh?: () => void
  refreshing?: boolean
}

export default function Layout({ children, onSettings, onAddBill, filterSlot, onRefresh, refreshing }: LayoutProps) {
  return (
    <div className="w-full mx-auto flex flex-col min-h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:max-w-5xl">
      <header className="sticky top-0 z-10 flex items-center gap-2 px-4 h-14 bg-surface-1 backdrop-blur-sm border-b border-surface-2">
        <div className="flex-1 overflow-x-auto">
          {filterSlot}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="text-accent h-10 w-10 flex items-center justify-center transition-colors rounded-full border border-accent shrink-0 disabled:opacity-50"
            aria-label="Refresh from Google Sheets"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={refreshing ? 'animate-spin' : ''}
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.9a10 10 0 0 1 18.8-4.3M22 12.1a10 10 0 0 1-18.8 4.3" />
            </svg>
          </button>
        )}
        <button
          onClick={onAddBill}
          className="text-accent h-10 w-10 flex items-center justify-center transition-colors rounded-full border border-accent shrink-0"
          aria-label="Add bill"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={onSettings}
          className="text-accent h-10 w-10 flex items-center justify-center transition-colors rounded-full border border-accent shrink-0"
          aria-label="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
