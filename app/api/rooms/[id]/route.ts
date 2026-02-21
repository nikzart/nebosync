import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        block: { select: { id: true, name: true, description: true } },
        guest: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            checkInDate: true,
            checkOutDate: true,
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { roomNumber, roomType, floor, blockId, pricePerNight } = body

    if (!roomNumber || !roomType || floor === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: roomNumber, roomType, floor' },
        { status: 400 }
      )
    }

    const existingRoom = await prisma.room.findUnique({ where: { id } })
    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check roomNumber uniqueness if changed
    if (roomNumber !== existingRoom.roomNumber) {
      const duplicate = await prisma.room.findUnique({ where: { roomNumber } })
      if (duplicate) {
        return NextResponse.json(
          { error: 'A room with this number already exists' },
          { status: 409 }
        )
      }
    }

    if (blockId) {
      const block = await prisma.block.findUnique({ where: { id: blockId } })
      if (!block) {
        return NextResponse.json({ error: 'Block not found' }, { status: 404 })
      }
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        roomNumber,
        roomType,
        floor: parseInt(floor),
        blockId: blockId || null,
        pricePerNight: parseFloat(pricePerNight) || 0,
      },
      include: {
        block: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['AVAILABLE', 'MAINTENANCE', 'CLEANING'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Use AVAILABLE, MAINTENANCE, or CLEANING' },
        { status: 400 }
      )
    }

    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.status === 'OCCUPIED') {
      return NextResponse.json(
        { error: 'Cannot change status of an occupied room. Check out the guest first.' },
        { status: 400 }
      )
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        status,
        isOccupied: false,
      },
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error('Error updating room status:', error)
    return NextResponse.json(
      { error: 'Failed to update room status' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const room = await prisma.room.findUnique({
      where: { id },
      include: { guest: { select: { id: true } } },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.guest) {
      return NextResponse.json(
        { error: 'Cannot delete an occupied room. Check out the guest first.' },
        { status: 400 }
      )
    }

    await prisma.room.delete({ where: { id } })

    return NextResponse.json({ message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
