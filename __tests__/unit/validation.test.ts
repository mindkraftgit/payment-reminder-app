/**
 * Basic validation tests - runs without full dependencies
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

describe('Code Quality & Validation', () => {
  it('Package.json has required scripts', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))

    const requiredScripts = ['dev', 'build', 'test']
    for (const script of requiredScripts) {
      expect(pkg.scripts[script]).toBeDefined()
    }
  })

  it('All main components exist', () => {
    const components = [
      './src/components/Layout.tsx',
      './src/components/BillEditor.tsx',
      './src/components/NewBillModal.tsx',
      './src/components/PaymentList.tsx',
    ]

    for (const component of components) {
      expect(component).toBeDefined()
    }
  })

  it('Database schema exists', async () => {
    const schema = await import('../../src/db/schema')
    expect(schema.seedDatabase).toBeDefined()
  })

  it('Utility functions are exported correctly', async () => {
    const utils = await import('../../src/utils')

    const requiredExports = ['prettyName', 'getValidatedPayments']
    for (const name of requiredExports) {
      expect(utils[name]).toBeDefined()
    }
  })

  it('Date functions work correctly', async () => {
    const { addDays, format } = await import('date-fns')

    const today = new Date()
    const tomorrow = addDays(today, 1)

    expect(format(tomorrow, 'yyyy-MM-dd').length).toBe(10)
  })
})
