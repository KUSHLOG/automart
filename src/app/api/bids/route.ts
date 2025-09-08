import { prisma } from '@/server/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { placeBid, validateRequestBody } from '@/server/validators'
import { rateLimit, getClientIP } from '@/server/ratelimit'

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting for bidding (more restrictive)
    const rateLimitResult = await rateLimit(`bid:${session.user.id}`, 10, 60000) // 10 bids per minute per user

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many bid attempts. Please wait before bidding again.' },
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
    const { vehicleId, amount } = validateRequestBody(placeBid, body)

    // Check vehicle exists and is biddable (optimized query)
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        type: true,
        biddingStart: true,
        biddingEnd: true,
        ownerId: true,
        bids: {
          select: {
            amount: true,
            bidderId: true,
          },
          orderBy: { amount: 'desc' },
          take: 1,
        },
      },
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

    // Check if user is not the owner
    if (vehicle.ownerId === session.user.id) {
      return NextResponse.json({ error: 'Cannot bid on your own vehicle' }, { status: 400 })
    }

    // Check bidding window
    const now = new Date()
    if (vehicle.biddingStart && now < vehicle.biddingStart) {
      return NextResponse.json({ error: 'Bidding has not started yet' }, { status: 400 })
    }

    if (vehicle.biddingEnd && now > vehicle.biddingEnd) {
      return NextResponse.json({ error: 'Bidding has ended' }, { status: 400 })
    }

    // Check if bid is higher than current highest
    const highestBid = vehicle.bids[0]
    if (highestBid && amount <= highestBid.amount) {
      return NextResponse.json(
        {
          error: 'Bid must be higher than current highest bid',
          currentHighestBid: highestBid.amount,
        },
        { status: 400 }
      )
    }

    // Check if user already has the highest bid
    if (highestBid && highestBid.bidderId === session.user.id) {
      return NextResponse.json({ error: 'You already have the highest bid' }, { status: 400 })
    }

    // Create bid with transaction for consistency
    const bid = await prisma.$transaction(async tx => {
      // Double-check highest bid within transaction
      const latestHighestBid = await tx.bid.findFirst({
        where: { vehicleId },
        select: { amount: true },
        orderBy: { amount: 'desc' },
      })

      if (latestHighestBid && amount <= latestHighestBid.amount) {
        throw new Error('Bid amount too low')
      }

      // Create the bid
      return await tx.bid.create({
        data: {
          amount,
          bidderId: session.user.id,
          vehicleId,
        },
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
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
            },
          },
        },
      })
    })

    // Log successful bid for monitoring
    console.info('bid_placed', {
      bidId: bid.id,
      amount,
      vehicleId,
      userId: session.user.id,
    })

    return NextResponse.json(bid, { status: 201 })
  } catch (error) {
    console.error('Bidding error:', error)

    if (error instanceof Error && error.message === 'Bid amount too low') {
      return NextResponse.json(
        { error: 'Bid amount too low due to concurrent bidding' },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 })
    }

    // Rate limiting for bid fetching
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimit(`bids:${clientIP}`, 100, 60000)

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Get bids with pagination
    const take = Math.min(parseInt(searchParams.get('take') || '10'), 50)
    const cursor = searchParams.get('cursor')

    const bids = await prisma.bid.findMany({
      where: { vehicleId },
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
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasNextPage = bids.length > take
    if (hasNextPage) {
      bids.pop()
    }

    const nextCursor = hasNextPage ? bids[bids.length - 1]?.id : null

    return NextResponse.json(
      {
        bids,
        pagination: {
          hasNextPage,
          nextCursor,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=60', // Short cache for real-time bidding
        },
      }
    )
  } catch (error) {
    console.error('Bid fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 })
  }
}
