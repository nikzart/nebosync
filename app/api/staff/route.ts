import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await prisma.staff.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, isActive } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email },
    })

    if (existingStaff) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create staff
    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    )
  }
}
