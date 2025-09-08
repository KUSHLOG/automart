/**
 * Multi-layer caching system for cost optimization
 * - Redis for shared cache across instances
 * - Memory for single-instance caching
 * - Request coalescing to prevent cache stampedes
 */

import Redis from 'ioredis'
import { ENV } from '@/server/env'

// Redis client for shared caching
let redis: Redis | null = null

if (ENV.NODE_ENV === 'production' && ENV.REDIS_URL) {
  redis = new Redis(ENV.REDIS_URL, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
}

// In-memory cache for single instance
const memoryCache = new Map<string, { value: unknown; expires: number }>()

// Request coalescing to prevent cache stampedes
const inflight = new Map<string, Promise<unknown>>()

/**
 * Generic cached function with Redis fallback to memory
 */
export async function cached<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>,
  options: {
    memoryOnly?: boolean
  } = {}
): Promise<T> {
  const { memoryOnly = false } = options
  const now = Date.now()

  // Check memory cache first (always fastest)
  const memoryEntry = memoryCache.get(key)
  if (memoryEntry && memoryEntry.expires > now) {
    return memoryEntry.value as T
  }

  // Check Redis cache if available
  if (!memoryOnly && redis) {
    try {
      const redisValue = await redis.get(key)
      if (redisValue) {
        const parsed = JSON.parse(redisValue) as T
        // Update memory cache
        memoryCache.set(key, {
          value: parsed,
          expires: now + ttl * 1000,
        })
        return parsed
      }
    } catch (error) {
      console.warn('Redis cache read failed:', error)
    }
  }

  // Use request coalescing to prevent multiple concurrent fetches
  if (inflight.has(key)) {
    return inflight.get(key) as Promise<T>
  }

  const promise = fn()
    .then(async value => {
      // Store in memory cache
      memoryCache.set(key, {
        value,
        expires: now + ttl * 1000,
      })

      // Store in Redis cache if available
      if (!memoryOnly && redis) {
        try {
          await redis.set(key, JSON.stringify(value), 'EX', ttl)
        } catch (error) {
          console.warn('Redis cache write failed:', error)
        }
      }

      return value
    })
    .finally(() => {
      inflight.delete(key)
    })

  inflight.set(key, promise)
  return promise
}

/**
 * Cache with stale-while-revalidate pattern
 */
export async function cachedSWR<T>(
  key: string,
  ttl: number,
  staleTtl: number,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const memoryEntry = memoryCache.get(key)

  // Return stale data immediately if available
  if (memoryEntry && memoryEntry.expires + staleTtl * 1000 > now) {
    // Trigger background revalidation if data is stale
    if (memoryEntry.expires < now) {
      cached(key, ttl, fn, { memoryOnly: false }).catch(console.error)
    }
    return memoryEntry.value as T
  }

  // Otherwise fetch fresh data
  return cached(key, ttl, fn)
}

/**
 * Invalidate cache entries by pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  // Clear memory cache
  for (const [key] of memoryCache) {
    if (key.includes(pattern)) {
      memoryCache.delete(key)
    }
  }

  // Clear Redis cache if available
  if (redis) {
    try {
      const keys = await redis.keys(`*${pattern}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.warn('Redis cache invalidation failed:', error)
    }
  }
}

/**
 * Generate cache key from object parameters
 */
export function createCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|')
  return `${prefix}:${sortedParams}`
}

/**
 * Batch cache operations
 */
export async function batchCached<T>(
  keys: string[],
  ttl: number,
  fn: (missingKeys: string[]) => Promise<Record<string, T>>
): Promise<Record<string, T>> {
  const result: Record<string, T> = {}
  const missingKeys: string[] = []

  // Check what we have in cache
  for (const key of keys) {
    const memoryEntry = memoryCache.get(key)
    if (memoryEntry && memoryEntry.expires > Date.now()) {
      result[key] = memoryEntry.value as T
    } else {
      missingKeys.push(key)
    }
  }

  // Fetch missing data
  if (missingKeys.length > 0) {
    const freshData = await fn(missingKeys)
    const now = Date.now()

    for (const [key, value] of Object.entries(freshData)) {
      result[key] = value
      memoryCache.set(key, {
        value,
        expires: now + ttl * 1000,
      })
    }
  }

  return result
}

/**
 * Cleanup expired memory cache entries
 */
export function cleanupMemoryCache(): void {
  const now = Date.now()
  for (const [key, entry] of memoryCache) {
    if (entry.expires < now) {
      memoryCache.delete(key)
    }
  }
}

// Cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupMemoryCache, 5 * 60 * 1000)
}
