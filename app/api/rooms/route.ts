import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const blockId = searchParams.get('blockId')
    const floor = searchParams.get('floor')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const rooms = await prisma.room.findMany({
      where: {
        ...(blockId && { blockId }),
        ...(floor && { floor: parseInt(floor) }),
        ...(status && { status: status as 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING' }),
        ...(type && { roomType: type }),
        ...(search && { roomNumber: { contains: search, mode: 'insensitive' as const } }),
      },
      include: {
        block: { select: { id: true, name: true, description: true } },
        guest: {
          select: {
            id: true,
            name: true,
            phone: true,
            checkInDate: true,
            checkOutDate: true,
          },
        },
      },
      orderBy: [{ block: { name: 'asc' } }, { floor: 'asc' }, { roomNumber: 'asc' }],
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roomNumber, roomType, floor, blockId, pricePerNight } = body

    if (!roomNumber || !roomType || floor === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: roomNumber, roomType, floor' },
        { status: 400 }
      )
    }

    if (blockId) {
      const block = await prisma.block.findUnique({ where: { id: blockId } })
      if (!block) {
        return NextResponse.json({ error: 'Block not found' }, { status: 404 })
      }
    }

    const existing = await prisma.room.findUnique({
      where: { roomNumber },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A room with this number already exists' },
        { status: 409 }
      )
    }

    const newRoom = await prisma.room.create({
      data: {
        roomNumber,
        roomType,
        floor: parseInt(floor),
        blockId: blockId || null,
        pricePerNight: parseFloat(pricePerNight) || 0,
        status: 'AVAILABLE',
        isOccupied: false,
      },
      include: {
        block: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(newRoom, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
