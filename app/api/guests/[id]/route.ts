import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

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

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        room: true,
        _count: {
          select: {
            orders: true,
            messages: true,
            invoices: true,
          },
        },
      },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Get additional stats
    const [totalSpent, pendingOrders, unpaidInvoices] = await Promise.all([
      prisma.order.aggregate({
        where: { guestId: id, status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: { guestId: id, status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
      }),
      prisma.invoice.count({
        where: { guestId: id, status: { in: ['DRAFT', 'PENDING'] } },
      }),
    ])

    return NextResponse.json({
      ...guest,
      totalSpent: totalSpent._sum.totalAmount || 0,
      pendingOrders,
      unpaidInvoices,
    })
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guest' },
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
    const { name, phone, email, checkOutDate } = body

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone' },
        { status: 400 }
      )
    }

    const existingGuest = await prisma.guest.findUnique({ where: { id } })
    if (!existingGuest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Check phone uniqueness if changed
    if (phone !== existingGuest.phone) {
      const duplicate = await prisma.guest.findUnique({ where: { phone } })
      if (duplicate) {
        return NextResponse.json(
          { error: 'A guest with this phone number already exists' },
          { status: 409 }
        )
      }
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        name,
        phone,
        email: email || null,
        ...(checkOutDate && { checkOutDate: new Date(checkOutDate) }),
      },
      include: { room: true },
    })

    return NextResponse.json(updatedGuest)
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json(
      { error: 'Failed to update guest' },
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

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: { room: true },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Check-out action
    if (body.action === 'checkout') {
      const [totalSpent, orderCount] = await Promise.all([
        prisma.order.aggregate({
          where: { guestId: id },
          _sum: { totalAmount: true },
        }),
        prisma.order.count({ where: { guestId: id } }),
      ])

      // Transaction: deactivate guest + free room
      const updatedGuest = await prisma.$transaction(async (tx) => {
        const updated = await tx.guest.update({
          where: { id },
          data: {
            isActive: false,
            checkOutDate: new Date(),
            roomId: null,
          },
          include: { room: true },
        })

        // Free the room
        if (guest.roomId) {
          await tx.room.update({
            where: { id: guest.roomId },
            data: { status: 'CLEANING', isOccupied: false },
          })
        }

        return updated
      })

      const stayDuration = Math.ceil(
        (new Date().getTime() - new Date(guest.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
      )

      logActivity({
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'guest',
        entityId: id,
        description: `Checked out ${guest.name} from Room ${guest.room?.roomNumber ?? 'N/A'}`,
      })

      return NextResponse.json({
        ...updatedGuest,
        summary: {
          stayDuration,
          totalOrders: orderCount,
          totalSpent: totalSpent._sum.totalAmount || 0,
        },
      })
    }

    // Toggle active status
    if (body.isActive !== undefined) {
      const updatedGuest = await prisma.guest.update({
        where: { id },
        data: { isActive: body.isActive },
        include: { room: true },
      })
      return NextResponse.json(updatedGuest)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json(
      { error: 'Failed to update guest' },
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
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const { id } = await params

    const guest = await prisma.guest.findUnique({
      where: { id },
      select: { id: true, roomId: true },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      // Free room if assigned
      if (guest.roomId) {
        await tx.room.update({
          where: { id: guest.roomId },
          data: { status: 'CLEANING', isOccupied: false },
        })
      }

      // Delete guest (cascade handles orders, messages, invoices)
      await tx.guest.delete({ where: { id } })
    })

    return NextResponse.json({ message: 'Guest deleted successfully' })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json(
      { error: 'Failed to delete guest' },
      { status: 500 }
    )
  }
}
