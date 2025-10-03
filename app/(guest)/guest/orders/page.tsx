'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, Package, XCircle, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  quantity: number
  price: number
  service?: {
    name: string
    category: string
  } | null
  foodMenu?: {
    name: string
    category: string
    isVeg: boolean
  } | null
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
    room: {
      roomNumber: string
    } | null
  }
}

export default function OrdersPage() {
  const { data: orders, isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Helper function to get invoice from order
  const getOrderInvoice = (order: Order) => {
    if (!order.invoiceItems || order.invoiceItems.length === 0) {
      return null
    }
    // Return the first invoice (orders typically have one invoice)
    return order.invoiceItems[0].invoice
  }

  // Function to download invoice PDF
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
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to cancel order')
      toast.success('Order cancelled successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to cancel order')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-700'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-700'
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage your orders</p>
      </header>

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-3xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(order.status)}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Order #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-700">
                        {item.quantity}x{' '}
                        {item.service?.name || item.foodMenu?.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-2xl">
                    <p className="text-xs text-gray-500 mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.notes}
                    </p>
                  </div>
                )}

                {order.status === 'PENDING' && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      className="w-full text-red-500 border-red-200 hover:bg-red-50"
                    >
                      Cancel Order
                    </Button>
                  </div>
                )}

                {/* Invoice section for completed orders */}
                {order.status === 'COMPLETED' && (() => {
                  const invoice = getOrderInvoice(order)
                  return invoice ? (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Invoice Generated</span>
                        <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-700 font-medium">
                          {invoice.invoiceNumber}
                        </span>
                      </div>
                      <Button
                        onClick={() => downloadInvoice(invoice.id, invoice.invoiceNumber)}
                        className="w-full bg-pastel-purple hover:bg-pastel-purple/90 gap-2"
                        size="sm"
                      >
                        <FileText className="w-4 h-4" />
                        <Download className="w-4 h-4" />
                        Download Invoice PDF
                      </Button>
                    </div>
                  ) : null
                })()}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start ordering to see your orders here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
