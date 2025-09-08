import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const createVehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2030),
  price: z.number().min(0),
  mileage: z.number().min(0).default(0),
  type: z.enum(['BUY_NOW', 'BIDDING']),
  description: z.string().min(1),
  imageUrl: z.string().optional(),
  specs: z.record(z.string(), z.any()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = createVehicleSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.error }, { status: 400 })
    }

    const vehicleData = {
      ...result.data,
      ownerId: session.user.id,
      imageUrl: result.data.imageUrl || '/placeholder-car.svg',
      specs: result.data.specs ? JSON.stringify(result.data.specs) : JSON.stringify({}),
      viewCount: 0,
    }

    const vehicle = await prisma.vehicle.create({
      data: vehicleData,
    })

    return NextResponse.json({ vehicle }, { status: 201 })
  } catch (error) {
    console.error('Vehicle creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: {
        ownerId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Vehicles fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
