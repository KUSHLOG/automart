import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { rateLimit, getClientIP } from '@/server/ratelimit'
import { cached } from '@/lib/cache'

// Enable static optimization
export const revalidate = 600 // 10 minutes for individual vehicles
export const dynamic = 'force-static'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting for individual vehicle requests
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimit(`vehicle:${clientIP}`, 200, 60000) // 200 requests per minute

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const { id } = await params

    // Use aggressive caching for individual vehicle data
    const vehicle = await cached(
      `vehicle:${id}`,
      600, // 10 minutes TTL
      async () => {
        // Optimized query with all necessary relations
        return await prisma.vehicle.findUnique({
          where: { id },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            price: true,
            type: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            // Include bids for bidding vehicles only
            ...(await prisma.vehicle
              .findUnique({
                where: { id },
                select: { type: true },
              })
              .then(v =>
                v?.type === 'BIDDING'
                  ? {
                      bids: {
                        select: {
                          id: true,
                          amount: true,
                          createdAt: true,
                          bidder: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                        },
                        orderBy: { amount: 'desc' },
                        take: 10, // Only show top 10 bids
                      },
                    }
                  : {}
              )),
          },
        })
      }
    )

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Generate ETag for conditional requests
    const etag = `"${vehicle.updatedAt.getTime()}"`

    // Check if client has fresh copy
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    return NextResponse.json(vehicle, {
      headers: {
        // Aggressive caching with conditional requests
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200',
        ETag: etag,
        'Last-Modified': vehicle.updatedAt.toUTCString(),
        'X-Cache-Key': `vehicle:${id}`,
      },
    })
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
