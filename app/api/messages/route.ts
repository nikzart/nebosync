import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId')
    const unread = searchParams.get('unread')

    // Build where clause based on role and filters
    const where: any = {}

    // Filter by guest (for guests, only their messages; for staff, specific guest if provided)
    if (session.user.role === 'GUEST') {
      where.guestId = session.user.id
    } else if (guestId) {
      where.guestId = guestId
    }

    // Filter unread messages based on role
    if (unread === 'true') {
      where.isRead = false
      // For staff/admin: only count unread messages FROM guests
      // For guests: only count unread messages FROM staff
      where.isFromGuest = session.user.role === 'GUEST' ? false : true
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        guest: {
          include: {
            room: true,
          },
        },
        staff: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, messageType, guestId } = body

    if (!content || !messageType) {
      return NextResponse.json(
        { error: 'Content and message type are required' },
        { status: 400 }
      )
    }

    // Determine guest ID based on role
    let targetGuestId = guestId
    if (session.user.role === 'GUEST') {
      targetGuestId = session.user.id
    }

    if (!targetGuestId) {
      return NextResponse.json(
        { error: 'Guest ID is required for staff messages' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        guestId: targetGuestId,
        ...(session.user.role !== 'GUEST' && { staffId: session.user.id }),
        content,
        messageType,
        isFromGuest: session.user.role === 'GUEST',
        isRead: false,
      },
      include: {
        guest: {
          include: {
            room: true,
          },
        },
        staff: true,
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { guestId } = body

    let whereClause: any = { isRead: false }

    if (session.user.role === 'GUEST') {
      // For guests: mark unread messages FROM staff as read
      whereClause.guestId = session.user.id
      whereClause.isFromGuest = false // Only mark staff messages as read
    } else {
      // For staff/admin: mark unread messages FROM specific guest as read
      if (!guestId) {
        return NextResponse.json(
          { error: 'Guest ID is required for staff' },
          { status: 400 }
        )
      }
      whereClause.guestId = guestId
      whereClause.isFromGuest = true // Only mark guest messages as read
    }

    const result = await prisma.message.updateMany({
      where: whereClause,
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ updated: result.count }, { status: 200 })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const body = await request.json()
    const { guestId } = body

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID is required' },
        { status: 400 }
      )
    }

    // Delete all messages for this guest
    const result = await prisma.message.deleteMany({
      where: {
        guestId,
      },
    })

    return NextResponse.json({ deleted: result.count }, { status: 200 })
  } catch (error) {
    console.error('Error deleting messages:', error)
    return NextResponse.json(
      { error: 'Failed to delete messages' },
      { status: 500 }
    )
  }
}
