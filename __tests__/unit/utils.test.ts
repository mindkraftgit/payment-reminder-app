/**
 * Unit tests for utils.ts
 */
import { describe, it, expect } from 'vitest'
import {
  stripOwnerSuffix,
  formatAppleEntry,
  prettyName,
  getValidatedPayments,
} from '../../src/utils'

// Test owner suffix stripping (private)
describe('stripOwnerSuffix', () => {
  it('strips owner suffix correctly', () => {
    expect(stripOwnerSuffix('RENT-TOLA')).toBe('RENT')
    expect(stripOwnerSuffix('RENT-TOMI')).toBe('RENT')
    expect(stripOwnerSuffix('RENT')).toBe('RENT')
  })

  it('returns unchanged for non-owner suffix', () => {
    expect(stripOwnerSuffix('MY MERCHANT')).toBe('MY MERCHANT')
    expect(stripOwnerSuffix('UNKNOWN-TOLA')).toBe('UNKNOWN-TOLA') // unknown owner
  })
})

// Test Apple entry formatting (private)
describe('formatAppleEntry', () => {
  it('formats Apple entries correctly', () => {
    expect(formatAppleEntry('APPLE.COM/BILL-ICLOUD')).toBe('ICLOUD - Apple')
    expect(formatAppleEntry('NOT APPLE')).toBe('NOT APPLE')
  })
})

// Test pretty name transformation (public)
describe('prettyName', () => {
  it('handles /BILL- separator correctly', () => {
    expect(prettyName('APPLE.COM/BILL-ICLOUDSUBSCRIPTION')).toBe('ICLOUD - Apple')
    expect(prettyName('SPOTIFY/BILL-SOMETHING')).toBe('SPOTIFY BILL SOMETHING')
  })

  it('handles /BILL- at end of string', () => {
    expect(prettyName('APPLE.COM/BILL-')).toBe('APPLE.COM')
  })

  it('normalizes uppercase and repeats', () => {
    expect(prettyName('AA INSURANCE-TOLA')).toBe('AA Insurance - Tola')
    // Should remove duplicate letters
    expect(prettyName('GOOGLE YOUTUBE*PREMIUM')).toBe('Google Youtube Premium')
  })

  it('handles Baycorp TFR pattern', () => {
    expect(
      prettyName('Baycorp TFR TO Baycorp-860961-TOLA')
    ).toBe('Baycorp - Tola (860961)')
  })

  it('capitalizes correctly', () => {
    expect(prettyName('spotify')).toBe('Spotify')
    expect(prettyName('GOOGLE YOUTUBE PREMIUM')).toBe('Google Youtube Premium')
  })
})
