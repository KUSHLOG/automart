import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { listVehicles, validateSearchParams } from '@/server/validators'
import { rateLimit, getClientIP } from '@/server/ratelimit'
import { cached, createCacheKey } from '@/lib/cache'

// Enable static optimization with revalidation
export const revalidate = 300 // 5 minutes
export const dynamic = 'force-static' // prefer static

interface VehicleWhereInput {
  make?: { contains: string; mode: 'insensitive' }
  model?: { contains: string; mode: 'insensitive' }
  year?: number | { gte?: number; lte?: number }
  type?: 'BUY_NOW' | 'BIDDING'
  price?: { gte?: number; lte?: number }
  OR?: Array<{
    make?: { contains: string; mode: 'insensitive' }
    model?: { contains: string; mode: 'insensitive' }
    description?: { contains: string; mode: 'insensitive' }
  }>
}

export async function GET(req: Request) {
  try {
    // Rate limiting for search
    const clientIP = getClientIP(req)
    const rateLimitResult = await rateLimit(`search:${clientIP}`, 100, 60000) // 100 requests per minute

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      )
    }

    // Validate search parameters
    const { searchParams } = new URL(req.url)
    const validatedParams = validateSearchParams(listVehicles, searchParams)

    const { q, make, model, year, minPrice, maxPrice, type, take, cursor } = validatedParams

    // Create cache key for this specific query
    const cacheKey = createCacheKey('vehicles', {
      q,
      make,
      model,
      year,
      minPrice,
      maxPrice,
      type,
      take,
      cursor,
    })

    // Use aggressive caching with 5 minute TTL
    const vehicles = await cached(
      cacheKey,
      300, // 5 minutes
      async () => {
        // Build optimized query
        const where: VehicleWhereInput = {}

        if (make) {
          where.make = { contains: make, mode: 'insensitive' }
        }

        if (model) {
          where.model = { contains: model, mode: 'insensitive' }
        }

        if (year) {
          where.year = year
        }

        if (type && ['BUY_NOW', 'BIDDING'].includes(type)) {
          where.type = type as 'BUY_NOW' | 'BIDDING'
        }

        if (minPrice || maxPrice) {
          where.price = {}
          if (minPrice) where.price.gte = minPrice
          if (maxPrice) where.price.lte = maxPrice
        }

        // Global search across multiple fields
        if (q) {
          where.OR = [
            { make: { contains: q, mode: 'insensitive' } },
            { model: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ]
        }

        // Execute optimized query with minimal data transfer
        return await prisma.vehicle.findMany({
          where,
          take: take + 1, // Take one extra to check for next page
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            price: true,
            type: true,
            createdAt: true,
            // Only include description for search results
            ...(q && { description: true }),
          },
        })
      }
    )

    // Process results for pagination
    const hasMore = vehicles.length > take
    const items = hasMore ? vehicles.slice(0, -1) : vehicles
    const nextCursor = hasMore ? items[items.length - 1]?.id : null

    return NextResponse.json(
      {
        vehicles: items,
        nextCursor,
        hasMore,
      },
      {
        headers: {
          // Aggressive caching headers
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
          'X-Cache-Key': cacheKey,
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
