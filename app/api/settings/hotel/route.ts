import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create hotel settings (there should only be one record)
    let settings = await prisma.hotelSettings.findFirst()

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.hotelSettings.create({
        data: {
          hotelName: 'NeboSync Hotel',
          address: '123 Hotel Street, City, State 12345',
          phone: '+91 98765 43210',
          email: 'contact@nebosync.hotel',
          website: 'https://nebosync.hotel',
          taxRate: 0.18,
          taxLabel: 'GST',
          invoicePrefix: 'INV',
          invoiceFooter: 'Thank you for choosing our hotel!',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching hotel settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hotel settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 })
    }

    const body = await request.json()
    const {
      hotelName,
      address,
      phone,
      email,
      website,
      logoUrl,
      taxRate,
      taxLabel,
      taxRegistration,
      invoicePrefix,
      invoiceFooter,
      bankName,
      accountNumber,
      ifscCode,
      accountName,
    } = body

    // Get existing settings or prepare for creation
    const existingSettings = await prisma.hotelSettings.findFirst()

    // Upsert settings
    const settings = await prisma.hotelSettings.upsert({
      where: { id: existingSettings?.id || 'non-existent-id' },
      update: {
        hotelName,
        address,
        phone,
        email,
        website,
        logoUrl,
        taxRate: taxRate ? parseFloat(taxRate) : undefined,
        taxLabel,
        taxRegistration,
        invoicePrefix,
        invoiceFooter,
        bankName,
        accountNumber,
        ifscCode,
        accountName,
      },
      create: {
        hotelName: hotelName || 'NeboSync Hotel',
        address: address || '',
        phone: phone || '',
        email: email || '',
        website: website || '',
        logoUrl,
        taxRate: taxRate ? parseFloat(taxRate) : 0.18,
        taxLabel: taxLabel || 'GST',
        taxRegistration,
        invoicePrefix: invoicePrefix || 'INV',
        invoiceFooter: invoiceFooter || 'Thank you for choosing our hotel!',
        bankName,
        accountNumber,
        ifscCode,
        accountName,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating hotel settings:', error)
    return NextResponse.json(
      { error: 'Failed to update hotel settings' },
      { status: 500 }
    )
  }
}
