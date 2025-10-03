import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  // Header Styles
  header: {
    marginBottom: 30,
    borderBottom: '3px solid #4CAF50',
    paddingBottom: 15,
  },
  hotelName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  headerSubtext: {
    fontSize: 11,
    textAlign: 'center',
    color: '#666',
    marginBottom: 3,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  // Info Row Styles
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  infoBox: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    color: '#2E7D32',
    borderBottom: '2px solid #4CAF50',
    paddingBottom: 5,
  },
  infoLine: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: '35%',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    width: '65%',
    fontSize: 10,
    color: '#000',
  },
  // Table Styles
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  tableCol1: {
    width: '50%',
    fontSize: 10,
  },
  tableCol2: {
    width: '12%',
    textAlign: 'right',
    fontSize: 10,
  },
  tableCol3: {
    width: '19%',
    textAlign: 'right',
    fontSize: 10,
  },
  tableCol4: {
    width: '19%',
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Summary Styles
  summaryContainer: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '50%',
    borderTop: '2px solid #E0E0E0',
    paddingTop: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 15,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    paddingHorizontal: 15,
    borderTop: '2px solid #4CAF50',
    backgroundColor: '#F1F8F4',
    padding: 15,
    borderRadius: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  // Status Badge
  statusBadge: {
    marginTop: 15,
    padding: 10,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusPending: {
    backgroundColor: '#FFF9C4',
    color: '#F57F17',
  },
  statusPaid: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  // Footer Styles
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1px solid #E0E0E0',
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    marginBottom: 5,
  },
  footerNote: {
    fontSize: 9,
    textAlign: 'center',
    color: '#999',
    marginTop: 15,
    fontStyle: 'italic',
  },
  bankDetails: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    borderLeft: '3px solid #4CAF50',
  },
  bankTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bankLine: {
    fontSize: 9,
    color: '#666',
    marginBottom: 3,
  },
  vegIndicator: {
    fontSize: 8,
    color: '#4CAF50',
    marginLeft: 5,
  },
  nonVegIndicator: {
    fontSize: 8,
    color: '#F44336',
    marginLeft: 5,
  },
})

interface HotelSettings {
  hotelName: string
  address: string
  phone: string
  email: string
  website: string
  taxRate: number
  taxLabel: string
  taxRegistration: string | null
  invoiceFooter: string
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

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, hotelSettings }) => {
  const hotelName = hotelSettings?.hotelName || 'NEBOSYNC HOTEL'
  const hotelAddress = hotelSettings?.address || ''
  const hotelPhone = hotelSettings?.phone || ''
  const hotelEmail = hotelSettings?.email || ''
  const taxLabel = hotelSettings?.taxLabel || 'GST'
  const taxPercentage = hotelSettings ? (hotelSettings.taxRate * 100).toFixed(0) : '18'
  const invoiceFooter = hotelSettings?.invoiceFooter || 'Thank you for choosing our hotel!'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.hotelName}>{hotelName.toUpperCase()}</Text>
          {hotelAddress && <Text style={styles.headerSubtext}>{hotelAddress}</Text>}
          {hotelPhone && <Text style={styles.headerSubtext}>Tel: {hotelPhone} | Email: {hotelEmail}</Text>}
          {hotelSettings?.taxRegistration && (
            <Text style={styles.headerSubtext}>GSTIN: {hotelSettings.taxRegistration}</Text>
          )}
          <Text style={styles.invoiceTitle}>Tax Invoice</Text>
        </View>

        {/* Invoice Info and Guest Info Side by Side */}
        <View style={styles.infoRow}>
          {/* Invoice Details */}
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Invoice No:</Text>
              <Text style={styles.infoValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>{invoice.status}</Text>
            </View>
          </View>

          {/* Guest Information */}
          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Billed To</Text>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{invoice.guest.name}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{invoice.guest.phone}</Text>
            </View>
            {invoice.guest.email && (
              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{invoice.guest.email}</Text>
              </View>
            )}
            {invoice.guest.room && (
              <View style={styles.infoLine}>
                <Text style={styles.infoLabel}>Room No:</Text>
                <Text style={styles.infoValue}>{invoice.guest.room.roomNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Invoice Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Description</Text>
            <Text style={styles.tableCol2}>Qty</Text>
            <Text style={styles.tableCol3}>Rate</Text>
            <Text style={styles.tableCol4}>Amount</Text>
          </View>

          {/* Table Rows */}
          {invoice.invoiceItems.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.tableCol1}>{item.description}</Text>
              <Text style={styles.tableCol2}>{item.quantity}</Text>
              <Text style={styles.tableCol3}>₹{item.unitPrice.toLocaleString('en-IN')}</Text>
              <Text style={styles.tableCol4}>₹{item.total.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₹{invoice.subtotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{taxLabel} ({taxPercentage}%):</Text>
            <Text style={styles.summaryValue}>₹{invoice.tax.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{invoice.total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Payment Status Badge */}
        <View style={[styles.statusBadge, invoice.paidAt ? styles.statusPaid : styles.statusPending]}>
          <Text>
            {invoice.paidAt
              ? `✓ PAID on ${new Date(invoice.paidAt).toLocaleDateString('en-IN')}`
              : '○ PAYMENT PENDING'}
          </Text>
        </View>

        {/* Bank Details */}
        {hotelSettings?.bankName && (
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details for Payment:</Text>
            <Text style={styles.bankLine}>Bank: {hotelSettings.bankName}</Text>
            {hotelSettings.accountName && (
              <Text style={styles.bankLine}>Account Name: {hotelSettings.accountName}</Text>
            )}
            {hotelSettings.accountNumber && (
              <Text style={styles.bankLine}>Account Number: {hotelSettings.accountNumber}</Text>
            )}
            {hotelSettings.ifscCode && (
              <Text style={styles.bankLine}>IFSC Code: {hotelSettings.ifscCode}</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{invoiceFooter}</Text>
          <Text style={styles.footerNote}>
            This is a computer-generated invoice and does not require a signature.
          </Text>
          <Text style={styles.footerNote}>
            For any queries, please contact our front desk. | {hotelEmail || ''}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Helper function to generate PDF buffer
export async function generateInvoicePDF(
  invoice: InvoicePDFProps['invoice'],
  hotelSettings?: HotelSettings
): Promise<Buffer> {
  const pdfBuffer = await renderToBuffer(
    <InvoicePDF invoice={invoice} hotelSettings={hotelSettings} />
  )
  return pdfBuffer
}
