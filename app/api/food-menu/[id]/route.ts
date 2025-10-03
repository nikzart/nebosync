import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const foodItem = await prisma.foodMenu.findUnique({
      where: { id: params.id },
    })

    if (!foodItem) {
      return NextResponse.json(
        { error: 'Food item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(foodItem)
  } catch (error) {
    console.error('Error fetching food item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch food item' },
      { status: 500 }
    )
  }
}
