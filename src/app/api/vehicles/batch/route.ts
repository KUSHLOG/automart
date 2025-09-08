/**
 * Batch API endpoint for vehicles
 * Reduces N API calls to single batched request
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { rateLimit, getClientIP } from '@/server/ratelimit'
import { batchCached } from '@/lib/cache'
import { z } from 'zod'

const BatchRequestSchema = z.object({
  ids: z.array(z.string()).min(1).max(50), // Limit to 50 vehicles per batch
  fields: z
    .array(z.enum(['id', 'make', 'model', 'year', 'price', 'type', 'description', 'images']))
    .optional()
    .default(['id', 'make', 'model', 'year', 'price', 'type']),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for batch requests (more restrictive)
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimit(`batch:${clientIP}`, 20, 60000) // 20 batch requests per minute

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many batch requests' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Validate request body
    const body = await request.json()
    const { ids, fields } = BatchRequestSchema.parse(body)

    // Use batch caching to avoid duplicate DB queries
    const vehicles = await batchCached(
      ids,
      300, // 5 minutes TTL
      async (missingIds: string[]) => {
        // Only fetch missing vehicles from database
        const dbVehicles = await prisma.vehicle.findMany({
          where: {
            id: { in: missingIds },
          },
          select: {
            id: true,
            make: fields.includes('make'),
            model: fields.includes('model'),
            year: fields.includes('year'),
            price: fields.includes('price'),
            type: fields.includes('type'),
            description: fields.includes('description'),
            createdAt: true,
          },
        })

        // Convert to key-value map for batch cache
        const vehicleMap: Record<string, unknown> = {}
        dbVehicles.forEach(vehicle => {
          vehicleMap[vehicle.id] = vehicle
        })

        return vehicleMap
      }
    )

    // Maintain order of requested IDs
    const orderedVehicles = ids.map(id => vehicles[id]).filter(Boolean) // Remove missing vehicles

    return NextResponse.json(
      {
        vehicles: orderedVehicles,
        found: orderedVehicles.length,
        requested: ids.length,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
          'X-Batch-Size': ids.length.toString(),
        },
      }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in batch vehicles API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
