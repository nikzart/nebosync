import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileHeader } from '@/components/guest/profile-header'
import { ProfileInfo } from '@/components/guest/profile-info'
import { StayInfo } from '@/components/guest/stay-info'
import { ActivityStats } from '@/components/guest/activity-stats'
import { ProfileActions } from '@/components/guest/profile-actions'

export default async function GuestProfilePage() {
  const session = await auth()

  if (!session || session.user.role !== 'GUEST') {
    redirect('/login')
  }

  // Fetch guest data with all related information
  const guest = await prisma.guest.findUnique({
    where: { id: session.user.id },
    include: {
      room: true,
      _count: {
        select: {
          orders: true,
          messages: true,
          invoices: true,
        },
      },
    },
  })

  if (!guest) {
    redirect('/login')
  }

  // Fetch order statistics
  const totalSpent = await prisma.order.aggregate({
    where: {
      guestId: guest.id,
      status: 'COMPLETED'
    },
    _sum: { totalAmount: true },
  })

  const activeOrders = await prisma.order.count({
    where: {
      guestId: guest.id,
      status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
    },
  })

  // Calculate days in stay
  const now = new Date()
  const checkInDate = new Date(guest.checkInDate)
  const checkOutDate = guest.checkOutDate ? new Date(guest.checkOutDate) : null

  const daysStayed = Math.floor((now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = checkOutDate
    ? Math.max(0, Math.floor((checkOutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-24">
      {/* Header with Avatar and Name */}
      <ProfileHeader
        name={guest.name}
        email={guest.email}
        phone={guest.phone}
      />

      <div className="px-6 space-y-4">
        {/* Personal Information */}
        <ProfileInfo
          name={guest.name}
          email={guest.email}
          phone={guest.phone}
          roomNumber={guest.room?.roomNumber}
          roomType={guest.room?.roomType}
          floor={guest.room?.floor}
        />

        {/* Stay Information */}
        <StayInfo
          checkInDate={guest.checkInDate}
          checkOutDate={guest.checkOutDate}
          daysStayed={daysStayed}
          daysRemaining={daysRemaining}
        />

        {/* Activity Statistics */}
        <ActivityStats
          totalOrders={guest._count.orders}
          activeOrders={activeOrders}
          totalSpent={totalSpent._sum.totalAmount || 0}
          totalMessages={guest._count.messages}
          totalInvoices={guest._count.invoices}
        />

        {/* Quick Actions */}
        <ProfileActions />
      </div>
    </div>
  )
}
