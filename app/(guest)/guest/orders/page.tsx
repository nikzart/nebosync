'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Package, Download } from 'lucide-react'
import { toast } from 'sonner'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  price: number
  service?: { name: string; category: string } | null
  foodMenu?: { name: string; category: string; isVeg: boolean } | null
}

interface InvoiceItem {
  id: string
  invoice: {
    id: string
    invoiceNumber: string
    status: string
    total: number
  }
}

interface Order {
  id: string
  orderType: string
  status: string
  totalAmount: number
  notes: string | null
  createdAt: string
  orderItems: OrderItem[]
  invoiceItems?: InvoiceItem[]
  guest: {
    name: string
    room: { roomNumber: string } | null
  }
}

const statusBarColor: Record<string, string> = {
  PENDING: 'bg-[#C9A96E]',
  ACCEPTED: 'bg-[#4A7EC4]',
  IN_PROGRESS: 'bg-[#2D5A3D]',
  COMPLETED: 'bg-[#2D5A3D]',
  CANCELLED: 'bg-[#B5403A]',
}

const statusBadge: Record<string, string> = {
  PENDING: 'bg-[#F5F0E4] text-[#A8893D]',
  ACCEPTED: 'bg-[#EDF3FA] text-[#4A7EC4]',
  IN_PROGRESS: 'bg-[#EBF3ED] text-[#2D5A3D]',
  COMPLETED: 'bg-[#EBF3ED] text-[#2D5A3D]',
  CANCELLED: 'bg-[#FDF1F0] text-[#B5403A]',
}

function formatStatus(status: string) {
  return status.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function OrdersPage() {
  const { data: orders, isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json()
    },
    refetchInterval: 5000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  const getOrderInvoice = (order: Order) => {
    if (!order.invoiceItems || order.invoiceItems.length === 0) return null
    return order.invoiceItems[0].invoice
  }

  const downloadInvoice = (invoiceId: string, invoiceNumber: string) => {
    const link = document.createElement('a')
    link.href = `/api/invoices/${invoiceId}/download`
    link.download = `invoice-${invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Downloading invoice...')
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to cancel order')
      toast.success('Order cancelled successfully')
      refetch()
    } catch {
      toast.error('Failed to cancel order')
    }
  }

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-[24px] font-semibold text-[#1C1C1C] tracking-tight">Orders</h1>
        <p className="text-[14px] text-[#6B6B6B] mt-1">Track your requests</p>
      </header>

      <div className="px-5 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[12px] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="h-[3px] rounded-full skeleton-shimmer -mx-4 -mt-4 mb-3 rounded-t-[12px]" />
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded skeleton-shimmer" />
                  <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={staggerItem}
                className="bg-white rounded-[12px] overflow-hidden"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                {/* Status bar */}
                <div className={cn('h-[3px]', statusBarColor[order.status] || 'bg-[#EDECEA]')} />

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[11px] font-medium text-[#A1A1A1] uppercase tracking-wide">
                        {order.orderType.replace('_', ' ')}
                      </p>
                      <p className="text-[13px] text-[#6B6B6B] mt-0.5">
                        {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                    <span className={cn(
                      'text-[11px] font-semibold px-2.5 py-1 rounded-full',
                      statusBadge[order.status] || 'bg-[#F2F0EC] text-[#6B6B6B]'
                    )}>
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  {/* Item list */}
                  <div className="space-y-1.5">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-[14px]">
                        <span className="text-[#1C1C1C]">
                          {item.quantity}x {item.service?.name || item.foodMenu?.name}
                        </span>
                        <span className="text-[#6B6B6B] tabular-nums">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mt-3 p-2.5 bg-[#FAF9F6] rounded-[8px]">
                      <p className="text-[12px] text-[#6B6B6B]">{order.notes}</p>
                    </div>
                  )}

                  <div className="border-t border-[#EDECEA] mt-3 pt-3 flex justify-between items-center">
                    <span className="text-[14px] text-[#6B6B6B]">Total</span>
                    <span className="text-[16px] font-bold text-[#1C1C1C] tabular-nums">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Cancel button for pending orders */}
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="w-full mt-3 h-9 rounded-[8px] border border-[#B5403A]/20 text-[#B5403A] text-[13px] font-medium"
                    >
                      Cancel Order
                    </button>
                  )}

                  {/* Invoice download for completed orders */}
                  {order.status === 'COMPLETED' && (() => {
                    const invoice = getOrderInvoice(order)
                    return invoice ? (
                      <div className="border-t border-[#EDECEA] mt-3 pt-3 flex items-center justify-between">
                        <span className="text-[12px] text-[#6B6B6B]">
                          Invoice {invoice.invoiceNumber}
                        </span>
                        <button
                          onClick={() => downloadInvoice(invoice.id, invoice.invoiceNumber)}
                          className="flex items-center gap-1.5 text-[13px] font-medium text-[#2D5A3D]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    ) : null
                  })()}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-14 h-14 rounded-full bg-[#EBF3ED] flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[#2D5A3D]" />
            </div>
            <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-1">No orders yet</h2>
            <p className="text-[13px] text-[#A1A1A1] text-center max-w-[260px]">
              Start ordering to see your orders here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
