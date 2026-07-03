interface OwnerFilterProps {
  selected: string
  onChange: (owner: string) => void
  owners: string[]
}

function OwnerIcon({ owner }: { owner: string }) {
  if (owner === 'All') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function OwnerFilter({ selected, onChange, owners }: OwnerFilterProps) {
  const displayOwners = owners.filter((o) => o.trim().length > 0)

  return (
    <div className="flex gap-2 overflow-x-auto">
      <button
        onClick={() => onChange('All')}
        className={`inline-flex items-center gap-1.5 px-4 h-10 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
          selected === 'All'
            ? 'bg-accent text-surface'
            : 'bg-surface-1 text-on-surface hover:bg-surface-2'
        }`}
      >
        <OwnerIcon owner="All" />
        All
      </button>
      {displayOwners.map((owner) => (
        <button
          key={owner}
          onClick={() => onChange(owner)}
          className={`inline-flex items-center gap-1.5 px-4 h-10 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            selected === owner
              ? 'bg-accent text-surface'
              : 'bg-surface-1 text-on-surface hover:bg-surface-2'
          }`}
        >
          <OwnerIcon owner={owner} />
          {owner}
        </button>
      ))}
    </div>
  )
}
