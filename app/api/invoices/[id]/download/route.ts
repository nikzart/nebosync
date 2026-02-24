import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoicePDF } from '@/lib/invoice-pdf'

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
        invoiceItems: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Guests can only download their own invoices
    if (session.user.role === 'GUEST' && invoice.guestId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get hotel settings for PDF generation
    const hotelSettings = await prisma.hotelSettings.findFirst()

    // Prepare invoice data for PDF
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      createdAt: invoice.createdAt.toISOString(),
      status: invoice.status,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      paidAt: invoice.paidAt?.toISOString() || null,
      guest: {
        name: invoice.guest.name,
        phone: invoice.guest.phone,
        email: invoice.guest.email,
        room: invoice.guest.room
          ? {
              roomNumber: invoice.guest.room.roomNumber,
            }
          : null,
      },
      invoiceItems: invoice.invoiceItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    }

    // Prepare hotel settings for PDF
    const hotelSettingsData = hotelSettings
      ? {
          hotelName: hotelSettings.hotelName,
          address: hotelSettings.address,
          phone: hotelSettings.phone,
          email: hotelSettings.email,
          website: hotelSettings.website,
          logoUrl: hotelSettings.logoUrl,
          taxRate: hotelSettings.taxRate,
          taxLabel: hotelSettings.taxLabel,
          taxRegistration: hotelSettings.taxRegistration,
          invoiceFooter: hotelSettings.invoiceFooter,
          invoiceAccentColor: hotelSettings.invoiceAccentColor,
          paymentTerms: hotelSettings.paymentTerms,
          currencySymbol: hotelSettings.currencySymbol,
          showBankDetails: hotelSettings.showBankDetails,
          bankName: hotelSettings.bankName,
          accountNumber: hotelSettings.accountNumber,
          ifscCode: hotelSettings.ifscCode,
          accountName: hotelSettings.accountName,
        }
      : undefined

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData, hotelSettingsData)

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    )
  }
}
