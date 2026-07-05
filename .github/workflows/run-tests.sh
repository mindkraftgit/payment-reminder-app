#!/usr/bin/env bash
# Comprehensive test runner script for Payment Reminder App
#
# Usage:
#   ./run-tests.sh          # Run all tests
#   ./run-tests.sh unit     # Run only unit tests
#   ./run-tests.sh integration  # Run only integration tests
#   ./run-tests.sh coverage # Run with coverage report

echo "========================================"
echo "Payment Reminder App - Test Runner"
echo "========================================"

set -e  # Exit on error

TEST_TYPE="${1:-all}"

# Check if test dependencies are installed
if ! command -v vitest &> /dev/null; then
    echo "Installing test dependencies..."
    npm install --save-dev vitest @testing-library/react @types/vitest 2>/dev/null || \
    pnpm add -D vitest @testing-library/react @types/vitest >/dev/null 2>&1 || {
        echo "Failed to install tests. Running in mock mode..."
        echo "Running basic validation tests only..."
        npm test -- --run __tests__/unit/validation.test.ts || true
    }
fi

echo "Test type: $TEST_TYPE"
echo "----------------------------------------"

# Run specific test suites based on TEST_TYPE
if [ "$TEST_TYPE" = "all" ]; then
    echo "Running all tests..."
    npm test -- --run
elif [ "$TEST_TYPE" = "unit" ]; then
    echo "Running unit tests only..."
    npm test -- --run __tests__/unit/
elif [ "$TEST_TYPE" = "integration" ]; then
    echo "Running integration tests only..."
    npm test -- --run __tests__/integration/
else
    echo "Unknown test type: $TEST_TYPE"
    echo "Available options: all, unit, integration"
    exit 1
fi

echo "----------------------------------------"
echo "Tests completed successfully!"
