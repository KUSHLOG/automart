/**
 * React hook for debounced search with aggressive caching
 * Reduces API calls from user typing
 */

import { useState, useEffect, useMemo } from 'react'
import { api } from '@/lib/api'

interface VehicleListItem {
  id: string
  make: string
  model: string
  year: number
  price: number
  type: string
  createdAt: string
}

interface UseSearchOptions {
  delay?: number
  minLength?: number
  cacheTime?: number
}

interface SearchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useDebounceSearch<T>(
  searchFn: (query: string) => Promise<T>,
  query: string,
  options: UseSearchOptions = {}
): SearchResult<T> {
  const { delay = 300, minLength = 2, cacheTime = 300000 } = options // 5 min cache

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized debounced search function
  const debouncedSearch = useMemo(() => {
    const cache = new Map<string, { data: T; timestamp: number }>()
    let timeoutId: NodeJS.Timeout

    return (searchQuery: string): Promise<T> => {
      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId)

        // Check cache first
        const cached = cache.get(searchQuery)
        if (cached && Date.now() - cached.timestamp < cacheTime) {
          resolve(cached.data)
          return
        }

        timeoutId = setTimeout(async () => {
          try {
            const result = await searchFn(searchQuery)
            // Cache the result
            cache.set(searchQuery, { data: result, timestamp: Date.now() })

            // Clean old cache entries
            for (const [key, value] of cache.entries()) {
              if (Date.now() - value.timestamp > cacheTime) {
                cache.delete(key)
              }
            }

            resolve(result)
          } catch (err) {
            reject(err)
          }
        }, delay)
      })
    }
  }, [searchFn, delay, cacheTime])

  useEffect(() => {
    if (!query || query.length < minLength) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    debouncedSearch(query)
      .then(result => {
        setData(result)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Search failed')
        setLoading(false)
      })
  }, [query, minLength, debouncedSearch])

  return { data, loading, error }
}

/**
 * Pre-built vehicle search hook
 */
export function useVehicleSearch(query: string) {
  return useDebounceSearch(
    async (searchQuery: string) => {
      const url = new URL('/api/vehicles', window.location.origin)
      url.searchParams.set('q', searchQuery)
      url.searchParams.set('take', '20')

      return api<{ vehicles: VehicleListItem[]; hasMore: boolean; nextCursor: string | null }>(
        url.toString(),
        {
          cache: true,
          cacheTtl: 300, // 5 minutes
        }
      )
    },
    query,
    {
      delay: 300,
      minLength: 2,
      cacheTime: 300000, // 5 minutes
    }
  )
}

/**
 * Search suggestions hook with aggressive caching
 */
export function useSearchSuggestions(query: string) {
  return useDebounceSearch(
    async (searchQuery: string) => {
      // This would call a suggestions endpoint
      return api<string[]>(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`, {
        cache: true,
        cacheTtl: 600, // 10 minutes for suggestions
      })
    },
    query,
    {
      delay: 150, // Faster for suggestions
      minLength: 1,
      cacheTime: 600000, // 10 minutes
    }
  )
}

/**
 * Infinite scroll hook with caching
 */
export function useInfiniteVehicles(filters: Record<string, unknown>) {
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  const loadMore = useMemo(
    () => async () => {
      if (loading || !hasMore) return

      setLoading(true)
      try {
        const url = new URL('/api/vehicles', window.location.origin)

        // Add filters to URL
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value.toString())
          }
        })

        if (cursor) {
          url.searchParams.set('cursor', cursor)
        }

        const result = await api<{
          vehicles: VehicleListItem[]
          hasMore: boolean
          nextCursor: string | null
        }>(url.toString(), {
          cache: true,
          cacheTtl: 300,
        })

        setVehicles(prev => [...prev, ...result.vehicles])
        setHasMore(result.hasMore)
        setCursor(result.nextCursor)
      } catch (error) {
        console.error('Failed to load vehicles:', error)
      } finally {
        setLoading(false)
      }
    },
    [loading, hasMore, filters, cursor]
  )

  const reset = useMemo(
    () => () => {
      setVehicles([])
      setCursor(null)
      setHasMore(true)
    },
    []
  )

  useEffect(() => {
    reset()
    loadMore()
  }, [reset, loadMore])

  return {
    vehicles,
    loading,
    hasMore,
    loadMore,
    reset,
  }
}
