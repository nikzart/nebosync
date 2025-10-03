import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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
    const { ssid, password, description, isActive } = body

    // Check if credential exists
    const existingCredential = await prisma.wiFiCredential.findUnique({
      where: { id: params.id },
    })

    if (!existingCredential) {
      return NextResponse.json(
        { error: 'WiFi credential not found' },
        { status: 404 }
      )
    }

    // Update credential
    const credential = await prisma.wiFiCredential.update({
      where: { id: params.id },
      data: {
        ...(ssid && { ssid }),
        ...(password && { password }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(credential)
  } catch (error) {
    console.error('Error updating WiFi credential:', error)
    return NextResponse.json(
      { error: 'Failed to update WiFi credential' },
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

    // Soft delete by setting isActive to false
    await prisma.wiFiCredential.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'WiFi credential deleted successfully' })
  } catch (error) {
    console.error('Error deleting WiFi credential:', error)
    return NextResponse.json(
      { error: 'Failed to delete WiFi credential' },
      { status: 500 }
    )
  }
}
