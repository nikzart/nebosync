import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generateInvoiceForOrder } from '@/lib/invoice'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const invoice = await generateInvoiceForOrder(orderId)
    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error generating invoice:', error)

    if (error instanceof Error && error.message === 'Order not found') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
