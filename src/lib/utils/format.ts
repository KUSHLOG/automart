/**
 * Currency formatting utilities for LKR
 */

/**
 * Format price in Sri Lankan Rupees
 */
export interface FormatLKROptions {
  showDecimals?: boolean
  showSymbol?: boolean
  compact?: boolean
}

export const formatLKR = (amount: number, options?: FormatLKROptions): string => {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return 'LKR 0'
  }

  const { showDecimals = false, showSymbol = true, compact = false } = options || {}

  let formatted: string

  if (compact) {
    const formatter = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })
    formatted = formatter.format(amount)
  } else {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    })
    formatted = formatter.format(amount)
  }

  return showSymbol ? `LKR ${formatted}` : formatted
}

/**
 * Format mileage with units
 */
export const formatMileage = (mileage: number): string => {
  if (typeof mileage !== 'number' || isNaN(mileage) || mileage < 0 || !isFinite(mileage)) {
    return '0 km'
  }
  return (
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(mileage) + ' km'
  )
}

/**
 * Format year (basic validation)
 */
export function formatYear(year: number): string {
  if (typeof year !== 'number' || isNaN(year) || year < 1900 || year > 2050) {
    return 'Unknown'
  }

  return year.toString()
}

/**
 * Parse price from string input (for forms)
 */
export function parseLKRInput(input: string): number | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  // Remove common characters
  const cleaned = input
    .replace(/[,\s]/g, '') // Remove commas and spaces
    .replace(/LKR/i, '') // Remove LKR prefix
    .replace(/Rs\.?/i, '') // Remove Rs. prefix
    .trim()

  const num = parseFloat(cleaned)
  return isNaN(num) || num < 0 ? null : Math.round(num)
}
