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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if item exists
    const existingItem = await prisma.foodMenu.findUnique({
      where: { id: params.id },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Food item not found' },
        { status: 404 }
      )
    }

    // Update the item
    const updatedItem = await prisma.foodMenu.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating food item:', error)
    return NextResponse.json(
      { error: 'Failed to update food item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if item exists
    const existingItem = await prisma.foodMenu.findUnique({
      where: { id: params.id },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Food item not found' },
        { status: 404 }
      )
    }

    // Delete the item
    await prisma.foodMenu.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Food item deleted successfully' })
  } catch (error) {
    console.error('Error deleting food item:', error)
    return NextResponse.json(
      { error: 'Failed to delete food item' },
      { status: 500 }
    )
  }
}
