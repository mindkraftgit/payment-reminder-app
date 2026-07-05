# Test Runner for Payment Reminder App
# Usage: .\run-tests.ps1 [unit|integration|all|coverage]
param(
    [string]$TestType = "all"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Payment Reminder App - Test Runner" -ForegroundColor Cyan
Write-Host "========================================"

# Install test dependencies if not present
$hasVitest = $null -ne (Get-Command vitest -ErrorAction SilentlyContinue)
if (-not $hasVitest) {
    Write-Host "Installing test dependencies..." -ForegroundColor Yellow
    npm install --save-dev vitest @testing-library/react @types/vitest 2>&1 | Out-Null
}

Write-Host "Test type: $($TestType)"
Write-Host "----------------------------------------"

# Run appropriate tests based on TestType
switch ($TestType) {
    'all' {
        Write-Host "Running all tests..." -ForegroundColor Green
        npm test -- --run
    }
    'unit' {
        Write-Host "Running unit tests only..." -ForegroundColor Green
        npm test -- --run __tests__/unit/
    }
    'integration' {
        Write-Host "Running integration tests only..." -ForegroundColor Green
        npm test -- --run __tests__/integration/
    }
    'coverage' {
        Write-Host "Running tests with coverage report..." -ForegroundColor Green
        npm run test:coverage
    }
    default {
        Write-Host "Unknown test type: $($TestType)" -ForegroundColor Red
        Write-Host "Available options: all, unit, integration, coverage"
        exit 1
    }
}

Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Tests completed successfully!" -ForegroundColor Green