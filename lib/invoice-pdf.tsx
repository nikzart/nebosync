import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

interface HotelSettings {
  hotelName: string
  address: string
  phone: string
  email: string
  website: string
  logoUrl: string | null
  taxRate: number
  taxLabel: string
  taxRegistration: string | null
  invoiceFooter: string
  invoiceAccentColor: string
  paymentTerms: string
  currencySymbol: string
  showBankDetails: boolean
  bankName: string | null
  accountNumber: string | null
  ifscCode: string | null
  accountName: string | null
}

interface InvoicePDFProps {
  invoice: {
    invoiceNumber: string
    createdAt: string
    status: string
    subtotal: number
    tax: number
    total: number
    paidAt: string | null
    guest: {
      name: string
      phone: string
      email: string | null
      room: {
        roomNumber: string
      } | null
    }
    invoiceItems: Array<{
      description: string
      quantity: number
      unitPrice: number
      total: number
    }>
  }
  hotelSettings?: HotelSettings
}

/** @react-pdf/renderer only supports raster images (PNG, JPG) — not SVG */
function isRasterImage(url: string | null): boolean {
  if (!url) return false
  if (url.startsWith('data:image/svg')) return false
  return true
}

function createStyles(accent: string) {
  return StyleSheet.create({
    page: {
      paddingTop: 0,
      paddingBottom: 40,
      paddingHorizontal: 50,
      fontSize: 10,
      fontFamily: 'Helvetica',
      backgroundColor: '#FFFFFF',
      color: '#333333',
    },
    // Accent top bar
    topBar: {
      height: 4,
      backgroundColor: accent,
      marginBottom: 30,
      marginHorizontal: -50,
    },
    // Header
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    logo: {
      width: 80,
      height: 80,
      marginRight: 16,
      objectFit: 'contain',
    },
    headerInfo: {
      flex: 1,
    },
    hotelName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: accent,
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    headerDetail: {
      fontSize: 9,
      color: '#777777',
      marginBottom: 2,
    },
    headerGstin: {
      fontSize: 8,
      color: '#999999',
      marginTop: 2,
      fontWeight: 'bold',
    },
    // Invoice badge
    invoiceBadge: {
      backgroundColor: accent,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 4,
    },
    invoiceBadgeText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#FFFFFF',
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    // Rule
    rule: {
      borderBottom: '0.5px solid #e0e0e0',
      marginVertical: 16,
    },
    // Two-column info
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    infoCol: {
      width: '48%',
    },
    infoSectionLabel: {
      fontSize: 8,
      fontWeight: 'bold',
      color: accent,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 8,
      borderBottom: `1px solid ${accent}`,
      paddingBottom: 4,
    },
    infoText: {
      fontSize: 10,
      color: '#444444',
      marginBottom: 3,
    },
    infoTextBold: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#1a1a1a',
      marginBottom: 4,
    },
    infoTextLight: {
      fontSize: 9,
      color: '#888888',
      marginBottom: 2,
    },
    // Table
    table: {
      marginTop: 8,
      marginBottom: 24,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: `${accent}15`,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderBottom: `1.5px solid ${accent}`,
    },
    tableHeaderText: {
      fontSize: 8,
      fontWeight: 'bold',
      color: accent,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderBottom: '0.5px solid #eeeeee',
    },
    tableRowAlt: {
      flexDirection: 'row',
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderBottom: '0.5px solid #eeeeee',
      backgroundColor: '#fafafa',
    },
    tableCol1: { width: '48%', fontSize: 10 },
    tableCol2: { width: '12%', textAlign: 'right', fontSize: 10 },
    tableCol3: { width: '20%', textAlign: 'right', fontSize: 10 },
    tableCol4: { width: '20%', textAlign: 'right', fontSize: 10, fontWeight: 'bold' },
    // Summary
    summaryContainer: {
      marginLeft: 'auto',
      width: '45%',
      marginTop: 8,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 5,
    },
    summaryLabel: {
      fontSize: 10,
      color: '#888888',
    },
    summaryValue: {
      fontSize: 10,
      color: '#333333',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: accent,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 4,
      marginTop: 6,
    },
    totalLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    totalValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    // Payment terms
    paymentTerms: {
      fontSize: 9,
      color: '#aaaaaa',
      fontStyle: 'italic',
      marginTop: 14,
      textAlign: 'right',
    },
    // Status badge
    statusContainer: {
      marginTop: 24,
      alignItems: 'center',
    },
    statusPaid: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFFFFF',
      paddingVertical: 8,
      paddingHorizontal: 24,
      borderRadius: 4,
      backgroundColor: accent,
    },
    statusPending: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFFFFF',
      paddingVertical: 8,
      paddingHorizontal: 24,
      borderRadius: 4,
      backgroundColor: '#E8A317',
    },
    // Bank details
    bankSection: {
      marginTop: 24,
      padding: 12,
      backgroundColor: '#f8f8f8',
      borderRadius: 4,
      borderLeft: `3px solid ${accent}`,
    },
    bankTitle: {
      fontSize: 8,
      fontWeight: 'bold',
      color: accent,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6,
    },
    bankLine: {
      fontSize: 9,
      color: '#666666',
      marginBottom: 2,
    },
    // Footer
    footer: {
      marginTop: 'auto',
      paddingTop: 14,
      borderTop: `1px solid ${accent}40`,
    },
    footerText: {
      fontSize: 9,
      textAlign: 'center',
      color: '#999999',
      marginBottom: 4,
    },
    footerNote: {
      fontSize: 8,
      textAlign: 'center',
      color: '#cccccc',
      fontStyle: 'italic',
    },
  })
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, hotelSettings }) => {
  const accent = hotelSettings?.invoiceAccentColor || '#2D5A3D'
  const currency = hotelSettings?.currencySymbol || '₹'
  const hotelName = hotelSettings?.hotelName || 'NeboSync Hotel'
  const hotelAddress = hotelSettings?.address || ''
  const hotelPhone = hotelSettings?.phone || ''
  const hotelEmail = hotelSettings?.email || ''
  const hotelWebsite = hotelSettings?.website || ''
  const taxLabel = hotelSettings?.taxLabel || 'GST'
  const taxPercentage = hotelSettings ? (hotelSettings.taxRate * 100).toFixed(0) : '18'
  const paymentTerms = hotelSettings?.paymentTerms || 'Due upon checkout'
  const invoiceFooter = hotelSettings?.invoiceFooter || 'Thank you for choosing our hotel!'
  const showBank = hotelSettings?.showBankDetails ?? true
  const logoUrl = hotelSettings?.logoUrl || null
  const canShowLogo = isRasterImage(logoUrl)

  const styles = createStyles(accent)

  const fmt = (amount: number) => `${currency}${amount.toLocaleString('en-IN')}`

  const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Accent top bar */}
        <View style={styles.topBar} />

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            {canShowLogo && logoUrl && (
              <Image style={styles.logo} src={logoUrl} />
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.hotelName}>{hotelName.toUpperCase()}</Text>
              {hotelAddress ? <Text style={styles.headerDetail}>{hotelAddress}</Text> : null}
              {(hotelPhone || hotelEmail) ? (
                <Text style={styles.headerDetail}>
                  {hotelPhone}{hotelPhone && hotelEmail ? '  ·  ' : ''}{hotelEmail}
                </Text>
              ) : null}
              {hotelWebsite ? <Text style={styles.headerDetail}>{hotelWebsite}</Text> : null}
              {hotelSettings?.taxRegistration && (
                <Text style={styles.headerGstin}>GSTIN: {hotelSettings.taxRegistration}</Text>
              )}
            </View>
          </View>
          <View style={styles.invoiceBadge}>
            <Text style={styles.invoiceBadgeText}>Tax Invoice</Text>
          </View>
        </View>

        <View style={styles.rule} />

        {/* Two-column info */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoSectionLabel}>Invoice Details</Text>
            <Text style={styles.infoTextBold}>{invoice.invoiceNumber}</Text>
            <Text style={styles.infoText}>Date: {dateStr}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoSectionLabel}>Billed To</Text>
            <Text style={styles.infoTextBold}>{invoice.guest.name}</Text>
            {invoice.guest.room && (
              <Text style={styles.infoText}>Room {invoice.guest.room.roomNumber}</Text>
            )}
            <Text style={styles.infoTextLight}>{invoice.guest.phone}</Text>
            {invoice.guest.email && (
              <Text style={styles.infoTextLight}>{invoice.guest.email}</Text>
            )}
          </View>
        </View>

        <View style={styles.rule} />

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableCol1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.tableCol2]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.tableCol3]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.tableCol4]}>Amount</Text>
          </View>
          {invoice.invoiceItems.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCol1}>{item.description}</Text>
              <Text style={styles.tableCol2}>{item.quantity}</Text>
              <Text style={styles.tableCol3}>{fmt(item.unitPrice)}</Text>
              <Text style={styles.tableCol4}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{fmt(invoice.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{taxLabel} ({taxPercentage}%)</Text>
            <Text style={styles.summaryValue}>{fmt(invoice.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{fmt(invoice.total)}</Text>
          </View>
        </View>

        {/* Payment Terms */}
        <Text style={styles.paymentTerms}>{paymentTerms}</Text>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          {invoice.paidAt ? (
            <Text style={styles.statusPaid}>
              PAID  ·  {new Date(invoice.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          ) : (
            <Text style={styles.statusPending}>PAYMENT PENDING</Text>
          )}
        </View>

        {/* Bank Details */}
        {showBank && hotelSettings?.bankName && (
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>Bank Details for Payment</Text>
            <Text style={styles.bankLine}>Bank: {hotelSettings.bankName}</Text>
            {hotelSettings.accountName && (
              <Text style={styles.bankLine}>Account Name: {hotelSettings.accountName}</Text>
            )}
            {hotelSettings.accountNumber && (
              <Text style={styles.bankLine}>Account No: {hotelSettings.accountNumber}</Text>
            )}
            {hotelSettings.ifscCode && (
              <Text style={styles.bankLine}>IFSC: {hotelSettings.ifscCode}</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{invoiceFooter}</Text>
          <Text style={styles.footerNote}>
            This is a computer-generated invoice and does not require a signature.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateInvoicePDF(
  invoice: InvoicePDFProps['invoice'],
  hotelSettings?: HotelSettings
): Promise<Buffer> {
  const pdfBuffer = await renderToBuffer(
    <InvoicePDF invoice={invoice} hotelSettings={hotelSettings} />
  )
  return pdfBuffer
}
