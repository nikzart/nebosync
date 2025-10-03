'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  Package,
  XCircle,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

interface Order {
  id: string
  orderType: string
  status: string
  totalAmount: number
  notes: string | null
  createdAt: string
  orderItems: OrderItem[]
  guest: {
    name: string
    phone: string
    room: {
      roomNumber: string
    } | null
  }
}

export default function StaffOrdersPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['staff-orders', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json()
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update order')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
      queryClient.invalidateQueries({ queryKey: ['header-quick-stats'] })
      toast.success('Order updated successfully')
    },
    onError: () => {
      toast.error('Failed to update order')
    },
  })

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
        return 'bg-yellow-500/20 text-yellow-700 font-medium dark:bg-yellow-500/20 dark:text-yellow-400'
      case 'ACCEPTED':
        return 'bg-blue-500/20 text-blue-700 font-medium dark:bg-blue-500/20 dark:text-blue-400'
      case 'IN_PROGRESS':
        return 'bg-purple-500/20 text-purple-700 font-medium dark:bg-purple-500/20 dark:text-purple-400'
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-700 font-medium dark:bg-green-500/20 dark:text-green-400'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-700 font-medium dark:bg-red-500/20 dark:text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-700 font-medium dark:bg-gray-500/20 dark:text-gray-400'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">
          Manage and track guest orders in real-time
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border p-6 animate-pulse"
            >
              <div className="h-6 bg-muted rounded w-1/3 mb-4" />
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-semibold">
                      {order.guest.room?.roomNumber
                        ? `Room ${order.guest.room.roomNumber}`
                        : order.guest.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.guest.phone}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Order Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Type</span>
                  <span className="text-sm font-medium">{order.orderType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-lg font-bold text-lime-green">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Time</span>
                  <span className="text-sm">
                    {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4 mb-4">
                <p className="text-xs text-muted-foreground mb-2">Items:</p>
                <div className="space-y-1">
                  {order.orderItems.map((item) => (
                    <p key={item.id} className="text-sm">
                      {item.quantity}× {item.service?.name || item.foodMenu?.name}
                    </p>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Notes
                  </p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}

              {/* Actions */}
              {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                <div className="flex gap-2">
                  {order.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateOrderMutation.mutate({
                            orderId: order.id,
                            status: 'ACCEPTED',
                          })
                        }
                        className="flex-1 bg-lime-green hover:bg-lime-green/90"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateOrderMutation.mutate({
                            orderId: order.id,
                            status: 'CANCELLED',
                          })
                        }
                        className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  {order.status === 'ACCEPTED' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateOrderMutation.mutate({
                          orderId: order.id,
                          status: 'IN_PROGRESS',
                        })
                      }
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Start Processing
                    </Button>
                  )}
                  {order.status === 'IN_PROGRESS' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateOrderMutation.mutate({
                          orderId: order.id,
                          status: 'COMPLETED',
                        })
                      }
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders found</h2>
          <p className="text-muted-foreground">
            Orders will appear here when guests place them
          </p>
        </div>
      )}
    </div>
  )
}
