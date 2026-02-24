'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Receipt,
  Clock,
  CheckCircle,
  Download,
  Calendar,
  UtensilsCrossed,
  Briefcase,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts'

// --- Types ---

interface AnalyticsData {
  kpis: {
    revenue: number
    orders: number
    avgOrderValue: number
    taxCollected: number
    pendingAmount: number
    completionRate: number
  }
  comparison: {
    revenueDelta: number | null
    ordersDelta: number | null
  } | null
  timeSeries: Array<{
    period: string
    revenue: number
    orderCount: number
    taxCollected: number
  }>
  revenueByType: Array<{
    type: string
    revenue: number
    count: number
    percentage: number
  }>
  revenueByCategory: Array<{
    category: string
    revenue: number
    count: number
  }>
  invoiceBreakdown: Array<{
    status: string
    count: number
    total: number
  }>
  topItems: Array<{
    rank: number
    name: string
    type: 'Food' | 'Service'
    quantity: number
    revenue: number
  }>
  topGuests: Array<{
    name: string
    room: string
    orderCount: number
    totalSpend: number
  }>
  occupancy: {
    totalRooms: number
    occupiedRooms: number
    rate: number
  }
}

type PresetKey =
  | 'today'
  | '7d'
  | '30d'
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'this-year'
  | 'all'

interface Preset {
  label: string
  getRange: () => { from: string; to: string } | null
}

// --- Helpers ---

function getPresets(): Record<PresetKey, Preset> {
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  return {
    today: {
      label: 'Today',
      getRange: () => ({ from: fmt(today), to: fmt(today) }),
    },
    '7d': {
      label: 'Last 7 Days',
      getRange: () => {
        const from = new Date(today)
        from.setDate(from.getDate() - 6)
        return { from: fmt(from), to: fmt(today) }
      },
    },
    '30d': {
      label: 'Last 30 Days',
      getRange: () => {
        const from = new Date(today)
        from.setDate(from.getDate() - 29)
        return { from: fmt(from), to: fmt(today) }
      },
    },
    'this-month': {
      label: 'This Month',
      getRange: () => {
        const from = new Date(today.getFullYear(), today.getMonth(), 1)
        return { from: fmt(from), to: fmt(today) }
      },
    },
    'last-month': {
      label: 'Last Month',
      getRange: () => {
        const from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const to = new Date(today.getFullYear(), today.getMonth(), 0)
        return { from: fmt(from), to: fmt(to) }
      },
    },
    'this-quarter': {
      label: 'This Quarter',
      getRange: () => {
        const q = Math.floor(today.getMonth() / 3)
        const from = new Date(today.getFullYear(), q * 3, 1)
        return { from: fmt(from), to: fmt(today) }
      },
    },
    'this-year': {
      label: 'This Year',
      getRange: () => {
        const from = new Date(today.getFullYear(), 0, 1)
        return { from: fmt(from), to: fmt(today) }
      },
    },
    all: {
      label: 'All Time',
      getRange: () => null,
    },
  }
}

const ORDER_TYPE_COLORS: Record<string, string> = {
  FOOD: '#f97316',
  ROOM_SERVICE: '#8b5cf6',
  CUSTOM_REQUEST: '#06b6d4',
  UNKNOWN: '#6b7280',
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  FOOD: 'Food',
  ROOM_SERVICE: 'Room Service',
  CUSTOM_REQUEST: 'Custom Request',
  UNKNOWN: 'Other',
}

const INVOICE_STATUS_COLORS: Record<string, string> = {
  PAID: '#22c55e',
  PENDING: '#eab308',
  DRAFT: '#6b7280',
  CANCELLED: '#ef4444',
}

