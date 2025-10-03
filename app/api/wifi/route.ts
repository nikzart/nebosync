import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const credentials = await prisma.wiFiCredential.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(credentials)
  } catch (error) {
    console.error('Error fetching WiFi credentials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch WiFi credentials' },
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
    const { ssid, password, description } = body

    if (!ssid || !password) {
      return NextResponse.json(
        { error: 'SSID and password are required' },
        { status: 400 }
      )
    }

    const credential = await prisma.wiFiCredential.create({
      data: {
        ssid,
        password,
        description,
        isActive: true,
      },
    })

    return NextResponse.json(credential, { status: 201 })
  } catch (error) {
    console.error('Error creating WiFi credential:', error)
    return NextResponse.json(
      { error: 'Failed to create WiFi credential' },
      { status: 500 }
    )
  }
}
