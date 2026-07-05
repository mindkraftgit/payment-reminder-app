# Testing Setup Documentation

## Quick Start
```bash
# Install test dependencies (run once)
npm install --save-dev vitest @testing-library/react @types/vitest

# Run all tests
npm test

# Watch mode for development
npm run test:watch
```

## Test File Structure

```
__tests__/                      # Root test directory
├── setup.ts                    # Global configurations & fixtures
├── unit/                       # Unit tests (fast, no DB)
│   ├── utils.test.ts           # Functions in src/utils.ts
│   ├── useExtrapolate.test.ts  # Functions in src/hooks/useExtrapolate.ts
│   └── validation.test.ts      # Basic code quality checks
├── integration/                # Integration tests (with DB)
│   ├── database.test.ts        # CRUD operations
│   ├── bill-lifecycle.test.ts  # Full add/edit/delete flow
│   └── payday-schedules.test.ts # Schedule calculations
└── components/                 # Component tests (optional)
```

## Adding New Tests

### Unit Test Example (utils.test.ts)
```typescript
import { describe, it, expect } from 'vitest'
import { prettyName } from '../../src/utils'

describe('prettyName', () => {
  it('handles /BILL- separator correctly', () => {
    expect(prettyName('APPLE.COM/BILL-ICLOUD')).toBe('ICLOUD - Apple')
  })
})
```

### Integration Test Example (bill-lifecycle.test.ts)
```typescript
import db from '../../src/db/schema'
import type { Bill } from '../../src/db/types'

describe('Bill Lifecycle', () => {
  it('can add → edit → delete bill correctly', async () => {
    const bill = createTestBill()
    await db.bills.add(bill)
    // ... verify, update, delete
  })
})
```

## Running Tests in CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
1. TypeScript typecheck
2. Pre-commit hook: unit + integration tests
3. Linting (oxlint)
4. Full test suite with coverage
5. Build verification

**All tests must pass before a PR can be merged.**

## Coverage Targets

| Module | Target | Current |
|--------|--------|---------|
| utils.ts | 90%+ | TBD |
| useExtrapolate.ts | 85%+ | TBD |
| Payday functions | 100% | TBD |
| Bill CRUD | 95%+ | TBD |

## Troubleshooting

**Tests fail locally but not in CI?**
```bash
# Check Node version (CI uses Node.js 20)
npm install --save-dev @types/node@^24.13.2

# Clear cache and reinstall
rm -rf node_modules package-lock.json && npm install
```

**Slow test runs?**
```bash
# Limit concurrency (default is 8 workers)
npm test -- --max-workers=1

# Run specific file only
npm test -- __tests__/unit/utils.test.ts
```

## CI/CD Merge Gates

### Pre-commit Hook
Runs automatically before each commit:
```bash
git diff-index --name-only HEAD -- | grep -qE '\.(tsx?|jsx?)$' || exit 0
npm test -- --run __tests__/
```

### GitHub Actions Checks (`.github/workflows/ci.yml`)
**Merge requires:**
- ✅ TypeScript compilation: `tsc --noEmit` passes
- ✅ Linting: `oxlint` has no errors/warnings
- ✅ Unit tests pass with ≥90% coverage
- ✅ Integration tests pass against real database
- ✅ Build succeeds: `pnpm build`

## Best Practices

1. **Write failing tests first** (TDD approach)
2. **One concept per test file** for easy debugging
3. **Test edge cases**: empty strings, null values, boundary dates
4. **Mock external services** in unit tests, use real DB in integration tests
5. **Keep tests fast and isolated** - no side effects between tests
6. **Document new scenarios** in AGENTS_TESTING_GUIDELINES.md

## Example: Adding a New Component Test

```typescript
// components/BillEditor.test.tsx
import { render, screen } from '@testing-library/react'
import BillEditor from '../src/components/BillEditor'

it('displays edit form correctly', () => {
  const bill = createMockBill()
  render(<BillEditor bill={bill} onClose={() => {/* */}} />)
  
  expect(screen.getByRole('textbox', { name: /merchant/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
})
```

## Full Test Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Watch mode for development |
| `npm run test:coverage` | Run with coverage report |
| `npm run typecheck` | TypeScript compilation check |
| `npm run lint` | Lint code with oxlint |

## Next Steps

1. Install dependencies: `npm install --save-dev vitest @testing-library/react`
2. Create example test in next PR to demonstrate setup
3. Add tests for any new components/hooks you create
4. Update AGENTS_TESTING_GUIDELINES.md with new scenarios