import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      pendingCount,
      acceptedCount,
      inProgressCount,
      completedCount,
      cancelledCount,
      todayOrders,
      totalRevenue,
      todayRevenue,
      activeGuests,
      totalGuests,
      totalRooms,
      occupiedRooms,
      recentOrders,
      popularItems,
    ] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'ACCEPTED' } }),
      prisma.order.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { status: 'PAID', paidAt: { gte: today } },
        _sum: { total: true },
      }),
      prisma.guest.count({ where: { isActive: true } }),
      prisma.guest.count(),
      prisma.room.count(),
      prisma.room.count({ where: { status: 'OCCUPIED' } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          guest: { include: { room: true } },
          orderItems: { include: { service: true, foodMenu: true } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ['foodMenuId', 'serviceId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ])

    // Resolve popular item names
    const popularItemsWithNames = await Promise.all(
      popularItems.map(async (item) => {
        if (item.foodMenuId) {
          const food = await prisma.foodMenu.findUnique({
            where: { id: item.foodMenuId },
            select: { name: true },
          })
          return {
            name: food?.name ?? 'Unknown',
            type: 'Food' as const,
            count: item._sum.quantity ?? 0,
          }
        }
        if (item.serviceId) {
          const service = await prisma.service.findUnique({
            where: { id: item.serviceId },
            select: { name: true },
          })
          return {
            name: service?.name ?? 'Unknown',
            type: 'Service' as const,
            count: item._sum.quantity ?? 0,
          }
        }
        return null
      })
    )

    const totalOrderCount = pendingCount + acceptedCount + inProgressCount + completedCount + cancelledCount
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    return NextResponse.json({
      orders: {
        total: totalOrderCount,
        today: todayOrders,
        pending: pendingCount,
        accepted: acceptedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
      revenue: {
        total: totalRevenue._sum.total ?? 0,
        today: todayRevenue._sum.total ?? 0,
      },
      guests: {
        active: activeGuests,
        total: totalGuests,
      },
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        occupancyRate,
      },
      recentOrders,
      popularItems: popularItemsWithNames.filter(Boolean),
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
