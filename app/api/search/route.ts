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
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ guests: [], orders: [], items: [] })
    }

    const searchTerm = query.toLowerCase()

    // Search guests
    const guests = await prisma.guest.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm } },
          { room: { is: { roomNumber: { contains: searchTerm } } } },
        ],
      },
      include: {
        room: true,
      },
      take: 5,
    })

    // Search orders
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { id: { contains: searchTerm } },
          { guest: { name: { contains: searchTerm, mode: 'insensitive' } } },
        ],
      },
      include: {
        guest: {
          include: {
            room: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    })

    // Search food menu and services
    const [foodItems, services] = await Promise.all([
      prisma.foodMenu.findMany({
        where: {
          name: { contains: searchTerm, mode: 'insensitive' },
        },
        take: 3,
      }),
      prisma.service.findMany({
        where: {
          name: { contains: searchTerm, mode: 'insensitive' },
        },
        take: 3,
      }),
    ])

    const items = [...foodItems.map((f) => ({ ...f, type: 'food' })), ...services.map((s) => ({ ...s, type: 'service' }))]

    return NextResponse.json({ guests, orders, items })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
