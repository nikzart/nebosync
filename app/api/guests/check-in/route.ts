import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, email, roomId, checkOutDate } = body

    if (!name || !phone || !roomId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, roomId' },
        { status: 400 }
      )
    }

    // Check if phone already belongs to an active guest
    const existingGuest = await prisma.guest.findFirst({
      where: { phone, isActive: true },
    })

    if (existingGuest) {
      return NextResponse.json(
        { error: 'An active guest with this phone number already exists' },
        { status: 409 }
      )
    }

    // Check room availability
    const room = await prisma.room.findUnique({ where: { id: roomId } })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: `Room is not available (current status: ${room.status})` },
        { status: 400 }
      )
    }

    // Transaction: create guest + mark room as occupied
    const guest = await prisma.$transaction(async (tx) => {
      const newGuest = await tx.guest.create({
        data: {
          name,
          phone,
          email: email || null,
          roomId,
          checkInDate: new Date(),
          ...(checkOutDate && { checkOutDate: new Date(checkOutDate) }),
        },
        include: { room: true },
      })

      await tx.room.update({
        where: { id: roomId },
        data: { status: 'OCCUPIED', isOccupied: true },
      })

      return newGuest
    })

    logActivity({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'guest',
      entityId: guest.id,
      description: `Checked in ${name} to Room ${guest.room?.roomNumber ?? 'N/A'}`,
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('Error checking in guest:', error)
    return NextResponse.json(
      { error: 'Failed to check in guest' },
      { status: 500 }
    )
  }
}
