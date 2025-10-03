import { prisma } from '@/lib/prisma'

export async function generateInvoiceForOrder(orderId: string) {
  // Fetch the order with all details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          service: true,
          foodMenu: true,
        },
      },
      guest: true,
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  // Check if invoice already exists for this order
  const existingInvoice = await prisma.invoiceItem.findFirst({
    where: { orderId },
    include: { invoice: true },
  })

  if (existingInvoice) {
    return existingInvoice.invoice
  }

  // Get hotel settings for tax rate and invoice prefix
  let hotelSettings = await prisma.hotelSettings.findFirst()

  // If no settings exist, create default settings
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

  // Generate unique invoice number (format: PREFIX-YYYYMMDD-XXXX)
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const invoiceNumber = `${hotelSettings.invoicePrefix}-${dateStr}-${randomNum}`

  // Calculate amounts using tax rate from settings
  const subtotal = order.totalAmount
  const taxRate = hotelSettings.taxRate
  const tax = subtotal * taxRate
  const total = subtotal + tax

  // Create invoice with items
  const invoice = await prisma.invoice.create({
    data: {
      guestId: order.guestId,
      invoiceNumber,
      status: 'PENDING',
      subtotal,
      tax,
      total,
      notes: `Invoice for Order #${order.id.slice(0, 8)}`,
      invoiceItems: {
        create: order.orderItems.map((item) => ({
          orderId: order.id,
          description: item.service?.name || item.foodMenu?.name || 'Item',
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity,
        })),
      },
    },
    include: {
      invoiceItems: true,
      guest: {
        include: {
          room: true,
        },
      },
    },
  })

  return invoice
}
