'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Package,
  BedDouble,
  TrendingUp,
  UtensilsCrossed,
  Briefcase,
  MessageSquare,
  UserPlus,
  ArrowRight,
} from 'lucide-react'

interface DashboardData {
  orders: {
    total: number
    today: number
    pending: number
    accepted: number
    inProgress: number
    completed: number
    cancelled: number
  }
  revenue: {
    total: number
    today: number
  }
  guests: {
    active: number
    total: number
  }
  rooms: {
    total: number
    occupied: number
    occupancyRate: number
  }
  recentOrders: Array<{
    id: string
    status: string
    totalAmount: number
    createdAt: string
    guest: {
      name: string
      room: { roomNumber: string } | null
    }
    orderItems: Array<{
      id: string
      quantity: number
      service: { name: string } | null
      foodMenu: { name: string } | null
    }>
  }>
  popularItems: Array<{
    name: string
    type: 'Food' | 'Service'
    count: number
  }>
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#eab308',
  ACCEPTED: '#3b82f6',
  IN_PROGRESS: '#a855f7',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'PENDING':
      return <Clock className="w-4 h-4 text-yellow-500" />
    case 'ACCEPTED':
      return <Package className="w-4 h-4 text-blue-500" />
    case 'IN_PROGRESS':
      return <Package className="w-4 h-4 text-purple-500" />
    case 'COMPLETED':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'CANCELLED':
      return <Clock className="w-4 h-4 text-red-500" />
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />
  }
}

export default function StaffDashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      return res.json()
    },
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
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

  const activeOrders =
    (data?.orders.pending ?? 0) +
    (data?.orders.accepted ?? 0) +
    (data?.orders.inProgress ?? 0)

  const pipelineStages = [
    { key: 'PENDING', count: data?.orders.pending ?? 0 },
    { key: 'ACCEPTED', count: data?.orders.accepted ?? 0 },
    { key: 'IN_PROGRESS', count: data?.orders.inProgress ?? 0 },
    { key: 'COMPLETED', count: data?.orders.completed ?? 0 },
    { key: 'CANCELLED', count: data?.orders.cancelled ?? 0 },
  ]

  const maxStageCount = Math.max(...pipelineStages.map((s) => s.count), 1)

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your hotel operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.orders.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.orders.today ?? 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.orders.pending ?? 0}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(data?.revenue.total ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{(data?.revenue.today ?? 0).toLocaleString('en-IN')} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Guests</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.guests.active ?? 0}</div>
            <p className="text-xs text-muted-foreground">Currently checked in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Room Occupancy</CardTitle>
            <BedDouble className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.rooms.occupancyRate ?? 0}%</div>
            <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${data?.rooms.occupancyRate ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data?.rooms.occupied ?? 0} / {data?.rooms.total ?? 0} rooms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two-column: Pie Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Pipeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Order Pipeline
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {activeOrders} active order{activeOrders !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/staff/orders"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pipelineStages.map((stage) => {
                const barPercent = maxStageCount > 0 ? (stage.count / maxStageCount) * 100 : 0
                const isPending = stage.key === 'PENDING' && stage.count > 0
                return (
                  <Link
                    key={stage.key}
                    href={`/staff/orders?status=${stage.key}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                      isPending ? 'border-yellow-500/30 bg-yellow-500/5' : ''
                    }`}
                  >
                    <StatusIcon status={stage.key} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">
                          {STATUS_LABELS[stage.key]}
                        </span>
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{ color: STATUS_COLORS[stage.key] }}
                        >
                          {stage.count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${barPercent}%`,
                            backgroundColor: STATUS_COLORS[stage.key],
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link
              href="/staff/orders"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/staff/orders?highlight=${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon status={order.status} />
                      <div>
                        <p className="font-medium text-sm">
                          {order.guest.room?.roomNumber
                            ? `Room ${order.guest.room.roomNumber}`
                            : order.guest.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${STATUS_COLORS[order.status]}20`,
                          color: STATUS_COLORS[order.status],
                        }}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                  </Link>
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

      {/* Two-column: Popular Items + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.popularItems && data.popularItems.length > 0 ? (
              <div className="space-y-3">
                {data.popularItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            item.type === 'Food'
                              ? 'bg-orange-500/10 text-orange-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {item.type === 'Food' ? (
                            <span className="inline-flex items-center gap-1">
                              <UtensilsCrossed className="w-3 h-3" /> Food
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> Service
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{item.count} orders</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No order data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/staff/guests"
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Check-in Guest</p>
                  <p className="text-sm text-muted-foreground">Register a new guest arrival</p>
                </div>
              </Link>
              <Link
                href="/staff/messages"
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">View Messages</p>
                  <p className="text-sm text-muted-foreground">Check guest conversations</p>
                </div>
              </Link>
              <Link
                href="/staff/orders"
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">Browse Orders</p>
                  <p className="text-sm text-muted-foreground">Manage all guest orders</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
