/**
 * Enhanced API fetcher with caching, SWR, and conditional requests
 */

import { cached, cachedSWR } from './cache'
import { resilientFetch } from './resilience'

interface FetchOptions extends Omit<RequestInit, 'cache'> {
  cache?: boolean
  cacheTtl?: number
  revalidate?: number
  tag?: string
  retries?: number
}

/**
 * Enhanced fetch with aggressive caching
 */
export async function api<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const {
    cache: enableCache = true,
    cacheTtl = 300, // 5 minutes default
    retries = 3,
    ...fetchOptions
  } = options

  const cacheKey = `api:${url}:${JSON.stringify(fetchOptions)}`

  if (enableCache) {
    return cached(cacheKey, cacheTtl, async () => {
      const cleanOptions: RequestInit = {
        method: fetchOptions.method || 'GET',
        headers: fetchOptions.headers,
        body: fetchOptions.body,
        credentials: fetchOptions.credentials,
        mode: fetchOptions.mode,
        signal: fetchOptions.signal,
      }

      const response = await resilientFetch(url, {
        ...cleanOptions,
        retries,
        circuitKey: `api:${new URL(url).hostname}`,
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`)
      }

      return response.json()
    })
  }

  // Non-cached request
  const cleanOptions: RequestInit = {
    method: fetchOptions.method || 'GET',
    headers: fetchOptions.headers,
    body: fetchOptions.body,
    credentials: fetchOptions.credentials,
    mode: fetchOptions.mode,
    signal: fetchOptions.signal,
  }

  const response = await resilientFetch(url, {
    ...cleanOptions,
    retries,
    circuitKey: `api:${new URL(url).hostname}`,
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * API with stale-while-revalidate pattern
 */
export async function apiSWR<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const {
    cacheTtl = 300, // 5 minutes fresh
    revalidate = 600, // 10 minutes stale
    retries = 3,
    ...fetchOptions
  } = options

  const cacheKey = `api:swr:${url}:${JSON.stringify(fetchOptions)}`

  return cachedSWR(cacheKey, cacheTtl, revalidate, async () => {
    const cleanOptions: RequestInit = {
      method: fetchOptions.method || 'GET',
      headers: fetchOptions.headers,
      body: fetchOptions.body,
      credentials: fetchOptions.credentials,
      mode: fetchOptions.mode,
      signal: fetchOptions.signal,
    }

    const response = await resilientFetch(url, {
      ...cleanOptions,
      retries,
      circuitKey: `api:${new URL(url).hostname}`,
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  })
}

/**
 * Conditional requests with ETags
 */
export async function apiConditional<T>(
  url: string,
  options: FetchOptions & { lastEtag?: string; lastModified?: string } = {}
): Promise<{ data: T; notModified: boolean }> {
  const { lastEtag, lastModified, retries = 3, ...otherOptions } = options

  const cleanOptions: RequestInit = {
    method: otherOptions.method || 'GET',
    headers: otherOptions.headers,
    body: otherOptions.body,
    credentials: otherOptions.credentials,
    mode: otherOptions.mode,
    signal: otherOptions.signal,
  }

  const headers = new Headers(cleanOptions.headers)

  if (lastEtag) {
    headers.set('If-None-Match', lastEtag)
  }
  if (lastModified) {
    headers.set('If-Modified-Since', lastModified)
  }

  const response = await resilientFetch(url, {
    ...cleanOptions,
    headers,
    retries,
    circuitKey: `api:${new URL(url).hostname}`,
  })

  if (response.status === 304) {
    return { data: null as T, notModified: true }
  }

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return { data, notModified: false }
}

/**
 * Batch API calls
 */
export async function apiBatch<T>(
  requests: Array<{ url: string; options?: FetchOptions }>,
  options: { maxConcurrency?: number } = {}
): Promise<T[]> {
  const { maxConcurrency = 5 } = options

  const batches: Array<Array<{ url: string; options?: FetchOptions }>> = []
  for (let i = 0; i < requests.length; i += maxConcurrency) {
    batches.push(requests.slice(i, i + maxConcurrency))
  }

  const results: T[] = []

  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(({ url, options = {} }) => api<T>(url, options))
    )
    results.push(...batchResults)
  }

  return results
}

/**
 * GraphQL-style field selection for minimal payloads
 */
export function createFieldSelector<T>(baseUrl: string, defaultFields: (keyof T)[]) {
  return {
    select: (fields: (keyof T)[]) => {
      const fieldQuery = fields.join(',')
      const url = new URL(baseUrl)
      url.searchParams.set('fields', fieldQuery)
      return url.toString()
    },

    fetch: async (fields?: (keyof T)[]) => {
      const selectedFields = fields || defaultFields
      const url = createFieldSelector(baseUrl, defaultFields).select(selectedFields)
      return api<Partial<T>>(url)
    },
  }
}

/**
 * Debounced API calls for user input
 */
export function createDebouncedApi<T>(apiCall: (query: string) => Promise<T>, delay = 300) {
  let timeoutId: NodeJS.Timeout
  let lastQuery = ''
  let lastPromise: Promise<T> | null = null

  return (query: string): Promise<T> => {
    // Return cached promise if query hasn't changed
    if (query === lastQuery && lastPromise) {
      return lastPromise
    }

    lastQuery = query

    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId)

      timeoutId = setTimeout(async () => {
        try {
          lastPromise = apiCall(query)
          const result = await lastPromise
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}

/**
 * Auto-retry with exponential backoff
 */
export async function apiWithRetry<T>(
  url: string,
  options: FetchOptions & {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, ...fetchOptions } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await api<T>(url, { ...fetchOptions, retries: 0 })
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}
