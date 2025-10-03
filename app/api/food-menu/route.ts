import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const available = searchParams.get('available')
    const isVeg = searchParams.get('isVeg')

    const foodItems = await prisma.foodMenu.findMany({
      where: {
        ...(category && { category }),
        ...(available === 'true' && { isAvailable: true }),
        ...(isVeg === 'true' && { isVeg: true }),
        ...(isVeg === 'false' && { isVeg: false }),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(foodItems)
  } catch (error) {
    console.error('Error fetching food menu:', error)
    return NextResponse.json(
      { error: 'Failed to fetch food menu' },
      { status: 500 }
    )
  }
}
