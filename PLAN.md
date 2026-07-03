# Payment Reminder App - Implementation Plan

## Overview
Mobile/desktop web app that lists upcoming payments from JSON data using real-world calendar dates. Users can select date ranges, filter by owner, edit bill start dates/count to extrapolate future payments, and view total cost for a period. PWA-compatible (iPhone caching), hosted via GitHub Pages.

## Tech Stack
- **Framework:** React 19 + Vite 6 + TypeScript 5.7
- **Storage:** Dexie.js (IndexedDB) – local-first state container
- **PWA:** vite-plugin-pwa (Workbox, cache-first)
- **Package Manager:** pnpm
- **Date Handling:** date-fns
- **Styling:** Tailwind CSS v4 (dark theme, single accent color)
- **Deploy:** gh-pages + GitHub Actions

## Architecture Decisions (from AGENT.md)
- Cache-first for static assets; stale-while-revalidate for JSON datasets
- On boot, seed IndexedDB from `public/data/recurring_bills.json` if empty
- All writes/updates/deletes target IndexedDB exclusively
- No ephemeral global state for critical data; persist to IndexedDB
- Single file ≤150 lines; keep DB schema/view modules cleanly split

## File Structure
```
PaymentReminderApp/
├── public/
│   └── data/
│       └── recurring_bills.json
├── src/
│   ├── db/
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── schema.ts          # Dexie DB definition + seed logic
│   ├── hooks/
│   │   ├── useBills.ts        # Live query wrapper
│   │   ├── useDateRange.ts    # Range picker state
│   │   └── useExtrapolate.ts  # Future date calculation
│   ├── components/
│   │   ├── Layout.tsx         # Responsive shell (sidebar/bottom nav)
│   │   ├── PaymentList.tsx    # Filtered, grouped payment list
│   │   ├── PaymentCard.tsx    # Single bill row/card
│   │   ├── DateRangePicker.tsx
│   │   ├── BillEditor.tsx     # Edit modal for merchant/firstDate/count
│   │   ├── OwnerFilter.tsx
│   │   └── TotalBar.tsx       # Shows total cost for period
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css              # Tailwind + custom dark theme vars
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── PLAN.md
└── .github/workflows/deploy.yml
```

## Component Tree & Data Flow
```
App
 └─ Layout (responsive: sidebar | bottom nav)
     ├─ OwnerFilter        → sets selectedOwner
     ├─ DateRangePicker    → sets startDate / endDate
     ├─ TotalBar           → reads filtered payments, shows sum
     └─ PaymentList        → live query from Dexie, filtered by range + owner
         └─ PaymentCard[]  → tap opens BillEditor
              └─ BillEditor  → saves back to Dexie via db.bills.put()
```

## Extrapolation Logic
```
Input:  firstDate, cycleDays, count, avgAmount, variance
Output: projected_payments[]

Algorithm:
  let d = new Date(firstDate)
  for i = 0 to count-1:
    push { date: format(d, 'yyyy-MM-dd'), amount: avgAmount ± variance }
    d = addDays(d, cycleDays)
  Store last_date = final date
```

## PWA Configuration
- `registerType: 'autoUpdate'`
- `workbox.globPatterns: ['**/*.{js,css,html,json,png,svg,ico}']`
- `workbox.runtimeCaching` for `/data/` → `StaleWhileRevalidate`
- Manifest: `display: 'standalone'`, `background_color: '#121212'`, theme color: `#06D6A0`

## Dark Theme Colors (Tailwind)
```ts
colors: {
  surface: { DEFAULT: '#121212', 1: '#1e1e1e', 2: '#2a2a2a' },
  accent: '#06D6A0',
  onSurface: '#e0e0e0',
  muted: '#6b7280',
}
```

## UI Rules (from AGENT.md)
- Touch targets: `min-h-[44px] min-w-[44px]`
- Layout: `w-full max-w-sm md:max-w-5xl mx-auto`
- Mobile: bottom navigation; Desktop: sidebar grid
- Safe area: `pt-[env(safe-area-inset-top)]` and `pb-[env(safe-area-inset-bottom)]`

## GitHub Pages Deployment
- Vite `base: '/PaymentReminderApp/'`
- Script: `"deploy": "pnpm build && gh-pages -d dist"`
- CI: `.github/workflows/deploy.yml` on push to main

## Build Verification
- `pnpm build` must generate both `sw.js` and complete `workbox-*.js` asset index
- Components handle empty states gracefully
