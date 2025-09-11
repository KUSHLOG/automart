import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

// GET /api/messages/unread-count - Get total unread messages count
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: session.user.id,
        isRead: false,
      },
    })

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
