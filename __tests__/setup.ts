import '@testing-library/jest-dom'

// Make expect available globally
globalThis.expect = await import('@jest/globals').then(m => m.expect)
