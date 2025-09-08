/**
 * Circuit breaker and resilience patterns for third-party calls
 * Prevents paid overages from failing external services
 */

interface CircuitBreakerConfig {
  timeout: number
  errorThreshold: number
  resetTimeout: number
  monitoringWindow: number
}

interface CircuitState {
  failures: number
  lastFailureTime: number
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  nextAttempt: number
}

class CircuitBreaker {
  private states = new Map<string, CircuitState>()
  private config: CircuitBreakerConfig

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      timeout: 5000,
      errorThreshold: 5,
      resetTimeout: 30000,
      monitoringWindow: 60000,
      ...config,
    }
  }

  async execute<T>(key: string, fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const state = this.getState(key)
    const now = Date.now()

    // Check if circuit is open
    if (state.state === 'OPEN') {
      if (now < state.nextAttempt) {
        if (fallback) {
          return fallback()
        }
        throw new Error(`Circuit breaker OPEN for ${key}`)
      }
      // Try to half-open
      state.state = 'HALF_OPEN'
    }

    try {
      // Execute with timeout
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
        ),
      ])

      // Success - reset or keep closed
      if (state.state === 'HALF_OPEN') {
        state.state = 'CLOSED'
        state.failures = 0
      }

      return result
    } catch (error) {
      // Handle failure
      state.failures++
      state.lastFailureTime = now

      // Open circuit if threshold exceeded
      if (state.failures >= this.config.errorThreshold) {
        state.state = 'OPEN'
        state.nextAttempt = now + this.config.resetTimeout
      }

      this.states.set(key, state)

      // Try fallback
      if (fallback) {
        try {
          return await fallback()
        } catch {
          // Both failed, throw original error
          throw error
        }
      }

      throw error
    }
  }

  private getState(key: string): CircuitState {
    const existing = this.states.get(key)
    if (existing) {
      // Reset failures if outside monitoring window
      const now = Date.now()
      if (now - existing.lastFailureTime > this.config.monitoringWindow) {
        existing.failures = 0
        existing.state = 'CLOSED'
      }
      return existing
    }

    const newState: CircuitState = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED',
      nextAttempt: 0,
    }
    this.states.set(key, newState)
    return newState
  }

  getStats(key: string) {
    const state = this.states.get(key)
    return {
      state: state?.state || 'CLOSED',
      failures: state?.failures || 0,
      nextAttempt: state?.nextAttempt || 0,
    }
  }
}

// Global circuit breaker instance
export const circuitBreaker = new CircuitBreaker()

/**
 * Enhanced fetch with circuit breaker and retries
 */
export async function resilientFetch(
  url: string,
  options: RequestInit & {
    retries?: number
    backoff?: number
    circuitKey?: string
  } = {}
): Promise<Response> {
  const { retries = 3, backoff = 1000, circuitKey = url, ...fetchOptions } = options

  return circuitBreaker.execute(
    circuitKey,
    async () => {
      let lastError: Error

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await fetch(url, fetchOptions)

          // Don't retry on 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            return response
          }

          // Retry on 5xx errors
          if (!response.ok && attempt < retries) {
            throw new Error(`HTTP ${response.status}`)
          }

          return response
        } catch (error) {
          lastError = error as Error

          // Wait before retry (exponential backoff)
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, attempt)))
          }
        }
      }

      throw lastError!
    },
    // Fallback for critical services
    async () => {
      // Return cached response if available
      // Implementation would check cache here
      throw new Error('Service unavailable and no fallback available')
    }
  )
}

/**
 * Batch API calls with circuit breaker
 */
export async function batchApiCall<T>(
  items: string[],
  batchSize: number,
  apiCall: (batch: string[]) => Promise<T[]>,
  circuitKey: string
): Promise<T[]> {
  const results: T[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    const batchResults = await circuitBreaker.execute(`${circuitKey}:batch:${i}`, () =>
      apiCall(batch)
    )

    results.push(...batchResults)
  }

  return results
}

/**
 * Rate-limited API caller
 */
export class RateLimitedCaller {
  private lastCall = 0
  private queue: Array<() => void> = []
  private processing = false

  constructor(private intervalMs: number) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastCall = now - this.lastCall

      if (timeSinceLastCall < this.intervalMs) {
        await new Promise(resolve => setTimeout(resolve, this.intervalMs - timeSinceLastCall))
      }

      const fn = this.queue.shift()!
      this.lastCall = Date.now()

      // Execute without awaiting to allow concurrent processing
      fn()
    }

    this.processing = false
  }
}
