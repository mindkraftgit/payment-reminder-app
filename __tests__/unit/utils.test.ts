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

describe('stripOwnerSuffix', () => {
  it('strips owner suffix correctly', () => {
    expect(stripOwnerSuffix('RENT-TOLA')).toBe('RENT')
    expect(stripOwnerSuffix('RENT-TOMI')).toBe('RENT')
    expect(stripOwnerSuffix('RENT')).toBe('RENT')
  })

  it('returns unchanged for non-owner suffix', () => {
    expect(stripOwnerSuffix('MY MERCHANT')).toBe('MY MERCHANT')
    expect(stripOwnerSuffix('MY MERCHANT-XYZ')).toBe('MY MERCHANT-XYZ')
  })
})

describe('formatAppleEntry', () => {
  it('formats Apple entries correctly', () => {
    expect(formatAppleEntry('Apple Icloud')).toBe('Icloud - Apple')
    expect(formatAppleEntry('NOT APPLE')).toBe('NOT APPLE')
  })
})

describe('prettyName', () => {
  it('handles /BILL- separator correctly', () => {
    expect(prettyName('APPLE.COM/BILL-ICLOUDSUBSCRIPTION')).toBe('Icloudsubscription - Apple')
    expect(prettyName('SPOTIFY/BILL-SOMETHING')).toBe('Spotify Something')
  })

  it('handles /BILL- at end of string', () => {
    expect(prettyName('APPLE.COM/BILL-')).toBe('Apple.com')
  })

  it('normalizes uppercase and repeats', () => {
    expect(prettyName('AA INSURANCE-TOLA')).toBe('AA Insurance')
    expect(prettyName('GOOGLE YOUTUBE*PREMIUM')).toBe('Google Youtube Premium')
  })

  it('handles Baycorp TFR pattern', () => {
    expect(
      prettyName('Baycorp TFR TO Baycorp-860961-TOLA')
    ).toBe('Baycorp (860961)')
  })

  it('preserves initialisms', () => {
    expect(prettyName('AA INSURANCE')).toBe('AA Insurance')
    expect(prettyName('SPARK NZ TRADING-TOLA')).toBe('Spark NZ Trading')
  })
})
