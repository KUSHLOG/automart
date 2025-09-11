import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

// GET /api/conversations - Get all conversations for the current user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
        isActive: true,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            imageUrl: true,
            price: true,
            type: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            isRead: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: session.user.id,
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Get seller info for each conversation
    const conversationsWithSeller = await Promise.all(
      conversations.map(async conversation => {
        const seller = await prisma.user.findUnique({
          where: { id: conversation.sellerId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })

        const otherUser = conversation.buyerId === session.user.id ? seller : conversation.buyer

        return {
          ...conversation,
          seller,
          otherUser,
          unreadCount: conversation._count.messages,
          lastMessage: conversation.messages[0] || null,
        }
      })
    )

    return NextResponse.json(conversationsWithSeller)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vehicleId } = await request.json()

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 })
    }

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        ownerId: true,
        type: true,
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    if (vehicle.ownerId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot start conversation with yourself' },
        { status: 400 }
      )
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        vehicleId_buyerId: {
          vehicleId,
          buyerId: session.user.id,
        },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            imageUrl: true,
            price: true,
            type: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    if (existingConversation) {
      // Reactivate if inactive
      if (!existingConversation.isActive) {
        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { isActive: true },
        })
      }
      return NextResponse.json(existingConversation)
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        vehicleId,
        buyerId: session.user.id,
        sellerId: vehicle.ownerId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            imageUrl: true,
            price: true,
            type: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: true,
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
