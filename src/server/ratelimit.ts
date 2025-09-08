import { ENV } from './env'

// Simple in-memory rate limiter for development
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const windowStart = Math.floor(now / windowMs) * windowMs
    const resetTime = windowStart + windowMs

    const existing = this.store.get(key)
    if (!existing || existing.resetTime <= now) {
      const newEntry = { count: 1, resetTime }
      this.store.set(key, newEntry)
      return newEntry
    }

    existing.count++
    return existing
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }
}

// Redis implementation for production (optional)
class RedisStore {
  private redis: {
    incr: (key: string) => Promise<number>
    expire: (key: string, seconds: number) => Promise<number>
  } | null = null

  constructor() {
    if (ENV.REDIS_URL) {
      try {
        // Lazy load Redis only if URL is provided
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Redis = require('ioredis')
        this.redis = new Redis(ENV.REDIS_URL)
      } catch (error) {
        console.warn('Redis not available:', error)
        this.redis = null
      }
    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    if (!this.redis) {
      throw new Error('Redis not configured')
    }

    const windowStart = Math.floor(Date.now() / windowMs) * windowMs
    const redisKey = `rl:${key}:${windowStart}`
    const resetTime = windowStart + windowMs

    const count = await this.redis.incr(redisKey)
    if (count === 1) {
      await this.redis.expire(redisKey, Math.ceil(windowMs / 1000))
    }

    return { count, resetTime }
  }
}

const store = ENV.REDIS_URL ? new RedisStore() : new MemoryStore()

// Cleanup memory store periodically
if (store instanceof MemoryStore) {
  setInterval(() => store.cleanup(), 60000) // Cleanup every minute
}

export async function rateLimit(
  identifier: string,
  limit = 60,
  windowMs = 60000
): Promise<{
  success: boolean
  count: number
  remaining: number
  resetTime: number
}> {
  const key = `rate_limit:${identifier}`

  try {
    const { count, resetTime } = await store.increment(key, windowMs)
    const remaining = Math.max(0, limit - count)
    const success = count <= limit

    return {
      success,
      count,
      remaining,
      resetTime,
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      count: 0,
      remaining: limit,
      resetTime: Date.now() + windowMs,
    }
  }
}

// Helper to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}
