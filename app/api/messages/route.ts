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

    // For guests, only show their own messages
    // For staff/admin, show messages for specific guest if provided, or all messages
    const where = {
      ...(session.user.role === 'GUEST'
        ? { guestId: session.user.id }
        : guestId
        ? { guestId }
        : {}),
      ...(unread === 'true' && { isRead: false }),
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
