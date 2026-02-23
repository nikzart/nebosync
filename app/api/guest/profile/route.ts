import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const guest = await prisma.guest.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        room: {
          select: { roomNumber: true },
        },
      },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    return NextResponse.json(guest)
  } catch (error) {
    console.error('Error fetching guest profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
