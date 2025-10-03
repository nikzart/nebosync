import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoiceForOrder } from '@/lib/invoice'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            service: true,
            foodMenu: true,
          },
        },
        guest: {
          include: {
            room: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Guests can only view their own orders
    if (session.user.role === 'GUEST' && order.guestId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    // Only staff/admin can update order status
    if (session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
      },
      include: {
        orderItems: {
          include: {
            service: true,
            foodMenu: true,
          },
        },
        guest: {
          include: {
            room: true,
          },
        },
      },
    })

    // Auto-generate invoice when order is completed
    if (status === 'COMPLETED') {
      try {
        const invoice = await generateInvoiceForOrder(id)
        console.log('✅ Auto-generated invoice:', invoice.invoiceNumber)
      } catch (invoiceError) {
        console.error('Failed to auto-generate invoice:', invoiceError)
        // Don't fail the order update if invoice generation fails
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Guests can only cancel their own orders, and only if pending
    if (session.user.role === 'GUEST') {
      if (order.guestId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      if (order.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Cannot cancel order that is already in progress' },
          { status: 400 }
        )
      }
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ message: 'Order cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}
