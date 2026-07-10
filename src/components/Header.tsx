import { useMemo } from 'react'

interface HeaderProps {
  title: string
  onRefresh: () => void
  refreshing: boolean
  onAddBill: () => void
  authStatus: 'checking' | 'authenticated' | 'unauthenticated'
  onAuthenticate: () => void
}

export default function Header({ title, onRefresh, refreshing, onAddBill, authStatus, onAuthenticate }: HeaderProps) {
  const authIndicator = useMemo(() => {
    switch (authStatus) {
      case 'authenticated':
        return (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Sheets
          </span>
        )
      case 'unauthenticated':
        return (
          <button
            onClick={onAuthenticate}
            className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Sync
          </button>
        )
      default:
        return null
    }
  }, [authStatus, onAuthenticate])

  return (
    <header className="bg-surface-1 border-b border-surface-2 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">{title}</h1>
          {authIndicator}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors disabled:opacity-50"
            aria-label="Refresh from Google Sheets"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
          <button
            onClick={onAddBill}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            aria-label="Add new bill"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
