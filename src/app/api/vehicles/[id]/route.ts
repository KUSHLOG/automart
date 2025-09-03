import { prisma } from '@/server/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true } },
      bids: {
        include: { bidder: { select: { name: true, email: true } } },
        orderBy: { amount: 'desc' },
      },
    },
  })

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
  }

  return NextResponse.json(vehicle)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  if (body.incrementViews) {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { views: { increment: 1 } },
    })
    return NextResponse.json(vehicle)
  }

  return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
}
