import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        guest: true,
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
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Generate a simple text-based invoice for now
    // In production, you would use @react-pdf/renderer or similar
    const invoiceText = `
═══════════════════════════════════════════════════
              NEBOSYNC HOTEL INVOICE
═══════════════════════════════════════════════════

Invoice Number: ${invoice.invoiceNumber}
Created Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Status: ${invoice.status}

───────────────────────────────────────────────────
GUEST INFORMATION
───────────────────────────────────────────────────
Name: ${invoice.guest.name}
Phone: ${invoice.guest.phone}
${invoice.guest.email ? `Email: ${invoice.guest.email}` : ''}

───────────────────────────────────────────────────
INVOICE ITEMS
───────────────────────────────────────────────────
${invoice.invoiceItems
  .map((item) => {
    const orderDetails = item.order
      ? `\n    Order Items:\n${item.order.orderItems
          .map((orderItem) => {
            const itemName = orderItem.service?.name || orderItem.foodMenu?.name || 'Unknown'
            return `      - ${itemName} (Qty: ${orderItem.quantity}) - ₹${orderItem.subtotal.toLocaleString('en-IN')}`
          })
          .join('\n')}`
      : ''
    return `  • ${item.description}
    Quantity: ${item.quantity}
    Unit Price: ₹${item.unitPrice.toLocaleString('en-IN')}
    Total: ₹${item.total.toLocaleString('en-IN')}${orderDetails}`
  })
  .join('\n\n')}

───────────────────────────────────────────────────
PAYMENT SUMMARY
───────────────────────────────────────────────────
Subtotal:        ₹${invoice.subtotal.toLocaleString('en-IN')}
Tax (18%):       ₹${invoice.tax.toLocaleString('en-IN')}
═══════════════════════════════════════════════════
Total Amount:    ₹${invoice.total.toLocaleString('en-IN')}
═══════════════════════════════════════════════════

${invoice.paidAt ? `Paid on: ${new Date(invoice.paidAt).toLocaleDateString()}` : 'Payment Pending'}

Thank you for choosing NeboSync Hotel!
═══════════════════════════════════════════════════
    `.trim()

    // Return as downloadable text file
    return new NextResponse(invoiceText, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.txt"`,
      },
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
