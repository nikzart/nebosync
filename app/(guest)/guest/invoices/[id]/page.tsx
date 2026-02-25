'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { tapScale } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  subtotal: number
  tax: number
  total: number
  createdAt: string
  guest: {
    name: string
    email: string | null
    phone: string
    room: { roomNumber: string } | null
  }
  invoiceItems: InvoiceItem[]
}

export default function GuestInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const { data: invoice, isLoading } = useQuery<Invoice>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${id}`)
      if (!res.ok) throw new Error('Failed to fetch invoice')
      return res.json()
    },
  })

  const downloadInvoice = () => {
    if (!invoice) return
    const link = document.createElement('a')
    link.href = `/api/invoices/${invoice.id}/download`
    link.download = `invoice-${invoice.invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const previewInvoice = () => {
    if (!invoice) return
    window.open(`/api/invoices/${invoice.id}/download?preview=true`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-[#2D5A3D] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8">
        <p className="text-[14px] text-[#6B6B6B]">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-[#FAF9F6]/90 backdrop-blur-lg z-10 px-5 pt-3 pb-3 border-b border-[#EDECEA]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <ArrowLeft className="w-4 h-4 text-[#1C1C1C]" />
            </button>
            <h1 className="text-[18px] font-semibold text-[#1C1C1C]">Invoice</h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              {...tapScale}
              onClick={previewInvoice}
              className="flex items-center gap-1 text-[13px] font-medium text-[#6B6B6B]"
            >
              <Eye className="w-4 h-4" />
              Preview
            </motion.button>
            <motion.button
              {...tapScale}
              onClick={downloadInvoice}
              className="flex items-center gap-1 text-[13px] font-medium text-[#2D5A3D]"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
          </div>
        </div>
      </header>

      <div className="px-5 py-4">
        <div className="bg-white rounded-[12px] p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          {/* Invoice Header */}
          <div className="mb-6">
            <h2 className="text-[20px] font-bold text-[#1C1C1C] mb-1">{invoice.invoiceNumber}</h2>
            <p className="text-[13px] text-[#6B6B6B]">
              {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Billed To */}
          <div className="mb-6 p-3.5 bg-[#FAF9F6] rounded-[8px]">
            <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide mb-1">Billed To</p>
            <p className="text-[14px] font-medium text-[#1C1C1C]">{invoice.guest.name}</p>
            {invoice.guest.room && (
              <p className="text-[13px] text-[#6B6B6B]">Room {invoice.guest.room.roomNumber}</p>
            )}
            <p className="text-[13px] text-[#6B6B6B]">{invoice.guest.phone}</p>
          </div>

          {/* Items */}
          <div className="mb-5">
            <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide mb-3">Items</p>
            <div className="space-y-2.5">
              {invoice.invoiceItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-[14px] text-[#1C1C1C]">{item.description}</p>
                    <p className="text-[12px] text-[#A1A1A1]">
                      {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="text-[14px] font-semibold text-[#1C1C1C] tabular-nums">
                    ₹{item.total.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-[#EDECEA] pt-3 space-y-1.5">
            <div className="flex justify-between text-[14px]">
              <span className="text-[#6B6B6B]">Subtotal</span>
              <span className="text-[#1C1C1C] tabular-nums">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#6B6B6B]">Tax (GST)</span>
              <span className="text-[#1C1C1C] tabular-nums">₹{invoice.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[18px] font-bold text-[#1C1C1C] pt-2 border-t border-[#EDECEA]">
              <span>Total</span>
              <span className="tabular-nums">₹{invoice.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <span className={cn(
              'inline-block px-3 py-1.5 rounded-full text-[12px] font-semibold',
              invoice.status === 'PAID' && 'bg-[#EBF3ED] text-[#2D5A3D]',
              invoice.status === 'PENDING' && 'bg-[#F5F0E4] text-[#A8893D]',
              invoice.status !== 'PAID' && invoice.status !== 'PENDING' && 'bg-[#F2F0EC] text-[#6B6B6B]'
            )}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
