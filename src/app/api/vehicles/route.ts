import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'

interface VehicleWhereInput {
  make?: { contains: string }
  model?: { contains: string }
  year?: number
  type?: 'BUY_NOW' | 'BIDDING'
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const where: VehicleWhereInput = {}
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  const year = searchParams.get('year')
  const type = searchParams.get('type')
  if (make) where.make = { contains: make }
  if (model) where.model = { contains: model }
  if (year) where.year = parseInt(year)
  if (type && ['BUY_NOW', 'BIDDING'].includes(type)) {
    where.type = type as 'BUY_NOW' | 'BIDDING'
  }
  const vehicles = await prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(vehicles)
}
