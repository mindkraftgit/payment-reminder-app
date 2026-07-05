# Testing Guide & CI/CD Integration

## Overview
This document outlines how to ensure all data entry, retrieval, editing, payday schedules, and bill management work correctly through comprehensive tests.

## Test Structure

```
__tests__/              # Root test directory
├── unit/               # Unit tests for individual functions
│   ├── utils.test.ts         # prettyName, getValidatedPayments, etc.
│   └── useExtrapolate.test.ts  # extrapolatePayments function
├── integration/        # Integration tests with database
│   ├── bill-lifecycle.test.ts    # Add → Edit → Delete flow
│   ├── database.test.ts          # CRUD operations
│   └── payday-schedules.test.ts   # Schedule calculations
├── setup.ts             # Test environment configuration
```

## Adding New Tests

### 1. Unit Tests (for utility functions)

```typescript
// Example: Testing prettyName function
import { prettyName } from '../../src/utils'

describe('prettyName', () => {
  it('handles /BILL- separator correctly', () => {
    expect(prettyName('APPLE.COM/BILL-ICLOUD')).toBe('ICLOUD - Apple')
  })
})
```

### 2. Integration Tests (with database)

```typescript
// Example: Testing full bill edit cycle
import db from '../../src/db/schema'
import type { Bill } from '../../src/db/types'

describe('Bill Edit Flow', () => {
  it('can update merchant name after adding', async () => {
    // Add bill → verify exists → edit → save → verify updated
    const bill: Bill = {/* ... */}
    await db.bills.add(bill)
    expect((await db.bills.get(bill.id))?.merchant).toBe('TEST')
  })
})
```

### 3. Component Tests (for UI interactions)

```typescript
// Example: Testing BillEditor component
import { render, screen } from '@testing-library/react'
import BillEditor from '../../src/components/BillEditor'

it('displays edit form correctly', () => {
  render(<BillEditor bill={bill} onClose={() => {/* */}} />)
  expect(screen.getByRole('textbox', { name: /merchant/i })).toBeInTheDocument()
})
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run specific suite
npm test -- __tests__/unit/utils.test.ts

# Watch mode for development
npm run test:watch
```

## CI/CD Integration (GitHub Actions)

### Pre-commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/usr/bin/env bash
git diff-index --name-only HEAD -- | grep -qE '\.(tsx?|css?)$' || exit 0
npm test -- --run __tests__/
echo "✓ Tests passed before commit"
```

### Pull Request Checks
Tests run automatically on:
- Every pull request opened or updated
- Every push to main/develop branches

### Merge Requirements
All tests must pass before a PR can be merged:
1. ✓ TypeScript typecheck passes
2. ✓ Linting passes (oxlint)
3. ✓ All unit tests pass
4. ✓ All integration tests pass
5. ✓ Build succeeds without errors

## Test Coverage Targets

| File Type | Target Coverage |
|-----------|----------------|
| `utils.ts` | 90%+ |
| `useExtrapolate.ts` | 85%+ |
| Payday functions | 100% |
| Bill CRUD operations | 95%+ |

## Common Test Scenarios to Cover

### Bill Adding & Retrieval
- [x] Add new bill with all fields
- [x] Verify database persistence
- [x] Retrieve bills by owner, merchant, category
- [x] Count bills in specific categories

### Bill Editing
- [x] Update merchant name
- [x] Change owner (Tola ↔ Tomi)
- [x] Modify category selection
- [x] Edit frequency/cycle settings
- [x] Save changes persist to database
- [x] Handle multiple edits on same bill

### Payday Schedule Modification
- [x] Fortnightly: next payday calculation
- [x] Fortnightly: last payday calculation  
- [x] Twice-monthly: handle month-end transitions
- [x] Red zone detection for early payments
- [x] Handle weekend adjustments (configurable)

### Full Lifecycle Tests
- [x] Add → Edit → Save → Delete sequence
- [x] Verify data integrity after all operations
- [x] Test with various date ranges
- [x] Ensure no duplicate entries created

## Guidelines for AI Agents / Developers

1. **Always run tests** before committing changes
2. **Write failing tests first**, then implement features
3. **Use existing test patterns** from the codebase
4. **Keep tests fast and isolated** - one concept per test
5. **Add tests for edge cases**: empty strings, null values, boundary dates
6. **Mock external services** (database) in unit tests
7. **Use real data** in integration tests
8. **Document new test scenarios** in AGENTS_TESTING.md

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Watch mode for development |
| `npm run typecheck` | TypeScript compilation check |
| `npm run lint` | Lint code with oxlint |
| `.github/workflows/ci.yml` | CI/CD pipeline configuration |

## Troubleshooting

### Tests fail on CI but not locally?
- Check for environment variables (CI=true)
- Verify Node.js version matches CI requirements
- Run `pnpm install --frozen-lockfile`

### Slow tests?
- Use `--run` flag to avoid watch mode overhead
- Limit test concurrency with `--max-workers=1`

### Coverage too low?
- Add more edge cases to existing functions
- Test with null/undefined inputs
- Verify all code paths are exercised