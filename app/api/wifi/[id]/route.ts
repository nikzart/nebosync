import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { ssid, password, description, isActive } = body

    // Check if credential exists
    const existingCredential = await prisma.wiFiCredential.findUnique({
      where: { id },
    })

    if (!existingCredential) {
      return NextResponse.json(
        { error: 'WiFi credential not found' },
        { status: 404 }
      )
    }

    // Update credential
    const credential = await prisma.wiFiCredential.update({
      where: { id },
      data: {
        ...(ssid && { ssid }),
        ...(password && { password }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    logActivity({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'wifi',
      entityId: id,
      description: `Updated WiFi network: ${credential.ssid}`,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role === 'GUEST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Fetch before soft-deleting so we have the name for the log
    const existing = await prisma.wiFiCredential.findUnique({ where: { id } })

    // Soft delete by setting isActive to false
    await prisma.wiFiCredential.update({
      where: { id },
      data: { isActive: false },
    })

    logActivity({
      userId: session.user.id,
      action: 'DELETE',
      entity: 'wifi',
      entityId: id,
      description: `Deleted WiFi network: ${existing?.ssid ?? id}`,
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
