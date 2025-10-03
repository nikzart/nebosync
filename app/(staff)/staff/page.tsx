'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Package
} from 'lucide-react'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  activeGuests: number
  todayOrders: number
  recentOrders: Array<{
    id: string
    status: string
    totalAmount: number
    createdAt: string
    guest: {
      name: string
      room: { roomNumber: string } | null
    }
  }>
}

export default function StaffDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [ordersRes, guestsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/guests')
      ])

      const orders = await ordersRes.json()
      const guests = await guestsRes.json()

      const totalOrders = orders.length
      const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length
      const completedOrders = orders.filter((o: any) => o.status === 'DELIVERED').length
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0)
      const activeGuests = guests.filter((g: any) => g.isActive).length

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayOrders = orders.filter((o: any) =>
        new Date(o.createdAt) >= today
      ).length

      const recentOrders = orders.slice(0, 5)

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        activeGuests,
        todayOrders,
        recentOrders
      }
    },
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your hotel operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.todayOrders || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-lime-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Guests</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeGuests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently checked in
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    {order.status === 'PENDING' && (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    {order.status === 'DELIVERED' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {(order.status === 'ACCEPTED' || order.status === 'IN_PROGRESS') && (
                      <Package className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {order.guest.room?.roomNumber
                          ? `Room ${order.guest.room.roomNumber}`
                          : order.guest.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent orders
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
