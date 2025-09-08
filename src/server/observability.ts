// Observability utilities for monitoring performance and costs

interface LogEvent {
  event: string
  [key: string]: unknown
}

interface CacheEvent extends LogEvent {
  event: 'cache'
  key: string
  hit: boolean
  ttl?: number
}

interface ThirdPartyCallEvent extends LogEvent {
  event: 'tp_call'
  endpoint: string
  method: string
  status: number
  duration?: number
  cached?: boolean
}

interface DatabaseEvent extends LogEvent {
  event: 'db_query'
  operation: string
  table: string
  duration: number
  rowCount?: number
}

interface RateLimitEvent extends LogEvent {
  event: 'rate_limit'
  identifier: string
  limit: number
  remaining: number
  blocked: boolean
}

// Structured logging for better observability
export function logEvent(event: LogEvent): void {
  if (process.env.NODE_ENV === 'development') {
    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        ...event,
      })
    )
  } else {
    // In production, you might want to send to a logging service
    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        ...event,
      })
    )
  }
}

// Cache performance tracking
export function logCacheEvent(key: string, hit: boolean, ttl?: number): void {
  const event: CacheEvent = {
    event: 'cache',
    key,
    hit,
    ttl,
  }
  logEvent(event)
}

// Third-party API call tracking
export function logThirdPartyCall(
  endpoint: string,
  method: string,
  status: number,
  duration?: number,
  cached?: boolean
): void {
  const event: ThirdPartyCallEvent = {
    event: 'tp_call',
    endpoint,
    method,
    status,
    duration,
    cached,
  }
  logEvent(event)
}

// Database query performance tracking
// Database query events
export function logDatabaseQuery(
  operation: string,
  table: string,
  duration: number,
  rowCount?: number
): void {
  const event: DatabaseEvent = {
    event: 'db_query',
    operation,
    table,
    duration,
    rowCount,
  }
  logEvent(event)
}

// Rate limiting events
export function logRateLimit(
  identifier: string,
  limit: number,
  remaining: number,
  blocked: boolean
): void {
  const event: RateLimitEvent = {
    event: 'rate_limit',
    identifier,
    limit,
    remaining,
    blocked,
  }
  logEvent(event)
}

// Performance timer utility
export class PerformanceTimer {
  private startTime: number

  constructor() {
    this.startTime = performance.now()
  }

  stop(): number {
    return performance.now() - this.startTime
  }
}

// Wrapper for measuring function execution time
export async function measureAsync<T>(
  fn: () => Promise<T>,
  eventName: string,
  metadata?: Record<string, unknown>
): Promise<T> {
  const timer = new PerformanceTimer()
  try {
    const result = await fn()
    const duration = timer.stop()

    logEvent({
      event: 'performance',
      name: eventName,
      duration,
      success: true,
      ...metadata,
    })

    return result
  } catch (error) {
    const duration = timer.stop()

    logEvent({
      event: 'performance',
      name: eventName,
      duration,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...metadata,
    })

    throw error
  }
}

// Simple metrics aggregation (in-memory for development)
class MetricsCollector {
  private metrics = new Map<string, { count: number; totalDuration: number }>()

  record(name: string, duration: number): void {
    const existing = this.metrics.get(name) || { count: 0, totalDuration: 0 }
    existing.count++
    existing.totalDuration += duration
    this.metrics.set(name, existing)
  }

  getStats(): Record<string, { count: number; avgDuration: number }> {
    const stats: Record<string, { count: number; avgDuration: number }> = {}

    for (const [name, metric] of this.metrics.entries()) {
      stats[name] = {
        count: metric.count,
        avgDuration: metric.totalDuration / metric.count,
      }
    }

    return stats
  }

  reset(): void {
    this.metrics.clear()
  }
}

export const metrics = new MetricsCollector()

// Report metrics periodically (every 5 minutes in development)
if (process.env.NODE_ENV === 'development') {
  setInterval(
    () => {
      const stats = metrics.getStats()
      if (Object.keys(stats).length > 0) {
        logEvent({
          event: 'metrics_report',
          stats,
        })
        metrics.reset()
      }
    },
    5 * 60 * 1000
  ) // 5 minutes
}