// --- Components ---

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null
  const isUp = delta >= 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? 'text-green-500' : 'text-red-500'
      }`}
    >
      {isUp ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {Math.abs(delta)}%
    </span>
  )
}

function KpiCard({
  title,
  value,
  icon: Icon,
  iconColor,
  delta,
  prefix,
  suffix,
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  delta?: number | null
  prefix?: string
  suffix?: string
}) {
  const formatted = prefix
    ? `${prefix}${value.toLocaleString('en-IN')}`
    : suffix
      ? `${value}${suffix}`
      : value.toLocaleString('en-IN')

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatted}</div>
        {delta !== undefined && (
          <div className="mt-1">
            <DeltaBadge delta={delta} />
            {delta !== null && (
              <span className="text-xs text-muted-foreground ml-1">
                vs prev period
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const chartTooltipStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'var(--foreground)',
}

const chartTooltipItemStyle = {
  color: 'var(--foreground)',
}

const chartTooltipLabelStyle = {
  color: 'var(--muted-foreground)',
}

// --- Page ---

export default function AnalyticsPage() {
  const presets = useMemo(() => getPresets(), [])
  const [activePreset, setActivePreset] = useState<PresetKey>('30d')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const dateRange = useMemo(() => {
    if (activePreset === 'custom' as PresetKey) {
      return customFrom && customTo ? { from: customFrom, to: customTo } : null
    }
    return presets[activePreset]?.getRange() ?? null
  }, [activePreset, customFrom, customTo, presets])

  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    if (dateRange) {
      params.set('dateFrom', dateRange.from)
      params.set('dateTo', dateRange.to)
    }
    params.set('groupBy', groupBy)
    return params.toString()
  }, [dateRange, groupBy])

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/revenue?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json()
    },
  })

  const handlePreset = (key: PresetKey) => {
    setActivePreset(key)
  }

  const handleCustomDate = () => {
    if (customFrom && customTo) {
      setActivePreset('custom' as PresetKey)
    }
  }

  const exportCsv = () => {
    if (!data?.timeSeries.length) return
    const header = 'Period,Revenue,Orders,Tax Collected\n'
    const rows = data.timeSeries
      .map((r) => `${r.period},${r.revenue},${r.orderCount},${r.taxCollected}`)
      .join('\n')
    const csv = header + rows
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-pulse">
            <CardContent className="p-6">
              <div className="h-[300px] bg-muted rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-[300px] bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Revenue insights and business performance
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data?.timeSeries.length}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2">
              {(Object.entries(presets) as [PresetKey, Preset][]).map(
                ([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handlePreset(key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activePreset === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              )}
            </div>

            {/* Custom date inputs */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-sm"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-sm"
              />
              <button
                onClick={handleCustomDate}
                disabled={!customFrom || !customTo}
                className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium disabled:opacity-50"
              >
                Apply
              </button>
            </div>

            {/* Group by */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Group by:</span>
              {(['day', 'week', 'month'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    groupBy === g
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Total Revenue"
          value={data?.kpis.revenue ?? 0}
          icon={DollarSign}
          iconColor="text-green-500"
          delta={data?.comparison?.revenueDelta}
          prefix="₹"
        />
        <KpiCard
          title="Total Orders"
          value={data?.kpis.orders ?? 0}
          icon={ShoppingCart}
          iconColor="text-blue-500"
          delta={data?.comparison?.ordersDelta}
        />
        <KpiCard
          title="Avg Order Value"
          value={data?.kpis.avgOrderValue ?? 0}
          icon={TrendingUp}
          iconColor="text-purple-500"
          prefix="₹"
        />
        <KpiCard
          title="Tax Collected"
          value={data?.kpis.taxCollected ?? 0}
          icon={Receipt}
          iconColor="text-orange-500"
          prefix="₹"
        />
        <KpiCard
          title="Pending Amount"
          value={data?.kpis.pendingAmount ?? 0}
          icon={Clock}
          iconColor="text-yellow-500"
          prefix="₹"
        />
        <KpiCard
          title="Completion Rate"
          value={data?.kpis.completionRate ?? 0}
          icon={CheckCircle}
          iconColor="text-green-500"
          suffix="%"
        />
      </div>

      {/* Charts Row 1: Revenue Trend + Order Type Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.timeSeries && data.timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data.timeSeries}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    itemStyle={chartTooltipItemStyle}
                    labelStyle={chartTooltipLabelStyle}
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue')
                        return [`₹${value.toLocaleString('en-IN')}`, 'Revenue']
                      if (name === 'orderCount') return [value, 'Orders']
                      return [value, name]
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground">
                No revenue data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Order Type */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.revenueByType && data.revenueByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={data.revenueByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="revenue"
                    nameKey="type"
                    label={false}
                  >
                    {data.revenueByType.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={ORDER_TYPE_COLORS[entry.type] ?? '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    itemStyle={chartTooltipItemStyle}
                    labelStyle={chartTooltipLabelStyle}
                    formatter={(value: number) => [
                      `₹${value.toLocaleString('en-IN')}`,
                      'Revenue',
                    ]}
                  />
                  <Legend
                    formatter={(value: string) =>
                      ORDER_TYPE_LABELS[value] ?? value
                    }
                    wrapperStyle={{ color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground">
                No order type data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Category Bar + Invoice Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.revenueByCategory && data.revenueByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={data.revenueByCategory}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    itemStyle={chartTooltipItemStyle}
                    labelStyle={chartTooltipLabelStyle}
                    formatter={(value: number) => [
                      `₹${value.toLocaleString('en-IN')}`,
                      'Revenue',
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground">
                No category data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.invoiceBreakdown && data.invoiceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={data.invoiceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="total"
                    nameKey="status"
                  >
                    {data.invoiceBreakdown.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={INVOICE_STATUS_COLORS[entry.status] ?? '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    itemStyle={chartTooltipItemStyle}
                    labelStyle={chartTooltipLabelStyle}
                    formatter={(value: number, name: string) => [
                      `₹${value.toLocaleString('en-IN')}`,
                      name,
                    ]}
                  />
                  <Legend
                    formatter={(value) =>
                      value.charAt(0) + value.slice(1).toLowerCase()
                    }
                    wrapperStyle={{ color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground">
                No invoice data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables: Top Items + Top Guests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Items</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topItems && data.topItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                        #
                      </th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                        Item
                      </th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                        Type
                      </th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                        Qty
                      </th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topItems.map((item) => (
                      <tr
                        key={item.rank}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-2 font-medium text-muted-foreground">
                          {item.rank}
                        </td>
                        <td className="py-3 px-2 font-medium">{item.name}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                              item.type === 'Food'
                                ? 'bg-orange-500/10 text-orange-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }`}
                          >
                            {item.type === 'Food' ? (
                              <UtensilsCrossed className="w-3 h-3" />
                            ) : (
                              <Briefcase className="w-3 h-3" />
                            )}
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">{item.quantity}</td>
                        <td className="py-3 px-2 text-right font-medium">
                          ₹{item.revenue.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                No item data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Guests */}
        <Card>
          <CardHeader>
            <CardTitle>Top Guests</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topGuests && data.topGuests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                        Guest
                      </th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">
                        Room
                      </th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                        Orders
                      </th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">
                        Total Spend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topGuests.map((guest, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-2 font-medium">{guest.name}</td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {guest.room}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {guest.orderCount}
                        </td>
                        <td className="py-3 px-2 text-right font-medium">
                          ₹{guest.totalSpend.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                No guest spending data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
