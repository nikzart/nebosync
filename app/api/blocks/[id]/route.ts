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

    const block = await prisma.block.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            guest: {
              select: { id: true, name: true, phone: true },
            },
          },
          orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        },
        _count: { select: { rooms: true } },
      },
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    return NextResponse.json(block)
  } catch (error) {
    console.error('Error fetching block:', error)
    return NextResponse.json(
      { error: 'Failed to fetch block' },
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
    const { name, description, totalFloors } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Block name is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.block.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Check name uniqueness if changed
    if (name !== existing.name) {
      const duplicate = await prisma.block.findUnique({ where: { name } })
      if (duplicate) {
        return NextResponse.json(
          { error: 'A block with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updatedBlock = await prisma.block.update({
      where: { id },
      data: {
        name,
        description: description || null,
        totalFloors: totalFloors ? parseInt(totalFloors) : existing.totalFloors,
      },
    })

    return NextResponse.json(updatedBlock)
  } catch (error) {
    console.error('Error updating block:', error)
    return NextResponse.json(
      { error: 'Failed to update block' },
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

    const block = await prisma.block.findUnique({ where: { id } })
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    if (body.isActive !== undefined) {
      const updated = await prisma.block.update({
        where: { id },
        data: { isActive: body.isActive },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating block:', error)
    return NextResponse.json(
      { error: 'Failed to update block' },
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

    const block = await prisma.block.findUnique({
      where: { id },
      include: { _count: { select: { rooms: true } } },
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    if (block._count.rooms > 0) {
      return NextResponse.json(
        { error: `Cannot delete block with ${block._count.rooms} room(s). Remove or reassign rooms first.` },
        { status: 400 }
      )
    }

    await prisma.block.delete({ where: { id } })

    return NextResponse.json({ message: 'Block deleted successfully' })
  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json(
      { error: 'Failed to delete block' },
      { status: 500 }
    )
  }
}
