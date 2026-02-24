import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guestId')
    const status = searchParams.get('status')

    // For guests, only show their own invoices
    // For staff/admin, show invoices for specific guest if provided, or all invoices
    const where = {
      ...(session.user.role === 'GUEST'
        ? { guestId: session.user.id }
        : guestId
        ? { guestId }
        : {}),
      ...(status && { status }),
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        guest: {
          include: {
            room: true,
          },
        },
        invoiceItems: {
          include: {
            order: {
              include: {
                orderItems: {
                  include: {
                    service: true,
                    foodMenu: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
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
    const { guestId, orderIds } = body

    if (!guestId || !orderIds || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Guest ID and order IDs are required' },
        { status: 400 }
      )
    }

    // Get all orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        guestId,
        status: 'COMPLETED',
      },
      include: {
        orderItems: true,
      },
    })

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No delivered orders found' },
        { status: 400 }
      )
    }

    // Fetch hotel settings for tax rate and invoice prefix
    let hotelSettings = await prisma.hotelSettings.findFirst()
    if (!hotelSettings) {
      hotelSettings = await prisma.hotelSettings.create({
        data: {
          hotelName: 'NeboSync Hotel',
          address: '',
          phone: '',
          email: '',
          website: '',
          taxRate: 0.18,
          taxLabel: 'GST',
          invoicePrefix: 'INV',
          invoiceFooter: 'Thank you for choosing our hotel!',
        },
      })
    }

    // Calculate totals using dynamic tax rate
    const subtotal = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const tax = subtotal * hotelSettings.taxRate
    const total = subtotal + tax

    // Generate unique invoice number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const invoiceNumber = `${hotelSettings.invoicePrefix}-${dateStr}-${randomNum}`

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        guestId,
        invoiceNumber,
        subtotal,
        tax,
        total,
        status: 'PENDING',
        invoiceItems: {
          create: orders.map((order) => ({
            orderId: order.id,
            description: `Order #${order.id.slice(0, 8)}`,
            quantity: 1,
            unitPrice: order.totalAmount,
            total: order.totalAmount,
          })),
        },
      },
      include: {
        guest: {
          include: {
            room: true,
          },
        },
        invoiceItems: {
          include: {
            order: {
              include: {
                orderItems: {
                  include: {
                    service: true,
                    foodMenu: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    logActivity({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'invoice',
      entityId: invoice.id,
      description: `Created invoice #${invoiceNumber} for ${invoice.guest.name} — ₹${total.toLocaleString('en-IN')}`,
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
