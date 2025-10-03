'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

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
    room: {
      roomNumber: string
    } | null
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pastel-purple border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-500">Invoice not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Invoice</h1>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Invoice Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {/* Invoice Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {invoice.invoiceNumber}
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Guest Info */}
          <div className="mb-8 p-4 bg-purple-50 rounded-2xl">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Billed To</h3>
            <p className="text-gray-900">{invoice.guest.name}</p>
            {invoice.guest.room && (
              <p className="text-sm text-gray-600">Room {invoice.guest.room.roomNumber}</p>
            )}
            <p className="text-sm text-gray-600">{invoice.guest.phone}</p>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Items</h3>
            <div className="space-y-3">
              {invoice.invoiceItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{item.total.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (18% GST)</span>
              <span>₹{invoice.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₹{invoice.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-6">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                invoice.status === 'PAID'
                  ? 'bg-green-100 text-green-700'
                  : invoice.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
