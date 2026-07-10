interface OwnerFilterProps {
  selected: string
  onChange: (owner: string) => void
  owners: string[]
  open: boolean
  onClose: () => void
}

function OwnerIcon({ owner, size = 20 }: { owner: string; size?: number }) {
  if (owner === 'All') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function OwnerFilter({ selected, onChange, owners, open, onClose }: OwnerFilterProps) {
  const displayOwners = owners.filter((o) => o.trim().length > 0)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface-1 rounded-2xl shadow-xl w-64 p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="px-3 pt-2 pb-2 text-xs font-bold text-muted uppercase tracking-wider">Filter by owner</p>
        <button
          onClick={() => { onChange('All'); onClose() }}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
            selected === 'All' ? 'bg-accent/15 text-accent' : 'text-on-surface hover:bg-surface-2'
          }`}
        >
          <div className={`h-10 w-10 flex items-center justify-center rounded-full ${
            selected === 'All' ? 'bg-accent text-surface' : 'bg-surface-2 text-muted'
          }`}>
            <OwnerIcon owner="All" />
          </div>
          All
        </button>
        {displayOwners.map((owner) => (
          <button
            key={owner}
            onClick={() => { onChange(owner); onClose() }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
              selected === owner ? 'bg-accent/15 text-accent' : 'text-on-surface hover:bg-surface-2'
            }`}
          >
            <div className={`h-10 w-10 flex items-center justify-center rounded-full ${
              selected === owner ? 'bg-accent text-surface' : 'bg-surface-2 text-muted'
            }`}>
              <OwnerIcon owner={owner} />
            </div>
            {owner}
          </button>
        ))}
      </div>
    </div>
  )
}
