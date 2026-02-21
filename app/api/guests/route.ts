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
    const active = searchParams.get('active')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (active === 'true') {
      where.isActive = true
    } else if (active === 'false') {
      where.isActive = false
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { room: { roomNumber: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const guests = await prisma.guest.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: true,
            floor: true,
            block: true,
          },
        },
        _count: {
          select: {
            orders: true,
            messages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(guests)
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guests' },
      { status: 500 }
    )
  }
}
