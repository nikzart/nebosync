import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

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
    const { _section, ...fields } = body

    // Get existing settings or prepare for creation
    const existingSettings = await prisma.hotelSettings.findFirst()

    // Build update data — only include fields that are explicitly provided
    const updateData: Record<string, unknown> = {}
    const fieldMap: Record<string, string> = {
      hotelName: 'hotelName',
      address: 'address',
      phone: 'phone',
      email: 'email',
      website: 'website',
      logoUrl: 'logoUrl',
      taxLabel: 'taxLabel',
      taxRegistration: 'taxRegistration',
      invoicePrefix: 'invoicePrefix',
      invoiceFooter: 'invoiceFooter',
      invoiceAccentColor: 'invoiceAccentColor',
      paymentTerms: 'paymentTerms',
      currencySymbol: 'currencySymbol',
      bankName: 'bankName',
      accountNumber: 'accountNumber',
      ifscCode: 'ifscCode',
      accountName: 'accountName',
    }

    for (const [bodyKey, dbKey] of Object.entries(fieldMap)) {
      if (bodyKey in fields) {
        updateData[dbKey] = fields[bodyKey]
      }
    }

    // Handle taxRate specially (needs parseFloat)
    if ('taxRate' in fields && fields.taxRate != null) {
      updateData.taxRate = typeof fields.taxRate === 'number'
        ? fields.taxRate
        : parseFloat(fields.taxRate)
    }

    // Handle showBankDetails specially (boolean)
    if ('showBankDetails' in fields && typeof fields.showBankDetails === 'boolean') {
      updateData.showBankDetails = fields.showBankDetails
    }

    // Upsert settings
    const settings = await prisma.hotelSettings.upsert({
      where: { id: existingSettings?.id || 'non-existent-id' },
      update: updateData,
      create: {
        hotelName: fields.hotelName || 'NeboSync Hotel',
        address: fields.address || '',
        phone: fields.phone || '',
        email: fields.email || '',
        website: fields.website || '',
        logoUrl: fields.logoUrl ?? null,
        taxRate: fields.taxRate ? (typeof fields.taxRate === 'number' ? fields.taxRate : parseFloat(fields.taxRate)) : 0.18,
        taxLabel: fields.taxLabel || 'GST',
        taxRegistration: fields.taxRegistration ?? null,
        invoicePrefix: fields.invoicePrefix || 'INV',
        invoiceFooter: fields.invoiceFooter || 'Thank you for choosing our hotel!',
        invoiceAccentColor: fields.invoiceAccentColor || '#2D5A3D',
        paymentTerms: fields.paymentTerms || 'Due upon checkout',
        currencySymbol: fields.currencySymbol || '₹',
        showBankDetails: fields.showBankDetails ?? true,
        bankName: fields.bankName ?? null,
        accountNumber: fields.accountNumber ?? null,
        ifscCode: fields.ifscCode ?? null,
        accountName: fields.accountName ?? null,
      },
    })

    const sectionLabels: Record<string, string> = {
      hotel_info: 'Updated hotel information',
      billing_tax: 'Updated billing & tax configuration',
      invoice_settings: 'Updated invoice settings',
    }

    logActivity({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'hotel_settings',
      entityId: settings.id,
      description: sectionLabels[_section] ?? 'Updated hotel settings',
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating hotel settings:', error)
    const message = error instanceof Error ? error.message : 'Failed to update hotel settings'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
