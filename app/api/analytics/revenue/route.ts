import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const groupBy = searchParams.get('groupBy') ?? 'month'

    // Build date range
    const now = new Date()
    const fromDate = dateFrom ? new Date(dateFrom) : null
    const toDate = dateTo ? new Date(dateTo + 'T23:59:59.999Z') : null

    // Date filter for invoices (paid)
    const paidInvoiceWhere = {
      status: 'PAID' as const,
      ...(fromDate || toDate
        ? {
            paidAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    }

    // Date filter for orders
    const orderDateWhere = {
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    }

    // Compute previous period for comparison
    let prevPaidInvoiceWhere = null
    if (fromDate && toDate) {
      const rangeMs = toDate.getTime() - fromDate.getTime()
      const prevFrom = new Date(fromDate.getTime() - rangeMs)
      const prevTo = new Date(fromDate.getTime() - 1)
      prevPaidInvoiceWhere = {
        status: 'PAID' as const,
        paidAt: { gte: prevFrom, lte: prevTo },
      }
    }

    const [
      // Summary KPIs
      totalPaidRevenue,
      totalOrders,
      completedOrders,
      taxCollected,
      pendingAmount,

      // Revenue by order type
      allPaidInvoicesWithOrders,

      // Invoice status breakdown
      invoiceStatusCounts,

      // Top items
      topItemsRaw,

      // Top guests
      topGuests,

      // Occupancy
      totalRooms,
      occupiedRooms,

      // Previous period (for comparison)
      prevRevenue,

      // All paid invoices in range (for time-series)
      paidInvoicesForTimeSeries,
    ] = await Promise.all([
      // Total paid revenue
      prisma.invoice.aggregate({
        where: paidInvoiceWhere,
        _sum: { total: true, tax: true, subtotal: true },
      }),

      // Total orders in range
      prisma.order.count({ where: orderDateWhere }),

      // Completed orders in range
      prisma.order.count({
        where: { ...orderDateWhere, status: 'COMPLETED' },
      }),

      // Tax collected
      prisma.invoice.aggregate({
        where: paidInvoiceWhere,
        _sum: { tax: true },
      }),

      // Pending invoice amount
      prisma.invoice.aggregate({
        where: {
          status: 'PENDING',
          ...(fromDate || toDate
            ? {
                createdAt: {
                  ...(fromDate ? { gte: fromDate } : {}),
                  ...(toDate ? { lte: toDate } : {}),
                },
              }
            : {}),
        },
        _sum: { total: true },
      }),

      // Paid invoices with order details for type breakdown
      prisma.invoice.findMany({
        where: paidInvoiceWhere,
        include: {
          invoiceItems: {
            include: {
              order: {
                select: { orderType: true },
              },
            },
          },
        },
      }),

      // Invoice status counts
      prisma.invoice.groupBy({
        by: ['status'],
        _count: true,
        _sum: { total: true },
        ...(fromDate || toDate
          ? {
              where: {
                createdAt: {
                  ...(fromDate ? { gte: fromDate } : {}),
                  ...(toDate ? { lte: toDate } : {}),
                },
              },
            }
          : {}),
      }),

      // Top items by revenue
      prisma.orderItem.groupBy({
        by: ['foodMenuId', 'serviceId'],
        _sum: { subtotal: true, quantity: true },
        orderBy: { _sum: { subtotal: 'desc' } },
        take: 10,
        ...(fromDate || toDate
          ? {
              where: {
                order: {
                  status: 'COMPLETED',
                  ...orderDateWhere,
                },
              },
            }
          : { where: { order: { status: 'COMPLETED' } } }),
      }),

      // Top guests by spend
      prisma.invoice.groupBy({
        by: ['guestId'],
        where: paidInvoiceWhere,
        _sum: { total: true },
        _count: true,
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),

      // Room counts
      prisma.room.count(),
      prisma.room.count({ where: { status: 'OCCUPIED' } }),

      // Previous period revenue
      prevPaidInvoiceWhere
        ? prisma.invoice.aggregate({
            where: prevPaidInvoiceWhere,
            _sum: { total: true },
            _count: true,
          })
        : Promise.resolve(null),

      // All paid invoices for time-series
      prisma.invoice.findMany({
        where: paidInvoiceWhere,
        select: {
          total: true,
          tax: true,
          paidAt: true,
        },
        orderBy: { paidAt: 'asc' },
      }),
    ])

    // --- Build KPIs ---
    const revenue = totalPaidRevenue._sum.total ?? 0
    const orderCount = totalOrders
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0
    const tax = taxCollected._sum.tax ?? 0
    const pending = pendingAmount._sum.total ?? 0
    const completionRate =
      orderCount > 0 ? Math.round((completedOrders / orderCount) * 100) : 0

    // Comparison
    let comparison = null
    if (prevRevenue) {
      const prevRev = prevRevenue._sum.total ?? 0
      const prevCount = prevRevenue._count ?? 0
      comparison = {
        revenueDelta:
          prevRev > 0 ? Math.round(((revenue - prevRev) / prevRev) * 100) : null,
        ordersDelta:
          prevCount > 0
            ? Math.round(((orderCount - prevCount) / prevCount) * 100)
            : null,
      }
    }

    // --- Time-series ---
    const timeSeries = buildTimeSeries(paidInvoicesForTimeSeries, groupBy)

    // --- Revenue by order type ---
    const typeMap: Record<string, { revenue: number; count: number }> = {}
    for (const inv of allPaidInvoicesWithOrders) {
      for (const item of inv.invoiceItems) {
        const type = item.order?.orderType ?? 'UNKNOWN'
        if (!typeMap[type]) typeMap[type] = { revenue: 0, count: 0 }
        typeMap[type].revenue += item.total
        typeMap[type].count += 1
      }
    }
    const totalTypeRevenue = Object.values(typeMap).reduce(
      (s, v) => s + v.revenue,
      0
    )
    const revenueByType = Object.entries(typeMap).map(([type, data]) => ({
      type,
      revenue: Math.round(data.revenue * 100) / 100,
      count: data.count,
      percentage:
        totalTypeRevenue > 0
          ? Math.round((data.revenue / totalTypeRevenue) * 100)
          : 0,
    }))

    // --- Revenue by category ---
    const categoryItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: 'COMPLETED',
          ...orderDateWhere,
        },
      },
      include: {
        foodMenu: { select: { category: true } },
        service: { select: { category: true } },
      },
    })
    const catMap: Record<string, { revenue: number; count: number }> = {}
    for (const item of categoryItems) {
      const cat =
        item.foodMenu?.category ?? item.service?.category ?? 'Uncategorized'
      if (!catMap[cat]) catMap[cat] = { revenue: 0, count: 0 }
      catMap[cat].revenue += item.subtotal
      catMap[cat].count += item.quantity
    }
    const revenueByCategory = Object.entries(catMap)
      .map(([category, data]) => ({
        category,
        revenue: Math.round(data.revenue * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // --- Invoice status breakdown ---
    const invoiceBreakdown = invoiceStatusCounts.map((s) => ({
      status: s.status,
      count: s._count,
      total: Math.round((s._sum.total ?? 0) * 100) / 100,
    }))

    // --- Top items with names ---
    const topItems = await Promise.all(
      topItemsRaw.map(async (item, i) => {
        let name = 'Unknown'
        let type: 'Food' | 'Service' = 'Food'
        if (item.foodMenuId) {
          const food = await prisma.foodMenu.findUnique({
            where: { id: item.foodMenuId },
            select: { name: true },
          })
          name = food?.name ?? 'Unknown'
          type = 'Food'
        } else if (item.serviceId) {
          const service = await prisma.service.findUnique({
            where: { id: item.serviceId },
            select: { name: true },
          })
          name = service?.name ?? 'Unknown'
          type = 'Service'
        }
        return {
          rank: i + 1,
          name,
          type,
          quantity: item._sum.quantity ?? 0,
          revenue: Math.round((item._sum.subtotal ?? 0) * 100) / 100,
        }
      })
    )

    // --- Top guests with details ---
    const guestIds = topGuests.map((g) => g.guestId)
    const guestDetails = await prisma.guest.findMany({
      where: { id: { in: guestIds } },
      include: { room: { select: { roomNumber: true } } },
    })
    const guestMap = new Map(guestDetails.map((g) => [g.id, g]))
    const topGuestsList = topGuests.map((g) => {
      const guest = guestMap.get(g.guestId)
      return {
        name: guest?.name ?? 'Unknown',
        room: guest?.room?.roomNumber ?? 'N/A',
        orderCount: g._count,
        totalSpend: Math.round((g._sum.total ?? 0) * 100) / 100,
      }
    })

    // --- Occupancy ---
    const occupancy = {
      totalRooms,
      occupiedRooms,
      rate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
    }

    return NextResponse.json({
      kpis: {
        revenue: Math.round(revenue * 100) / 100,
        orders: orderCount,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        taxCollected: Math.round(tax * 100) / 100,
        pendingAmount: Math.round(pending * 100) / 100,
        completionRate,
      },
      comparison,
      timeSeries,
      revenueByType,
      revenueByCategory,
      invoiceBreakdown,
      topItems,
      topGuests: topGuestsList,
      occupancy,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

function buildTimeSeries(
  invoices: Array<{ total: number; tax: number; paidAt: Date | null }>,
  groupBy: string
) {
  const buckets: Record<
    string,
    { revenue: number; orderCount: number; taxCollected: number }
  > = {}

  for (const inv of invoices) {
    if (!inv.paidAt) continue
    const date = new Date(inv.paidAt)
    let key: string

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0]
    } else if (groupBy === 'week') {
      // ISO week start (Monday)
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      d.setDate(diff)
      key = d.toISOString().split('T')[0]
    } else {
      // month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    if (!buckets[key]) {
      buckets[key] = { revenue: 0, orderCount: 0, taxCollected: 0 }
    }
    buckets[key].revenue += inv.total
    buckets[key].orderCount += 1
    buckets[key].taxCollected += inv.tax
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period,
      revenue: Math.round(data.revenue * 100) / 100,
      orderCount: data.orderCount,
      taxCollected: Math.round(data.taxCollected * 100) / 100,
    }))
}
