# Testing Guidelines

## Adding New Tests

1. **Identify what needs testing**: utility functions, components, database operations
2. **Write the test first** (red/green/refactor approach)
3. **Keep tests focused**: one concept per test file
4. **Name tests descriptively**: `it('can update merchant name after adding')`
5. **Use proper assertions**: `expect(actual).toBe(expected)`
6. **Test edge cases**: empty strings, null values, boundary dates

### Test Naming Convention
- Unit: `utils.test.ts`, `useExtrapolate.test.ts`
- Integration: `database.test.ts`, `bill-lifecycle.test.ts`
- Component: `BillEditor.test.tsx`

## Running Tests in CI/CD

The CI workflow (`ci.yml`) runs:
1. TypeScript typecheck
2. Linting (oxlint)
3. All unit tests with coverage
4. Integration tests against real database
5. Build verification

### Required for PR merges:
- ✅ All tests pass in CI
- ✅ Coverage meets targets
- ✅ No new warnings added
- ✅ Type errors fixed

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests fail locally but not in CI | Check environment variables, Node version |
| Slow test runs | Use `--run` flag, limit workers with `--max-workers=1` |
| Low coverage | Add edge cases, test null/undefined inputs |
| Database connection issues | Use mocks for unit tests, real DB for integration |

## Test File Structure

```
__tests__/
├── setup.ts                    # Global fixtures & configurations
├── unit/
│   ├── utils.test.ts           # Functions in src/utils.ts
│   └── useExtrapolate.test.ts  # Functions in src/hooks/useExtrapolate.ts
├── integration/
│   ├── database.test.ts        # CRUD operations
│   ├── bill-lifecycle.test.ts  # Full add/edit/delete flow
│   └── payday-schedules.test.ts # Schedule calculations
└── components/                 # Component tests (optional)
```
