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
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // For guests, only show their own orders
    // For staff/admin, show all orders
    const where = {
      ...(session.user.role === 'GUEST' && { guestId: session.user.id }),
      ...(status && { status }),
      ...(type && { orderType: type }),
    }

    const orders = await prisma.order.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderType, items, specialInstructions, requestMessage } = body

    if (!orderType || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order type and items are required' },
        { status: 400 }
      )
    }

    // Calculate total amount
    let totalAmount = 0
    for (const item of items) {
      if (item.serviceId) {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
        })
        if (service) {
          totalAmount += service.price * item.quantity
        }
      } else if (item.foodMenuId) {
        const foodItem = await prisma.foodMenu.findUnique({
          where: { id: item.foodMenuId },
        })
        if (foodItem) {
          totalAmount += foodItem.price * item.quantity
        }
      }
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        guestId: session.user.id,
        orderType,
        totalAmount,
        notes: specialInstructions || requestMessage || undefined,
        status: 'PENDING',
        orderItems: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            ...(item.serviceId && { serviceId: item.serviceId }),
            ...(item.foodMenuId && { foodMenuId: item.foodMenuId }),
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            service: true,
            foodMenu: true,
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
