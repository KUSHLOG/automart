import {
  isBot,
  generateSessionId,
  shouldCountView,
  getViewSessionCount,
  clearViewSessions,
  getMostViewedVehicles,
} from '@/lib/utils/views'

// Mock Date.now for consistent testing
const mockDateNow = jest.spyOn(Date, 'now')

describe('View Tracking System', () => {
  beforeEach(() => {
    clearViewSessions()
    mockDateNow.mockReturnValue(1640995200000) // 2022-01-01 00:00:00
  })

  afterAll(() => {
    mockDateNow.mockRestore()
  })

  describe('isBot', () => {
    it('should detect common bots', () => {
      expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1;)')).toBe(true)
      expect(isBot('facebookexternalhit/1.1')).toBe(true)
      expect(isBot('curl/7.68.0')).toBe(true)
      expect(isBot('PostmanRuntime/7.26.5')).toBe(true)
      expect(isBot('Mozilla/5.0 (X11; Linux x86_64) Spider/1.0')).toBe(true)
      expect(isBot('Scrapy/2.5.0')).toBe(true)
      expect(
        isBot(
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36 Lighthouse/7.0.0'
        )
      ).toBe(true)
    })

    it('should not flag regular browsers', () => {
      expect(isBot('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')).toBe(false)
      expect(isBot('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')).toBe(
        false
      )
      expect(isBot('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isBot('')).toBe(false)
      // @ts-ignore - Testing invalid inputs intentionally
      expect(isBot(undefined)).toBe(false)
      // @ts-ignore - Testing invalid inputs intentionally
      expect(isBot(null)).toBe(false)
    })
  })

  describe('generateSessionId', () => {
    it('should generate consistent IDs for same input', () => {
      const id1 = generateSessionId('192.168.1.1', 'Chrome/1.0')
      const id2 = generateSessionId('192.168.1.1', 'Chrome/1.0')

      expect(id1).toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })

    it('should generate different IDs for different input', () => {
      const id1 = generateSessionId('192.168.1.1', 'Chrome/1.0')
      const id2 = generateSessionId('192.168.1.2', 'Chrome/1.0')
      const id3 = generateSessionId('192.168.1.1', 'Firefox/1.0')

      expect(id1).not.toBe(id2)
      expect(id1).not.toBe(id3)
      expect(id2).not.toBe(id3)
    })

    it('should handle missing parameters', () => {
      const id1 = generateSessionId()
      const id2 = generateSessionId(undefined, undefined)

      expect(id1).toBe(id2)
      expect(typeof id1).toBe('string')
    })
  })

  describe('shouldCountView', () => {
    const vehicleId = 'v1'
    const sessionId = 'session123'
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

    it('should count first view from session', () => {
      const shouldCount = shouldCountView(vehicleId, sessionId, userAgent)

      expect(shouldCount).toBe(true)
      expect(getViewSessionCount()).toBe(1)
    })

    it('should not count duplicate views from same session', () => {
      // First view
      expect(shouldCountView(vehicleId, sessionId, userAgent)).toBe(true)

      // Second view from same session
      expect(shouldCountView(vehicleId, sessionId, userAgent)).toBe(false)

      expect(getViewSessionCount()).toBe(1)
    })

    it('should count views from different sessions', () => {
      expect(shouldCountView(vehicleId, 'session1', userAgent)).toBe(true)
      expect(shouldCountView(vehicleId, 'session2', userAgent)).toBe(true)

      expect(getViewSessionCount()).toBe(2)
    })

    it('should count views of different vehicles from same session', () => {
      expect(shouldCountView('v1', sessionId, userAgent)).toBe(true)
      expect(shouldCountView('v2', sessionId, userAgent)).toBe(true)

      expect(getViewSessionCount()).toBe(2)
    })

    it('should not count bot views', () => {
      const botUA = 'Googlebot/2.1'

      expect(shouldCountView(vehicleId, sessionId, botUA)).toBe(false)
      expect(getViewSessionCount()).toBe(0)
    })

    it('should clean up old sessions', () => {
      // Add a view
      const result1 = shouldCountView(vehicleId, sessionId, userAgent)
      expect(result1).toBe(true)
      expect(getViewSessionCount()).toBe(1)

      // Move time forward by 25 hours (past the 24h cleanup window)
      mockDateNow.mockReturnValue(1640995200000 + 25 * 60 * 60 * 1000)

      // This should trigger cleanup and count as new view (since old session was cleaned)
      const result2 = shouldCountView(vehicleId, sessionId, userAgent)
      expect(result2).toBe(true) // Should be true because old session was cleaned up
      expect(getViewSessionCount()).toBe(1) // New session replaces old cleaned one
    })

    it('should maintain sessions within 24h window', () => {
      shouldCountView(vehicleId, sessionId, userAgent)
      expect(getViewSessionCount()).toBe(1)

      // Move time forward by 23 hours (still within window)
      mockDateNow.mockReturnValue(1640995200000 + 23 * 60 * 60 * 1000)

      // Should not count again
      expect(shouldCountView(vehicleId, sessionId, userAgent)).toBe(false)
      expect(getViewSessionCount()).toBe(1)
    })
  })

  describe('getMostViewedVehicles', () => {
    const createVehicle = (id: string, views: number, daysAgo = 0) => ({
      id,
      views,
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      make: 'Test',
      model: 'Car',
    })

    it('should sort by view count descending', () => {
      const vehicles = [createVehicle('v1', 10), createVehicle('v2', 50), createVehicle('v3', 25)]

      const result = getMostViewedVehicles(vehicles)

      expect(result.map(v => v.id)).toEqual(['v2', 'v3', 'v1'])
      expect(result.map(v => v.views)).toEqual([50, 25, 10])
    })

    it('should handle tie-breaking with creation date', () => {
      const vehicles = [
        createVehicle('v1', 30, 5), // 5 days ago
        createVehicle('v2', 30, 3), // 3 days ago (newer)
        createVehicle('v3', 30, 7), // 7 days ago (older)
      ]

      const result = getMostViewedVehicles(vehicles)

      // Should be ordered by creation date (oldest first) for tie-breaking
      expect(result.map(v => v.id)).toEqual(['v3', 'v1', 'v2'])
    })

    it('should limit results correctly', () => {
      const vehicles = Array.from({ length: 10 }, (_, i) => createVehicle(`v${i}`, i * 10))

      const result = getMostViewedVehicles(vehicles, 3)

      expect(result).toHaveLength(3)
      expect(result[0].views).toBe(90) // Highest
    })

    it('should not mutate original array', () => {
      const vehicles = [createVehicle('v1', 10), createVehicle('v2', 20)]
      const originalOrder = vehicles.map(v => v.id)

      getMostViewedVehicles(vehicles)

      expect(vehicles.map(v => v.id)).toEqual(originalOrder)
    })

    it('should handle empty array', () => {
      const result = getMostViewedVehicles([])

      expect(result).toEqual([])
    })

    it('should handle fewer vehicles than limit', () => {
      const vehicles = [createVehicle('v1', 10), createVehicle('v2', 20)]

      const result = getMostViewedVehicles(vehicles, 5)

      expect(result).toHaveLength(2)
    })

    it('should maintain stable sort for complex ties', () => {
      const vehicles = [
        createVehicle('v1', 25, 10),
        createVehicle('v2', 25, 5),
        createVehicle('v3', 25, 15),
        createVehicle('v4', 30, 1),
      ]

      const result = getMostViewedVehicles(vehicles)

      expect(result[0].id).toBe('v4') // Highest views
      expect(result.slice(1).map(v => v.id)).toEqual(['v3', 'v1', 'v2']) // Tie-broken by age
    })
  })
})
