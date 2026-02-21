import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const blocks = await prisma.block.findMany({
      include: {
        _count: { select: { rooms: true } },
        rooms: {
          select: { status: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Add room status breakdown per block
    const blocksWithStats = blocks.map((block) => {
      const statusCounts = {
        available: block.rooms.filter((r) => r.status === 'AVAILABLE').length,
        occupied: block.rooms.filter((r) => r.status === 'OCCUPIED').length,
        maintenance: block.rooms.filter((r) => r.status === 'MAINTENANCE').length,
        cleaning: block.rooms.filter((r) => r.status === 'CLEANING').length,
      }
      const { rooms, ...rest } = block
      return { ...rest, statusCounts }
    })

    return NextResponse.json(blocksWithStats)
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
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
    const { name, description, totalFloors } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Block name is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.block.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json(
        { error: 'A block with this name already exists' },
        { status: 409 }
      )
    }

    const newBlock = await prisma.block.create({
      data: {
        name,
        description: description || null,
        totalFloors: totalFloors ? parseInt(totalFloors) : 1,
      },
    })

    return NextResponse.json(newBlock, { status: 201 })
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    )
  }
}
