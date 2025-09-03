import { prisma } from '@/server/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { vehicleId, amount } = await request.json()

  if (!vehicleId || !amount) {
    return NextResponse.json({ error: 'Vehicle ID and amount required' }, { status: 400 })
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
  })

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
  }

  if (vehicle.type !== 'BIDDING') {
    return NextResponse.json(
      { error: 'This vehicle is not available for bidding' },
      { status: 400 }
    )
  }

  const highestBid = vehicle.bids[0]
  if (highestBid && amount <= highestBid.amount) {
    return NextResponse.json(
      { error: 'Bid must be higher than current highest bid' },
      { status: 400 }
    )
  }

  const bid = await prisma.bid.create({
    data: {
      amount: parseInt(amount),
      bidderId: session.user.id,
      vehicleId,
    },
    include: {
      bidder: { select: { name: true, email: true } },
      vehicle: { select: { make: true, model: true, year: true } },
    },
  })

  return NextResponse.json(bid)
}
