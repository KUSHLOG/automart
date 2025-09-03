/**
 * View tracking utilities with session/IP deduplication and bot detection
 */

export interface ViewSession {
  vehicleId: string
  sessionId: string
  timestamp: number
  userAgent?: string
  ip?: string
}

// In-memory store for demo (use Redis/DB in production)
let viewSessions: ViewSession[] = []

/**
 * Check if user agent appears to be a bot
 */
export function isBot(userAgent?: string | null): boolean {
  if (!userAgent || typeof userAgent !== 'string') return false

  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /scrapy/i,
    /curl/i,
    /wget/i,
    /postman/i,
    /insomnia/i,
    /lighthouse/i,
    /pagespeed/i,
    /facebook/i,
    /externalhit/i,
  ]

  return botPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Generate session ID from IP and user agent (simplified)
 */
export function generateSessionId(ip?: string, userAgent?: string): string {
  const combined = `${ip || 'unknown'}_${userAgent || 'unknown'}`
  // Simple hash function for demo
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Check if view should be counted (idempotent per session)
 */
export function shouldCountView(
  vehicleId: string,
  sessionId: string,
  userAgent?: string,
  ip?: string
): boolean {
  // Don't count bot views
  if (isBot(userAgent)) {
    return false
  }

  const now = Date.now()
  const twentyFourHours = 24 * 60 * 60 * 1000

  // Clean old sessions (older than 24h)
  viewSessions = viewSessions.filter(session => now - session.timestamp < twentyFourHours)

  // Check if this session already viewed this vehicle
  const existingView = viewSessions.find(
    session => session.vehicleId === vehicleId && session.sessionId === sessionId
  )

  if (existingView) {
    return false // Already counted this session
  }

  // Record the view
  viewSessions.push({
    vehicleId,
    sessionId,
    timestamp: now,
    userAgent,
    ip,
  })

  return true
}

/**
 * Get view count for testing
 */
export function getViewSessionCount(): number {
  return viewSessions.length
}

/**
 * Clear view sessions (for testing)
 */
export function clearViewSessions(): void {
  viewSessions = []
}

/**
 * Get top N most viewed vehicles with stable sorting for ties
 */
export function getMostViewedVehicles<T extends { id: string; views: number; createdAt: Date }>(
  vehicles: T[],
  limit = 5
): T[] {
  return vehicles
    .slice() // Don't mutate original
    .sort((a, b) => {
      // Primary sort: views (descending)
      if (b.views !== a.views) {
        return b.views - a.views
      }
      // Tie-breaker: creation date (oldest first for stable ranking)
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    .slice(0, limit)
}
