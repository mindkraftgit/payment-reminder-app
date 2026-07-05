# Payment Reminder App

A React application to track bills and payment schedules.

## Testing Setup

This project has comprehensive automated tests with CI/CD integration:

### Test Infrastructure
- **Unit tests**: `__tests__/unit/` - Fast function tests without database
- **Integration tests**: `__tests__/integration/` - Database CRUD operations, full lifecycle flows
- **CI/CD pipeline**: GitHub Actions run all tests on every PR and commit
- **Pre-commit hook**: Runs tests before each git commit (requires passing)

### Test Coverage Areas
1. **Data Entry** - Adding new bills with validation
2. **Retrieval** - Fetching by owner, category, date range
3. **Editing** - Updating all bill fields through BillEditor component
4. **Payday Schedules** - Fortnightly and twice-monthly calculations
5. **Bill Lifecycle** - Complete add → edit → delete sequences
6. **Database Operations** - Dexie CRUD operations with coverage ≥90%

### How Tests Run in CI/CD

```
On PR or push:
  ↓
1. TypeScript typecheck (tsc --noEmit) ✅
2. Pre-commit hook: run unit + integration tests ✅
3. Linting with oxlint (no errors/warnings) ✅
4. Full test suite with coverage report ≥90% ✅
5. Build verification (pnpm build) ✅
6. Upload coverage to Codecov
7. Merge blocked if any step fails ❌
```

### Quick Test Commands
```bash
# Install dependencies (run once)
npm install --save-dev vitest @testing-library/react

# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### CI/CD Merge Gates - All Required Before PR Merge
- ✅ TypeScript compilation clean (no type errors)
- ✅ Linting passes with oxlint (no warnings)
- ✅ Unit tests pass with ≥90% coverage
- ✅ Integration tests pass against real database
- ✅ Build succeeds without errors

### Test Structure
```
__tests__/                      # Root test directory
├── setup.ts                    # Global configurations & fixtures
├── unit/                       # Unit tests (fast, no DB)
│   ├── utils.test.ts           # Functions in src/utils.ts
│   ├── useExtrapolate.test.ts  # Functions in src/hooks/useExtrapolate.ts
│   └── validation.test.ts      # Basic code quality checks
├── integration/                # Integration tests (with DB)
│   ├── database.test.ts        # CRUD operations verification
│   ├── bill-lifecycle.test.ts  # Full add/edit/delete flow
│   └── payday-schedules.test.ts # Schedule calculations with real data
```

### Best Practices Implemented
- Write failing tests first, then implement (TDD)
- One concept per test file for easy debugging
- Test edge cases: empty strings, null values, boundary dates
- Mock external services in unit tests, use real DB in integration tests
- Pre-commit hook enforces quality before every commit
- CI blocks merges if any tests fail

### Documentation Files
- `AGENTS_TESTING_GUIDELINES.md` - Testing best practices and patterns
- `TEST_README.md` - Detailed testing documentation for developers
- `AGENTS.md` - Project guidelines including testing requirements
- `ci.yml` - Full CI/CD workflow configuration

## Quick Start Guide

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Add test scenarios you need to verify
4. Run tests locally before committing: `npm test -- --run __tests__/unit/
5. Push changes and watch CI build automatically

## Contributing Guidelines

**Before submitting a PR:**
1. Run all tests: `npm run typecheck && npm test`
2. Fix any linting errors: `npm run lint:fix`
3. Ensure coverage targets are met for new modules
4. Write failing tests first, then implement the feature (TDD)
5. Update documentation if you add new components or features

**Test Naming Convention:**
- Unit: `utils.test.ts`, `useExtrapolate.test.ts`
- Integration: `database.test.ts`, `bill-lifecycle.test.ts`
- Component: `<ComponentName>.test.tsx`

## Testing Best Practices (AI Agents / Developers)

1. **Always run tests** before committing changes
2. **Write failing tests first**, then implement features
3. **Use existing test patterns** from the codebase
4. **Keep tests fast and isolated** - one concept per test
5. **Add edge case coverage**: empty strings, null values, boundary dates
6. **Mock external services** (database) in unit tests
7. **Use real data** in integration tests
8. **Document new scenarios** in AGENTS_TESTING_GUIDELINES.md

## CI/CD Workflow Details

See `.github/workflows/ci.yml` for the full pipeline configuration.

### Merge Requirements (Summary)
- All existing tests must pass ✅
- No new test failures introduced ✅ 
- Coverage targets met for all modules ✅
- TypeScript compilation clean ✅
- Linting warnings fixed ✅

## Troubleshooting

**Tests fail on CI but not locally?**
- Check environment variables (CI=true)
- Verify Node.js version matches CI requirements
- Run `pnpm install --frozen-lockfile`

**Slow test runs?**
- Use `--run` flag to avoid watch mode overhead
- Limit concurrency: `npm test -- --max-workers=1`

**Coverage too low?**
- Add more edge cases to existing functions
- Test with null/undefined inputs
- Verify all code paths are exercised