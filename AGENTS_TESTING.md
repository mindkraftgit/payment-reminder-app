[
  {
    "type": "problem",
    "title": "Test Suite Setup - Payment Reminder App",
    "body": [
      "1. Install test dependencies (vitest, @testing-library/react, jsdom)",
      "2. Create __tests__ directory structure with unit tests for:",
      "   - utils.ts (prettyName, getValidatedPayments, payday calculations)",
      "   - useExtrapolate.ts (extrapolatePayments function)",
      "   - database operations (CRUD)",
      "3. Create integration tests for:",
      "   - Full bill lifecycle: add → edit → delete",
      "   - Payday schedule calculations",
      "4. Update package.json with test scripts",
      "5. Add GitHub Actions workflow to run tests on PRs and commits",
      "6. Create AGENTS.md with testing guidelines"
    ],
    "priority": "high"
  }
]
