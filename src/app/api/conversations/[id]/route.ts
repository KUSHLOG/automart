import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

// GET /api/conversations/[id] - Get a specific conversation
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
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
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 50, // Get last 50 messages initially
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check if user is part of this conversation
    if (conversation.buyerId !== session.user.id && conversation.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get seller info
    const seller = await prisma.user.findUnique({
      where: { id: conversation.sellerId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json({
      ...conversation,
      seller,
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/conversations/[id] - Deactivate a conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        buyerId: true,
        sellerId: true,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.buyerId !== session.user.id && conversation.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
