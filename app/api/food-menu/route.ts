import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

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

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, category, imageUrl, isAvailable, isVeg } = body

    // Validate required fields
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, category' },
        { status: 400 }
      )
    }

    // Create the item
    const newItem = await prisma.foodMenu.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
        isAvailable: isAvailable ?? true,
        isVeg: isVeg ?? true,
      },
    })

    logActivity({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'food_menu',
      entityId: newItem.id,
      description: `Added food item: ${name} at ₹${parseFloat(price).toLocaleString('en-IN')}`,
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating food item:', error)
    return NextResponse.json(
      { error: 'Failed to create food item' },
      { status: 500 }
    )
  }
}
