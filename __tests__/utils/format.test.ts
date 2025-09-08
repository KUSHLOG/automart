import { formatLKR, formatMileage, formatYear, parseLKRInput } from '../../src/lib/utils/format'

describe('Currency and Format Utils', () => {
  describe('formatLKR', () => {
    it('should format basic amounts', () => {
      expect(formatLKR(5400000)).toBe('LKR 5,400,000')
      expect(formatLKR(1000)).toBe('LKR 1,000')
      expect(formatLKR(100)).toBe('LKR 100')
    })

    it('should handle decimals option', () => {
      expect(formatLKR(5400000, { showDecimals: true })).toBe('LKR 5,400,000.00')
      expect(formatLKR(1000.5, { showDecimals: true })).toBe('LKR 1,000.50')
    })

    it('should handle symbol option', () => {
      expect(formatLKR(5400000, { showSymbol: false })).toBe('5,400,000')
      expect(formatLKR(1000, { showSymbol: false })).toBe('1,000')
    })

    it('should handle compact format', () => {
      expect(formatLKR(5400000, { compact: true })).toBe('LKR 5.4M')
      expect(formatLKR(5000000, { compact: true })).toBe('LKR 5M')
      expect(formatLKR(1500, { compact: true })).toBe('LKR 1.5K')
      expect(formatLKR(2000, { compact: true })).toBe('LKR 2K')
      expect(formatLKR(500, { compact: true })).toBe('LKR 500')
    })

    it('should handle edge cases', () => {
      expect(formatLKR(0)).toBe('LKR 0')
      expect(formatLKR(NaN)).toBe('LKR 0')
      expect(formatLKR(Infinity)).toBe('LKR 0')
      expect(formatLKR(-1000)).toBe('LKR -1,000')
    })

    it('should handle non-number inputs', () => {
      // @ts-expect-error - Testing invalid inputs intentionally
      expect(formatLKR('1000')).toBe('LKR 0')
      // @ts-expect-error - Testing invalid inputs intentionally
      expect(formatLKR(null)).toBe('LKR 0')
      // @ts-expect-error - Testing invalid inputs intentionally
      expect(formatLKR(undefined)).toBe('LKR 0')
    })

    it('should combine options correctly', () => {
      expect(
        formatLKR(5400000, {
          compact: true,
          showSymbol: false,
        })
      ).toBe('5.4M')

      expect(
        formatLKR(1000, {
          showDecimals: true,
          showSymbol: false,
        })
      ).toBe('1,000.00')
    })
  })

  describe('formatMileage', () => {
    it('should format valid mileage', () => {
      expect(formatMileage(62000)).toBe('62,000 km')
      expect(formatMileage(5000)).toBe('5,000 km')
      expect(formatMileage(0)).toBe('0 km')
    })

    it('should handle edge cases', () => {
      expect(formatMileage(-1000)).toBe('0 km')
      expect(formatMileage(NaN)).toBe('0 km')
      expect(formatMileage(Infinity)).toBe('0 km')
    })

    it('should handle non-number inputs', () => {
      expect(formatMileage('5000' as unknown as number)).toBe('0 km')
      expect(formatMileage(null as unknown as number)).toBe('0 km')
      expect(formatMileage(undefined as unknown as number)).toBe('0 km')
    })
  })

  describe('formatYear', () => {
    it('should format valid years', () => {
      expect(formatYear(2020)).toBe('2020')
      expect(formatYear(1995)).toBe('1995')
      expect(formatYear(2025)).toBe('2025')
    })

    it('should handle invalid years', () => {
      expect(formatYear(1800)).toBe('Unknown')
      expect(formatYear(2060)).toBe('Unknown')
      expect(formatYear(NaN)).toBe('Unknown')
      expect(formatYear(Infinity)).toBe('Unknown')
    })

    it('should handle non-number inputs', () => {
      expect(formatYear('2020' as unknown as number)).toBe('Unknown')
      expect(formatYear(null as unknown as number)).toBe('Unknown')
      expect(formatYear(undefined as unknown as number)).toBe('Unknown')
    })
  })

  describe('parseLKRInput', () => {
    it('should parse basic number strings', () => {
      expect(parseLKRInput('5400000')).toBe(5400000)
      expect(parseLKRInput('1000')).toBe(1000)
      expect(parseLKRInput('100.5')).toBe(101) // Rounded
    })

    it('should handle formatted currency strings', () => {
      expect(parseLKRInput('5,400,000')).toBe(5400000)
      expect(parseLKRInput('LKR 5,400,000')).toBe(5400000)
      expect(parseLKRInput('Rs. 1,000')).toBe(1000)
      expect(parseLKRInput('rs 500')).toBe(500)
      expect(parseLKRInput('  LKR  5,400,000  ')).toBe(5400000)
    })

    it('should handle decimal inputs', () => {
      expect(parseLKRInput('1000.50')).toBe(1001) // Rounded up
      expect(parseLKRInput('1000.25')).toBe(1000) // Rounded down
      expect(parseLKRInput('1000.75')).toBe(1001) // Rounded up
    })

    it('should handle invalid inputs', () => {
      expect(parseLKRInput('')).toBeNull()
      expect(parseLKRInput('abc')).toBeNull()
      expect(parseLKRInput('LKR abc')).toBeNull()
      expect(parseLKRInput('-1000')).toBeNull()
      expect(parseLKRInput(null as unknown as string)).toBeNull()
      expect(parseLKRInput(undefined as unknown as string)).toBeNull()
    })

    it('should handle edge cases', () => {
      expect(parseLKRInput('0')).toBe(0)
      expect(parseLKRInput('0.00')).toBe(0)
      expect(parseLKRInput('   ')).toBeNull()
      expect(parseLKRInput('LKR')).toBeNull()
      expect(parseLKRInput('Rs.')).toBeNull()
    })
  })
})
