 // Simple setup - no external dependencies needed for basic vitest tests

export default {}  // Empty export since we're using globals: true in config (expect, describe are auto-imported by Vitest when global=true)
// If you need custom test helpers or mocks here
function myCustomSetup() {
    console.log('Test setup complete')
}
