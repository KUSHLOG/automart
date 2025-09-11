import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

// GET /api/conversations/[id]/messages - Get messages for a conversation
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is part of this conversation
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

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
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
        createdAt: 'desc',
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasNextPage = messages.length > limit
    if (hasNextPage) {
      messages.pop()
    }

    // Mark messages as read if they're for the current user
    const unreadMessageIds = messages
      .filter(msg => msg.receiverId === session.user.id && !msg.isRead)
      .map(msg => msg.id)

    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: unreadMessageIds },
        },
        data: {
          isRead: true,
        },
      })
    }

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to get chronological order
      hasNextPage,
      nextCursor: hasNextPage ? messages[messages.length - 1]?.id : null,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/conversations/[id]/messages - Send a message
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: conversationId } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Message too long (max 1000 characters)' }, { status: 400 })
    }

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        isActive: true,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (!conversation.isActive) {
      return NextResponse.json({ error: 'Conversation is not active' }, { status: 400 })
    }

    if (conversation.buyerId !== session.user.id && conversation.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Determine receiver
    const receiverId =
      conversation.buyerId === session.user.id ? conversation.sellerId : conversation.buyerId

    // Create message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        receiverId,
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
