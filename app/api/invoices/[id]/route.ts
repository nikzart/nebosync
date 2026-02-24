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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
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

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Guests can only view their own invoices
    if (session.user.role === 'GUEST' && invoice.guestId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
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
    const { status, paidAt } = body

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paidAt && { paidAt: new Date(paidAt) }),
        ...(status === 'PAID' && !paidAt && { paidAt: new Date() }),
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

    const desc = status === 'PAID'
      ? `Marked invoice #${invoice.invoiceNumber} as paid for ${invoice.guest.name}`
      : status === 'CANCELLED'
        ? `Cancelled invoice #${invoice.invoiceNumber} for ${invoice.guest.name}`
        : `Updated invoice #${invoice.invoiceNumber}`

    logActivity({
      userId: session.user.id,
      action: 'STATUS_CHANGE',
      entity: 'invoice',
      entityId: id,
      description: desc,
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
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

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        ...(status === 'PAID' && { paidAt: new Date() }),
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

    const patchDesc = status === 'PAID'
      ? `Marked invoice #${invoice.invoiceNumber} as paid for ${invoice.guest.name}`
      : status === 'CANCELLED'
        ? `Cancelled invoice #${invoice.invoiceNumber} for ${invoice.guest.name}`
        : `Updated invoice #${invoice.invoiceNumber}`

    logActivity({
      userId: session.user.id,
      action: 'STATUS_CHANGE',
      entity: 'invoice',
      entityId: id,
      description: patchDesc,
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}
