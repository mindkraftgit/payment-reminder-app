# AGENTS.md

## Core Stack & Offline Storage
- Framework: React 19 + Vite 6 + TypeScript 5.7
- Storage: IndexedDB via Dexie.js (Local-first state container)
- Seed Data: Static JSON datasets located in `public/data/` or compiled into `src/data/`
- PWA Engine: `vite-plugin-pwa` (Configured for 100% offline cache immutability)
- UI Sync: Custom React Hooks synchronized directly with Dexie.js live queries (`useLiveQuery`)

## Critical Commands
- Local Dev: `pnpm dev --host` (Required for local network testing)
- Build PWA: `pnpm build` (Compiles app and registers absolute offline asset manifests)
- Preview Dev: `pnpm preview --host` (Simulate offline network throttling in DevTools)
- Audit Assets: `pnpm dlx source-map-explorer dist/assets/*.js` (Track bundle bloat)

## Offline Architecture Guardrails
- Core Strategy: Cache-First for static assets. Cache-Only or Stale-While-Revalidate for JSON datasets to ensure instant application boots without network pings.
- Data Seed Engine: On application boot, check if IndexedDB is populated. If empty, the engine must fetch, parse, and hydrate the database from the local fallback JSON templates.
- Mutation Vector: All writes, updates, and deletes must target the local IndexedDB instance exclusively. Never write directly back to static JSON runtime files.
- Memory Boundaries: Block the import of massive JSON files directly into JavaScript component bundles using standard `import`. Instead, stream data utilizing low-footprint `fetch()` operations or implement asynchronous dynamic imports.

## Desktop/Mobile UI & Touch Rules
- Touch Targets: Interactive elements must maintain a minimum surface area of `min-h-[44px]` and `min-w-[44px]`.
- Screen Adaptability: Use a strict layout wrapper: `w-full max-w-sm md:max-w-5xl mx-auto`. Desktop layouts must utilize sidebar grids, while mobile rendering collapses into bottom-navigation bars.
- Safe Area Boundaries: Enforce Tailwind padding tags utilizing `pt-[env(safe-area-inset-top)]` and `pb-[env(safe-area-inset-bottom)]` to remain clear of hardware camera notches and OS software home bars.

## Verification Checklist for Agents
- Offline Validation: You must verify that components handle empty state states gracefully if the local IndexedDB database is wiping or resetting.
- Build Soundness: Run `pnpm build`. Confirm the compiled output generates both a functioning `sw.js` script and a complete `workbox-*.js` asset index.

## Agent Restrictions
- State Control: Do not use ephemeral global state systems (e.g., standard Zustand or Context) for critical data records. Everything must persist to IndexedDB to survive unexpected mobile OS browser terminations.
- Size Limits: Single file length must not cross 150 lines. Keep code split cleanly between database schema accessors (`@/db/schema.ts`) and view modules.
